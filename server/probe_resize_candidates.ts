
import * as dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.REPLICATE_API_KEY;

// Candidate 1: Luma Reframe
// Need to find the exact version/slug. Usually luma/photon-flash-1 or similar.
// Search indicated 'luma/reframe-image' might be a conceptual name or actual model.
// Let's try to find it or use a known stable diffusion outpaint/resize model.

// Let's test a known robust model: stability-ai/stable-diffusion-3.5-large-turbo (supports diverse aspect ratios) as a backup
// But for *resizing*, let's try 'fofr/real-esrgan-video' (often used for images too) or 'nightmareai/real-esrgan' for upscale.

// Actually, let's look for a specific 'resize' model.
// 'image-resize' is too generic.
// Let's try probing 'stability-ai/stable-diffusion-inpainting' for outpainting to size.

async function testModel(modelId: string, input: any) {
    if (!apiKey) { console.error("No API key"); return; }
    console.log(`Testing ${modelId}...`);

    try {
        const resp = await fetch(`https://api.replicate.com/v1/models/${modelId}/predictions`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input })
        });

        if (resp.status !== 201) {
            console.log(`Failed to start: ${resp.status} - ${await resp.text()}`);
            return;
        }

        const data = await resp.json();
        console.log(`Started: ${data.id}`);
        // Poll for result
        let pred = data;
        let checks = 0;
        while (pred.status !== 'succeeded' && pred.status !== 'failed' && pred.status !== 'canceled' && checks < 20) {
            process.stdout.write('.');
            await new Promise(r => setTimeout(r, 2000));
            const pollResp = await fetch(pred.urls.get, {
                headers: { 'Authorization': `Token ${apiKey}` }
            });
            pred = await pollResp.json();
            checks++;
        }
        console.log(`\nResult: ${pred.status}`);
        if (pred.status === 'succeeded') console.log(`Output: ${pred.output}`);
    } catch (e) {
        console.error(e);
    }
}

// Probing 3 different approaches
async function run() {
    // 1. Direct generation with Flux (Verified, but user wants 'resizing' research)

    // 2. 'sczhou/codeformer' (Restore - often fixes resolution to reasonable bounds, but not custom)
    // 3. 'nightmareai/real-esrgan' (Upscale - verify if it takes target width/height?)
    //    It usually takes 'scale'.

    // 4. 'fofr/aura-sr' (Upscale)

    // 5. 'adobe/firefly' (unavailable on Replicate mostly)

    // Let's probe 'luma/photon-flash' if it exists, or 'stability-ai/stable-diffusion-inpainting'
    // with a "resize" payload.

    // Actually, 'jagilley/controlnet-hough' or similar can be used for structural resize.

    // Let's try to verify if 'nightmareai/real-esrgan' accepts 'width'/'height' as override? Probably not.
    // Documentation says it takes 'scale'.

    // The best bet for "exact resize" via AI is an outpainting task.
    // Let's output valid models found in search.

    // Search suggested 'luma/reframe-image'. Let's check existence (via API lookup, not prediction, to be safe).
    // Or check 'bria/expand-image'.

    const modelsToCheck = [
        'luma/reframe-image', // Hypothetical from search
        'bria/expand-image' // From search
    ];

    for (const m of modelsToCheck) {
        console.log(`Checking existence of ${m}...`);
        const resp = await fetch(`https://api.replicate.com/v1/models/${m}`, {
            headers: { 'Authorization': `Token ${apiKey}` }
        });
        if (resp.status === 200) {
            console.log(`Verified: ${m} EXISTS`);
        } else {
            console.log(`Failed verify: ${m} (${resp.status})`);
        }
    }
}

run();
