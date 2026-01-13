#!/usr/bin/env node
/**
 * WorkOS CLI MCP Server
 * Wraps the WorkOS CLI as an MCP server for Claude Code integration
 */

const { execFile } = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// Get script directory and project root
const scriptDir = __dirname;
const projectRoot = path.dirname(scriptDir);
const cliPath = path.join(scriptDir, 'bin', 'workos.exe');

// Load API key from .env.local
let apiKey = '';
const envPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^WORKOS_API_KEY=(.+)$/m);
    if (match) {
        apiKey = match[1].trim();
    }
}

// Environment variables for headless mode
const env = {
    ...process.env,
    WORKOS_ACTIVE_ENVIRONMENT: 'headless',
    WORKOS_ENVIRONMENTS_HEADLESS_NAME: 'production',
    WORKOS_ENVIRONMENTS_HEADLESS_ENDPOINT: 'https://api.workos.com',
    WORKOS_ENVIRONMENTS_HEADLESS_API_KEY: apiKey,
    WORKOS_ENVIRONMENTS_HEADLESS_TYPE: 'Production'
};

// Run WorkOS CLI command
function runCommand(args) {
    return new Promise((resolve, reject) => {
        execFile(cliPath, args, { env, timeout: 30000 }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message || `Command failed with code ${error.code}`));
            } else {
                resolve(stdout);
            }
        });
    });
}

