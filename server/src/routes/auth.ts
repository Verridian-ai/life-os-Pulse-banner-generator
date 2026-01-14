import { Hono } from 'hono';
import { generateId } from 'lucia';
import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { lucia } from '../lib/auth';
import { db } from '../db';
import {
  users,
  emailVerificationTokens,
  passwordResetTokens,
  profiles,
  userPreferences,
} from '../db/schema';
import { sendVerificationEmail, sendPasswordResetEmail } from '../lib/email';
import { randomBytes, createHash } from 'crypto';
import { authRateLimit } from '../lib/rateLimit';
import {
  WORKOS_ENABLED,
  getOAuthAuthorizationUrl,
  getSsoAuthorizationUrlByOrg,
  sendMagicLink,
  createOAuthState,
  parseOAuthState,
  workosConfig,
  type OAuthProvider,
} from '../lib/workos';
import { handleOAuthCallback, handleSsoCallback, handleMagicLinkAuth } from '../lib/authBridge';

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
    parallelism: 1,
  });
  const userId = generateId(15);

  try {
    await db.insert(users).values({
      id: userId,
      email: email,
      hashedPassword: passwordHash,
    });

    // Generate Verification Token (6 digit code for simplicity, or UUID link)
    // Using UUID for link-based verification as per guide
    const verificationCode = generateId(40); // Long random string
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

    await db.insert(emailVerificationTokens).values({
      userId,
      email,
      code: verificationCode,
      expiresAt,
    });

    // Initialize Profile
    await db.insert(profiles).values({
      id: userId,
      email: email,
      username: email.split('@')[0] + '_' + randomBytes(3).toString('hex'), // Generate unique default username
      fullName: 'New User',
    });

    // Initialize Preferences (Critical for Storage Tracking)
    await db.insert(userPreferences).values({
      userId,
      language: 'en',
      theme: 'dark',
    });

    // Send Email (Non-blocking usually, but good to await for error checking in basic setup)
    await sendVerificationEmail(email, verificationCode);

    const session = await lucia.createSession(userId, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
    return c.json({ success: true, userId, message: 'Verification email sent' });
  } catch (e) {
    console.error('Signup error:', e);
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
    const remainingTime = Math.ceil(
      (new Date(user.lockedUntil).getTime() - new Date().getTime()) / 60000,
    );
    return c.json({ error: `Account locked. Please try again in ${remainingTime} minutes.` }, 429);
  }

  const validPassword = await verify(user.hashedPassword, password, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
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
    await db
      .update(users)
      .set({
        failedLoginAttempts: 0,
        lockedUntil: null,
      })
      .where(eq(users.id, user.id));
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
  const cookieHeader = c.req.header('Cookie') ?? '';
  const sessionId = lucia.readSessionCookie(cookieHeader);

  console.log('[Auth /me] Cookie header present:', !!cookieHeader);
  console.log('[Auth /me] Cookie header length:', cookieHeader.length);
  console.log('[Auth /me] Session ID found:', !!sessionId);

  if (!sessionId) {
    console.log('[Auth /me] No session ID in cookie, returning null user');
    return c.json({ user: null }, 401);
  }

  const { session, user } = await lucia.validateSession(sessionId);

  console.log('[Auth /me] Session valid:', !!session);
  console.log('[Auth /me] User found:', !!user);

  if (!session) {
    console.log('[Auth /me] Session invalid, clearing cookie');
    const sessionCookie = lucia.createBlankSessionCookie();
    c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
    return c.json({ user: null }, 401);
  }

  if (session && session.fresh) {
    const sessionCookie = lucia.createSessionCookie(session.id);
    c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
  }

  console.log('[Auth /me] Returning user:', user?.id);
  return c.json({ user });
});

// EMAIL VERIFICATION
authRouter.get('/verify-email', async (c) => {
  const code = c.req.query('code');
  if (!code) return c.json({ error: 'Missing code' }, 400);

  // Find token
  // In strict mode we might filter by expiresAt > now()
  const tokens = await db
    .select()
    .from(emailVerificationTokens)
    .where(eq(emailVerificationTokens.code, code))
    .limit(1);

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
    expiresAt,
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

  const tokens = await db
    .select()
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (tokens.length === 0 || tokens[0].expiresAt < new Date()) {
    return c.json({ error: 'Invalid or expired token' }, 400);
  }

  const resetToken = tokens[0];

  // Update User Password
  const passwordHash = await hash(newPassword, {
    memoryCost: 19456,
    timeCost: 2,
    outputLen: 32,
    parallelism: 1,
  });

  await db
    .update(users)
    .set({ hashedPassword: passwordHash })
    .where(eq(users.id, resetToken.userId));

  // Invalidate all sessions for security? Optional.
  await lucia.invalidateUserSessions(resetToken.userId);

  // Delete used token
  await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, resetToken.id));

  return c.json({ success: true, message: 'Password reset successfully' });
});

