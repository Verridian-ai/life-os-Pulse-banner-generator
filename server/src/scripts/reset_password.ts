
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { hash } from '@node-rs/argon2';

/**
 * Script to reset a user's password manually
 * Usage: npx tsx src/scripts/reset_password.ts <email> <new_password>
 */
async function main() {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
        console.error('Please provide an email and new password');
        console.error('Usage: npx tsx src/scripts/reset_password.ts <email> <new_password>');
        process.exit(1);
    }

    console.log(`Resetting password for: ${email}...`);

    // 1. Find User
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    if (!user) {
        console.error('❌ User not found!');
        process.exit(1);
    }

    // 2. Hash Password
    console.log('Hashing new password...');
    const passwordHash = await hash(newPassword, {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1
    });

    // 3. Update User
    await db
        .update(users)
        .set({
            hashedPassword: passwordHash,
            failedLoginAttempts: 0,
            lockedUntil: null
        })
        .where(eq(users.id, user.id));

    console.log(`✅ Password updated successfully for ${email}`);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
