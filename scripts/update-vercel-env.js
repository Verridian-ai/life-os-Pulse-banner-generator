
import { spawn, execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const VERCEL_TOKEN = 'GPEJ3b9LmxGoF44r8czmu9tR';

const ENV_FILE_PATH = path.resolve(__dirname, '../.env');
const ENV_CONTENT = fs.readFileSync(ENV_FILE_PATH, 'utf-8');

const ENV_VARS = {};
ENV_CONTENT.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').trim();
            // Filter only VITE_ keys or relevant ones, and exclude Vercel_API_key
            if (key.startsWith('VITE_') && key !== 'Vercel_API_key') {
                ENV_VARS[key] = value;
            }
        }
    }
});

const TARGETS = ['production', 'preview', 'development'];

function runCommand(command, args, input = null) {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, { stdio: ['pipe', 'inherit', 'inherit'], shell: true });

        if (input) {
            proc.stdin.write(input);
            proc.stdin.end();
        }

        proc.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command ${command} failed with code ${code}`));
        });

        proc.on('error', (err) => reject(err));
    });
}

async function main() {
    console.log('=== Vercel Environment Updater ===');
    console.log('Reading keys from .env...');
    console.log(ENV_VARS);

    try {
        // Link to Vercel
        try {
            console.log('Linking Vercel project...');
            execSync(`npx vercel link --token ${VERCEL_TOKEN} --yes`, { stdio: 'inherit' });
        } catch (e) {
            console.log('Already linked or link warning.');
        }

        // Add Vars
        console.log('\nUpdating environment variables...');
        for (const [key, value] of Object.entries(ENV_VARS)) {
            for (const target of TARGETS) {
                // Remove existing first to ensure clean state
                try {
                    execSync(`npx vercel env rm ${key} ${target} --token ${VERCEL_TOKEN} --yes`, { stdio: 'ignore' });
                    process.stdout.write(`- ${key} removed from ${target}\n`);
                } catch (e) {
                    // Ignore if it doesn't exist
                }

                // Add proper value
                process.stdout.write(`+ Adding ${key} to ${target}... `);
                await runCommand('npx', ['vercel', 'env', 'add', key, target, '--token', VERCEL_TOKEN], value.trim());
                process.stdout.write('Done\n');
            }
        }

        // Redeploy
        console.log('\n\nRedeploying to Production...');
        execSync(`npx vercel --prod --token ${VERCEL_TOKEN}`, { stdio: 'inherit' });

        console.log('\n=== Success ===');
    } catch (err) {
        console.error('Error:', err);
    }
}

main();
