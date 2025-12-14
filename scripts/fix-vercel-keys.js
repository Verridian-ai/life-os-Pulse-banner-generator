const { execSync, spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[36m%s\x1b[0m', '=== NanoBanna Pro: Vercel API Key Fixer ===');
console.log('This script helps you add the missing OpenRouter API key to Vercel.\n');

// Check Vercel CLI
try {
    execSync('npx vercel --version', { stdio: 'ignore' });
} catch (e) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Vercel CLI not found. Please install it or run "npm install -g vercel"');
    process.exit(1);
}

function askKey() {
    rl.question('Please paste your OpenRouter API Key (sk-or-...): ', (key) => {
        if (!key || !key.startsWith('sk-or-')) {
            console.log('\x1b[33m%s\x1b[0m', 'That doesn\'t look like a standard OpenRouter key. Try again?');
            return askKey();
        }
        setKey(key.trim());
    });
}

function setKey(key) {
    console.log('\n\x1b[33m%s\x1b[0m', 'Setting VITE_OPENROUTER_API_KEY for Production, Preview, and Development...');

    const targets = ['production', 'preview', 'development'];

    targets.forEach(target => {
        try {
            // Allow valid exit code (api might fail if exists)
            console.log(`Adding to ${target}...`);
            // Note: This spawns the process and expects input. 
            // Vercel CLI 'env add' expects: name, value, targets.
            // Automating 'vercel env add' is tricky as it's interactive.
            // We will output the command the user should run if automation is hard, 
            // OR we use the 'printf' pipe trick if consistent.

            // Attempting to remove first to avoid duplicate errors? No, dangerous.

            // Let's just try to be helpful and print the commands.
            // Actually, 'vercel env add' is hard to script.
            // 'vercel env add <name> [environment]' reads from stdin.

            const cmd = `echo ${key} | npx vercel env add VITE_OPENROUTER_API_KEY ${target}`;
            execSync(cmd, { stdio: 'inherit', shell: true });

        } catch (e) {
            console.log(`Make sure you are logged in 'npx vercel login'. If the key exists, unwanted error might occur.`);
        }
    });

    console.log('\n\x1b[32m%s\x1b[0m', 'Done! Now redeploying to make changes effective...');

    rl.question('Do you want to redeploy now? (y/n) ', (answer) => {
        if (answer.toLowerCase() === 'y') {
            try {
                execSync('npx vercel --prod', { stdio: 'inherit' });
            } catch (e) {
                console.error('Deployment failed.');
            }
        }
        rl.close();
    });
}

// Check login status first
try {
    const whoami = execSync('npx vercel whoami', { encoding: 'utf8' });
    console.log(`Logged in as: ${whoami.trim()}`);
    askKey();
} catch (e) {
    console.log('\x1b[33m%s\x1b[0m', 'You are not logged in to Vercel.');
    console.log('Please run: npx vercel login');
    console.log('Then run this script again.');
    rl.close();
}
