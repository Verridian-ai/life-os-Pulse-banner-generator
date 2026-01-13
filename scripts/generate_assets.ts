
import fs from 'fs';
import path from 'path';

/**
 * Nano Banana Pro - Batched Real Asset Generator
 * Usage: 
 *   export REPLICATE_API_TOKEN=r8_...
 *   npx tsx scripts/generate_assets.ts --batch-size 5 --industry Technology
 */

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'assets', 'banners');

// Load .env.local manually if present
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    console.log('📝 Loading .env.local...');
    const envConfig = fs.readFileSync(envLocalPath, 'utf8');
    envConfig.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, ''); // Remove quotes
            if (!process.env[key]) {
                process.env[key] = value;
            }
        }
    });
} else {
    console.log('⚠️ .env.local not found');
}

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ------------------------------------------------------------------
// NANO BANANA PRO: THE SECRET KEYWORD ARSENAL (COPIED FROM templates.ts)
// ------------------------------------------------------------------

const STYLES = [
    {
        id: 'minimal',
        label: 'Minimalist Tech',
        camera: 'Hasselblad X2D 100C',
        lens: '80mm f/1.9',
        lighting: 'soft natural window lighting with subtle cool fill',
        film: 'Kodak Portra 400',
        anchor: 'IMG_2847.HEIC',
        promptMod: 'minimalist composition, vast negative space, matte textures, clean geometric lines, zen-like atmosphere, architectural purity, soft shadows, high-key lighting',
    },
    {
        id: 'corporate',
        label: 'Modern Corporate',
        camera: 'Canon EOS R5',
        lens: '35mm f/1.4',
        lighting: 'professional studio softbox lighting',
        film: 'Kodak Ektar 100',
        anchor: 'IMG_4022.CR3',
        promptMod: 'modern corporate atmosphere, glass architecture, confident energy, deep perspective, platinum and obsidian accents, sharp focus, executive aesthetic',
    },
    {
        id: 'dark',
        label: 'Neon Noir (Dark Mode)',
        camera: 'Sony A1',
        lens: '50mm f/1.2 GM',
        lighting: 'cybernetic blue neon rim lights with volumetric fog',
        film: 'CineStill 800T',
        anchor: 'DSC_9934.NEF',
        promptMod: 'dark mode aesthetic, deep shadows, tech-noir atmosphere, rain-slicked surfaces, holographic reflections, moody chiaroscuro, cinematic depth',
    },
    {
        id: 'luxury',
        label: 'Architectural Luxury',
        camera: 'ARRI ALEXA 65',
        lens: 'Canon RF 15-35mm f/2.8',
        lighting: 'warm golden hour cinematic lighting',
        film: 'Kodak Vision3 500T',
        anchor: '_MG_8821.CR3',
        promptMod: 'art deco futurism, biblical grandeur, opulent textures of marble and gold, sleek furniture, soft organic shapes, mesmerizing geometric patterns, designcore masterpiece',
    },
    {
        id: 'vibrant',
        label: 'Ethereal Futurist',
        camera: 'Leica M10-R',
        lens: 'Noctilux-M 50mm f/0.95',
        lighting: 'bioluminescent glow with neon fractal patterns',
        film: 'Fujifilm Velvia 50',
        anchor: 'IMG_3392.HEIC',
        promptMod: 'ethereal trails of light, quantum energy ripples, iridescent scale patterns, magnetic atmosphere, translucent surfaces, celestial harmony, dreamlike bokeh',
    },
    {
        id: 'cinematic',
        label: 'Cinematic Documentary',
        camera: 'Leica Summilux-M',
        lens: '35mm f/1.4 ASPH',
        lighting: 'dramatic natural chiaroscuro',
        film: 'Ilford HP5 Plus',
        anchor: 'DSC_1102.NEF',
        promptMod: 'award-winning documentary photography, tactile details, raw emotion, intimate perspective, cinematic composition, timeless quality, magical realism',
    },
    {
        id: '3d-render',
        label: '3D Pixar/Dreamworks',
        camera: 'Virtual Camera',
        lens: '50mm Prime',
        lighting: 'Octane Render global illumination',
        film: 'Digital Render',
        anchor: 'render.png',
        promptMod: 'Pixar style animation, vibrant color gradients, plush doll art texture, detailed miniatures, enchanting lighting, smooth clay render, Unreal Engine 5 Lumen, whimsical and polished',
    }
];

const INDUSTRIES = [
    'Technology', 'Finance', 'Creative', 'Healthcare', 'Real Estate',
    'Marketing', 'Education', 'Legal', 'Fitness', 'Hospitality', 'E-commerce', 'Music'
];

const INDUSTRY_SUBJECTS: Record<string, string> = {
    technology: 'a futuristic server room datacenter with overlaying abstract data streams and holographic circuit board patterns, humming with quantum energy',
    marketing: 'a creative modern workspace with mood boards, branding materials, and scattered sketches, bathed in inspiring northern light',
    finance: 'a high-stakes trading floor with panoramic city views, screens displaying complex fractal market data, atmosphere of intense focus and wealth',
    consulting: 'an executive boardroom with floor-to-ceiling windows overlooking a metropolis at twilight, reflecting strategy and power',
    healthcare: 'a pristine, advanced medical laboratory with molecular holograms and white futuristic equipment, symbolizing hope and precision',
    education: 'a modern sunlit library with floating digital knowledge nodes and students collaborating in a futuristic learning pod',
    creative: 'an artist loft exploding with color, paint splatters suspended in mid-air, bohemian vibrancy, chaotic yet beautiful',
    'real-estate': 'a breathtaking luxury villa interior facing the ocean, infinity pool horizon, ultra-high-end furniture, golden hour serenity',
    legal: 'a close-up of the scales of justice balanced perfectly on a polished oak table in a grand supreme court hall with marble pillars',
    fitness: 'a dramatic silhouette of an athlete in a starting block position on a track, surrounded by steam and intense focus',
    hospitality: 'an ultra-macro shot of a gourmet plating arrangement with condensation on a crystal cocktail glass in a dimly lit luxury hotel bar',
    'e-commerce': 'a conceptual visualization of a global logistics network with high-speed delivery drones zooming past a digital shopping cart',
    music: 'a close-up of vinyl record textures and guitar strings vibrating with motion blur, set against a backdrop of a concert crowd silhouette'
};

