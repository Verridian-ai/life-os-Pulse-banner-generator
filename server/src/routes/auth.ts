import { Hono } from 'hono';
import { generateId } from 'lucia';
import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { lucia } from '../lib/auth';
import { db } from '../db';
import { users, emailVerificationTokens, passwordResetTokens, profiles, userPreferences } from '../db/schema';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';
import { randomBytes, createHash } from 'crypto';
import { authRateLimit } from '../lib/rateLimit';

// Helper for password strength
const validatePasswordStrength = (password: string): string | null => {
    if (password.length < 8) return 'Password must be at least 8 characters long';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
    if (!/[^A-Za-z0-9]/.test(password)) return 'Password must contain at least one special character';
    return null;
};

export const authRouter = new Hono();

// SIGNUP
// SECURITY: Rate limited to 3 requests per minute to prevent account spam
authRouter.post('/signup', authRateLimit.signup, async (c) => {
    const { email, password } = await c.req.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return c.json({ error: 'Invalid input' }, 400);
    }

    const weakPassword = validatePasswordStrength(password);
    if (weakPassword) {
        return c.json({ error: weakPassword }, 400);
    }

    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
        return c.json({ error: 'User already exists' }, 409);
    }

    const passwordHash = await hash(password, {
        // recommended minimum parameters
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });
    const userId = generateId(15);

    try {
        await db.insert(users).values({
            id: userId,
            email: email,
            hashedPassword: passwordHash
        });

        // Generate Verification Token (6 digit code for simplicity, or UUID link)
        // Using UUID for link-based verification as per guide
        const verificationCode = generateId(40); // Long random string
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

        await db.insert(emailVerificationTokens).values({
            userId,
            email,
            code: verificationCode,
            expiresAt
        });

        // Initialize Profile
        await db.insert(profiles).values({
            id: userId,
            email: email,
            username: email.split('@')[0] + '_' + randomBytes(3).toString('hex'), // Generate unique default username
            fullName: 'New User'
        });

        // Initialize Preferences (Critical for Storage Tracking)
        await db.insert(userPreferences).values({
            userId,
            language: 'en',
            theme: 'dark'
        });

        // Send Email (Non-blocking usually, but good to await for error checking in basic setup)
        await sendVerificationEmail(email, verificationCode);

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
        return c.json({ success: true, userId, message: 'Verification email sent' });

    } catch (e) {
        console.error("Signup error:", e);
        return c.json({ error: 'Unknown error occurred' }, 500);
    }
});

// LOGIN
// SECURITY: Rate limited to 5 requests per minute to prevent brute force attacks
authRouter.post('/login', authRateLimit.login, async (c) => {
    const { email, password } = await c.req.json();

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return c.json({ error: 'Invalid input' }, 400);
    }

    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = existingUsers[0];

    if (!user || !user.hashedPassword) {
        // NOTE: Return generic error to avoid user enumeration
        return c.json({ error: 'Incorrect email or password' }, 400);
    }

    // CHECK ACCOUNT LOCKOUT
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
        const remainingTime = Math.ceil((new Date(user.lockedUntil).getTime() - new Date().getTime()) / 60000);
        return c.json({ error: `Account locked. Please try again in ${remainingTime} minutes.` }, 429);
    }

    const validPassword = await verify(user.hashedPassword, password, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    if (!validPassword) {
        // Increment failed attempts
        const currentAttempts = (user.failedLoginAttempts || 0) + 1;
        const updateData: Partial<typeof user> = { failedLoginAttempts: currentAttempts };

        // Lock if max attempts reached (5 attempts)
        if (currentAttempts >= 5) {
            const lockDuration = 15 * 60 * 1000; // 15 minutes
            updateData.lockedUntil = new Date(Date.now() + lockDuration);
            // Optional: Reset attempts after locking so they start fresh after lock expires? 
            // Or keep them high? Resetting to 0 makes sense if we want to allow another 5 attempts after lock expires.
            // But usually you keep them or reset them. Let's reset attempts to 0 when locking, 
            // effectively starting a new cycle after the lock expires, or just keep them and check expiry.
            // Simpler approach: Just set lockedUntil. Next login attempt after expiry will see lockedUntil < now.
            // But if we don't reset attempts, one bad password after lock expiry will lock it again immediately 
            // if we don't reset attempts on successful login (which we do).
            // However, if we don't reset attempts here, the next failed login after expiry will make attempts = 6, 
            // triggering another lock. This is actually good "soft lock" behavior (1 fail = lock again).
            // But standard is usually 5 fresh attempts.
            // Let's reset attempts to 0 when the lock expires? No, that requires a background job.
            // Let's just set the lock.
        }

        await db.update(users).set(updateData).where(eq(users.id, user.id));

        return c.json({ error: 'Incorrect email or password' }, 400);
    }

    // RESET LOCKOUT ON SUCCESS
    if ((user.failedLoginAttempts || 0) > 0 || user.lockedUntil) {
        await db.update(users).set({
            failedLoginAttempts: 0,
            lockedUntil: null
        }).where(eq(users.id, user.id));
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
    return c.json({ success: true, user: { id: user.id, email: user.email } });
});

