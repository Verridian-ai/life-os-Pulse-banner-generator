---
name: Supabase Explorer
description: Advanced database operations tool. Use this for complex SQL queries, schema inspection, and database migrations.
---

# Supabase Explorer Skill

You now have access to the full capabilities of the Supabase MCP server.

## When to use

Use this skill when the user asks for:

- Database schema details or table structures
- Complex SQL query execution
- Running or listing migrations
- Debugging database performance

## Available Tools (Context Loaded)

The following tools are available via the `supabase-mcp-server`:

### Inspection

- `mcp__supabase-mcp-server__list_tables`: See all tables in the database.
- `mcp__supabase-mcp-server__list_columns`: (If available) inspect specific table columns.
- `mcp__supabase-mcp-server__get_advisors`: Check for security/performance issues.

### Execution

- `mcp__supabase-mcp-server__execute_sql`: Run raw SQL. **WARNING**: Ensure queries are read-only unless explicitly asked to modify data.
- `mcp__supabase-mcp-server__apply_migration`: Apply DDL changes.

### Logs & Debugging

- `mcp__supabase-mcp-server__get_logs`: Fetch logs for `postgres`, `auth`, `api`, etc.

## Best Practices

1. **Always inspect schema first**: Before writing a complex join, run `list_tables` or `execute_sql` with a simple SELECT to understand the schema.
2. **Limit results**: When querying, always use `LIMIT` to avoid flooding the context.
3. **Safety**: Double-check `WHERE` clauses on UPDATE/DELETE operations.

## Example Workflow

1. User: "Why is the user query slow?"
2. Agent: Calls `mcp__supabase-mcp-server__get_advisors`.
3. Agent: Calls `mcp__supabase-mcp-server__execute_sql` with `EXPLAIN ANALYZE ...`.