// MCP Server Implementation
const tools = [
    // Organization Tools
    {
        name: 'workos_cli_org_list',
        description: 'List WorkOS organizations with optional filtering',
        inputSchema: {
            type: 'object',
            properties: {
                domain: { type: 'string', description: 'Filter by domain' },
                limit: { type: 'number', description: 'Limit results (default 10)' }
            }
        }
    },
    {
        name: 'workos_cli_org_get',
        description: 'Get a specific WorkOS organization by ID',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Organization ID (e.g., org_01EHZNVPK3SFK441A1RGBFSHRT)' }
            },
            required: ['id']
        }
    },
    {
        name: 'workos_cli_org_create',
        description: 'Create a new WorkOS organization',
        inputSchema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Organization name' },
                domains: { type: 'array', items: { type: 'string' }, description: 'Associated domains' }
            },
            required: ['name']
        }
    },
    {
        name: 'workos_cli_org_update',
        description: 'Update an existing WorkOS organization',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Organization ID to update' },
                name: { type: 'string', description: 'New organization name' },
                domain: { type: 'string', description: 'Domain to update' },
                state: { type: 'string', enum: ['verified', 'pending'], description: 'Domain verification state' }
            },
            required: ['id', 'name']
        }
    },
    {
        name: 'workos_cli_org_delete',
        description: 'Delete a WorkOS organization',
        inputSchema: {
            type: 'object',
            properties: {
                id: { type: 'string', description: 'Organization ID to delete' }
            },
            required: ['id']
        }
    },
    // FGA Check/Query Tools
    {
        name: 'workos_cli_fga_check',
        description: 'Check if a subject has a specific relation to a resource (authorization check)',
        inputSchema: {
            type: 'object',
            properties: {
                resource_type: { type: 'string', description: 'Resource type (e.g., document, folder)' },
                resource_id: { type: 'string', description: 'Resource ID' },
                relation: { type: 'string', description: 'Relation to check (e.g., owner, viewer, editor)' },
                subject_type: { type: 'string', description: 'Subject type (e.g., user)' },
                subject_id: { type: 'string', description: 'Subject ID' }
            },
            required: ['resource_type', 'resource_id', 'relation', 'subject_type', 'subject_id']
        }
    },
    {
        name: 'workos_cli_fga_query',
        description: 'Query FGA to find which resources a subject has access to or which subjects have access to a resource',
        inputSchema: {
            type: 'object',
            properties: {
                query: { type: 'string', description: 'FGA query (e.g., "select document where user:john is owner")' },
                context: { type: 'string', description: 'Optional context for the query' },
                limit: { type: 'number', description: 'Limit results (default 10)' }
            },
            required: ['query']
        }
    },
    // FGA Resource Tools
    {
        name: 'workos_cli_fga_resource_list',
        description: 'List FGA resources, optionally filtered by type',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Resource type to filter by (e.g., user, document)' },
                search: { type: 'string', description: 'Search term to filter results' },
                limit: { type: 'number', description: 'Limit results (default 10)' },
                order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order' }
            }
        }
    },
    {
        name: 'workos_cli_fga_resource_create',
        description: 'Create a new FGA resource',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Resource type' },
                id: { type: 'string', description: 'Resource ID' }
            },
            required: ['type', 'id']
        }
    },
    {
        name: 'workos_cli_fga_resource_delete',
        description: 'Delete an FGA resource',
        inputSchema: {
            type: 'object',
            properties: {
                type: { type: 'string', description: 'Resource type' },
                id: { type: 'string', description: 'Resource ID' }
            },
            required: ['type', 'id']
        }
    },
    // FGA Resource Type Tools
    {
        name: 'workos_cli_fga_resourcetype_list',
        description: 'List all FGA resource types defined in your schema',
        inputSchema: {
            type: 'object',
            properties: {
                limit: { type: 'number', description: 'Limit results (default 10)' },
                order: { type: 'string', enum: ['asc', 'desc'], description: 'Sort order' }
            }
        }
    },
    // FGA Warrant Tools
    {
        name: 'workos_cli_fga_warrant_create',
        description: 'Create a warrant (assign a relation between subject and resource)',
        inputSchema: {
            type: 'object',
            properties: {
                subject: { type: 'string', description: 'Subject in format type:id (e.g., user:john)' },
                relation: { type: 'string', description: 'Relation (e.g., owner, viewer, editor)' },
                resource: { type: 'string', description: 'Resource in format type:id (e.g., document:xyz)' },
                policy: { type: 'string', description: 'Optional policy expression (e.g., "region == \'eu\'")' }
            },
            required: ['subject', 'relation', 'resource']
        }
    },
    {
        name: 'workos_cli_fga_warrant_delete',
        description: 'Delete a warrant (remove a relation between subject and resource)',
        inputSchema: {
            type: 'object',
            properties: {
                subject: { type: 'string', description: 'Subject in format type:id (e.g., user:john)' },
                relation: { type: 'string', description: 'Relation (e.g., owner, viewer)' },
                resource: { type: 'string', description: 'Resource in format type:id (e.g., document:xyz)' }
            },
            required: ['subject', 'relation', 'resource']
        }
    },
    // FGA Schema Tools
    {
        name: 'workos_cli_fga_schema_get',
        description: 'Get the current FGA schema',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    },
    {
        name: 'workos_cli_fga_schema_validate',
        description: 'Validate an FGA schema file for issues',
        inputSchema: {
            type: 'object',
            properties: {
                file: { type: 'string', description: 'Path to schema file to validate' }
            },
            required: ['file']
        }
    },
    // Help Tool
    {
        name: 'workos_cli_help',
        description: 'Show WorkOS CLI help and available commands',
        inputSchema: {
            type: 'object',
            properties: {
                command: { type: 'string', description: 'Specific command to get help for (e.g., organization, fga, fga resource)' }
            }
        }
    },
    // Environment Tool
    {
        name: 'workos_cli_env_list',
        description: 'List configured WorkOS environments',
        inputSchema: {
            type: 'object',
            properties: {}
        }
    }
];

// Handle MCP messages
async function handleMessage(message) {
    const { method, id, params } = message;

    switch (method) {
        case 'initialize':
            return {
                jsonrpc: '2.0',
                id,
                result: {
                    protocolVersion: '2024-11-05',
                    capabilities: { tools: {} },
                    serverInfo: { name: 'workos-cli', version: '0.1.0' }
                }
            };

        case 'tools/list':
            return {
                jsonrpc: '2.0',
                id,
                result: { tools }
            };

        case 'tools/call':
            try {
                const result = await executeToolCall(params.name, params.arguments || {});
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text: result }] }
                };
            } catch (error) {
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text: `Error: ${error.message}` }], isError: true }
                };
            }

        default:
            return {
                jsonrpc: '2.0',
                id,
                result: {}
            };
    }
}