// LOGOUT
authRouter.post('/logout', async (c) => {
    const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '');
    if (!sessionId) {
        return c.json({ error: 'Not authenticated' }, 401);
    }

    await lucia.invalidateSession(sessionId);
    const sessionCookie = lucia.createBlankSessionCookie();
    c.header('Set-Cookie', sessionCookie.serialize(), { append: true });

    return c.json({ success: true });
});

// CHECK USERNAME AVAILABILITY
authRouter.get('/check-username', async (c) => {
    const username = c.req.query('username');
    if (!username) return c.json({ error: 'Missing username' }, 400);

    // We check against profiles table where usernames are stored
    const { profiles } = await import('../db/schema');
    const existing = await db.select().from(profiles).where(eq(profiles.username, username)).limit(1);

    return c.json({ available: existing.length === 0 });
});

// GET CURRENT USER (Session Validation)
authRouter.get('/me', async (c) => {
    const sessionId = lucia.readSessionCookie(c.req.header('Cookie') ?? '');
    if (!sessionId) {
        return c.json({ user: null }, 401);
    }

    const { session, user } = await lucia.validateSession(sessionId);

    if (!session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
        return c.json({ user: null }, 401);
    }

    if (session && session.fresh) {
        const sessionCookie = lucia.createSessionCookie(session.id);
        c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
    }

    return c.json({ user });
});

// EMAIL VERIFICATION
authRouter.get('/verify-email', async (c) => {
    const code = c.req.query('code');
    if (!code) return c.json({ error: 'Missing code' }, 400);

    // Find token
    // In strict mode we might filter by expiresAt > now()
    const tokens = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.code, code)).limit(1);

    if (tokens.length === 0 || tokens[0].expiresAt < new Date()) {
        return c.json({ error: 'Invalid or expired token' }, 400);
    }

    const token = tokens[0];

    // Ideally, we'd update a 'email_verified' column on users table. 
    // Since our schema doesn't have it yet, we just consume the token to "prove" it worked for this MVP.
    // TODO: Add email_verified boolean to users schema if strictly required.

    await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.id, token.id));

    // Redirect to frontend success page
    return c.redirect('/?verified=true');
});

// FORGOT PASSWORD
// SECURITY: Rate limited to 3 requests per minute to prevent email bombing
authRouter.post('/forgot-password', authRateLimit.forgotPassword, async (c) => {
    const { email } = await c.req.json();
    if (!email || typeof email !== 'string') return c.json({ error: 'Invalid email' }, 400);

    const existingUsers = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = existingUsers[0];

    if (!user) {
        // Return success even if user not found to prevent enumeration
        return c.json({ success: true, message: 'If account exists, email sent' });
    }

    // Generate Reset Token
    const token = generateId(40);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Hash token before storage
    const tokenHash = createHash('sha256').update(token).digest('hex');

    await db.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: tokenHash, // Stored securely
        expiresAt
    });

    // Send PLAIN token in email
    await sendPasswordResetEmail(email, token);

    return c.json({ success: true, message: 'Reset email sent' });
});

// RESET PASSWORD
// SECURITY: Rate limited to 5 requests per minute to prevent brute force token guessing
authRouter.post('/reset-password', authRateLimit.resetPassword, async (c) => {
    const { token, newPassword } = await c.req.json();

    if (!token || !newPassword) return c.json({ error: 'Missing fields' }, 400);

    const weakPassword = validatePasswordStrength(newPassword);
    if (weakPassword) {
        return c.json({ error: weakPassword }, 400);
    }

    // Hash incoming token to match stored hash
    const tokenHash = createHash('sha256').update(token).digest('hex');

    const tokens = await db.select().from(passwordResetTokens).where(eq(passwordResetTokens.tokenHash, tokenHash)).limit(1);

    if (tokens.length === 0 || tokens[0].expiresAt < new Date()) {
        return c.json({ error: 'Invalid or expired token' }, 400);
    }

    const resetToken = tokens[0];

    // Update User Password
    const passwordHash = await hash(newPassword, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    await db.update(users).set({ hashedPassword: passwordHash }).where(eq(users.id, resetToken.userId));

    // Invalidate all sessions for security? Optional.
    await lucia.invalidateUserSessions(resetToken.userId);

    // Delete used token
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));

    return c.json({ success: true, message: 'Password reset successfully' });
});


