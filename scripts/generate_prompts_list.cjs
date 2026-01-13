/* eslint-disable @typescript-eslint/no-var-requires, no-undef, @typescript-eslint/no-unused-vars */
const fs = require('fs');
const path = require('path');

const INDUSTRIES = [
    'Technology', 'Finance', 'Creative', 'Healthcare', 'Real Estate',
    'Marketing', 'Education', 'Legal', 'Fitness', 'Hospitality', 'E-commerce', 'Music'
];

// ------------------------------------------------------------------
// NANO BANANA PRO: THE SECRET KEYWORD ARSENAL (EXPANDED)
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

const INDUSTRY_SUBJECTS = {
    technology: 'a futuristic server room datacenter with overlaying abstract data streams and holographic circuit board patterns, humming with quantum energy',
    marketing: 'a creative modern workspace with mood boards, branding materials, and scattered sketches, bathed in inspiring northern light',
    finance: 'a high-stakes trading floor with panoramic city views, screens displaying complex fractal market data, atmosphere of intense focus and wealth',
    consulting: 'an executive boardroom with floor-to-ceiling windows overlooking a metropolis at twilight, reflecting strategy and power',
    healthcare: 'a pristine, advanced medical laboratory with molecular holograms and white futuristic equipment, symbolizing hope and precision',
    education: 'a modern sunlit library with floating digital knowledge nodes and students collaborating in a futuristic learning pod',
    creative: 'an artist loft exploding with color, paint splatters suspended in mid-air, bohemian vibrancy, chaotic yet beautiful',
    'real-estate': 'a breathtaking luxury villa interior facing the ocean, infinity pool horizon, ultra-high-end furniture, golden hour serenity',
};

function generatePrompt(style, industry) {
    const subject = INDUSTRY_SUBJECTS[industry.toLowerCase()] || `${industry} professional conceptual scene`;

    // Construct the prompt using the "Nano Banana Pro" formula (Expanded)
    const prompt = `${style.promptMod}, ${subject}, ${style.lighting}, shot on ${style.camera} with ${style.lens}, ${style.film} film look, 8k resolution, photorealistic, ${style.anchor}`;

    return prompt;
}

let content = '# Nano Banana Pro - Template Prompts Registry\n\nGenerated on: ' + new Date().toISOString() + '\n\n';

INDUSTRIES.forEach(industry => {
    content += `## ${industry}\n\n`;
    STYLES.forEach(style => {
        // Include all 5 platforms to match templates.ts
        ['linkedin', 'instagram', 'x', 'tiktok', 'youtube'].forEach(platform => {
            const type = (platform === 'linkedin' || platform === 'youtube') ? 'banner' : 'post';

            // Define Aspect Ratios
            let ar = '--ar 16:9'; // Default Landscape
            if (platform === 'instagram') ar = '--ar 4:5'; // Portrait
            if (platform === 'tiktok') ar = '--ar 9:16'; // Vertical
            if (platform === 'linkedin' || platform === 'youtube' || platform === 'x') ar = '--ar 16:9'; // Landscape basics

            // Deterministic ID logic from templates.ts
            const id = `${platform}-${industry.toLowerCase()}-${style.id}-${type}`;
            const rawPrompt = generatePrompt(style, industry);
            // Append AR to the prompt for easy copying
            const prompt = `${id} -- ${rawPrompt} ${ar}`;

            content += `### ${id}\n`;
            content += `- **Filename:** \`${id}.png\`\n`;
            content += `- **Platform:** ${platform}\n`;
            content += `- **Style:** ${style.label} (${style.id})\n`;
            content += `- **Prompt:** \`${prompt}\`\n\n`;
        });
    });
});

fs.writeFileSync('c:\\Users\\Danie\\Desktop\\nanobanna-pro\\templates_prompts.md', content);
console.log('Successfully generated templates_prompts.md');
