
import { db } from '../db';
import { users } from '../db/schema';

async function main() {
    const allUsers = await db.select().from(users);
    console.log('Registered Users:');
    allUsers.forEach(u => console.log(`- ${u.email} (${u.id})`));
    process.exit(0);
}

main().catch(console.error);