async function executeToolCall(toolName, args) {
    switch (toolName) {
        // Organization Tools
        case 'workos_cli_org_list': {
            const cmdArgs = ['organization', 'list'];
            if (args.domain) cmdArgs.push('--domain', args.domain);
            if (args.limit) cmdArgs.push('--limit', args.limit.toString());
            return await runCommand(cmdArgs);
        }

        case 'workos_cli_org_get': {
            return await runCommand(['organization', 'get', args.id]);
        }

        case 'workos_cli_org_create': {
            const cmdArgs = ['organization', 'create', '--name', args.name];
            if (args.domains) {
                args.domains.forEach(d => cmdArgs.push('--domain', d));
            }
            return await runCommand(cmdArgs);
        }

        case 'workos_cli_org_update': {
            const cmdArgs = ['organization', 'update', args.id, args.name];
            if (args.domain) cmdArgs.push(args.domain);
            if (args.state) cmdArgs.push(args.state);
            return await runCommand(cmdArgs);
        }

        case 'workos_cli_org_delete': {
            return await runCommand(['organization', 'delete', args.id]);
        }

        // FGA Check/Query Tools
        case 'workos_cli_fga_check': {
            return await runCommand([
                'fga', 'check',
                '--resource-type', args.resource_type,
                '--resource-id', args.resource_id,
                '--relation', args.relation,
                '--subject-type', args.subject_type,
                '--subject-id', args.subject_id
            ]);
        }

        case 'workos_cli_fga_query': {
            const cmdArgs = ['fga', 'query', args.query];
            if (args.context) cmdArgs.push(args.context);
            if (args.limit) cmdArgs.push('--limit', args.limit.toString());
            return await runCommand(cmdArgs);
        }

        // FGA Resource Tools
        case 'workos_cli_fga_resource_list': {
            const cmdArgs = ['fga', 'resource', 'list'];
            if (args.type) cmdArgs.push('--type', args.type);
            if (args.search) cmdArgs.push('--search', args.search);
            if (args.limit) cmdArgs.push('--limit', args.limit.toString());
            if (args.order) cmdArgs.push('--order', args.order);
            return await runCommand(cmdArgs);
        }

        case 'workos_cli_fga_resource_create': {
            return await runCommand(['fga', 'resource', 'create', `${args.type}:${args.id}`]);
        }

        case 'workos_cli_fga_resource_delete': {
            return await runCommand(['fga', 'resource', 'delete', `${args.type}:${args.id}`]);
        }

        // FGA Resource Type Tools
        case 'workos_cli_fga_resourcetype_list': {
            const cmdArgs = ['fga', 'resourcetype', 'list'];
            if (args.limit) cmdArgs.push('--limit', args.limit.toString());
            if (args.order) cmdArgs.push('--order', args.order);
            return await runCommand(cmdArgs);
        }

        // FGA Warrant Tools
        case 'workos_cli_fga_warrant_create': {
            const cmdArgs = ['fga', 'warrant', 'create', args.subject, args.relation, args.resource];
            if (args.policy) cmdArgs.push('--policy', args.policy);
            return await runCommand(cmdArgs);
        }

        case 'workos_cli_fga_warrant_delete': {
            return await runCommand(['fga', 'warrant', 'delete', args.subject, args.relation, args.resource]);
        }

        // FGA Schema Tools
        case 'workos_cli_fga_schema_get': {
            return await runCommand(['fga', 'schema', 'get']);
        }

        case 'workos_cli_fga_schema_validate': {
            return await runCommand(['fga', 'schema', 'validate', args.file]);
        }

        // Help Tool
        case 'workos_cli_help': {
            if (args.command) {
                // Handle multi-word commands like "fga resource"
                const parts = args.command.split(' ');
                return await runCommand([...parts, '--help']);
            }
            return await runCommand(['--help']);
        }

        // Environment Tool
        case 'workos_cli_env_list': {
            // Show current environment configuration
            return `Current environment: headless (production)\nEndpoint: https://api.workos.com\nAPI Key: ${apiKey ? '***' + apiKey.slice(-4) : 'not set'}`;
        }

        default:
            throw new Error(`Unknown tool: ${toolName}`);
    }
}

// Main stdio loop
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', async (line) => {
    try {
        const message = JSON.parse(line);
        const response = await handleMessage(message);
        if (response) {
            process.stdout.write(JSON.stringify(response) + '\n');
        }
    } catch (error) {
        process.stderr.write(`Error processing message: ${error.message}\n`);
    }
});

// Handle notifications (no response needed)
process.stdin.on('end', () => process.exit(0));
