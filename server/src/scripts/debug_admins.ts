
import { db } from '../db';
import { users, adminUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

async function main() {
    console.log('--- USERS ---');
    const allUsers = await db.select().from(users);
    allUsers.forEach(u => console.log(`${u.id}: ${u.email}`));

    console.log('\n--- ADMIN_USERS ---');
    const allAdmins = await db.select().from(adminUsers);
    allAdmins.forEach(a => console.log(`${a.userId} (Role: ${a.role})`));

    process.exit(0);
}

main().catch(console.error);
