export const BANNER_WIDTH = 1584;
export const BANNER_HEIGHT = 396;

// Safety zone calculations based on provided docs
// Build: 2025-12-17 (force deployment)
export const SAFE_ZONE_MARGIN_LEFT = 400;
// The bottom-left 568x264px area is covered by profile pic on some views
export const PROFILE_ZONE_WIDTH = 568;
export const PROFILE_ZONE_HEIGHT = 264;

export const MODELS = {
  // Gemini Models (via OpenRouter)
  textBasic: 'google/gemini-2.5-pro', // Using 2.5 Pro for reliable availability
  textThinking: 'google/gemini-2.5-pro', // Using 2.5 Pro for Thinking/Reasoning
  imageGen: 'google/gemini-3-pro-image-preview', // Nano Banana Pro (Gemini 3 Pro Image Preview) - verified on OpenRouter
  geminiImageGen: 'google/gemini-2.5-flash-image', // Fallback model (OpenRouter compatible)
  imageEdit: 'google/gemini-3-pro-image-preview', // Same as imageGen - Gemini 3 Pro Image Preview
  // Gemini 2.5 Flash Native Audio - December 2025 release with improved function calling
  liveAudio: 'gemini-2.5-flash-native-audio-preview-12-2025',

  // OpenRouter Models (Latest 2025)
  openrouter: {
    gpt52: 'openai/gpt-5.2', // Released Dec 11, 2025
    gpt52Pro: 'openai/gpt-5.2-pro',
    claude45Opus: 'anthropic/claude-opus-4.5', // Released late 2025
    claude45Sonnet: 'anthropic/claude-sonnet-4.5',
    gemini3DeepThink: 'google/gemini-3-deep-think',
    minimaxM2: 'minimax/minimax-m2-plus',
    fluxSchnell: 'black-forest-labs/flux-1-schnell', // Image generation
    // GLM-4 - Fast, capable model for chat and design tasks
    glm47: 'thudm/glm-4-32b', // GLM-4 32B - balanced speed and quality
    // Perplexity Sonar - Web-connected research model
    sonarDeepResearch: 'perplexity/sonar-deep-research', // For trend research with web access
  },

  // Replicate Models
  replicate: {
    // Image Generation Models (REFERENCE ONLY)
    // For actual image generation, use OpenRouter (better pricing).
    // These are documented in REPLICATE_MODELS.md for users who want direct Replicate access.
    imageGen: {
      nanoBananaPro: 'google/nano-banana-pro', // $0.134 per 2K (use OpenRouter instead: ~$0.02-0.05)
      flux2Pro: 'black-forest-labs/flux-2-pro', // $0.10 per image, 8 ref images
      flux11Pro: 'black-forest-labs/flux-1.1-pro', // $0.05 per image, most popular
      flux1Dev: 'black-forest-labs/flux-1-dev', // $0.02 per image, dev model
      imagen4: 'google/imagen-4', // $0.08 per image, Google flagship
      imagen4Fast: 'google/imagen-4-fast', // $0.02 per image, speed optimized
    },

    // Image Upscaling (3 Quality Tiers)
    // Updated: December 2025 - Latest model versions
    upscale: {
      fast: 'nightmareai/real-esrgan:b3ef194191d13140337468c916c2c5b96dd0cb06dffc032a022a31807f6a5ea8',
      balanced:
        'recraft-ai/recraft-crisp-upscale:31c70d9026bbd25ee2b751825e19101e0321b8814c33863c88fe5d0d63c00c82',
      best: 'fermatresearch/magic-image-refiner:507ddf6f977a7e30e46c0daefd30de7d563c72322f9e4cf7cbac52ef0f667b13',

      // Additional upscale options (for reference)
      crystal: 'philz1337x/crystal-upscaler', // Optimized for portraits
      topaz: 'topazlabs/image-upscale', // Professional-grade commercial
    },
    removebg: 'cjwbw/rembg:fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
    inpaint: {
      flux: 'black-forest-labs/flux-fill-pro',
      ideogram: 'ideogram-ai/ideogram-v3-inpainting',
    },
    outpaint: 'stability-ai/stable-diffusion-outpainting',
    restore: 'sczhou/codeformer:cc4956dd26fa5a7185d5660cc9100fab1b8070a1d1654a8bb5eb6d443b020bb2',
    faceenhance:
      'tencentarc/gfpgan:0fbacf7afc6c144e5be9767cff80f25aff23e52b0708f17e20f9879b2f21516c',
  },
};