// ============================================================================
// WORKOS OAUTH ENDPOINTS
// ============================================================================

// Check if WorkOS is available
authRouter.get('/workos/status', async (c) => {
  return c.json({
    enabled: WORKOS_ENABLED,
    providers: WORKOS_ENABLED ? ['google', 'github', 'microsoft'] : [],
    ssoEnabled: WORKOS_ENABLED,
    magicLinkEnabled: WORKOS_ENABLED,
  });
});

// Start OAuth flow
// Start OAuth flow (WorkOS AuthKit Hosted UI)
authRouter.get('/workos/authorize', async (c) => {
  if (!WORKOS_ENABLED) {
    return c.json({ error: 'WorkOS is not configured' }, 503);
  }

  const provider = c.req.query('provider');
  const returnTo = c.req.query('returnTo') || '/dashboard';

  // If a specific provider is requested, use the legacy direct flow
  if (provider && ['google', 'github', 'microsoft'].includes(provider)) {
    const providerMap: Record<string, OAuthProvider> = {
      google: 'GoogleOAuth',
      github: 'GitHubOAuth',
      microsoft: 'MicrosoftOAuth',
    };

    const workosProvider = providerMap[provider];
    const state = createOAuthState(workosProvider, returnTo);

    try {
      const authUrl = getOAuthAuthorizationUrl(workosProvider, state);
      return c.redirect(authUrl);
    } catch (error) {
      console.error('[Auth] Failed to generate OAuth URL:', error);
      return c.json({ error: 'Failed to start OAuth flow' }, 500);
    }
  }

  // Default: Use AuthKit Hosted UI
  // We construct the AuthKit URL which handles provider selection
  try {
    // Verify WorkOS configuration before attempting to generate URL
    if (!process.env.WORKOS_CLIENT_ID) {
      console.error('[Auth] WORKOS_CLIENT_ID is not set');
      return c.json({ error: 'WorkOS Client ID not configured' }, 503);
    }
    if (!process.env.WORKOS_API_KEY && !process.env.VITE_WORK_OS_API_KEY) {
      console.error('[Auth] WORKOS_API_KEY is not set');
      return c.json({ error: 'WorkOS API Key not configured' }, 503);
    }

    const { getAuthKitAuthorizationUrl } = await import('../lib/authkit');
    const screen = (c.req.query('screen') || c.req.query('screen_hint')) as
      | 'sign-in'
      | 'sign-up'
      | undefined;
    // Basic validation for allowed screens
    const validScreen = screen && ['sign-in', 'sign-up'].includes(screen) ? screen : undefined;

    console.log('[Auth] Generating AuthKit URL with:', {
      returnTo,
      screen: validScreen,
      clientId: process.env.WORKOS_CLIENT_ID ? '***set***' : 'MISSING',
      // Revert to 127.0.0.1 to match WorkOS Dashboard whitelist
      // NOTE: User must access frontend via http://127.0.0.1:5173 for cookies to work!
      redirectUri: process.env.WORKOS_REDIRECT_URI || 'http://127.0.0.1:8888/api/auth/callback',
    });

    const authUrl = getAuthKitAuthorizationUrl(returnTo, undefined, validScreen);
    console.log('[Auth] Generated AuthKit URL:', authUrl);
    return c.redirect(authUrl);
  } catch (error) {
    console.error('[Auth] Failed to generate AuthKit URL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return c.json({ error: 'Failed to start AuthKit flow', details: errorMessage }, 500);
  }
});

// OAuth callback
authRouter.get('/workos/callback', async (c) => {
  if (!WORKOS_ENABLED) {
    return c.json({ error: 'WorkOS is not configured' }, 503);
  }

  // Determine Frontend Origin for absolute redirects
  const isProd = process.env.NODE_ENV === 'production';
  const clientUrl =
    process.env.CLIENT_URL ||
    (isProd ? 'https://life-os-banner.verridian.ai' : 'http://127.0.0.1:5173');

  const code = c.req.query('code');
  const stateParam = c.req.query('state');
  const error = c.req.query('error');
  const errorDescription = c.req.query('error_description');

  // Handle OAuth errors
  if (error) {
    console.error('[Auth] OAuth error:', error, errorDescription);
    return c.redirect(`${clientUrl}/?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code || !stateParam) {
    return c.redirect(`${clientUrl}/?error=missing_code`);
  }

  // Parse and validate state
  const state = parseOAuthState(stateParam);
  if (!state) {
    return c.redirect(`${clientUrl}/?error=invalid_state`);
  }

  // Get IP and user agent for logging
  const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] || c.req.header('x-real-ip');
  const userAgent = c.req.header('user-agent');

  const result = await handleOAuthCallback(code, state.provider, ipAddress, userAgent);

  if (!result.success) {
    return c.redirect(`${clientUrl}/?error=${encodeURIComponent(result.error || 'auth_failed')}`);
  }

  // Set session cookie
  if (result.session) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
  }

  // Redirect to original destination or default (ensure absolute URL)
  let returnTo = state.returnTo || '/dashboard';
  if (returnTo.startsWith('/')) {
    returnTo = `${clientUrl}${returnTo}`;
  }

  // If new user, redirect to onboarding
  if (result.isNewUser) {
    return c.redirect(`${clientUrl}/onboarding?welcome=true`);
  }

  return c.redirect(returnTo);
});

// Start SSO flow (enterprise)
authRouter.get('/sso/authorize', async (c) => {
  if (!WORKOS_ENABLED) {
    return c.json({ error: 'WorkOS is not configured' }, 503);
  }

  const domain = c.req.query('domain');
  const organizationId = c.req.query('organization_id') || workosConfig.orgId;
  const returnTo = c.req.query('returnTo') || '/dashboard';

  if (!organizationId && !domain) {
    return c.json({ error: 'Either domain or organization_id is required' }, 400);
  }

  const state = Buffer.from(
    JSON.stringify({
      type: 'sso',
      returnTo,
      csrfToken: crypto.randomUUID(),
    }),
  ).toString('base64url');

  try {
    const authUrl = getSsoAuthorizationUrlByOrg(organizationId, state);
    return c.redirect(authUrl);
  } catch (error) {
    console.error('[Auth] Failed to generate SSO URL:', error);
    return c.json({ error: 'Failed to start SSO flow' }, 500);
  }
});

// SSO callback
authRouter.get('/sso/callback', async (c) => {
  if (!WORKOS_ENABLED) {
    return c.json({ error: 'WorkOS is not configured' }, 503);
  }

  // Determine Frontend Origin for absolute redirects
  const isProd = process.env.NODE_ENV === 'production';
  const clientUrl =
    process.env.CLIENT_URL ||
    (isProd ? 'https://life-os-banner.verridian.ai' : 'http://127.0.0.1:5173');

  const code = c.req.query('code');
  const stateParam = c.req.query('state');
  const error = c.req.query('error');

  if (error) {
    console.error('[Auth] SSO error:', error);
    return c.redirect(`${clientUrl}/?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return c.redirect(`${clientUrl}/?error=missing_code`);
  }

  let returnTo = '/dashboard';
  if (stateParam) {
    try {
      const state = JSON.parse(Buffer.from(stateParam, 'base64url').toString('utf-8'));
      returnTo = state.returnTo || '/dashboard';
    } catch {
      // Ignore state parsing errors
    }
  }

  // Ensure absolute URL for redirect
  if (returnTo.startsWith('/')) {
    returnTo = `${clientUrl}${returnTo}`;
  }

  const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] || c.req.header('x-real-ip');
  const userAgent = c.req.header('user-agent');

  const result = await handleSsoCallback(code, ipAddress, userAgent);

  if (!result.success) {
    return c.redirect(`${clientUrl}/?error=${encodeURIComponent(result.error || 'sso_failed')}`);
  }

  if (result.session) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
  }

  if (result.isNewUser) {
    return c.redirect(`${clientUrl}/onboarding?welcome=true&sso=true`);
  }

  return c.redirect(returnTo);
});

