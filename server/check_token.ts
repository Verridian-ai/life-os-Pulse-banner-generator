
import { db } from './src/db';
import { emailVerificationTokens, users } from './src/db/schema';
import { eq } from 'drizzle-orm';

async function checkToken() {
    const user = await db.select().from(users).where(eq(users.email, 'testuser@verridian.ai')).limit(1);
    if (!user.length) {
        console.log('User not found');
        process.exit(1);
    }
    const token = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.userId, user[0].id)).limit(1);
    console.log('Verification Token:', token[0]?.code);
    process.exit(0);
}

checkToken();
