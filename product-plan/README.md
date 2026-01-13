# Signal — Design Handoff

This folder contains everything needed to implement Signal, an AI-powered social content creation platform.

## What's Included

**Ready-to-Use Prompts:**
- `prompts/one-shot-prompt.md` — Prompt template for full implementation
- `prompts/section-prompt.md` — Prompt template for section-by-section implementation

**Instructions:**
- `product-overview.md` — Complete product summary (provide with every implementation)
- `product-roadmap.md` — All sections with descriptions
- `instructions/one-shot-instructions.md` — All milestones combined for full implementation
- `instructions/incremental/` — Milestone-by-milestone instructions

**Design Assets:**
- `design-system/` — Colors, fonts, design tokens, mobile guidelines
- `data-model/` — Core entities and TypeScript types
- `shell/` — Application shell components
- `sections/` — All section components, types, sample data, and test instructions

## Sections Included

| Section | Description |
|---------|-------------|
| Onboarding | Signup, login, OAuth, initial setup |
| Dashboard | Platform hub, recent designs, navigation |
| Platform Studio | Canvas editor, AI generation, voice agent |
| Chat & Brainstorm | Conversational AI for ideation |
| LinkedIn Studio | LinkedIn viral scoring and copywriting |
| YouTube Studio | Thumbnail CTR scoring and SEO optimization |
| Instagram Studio | Engagement scoring and hashtag optimization |
| Facebook Studio | Ad creative generation and boost recommendations |
| TikTok Studio | Viral scoring and FYP optimization |
| X (Twitter) Studio | Thread building and engagement timing |
| Quick Generate | Step-by-step wizard with A/B testing |
| Templates | Template library with filtering |
| Brand Kit | Brand profile management |
| Settings | User preferences, API keys, billing |
| Admin | Admin dashboard (users, agents, observability, finance) |

## How to Use This

### Option A: Incremental (Recommended)

Build your app milestone by milestone for better control:

1. Copy the `product-plan/` folder to your codebase
2. Start with Foundation (`instructions/incremental/01-foundation.md`)
3. For each section:
   - Open `prompts/section-prompt.md`
   - Fill in the section variables at the top
   - Copy/paste into your coding agent
   - Answer questions and implement
4. Review and test after each milestone

### Option B: One-Shot

Build the entire app in one session:

1. Copy the `product-plan/` folder to your codebase
2. Open `prompts/one-shot-prompt.md`
3. Add any additional notes to the prompt
4. Copy/paste the prompt into your coding agent
5. Answer the agent's clarifying questions
6. Let the agent plan and implement everything

## Test-Driven Development

Each section includes a `tests.md` file with test-writing instructions. For best results:

1. Read `sections/[section-id]/tests.md` before implementing
2. Write failing tests based on the instructions
3. Implement the feature to make tests pass
4. Refactor while keeping tests green

The test instructions are **framework-agnostic** — they describe WHAT to test, not HOW.

## Implementation Milestones

1. **Foundation** — Design tokens, data model, routing, application shell
2. **Onboarding** — First-time user experience and account setup
3. **Dashboard** — Platform hub with 6 social platform cards
4. **Platform Studio** — AI-powered design editor with voice agent
5. **Templates** — Pre-designed templates library
6. **Brand Kit** — Brand profile management
7. **Chat & Brainstorm** — Conversational AI interface
8. **LinkedIn Studio** — LinkedIn viral scoring and copywriting
9. **Quick Generate** — Wizard flow with A/B testing
10. **Settings** — User preferences and API keys
11. **Admin** — Administrative dashboard (optional)
12. **YouTube Studio** — Thumbnail CTR scoring and SEO optimization
13. **Instagram Studio** — Engagement scoring and hashtag optimization
14. **Facebook Studio** — Ad creative generation and boost recommendations
15. **TikTok Studio** — Viral scoring and FYP optimization
16. **X (Twitter) Studio** — Thread building and engagement timing

## Key Features

### AI Capabilities
- Multi-model generation (Gemini, OpenRouter, Replicate)
- 17 voice commands via OpenAI Realtime API
- Image processing (upscale, background removal, restore)
- Multi-turn editing with context preservation
- Prompt enhancement

### Mobile-First Design
- Bottom navigation on mobile
- Touch-optimized interactions
- Responsive layouts (1-6 columns)
- Dark mode by default

### Admin Features
- User management
- AI agent monitoring
- System observability
- Financial tracking

## Tips

- **Use the pre-written prompts** — They include important clarifying questions about auth and data modeling
- **Read the mobile guidelines** — `design-system/mobile-guidelines.md` has responsive patterns
- **Check the sample data** — Each section has realistic `data.json` for development
- **Follow the types** — TypeScript interfaces in each section define the data model
- **Build on your designs** — Use completed sections as the starting point for future features

---

*Generated by Design OS*
