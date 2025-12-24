
import * as dotenv from 'dotenv';
dotenv.config();

const models = [
    { name: 'Edit (Pix2Pix)', id: 'timbrooks/instruct-pix2pix:30c1d0b916a6f8efce20493f5d61ee2975218646b14f85e3969796030cc45020' },
    { name: 'Edit (Flux-Fill)', id: 'black-forest-labs/flux-fill-pro' },
    { name: 'Remove BG', id: 'cjwbw/rembg:8843586e9680324838426c459ec7b2046422b5e27a69c4384j587af0a2d3f742' },
    { name: 'Remove BG (Slug)', id: 'cjwbw/rembg' },
    { name: 'Upscale', id: 'nightmareai/real-esrgan' },
    { name: 'Restore', id: 'sczhou/codeformer' }
];

async function testModels() {
    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) {
        console.error('No API Key');
        return;
    }

    for (const m of models) {
        console.log(`Testing ${m.name}: ${m.id}`);
        let url = `https://api.replicate.com/v1/models/${m.id}/predictions`;
        let body: any = { input: { default: true } }; // Dummy input

        // If it has version hash (:)
        if (m.id.includes(':')) {
            const [slug, version] = m.id.split(':');
            // Actually, API for version is v1/predictions with version in body usually, 
            // BUT v1/models/{owner}/{name}/versions/{version}/predictions
            // OR standard v1/predictions with "version": "..."

            // However, let's try to just hit v1/models/{slug} to check existence first?
            // No, we want to see if we can create a prediction (even if it fails validation, avoiding 404 is the goal)

            // If we use the "deployments" or "models" endpoint correctly:
            // https://api.replicate.com/v1/models/timbrooks/instruct-pix2pix

            url = `https://api.replicate.com/v1/models/${slug}`;
        } else {
            url = `https://api.replicate.com/v1/models/${m.id}`;
        }

        const resp = await fetch(url, {
            headers: { 'Authorization': `Token ${apiKey}` }
        });

        console.log(`  -> Status: ${resp.status}`);
        if (resp.status !== 200) {
            console.log(`  -> Error: ${await resp.text()}`);
        } else {
            console.log(`  -> EXISTS`);
            // If exists, let's try to get latest version
            const data = await resp.json();
            console.log(`  -> Latest Version: ${data.latest_version?.id?.substring(0, 10)}...`);
        }
    }
}

testModels();
