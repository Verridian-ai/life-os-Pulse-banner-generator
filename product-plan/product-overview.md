# Signal

## Description
Signal is an AI-powered social influence system that helps creators, professionals, and anyone who wants to present themselves with polish create stunning social media content through voice commands and intelligent AI agents. Part of the Life OS ecosystem, Signal handles the visual side of your professional presence across all platforms.

## Problems & Solutions

### Problem 1: Professional design requires skills most people don't have
AI generates polished banners and graphics from simple voice or text prompts, making professional-quality design accessible to everyone.

### Problem 2: Creating quality social content takes hours
Voice-powered workflows let you design hands-free in seconds while multitasking, dramatically reducing the time from idea to published content.

### Problem 3: Each platform has different requirements
Pre-configured formats for LinkedIn, YouTube, Instagram, Facebook, TikTok, and X with automatic safe zone handling ensure your content looks perfect everywhere.

### Problem 4: Maintaining consistent branding is tedious
Brand engine learns your style and enforces it automatically across all designs, keeping your professional presence cohesive without manual effort.

### Problem 5: Creating engaging LinkedIn content is challenging
LinkedIn Content Studio provides AI copywriting, viral score prediction, and direct publishing to optimize your professional content.

## Key Features

### AI-Powered Design
- **Multi-Model Generation** — Gemini 3 Pro Image, OpenRouter (10+ models), Replicate
- **Resolution Options** — 1K, 2K, 4K image generation
- **Reference Images** — Up to 14 reference images for style guidance
- **Magic Prompt** — AI-enhanced prompts for better results
- **Multi-Turn Editing** — Iterative refinements with context preservation

### Voice Agent
- **17 Natural Language Commands** — Generate, edit, add text, change colors, export, and more
- **Real-Time Transcript** — See what the AI hears and responds
- **Action Preview** — Approve or reject destructive actions before execution
- **OpenAI Realtime API** — Low-latency bidirectional audio streaming

### Image Processing Tools
- **AI Upscaling** — 3 quality tiers (Fast/Balanced/Best)
- **Background Removal** — Transparent PNG export
- **Image Restoration** — Repair compression artifacts
- **Face Enhancement** — Improve facial details

### Multi-Platform Canvas
- **6 Platforms** — LinkedIn, YouTube, Instagram, Facebook, TikTok, X
- **8+ Format Presets** — Per platform with correct dimensions
- **Safe Zones** — Profile picture overlay and action bar visualization
- **Zoom Controls** — 0.5x to 2.0x zoom with pan
- **Layers Panel** — Element hierarchy with visibility toggles
- **Undo/Redo** — Full history with snapshots

### LinkedIn Content Studio
- **AI Copywriting** — Generate engaging post content
- **Viral Score** — Predict content performance (0-100)
- **Tone Selection** — Professional, casual, inspiring, educational, storytelling
- **Post Preview** — Real-time LinkedIn mockup
- **Direct Publishing** — Publish or schedule to LinkedIn

### Chat & Brainstorm
- **NANO AI Assistant** — Multi-turn conversations for design ideation
- **Image Attachments** — Reference images in conversations
- **Mode Switching** — Design, search, and voice modes
- **Conversation History** — Persistent chat archive

### Quick Generate Wizard
- **Step-by-Step Flow** — Guided design creation
- **A/B Testing** — Generate 3-5 variants to compare
- **Template Starting Points** — Choose from library or start fresh
- **Prompt Enhancement** — AI improves your descriptions

### Brand Kit
- **Multiple Profiles** — Store and switch between brands
- **Color Extraction** — AI extracts colors from reference images
- **Font Management** — Typography settings per brand
- **Auto-Enforcement** — Apply brand automatically to generations

### Templates
- **Industry Categories** — Tech, Finance, Education, Marketing, etc.
- **Platform Filters** — Filter by social platform
- **Search** — Find templates by name or tag
- **Quick Apply** — One-click template application

### Settings & Preferences
- **API Key Management** — OpenAI, Replicate, OpenRouter, Google AI
- **Theme Selection** — Light, dark, and system modes
- **Keyboard Shortcuts** — 13+ customizable shortcuts
- **Notification Preferences** — Email and in-app settings

### Admin Dashboard (Admin Only)
- **Overview** — Active users, generations, revenue, error rates
- **User Management** — Search, suspend, impersonate users
- **Agent Monitoring** — AI agent performance and configuration
- **Observability** — Logs, errors, system health
- **Finance** — MRR, costs, projections

## Technical Architecture

### Frontend
- React 19 + TypeScript
- Tailwind CSS v4 (sky/teal/zinc palette)
- Space Grotesk typography
- Fabric.js canvas
- Mobile-first responsive design

### AI Services
- OpenAI Realtime API (voice)
- Google Gemini 3 Pro (primary generation)
- OpenRouter (multi-model access)
- Replicate (image processing)

### Backend
- Supabase (auth, database, storage)
- Edge functions for API orchestration
- Real-time subscriptions

### Design System
- Glassmorphism + depth effects
- Sidebar (desktop) + bottom nav (mobile)
- Touch-optimized interactions
- Dark mode by default

## User Roles

### Standard User
- Access to all design features
- Personal brand profiles
- Chat and voice agent
- Template library

### Pro User
- Unlimited generations
- Premium templates
- Priority processing
- Extended brand profiles

### Team User
- All Pro features
- Shared brand kits
- Team analytics
- Collaboration features

### Admin
- All user features
- Admin dashboard access
- User management
- System monitoring
- Financial tracking

## Accessibility

- Screen reader announcements
- Keyboard navigation
- Focus management
- Reduced motion support
- ARIA labels throughout

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl+Enter | Generate image |
| Delete/Backspace | Delete element |
| Cmd/Ctrl+D | Duplicate element |
| Cmd/Ctrl+Z | Undo |
| Cmd/Ctrl+Shift+Z | Redo |
| Cmd/Ctrl++ | Zoom in |
| Cmd/Ctrl+- | Zoom out |
| Cmd/Ctrl+Shift+E | Export |
| Cmd/Ctrl+, | Settings |
| Cmd/Ctrl+? | Show shortcuts |
| Cmd/Ctrl+1 | Studio tab |
| Cmd/Ctrl+3 | Brainstorm tab |
| Escape | Close panels |
