
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.REPLICATE_API_KEY;
const model = "black-forest-labs/flux-schnell"; // Verified slug from previous probe

async function testDimensions(width: number, height: number) {
    console.log(`\nTesting ${width}x${height} with ${model}...`);

    if (!apiKey) {
        console.error('No API Key');
        return;
    }

    const url = `https://api.replicate.com/v1/models/${model}/predictions`;
    const body = {
        input: {
            prompt: "A neon landscape",
            width: width,
            height: height,
            go_fast: true,
            disable_safety_checker: true
        }
    };

    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (resp.status !== 201) {
        console.log(`Failed to start: ${resp.status}`);
        console.log(await resp.text());
        return;
    }

    const data = await resp.json();
    console.log(`Prediction started: ${data.id}`);

    // Poll for result
    let pred = data;
    while (pred.status !== 'succeeded' && pred.status !== 'failed' && pred.status !== 'canceled') {
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 1000));
        const pollResp = await fetch(pred.urls.get, {
            headers: { 'Authorization': `Token ${apiKey}` }
        });
        pred = await pollResp.json();
    }
    console.log(`\nResult: ${pred.status}`);
    if (pred.status === 'failed') {
        console.log('Error:', pred.error);
    } else {
        console.log('Success:', pred.output[0]);
    }
}

async function run() {
    // Test exact LinkedIn (might fail due to 396 not multiple of 16)
    await testDimensions(1584, 396);
    // Test multiple of 16 (1584x400)
    await testDimensions(1584, 400);
}

run();
