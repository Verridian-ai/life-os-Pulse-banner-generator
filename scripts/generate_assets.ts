
import fs from 'fs';
import path from 'path';

/**
 * Standalone Asset Generator Script - DETERMINISTIC VERSION
 * Usage: npx tsx scripts/generate_assets.ts
 */

const OUTPUT_DIR = path.join(process.cwd(), 'public', 'assets', 'banners');

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const INDUSTRIES = [
    'Technology', 'Finance', 'Creative', 'Healthcare', 'Real Estate',
    'Marketing', 'Education', 'Legal', 'Fitness', 'Hospitality', 'E-commerce', 'Music'
];

const STYLES = [
    {
        id: 'minimal',
        name: 'Minimalist',
        promptMod: 'minimalist clean aesthetic, plenty of negative space, soft ambient lighting, high key photography, shot on Hasselblad X2D 100C, 55mm lens, sharp focus, 8k',
    },
    {
        id: 'corporate',
        name: 'Corporate',
        promptMod: 'professional corporate setting, modern glass architecture, depth of field, confident atmosphere, shot on Canon EOS R5, 35mm f/1.4 lens, cinematic lighting, 8k',
    },
    {
        id: 'dark',
        name: 'Dark Mode',
        promptMod: 'sleek dark mode aesthetic, neon accents, cybernetic undertones, volumetric fog, dramatic rim lighting, low key phtography, shot on Sony A7S III, 24mm G Master lens, 8k',
    },
    {
        id: 'luxury',
        name: 'Luxury',
        promptMod: 'high-end luxury vibe, gold and marble textures, elegant composition, warm golden hour lighting, rich details, shot on Fujifilm GFX 100S, 110mm f/2 lens, bokeh, 8k',
    },
    {
        id: 'vibrant',
        name: 'Vibrant',
        promptMod: 'energetic and vibrant colors, dynamic motion blur, artistic composition, studio lighting with gels, creative and bold, shot on Nikon Z9, 50mm f/1.2 lens, 8k, highly detailed',
    },
    {
        id: 'ultra-premium',
        name: 'Ultra Premium',
        promptMod: 'award-winning architectural photography, hyper-realistic, 8k resolution, ray tracing global illumination, expensive materials, platinum and obsidian accents, cinematic depth of field, shot on Phase One XF IQ4 150MP, studio perfection',
    },
    {
        id: '3d-render',
        name: '3D Render',
        promptMod: '3d render, octane render, cinema 4d, unreal engine 5, abstract geometric shapes, floating elements, glass dispersion, subsurface scattering, soft studio lighting, clay material, matte background, 8k, masterpiece',
    }
];

const INDUSTRY_SUBJECTS: Record<string, string> = {
    'Technology': 'abstract data streams, circuit board background, futuristic server room, coding interface overlays',
    'Finance': 'abstract financial graphs, stock market bull, modern skyscraper low angle, gold coin macro shot',
    'Creative': 'abstract paint splash, designer workspace, colorful geometric shapes, artistic fluid gradients',
    'Healthcare': 'clean medical laboratory, dna double helix, doctor stethoscope macro, wellness spa elements',
    'Real Estate': 'modern luxury villa interior, city skyline at dusk, architectural blueprint close-up, key in door lock',
    'Marketing': 'abstract megaphone concept, social media icons floating, analytical charts rising, team collaboration blurred',
    'Education': 'stack of vintage books, library aisle, graduation cap and diploma, molecular science model',
    'Legal': 'scales of justice, wooden gavel macro, law library shelves, supreme court pillars',
    'Fitness': 'weights in gym, runner starting block, water splash on face, yoga pose silhouette',
    'Hospitality': 'luxury hotel lobby, gourmet food plating macro, cocktail glass condensation, concierge bell',
    'E-commerce': 'shopping cart abstract, delivery drone, package unboxing, credit card chip macro',
    'Music': 'vinyl record textues, microphone close-up, concert crowd silhouette, guitar strings macro'
};

function createTemplate(platform: string, type: string, industry: string, style: typeof STYLES[number]) {
    const subject = INDUSTRY_SUBJECTS[industry] || 'abstract professional background';
    const prompt = `${subject}, ${style.promptMod}, ${industry} theme, photorealistic, 8k uhd, highly detailed, professional composition`;
    // DETERMINISTIC ID: platform-industry-style-type
    const id = `${platform}-${industry.toLowerCase()}-${style.id}-${type}`;
    return { id, prompt, title: `${industry} ${style.name}` };
}

const TEMPLATES: { id: string; prompt: string; title: string }[] = [];
INDUSTRIES.forEach(industry => {
    STYLES.forEach(style => {
        // EXACT MATCH with App logic
        TEMPLATES.push(createTemplate('linkedin', 'banner', industry, style));
        TEMPLATES.push(createTemplate('instagram', 'post', industry, style));
        TEMPLATES.push(createTemplate('x', 'post', industry, style));
    });
});

async function downloadImage(url: string, filepath: string) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filepath, Buffer.from(buffer));
}

async function generatePlaceholder(template: { id: string }) {
    // 1536x864 is typical banner (16:9), Posts are 1080x1080 usually.
    // If it's a post, make it square.
    const isPost = template.id.endsWith('post');
    const width = isPost ? 1080 : 1536;
    const height = isPost ? 1080 : 864;
    return `https://picsum.photos/seed/${template.id}/${width}/${height}`;
}

async function main() {
    console.log(`🚀 Starting DETERMINISTIC Asset Generation for ${TEMPLATES.length} templates...`);

    let count = 0;
    for (const t of TEMPLATES) {
        count++;
        const filename = `${t.id}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);

        if (fs.existsSync(filepath)) {
            // console.log(`[${count}/${TEMPLATES.length}] Skipping existing: ${filename}`);
            // continue; 
            // NOTE: We do NOT skip because we changed IDs to be deterministic. 
            // Old files might exist but we want exact matches.
            // Actually, if we re-run, checking ID is enough.
        }

        console.log(`[${count}/${TEMPLATES.length}] Generating: ${t.title} (${t.id})...`);

        try {
            const url = await generatePlaceholder(t);
            await downloadImage(url, filepath);
        } catch (e) {
            console.error(`   ❌ Failed: ${e}`);
        }
        await new Promise(r => setTimeout(r, 100));
    }
    console.log('✨ All assets generated!');
}

main().catch(console.error);
