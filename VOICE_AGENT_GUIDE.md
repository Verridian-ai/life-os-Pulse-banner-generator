# Voice Agent User Guide

## Table of Contents

1. [Overview](#overview)
2. [Quick Setup](#quick-setup)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Connection Workflow](#connection-workflow)
6. [Available Voice Commands](#available-voice-commands)
7. [Understanding Preview Mode](#understanding-preview-mode)
8. [Browser Compatibility](#browser-compatibility)
9. [Cost Awareness](#cost-awareness)
10. [Privacy & Security](#privacy--security)
11. [Troubleshooting](#troubleshooting)
12. [Best Practices](#best-practices)
13. [Related Documentation](#related-documentation)

## Overview

Nanobanna Pro features a **fully functional voice-powered design system** that lets you create and edit LinkedIn banners hands-free using natural language commands.

### Key Features

- **Hands-Free Design:** Control canvas, generate images, and edit content using voice
- **17 Voice Commands:** Image generation, enhancement, canvas manipulation, and AI analysis
- **Intelligent Preview:** See results before applying them to your canvas
- **Natural Language:** Speak naturally - no need to memorize exact commands
- **Real-Time Feedback:** Live transcripts show conversation with AI assistant

### What You Can Do With Voice

| Category | Capabilities |
|----------|-------------|
| **Image Generation** | Generate backgrounds from descriptions |
| **Image Enhancement** | Upscale, restore, enhance faces, remove backgrounds |
| **Canvas Control** | Add/update/delete text elements, list elements |
| **Navigation** | Switch between Studio, Gallery, and Brainstorm tabs |
| **AI Assistance** | Get prompt suggestions, analyze images, improve designs |
| **History** | Undo and redo actions |

### How It Works

1. **Connect:** Click "Connect" to start voice session
2. **Speak:** Describe what you want in natural language
3. **Preview:** See results before applying (when applicable)
4. **Approve:** Click "Apply" to update canvas or "Reject" to discard
5. **Disconnect:** Stop the session when finished

### Technology

- **Powered by:** OpenAI Realtime API (GPT-4o Realtime)
- **Audio Quality:** 24kHz high-quality voice
- **Response Time:** ~1-3 seconds typical latency
- **Status:** Production-ready and fully operational ✅

## Quick Setup

### Step 1: Get OpenAI API Key

1. Visit [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create account
3. Click "Create new secret key"
4. Name it (e.g., "Nanobanna Voice")
5. Copy the key (starts with `sk-`)
6. **Important:** Save it somewhere safe - you won't see it again

### Step 2: Configure in Nanobanna Pro

**Method 1: Settings UI (Recommended)**

1. Open Settings (⚙️ icon in top right)
2. Find "Voice Agent API Key" section
3. Paste your OpenAI API key
4. Click "Save Settings"

**Method 2: Environment Variable**

Add to `.env.local`:
```bash
VITE_OPENAI_API_KEY=sk-your_key_here
```

**Note:** Settings UI takes precedence over .env.local

### Step 3: Test Connection

1. Look for voice agent panel (usually bottom of screen)
2. Click "Connect" button
3. **Allow microphone access** when browser prompts
4. Wait for "Live Session Active" status
5. Say: **"Hello"**
6. AI should respond - you're ready!

### Step 4: Try Your First Command

Say: **"Generate a professional LinkedIn banner with a gradient background in blue and purple"**

The AI will:
1. Acknowledge your request
2. Generate the image
3. Show preview
4. Wait for your approval

Click "Apply" to add it to your canvas!

## Prerequisites

### Required

✅ **OpenAI API Key**
- Must have access to OpenAI Realtime API
- Requires OpenAI account with credits
- Get at: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

✅ **Modern Browser**
- Chrome 89+ (Recommended)
- Edge 89+ (Recommended)
- See [Browser Compatibility](#browser-compatibility) for details

✅ **Microphone Permission**
- Browser will prompt on first connection
- Must click "Allow" for voice features to work
- Microphone icon visible in browser when active

✅ **Stable Internet Connection**
- WiFi strongly recommended (cellular uses more battery)
- Continuous WebSocket connection required
- ~64 KB/s bandwidth per direction

✅ **OpenAI Account Credits**
- Voice features use OpenAI credits
- Monitor usage at [platform.openai.com/usage](https://platform.openai.com/usage)
- See [Cost Awareness](#cost-awareness) section

### Optional (Recommended)

⭐ **Headphones/Headset**
- Reduces echo and audio feedback
- Improves voice recognition accuracy
- Better experience for longer sessions

⭐ **Quiet Environment**
- Background noise can affect recognition
- Echo cancellation and noise suppression enabled
- But quieter is still better

## Getting Started

### Understanding the Voice Agent Interface

The voice agent panel appears at the bottom of the screen and has three main sections:

**1. Connection Status Bar**
```
🟢 Live Session Active | 12 messages
```
- Green dot = connected and ready
- Message count shows conversation length
- Click "Disconnect" to end session

**2. Transcript Panel**
```
You: "Generate a mountain landscape"
Nano: "I'll generate that for you now..."
```
- Shows your speech (right side)
- Shows AI responses (left side)
- Auto-scrolls to latest message
- Tool call badges show when commands execute

**3. Action Preview Panel**
```
⚡ Action Preview

Generate Background
"Mountain landscape with sunset"

[Preview Image]

[✓ Apply] [✗ Reject]
```
- Shows preview of results
- Displays relevant tool information
- Apply or Reject buttons for approval
- Only visible when preview available

### Your First Voice Session

**1. Start the Session**
```
Click "Connect" → Allow microphone → Wait for green status
```

**2. Try a Simple Command**

Say: **"Add the text 'John Smith' to the canvas"**

The AI will:
- Transcribe your speech (appears in transcript)
- Execute the command
- Add text element immediately (no preview needed)
- Confirm with response

**3. Try a Preview Command**

Say: **"Generate a professional office background"**

The AI will:
- Transcribe your request
- Generate the image (takes ~15 seconds)
- Show preview with "Apply" and "Reject" buttons
- Wait for your decision

**4. Approve or Reject**

- **Click "Apply"** to update canvas with generated image
- **Click "Reject"** to discard and try again

**5. Continue the Conversation**

Say: **"Make it more modern and minimalist"**

The AI understands context and will:
- Use the previous image
- Apply magic edit with your instructions
- Show new preview
- Wait for approval

**6. End the Session**

Click "Disconnect" to stop voice agent and release microphone.

### Tips for Beginners

1. **Speak Clearly:** Pause briefly between words for better recognition
2. **Wait for Response:** Let AI finish before next command
3. **Use Natural Language:** No need to memorize exact phrases
4. **Check Transcript:** Verify AI heard you correctly
5. **Preview First:** Commands with previews let you see before applying

## Connection Workflow

### Step-by-Step Connection Process

**Phase 1: Initialization (1-2 seconds)**
```
User clicks "Connect"
    ↓
API key retrieved from storage
    ↓
WebSocket connection established
```

**Phase 2: Audio Setup (1-2 seconds)**
```
Browser prompts for microphone (first time only)
    ↓
User clicks "Allow"
    ↓
Audio pipeline configured (24kHz)
    ↓
Microphone streaming starts
```

**Phase 3: OpenAI Session (1 second)**
```
Session initialized with OpenAI
    ↓
17 tool functions registered
    ↓
Voice activated (Alloy voice)
    ↓
Status changes to "Live Session Active"
```

**Total connection time:** ~3-5 seconds typical

### What Happens Behind the Scenes

When you connect:

1. **API Key Validation**
   - Your OpenAI API key is retrieved securely
   - Validated with OpenAI servers
   - Connection fails if invalid or expired

2. **WebSocket Connection**
   - Persistent connection to `wss://api.openai.com/v1/realtime`
   - Encrypted (WSS = WebSocket Secure)
   - Stays open for entire session

3. **Microphone Access**
   - Browser requests permission
   - Audio configured: 24kHz, echo cancellation, noise suppression
   - Continuous streaming to OpenAI

4. **Tool Registration**
   - 17 voice commands registered with OpenAI
   - AI knows what functions it can call
   - Tool calls trigger local actions

5. **Conversation Ready**
   - AI listens for your speech
   - Server-side Voice Activity Detection (VAD)
   - AI responds with voice and text

### Disconnection Process

When you click "Disconnect":

1. **WebSocket Closed**
   - Connection to OpenAI terminated
   - No more audio streaming

2. **Microphone Released**
   - All audio tracks stopped
   - Permission released (icon disappears)
   - Audio resources freed

3. **Cleanup**
   - Transcript preserved (cleared on page refresh)
   - Pending actions discarded
   - Memory buffers freed

4. **Ready to Reconnect**
   - Can reconnect anytime
   - Faster second connection (no permission prompt)

### Connection States

| State | What It Means | Actions Available |
|-------|--------------|-------------------|
| **Disconnected** | Not connected | Click "Connect" to start |
| **Connecting** | Initializing session | Wait for connection |
| **Connected** | Ready to listen | Start speaking |
| **Listening** | Actively recording | Speak your command |
| **Processing** | AI responding | Wait for response |
| **Executing** | Running command | Preview will appear |

## Available Voice Commands

Voice commands are organized by category. For complete details including parameters and examples, see [VOICE_COMMANDS_REFERENCE.md](./VOICE_COMMANDS_REFERENCE.md).

### Image Generation (1 command)

#### Generate Background

**Purpose:** Generate a professional LinkedIn banner background from a text description. The AI creates custom, high-quality banner images optimized for LinkedIn's 4:1 aspect ratio (1584x396 pixels).

**Example Phrases:**
- "Generate a professional office background"
- "Create a gradient background in blue and purple"
- "Make a minimalist background with geometric shapes"
- "Generate a tech-themed banner with circuit boards"
- "Create a nature background with mountains and sunset"
- "Generate a modern abstract background in corporate colors"
- "Make a professional banner with a city skyline"
- "Create a creative background with artistic elements"

**Parameters:**
- **Prompt:** Your description of the desired background (required)
- **Quality:** Image quality level (optional)
  - `1K` - Standard quality, faster generation (~10 seconds)
  - `2K` - High quality, balanced speed (~15 seconds) - **Default**
  - `4K` - Maximum quality, slower generation (~20-25 seconds)

**What Happens:**
1. AI receives your prompt
2. Automatically enhances prompt for LinkedIn banner optimization
3. Adds technical guidance to prevent collage/panel layouts
4. Generates single cohesive 1584x396 ultra-wide image
5. Shows **preview** with generated banner
6. Waits for your approval (Apply/Reject)

**Expected Results:**
- Professional LinkedIn banner (1584x396 pixels, 4:1 aspect ratio)
- Single cohesive design (not panels or collages)
- Ultra-wide seamless composition
- High-quality, sharp image
- Generation time:
  - 1K: ~10 seconds
  - 2K: ~15 seconds (default)
  - 4K: ~20-25 seconds

**Prompt Enhancement:**
Your prompt is automatically enhanced to prevent common issues:
- Original: "Professional office background"
- Enhanced: "A single cohesive LinkedIn banner image, ultra-wide 4:1 aspect ratio, professional office background, seamless design, no panels, no divisions, no collage, single unified composition"

This ensures you get a proper LinkedIn banner, not a collage of images.

**Common Use Cases:**
- **Professional themes:** "Corporate office with modern design"
- **Industry-specific:** "Tech startup with code and digital elements"
- **Abstract designs:** "Gradient with geometric shapes and professional colors"
- **Nature themes:** "Mountain landscape with warm sunset tones"
- **Minimalist:** "Clean minimal design with subtle texture"
- **Creative fields:** "Artistic background with creative tools and inspiration"

**Style Keywords:**
Enhance your prompts with these modifiers:
- **Professional:** "corporate", "business", "clean", "polished"
- **Modern:** "contemporary", "minimalist", "sleek", "futuristic"
- **Creative:** "artistic", "vibrant", "dynamic", "innovative"
- **Warm:** "friendly", "inviting", "warm tones", "approachable"
- **Technical:** "tech", "digital", "geometric", "structured"

**Tips:**
- ✅ Be descriptive about colors, mood, and elements
- ✅ Mention your industry or role for context
- ✅ Specify style: modern, minimal, corporate, creative, etc.
- ✅ Include desired mood: professional, energetic, calm, innovative
- ✅ Mention any key elements: gradients, patterns, imagery
- ✅ Use quality adjectives: "professional", "clean", "polished"
- ⚠️ Avoid requesting text/logos (add those separately)
- ⚠️ Don't request multiple panels or collages
- ❌ Avoid overly complex multi-element requests

**Example Prompts That Work Well:**

**For Tech Professionals:**
- "Modern tech background with circuit patterns and blue tones, professional and clean"
- "Minimalist coding background with subtle code snippets and dark theme"
- "Abstract digital network with nodes and connections, corporate blue"

**For Creatives:**
- "Artistic workspace with design tools, warm lighting, creative energy"
- "Vibrant gradient background with flowing shapes, modern and bold"
- "Minimalist creative background with subtle texture and warm tones"

**For Business:**
- "Professional corporate background with geometric patterns, navy and gold"
- "Modern office environment with natural light, professional atmosphere"
- "Abstract business background with clean lines and corporate colors"

**For Consultants/Coaches:**
- "Warm professional background with soft gradients, approachable and friendly"
- "Minimalist design with subtle patterns, calm and professional"
- "Modern workspace with natural elements, professional yet personal"

**Quality Comparison:**

| Quality | Resolution | Generation Time | Best For | Cost |
|---------|-----------|-----------------|----------|------|
| 1K | Standard | ~10 seconds | Quick tests, iterations | $0.01 |
| 2K | High | ~15 seconds | Most use cases | $0.015 |
| 4K | Maximum | ~20-25 seconds | Final banners, print | $0.025 |

**Preview Mode:** ✅ Always shows preview before applying

**Cost:** $0.01-0.025 per generation (Gemini/OpenRouter credits, varies by model)

**Iterative Design Workflow:**
1. Say: "Generate a professional tech background with blue tones"
2. Review preview, then say: "Make it more minimal and modern"
3. Review again, then say: "Add subtle geometric patterns"
4. Keep iterating until perfect!
5. Each iteration uses the previous image as reference

**Pro Tip - Combining Generation with Enhancement:**
After generating, you can chain commands:
- "Generate a mountain landscape, then upscale to best quality"
- "Create a corporate background, then add the text 'John Smith'"
- Total workflow: Generate → Review → Upscale → Add text → Done!

**Troubleshooting:**

**Issue: Generated image has multiple panels**
- Solution: Be more specific about "single image", or say "seamless composition"
- The system adds anti-collage guidance, but very specific prompts help

**Issue: Text appears in generated image**
- Solution: Don't request text in prompt. Generate background first, then add text with voice command
- Example: Instead of "Banner with 'CEO'", say "Professional background" then "Add text CEO"

**Issue: Generation takes too long**
- Solution: Use 1K quality for testing, save 4K for final version
- 2K (default) is best balance for most cases

**Issue: Result doesn't match prompt**
- Solution: Be more descriptive and specific
- Include style keywords, color preferences, mood
- Try iterating: "Make it more [specific adjustment]"

---

### Image Processing (5 commands)

Image processing commands use AI to edit, enhance, and transform your images. All these commands support **Preview Mode** - you'll see the result before it's applied to your canvas.

#### Magic Edit

**Purpose:** Edit existing images using AI-powered inpainting and transformation. Change colors, add/remove elements, modify styles, or transform backgrounds.

**Example Phrases:**
- "Change the background to a sunset"
- "Make it more modern and minimalist"
- "Add mountains in the background"
- "Replace the sky with dramatic clouds"
- "Make the colors warmer and more vibrant"
- "Add a professional bokeh effect"
- "Change the mood to be more energetic"

**Parameters:**
- **Image:** Uses current canvas image by default (can specify image URL)
- **Prompt:** Your edit instructions (required)
- **Mask:** Optional - for targeted edits to specific areas

**What Happens:**
1. AI analyzes your current canvas image
2. Applies intelligent edits based on your description
3. Preserves important elements while modifying others
4. Shows **preview** (~10-20 seconds processing time)
5. Waits for your approval (Apply/Reject)

**Expected Results:**
- Natural-looking edits that blend seamlessly
- Maintains image resolution and quality
- Works best with clear, specific instructions
- Can make multiple passes for iterative improvements

**Common Use Cases:**
- **Background changes:** "Change the office background to a beach"
- **Style transformations:** "Make it look like a watercolor painting"
- **Color adjustments:** "Make the colors cooler and more professional"
- **Element additions:** "Add a cityscape in the background"
- **Mood changes:** "Make it brighter and more optimistic"

**Tips:**
- ✅ Be specific about what you want changed
- ✅ Mention what to preserve: "Keep the text, but change the background"
- ✅ Use descriptive language for better results
- ✅ Iterate: Make small changes and build on them
- ❌ Avoid vague requests like "make it better"

**Preview Mode:** ✅ Always shows preview before applying

**Cost:** $0.005-0.015 per edit (Replicate credits)

---

#### Remove Background

**Purpose:** Remove the background from an image, creating a transparent PNG. Perfect for isolating subjects, creating overlays, or preparing images for compositing.

**Example Phrases:**
- "Remove the background"
- "Remove background from current image"
- "Make the background transparent"
- "Cut out the subject"
- "Remove the background and save as PNG"
- "Isolate the main subject"

**Parameters:**
- **Image URL:** Uses current canvas image by default (can specify URL)

**What Happens:**
1. AI detects subject(s) in the image
2. Creates precise edge detection
3. Removes background completely
4. Returns transparent PNG
5. Shows result in preview panel
6. Waits for approval

**Expected Results:**
- Clean cutout with transparent background
- Preserves subject details and edges
- Works with people, objects, products, logos
- Processing time: ~5-10 seconds
- Output format: PNG with alpha channel

**Common Use Cases:**
- **Profile pictures:** Remove distracting backgrounds
- **Product photos:** Isolate items for professional presentation
- **Logo extraction:** Extract logos from backgrounds
- **Compositing:** Prepare images to overlay on new backgrounds
- **Banner elements:** Create reusable design elements

**Tips:**
- ✅ Works best with clear subject-background contrast
- ✅ Good lighting improves edge quality
- ✅ Ideal for single subjects (people, products)
- ⚠️ Complex hair/fur may have imperfect edges
- ⚠️ Very similar subject/background colors are challenging

**Preview Mode:** ✅ Shows transparent PNG preview with checkered background

**Cost:** $0.003 per image (Replicate credits)

---

#### Upscale Image

**Purpose:** Enhance image resolution using AI upscaling. Increases image size while adding intelligent detail, sharpness, and clarity. Great for preparing low-res images for high-quality banners.

**Example Phrases:**
- "Upscale the current image"
- "Upscale to best quality"
- "Make the image higher resolution"
- "Increase the resolution"
- "Upscale this image to 4K"
- "Make this image sharper and clearer"
- "Enhance the image quality"

**Parameters:**
- **Image URL:** The image to upscale (required)
- **Mode:** Quality/speed tradeoff (optional)
  - `fast` - Quick upscale (~10 seconds)
  - `balanced` - Good quality (~20 seconds) - **Default**
  - `best` - Highest quality (~30-40 seconds)

**What Happens:**
1. AI analyzes image content
2. Applies intelligent upscaling (typically 2x resolution)
3. Adds realistic details and sharpness
4. Reduces compression artifacts
5. Shows **preview** with quality comparison
6. Waits for approval

**Expected Results:**
- 2x resolution increase (1920x1080 → 3840x2160)
- Enhanced details and textures
- Sharper edges and text
- Reduced blur and pixelation
- Maintains natural appearance
- Processing time varies by mode:
  - Fast: ~10 seconds
  - Balanced: ~20 seconds
  - Best: ~30-40 seconds

**Common Use Cases:**
- **Low-res sources:** Improve quality of small images
- **Social media exports:** Prepare images for LinkedIn's display resolution
- **Print preparation:** Create high-res versions for print
- **Quality improvement:** Rescue blurry or compressed images
- **Detail enhancement:** Bring out fine details in photos

**Mode Comparison:**

| Mode | Speed | Quality | Best For |
|------|-------|---------|----------|
| Fast | ~10s | Good | Quick previews, testing ideas |
| Balanced | ~20s | Very Good | Most use cases, daily work |
| Best | ~30-40s | Excellent | Final deliverables, print |

**Tips:**
- ✅ Use "balanced" mode for most cases (best quality/time ratio)
- ✅ Upscale before adding text (better final quality)
- ✅ Works great on photos, illustrations, graphics
- ✅ Can upscale multiple times for extreme resolution needs
- ⚠️ Best mode uses more credits - save for final versions
- ❌ Can't fix completely destroyed/corrupted images

**Preview Mode:** ✅ Shows upscaled result with side-by-side comparison

**Cost:**
- Fast: $0.005 per image
- Balanced: $0.010 per image
- Best: $0.015 per image
(Replicate credits)

---

#### Restore Image

**Purpose:** Restore old, damaged, or low-quality photos using AI. Fixes artifacts, removes noise, improves clarity, and enhances colors. Ideal for vintage photos or degraded images.

**Example Phrases:**
- "Restore this image"
- "Fix the quality of this photo"
- "Enhance this old photo"
- "Restore the damaged image"
- "Clean up this noisy image"
- "Fix the compression artifacts"
- "Restore the vintage photo"

**Parameters:**
- **Image URL:** The image to restore (required)

**What Happens:**
1. AI analyzes image quality issues
2. Removes noise, artifacts, and compression damage
3. Enhances clarity and sharpness
4. Improves color balance and contrast
5. Reconstructs missing/damaged details
6. Shows **preview** with before/after comparison
7. Waits for approval

**Expected Results:**
- Cleaner, clearer image
- Reduced noise and grain
- Fixed compression artifacts (JPEG blocks, banding)
- Better color balance
- Enhanced details and textures
- More professional appearance
- Processing time: ~15-25 seconds

**Common Use Cases:**
- **Vintage photos:** Restore old family photos or historical images
- **Compressed images:** Fix over-compressed social media downloads
- **Scanned photos:** Improve quality of scanned prints
- **Noisy images:** Clean up high-ISO or low-light photos
- **Damaged files:** Repair corrupted or partially damaged images
- **Screenshot enhancement:** Improve quality of screenshot banners

**What Gets Fixed:**
- ✅ JPEG compression artifacts and blocking
- ✅ Color banding and posterization
- ✅ Digital noise and grain
- ✅ Blur and lack of sharpness
- ✅ Poor contrast and washed-out colors
- ✅ Dust, scratches (to some degree)
- ⚠️ Severe damage may have limited improvement
- ❌ Cannot restore completely missing content

**Tips:**
- ✅ Works great on compressed social media images
- ✅ Excellent for improving screenshot quality
- ✅ Can be combined with upscale for maximum quality
- ✅ Use before adding text/overlays for best results
- ⚠️ Very old photos may need multiple passes
- ⚠️ Extreme damage has limits on what can be recovered

**Preview Mode:** ✅ Shows restored result with quality comparison

**Cost:** $0.008 per image (Replicate credits)

**Pro Workflow:**
Say: "Restore this image, then upscale to best quality"
- Result: Cleaned and enhanced high-resolution image
- Cost: ~$0.023 total (restore + upscale best)
- Time: ~45-60 seconds
- Quality: Professional-grade output

---

#### Enhance Face

**Purpose:** Enhance facial features in portraits and profile pictures. Improves skin texture, sharpens features, and creates professional-quality headshots. Ideal for LinkedIn banner profile pictures.

**Example Phrases:**
- "Enhance the face"
- "Improve the portrait quality"
- "Make the face clearer"
- "Enhance the facial features"
- "Improve the headshot quality"
- "Make the portrait more professional"
- "Sharpen the facial details"

**Parameters:**
- **Image URL:** Image containing the face to enhance (required)

**What Happens:**
1. AI detects faces in the image
2. Analyzes facial features and quality
3. Enhances skin texture and clarity
4. Sharpens eyes, eyebrows, and features
5. Improves lighting and color balance on face
6. Shows **preview** with enhanced result
7. Waits for approval

**Expected Results:**
- Clearer, more defined facial features
- Professional-looking skin texture
- Sharper eyes and details
- Better facial lighting
- Natural enhancement (not over-processed)
- Maintains natural appearance
- Processing time: ~10-15 seconds
- **Note:** Applied as 'profile' image type (not background)

**Common Use Cases:**
- **Profile pictures:** Enhance headshots for LinkedIn banners
- **Group photos:** Improve faces in team photos
- **Low-res portraits:** Rescue blurry or low-quality headshots
- **Screenshot headshots:** Enhance faces from video calls/screenshots
- **Professional branding:** Create polished personal images
- **Quick touch-ups:** Professional look without photo editing skills

**What Gets Enhanced:**
- ✅ Facial clarity and sharpness
- ✅ Skin texture and tone
- ✅ Eye definition and brightness
- ✅ Facial features and structure
- ✅ Overall facial lighting
- ✅ Natural color balance
- ⚠️ Results depend on input quality
- ❌ Cannot fix extreme blur or very low resolution

**Tips:**
- ✅ Works best with frontal or 3/4 view faces
- ✅ Input images should be at least 512x512 pixels
- ✅ Good lighting in source improves results
- ✅ Combine with restore for old photos
- ✅ Use for profile pictures in banner overlays
- ⚠️ Side profiles or partial faces may have mixed results
- ⚠️ Sunglasses or obscured faces are challenging
- ❌ Cannot change facial features, only enhance existing ones

**Preview Mode:** ✅ Shows enhanced face preview

**Cost:** $0.007 per image (Replicate credits)

**Profile Picture Workflow:**
1. Say: "Restore this image" (clean up quality)
2. Say: "Enhance the face" (improve facial features)
3. Say: "Upscale to balanced" (increase resolution)
4. Result: Professional-grade profile picture ready for banner
5. Total cost: ~$0.025 | Total time: ~45 seconds

**Important Note:**
Enhanced faces are applied as **profile images**, not background images. This means they appear as overlay elements on your banner rather than replacing the background. Perfect for creating professional headshot overlays on your LinkedIn banner design.

---

### Canvas Manipulation (4 commands)

Canvas manipulation commands let you add, modify, and manage text and other elements on your LinkedIn banner. These commands execute **immediately** without preview mode, making them perfect for quick edits and text overlays.

#### Add Text Element

**Purpose:** Add text to your canvas with customizable position, size, color, and font. Perfect for adding your name, job title, tagline, or any text overlay to your LinkedIn banner.

**Example Phrases:**
- "Add the text 'John Smith'"
- "Add my name to the canvas"
- "Put 'Web Developer' in the center"
- "Add the text 'Marketing Director' at the top"
- "Create text that says 'Let's Connect'"
- "Add 'Innovation Expert' to the banner"
- "Put the text 'Creative Problem Solver' below center"
- "Add my tagline 'Building the Future'"

**Parameters:**
- **Text:** The content to display (required)
  - Any string up to reasonable length
  - Truncated in confirmation if > 50 characters
- **X Position:** Horizontal position in pixels (optional)
  - Default: `792` (horizontal center for 1584px banner)
  - Range: 0 to 1584
- **Y Position:** Vertical position in pixels (optional)
  - Default: `198` (vertical center for 396px banner)
  - Range: 0 to 396
- **Font Size:** Text size in pixels (optional)
  - Default: `48px`
  - Typical range: 24-96px
- **Color:** Text color (optional)
  - Default: `#ffffff` (white)
  - Any valid hex color (e.g., "#3B82F6" for blue)
- **Font Family:** Font name (optional)
  - Default: `"Inter"`
  - Available: System fonts + loaded web fonts

**What Happens:**
1. AI receives your text and optional parameters
2. Creates a new text element with unique ID (`text-{timestamp}`)
3. Applies default styling:
   - Font weight: 600 (semi-bold)
   - Text align: center
   - Position: center of banner (unless specified)
4. Adds element to canvas immediately
5. Returns confirmation message
6. Element is now editable and movable

**Expected Results:**
- Text appears on canvas at specified or default position
- White color on dark backgrounds, visible and professional
- Center-aligned by default for easy positioning
- Element ID generated for future updates/deletion
- **No Preview:** Applied immediately to canvas
- **Execution Time:** Instant (<100ms)

**Common Use Cases:**

**Personal Branding:**
- "Add the text 'Sarah Johnson'"
- "Put 'Chief Technology Officer' below center"
- "Add 'Tech Leader | Speaker | Mentor'"

**Professional Titles:**
- "Add 'Senior Software Engineer at Google'"
- "Put 'Founder & CEO' in the top right"
- "Add 'Product Design Specialist'"

**Taglines & Values:**
- "Add the text 'Innovating for Impact'"
- "Put 'Passionate About User Experience'"
- "Add 'Building Tomorrow's Solutions Today'"

**Contact Information:**
- "Add 'Connect: sarah@example.com'"
- "Put 'LinkedIn.com/in/yourprofile'"
- "Add 'Schedule a call: calendly.com/yourname'"

**Call to Action:**
- "Add 'Let's Collaborate!'"
- "Put 'Open to New Opportunities'"
- "Add 'Hiring Software Engineers'"

**Tips:**
- ✅ Default center position works great for names and titles
- ✅ Use "Add text... at the top/bottom" for natural positioning
- ✅ Text defaults to white - works well on dark backgrounds
- ✅ Can be updated or moved after creation
- ✅ Use quotation marks for clarity: "Add the text 'Hello World'"
- ⚠️ Very long text may overflow - use shorter phrases
- ⚠️ For custom colors, use update command after creation
- ❌ Can't specify exact color in voice easily - update it separately

**Natural Language Examples:**

**Basic Addition:**
- "Add my name John Smith"
- "Put the text Web Developer on the banner"
- "Create text that says Let's Connect"

**With Positioning:**
- "Add Senior Engineer at the top"
- "Put my email address at the bottom"
- "Add my title in the center"

**Multi-Step Workflow:**
1. Say: "Add the text 'Alex Rivera'"
2. Say: "Add the text 'Product Designer' below that"
3. Say: "Add 'Building user-centric solutions' at the bottom"
4. Result: Professional 3-line text layout

**Preview Mode:** ❌ No preview - executes immediately

**Cost:** Free (no API calls)

**Undo:** Use "Undo that" to remove if needed

**Important Notes:**
- **Element IDs:** Each text element gets a unique ID (e.g., `text-1735689123456`)
- **Finding IDs:** Use "List elements" command to see all IDs
- **Updating:** Use "Update element" to change text, color, size, position
- **Deleting:** Use "Delete element [ID]" to remove
- **Manual Editing:** Can also drag/edit text elements manually in UI

---

#### Update Element

**Purpose:** Modify properties of existing canvas elements including text content, position, size, color, and font. Perfect for refining your design without recreating elements.

**Example Phrases:**
- "Make the text larger"
- "Change the color to blue"
- "Move the text to the top"
- "Update the text to say 'Senior Developer'"
- "Make the font size 64 pixels"
- "Change the text color to red"
- "Move element text-123 to the right"
- "Update the title to be bold"

**Parameters:**
- **Element ID:** Unique identifier of element to update (required)
  - Format: `text-{timestamp}` or other element type prefix
  - Get ID via "List elements" command
- **Properties:** Object with properties to update (required)
  - Any valid `BannerElement` property
  - Partial update - only specified properties change
  - Common properties:
    - `text`: New text content
    - `x`, `y`: New position
    - `fontSize`: New size in pixels
    - `color`: New hex color
    - `fontFamily`: New font
    - `fontWeight`: Weight (400-900)
    - `textAlign`: Alignment (left, center, right)

**What Happens:**
1. AI identifies element ID from your command
2. Extracts properties to update from natural language
3. Calls update function with ID and properties
4. Canvas updates element immediately
5. Returns confirmation with element ID
6. Changes visible instantly

**Expected Results:**
- Element updates with new properties immediately
- Only specified properties change (partial update)
- Other properties remain unchanged
- **No Preview:** Changes apply instantly
- **Execution Time:** Instant (<100ms)
- Undo available if needed

**Common Use Cases:**

**Change Text Content:**
- "Update the text to say 'Chief Technology Officer'"
- "Change the title to 'Senior Product Designer'"
- "Update element text-123 text to 'New Title'"

**Adjust Size:**
- "Make the text larger"
- "Increase the font size to 72 pixels"
- "Make the title bigger"
- "Reduce the font size"

**Change Color:**
- "Change the text color to blue"
- "Make it red"
- "Update the color to #3B82F6"
- "Change element text-123 color to gold"

**Reposition:**
- "Move the text to the top"
- "Shift it to the right"
- "Move element text-123 down"
- "Center the text"

**Multiple Properties:**
- "Make the text larger and blue"
- "Move it to the top and make it white"
- "Change the text to 'Hello' and make it bigger"

**Tips:**
- ✅ Use "List elements" first to find element IDs
- ✅ AI understands natural language: "make it bigger" = increase fontSize
- ✅ Can update multiple properties in one command
- ✅ Partial updates preserve other properties
- ✅ Undo available if update not as expected
- ⚠️ Need element ID for specific element updates
- ⚠️ "The text" refers to most recent or only text element
- ❌ Can't update non-existent elements (ID must exist)

**Natural Language Understanding:**

The AI translates natural phrases to property updates:

| You Say | AI Updates |
|---------|-----------|
| "Make it larger" | `{ fontSize: <increased> }` |
| "Change color to blue" | `{ color: "#0000FF" }` |
| "Move to top" | `{ y: <small value> }` |
| "Make it bold" | `{ fontWeight: "700" }` |
| "Center it" | `{ x: 792, textAlign: "center" }` |

**Workflow Examples:**

**Refine Text Design:**
1. Say: "Add the text 'John Smith'"
2. Say: "List elements" (get ID: `text-1234567890`)
3. Say: "Make the text larger and change color to navy blue"
4. Say: "Move it to the top"
5. Result: Refined, positioned text element

**Quick Corrections:**
1. Say: "Add the text 'Product Manger'" (typo!)
2. Say: "Update the text to say 'Product Manager'"
3. Result: Typo fixed without recreating element

**Style Iteration:**
1. Say: "Add my name Alex Rivera"
2. Say: "Make it bigger" → Review
3. Say: "Change color to gold" → Review
4. Say: "Move it up a bit" → Perfect!

**Preview Mode:** ❌ No preview - executes immediately

**Cost:** Free (no API calls)

**Undo:** Use "Undo that" to revert changes

**Important Notes:**
- **Element Context:** Saying "the text" works if only one text element exists
- **Multiple Elements:** Specify element ID when multiple elements present
- **AI Intelligence:** AI infers properties from natural language
- **Property Validation:** Invalid properties ignored by canvas
- **Visual Feedback:** See changes immediately on canvas

**Finding Element IDs:**
Say: "List elements" to get output like:
```json
[
  {
    "id": "text-1735689123456",
    "type": "text",
    "content": "John Smith",
    "position": {"x": 792, "y": 198}
  }
]
```
Then use ID in update: "Update element text-1735689123456 color to blue"

---

#### Delete Element

**Purpose:** Remove elements from your canvas. Clean up unwanted text, images, or other elements quickly with voice commands.

**Example Phrases:**
- "Delete the text element"
- "Remove that element"
- "Delete element text-123"
- "Remove the title"
- "Delete element text-1735689123456"
- "Remove all text"
- "Clear the text elements"
- "Delete that"

**Parameters:**
- **Element ID:** Unique identifier of element to delete (required)
  - Format: `text-{timestamp}` or other element type
  - Get ID via "List elements" command
  - Can reference "the text" if only one element

**What Happens:**
1. AI identifies element ID from your command
2. Calls delete function with element ID
3. Canvas removes element permanently
4. Returns confirmation with deleted element ID
5. Element disappears from canvas immediately
6. Can be undone with "Undo action"

**Expected Results:**
- Element removed from canvas instantly
- Deletion is permanent (unless undone)
- Canvas updates immediately
- **No Preview:** Executes immediately
- **No Confirmation:** Deletes right away (use undo if mistake)
- **Execution Time:** Instant (<100ms)

**Common Use Cases:**

**Remove Specific Element:**
- "Delete element text-1735689123456"
- "Remove element text-987654321"
- "Delete that text element"

**Clean Up Mistakes:**
- "Delete that" (removes most recent)
- "Remove the title" (AI finds title element)
- "Delete the text I just added"

**Iterate on Design:**
1. Say: "Add the text 'Draft Title'"
2. Review → Not quite right
3. Say: "Delete that"
4. Say: "Add the text 'Final Title'"

**Clear Canvas:**
- "Remove all text elements" (if multiple, may need to repeat)
- "Delete the text"
- "Clear the elements"

**Tips:**
- ✅ Use "List elements" to find IDs before deleting
- ✅ "Delete that" works for recently added elements
- ✅ Can always undo with "Undo that"
- ✅ Specific IDs prevent accidental deletion
- ⚠️ "The text" deletes first/only text element found
- ⚠️ Deletion is immediate - no confirmation dialog
- ⚠️ Multiple elements need multiple delete commands
- ❌ Can't delete multiple elements in one command (yet)

**Natural Language Understanding:**

| You Say | AI Interprets |
|---------|--------------|
| "Delete the text" | Deletes first text element |
| "Remove that element" | Deletes most recent element |
| "Delete element text-123" | Deletes specific element by ID |
| "Clear the title" | Finds and deletes element with title-like text |

**Workflow Examples:**

**Safe Deletion:**
1. Say: "List elements" → See all IDs
2. Say: "Delete element text-1735689123456"
3. Confirm: Element removed
4. If mistake: "Undo that"

**Quick Iteration:**
1. Say: "Add the text 'Option A'"
2. Review → Don't like it
3. Say: "Delete that"
4. Say: "Add the text 'Option B'"
5. Result: Quick design iteration

**Cleanup After Testing:**
1. Say: "Add test text" (testing layout)
2. Say: "Add more test text" (testing multiple elements)
3. Say: "List elements" (see all test elements)
4. Say: "Delete element text-111"
5. Say: "Delete element text-222"
6. Result: Clean canvas

**Preview Mode:** ❌ No preview - executes immediately

**Cost:** Free (no API calls)

**Undo:** ✅ Can undo deletion with "Undo that" or "Undo action"

**Important Notes:**
- **Permanent Action:** Deletion can't be recovered except via undo
- **Undo History:** Deletion adds to undo history
- **Element Context:** Be specific with IDs to avoid wrong deletion
- **Multiple Elements:** Need to delete one at a time currently
- **Visual Confirmation:** Element disappears immediately as confirmation

**Safety Tips:**
1. **List First:** Use "List elements" to verify ID before deleting
2. **Undo Ready:** Know you can undo if you delete wrong element
3. **Specific IDs:** Use exact ID for critical deletions
4. **Test Elements:** Use obvious text like "TEST" for elements you'll delete

**Error Handling:**
- **Invalid ID:** AI reports element not found
- **No Elements:** AI reports nothing to delete
- **Wrong Reference:** "The text" might delete unexpected element

---

#### List Elements

**Purpose:** Display all current canvas elements with their IDs, types, content, and positions. Essential for finding element IDs before updating or deleting elements.

**Example Phrases:**
- "List all elements"
- "What's on the canvas?"
- "Show me the current elements"
- "List elements"
- "What elements do I have?"
- "Show canvas elements"
- "Give me element IDs"
- "What's on my banner?"

**Parameters:**
- None (always lists all canvas elements)

**What Happens:**
1. AI calls canvas to retrieve all elements
2. Formats each element into summary object:
   - `id`: Unique element identifier
   - `type`: Element type (text, image, etc.)
   - `content`: Text content (truncated to 30 chars) or image URL
   - `position`: X and Y coordinates
3. Returns formatted JSON array
4. JSON formatted with 2-space indentation for readability
5. Displayed in transcript

**Expected Results:**
- JSON array listing all elements
- Each element shows: ID, type, content preview, position
- Text content truncated to 30 characters if longer
- Formatted for easy reading
- **No Preview:** Returns data in transcript
- **No Canvas Change:** Read-only operation
- **Execution Time:** Instant (<100ms)

**Example Output:**
```json
[
  {
    "id": "text-1735689123456",
    "type": "text",
    "content": "John Smith",
    "position": {"x": 792, "y": 198}
  },
  {
    "id": "text-1735689123789",
    "type": "text",
    "content": "Senior Product Designer",
    "position": {"x": 792, "y": 260}
  },
  {
    "id": "image-1735689124000",
    "type": "image",
    "content": "https://...",
    "position": {"x": 0, "y": 0}
  }
]
```

**Common Use Cases:**

**Find Element IDs:**
- Before updating: "List elements" → Get ID → "Update element text-123..."
- Before deleting: "List elements" → Get ID → "Delete element text-123"
- Verify element exists before operating on it

**Canvas Inspection:**
- "What's on the canvas?" → See all elements
- "Show me what elements I have" → Review current state
- "List elements" → Understand canvas composition

**Debugging:**
- Element not updating? → "List elements" → Verify ID
- Can't find element? → "List elements" → Check if it exists
- Multiple elements? → "List elements" → See all IDs

**Design Review:**
- "Show me the current elements" → Review structure
- Check element positions → Plan new element placement
- Verify text content → Ensure accuracy

**Tips:**
- ✅ Use before updating or deleting elements
- ✅ Returns JSON - easy to read in transcript
- ✅ Shows position for layout planning
- ✅ Content preview helps identify elements
- ✅ Type field shows element category
- ✅ Read-only - safe to run anytime
- ⚠️ Long text truncated to 30 chars in preview
- ⚠️ Many elements = long output
- ❌ Doesn't modify canvas - just reports

**Workflow Examples:**

**Update Workflow:**
1. Say: "List elements"
2. See: `text-1735689123456` is "John Smith"
3. Say: "Update element text-1735689123456 to say 'Jane Smith'"
4. Result: Correct element updated

**Delete Workflow:**
1. Say: "List elements"
2. See multiple text elements with IDs
3. Say: "Delete element text-1735689123456"
4. Result: Specific element deleted

**Layout Planning:**
1. Say: "List elements"
2. See: Element at position {x: 792, y: 198}
3. Say: "Add text 'New Element' at position y 300"
4. Result: New element positioned below existing

**Audit Canvas:**
1. Say: "List elements"
2. Review: 5 text elements, 1 background image
3. Decision: "Delete element text-111" (clean up old element)
4. Say: "List elements" again → Verify deletion

**Preview Mode:** ❌ No preview - returns data in transcript

**Cost:** Free (no API calls)

**Output Format:**
- **Formatted JSON:** Easy to read and parse
- **Element Summary:** Only essential properties shown
- **Truncated Content:** Long text shortened with "..."
- **Position Object:** Shows {x, y} coordinates

**Important Notes:**
- **Essential Tool:** Key command for working with existing elements
- **Safe Operation:** Read-only, doesn't change canvas
- **Transcript Output:** Results appear in voice transcript panel
- **ID Reference:** Copy IDs from output for update/delete commands
- **Canvas State:** Shows current state, updates on re-run

**Understanding Output:**

**Element ID:**
- Format: `{type}-{timestamp}`
- Example: `text-1735689123456`
- Unique identifier for each element
- Use in update/delete commands

**Element Type:**
- `text`: Text elements (most common)
- `image`: Image elements (backgrounds, overlays)
- Future: shapes, icons, etc.

**Content Preview:**
- **Text elements:** Shows actual text (max 30 chars)
- **Image elements:** Shows image URL
- **Truncation:** "..." indicates truncated content

**Position:**
- `x`: Horizontal position (0-1584 for banner)
- `y`: Vertical position (0-396 for banner)
- Center: {x: 792, y: 198}

**Pro Tips:**
1. **Keep IDs handy:** Note IDs for elements you'll modify
2. **Regular checks:** List elements after major changes
3. **Verify before delete:** Always list before deleting to confirm ID
4. **Layout reference:** Use positions to plan new element placement

---

### Navigation (1 command)

Navigation commands let you switch between different areas of the application hands-free. Perfect for quickly moving between design workspace, saved designs, and brainstorming tools without interrupting your workflow.

#### Navigate to Tab

**Purpose:** Switch between application tabs using voice commands. Move seamlessly between Studio (canvas editor), Gallery (saved designs), and Brainstorm (AI chat) without touching your mouse.

**Example Phrases:**
- "Go to the gallery"
- "Navigate to studio"
- "Switch to brainstorm tab"
- "Take me to the gallery"
- "Open the studio"
- "Show me the brainstorm page"
- "Go to studio tab"
- "Switch to gallery"

**Parameters:**
- **Tab Name:** The destination tab (required)
  - `studio` - Canvas editor with generation tools
  - `gallery` - Browse and load saved designs
  - `brainstorm` - AI chat for ideation and planning

**What Happens:**
1. AI identifies target tab from your command
2. Application switches to the specified tab immediately
3. Content for that tab loads/becomes active
4. Voice session continues (stays connected)
5. You can continue issuing commands in new tab

**Expected Results:**
- Tab changes instantly (< 100ms)
- Previous tab state preserved in background
- Voice connection remains active
- Can navigate back anytime
- **No Preview:** Executes immediately
- **Execution Time:** Instant

**Common Use Cases:**

**Design to Gallery Workflow:**
- "Go to the gallery" (browse saved designs)
- Review saved banners
- "Go back to studio" (return to editing)

**Brainstorm to Design:**
- "Switch to brainstorm" (ideation session)
- Chat with AI about design ideas
- "Navigate to studio" (implement ideas)

**Quick Reviews:**
- "Show me the gallery" (check previous work)
- Select design for reference
- "Take me to studio" (continue current work)

**Multi-Step Workflows:**
- Working in studio → Need inspiration
- "Go to gallery" → Review past designs
- "Switch to brainstorm" → Get AI suggestions
- "Navigate to studio" → Apply new ideas

**Tips:**
- ✅ Voice session stays active across tabs
- ✅ Can navigate while voice agent connected
- ✅ All tab states preserved when switching
- ✅ Natural language: "go to", "switch to", "navigate to" all work
- ✅ Tab names case-insensitive (Studio, studio, STUDIO all work)
- ⚠️ Some commands only work in specific tabs (e.g., canvas commands need studio)
- ⚠️ Switching tabs doesn't pause ongoing operations
- ❌ Can't navigate to non-existent tabs

**Natural Language Understanding:**

| You Say | AI Interprets |
|---------|--------------|
| "Go to the gallery" | Navigate to `gallery` tab |
| "Take me to studio" | Navigate to `studio` tab |
| "Open brainstorm" | Navigate to `brainstorm` tab |
| "Show me my saved designs" | Navigate to `gallery` tab |
| "Go back to the editor" | Navigate to `studio` tab |

**Workflow Examples:**

**Design Review Process:**
1. Say: "Go to the gallery"
2. Browse saved designs (voice stays connected)
3. Say: "Navigate to studio"
4. Say: "Generate a design similar to my saved banner"
5. Result: Efficient workflow without manual navigation

**Brainstorming Session:**
1. Say: "Switch to brainstorm"
2. Say: "Suggest prompts for a tech executive"
3. Review suggestions
4. Say: "Go to studio"
5. Say: "Generate a professional tech background with those ideas"
6. Result: Seamless ideation to implementation

**Quick Reference Check:**
1. Working in studio
2. Say: "Show me the gallery" (quick peek at past work)
3. Review for inspiration
4. Say: "Go back to studio" (return to current work)
5. Continue design with new insights

**Preview Mode:** ❌ No preview - executes immediately

**Cost:** Free (no API calls)

**Tab-Specific Features:**

**Studio Tab:**
- Canvas editor visible
- Generation controls active
- All canvas commands available
- Image processing commands work
- Undo/redo applies to canvas changes

**Gallery Tab:**
- Saved designs grid view
- Load/delete design options
- View design metadata
- Canvas commands not applicable
- Can generate in gallery (creates new design)

**Brainstorm Tab:**
- Full-screen AI chat interface
- Conversation-focused layout
- AI analysis commands work best here
- Canvas not visible (but preserved)
- Ideal for planning before designing

**Important Notes:**
- **Persistent Connection:** Voice session continues across tabs
- **State Preservation:** Each tab maintains its state
- **Command Context:** Some commands only work in specific tabs
- **Seamless Workflow:** Navigate freely without disconnecting
- **Multi-Tab Strategy:** Use brainstorm for ideas, studio for design, gallery for review

---

### History Management (2 commands)

History management commands let you undo and redo canvas changes, giving you complete control over your design history. Perfect for experimenting, fixing mistakes, and iterating on your design without fear of losing progress.

#### Undo Action

**Purpose:** Reverse the last change made to your canvas. Undo text additions, deletions, updates, and applied image operations. Works like Ctrl+Z but with your voice, allowing hands-free design iteration.

**Example Phrases:**
- "Undo that"
- "Go back"
- "Undo the last change"
- "Undo"
- "Revert that"
- "Go back one step"
- "Undo the last action"
- "Take that back"
- "Undo my last change"

**Parameters:**
- None (always undoes the most recent action)

**What Happens:**
1. AI calls undo function on canvas context
2. Canvas reverts to previous state in history stack
3. Most recent change is removed from canvas
4. Change is moved to redo stack (can be redone)
5. Canvas updates immediately
6. Confirmation returned to voice transcript

**Expected Results:**
- Last canvas change reversed instantly
- Canvas returns to previous state
- Undo history stack decreases by 1
- Redo stack gains 1 entry (change can be redone)
- **No Preview:** Executes immediately
- **Execution Time:** Instant (<100ms)
- Can continue to undo multiple times

**What Can Be Undone:**

**Canvas Operations:**
- ✅ Text element additions (add_text_element)
- ✅ Text element updates (update_element)
- ✅ Text element deletions (delete_element)
- ✅ Background changes (apply from preview)
- ✅ Image additions/updates
- ✅ Any change that modifies canvas state

**What Cannot Be Undone:**
- ❌ Read-only operations (list_elements, analyze)
- ❌ Navigation between tabs
- ❌ Preview generations (only undo if applied)
- ❌ Rejected preview actions (never applied)
- ❌ Voice connection/disconnection

**Common Use Cases:**

**Fixing Mistakes:**
- Say: "Add the text 'Senoir Developer'" (typo!)
- Realize mistake immediately
- Say: "Undo that"
- Say: "Add the text 'Senior Developer'" (correct)

**Experimental Changes:**
- Say: "Make the text really large"
- Review → Too big
- Say: "Undo that"
- Say: "Make it slightly larger"

**Accidental Deletions:**
- Say: "Delete element text-123"
- Realize wrong element deleted
- Say: "Undo that" (element restored)
- Say: "List elements" (verify correct ID)
- Say: "Delete element text-456" (correct element)

**Iterative Design:**
- Say: "Change background to blue"
- Apply → Review → Not quite right
- Say: "Undo that"
- Say: "Change background to navy blue with gradient"
- Apply → Better!

**Quick Comparisons:**
- Say: "Add the text 'Innovation Expert'"
- Review with text
- Say: "Undo that"
- Review without text
- Decide: "Redo that" (keep it)

**Tips:**
- ✅ Can undo multiple times in sequence
- ✅ Each undo goes back one step in history
- ✅ Undo works on both manual and voice changes
- ✅ Undo stack preserved during voice session
- ✅ Safe to experiment - always reversible
- ⚠️ Undo stack cleared on page refresh
- ⚠️ Cannot undo beyond first canvas state
- ⚠️ Undoing doesn't consume API credits
- ❌ Cannot undo read-only operations

**Natural Language Understanding:**

| You Say | AI Interprets |
|---------|--------------|
| "Undo that" | Undo last action |
| "Go back" | Undo last action |
| "Revert that change" | Undo last action |
| "Take that back" | Undo last action |
| "Undo the text" | Undo last action (AI doesn't undo specific element, just last action) |

**Workflow Examples:**

**Safe Experimentation:**
1. Say: "Add the text 'CEO'"
2. Say: "Make it really large"
3. Review → Too bold
4. Say: "Undo that" (back to normal size)
5. Say: "Make it slightly larger" (better)
6. Result: Iterated safely without recreating

**Mistake Recovery:**
1. Say: "Delete the text"
2. Realize: Wrong element deleted
3. Say: "Undo that" (element restored)
4. Say: "List elements" (find correct ID)
5. Say: "Delete element text-123456" (correct element)
6. Result: Mistake recovered instantly

**Design Comparison:**
1. Current canvas with blue background
2. Say: "Change background to red" → Apply
3. Review → Prefer blue
4. Say: "Undo that"
5. Blue background restored
6. Result: Easy A/B testing

**Multi-Step Undo:**
1. Added text element
2. Changed color to gold
3. Moved to top
4. Say: "Undo that" (position reverts)
5. Say: "Undo that" (color reverts)
6. Say: "Undo that" (text removed)
7. Result: Complete reversal of sequence

**Preview Mode:** ❌ No preview - executes immediately

**Cost:** Free (no API calls)

**Undo Stack Behavior:**
- **Stack Size:** Typically stores 20-50 previous states
- **Stack Order:** Last-in, first-out (LIFO)
- **Persistence:** Cleared on page refresh
- **Sharing:** Undo stack is per-session, not shared

**Important Notes:**
- **Instant Reversal:** Changes undo immediately
- **Redo Available:** Undone actions can be redone
- **Multiple Undos:** Can undo many times sequentially
- **Cross-Source:** Undoes both manual and voice changes
- **Safe Experimentation:** Try anything, always reversible

---

#### Redo Action

**Purpose:** Reapply a previously undone change to your canvas. Perfect for when you undo too many times or change your mind about a reversed action. Works like Ctrl+Y but with voice commands.

**Example Phrases:**
- "Redo that"
- "Bring it back"
- "Redo the last change"
- "Redo"
- "Put it back"
- "Redo the last undo"
- "Bring that back"
- "Restore that"
- "Re-apply that change"

**Parameters:**
- None (always redoes the most recently undone action)

**What Happens:**
1. AI calls redo function on canvas context
2. Canvas retrieves last undone change from redo stack
3. Change is re-applied to canvas
4. Change moves back to undo stack (can be undone again)
5. Canvas updates immediately
6. Confirmation returned to voice transcript

**Expected Results:**
- Last undone change re-applied instantly
- Canvas returns to state before undo
- Redo stack decreases by 1
- Undo stack gains 1 entry (can be undone again)
- **No Preview:** Executes immediately
- **Execution Time:** Instant (<100ms)
- Can continue to redo multiple times (if multiple undos)

**What Can Be Redone:**

**Undone Operations:**
- ✅ Any operation that was undone
- ✅ Text element changes
- ✅ Background updates
- ✅ Applied image operations
- ✅ Multiple redos if multiple undos

**What Cannot Be Redone:**
- ❌ Operations that were never undone
- ❌ Redo stack cleared if new change made
- ❌ Rejected previews (never applied)
- ❌ Read-only operations

**Common Use Cases:**

**Undo Too Far:**
- Say: "Undo that"
- Say: "Undo that"
- Say: "Undo that" → Oops, went too far
- Say: "Redo that" → Back to desired state

**Changed Mind:**
- Say: "Add the text 'Innovation'"
- Say: "Undo that" → Remove text
- Review → Actually, keep it
- Say: "Redo that" → Text restored

**Compare States:**
- Say: "Undo that" → See previous state
- Compare designs
- Say: "Redo that" → Return to current
- Decision: Keep current version

**Sequential Redo:**
- Undid 3 changes
- Say: "Redo that" → Redo first
- Say: "Redo that" → Redo second
- Say: "Redo that" → Redo third
- Result: All changes restored in order

**Tips:**
- ✅ Can redo multiple times if multiple undos
- ✅ Each redo re-applies one undo in sequence
- ✅ Redo stack maintained during voice session
- ✅ Safely toggle between states with undo/redo
- ✅ No cost to undo/redo operations
- ⚠️ Redo stack cleared if new change made after undo
- ⚠️ Redo only available immediately after undo
- ⚠️ Redo stack cleared on page refresh
- ❌ Cannot redo if nothing has been undone

**Natural Language Understanding:**

| You Say | AI Interprets |
|---------|--------------|
| "Redo that" | Redo last undone action |
| "Bring it back" | Redo last undone action |
| "Put it back" | Redo last undone action |
| "Restore that change" | Redo last undone action |

**Workflow Examples:**

**Undo/Redo Toggle:**
1. Say: "Add the text 'CEO'"
2. Say: "Undo that" (text removed)
3. Review canvas without text
4. Say: "Redo that" (text restored)
5. Review canvas with text
6. Decision: Keep text (it's restored)

**Overshoot Recovery:**
1. Made 5 canvas changes
2. Say: "Undo that" (undo 1)
3. Say: "Undo that" (undo 2)
4. Say: "Undo that" (undo 3)
5. Realize: Went too far
6. Say: "Redo that" (redo 1)
7. Result: Back to desired state

**A/B Comparison:**
1. Current state: Blue background
2. Say: "Undo that" (previous: Red background)
3. Compare red vs blue
4. Say: "Redo that" (back to blue)
5. Confirm: Blue is better
6. Result: Informed design decision

**Sequential Restoration:**
1. Undid 3 text additions
2. Say: "Redo that" (restore first text)
3. Say: "Redo that" (restore second text)
4. Decision: Keep these 2, not the third
5. Result: Selective restoration

**Preview Mode:** ❌ No preview - executes immediately

**Cost:** Free (no API calls)

**Redo Stack Behavior:**
- **Stack Creation:** Built from undo operations
- **Stack Clearing:** Cleared when new change made
- **Stack Size:** Limited by number of recent undos
- **Stack Order:** Last undone redone first (LIFO)

**Understanding Undo/Redo Relationship:**

**Scenario 1: Simple Undo/Redo**
```
State 1: Empty canvas
State 2: Add text "Hello"
Say "Undo" → Back to State 1
Say "Redo" → Back to State 2
```

**Scenario 2: Redo Stack Cleared**
```
State 1: Empty canvas
State 2: Add text "Hello"
Say "Undo" → Back to State 1 (redo available)
Say "Add text 'World'" → State 3 (redo stack cleared)
Say "Redo" → Nothing happens (redo stack empty)
```

**Scenario 3: Multiple Undo/Redo**
```
State 1 → State 2 → State 3 → State 4
Say "Undo" → State 3 (can redo to 4)
Say "Undo" → State 2 (can redo to 3, then 4)
Say "Redo" → State 3 (can still redo to 4)
Say "Redo" → State 4 (redo stack empty)
```

**Important Notes:**
- **Redo Availability:** Only available after undo
- **Stack Clearing:** New changes clear redo stack
- **Multiple Redos:** Can redo sequentially
- **Complementary:** Works with undo for full history control
- **No Side Effects:** Redoing is free and instant

**Best Practices:**

**Design Iteration:**
1. Make changes freely
2. Undo to compare previous states
3. Redo to restore if better
4. Iterate until perfect

**Safe Exploration:**
1. Try bold experimental changes
2. Undo if not working
3. Keep redo option available
4. Restore if changed mind

**Version Comparison:**
1. Use undo to go back
2. Review previous versions
3. Use redo to return
4. Make informed decisions

---

### AI Analysis (4 commands)

AI analysis commands help you improve your designs through intelligent suggestions, prompt enhancement, and professional feedback. These commands are perfect for getting unstuck, generating ideas, or getting expert-level feedback on your banner designs.

#### Suggest Prompts

**Purpose:** Get AI-generated creative prompt ideas tailored to your industry, role, or context. Perfect for brainstorming banner concepts when you're not sure what to create or need inspiration for your professional brand.

**Example Phrases:**
- "Suggest prompts for a software developer"
- "Give me ideas for a marketing banner"
- "Suggest prompts for the tech industry"
- "What are good prompts for a designer?"
- "Give me banner ideas for a consultant"
- "Suggest prompts for finance professionals"
- "What should I generate for my startup banner?"
- "Give me creative prompt ideas"

**Parameters:**
- **Industry:** Optional industry context (e.g., "tech", "finance", "healthcare")
  - Can be inferred from your description
  - Helps AI tailor suggestions to your field
- **Role:** Optional job role context (e.g., "developer", "designer", "CEO")
  - Can be inferred from your description
  - Personalizes suggestions to your position

**What Happens:**
1. AI receives your industry/role context
2. Generates 3-5 tailored prompt suggestions
3. Each suggestion optimized for LinkedIn banners
4. Returns suggestions in conversational text format
5. Appears in transcript (not as preview)
6. You can use suggestions immediately with "generate" command

**Expected Results:**
- 3-5 creative, industry-specific prompt ideas
- Detailed descriptions for each suggestion
- Professional, LinkedIn-appropriate concepts
- Ready-to-use prompts for generation
- **No Preview:** Conversational response in transcript
- **Execution Time:** ~2-5 seconds

**Common Use Cases:**

**Industry Exploration:**
- "Suggest prompts for the tech industry"
- Get tech-specific banner ideas (circuits, code, innovation themes)

**Role-Specific Branding:**
- "Give me ideas for a marketing director"
- Get marketing-relevant concepts (campaigns, strategy, creativity)

**Creative Brainstorming:**
- "What are good banner ideas for a consultant?"
- Get professional consulting themes (expertise, trust, results)

**Startup Founders:**
- "Suggest prompts for a startup founder"
- Get entrepreneurial themes (innovation, growth, disruption)

**Career Transitions:**
- "Give me ideas for a new career in data science"
- Get fresh, relevant concepts for new professional identity

**Overcoming Creative Block:**
- "I need banner ideas but don't know what to create"
- Get diverse suggestions to spark creativity

**Tips:**
- ✅ Be specific about industry/role for better suggestions
- ✅ Mention your niche: "suggest prompts for AI engineer"
- ✅ Use suggestions as starting points, then customize
- ✅ Combine suggestions: "use elements from suggestion 2 and 3"
- ✅ Ask follow-up: "make those suggestions more creative"
- ⚠️ Suggestions are starting points - refine for your brand
- ❌ Don't expect perfect prompts - iteration is key

**Natural Language Examples:**

**Basic Request:**
- "Suggest prompts for software developer"
- "Give me banner ideas"
- "What should I create?"

**Specific Industry:**
- "Suggest prompts for healthcare technology"
- "Give me ideas for fintech startup"
- "What are good prompts for creative agencies?"

**Role-Based:**
- "Suggest prompts for a VP of Engineering"
- "Give me ideas for a freelance designer"
- "What's good for a career coach banner?"

**Workflow Example:**
1. Say: "Suggest prompts for a UX designer"
2. AI provides 5 suggestions:
   - "Minimalist workspace with design tools and user-centered elements"
   - "Abstract user journey flow with vibrant gradient colors"
   - "Clean interface mockups with professional blue tones"
   - etc.
3. Say: "Generate the second suggestion"
4. AI generates banner based on that idea
5. Result: Personalized banner inspired by AI suggestions

**Preview Mode:** ❌ No preview - conversational response

**Cost:** ~$0.01 per request (OpenAI credits for text generation)

**Pro Tip - Iterative Refinement:**
```
Say: "Suggest prompts for data scientist"
Review suggestions
Say: "Make those more creative and modern"
Review refined suggestions
Say: "Generate the first one with purple and blue colors"
Result: Personalized, refined banner concept
```

---

#### Write Enhanced Prompt

**Purpose:** Transform a basic or rough prompt into a professional, detailed, AI-optimized prompt and automatically insert it into the generation input field. Perfect for improving prompt quality without manual typing, ensuring better generation results.

**Example Phrases:**
- "Enhance this prompt: mountain landscape"
- "Make this prompt better: professional office"
- "Improve my prompt about technology"
- "Write an enhanced prompt for a creative background"
- "Optimize this prompt: modern design"
- "Make this more detailed: blue gradient"
- "Enhance the prompt: corporate professional"
- "Improve this: minimalist workspace"

**Parameters:**
- **Prompt:** Your basic prompt to enhance (required)
  - Can be simple or rough description
  - AI will expand and optimize it
- **Industry:** Optional industry context for enhancement
  - Helps AI add industry-specific details
- **Style:** Optional style preference
  - E.g., "modern", "minimalist", "creative", "corporate"

**What Happens:**
1. AI receives your basic prompt
2. Calls prompt enhancement service (Gemini/GPT)
3. Expands prompt with:
   - Professional terminology
   - LinkedIn banner optimization
   - Style and quality descriptors
   - Technical specifications
4. Writes enhanced prompt to generation input field
5. Returns confirmation with preview (first 100 chars)
6. Prompt is ready - just say "generate" or click generate button

**Expected Results:**
- Enhanced, detailed prompt in generation field
- Optimized for better AI image generation
- Professional language and terminology
- LinkedIn banner-specific guidance included
- **No Preview:** Writes directly to input field
- **Execution Time:** ~2-4 seconds
- **Confirmation:** Shows first 100 characters of enhanced prompt

**Common Use Cases:**

**Quick Idea to Detailed Prompt:**
- Say: "Enhance this prompt: blue background"
- Result: "A professional LinkedIn banner with sophisticated navy blue gradient background, smooth color transitions, modern corporate aesthetic, clean and polished, ultra-wide 4:1 aspect ratio, seamless professional design"

**Adding Professional Polish:**
- Say: "Make this prompt better: office space"
- Result: Enhanced with lighting, style, mood, professional descriptors

**Industry Optimization:**
- Say: "Enhance this for tech industry: modern background"
- Result: Prompt includes tech-specific elements, modern design language

**Style Enhancement:**
- Say: "Improve this with minimalist style: workspace"
- Result: Prompt emphasizes clean lines, negative space, simplicity

**Saving Typing Time:**
- Instead of typing long detailed prompts
- Speak simple idea, AI enhances it
- Ready to generate immediately

**Learning Prompt Engineering:**
- See how AI enhances your basic prompts
- Learn what makes effective prompts
- Improve your prompt-writing skills over time

**Tips:**
- ✅ Start with simple ideas - AI will expand them
- ✅ Mention key elements: colors, mood, style
- ✅ Specify industry for better context
- ✅ Review enhanced prompt before generating
- ✅ Can edit enhanced prompt manually if needed
- ⚠️ Very vague prompts may get generic enhancements
- ⚠️ Enhanced prompt overwrites existing input field
- ❌ Don't expect perfection - may need manual tweaks

**Natural Language Understanding:**

| You Say | AI Interprets |
|---------|--------------|
| "Enhance this prompt: sunset" | Enhance "sunset" for LinkedIn banner |
| "Make better: tech background" | Enhance "tech background" with tech-specific details |
| "Improve with modern style: office" | Enhance "office" emphasizing modern style |

**Workflow Examples:**

**Quick Enhancement:**
1. Say: "Enhance this prompt: gradient background"
2. AI enhances to: "A professional LinkedIn banner featuring a smooth gradient background with rich, sophisticated color transitions..."
3. Enhanced prompt appears in generation field
4. Say: "Generate that"
5. Result: High-quality banner from enhanced prompt

**Style-Specific Enhancement:**
1. Say: "Enhance this prompt with minimalist style: workspace"
2. AI adds minimalist descriptors: clean, simple, negative space, zen
3. Review enhanced prompt in field
4. Say: "Generate"
5. Result: Minimalist workspace banner

**Industry-Tailored Enhancement:**
1. Say: "Enhance this for finance industry: professional background"
2. AI adds finance-specific elements: trust, stability, sophistication
3. Enhanced prompt ready in field
4. Generate professional finance banner

**Learning Workflow:**
1. Say: "Enhance this prompt: modern design"
2. Review what AI added to make it better
3. Learn: AI added lighting, mood, technical specs
4. Next time: Use those elements in your own prompts

**Preview Mode:** ❌ No preview - writes directly to input field

**Cost:** ~$0.005-0.01 per enhancement (AI text generation)

**Important Notes:**
- **Overwrites Input:** Enhanced prompt replaces current input field content
- **Preview First:** Confirmation shows first 100 characters
- **Manual Editing:** Can edit enhanced prompt before generating
- **UI Integration:** Automatically populates the generation prompt field

**Pro Tip - Iterative Enhancement:**
```
Say: "Enhance this prompt: tech background"
Review enhanced version
Say: "Make that more creative and bold"
Review second enhancement
Say: "Generate that"
Result: Progressively refined, high-quality prompt
```

---

#### Analyze Image

**Purpose:** Get AI-powered creative suggestions for improving your current banner image. The AI analyzes the image and provides two types of suggestions: magic edit ideas (modifications to current image) and new generation ideas (fresh concepts inspired by current image). Perfect for when you like an image but want to explore variations or improvements.

**Example Phrases:**
- "Analyze this image"
- "What could I improve?"
- "Give me edit suggestions"
- "Analyze the current banner"
- "What changes would make this better?"
- "Give me creative ideas for this image"
- "Suggest improvements for this banner"
- "How can I enhance this design?"

**Parameters:**
- **Image URL:** URL of image to analyze (optional)
  - If not provided, uses current canvas image
  - Can analyze any uploaded or generated image

**What Happens:**
1. AI identifies image source (parameter or canvas)
2. Sends image to vision AI model (Gemini/GPT-4V)
3. AI analyzes:
   - Visual elements and composition
   - Color palette and mood
   - Style and aesthetic
   - Potential improvements
4. Generates two types of suggestions:
   - **Magic Edit Ideas:** Modifications to current image
   - **Generation Ideas:** New concepts inspired by image
5. Returns structured JSON in transcript
6. No changes applied - purely informational

**Expected Results:**
- Structured JSON with two arrays:
  ```json
  {
    "magicEditSuggestions": [
      "Make the background more vibrant with saturated colors",
      "Add a subtle gradient overlay for depth",
      "Adjust lighting to be warmer and more inviting"
    ],
    "generationIdeas": [
      "Similar composition with sunset color palette",
      "Abstract version with geometric shapes",
      "Minimalist interpretation with negative space"
    ]
  }
  ```
- 3-5 suggestions per category
- Actionable, specific ideas
- **No Preview:** Returns analysis data in transcript
- **No Changes:** Read-only analysis
- **Execution Time:** ~3-8 seconds

**Common Use Cases:**

**Exploring Variations:**
- You like current banner but want to see alternatives
- "Analyze this image" → Get variation ideas
- Generate new versions based on suggestions

**Improving Existing Design:**
- Current design is good but not perfect
- "What could I improve?" → Get enhancement ideas
- Use magic edit suggestions to refine

**Creative Brainstorming:**
- Starting point is solid, need more ideas
- "Give me creative ideas for this image"
- Explore different aesthetic directions

**Learning Design Principles:**
- Understand what makes images effective
- "Analyze the current banner"
- Learn from AI's professional perspective

**A/B Testing Ideas:**
- Want to create variations for testing
- "Suggest improvements for this banner"
- Generate multiple versions to compare

**Overcoming Design Block:**
- Like the image but stuck on next steps
- "Give me edit suggestions"
- Get professional direction to continue

**Tips:**
- ✅ Works best with clear, well-composed images
- ✅ Use suggestions as inspiration, not rules
- ✅ Combine multiple suggestions for unique results
- ✅ Try both magic edit and generation ideas
- ✅ Great for learning what makes designs effective
- ⚠️ Very abstract images may get generic suggestions
- ⚠️ Suggestions are creative ideas, not guaranteed improvements
- ❌ Doesn't automatically apply changes - you must execute

**Natural Language Understanding:**

| You Say | AI Interprets |
|---------|--------------|
| "Analyze this image" | Analyze current canvas image |
| "What could I improve?" | Analyze and suggest improvements |
| "Give me edit ideas" | Analyze for magic edit suggestions |
| "Suggest new concepts" | Analyze for generation ideas |

**Workflow Examples:**

**Variation Exploration:**
1. Say: "Generate a professional tech background"
2. Apply generated banner
3. Say: "Analyze this image"
4. Review suggestions:
   - Magic edit: "Add circuit board patterns", "Make colors cooler"
   - Generation: "Abstract version", "Minimalist interpretation"
5. Say: "Generate the abstract version"
6. Result: New variation based on analysis

**Iterative Improvement:**
1. Current banner on canvas
2. Say: "What could I improve?"
3. Review: "Make background more vibrant"
4. Say: "Make the background more vibrant" (magic edit)
5. Apply improvement
6. Say: "Analyze this image" again
7. Iterate until satisfied

**Learning Workflow:**
1. Say: "Analyze the current banner"
2. Study suggestions - understand what works
3. Apply lessons: "Add gradient overlay"
4. See improvement
5. Learn design principles through iteration

**A/B Test Creation:**
1. Current banner: Blue professional background
2. Say: "Give me creative ideas for this image"
3. Get 5 generation ideas
4. Generate each one: "Generate idea 1", "Generate idea 2"
5. Result: 5 variations for testing

**Preview Mode:** ❌ No preview - returns analysis data

**Cost:** ~$0.01-0.02 per analysis (AI vision + text generation)

**Output Format:**
```json
{
  "magicEditSuggestions": [
    "Specific, actionable edit idea",
    "Another modification suggestion",
    "Third enhancement idea"
  ],
  "generationIdeas": [
    "New concept inspired by image",
    "Alternative aesthetic direction",
    "Creative variation idea"
  ]
}
```

**Important Notes:**
- **Read-Only:** Doesn't change canvas, just provides suggestions
- **JSON Format:** Results formatted for readability
- **Vision AI:** Uses advanced AI vision models for analysis
- **Context Aware:** Understands LinkedIn banner requirements
- **Inspiration Tool:** Suggestions are creative springboards

**Pro Tip - Full Workflow:**
```
1. Generate initial banner
2. Say: "Analyze this image"
3. Review magic edit suggestions
4. Say: "Apply suggestion 1" (via magic edit)
5. Say: "Analyze this image" again
6. Review generation ideas
7. Say: "Generate idea 2"
8. Compare versions, choose best
Total: Fully AI-assisted design refinement
```

---

#### Analyze Banner

**Purpose:** Get comprehensive professional feedback on your LinkedIn banner design. The AI acts as a professional designer, analyzing composition, color scheme, typography, visual hierarchy, and overall professional appeal. Perfect for final quality checks, learning design principles, or getting expert-level critique without hiring a designer.

**Example Phrases:**
- "Analyze my banner"
- "How can I improve this design?"
- "Give me professional feedback"
- "What do you think of this banner?"
- "Review my banner design"
- "Is this banner professional enough?"
- "Give me design critique"
- "What should I change about this banner?"

**Parameters:**
- None (always analyzes current canvas image)

**What Happens:**
1. AI retrieves current banner from canvas
2. Sends to vision AI for comprehensive analysis
3. AI evaluates multiple dimensions:
   - **Composition:** Layout, balance, visual flow
   - **Color Scheme:** Palette, contrast, professional appeal
   - **Typography:** Text readability, font choices, hierarchy
   - **Visual Hierarchy:** What draws attention, focal points
   - **Professional Appeal:** LinkedIn appropriateness, industry fit
   - **Brand Consistency:** Cohesiveness, polish, professionalism
4. Generates structured feedback with specific suggestions
5. Returns detailed JSON analysis in transcript
6. No changes applied - purely advisory

**Expected Results:**
- Comprehensive analysis in JSON format:
  ```json
  {
    "composition": "Well-balanced with clear focal point...",
    "colorScheme": "Professional blue palette creates trust...",
    "typography": "Font is readable but could be larger...",
    "professionalAppeal": "Strong corporate aesthetic...",
    "suggestions": [
      "Increase text size for better mobile readability",
      "Add subtle texture to avoid flat appearance",
      "Consider warmer accent color for approachability"
    ],
    "overallRating": "8/10 - Strong professional banner",
    "strengths": ["Clear hierarchy", "Professional colors"],
    "improvements": ["Text contrast", "Visual interest"]
  }
  ```
- Professional, actionable feedback
- Specific improvement suggestions
- Strengths highlighted
- **No Preview:** Returns analysis data in transcript
- **No Changes:** Advisory only
- **Execution Time:** ~5-10 seconds

**Common Use Cases:**

**Final Quality Check:**
- Banner complete, need professional validation
- "Analyze my banner" before publishing
- Ensure professional quality

**Learning Design Principles:**
- Understand what makes effective banners
- "Give me professional feedback"
- Learn from expert-level critique

**Pre-Launch Review:**
- About to update LinkedIn banner
- "Is this banner professional enough?"
- Get final approval or adjustments

**Comparing Versions:**
- Created multiple banner versions
- Analyze each: "Analyze my banner"
- Switch versions, analyze again
- Choose best based on feedback

**Client Presentations:**
- Creating banner for client
- "Review my banner design"
- Professional critique before delivery

**Skill Development:**
- Improve design skills over time
- Regular analysis on your creations
- Learn from AI feedback patterns

**Tips:**
- ✅ Use before publishing to LinkedIn
- ✅ Pay attention to "suggestions" array - most actionable
- ✅ Compare analysis across different versions
- ✅ Focus on "improvements" for quick wins
- ✅ Use "strengths" to understand what works
- ⚠️ Feedback is opinion-based, not absolute truth
- ⚠️ LinkedIn context assumed - may not fit other platforms
- ❌ Don't blindly follow all suggestions - use judgment

**Natural Language Understanding:**

| You Say | AI Interprets |
|---------|--------------|
| "Analyze my banner" | Comprehensive banner analysis |
| "How can I improve this?" | Analysis focused on improvements |
| "Give me feedback" | Professional design critique |
| "Is this good enough?" | Quality assessment |

**Workflow Examples:**

**Pre-Publish Quality Check:**
1. Complete banner design on canvas
2. Say: "Analyze my banner"
3. Review feedback:
   - Composition: ✅ Strong
   - Typography: ⚠️ Text too small
   - Suggestions: Increase font size to 64px
4. Say: "Update text element to font size 64"
5. Say: "Analyze my banner" again
6. Confirm: Improvements reflected
7. Publish to LinkedIn with confidence

**Version Comparison:**
1. Banner Version A on canvas
2. Say: "Analyze my banner"
3. Note: "Overall rating: 7/10"
4. Switch to Version B
5. Say: "Analyze my banner"
6. Note: "Overall rating: 8.5/10"
7. Choose Version B based on analysis

**Learning Workflow:**
1. Create banner as beginner
2. Say: "Give me professional feedback"
3. Study analysis thoroughly:
   - Learn: "Text needs more contrast"
   - Learn: "Color palette too busy"
   - Learn: "Composition off-balance"
4. Apply lessons to next design
5. Repeat - improve skills over time

**Client Approval Workflow:**
1. Design banner for client
2. Say: "Review my banner design"
3. Review analysis - fix issues
4. Present to client with AI feedback
5. "AI analysis rated 9/10" - builds confidence

**Preview Mode:** ❌ No preview - returns analysis data

**Cost:** ~$0.02-0.03 per analysis (AI vision + detailed text generation)

**Analysis Dimensions:**

| Dimension | What AI Evaluates |
|-----------|------------------|
| **Composition** | Layout balance, visual flow, focal points |
| **Color Scheme** | Palette harmony, professional appeal, contrast |
| **Typography** | Readability, hierarchy, font appropriateness |
| **Visual Hierarchy** | Eye flow, emphasis, information structure |
| **Professional Appeal** | LinkedIn fit, industry appropriateness, polish |
| **Brand Consistency** | Cohesiveness, style unity, intentionality |

**Output Format:**
```json
{
  "composition": "Detailed composition analysis...",
  "colorScheme": "Color palette feedback...",
  "typography": "Typography evaluation...",
  "professionalAppeal": "Professional quality assessment...",
  "suggestions": ["Specific improvement 1", "Improvement 2", "..."],
  "overallRating": "X/10 - Brief summary",
  "strengths": ["What works well"],
  "improvements": ["What to enhance"]
}
```

**Important Notes:**
- **Expert-Level Feedback:** Professional designer perspective
- **LinkedIn Context:** Analysis optimized for LinkedIn banners
- **Comprehensive:** Covers all major design dimensions
- **Actionable:** Specific, implementable suggestions
- **Educational:** Learn design principles through feedback
- **Non-Destructive:** Read-only analysis, no changes applied

**Pro Tip - Iterative Refinement:**
```
1. Create initial banner
2. Say: "Analyze my banner"
3. Review "suggestions" array
4. Implement top 3 suggestions via voice/manual
5. Say: "Analyze my banner" again
6. Compare ratings: 7/10 → 9/10
7. Publish refined, validated banner
Total: Professional quality through AI-guided iteration
```

---

## Understanding Preview Mode

### What is Preview Mode?

Preview mode lets you **see results before applying them to your canvas**. This prevents accidental changes and gives you control over voice-generated content.

### Commands That Use Preview

**Image Operations (5 commands):**
1. Generate Background
2. Magic Edit
3. Upscale Image
4. Restore Image
5. Enhance Face

These commands show a preview panel with:
- Tool icon and name
- Your original request
- Preview image
- "Apply" and "Reject" buttons

### Commands That Auto-Execute

**Immediate Actions (12 commands):**
- Canvas manipulation (add/update/delete text, list elements)
- Navigation (navigate to tab)
- History (undo, redo)
- AI analysis (suggest prompts, write enhanced prompt, analyze image/banner)

These commands execute immediately because:
- They're easily reversible (undo/redo)
- They don't generate expensive API calls
- They provide immediate feedback
- Previews wouldn't add value

### The Approval Workflow

**Step 1: Command Received**
```
You: "Generate a mountain landscape"
Nano: "I'll generate that for you..."
```

**Step 2: Processing**
```
[Executing icon appears in transcript]
Tool: Generate Background
Status: Processing... (~15 seconds)
```

**Step 3: Preview Ready**
```
⚡ Action Preview

Generate Background
"Mountain landscape with sunset"

[Preview Image Shows Here]

[✓ Apply] [✗ Reject]
```

**Step 4: Your Decision**

**Option A: Apply**
- Click "✓ Apply"
- Image updates canvas background
- Preview panel disappears
- Ready for next command

**Option B: Reject**
- Click "✗ Reject"
- Preview discarded
- Canvas unchanged
- Ready to try again

### Why Preview Mode Matters

**Prevents Mistakes**
- Voice commands can be misinterpreted
- AI might not generate exactly what you wanted
- Easy to see before committing

**Saves Time**
- No need to undo unwanted changes
- Compare before/after easily
- Iterate faster with reject/retry

**Saves Money**
- Avoid re-generating rejected results
- See quality before committing
- Make informed decisions

### Preview Mode Best Practices

1. **Review Carefully:** Always check preview before applying
2. **Speak Clearly:** Better recognition = better results = less rejects
3. **Be Specific:** Detailed prompts get better first-try results
4. **Use Iteration:** Reject and refine your prompt if needed
5. **Trust Your Judgment:** You have final control

## Browser Compatibility

### Fully Supported ✅

**Google Chrome 89+ (Desktop & Android)**
- Best experience
- All features work perfectly
- Low latency audio
- Recommended for voice agent

**Microsoft Edge 89+ (Chromium-based)**
- Same engine as Chrome
- Full feature parity
- Recommended for Windows users
- Best alternative to Chrome

### Partial Support ⚠️

**Firefox (Latest Version)**
- WebSocket: ✅ Works
- Voice Agent: ✅ Works
- Audio: ⚠️ May have occasional glitches
- Recommendation: Use Chrome/Edge for best experience

**Safari 14.5+ (macOS)**
- WebSocket: ✅ Works
- Voice Agent: ⚠️ Works with limitations
- Audio: ⚠️ May have latency issues
- Webkit prefix required (handled automatically)
- Recommendation: Use Chrome/Edge if possible

**Safari (iOS)**
- WebSocket: ⚠️ Limited
- Voice Agent: ❌ Not recommended
- Microphone: ⚠️ Restricted in some contexts
- Recommendation: Use iPad with Chrome or desktop

### Not Supported ❌

**Internet Explorer (All Versions)**
- Missing WebSocket support
- Missing Web Audio API
- Missing MediaDevices API
- App displays incompatibility message

**Older Browsers**
- Chrome < 89
- Edge (legacy, non-Chromium)
- Firefox < 85
- Safari < 14.5

### Browser Compatibility Table

| Browser | Voice Agent | Audio Quality | Recommendation |
|---------|-------------|---------------|----------------|
| Chrome 89+ | ✅ Full | ⭐⭐⭐⭐⭐ | **Recommended** |
| Edge 89+ | ✅ Full | ⭐⭐⭐⭐⭐ | **Recommended** |
| Firefox | ⚠️ Works | ⭐⭐⭐⭐ | Compatible |
| Safari (macOS) | ⚠️ Works | ⭐⭐⭐ | Use if needed |
| Safari (iOS) | ❌ Limited | ⭐⭐ | Not recommended |
| IE | ❌ No | - | Not supported |

### Required Browser Features

Voice agent requires these browser APIs:

```javascript
// Feature detection (automatic in app)
const isSupported = !!(
  window.WebSocket &&                          // Real-time communication
  (window.AudioContext ||                      // Audio processing
   window.webkitAudioContext) &&               // Safari fallback
  navigator.mediaDevices &&                    // Device access
  navigator.mediaDevices.getUserMedia          // Microphone
);
```

If your browser lacks any of these, voice features won't work.

### Troubleshooting Browser Issues

**"Voice agent not available"**
- Try Chrome or Edge (latest version)
- Update your browser to latest version
- Check browser console for specific error

**Audio choppy or glitchy**
- Switch to Chrome/Edge for better performance
- Close other tabs using microphone
- Check CPU usage (close heavy apps)

**Microphone permission not working**
- Try Chrome/Edge (better permission handling)
- Check browser settings → Site settings → Microphone
- On iOS: Use desktop browser instead

## Cost Awareness

### How Voice Agent Uses Credits

Voice agent uses **OpenAI Realtime API** which charges for:

**Audio Input**
- Your speech streamed to OpenAI
- Charged per minute of audio input
- Continuous while connected

**Audio Output**
- AI voice responses
- Charged per minute of audio output
- Includes AI speech

**Text Processing**
- Tool calls and responses
- Standard GPT-4 token pricing
- Much cheaper than audio

### Typical Costs

**Per Session Estimates:**

| Session Type | Duration | Audio In | Audio Out | Est. Cost |
|--------------|----------|----------|-----------|-----------|
| Quick command | 1 minute | 1 min | 30 sec | ~$0.05-0.10 |
| Design session | 5 minutes | 5 min | 2 min | ~$0.25-0.50 |
| Extended work | 15 minutes | 15 min | 5 min | ~$0.75-1.50 |

**Note:** Actual costs depend on OpenAI's current pricing. Check [OpenAI Pricing](https://openai.com/api/pricing/) for latest rates.

### Additional Costs

Voice commands may trigger other paid services:

**Image Generation** (via Gemini/OpenRouter)
- Generate Background: $0.02-0.05 per image
- Uses your configured image generation model

**Image Processing** (via Replicate)
- Upscale: $0.0025-0.12 depending on quality
- Remove Background: $0.002 per operation
- Restore: $0.01 per operation
- Face Enhance: $0.008 per operation

**Total command cost** = Voice API + Action API

Example: "Generate a professional background and upscale it"
- Voice session: ~$0.05
- Generate background: ~$0.03
- Upscale (balanced): ~$0.01
- **Total: ~$0.09**

### Monitoring Your Usage

**OpenAI Dashboard**
1. Visit [platform.openai.com/usage](https://platform.openai.com/usage)
2. View daily/monthly usage
3. Check costs by API type
4. Set up budget alerts

**Best Practices for Monitoring:**
- Check usage weekly
- Set budget alerts
- Review unexpected spikes
- Track costs by project

### Cost Optimization Tips

**1. Disconnect When Not Using**
```
Connected but idle = still using credits
Solution: Click "Disconnect" between tasks
```

**2. Use Text When Possible**
```
Simple edits: Use UI buttons instead of voice
Voice: Reserve for complex workflows
```

**3. Batch Commands**
```
Instead of: "Add text" [wait] "Now upscale" [wait] "Remove background"
Better: "Add the text 'John Smith', then upscale the image and remove the background"
```

**4. Choose Appropriate Quality**
```
Upscale quality tiers:
- Fast: $0.0025 (drafts)
- Balanced: $0.01 (most uses)
- Best: $0.12 (final only)
```

**5. Preview Before Generating**
```
Use "suggest prompts" or "analyze" to plan before generating
Reduces rejected/re-generated images
```

### Setting Spending Limits

**OpenAI Account Settings:**
1. Go to [platform.openai.com/settings/organization/billing](https://platform.openai.com/settings/organization/billing)
2. Click "Usage limits"
3. Set hard or soft limits
4. Enable email alerts

**Recommended Limits for Beginners:**
- Soft limit: $10/month
- Hard limit: $20/month
- Alert threshold: $5

### Free Credits & Trials

**OpenAI:**
- New accounts: Check for trial credits
- Subject to change - check OpenAI website

**Replicate:**
- $5 free credits with billing added
- Covers 200-2500 operations

**OpenRouter:**
- Generous free tier for image generation
- Alternative to reduce costs

## Privacy & Security

### What Data is Collected

**Audio Data:**
- Your speech is streamed to OpenAI servers in real-time
- Processed for speech recognition and AI response
- Not stored locally in Nanobanna Pro
- OpenAI's data retention policy applies

**Transcripts:**
- Conversation stored in browser memory (React state)
- Cleared when you refresh the page
- Never saved to database
- Not persisted between sessions

**Canvas Changes:**
- Design changes made via voice are saved like manual edits
- Saved to your Supabase account (if authenticated)
- Standard canvas save/load behavior

**API Keys:**
- Stored in Supabase database (encrypted)
- Retrieved securely via backend API
- Never logged in browser console
- Transmitted over encrypted connection (WSS)

### OpenAI Data Privacy

**What OpenAI Does:**
- Processes audio for speech-to-text (Whisper)
- Generates AI responses (GPT-4o Realtime)
- May use for model improvement (per their policy)

**What OpenAI Doesn't Do (per their policy):**
- Use API data for training by default (if zero retention enabled)
- Share with third parties without consent
- Store indefinitely (retention policies apply)

**Your Rights:**
- Review OpenAI's [Privacy Policy](https://openai.com/policies/privacy-policy)
- Enable zero retention (Enterprise accounts)
- Delete your data (contact OpenAI support)

### Microphone Security

**Browser Permission Model:**
- Browser controls microphone access (not the app)
- You must grant permission explicitly
- Can revoke permission anytime
- Microphone indicator visible when active

**Microphone Release:**
- Released when you click "Disconnect"
- Released when you close the tab
- Released when you revoke permission
- Indicator disappears when released

**Best Practices:**
- Only connect when actively using voice
- Disconnect when finished
- Check for microphone indicator (red dot/icon)
- Revoke permission if suspicious activity

### API Key Security

**How Keys Are Stored:**
- Backend database (Neon PostgreSQL)
- Encrypted at rest
- Per-user Row Level Security (RLS)
- Requires authentication to retrieve

**How Keys Are Used:**
- Retrieved via authenticated API call
- Sent in WebSocket connection header
- Encrypted transmission (WSS = TLS/SSL)
- Not exposed in client-side code

**Best Practices:**
1. **Never share your API key** with anyone
2. **Rotate keys if exposed** (generate new at OpenAI)
3. **Monitor usage** for unexpected activity
4. **Use account-specific keys** (not organization master key)

### Data Transmission Security

**WebSocket Security:**
- Uses WSS (WebSocket Secure = TLS/SSL)
- Encrypted end-to-end
- Same security as HTTPS
- Prevents eavesdropping

**Audio Encryption:**
- Audio data base64-encoded
- Transmitted over encrypted WSS
- Not interceptable in transit
- Decoded only by OpenAI servers

### Privacy Recommendations

**For Sensitive Work:**
- Avoid speaking confidential information
- Use text input for private data
- Remember: audio sent to OpenAI servers
- Review OpenAI's enterprise options for enhanced privacy

**For General Use:**
- Voice agent is safe for typical design work
- Standard privacy expectations apply
- Same level of privacy as ChatGPT voice
- Suitable for professional LinkedIn banners

## Troubleshooting

### Connection Issues

#### "API key not found"

**Cause:** No OpenAI API key configured

**Solutions:**
1. Open Settings (⚙️ icon)
2. Find "Voice Agent API Key" section
3. Paste your OpenAI API key (starts with `sk-`)
4. Click "Save Settings"
5. Try connecting again

**Alternative:** Add to `.env.local`:
```bash
VITE_OPENAI_API_KEY=sk-your_key_here
```

---

#### "Connection failed" or "WebSocket error"

**Causes:**
- Invalid API key
- Network connectivity issue
- OpenAI service outage
- Firewall blocking WebSocket

**Solutions:**
1. **Verify API key:**
   - Check it's copied correctly (no extra spaces)
   - Ensure it's a valid OpenAI key (starts with `sk-`)
   - Generate new key if needed

2. **Check network:**
   - Ensure stable internet connection
   - Try refreshing the page
   - Disable VPN if active
   - Check firewall settings

3. **Check OpenAI status:**
   - Visit [status.openai.com](https://status.openai.com)
   - Look for Realtime API issues
   - Wait if service degraded

4. **Browser issues:**
   - Try Chrome or Edge
   - Clear browser cache
   - Disable extensions temporarily

---

### Microphone Issues

#### "Microphone access denied"

**Cause:** Browser permission not granted

**Solutions:**

**Chrome/Edge:**
1. Click lock icon in address bar
2. Find "Microphone" permission
3. Change to "Allow"
4. Refresh page
5. Click "Connect" again

**Firefox:**
1. Click lock/info icon in address bar
2. Click "Connection Secure" → "More Information"
3. Go to "Permissions" tab
4. Find "Use the Microphone"
5. Uncheck "Use default" and select "Allow"
6. Refresh and reconnect

**Safari:**
1. Safari → Settings for This Website
2. Find "Microphone"
3. Change to "Allow"
4. Refresh and reconnect

---

#### "No audio input detected"

**Causes:**
- Wrong microphone selected
- Microphone muted
- Hardware issue
- System permissions (macOS/Windows)

**Solutions:**

1. **Check microphone selection:**
   - System settings → Sound → Input
   - Verify correct device selected
   - Test microphone in other apps

2. **Check mute status:**
   - Look for mute button on headset
   - Check system volume mixer
   - Ensure input not muted

3. **System permissions (macOS):**
   - System Preferences → Security & Privacy → Privacy
   - Select "Microphone"
   - Enable Chrome/Edge/Firefox

4. **System permissions (Windows):**
   - Settings → Privacy → Microphone
   - Enable "Allow apps to access microphone"
   - Enable for your browser

---

### Audio Issues

#### "No audio output from AI"

**Causes:**
- Speakers/headphones muted
- Wrong output device
- Browser audio blocked
- Connection issue

**Solutions:**

1. **Check volume:**
   - System volume > 0
   - Browser tab not muted (check tab icon)
   - Headphones plugged in properly

2. **Check output device:**
   - System settings → Sound → Output
   - Select correct speakers/headphones
   - Test with other apps

3. **Browser audio:**
   - Right-click browser tab
   - Ensure "Unmute tab" not shown
   - Check browser volume mixer

4. **Reconnect:**
   - Disconnect voice agent
   - Check audio works in other apps
   - Reconnect voice agent

---

#### "Audio choppy or laggy"

**Causes:**
- Poor internet connection
- High CPU usage
- Many browser tabs open
- Browser performance

**Solutions:**

1. **Check connection:**
   - Use WiFi instead of cellular
   - Close bandwidth-heavy apps
   - Test internet speed

2. **Reduce CPU load:**
   - Close unnecessary tabs
   - Close heavy applications
   - Restart browser

3. **Browser optimization:**
   - Use Chrome or Edge (best performance)
   - Update to latest version
   - Clear cache and cookies

4. **Audio settings:**
   - Use wired headphones (lower latency)
   - Disconnect and reconnect
   - Try different microphone

---

### Command Execution Issues

#### "AI doesn't understand my command"

**Causes:**
- Unclear speech
- Background noise
- Unsupported command
- Ambiguous request

**Solutions:**

1. **Speak clearly:**
   - Pause briefly between words
   - Speak at normal pace (not too fast)
   - Use quiet environment

2. **Be specific:**
   - Instead of: "Change it"
   - Say: "Change the background to blue"

3. **Check transcript:**
   - See what AI heard in transcript
   - Rephrase if misunderstood

4. **Use supported commands:**
   - Review [Available Voice Commands](#available-voice-commands)
   - Check [VOICE_COMMANDS_REFERENCE.md](./VOICE_COMMANDS_REFERENCE.md)

---

#### "Command executes but fails"

**Causes:**
- Missing dependencies (no image, no API key)
- Service API error
- Invalid parameters
- Network timeout

**Solutions:**

1. **Check error message:**
   - Look in preview panel for error
   - Check browser console (F12)
   - Read error message carefully

2. **Common fixes:**
   - "No image available": Generate/upload background first
   - "API key not found": Configure Replicate/Gemini keys
   - "Service error": Wait and retry
   - "Timeout": Try smaller image or faster quality

3. **Report persistent errors:**
   - Note exact command spoken
   - Screenshot error message
   - Report on GitHub Issues

---

### Preview Issues

#### "Preview not showing"

**Causes:**
- Command doesn't use preview
- Execution still in progress
- JavaScript error

**Solutions:**

1. **Check command type:**
   - Only 5 commands use preview (see [Understanding Preview Mode](#understanding-preview-mode))
   - Canvas commands execute immediately

2. **Wait for completion:**
   - Image generation: ~15 seconds
   - Upscaling: 5-15 seconds depending on quality
   - Check transcript for "processing" message

3. **If stuck:**
   - Refresh the page
   - Check browser console for errors
   - Reconnect and try again

---

#### "Can't click Apply or Reject"

**Causes:**
- Buttons disabled during execution
- JavaScript error
- Preview panel not focused

**Solutions:**

1. **Wait for ready state:**
   - Buttons disabled while applying
   - Look for spinner/loading state
   - Wait for enabled state

2. **Click in panel:**
   - Ensure preview panel visible
   - Scroll to preview if needed
   - Try clicking button again

3. **Refresh if stuck:**
   - Disconnect voice agent
   - Refresh page
   - Reconnect and retry command

---

### Performance Issues

#### "Voice agent slowing down my browser"

**Causes:**
- Memory leak
- Many open sessions
- Long transcript history

**Solutions:**

1. **Disconnect when idle:**
   - Don't leave connected if not using
   - Releases audio resources
   - Frees memory

2. **Clear transcript:**
   - Long conversations use memory
   - Disconnect to clear
   - Refresh page periodically

3. **Close other tabs:**
   - Each tab uses resources
   - Close unnecessary tabs
   - Restart browser if needed

---

#### "High battery drain (mobile)"

**Causes:**
- Continuous audio streaming
- Screen on
- Cellular data
- Processing overhead

**Solutions:**

1. **Use WiFi:**
   - Cellular uses more power
   - Switch to WiFi for sessions

2. **Disconnect when idle:**
   - Voice agent uses battery continuously
   - Disconnect between tasks

3. **Optimize sessions:**
   - Plan commands before connecting
   - Batch multiple commands
   - Disconnect promptly

4. **Use desktop:**
   - Voice agent designed for desktop use
   - Mobile: use for quick tasks only

---

## Best Practices

### Speaking Tips

**1. Speak Clearly and Naturally**
```
✅ Good: "Generate a professional background with blue gradient"
❌ Avoid: "Gen prof back blue grad" (too abbreviated)
```

**2. Use Complete Sentences**
```
✅ Good: "Add the text 'Senior Developer' to the canvas"
❌ Avoid: "Add text... uh... Senior Developer" (pauses confuse AI)
```

**3. Wait for AI Response**
```
✅ Good: Command → Wait for response → Next command
❌ Avoid: Command → Immediate next command (AI still processing)
```

**4. Check Transcript**
```
✅ Good: Glance at transcript to confirm AI heard correctly
❌ Avoid: Assuming AI understood without checking
```

### Effective Prompting

**1. Be Specific**
```
❌ Vague: "Make it better"
✅ Specific: "Make the background more professional with muted colors"
```

**2. Include Context**
```
❌ Unclear: "Change it to modern"
✅ Clear: "Change the background to a modern minimalist design with geometric shapes"
```

**3. Specify Quality When Upscaling**
```
❌ Unclear: "Upscale the image"
✅ Clear: "Upscale the image to balanced quality"
```

**4. Name Elements for Updates**
```
❌ Unclear: "Make it bigger"
✅ Clear: "Make the text element larger"
```

### Workflow Optimization

**1. Plan Before Connecting**
```
Before connecting, know what you want:
- Background style
- Text content
- Enhancements needed

Then connect and execute efficiently
```

**2. Batch Similar Commands**
```
✅ Good: "Add text 'John Smith', then add text 'Web Developer' below it"
❌ Inefficient: "Add text" [wait] [approve] "Add more text" [wait] [approve]
```

**3. Use Preview Wisely**
```
- Review every preview before applying
- Reject if not quite right
- Refine prompt and try again
```

**4. Disconnect Promptly**
```
✅ Good: Complete task → Disconnect → Switch to manual editing
❌ Wasteful: Stay connected while manually editing
```

### Cost Optimization

**1. Use Voice for Complex Tasks**
```
Voice agent best for:
- Multi-step workflows
- Image generation with specific requirements
- Exploring design ideas
- Batch operations

Use UI for:
- Simple clicks
- Single button actions
- Precise positioning
```

**2. Choose Appropriate Quality**
```
Fast upscale ($0.0025):
- Drafts and previews
- Quick iterations
- Web-only content

Balanced upscale ($0.01):
- Most final designs
- LinkedIn banners
- Social media

Best upscale ($0.12):
- Client deliverables only
- Print materials
- Portfolio pieces
```

**3. Monitor Usage**
```
Weekly routine:
1. Check OpenAI usage dashboard
2. Review costs by API
3. Adjust usage if over budget
4. Set alerts for next month
```

### Quality Best Practices

**1. Start with Good Prompts**
```
Use "suggest prompts" or "write enhanced prompt" to improve quality
Better prompt = better first result = less regeneration
```

**2. Iterate with Reject**
```
If preview not quite right:
1. Click "Reject"
2. Refine your description
3. Try again with improved prompt
Better than applying and undoing
```

**3. Use Analysis Tools**
```
"Analyze my banner" provides professional feedback
Use suggestions to improve design
Learn what makes effective banners
```

**4. Combine Voice and Manual**
```
Use voice for:
- Initial generation
- Major changes
- Bulk operations

Use manual for:
- Fine-tuning positions
- Color adjustments
- Precise edits
```

### Security Best Practices

**1. Protect Your API Key**
```
✅ Do:
- Store in Settings (encrypted)
- Rotate if exposed
- Use account-specific keys

❌ Don't:
- Share with others
- Commit to git
- Post in screenshots
```

**2. Disconnect When Done**
```
✅ Do:
- Disconnect after tasks
- Release microphone
- Stop using credits

❌ Don't:
- Leave connected idle
- Keep mic active unnecessarily
```

**3. Review Transcripts**
```
Before sharing screenshots:
- Check transcript for sensitive info
- Clear transcript if needed
- Remember: transcripts not saved
```

## Related Documentation

### User Guides
- **[VOICE_COMMANDS_REFERENCE.md](./VOICE_COMMANDS_REFERENCE.md)** - Quick reference of all 17 commands
- **[VOICE_COMMANDS_CHEATSHEET.md](./docs/VOICE_COMMANDS_CHEATSHEET.md)** - Printable cheat sheet
- **[REPLICATE_MODELS.md](./REPLICATE_MODELS.md)** - Image processing models
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Complete settings guide

### Technical Documentation
- **[VOICE_AGENT_TECHNICAL.md](./docs/VOICE_AGENT_TECHNICAL.md)** - Developer documentation
- **[CLAUDE.md](./CLAUDE.md)** - Architecture overview
- **[README.md](./README.md)** - Project overview

### External Resources
- **[OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime)** - Official API docs
- **[OpenAI Pricing](https://openai.com/api/pricing/)** - Current pricing
- **[OpenAI Usage Dashboard](https://platform.openai.com/usage)** - Monitor usage
- **[OpenAI API Keys](https://platform.openai.com/api-keys)** - Manage keys

## Support

### Getting Help

**App Issues:**
- [GitHub Issues](https://github.com/yourusername/nanobanna-pro/issues) - Report bugs
- Check browser console (F12) for error details
- Include screenshots and steps to reproduce

**OpenAI API:**
- [OpenAI Help Center](https://help.openai.com)
- support@openai.com
- [Community Forum](https://community.openai.com)

**General Questions:**
- Review this guide thoroughly
- Check troubleshooting section
- Search GitHub Issues for similar problems

### Common Support Questions

**Q: Is voice agent free?**
A: No, it uses OpenAI Realtime API which has per-minute costs. See [Cost Awareness](#cost-awareness).

**Q: Which browser works best?**
A: Chrome 89+ or Edge 89+ for best experience. See [Browser Compatibility](#browser-compatibility).

**Q: Can I use my own OpenAI key?**
A: Yes! Configure your personal OpenAI API key in Settings. Required for voice features.

**Q: Why do some commands need approval?**
A: Preview mode lets you see expensive operations (image generation/enhancement) before applying. See [Understanding Preview Mode](#understanding-preview-mode).

**Q: How do I reduce costs?**
A: Disconnect when idle, use appropriate quality tiers, batch commands. See [Cost Optimization Tips](#cost-optimization-tips).

---

**Last Updated:** January 2025
**App Version:** 2.0
**Voice Agent Status:** ✅ Production Ready
**Document Version:** 1.0