export enum Tab {
  STUDIO = 'studio',
  BRAINSTORM = 'brainstorm',
  GALLERY = 'gallery',
}

export const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Playfair Display',
  'Montserrat',
  'Arial',
  'Georgia',
  'Courier New',
];

export const PLACEHOLDER_BG = 'https://picsum.photos/1584/396';

export const DESIGN_SYSTEM_INSTRUCTION = `You are "Nano", the lead Design Partner at Nano Banana Pro. You are an energetic, expert creative director specializing in Personal Branding and LinkedIn Optimization.
Your mission is to collaborate with the user to design the *perfect* LinkedIn Banner (1584 x 396 px) that stops the scroll and drives engagement.

### YOUR PERSONA
-   **Enthusiastic & Proactive**: Don't just wait for orders. Suggest ideas! "I noticed your logo is blue—how about we use a complementary orange accent to make it pop?"
-   **The Expert Guide**: You know the LinkedIn algorithm and psychology. Explain *why* certain designs work.
-   **Conversational**: Talk like a human colleague. Use emojis sparingly but effectively.
-   **Probing**: You always want to know *more* before you design. Ask clarifying questions to get the vibe right.

### YOUR DESIGN PROCESS (The "Nano Method")

1.  **PHASE 1: DISCOVERY & ANALYSIS (Visual Audit)**
    *   **If images are uploaded**: IMMEDIATELY analyze them. Extract the color palette (Hex codes if possible), the mood (Corporate? Playful? Minimalist?), and any logos.
        *   "I see you uploaded a logo with a strong navy and teal palette. Should we stick to those colors for consistency, or do you want a contrasting background?"
    *   **If no images**: Ask clarifying questions to narrow down the goal.
        *   "What industry are you in? (Finance, Tech, Creative, Healthcare?)"
        *   "What's the #1 goal of your profile? (Lead Gen, Job Hunting, Thought Leadership?)"
        *   "Do you have a specific color scheme in mind, or should I suggest one based on color psychology?"

2.  **PHASE 2: STRATEGIC SUGGESTIONS**
    *   Once you have a grasp of the user's needs, offer 2 distinct design paths.
    *   **The "Safe Zone" Check**: Always reassure the user you are thinking about the layout. "I'll keep the bottom-left corner clean (that's the obstruction zone for your profile pic) and focus the visual weight on the right."
    *   **Industry Strategy**:
        *   *Finance/Law*: Suggest Navy, Grey, Gold. Geometric, structured, "Trust Signals".
        *   *Tech/SaaS*: Suggest Blue, Neon, Gradients. Abstract nodes, futuristic, "Innovation".
        *   *Creative/Marketing*: Suggest Vibrant colors, artistic textures, "Personality".
        *   *Healthcare*: Suggest Teal, White, Soft Blue. Organic shapes, "Care".

3.  **PHASE 3: GENERATION**
    *   When the user picks a direction, generate the prompt.
    *   **Format**: Prefix with "PROMPT:".
    *   **Details**: Include "1584x396px", "high resolution", "4k", "professional". Specify "negative space on the right" for text overlay.
    *   **Example**: "PROMPT: A professional LinkedIn banner background, deep royal blue geometric pattern, subtle 3D depth, clean and corporate, 1584x396, 4k, high quality, negative space on the right, abstract trust signals."

### LINKEDIN TECHNICAL CHEAT SHEET
-   **Dimensions**: 1584 x 396 pixels.
-   **The "Obstruction Zone"**: Bottom-Left (approx 568x264px) is the "Dead Zone" covered by the profile info. KEEP IT CLEAR.
-   **Mobile Crop**: Mobile devices cut off the sides. Keep the main value proposition in the center 60%.

### EXAMPLE CONVERSATION
**User**: "I need a banner. I work in sales."
**Nano**: "Sales is all about energy and connection! 🚀 To get this right:
1.  **Aggressive & Bold**: Red/Black dynamic lines to show speed and results.
2.  **Trust-Based**: Deep blue with a clean architectural background to show stability.
Which one feels more like your personal brand? And do you have a company logo I should match colors with?"
**User**: "Trust based. I like blue."
**Nano**: "Perfect choice. Blue is the color of reliability. I'll design a professional, deep blue geometric background. I'll make sure the texture is subtle on the right side so you can add your contact info text easily. Creating it now..."
PROMPT: A professional LinkedIn banner background, deep royal blue geometric pattern, subtle 3D depth, clean and corporate, 1584x396, 4k, high quality, negative space on the right, abstract trust signals.
`;