function generatePrompt(style: typeof STYLES[0], industry: string) {
    const subject = INDUSTRY_SUBJECTS[industry.toLowerCase()] || `${industry} professional conceptual scene`;

    // Master Prompt Formula
    return `${style.promptMod}, ${subject}, ${style.lighting}, shot on ${style.camera} with ${style.lens}, ${style.film} film look, 8k resolution, photorealistic, ${style.anchor} --no text, watermarks, artificial smoothing`;
}

function createTemplate(platform: string, type: string, industry: string, style: typeof STYLES[0]) {
    const prompt = generatePrompt(style, industry);
    // DETERMINISTIC ID: platform-industry-style-type
    const id = `${platform}-${industry.toLowerCase()}-${style.id}-${type}`;
    return { id, prompt, title: `${industry} ${style.label}`, platform, type };
}

const ALL_TEMPLATES: { id: string; prompt: string; title: string, platform: string, type: string }[] = [];

INDUSTRIES.forEach(industry => {
    STYLES.forEach(style => {
        ALL_TEMPLATES.push(createTemplate('linkedin', 'banner', industry, style));
        ALL_TEMPLATES.push(createTemplate('instagram', 'post', industry, style));
        ALL_TEMPLATES.push(createTemplate('x', 'post', industry, style));
    });
});

async function generateImageReplicate(prompt: string, aspectRatio: string) {
    const apiKey = process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_KEY || process.env.VITE_REPLICATE_API_KEY || process.env.VITE_REPLICATE_API_TOKEN;
    if (!apiKey) throw new Error("Missing REPLICATE_API_TOKEN (checked standard and VITE_ prefixes)");

    const modelObj = {
        version: "google/imagen-3", // Using the named model mapping
        input: {
            prompt,
            aspect_ratio: aspectRatio,
            safety_filter_level: "block_only_high"
        }
    };

    console.log(`   🎨 Calling Replicate (google/imagen-3)...`);

    // Using simple fetch to avoid deps
    const response = await fetch("https://api.replicate.com/v1/models/google/imagen-3/predictions", {
        method: "POST",
        headers: {
            "Authorization": `Token ${apiKey}`,
            "Content-Type": "application/json",
            "Prefer": "wait" // Wait for result
        },
        body: JSON.stringify({ input: modelObj.input })
    });

    if (!response.ok) {
        const txt = await response.text();
        throw new Error(`Replicate Error ${response.status}: ${txt}`);
    }

    const data = await response.json();
    let outputUrl = data.output;

    // If output is array (common in Replicate), take first
    if (Array.isArray(outputUrl)) outputUrl = outputUrl[0];

    if (!outputUrl) {
        // If "wait" didn't finish, we might need to poll. 
        // But "Prefer: wait" normally holds connection.
        // If status is not succeeded, throw
        if (data.status !== 'succeeded') {
            throw new Error(`Generation status: ${data.status}`);
        }
    }

    return outputUrl;
}

async function downloadImage(url: string, filepath: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function main() {
    // Parse args
    const args = process.argv.slice(2);
    const batchSizeArg = args.find((a, i) => a === '--batch-size' && args[i + 1]) ? args[args.indexOf('--batch-size') + 1] : '5';
    const industryArg = args.find((a, i) => a === '--industry' && args[i + 1]) ? args[args.indexOf('--industry') + 1] : null;

    const BATCH_SIZE = parseInt(batchSizeArg);

    console.log(`🚀 Starting Generation. Batch Size: ${BATCH_SIZE}. Target Industry: ${industryArg || 'ALL'}`);

    // Filter templates
    let templates = ALL_TEMPLATES;
    if (industryArg) {
        templates = templates.filter(t => t.title.toLowerCase().includes(industryArg.toLowerCase()));
    }

    // Filter out existing
    const pendingTemplates = templates.filter(t => !fs.existsSync(path.join(OUTPUT_DIR, `${t.id}.png`)));

    console.log(`📊 Found ${pendingTemplates.length} pending images out of ${templates.length} total.`);

    if (pendingTemplates.length === 0) {
        console.log("✅ All images generated!");
        return;
    }

    // Take batch
    const batch = pendingTemplates.slice(0, BATCH_SIZE);

    console.log(`📋 Processing batch of ${batch.length}...`);

    for (const t of batch) {
        const filename = `${t.id}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        console.log(`\nRequested: ${t.id}`);
        console.log(`Prompt: ${t.prompt.substring(0, 100)}...`);

        try {
            const aspectRatio = t.prompt.includes('banner') || t.id.includes('linkedin') ? "16:9" : "1:1";

            // Try to generate
            const url = await generateImageReplicate(t.prompt, aspectRatio);
            console.log(`   ⬇️ Downloading...`);
            await downloadImage(url, filepath);
            console.log(`   ✅ Saved to ${filename}`);

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`   ❌ Failed: ${errorMessage}`);
            if (errorMessage.includes("401") || errorMessage.includes("Missing REPLICATE")) {
                console.error("   🚨 API KEY ERROR. Stopping batch.");
                break;
            }
        }

        // Sleep 2s to be nice
        await new Promise(r => setTimeout(r, 2000));
    }
}

main().catch(console.error);
