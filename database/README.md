# Database Setup Instructions (App Owner Only)

**Note**: This setup is for the app owner (you) to run ONCE in their Neon database. End users will never need to see or follow these instructions. Once you run this schema, all users can sign up and use the app immediately.

## Prerequisites

1. **Neon Account**: You already have this set up
2. **Neon Project**: You already have your Neon project configured
3. **Environment Variables**: Your Vercel deployment already has `VITE_NEON_API_BASE` configured

## Setup Steps (One-Time)

### 1. Run the Schema Migration

1. Go to your Neon project dashboard: https://console.neon.tech/
2. Click on your project
3. Click "SQL Editor" in the left sidebar
4. Copy the contents of `database/schema.sql`
5. Paste into the SQL Editor
6. Click "Run" to execute the schema

**That's it!** Once you run this, all users can sign up and use the app.

### 2. Verify Tables Created

Run this query in the SQL Editor to verify:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';
```

You should see:
- `users`
- `user_preferences`
- `designs`
- `generated_images`

## What Happens After Setup

After you run the schema:
- ✅ Users can sign up (no more "Database error saving new user")
- ✅ Users can add their own API keys in settings (stored encrypted per user)
- ✅ Users can save designs to their profile
- ✅ Users can see their generation history
- ✅ Everything works fully featured under their profile

## Testing the Database

After running the schema, try signing up a new user in the app. The user profile should now be created successfully in the `users` table.

## Troubleshooting

### Error: "Not authenticated. Please log in."

**Cause**: The Supabase auth token is not available in localStorage.

**Fix**: This is now handled gracefully - the app will continue without the database profile.

### Error: "Neon API Error: 404"

**Cause**: The `users` table doesn't exist.

**Fix**: Run the schema migration script above.

### Error: "Neon API Error: 403"

**Cause**: RLS (Row Level Security) policies are blocking access.

**Fix**: Neon doesn't use RLS by default, but if you enabled it, disable it or add appropriate policies.

## Optional: Row Level Security

If you want to add RLS for extra security:

```sql
-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY users_select_own
ON users FOR SELECT
USING (id = current_user_id());

-- Policy: Users can update their own data
CREATE POLICY users_update_own
ON users FOR UPDATE
USING (id = current_user_id());

-- You'll need to create a current_user_id() function that returns the authenticated user's ID
```

## Schema Changes

If you need to modify the schema in the future, create new migration files:
- `database/migrations/001_initial_schema.sql` (this file)
- `database/migrations/002_add_new_column.sql` (future changes)