// Send magic link
authRouter.post('/magic-link', authRateLimit.forgotPassword, async (c) => {
  if (!WORKOS_ENABLED) {
    return c.json({ error: 'WorkOS is not configured' }, 503);
  }

  const { email, returnTo } = await c.req.json();

  if (!email || typeof email !== 'string') {
    return c.json({ error: 'Valid email is required' }, 400);
  }

  try {
    await sendMagicLink(email, returnTo);
    return c.json({
      success: true,
      message: 'Magic link sent to your email',
    });
  } catch (error) {
    console.error('[Auth] Failed to send magic link:', error);
    // Don't reveal if email exists or not
    return c.json({
      success: true,
      message: 'If the email exists, a magic link has been sent',
    });
  }
});

// Magic link callback
authRouter.get('/magic-link/callback', async (c) => {
  if (!WORKOS_ENABLED) {
    return c.json({ error: 'WorkOS is not configured' }, 503);
  }

  // Determine Frontend Origin for absolute redirects
  const isProd = process.env.NODE_ENV === 'production';
  const clientUrl =
    process.env.CLIENT_URL ||
    (isProd ? 'https://life-os-banner.verridian.ai' : 'http://127.0.0.1:5173');

  const code = c.req.query('code');
  const email = c.req.query('email');
  const error = c.req.query('error');

  if (error) {
    return c.redirect(`${clientUrl}/?error=${encodeURIComponent(error)}`);
  }

  if (!code || !email) {
    return c.redirect(`${clientUrl}/?error=missing_params`);
  }

  const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] || c.req.header('x-real-ip');
  const userAgent = c.req.header('user-agent');

  const result = await handleMagicLinkAuth(code, email, ipAddress, userAgent);

  if (!result.success) {
    return c.redirect(
      `${clientUrl}/?error=${encodeURIComponent(result.error || 'magic_link_failed')}`,
    );
  }

  if (result.session) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    c.header('Set-Cookie', sessionCookie.serialize(), { append: true });
  }

  if (result.isNewUser) {
    return c.redirect(`${clientUrl}/onboarding?welcome=true`);
  }

  return c.redirect(`${clientUrl}/dashboard`);
});

