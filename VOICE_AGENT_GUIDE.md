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

**Generate Background**

Create a LinkedIn banner background from description.

**Example phrases:**
- "Generate a professional office background"
- "Create a gradient background in blue and purple"
- "Make a minimalist background with geometric shapes"

**What happens:**
- AI generates 1584x396 LinkedIn banner
- Shows preview (~15 seconds)
- Apply to set as canvas background

---

### Image Processing (5 commands)

**Magic Edit**

Edit existing images using AI-powered inpainting.

**Example phrases:**
- "Change the background to a sunset"
- "Make it more modern and minimalist"
- "Add mountains in the background"

**What happens:**
- Uses current canvas image
- Applies AI edits based on description
- Shows preview for approval

---

**Remove Background**

Remove background from images, creating transparent PNG.

**Example phrases:**
- "Remove the background"
- "Remove background from current image"
- "Make the background transparent"

**What happens:**
- Processes current canvas image
- Returns transparent PNG
- Result appears in preview

---

**Upscale Image**

Enhance image resolution using AI upscaling.

**Example phrases:**
- "Upscale the current image"
- "Upscale to best quality"
- "Make the image higher resolution"

**What happens:**
- Upscales 2x resolution
- Quality tier: fast/balanced/best
- Shows preview for approval

---

**Restore Image**

Restore old or damaged photos.

**Example phrases:**
- "Restore this image"
- "Fix the quality of this photo"
- "Enhance this old photo"

**What happens:**
- Fixes artifacts, blur, noise
- Improves clarity and color
- Shows restored preview

---

**Enhance Face**

Improve facial features in portraits.

**Example phrases:**
- "Enhance the face"
- "Improve the portrait quality"
- "Make the face clearer"

**What happens:**
- Enhances facial details
- Improves skin texture
- Shows enhanced preview

---

### Canvas Manipulation (4 commands)

**Add Text Element**

Add text to the canvas.

**Example phrases:**
- "Add the text 'John Smith'"
- "Add my name to the canvas"
- "Put 'Web Developer' in the center"

**What happens:**
- Creates text element
- Default: center position, white color, 48px
- Applied immediately (no preview)

---

**Update Element**

Modify existing canvas elements.

**Example phrases:**
- "Make the text larger"
- "Change the color to blue"
- "Move the text to the top"

**What happens:**
- Updates specified element properties
- Applied immediately
- Confirm in transcript

---

**Delete Element**

Remove elements from canvas.

**Example phrases:**
- "Delete the text element"
- "Remove that element"
- "Delete element text-123"

**What happens:**
- Removes element by ID
- Applied immediately
- Can undo if needed

---

**List Elements**

Show all canvas elements.

**Example phrases:**
- "List all elements"
- "What's on the canvas?"
- "Show me the current elements"

**What happens:**
- Returns JSON list of elements
- Shows IDs, types, positions
- Useful for finding element IDs

---

### Navigation (1 command)

**Navigate to Tab**

Switch between application tabs.

**Example phrases:**
- "Go to the gallery"
- "Navigate to studio"
- "Switch to brainstorm tab"

**What happens:**
- Changes active tab
- Applied immediately
- Tab names: studio, gallery, brainstorm

---

### History Management (2 commands)

**Undo Action**

Undo the last canvas change.

**Example phrases:**
- "Undo that"
- "Go back"
- "Undo the last change"

**What happens:**
- Reverts last canvas action
- Applied immediately
- Can redo if needed

---

**Redo Action**

Redo a previously undone action.

**Example phrases:**
- "Redo that"
- "Bring it back"
- "Redo the last change"

**What happens:**
- Re-applies undone action
- Applied immediately

---

### AI Analysis (4 commands)

**Suggest Prompts**

Get creative prompt ideas for your industry/role.

**Example phrases:**
- "Suggest prompts for a software developer"
- "Give me ideas for a marketing banner"
- "Suggest prompts for the tech industry"

**What happens:**
- AI provides text suggestions
- No preview (conversational)
- Suggestions appear in transcript

---

**Write Enhanced Prompt**

Improve a basic prompt and insert into generation field.

**Example phrases:**
- "Enhance this prompt: mountain landscape"
- "Make this prompt better: professional office"
- "Improve my prompt about technology"

**What happens:**
- AI enhances your basic prompt
- Writes enhanced version to generation input
- Ready to generate immediately

---

**Analyze Image**

Get creative edit suggestions and ideas.

**Example phrases:**
- "Analyze this image"
- "What could I improve?"
- "Give me edit suggestions"

**What happens:**
- AI analyzes current canvas image
- Returns magic edit suggestions
- Returns new generation ideas
- Result in JSON format

---

**Analyze Banner**

Get professional feedback on your banner.

**Example phrases:**
- "Analyze my banner"
- "How can I improve this design?"
- "Give me professional feedback"

**What happens:**
- AI analyzes composition, colors, typography
- Suggests improvements
- Returns professional feedback
- Result in JSON format

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
