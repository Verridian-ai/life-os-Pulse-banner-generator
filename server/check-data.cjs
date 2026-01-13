const postgres = require('postgres');
const sql = postgres('postgresql://neondb_owner:npg_zq95UODoSfuH@ep-cold-breeze-a7zsott3-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require');

async function main() {
  // Check credit tiers
  const tiers = await sql`SELECT * FROM credit_tiers ORDER BY sort_order`;
  console.log('=== CREDIT TIERS ===');
  if (tiers.length === 0) {
    console.log('  WARNING: No credit tiers found - need to seed!');
  } else {
    tiers.forEach(t => console.log('  OK:', t.name, '-', t.monthly_credits, 'credits, $' + t.price_usd));
  }

  // Check admin users
  const admins = await sql`SELECT au.*, u.email FROM admin_users au JOIN users u ON au.user_id = u.id`;
  console.log('\n=== ADMIN USERS ===');
  if (admins.length === 0) {
    console.log('  WARNING: No admin users found');
  } else {
    admins.forEach(a => console.log('  OK:', a.email, '(' + a.role + ')'));
  }

  // Check agents
  const agents = await sql`SELECT agent_id, name, type, enabled FROM agent_configs`;
  console.log('\n=== AGENT CONFIGS ===');
  if (agents.length === 0) {
    console.log('  WARNING: No agents configured');
  } else {
    agents.forEach(a => console.log('  ' + (a.enabled ? 'OK' : 'DISABLED') + ':', a.name, '(' + a.type + ')'));
  }

  // Count users
  const userCount = await sql`SELECT COUNT(*) as count FROM users`;
  console.log('\n=== USER STATS ===');
  console.log('  Total users:', userCount[0].count);

  // Check designs
  const designCount = await sql`SELECT COUNT(*) as count FROM designs`;
  console.log('  Total designs:', designCount[0].count);

  // Check images
  const imageCount = await sql`SELECT COUNT(*) as count FROM images`;
  console.log('  Total images:', imageCount[0].count);

  await sql.end();
}
main().catch(e => { console.error(e); process.exit(1); });