// Generic OAuth callback (handles AuthKit and direct OAuth)
// This is the primary callback endpoint that WorkOS redirects to
authRouter.get('/callback', async (c) => {
  if (!WORKOS_ENABLED) {
    return c.json({ error: 'WorkOS is not configured' }, 503);
  }

  const code = c.req.query('code');
  const stateParam = c.req.query('state');
  const error = c.req.query('error');
  const errorDescription = c.req.query('error_description');

  // Determine Frontend Origin (needed for all redirects)
  const isProd = process.env.NODE_ENV === 'production';
  const clientUrl =
    process.env.CLIENT_URL ||
    (isProd ? 'https://life-os-banner.verridian.ai' : 'http://127.0.0.1:5173');

  // Handle OAuth errors
  if (error) {
    console.error('[Auth] OAuth error:', error, errorDescription);
    return c.redirect(`${clientUrl}/?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code) {
    console.error('[Auth] Missing authorization code in callback');
    return c.redirect(`${clientUrl}/?error=missing_code`);
  }

  // Default redirect location and provider
  let returnTo = '/dashboard';
  let provider: OAuthProvider = 'authkit';

  if (stateParam) {
    const state = parseOAuthState(stateParam);
    if (state) {
      returnTo = state.returnTo || '/dashboard';
      provider = state.provider || 'authkit';
    }
  }

  // Ensure absolute URL for redirect to avoid staying on backend port 8888
  if (returnTo.startsWith('/')) {
    returnTo = `${clientUrl}${returnTo}`;
  }

  // Get IP and user agent for logging
  const ipAddress = c.req.header('x-forwarded-for')?.split(',')[0] || c.req.header('x-real-ip');
  const userAgent = c.req.header('user-agent');

  console.log('[Auth /callback] Processing OAuth callback');
  console.log('[Auth /callback] Provider:', provider);
  console.log('[Auth /callback] Client URL:', clientUrl);

  const result = await handleOAuthCallback(code, provider, ipAddress, userAgent);

  if (!result.success) {
    console.error('[Auth /callback] OAuth callback failed:', result.error);
    return c.redirect(`${clientUrl}/?error=${encodeURIComponent(result.error || 'auth_failed')}`);
  }

  console.log('[Auth /callback] OAuth success, user ID:', result.user?.id);
  console.log('[Auth /callback] Is new user:', result.isNewUser);
  console.log('[Auth /callback] Session ID:', result.session?.id);

  // Set session cookie
  if (result.session) {
    const sessionCookie = lucia.createSessionCookie(result.session.id);
    const serializedCookie = sessionCookie.serialize();
    console.log('[Auth /callback] Setting session cookie, length:', serializedCookie.length);
    console.log('[Auth /callback] Cookie attributes:', serializedCookie.substring(0, 100) + '...');
    c.header('Set-Cookie', serializedCookie, { append: true });
  }

  // If new user, redirect to onboarding (use absolute URL)
  if (result.isNewUser) {
    console.log('[Auth /callback] Redirecting new user to onboarding');
    return c.redirect(`${clientUrl}/onboarding?welcome=true`);
  }

  console.log('[Auth /callback] Redirecting existing user to:', returnTo);
  return c.redirect(returnTo);
});

// Get available auth providers for a domain
authRouter.get('/providers', async (c) => {
  const domain = c.req.query('domain');

  const providers: string[] = ['password']; // Always available

  if (WORKOS_ENABLED) {
    providers.push('google', 'github', 'microsoft', 'magic_link');

    // If domain provided, check for SSO
    if (domain) {
      // In production, you'd check if domain has SSO configured
      providers.push('sso');
    }
  }

  return c.json({ providers });
});
