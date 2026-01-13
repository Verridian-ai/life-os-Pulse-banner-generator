/**
 * Test Database Connection
 * Verifies Neon DB connection is working
 */

import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

async function testConnection() {
  console.log('🔍 Testing Neon DB connection...\n');

  try {
    // Test basic connection
    const result = await db.execute(sql`SELECT version(), current_database(), current_user`);
    console.log('✅ Database connection successful!');
    console.log('📊 Connection details:');
    console.log(result);
    console.log('');

    // Test schema exists
    const tables = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`✅ Found ${tables.length} tables in database:`);
    tables.forEach((table: { table_name: string }) => {
      console.log(`  - ${table.table_name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error(error);
    process.exit(1);
  }
}

testConnection();

