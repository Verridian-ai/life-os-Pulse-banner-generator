# 🍌 Nanobanna Pro

> **AI-Powered LinkedIn Banner Designer** - Create stunning, professional LinkedIn banners in seconds with cutting-edge AI technology.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green.svg)](https://supabase.com/)

---

## 🎯 Overview

Nanobanna Pro is the ultimate AI-powered design tool for creating professional LinkedIn banners. Built for the **Careersy Community**, it combines the power of multiple cutting-edge AI models to deliver unparalleled creative capabilities.

### ✨ Key Features

#### 🤖 Multi-LLM AI Integration

- **Gemini 3 Pro Image** - 4K image generation with 14 reference images & multi-turn editing
- **OpenRouter** - Access to 10+ latest models (GLM 4.6, MiniMax M2, GPT-5.1, Claude 3.7)
- **Replicate** - Professional image processing (upscaling, background removal, restoration)

#### 🎨 Advanced Design Tools

- **4K Resolution Output** - Professional print-quality exports
- **AI Brand Consistency** - Extract and enforce brand guidelines automatically
- **Multi-Turn Image Editing** - Iterative refinement with AI memory
- **A/B Testing Generator** - Create 3-5 design variants instantly
- **Tool Chain Builder** - Automate multi-step design workflows

#### 🎙️ Voice-Powered Creation

Powered by [OpenAI Realtime API](https://platform.openai.com/docs/guides/realtime):

- **Gemini Live Audio** - Natural voice conversations with AI
- **Voice Commands** - 17 available commands for hands-free design workflows
- **Hands-Free Design** - Complete banner creation using only your voice
- **Real-Time Processing** - Instant AI responses with bidirectional audio streaming
- **Preview Mode** - Approve image operations before execution for cost control

📖 **[Complete Voice Agent User Guide →](./VOICE_AGENT_GUIDE.md)**
⚡ **[Quick Command Reference →](./VOICE_COMMANDS_REFERENCE.md)**

#### 🖼️ Professional Image Processing

Powered by [Replicate](https://replicate.com):

- **AI Upscaling** - 3 quality tiers (Fast/Balanced/Best) with 2x resolution enhancement
- **Background Removal** - AI-powered foreground extraction with transparent PNG output
- **Image Restoration** - Repair degraded or damaged photos, fix compression artifacts
- **Face Enhancement** - Professional portrait enhancement with improved detail

📖 **[Complete Replicate Integration Guide →](./REPLICATE_MODELS.md)**

#### 📊 Smart Features

- **Performance Metrics** - Track AI usage, costs, and response times
- **Reference Library** - Save and organize brand assets
- **Canvas State Saving** - Re-edit any design anytime
- **Public Gallery** - Share and discover designs

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Supabase account (free tier works)
- AI API keys (Gemini, OpenRouter, Replicate)

### Installation

```bash
# Clone the repository
git clone https://github.com/Verridian-ai/life-os-Pulse-banner-generator.git
cd life-os-Pulse-banner-generator

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Setup

Create `.env.local` with:

```env
# Supabase (Required)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# AI API Keys (Optional - users can enter their own)
VITE_GEMINI_API_KEY=your-gemini-key
VITE_OPENROUTER_API_KEY=your-openrouter-key
VITE_REPLICATE_API_KEY=your-replicate-key
```

See [WIKI.md](./WIKI.md) for detailed setup instructions.

### Database Setup (For Deployment)

The app uses Supabase PostgreSQL for storing user profiles and application data. As the app owner, you need to set up the database schema once.

#### One-Time Setup

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project → SQL Editor
3. Run the schema from `database/schema.sql`
4. Verify tables created (see `database/README.md`)

Once this is done, all users can sign up and use the app with full functionality:
- User profiles stored per user
- API keys stored encrypted per user
- Designs and generation history saved per user

See `database/README.md` for detailed instructions.

---

## 📚 Documentation

- **[WIKI](./WIKI.md)** - Complete setup guide, architecture, and deployment
- **[Voice Agent User Guide](./VOICE_AGENT_GUIDE.md)** - Comprehensive voice commands documentation
- **[Voice Commands Reference](./VOICE_COMMANDS_REFERENCE.md)** - Quick reference for all 17 voice commands
- **[Replicate Models Guide](./REPLICATE_MODELS.md)** - Comprehensive Replicate integration documentation
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute

---

## 🏗️ Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **Fabric.js** - Canvas manipulation

### Backend & Services

- **Supabase** - Authentication, Database, Storage
- **Vercel** - Hosting & Deployment
- **PostgreSQL** - Relational database
- **Row Level Security** - Multi-tenant data isolation

### AI & APIs

- **Google Gemini** - Image generation, text processing, voice
- **OpenRouter** - Multi-model LLM access
- **Replicate** - Image processing & enhancement

---

## 🔐 Security & Privacy

### Data Protection

- ✅ **Row Level Security (RLS)** - Users can only access their own data
- ✅ **JWT Authentication** - Secure session management
- ✅ **Encrypted API Keys** - User API keys stored securely per-account
- ✅ **HTTPS Only** - All connections encrypted

### User Privacy

- 🔒 **No data sharing** - Your designs stay private
- 🔒 **Optional public gallery** - You control what's shared
- 🔒 **API keys in database** - Users own their AI access
- 🔒 **GDPR compliant** - Right to deletion, export

---

## 📦 Deployment Modes

### Mode 1: User-Hosted (Self-Service)

Users provide their own API keys:

- Sign up with email/password or OAuth
- Enter API keys in Settings
- Pay for their own AI usage
- Full access to all features

### Mode 2: Pilot Hosted (Careersy Community)

Pre-configured with admin API keys:

- Instant access, no API key setup
- Shared API quota for pilot users
- Usage tracking & limits
- Invite-only during pilot

See [WIKI.md](./WIKI.md) for deployment instructions.

---

## 🛠️ Development

### Local Development

```bash
# Start dev server
npm run dev

# Run type checking
npm run type-check

# Run linter
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📞 Support

### For Pilot Users (Careersy Community)

- 📧 Email: support@careersy.com
- 💬 Discord: [Join our community](https://discord.gg/careersy)
- 📖 Wiki: [Complete documentation](./WIKI.md)

### For Contributors

- 🐛 [Report bugs](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/issues)
- 💡 [Request features](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/discussions)

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Careersy Community** - Pilot testing & feedback
- **Google** - Gemini API access
- **Supabase** - Backend infrastructure
- **Vercel** - Hosting & deployment
- **OpenRouter** - Multi-model LLM access
- **Replicate** - Image processing capabilities

---

<div align="center">

**Made with ❤️ for the Careersy Community**

[Report Bug](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/issues) · [Request Feature](https://github.com/Verridian-ai/life-os-Pulse-banner-generator/discussions) · [View Wiki](./WIKI.md)

</div>
