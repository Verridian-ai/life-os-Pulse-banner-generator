# Voice Commands Quick Reference

**Quick lookup guide for all 17 voice commands in Nanobanna Pro**

> **📖 For detailed documentation, see [VOICE_AGENT_GUIDE.md](./VOICE_AGENT_GUIDE.md)**

---

## Table of Contents

- [Image Generation (1)](#image-generation)
- [Image Processing (5)](#image-processing)
- [Canvas Manipulation (4)](#canvas-manipulation)
- [Navigation (1)](#navigation)
- [History Management (2)](#history-management)
- [AI Analysis (4)](#ai-analysis)
- [Quick Syntax](#quick-syntax)

---

## Image Generation

| Command | Description | Example Phrase | Preview Mode |
|---------|-------------|----------------|--------------|
| **generate_background** | Generate LinkedIn banner from text prompt | "Generate a professional gradient background in blue" | ✅ Yes |

**Details:** [Full Documentation](./VOICE_AGENT_GUIDE.md#image-generation)

---

## Image Processing

| Command | Description | Example Phrase | Preview Mode |
|---------|-------------|----------------|--------------|
| **magic_edit** | Edit existing image with AI | "Change the background to sunset colors" | ✅ Yes |
| **remove_background** | Remove background, create transparent PNG | "Remove the background from this image" | ❌ No |
| **upscale_image** | Enhance image resolution | "Upscale this image to best quality" | ✅ Yes |
| **restore_image** | Restore/enhance old or damaged photos | "Restore this old photo" | ✅ Yes |
| **enhance_face** | Enhance facial features for profile pics | "Enhance the face in this image" | ✅ Yes |

**Details:** [Full Documentation](./VOICE_AGENT_GUIDE.md#image-processing)

---

## Canvas Manipulation

| Command | Description | Example Phrase | Preview Mode |
|---------|-------------|----------------|--------------|
| **add_text_element** | Add text to canvas | "Add text 'Marketing Director' in the center" | ❌ No |
| **update_element** | Update existing element properties | "Make the text bigger and blue" | ❌ No |
| **delete_element** | Remove element from canvas | "Delete the last text element" | ❌ No |
| **list_elements** | Show all canvas elements | "List all elements on the canvas" | ❌ No |

**Details:** [Full Documentation](./VOICE_AGENT_GUIDE.md#canvas-manipulation)

---

## Navigation

| Command | Description | Example Phrase | Preview Mode |
|---------|-------------|----------------|--------------|
| **navigate_to_tab** | Switch between tabs | "Go to the gallery" | ❌ No |

**Valid Tabs:** `studio`, `gallery`, `brainstorm`

**Details:** [Full Documentation](./VOICE_AGENT_GUIDE.md#navigation)

---

## History Management

| Command | Description | Example Phrase | Preview Mode |
|---------|-------------|----------------|--------------|
| **undo_action** | Undo last canvas change | "Undo that" | ❌ No |
| **redo_action** | Redo previously undone action | "Redo the last change" | ❌ No |

**Details:** [Full Documentation](./VOICE_AGENT_GUIDE.md#history-management)

---

## AI Analysis

| Command | Description | Example Phrase | Preview Mode |
|---------|-------------|----------------|--------------|
| **suggest_prompts** | Get AI-generated prompt ideas | "Suggest some banner prompts for a designer" | ❌ No |
| **write_enhanced_prompt** | Enhance and write prompt to input | "Enhance this prompt: modern tech background" | ❌ No |
| **analyze_image** | Get creative edit suggestions | "Analyze this image for improvements" | ❌ No |
| **analyze_banner** | Get professional banner feedback | "Analyze my banner and suggest improvements" | ❌ No |

**Details:** [Full Documentation](./VOICE_AGENT_GUIDE.md#ai-analysis)

---

## Quick Syntax

### Speaking to the Voice Agent

**Natural Language:** You don't need exact command names - the AI understands natural variations.

**Examples:**
```
✅ "Generate a professional LinkedIn banner with a gradient background"
✅ "Make me a blue and purple background"
✅ "Create a modern tech-style banner"
```

### Common Parameters

| Parameter | Commands | Values | Default |
|-----------|----------|--------|---------|
| **quality** | generate_background | `1K`, `2K`, `4K` | `2K` |
| **mode** | upscale_image | `fast`, `balanced`, `best` | `balanced` |
| **position** | add_text_element | `x: 0-1584`, `y: 0-396` | `x: 792, y: 198` (center) |
| **fontSize** | add_text_element | `12-200` (pixels) | `48` |
| **color** | add_text_element | Hex color (e.g., `#ffffff`) | `#ffffff` (white) |

### Understanding Preview Mode

**Commands with Preview (5):**
- generate_background
- magic_edit
- upscale_image
- restore_image
- enhance_face

**What This Means:**
- You'll see a preview before it's applied
- Click **"Apply"** to accept or **"Reject"** to discard
- Safe to experiment without affecting your canvas

**Commands without Preview (12):**
- Execute immediately
- Use **"Undo"** if you need to revert
- Free operations (no API cost)

---

## Cost Information

| Operation Type | Typical Cost | Notes |
|----------------|--------------|-------|
| **Canvas Operations** | Free | add_text, update_element, delete_element, list_elements, navigate, undo, redo |
| **AI Text Analysis** | ~$0.01-0.02 | suggest_prompts, write_enhanced_prompt, analyze_image, analyze_banner |
| **Voice Session** | ~$0.06/min | OpenAI Realtime API audio streaming |
| **Image Generation** | ~$0.20-0.80 | Varies by quality (1K/2K/4K) |
| **Image Processing** | ~$0.10-0.40 | Varies by service (upscale/restore/enhance/remove bg) |

**💡 Cost Optimization Tips:**
- Disconnect when not actively using voice
- Use `2K` quality for testing, `4K` for final
- Batch multiple commands in one session
- Use "Reject" liberally in preview mode

**Monitor Your Usage:** [OpenAI Usage Dashboard](https://platform.openai.com/usage)

---

## Quick Troubleshooting

| Issue | Quick Fix |
|-------|-----------|
| **"Connection failed"** | Check API key in Settings, verify OpenAI credits |
| **"Microphone access denied"** | Allow microphone permission in browser |
| **"AI doesn't understand"** | Speak clearly, use complete sentences, wait for response |
| **"No image available"** | Generate a background first, or specify image URL |
| **"Preview not showing"** | Check browser console for errors, try refreshing |

**📖 Full Troubleshooting Guide:** [VOICE_AGENT_GUIDE.md - Troubleshooting](./VOICE_AGENT_GUIDE.md#troubleshooting)

---

## Prerequisites

**Before using voice commands, ensure you have:**

1. ✅ **OpenAI API Key** - [Get one here](https://platform.openai.com/api-keys)
2. ✅ **Modern Browser** - Chrome 89+ or Edge 89+ (recommended)
3. ✅ **Microphone Permission** - Granted when you click "Connect"
4. ✅ **Stable Internet** - For WebSocket connection
5. ✅ **OpenAI Credits** - Check [usage dashboard](https://platform.openai.com/usage)

**Setup Guide:** [VOICE_AGENT_GUIDE.md - Quick Setup](./VOICE_AGENT_GUIDE.md#quick-setup)

---

## Usage Workflow

```
1. Click "Connect" → Grant microphone permission
2. Wait for "Live Session Active" status
3. Speak your command naturally
4. For preview commands: Review → Click "Apply" or "Reject"
5. For instant commands: Result appears immediately
6. Click "Disconnect" when finished
```

**💡 Pro Tip:** Keep the voice session active while working to chain multiple commands efficiently.

---

## Related Documentation

| Document | Description |
|----------|-------------|
| **[VOICE_AGENT_GUIDE.md](./VOICE_AGENT_GUIDE.md)** | Complete user guide with detailed examples, troubleshooting, and best practices |
| **[REPLICATE_MODELS.md](./REPLICATE_MODELS.md)** | Image processing models and capabilities |
| **[WIKI.md](./WIKI.md)** | General application setup and configuration |
| **[README.md](./README.md)** | Project overview and features |

---

## Support

- **Issues:** [GitHub Issues](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/issues)
- **OpenAI Support:** [help.openai.com](https://help.openai.com)
- **Documentation Feedback:** Open an issue with label `documentation`

---

**Last Updated:** 2026-01-07
**Version:** 1.0.0
**Total Commands:** 17
