


interface ReplicateInput {
    [key: string]: any;
}

interface ReplicateResponse {
    id: string;
    version: string;
    urls: {
        get: string;
        cancel: string;
    };
    created_at: string;
    status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
    input: ReplicateInput;
    output: any;
    error: any;
    logs: string;
}

/**
 * Call Replicate API with polling
 */
export async function callReplicate(
    version: string,
    input: ReplicateInput,
    apiKey?: string
): Promise<string> {
    const token = apiKey || process.env.REPLICATE_API_KEY;

    if (!token) {
        throw new Error('Missing Replicate API Key');
    }

    console.log(`[Replicate] Starting prediction for version ${version.substring(0, 10)}...`);

    // 1. Start Prediction
    const startRes = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            version,
            input,
        }),
    });

    if (!startRes.ok) {
        const err = await startRes.text();
        console.error('[Replicate] Start failed:', err);
        throw new Error(`Replicate API Error: ${startRes.statusText} ${err}`);
    }

    const startData = (await startRes.json()) as ReplicateResponse;
    const predictionId = startData.id;
    let status = startData.status;
    let output = startData.output;

    console.log(`[Replicate] Prediction ${predictionId} started. Status: ${status}`);

    // 2. Poll
    const maxAttempts = 60; // 1 minute (for fast models) - expand if needed
    let attempts = 0;

    while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
        if (attempts >= maxAttempts) {
            throw new Error('Prediction timed out');
        }

        await new Promise(pkg => setTimeout(pkg, 1000)); // Wait 1s
        attempts++;

        const pollRes = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!pollRes.ok) {
            console.error('[Replicate] Poll failed');
            throw new Error('Failed to poll prediction status');
        }

        const pollData = (await pollRes.json()) as ReplicateResponse;
        status = pollData.status;
        output = pollData.output;

        if (status === 'failed' || status === 'canceled') {
            throw new Error(`Prediction ${status}: ${pollData.error}`);
        }
    }

    console.log(`[Replicate] Prediction ${predictionId} succeeded.`);

    // Output can be string (URL) or array of strings. We usually want the first image.
    if (Array.isArray(output)) {
        return output[0];
    }

    return output as string;
}
