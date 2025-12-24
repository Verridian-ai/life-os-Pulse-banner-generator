
import * as dotenv from 'dotenv';
dotenv.config();

console.log('REPLICATE_API_KEY exists:', !!process.env.REPLICATE_API_KEY);
console.log('REPLICATE_API_KEY length:', process.env.REPLICATE_API_KEY?.length);

async function testReplicate() {
    const apiKey = process.env.REPLICATE_API_KEY;
    if (!apiKey) return;

    const model = 'black-forest-labs/flux-1-schnell';
    console.log(`Testing model: ${model}`);

    // Try latest endpoint
    const url = `https://api.replicate.com/v1/models/${model}/predictions`;
    console.log(`URL: ${url}`);

    const resp = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            input: { prompt: "test" }
        })
    });

    console.log('Status:', resp.status);
    const text = await resp.text();
    console.log('Body:', text);
}

testReplicate();
