
import { db } from '../db';
import { users, adminUsers } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to grant super_admin to a user by email
 * Usage: npx tsx src/scripts/grant_admin.ts <email>
 */
async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide an email address');
        console.error('Usage: npx tsx src/scripts/grant_admin.ts <email>');
        process.exit(1);
    }

    console.log(`Checking user: ${email}...`);

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

    console.log(`✅ Found user: ${user.id}`);

    // 2. Check existing admin
    const [existingAdmin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.userId, user.id))
        .limit(1);

    if (existingAdmin) {
        console.log(`⚠️ User is already an admin (Role: ${existingAdmin.role})`);

        // Upgrade to super_admin if not already
        if (existingAdmin.role !== 'super_admin') {
            console.log('Upgrading to super_admin...');
            await db
                .update(adminUsers)
                .set({ role: 'super_admin' })
                .where(eq(adminUsers.id, existingAdmin.id));
            console.log('✅ Upgraded to super_admin');
        } else {
            console.log('User is already super_admin. No action needed.');
        }
    } else {
        // 3. Insert new admin
        console.log('Granting super_admin privileges...');
        await db.insert(adminUsers).values({
            userId: user.id,
            role: 'super_admin',
            permissions: {
                user_management: true,
                agent_configuration: true,
                audit_log_access: true,
                system_settings: true,
                observability_config: true,
                financial_access: true
            },
            createdBy: user.id // Self-grant via script
        });
        console.log('✅ Admin granted successfully!');
    }

    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
