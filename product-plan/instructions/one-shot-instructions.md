# Signal — One-Shot Implementation Instructions

This document contains all implementation milestones combined for full Signal implementation.

---

## Milestone 1: Foundation

### Design System Setup
1. Configure Tailwind CSS v4 with the following tokens:
   - Primary: `sky-500`
   - Secondary: `teal-500`
   - Neutral: `zinc-950` (background), `zinc-900` (cards), `zinc-800` (borders)
   - Glass effect: `backdrop-blur-xl` with `bg-zinc-900/80`

2. Typography:
   - Primary font: Space Grotesk (Google Fonts)
   - Code font: JetBrains Mono

3. Create CSS variables in your global styles for the design tokens.

### Data Model
1. Create TypeScript types in `src/types/`:
   - `User` — id, email, first_name, last_name, avatar_url, created_at
   - `Design` — id, user_id, title, description, platform, thumbnail_url, canvas_data, created_at, updated_at
   - `BrandProfile` — id, user_id, name, colors, fonts, industry, logo_url, is_active
   - `Template` — id, title, description, industry, background_url, prompt, elements

2. Set up database tables or API endpoints for each entity.

### Routing
1. Set up routes:
   - `/` — Dashboard
   - `/studio/:platform` — Platform Studio
   - `/templates` — Templates Library
   - `/brand` — Brand Kit
   - `/onboarding` — Onboarding flow (shown to new users)

### Application Shell
1. Create `AppShell` component with:
   - Fixed header with logo, search, user menu
   - Sidebar navigation (desktop: 256px fixed)
   - Bottom navigation (mobile: 4 items + FAB)
   - Glass effect: `backdrop-blur-xl bg-zinc-900/80`

2. Navigation items:
   - Dashboard (Home icon)
   - Projects (Folder icon)
   - Templates (Layout icon)
   - Brand Kit (Palette icon)

3. User menu with sign in/out, settings access.

4. Floating Voice Agent button (bottom-right).

---

## Milestone 2: Onboarding

### Welcome Screen
- Logo animation
- "Welcome to Signal" heading
- "Amplify your professional signal through AI" tagline
- "Get Started" button

### Profile Setup
- First name, last name inputs
- Optional username
- Optional avatar upload
- Progress indicator (step dots)

### Platform Selection
- Grid of 6 platform cards (multi-select)
- Platforms: LinkedIn, YouTube, Instagram, Facebook, TikTok, X
- Selected state with checkmark

### API Configuration (Optional)
- Gemini API key input
- OpenRouter API key input
- Replicate API key input
- "Skip for now" option
- Help links for obtaining keys

### First Design
- Quick template selection (top 3)
- "Start from scratch" option
- Redirects to Platform Studio

### Data to Store
- User profile info
- Selected platforms
- API keys (encrypted)
- Onboarding completion status

---

## Milestone 3: Dashboard

### Components to Create

#### DashboardPage
Main page component with:
- Welcome section with user's name
- Platform cards grid
- Recent designs section

#### PlatformCard
- Full-bleed 3D platform image
- Platform icon badge (bottom-left)
- Platform name overlay
- Hover: scale animation, gradient overlay
- Click: navigates to studio

#### RecentDesigns
- Grid of design cards (1-4 columns responsive)
- Each card: thumbnail, title, date, actions menu
- Empty state with illustration
- Loading skeleton state

### Data Requirements
- User profile (for welcome message)
- Recent designs list (max 8)
- Authentication state

### Responsive Behavior
- Mobile: 2-column platform grid, 1-column designs
- Desktop: 6-column platform grid, 4-column designs

---

## Milestone 4: Platform Studio

### Components to Create

#### StudioHeader
- Back button to Dashboard
- Platform indicator (icon + name)
- Tab navigation: Canvas, Templates, Media, LinkedIn Posts
- Action buttons: Voice, Refresh, Settings

#### CanvasView
- Main canvas area with resize handles
- Format selector dropdown
- Zoom controls (fit, 50%, 100%, 200%)
- Safe zones toggle

#### GenerativeSidebar
- Prompt input (textarea)
- Size selector (1K, 2K, 4K)
- Generate button (gradient)
- Enhance/Magic prompt buttons
- Edit tools: Remove BG, Upscale

#### MediaGallery
- Upload button
- Image grid with selection
- Drag-and-drop support

### Platform-Specific Formats
- LinkedIn: 1584x396 (banner), 800x800 (profile)
- YouTube: 1280x720 (thumbnail), 2560x1440 (banner)
- Instagram: 1080x1080 (post), 1080x1920 (story)
- Facebook: 820x312 (cover), 1200x630 (post)
- TikTok: 1080x1920 (video), 200x200 (profile)
- X: 1500x500 (header), 1200x675 (post)

### Voice Agent Integration
- Floating mic button
- Connection states: disconnected, connecting, connected, error
- Visual feedback for listening/processing

---

## Milestone 5: Templates

### Components to Create

#### TemplatesGrid
- Search input with icon
- Industry filter pills (horizontal scroll)
- Template cards grid (1-4 columns)
- Loading skeletons

#### TemplateCard
- Preview image (aspect-video)
- Title and description
- Industry tag
- Hover: "Use Template" overlay button

### Industries to Include
- Technology
- Finance
- Healthcare
- Marketing
- Education
- Real Estate
- Creative
- E-commerce

### Behavior
- Search filters by title, description
- Industry pills filter by category
- "All" shows everything
- Click template: opens studio with template applied

---

## Milestone 6: Brand Kit

### Components to Create

#### BrandKitPanel
- Header with title and "New Brand" button
- Brand profiles grid (1-3 columns)
- Empty state with CTA
- Pro tip card

#### BrandCard
- Brand name
- Color swatches (5 visible, +N indicator)
- Industry tag
- Font name
- "Active" badge
- Menu: Set Active, Delete
- "Use This Brand" button

### Brand Profile Data
- name: string
- colors: Array<{ hex, name, usage }>
- fonts: Array<{ name, usage }>
- industry: string (optional)
- logoUrl: string (optional)
- isActive: boolean

### Actions
- Create brand (opens modal/flow)
- Set active (for AI generation)
- Delete (with confirmation)

---

## Milestone 7: Chat & Brainstorm

### Components to Create

#### ChatInterface
- Message list with user/AI messages
- Markdown rendering for AI responses
- Image attachments inline

#### ChatHeader
- Mode tabs: Design, Search, Voice
- Conversation title
- Archive/new chat buttons

#### ChatInput
- Text input with send button
- Attachment button for images
- File picker integration

#### ConversationHistory
- List of past conversations
- Search/filter
- Archive/delete actions

### Data Model
- ChatMessage: id, role, content, attachments, timestamp
- Conversation: id, title, mode, messages, createdAt, archived

---

## Milestone 8: LinkedIn Content Studio

### Components to Create

#### CopywritingPanel
- Content editor
- Tone selector (Professional, Casual, Inspiring, etc.)
- AI rewrite button
- Hashtag suggestions

#### ViralScoreCard
- Overall score (0-100)
- Factor breakdown
- Improvement suggestions

#### PostPreview
- LinkedIn post mockup
- Profile picture and name
- Content with formatting
- Engagement buttons (visual)

### Score Factors
- Hook strength (25%)
- Structure (20%)
- Engagement potential (25%)
- Hashtags (15%)
- Length (15%)

---

## Milestone 9: Quick Generate Wizard

### Flow Steps
1. **Starting Point** — Template or fresh
2. **Description** — Prompt with enhancement
3. **Format** — Platform and dimensions
4. **Generating** — Progress indicator
5. **Results** — A/B variants (3-5)
6. **Refine** — Open in studio

### A/B Testing
- Generate 3-5 variants simultaneously
- Same prompt, different seeds
- Side-by-side comparison
- Regenerate individual or all

---

## Milestone 10: Settings

### Tabs
- **Account** — Profile, email, password
- **API Keys** — OpenAI, Replicate, OpenRouter, Google
- **Appearance** — Theme, font size, reduced motion
- **Shortcuts** — Keyboard customization
- **Notifications** — Email and in-app
- **Billing** — Plan, usage, payment

### API Key Management
- Masked display after entry
- Validation on save
- Status indicators
- Help links

---

## Milestone 11: Admin Dashboard (Optional)

### Pages
- **Overview** — Key metrics, usage chart, activity feed
- **Users** — Searchable table, detail drawer, actions
- **Agents** — Status cards, metrics, configuration
- **Observability** — Log viewer, error tracking
- **Finance** — Revenue, costs, projections

### Access Control
- Role-based access (admin only)
- Audit logging for all actions
- Confirmation dialogs for destructive actions

---

## Milestone 12: YouTube Studio

### Components to Create

#### ThumbnailDesigner
- Canvas with YouTube safe zones
- Profile picture overlay preview
- Watch later button area
- Duration badge placement

#### CTRScoreCard
- Overall CTR score (0-10%)
- Factor breakdown (5 factors)
- Improvement suggestions
- Competitor comparison

#### TitleAnalyzer
- Power word detection
- Emotional trigger identification
- Number pattern detection
- Character count (50-60 optimal)

### CTR Score Factors
- Text Readability (25%)
- Face Presence (20%)
- Color Contrast (20%)
- Relevance (20%)
- Brand Consistency (15%)

### A/B Testing
- Generate 3-5 thumbnail variants
- Side-by-side CTR comparison
- Track selection history

---

## Milestone 13: Instagram Studio

### Components to Create

#### MultiFormatCanvas
- Post (1:1, 4:5), Story (9:16), Reel, Carousel
- Aspect ratio switching with content preservation

#### EngagementScoreCard
- Overall engagement score
- Reach, likes, comments, saves prediction
- Factor breakdown
- Best time to post

#### HashtagOptimizer
- 5 categories: Branded, Community, Niche, Broad, Trending
- Combined reach estimate
- Max 30 validation
- Mix recommendations

#### GridPreview
- 9-post grid preview
- Color consistency analysis
- Feed flow suggestions

### Engagement Score Factors
- Visual Quality (30%)
- Caption Quality (25%)
- Hashtag Effectiveness (20%)
- Timing (15%)
- Content Type (10%)

---

## Milestone 14: Facebook Studio

### Components to Create

#### MultiFormatCanvas
- Post (1.91:1), Cover (2.63:1), Event (16:9), Story

#### EngagementScoreCard
- Overall score
- Reach, reactions, comments, shares
- Factor breakdown
- Boost recommendation

#### AdCreativeGenerator
- Generate 3-5 headline variants
- Body text variations
- Predicted CTR/CPC per variant

#### BoostRecommendation
- Estimated reach
- Suggested budget
- Reasoning

#### CTASelector
- 8 options: Learn More, Shop Now, Sign Up, Book Now, Contact Us, Download, Get Offer, Subscribe

### Engagement Score Factors
- Content Type (20%)
- Text Quality (25%)
- Visual Quality (25%)
- Timing (15%)
- Audience Match (15%)

---

## Milestone 15: TikTok Studio

### Components to Create

#### ViralScoreCard
- Overall score (0-100)
- FYP potential
- Factor breakdown
- Suggestions

#### TrendingSoundBrowser
- Searchable sound library
- Usage count display
- Trend status (rising, peak, declining)
- Preview playback

#### TrendingHashtagPanel
- Real-time trending tags
- View counts
- Category filtering

#### HookAnalyzer
- First 3 seconds analysis
- Pattern interrupt detection
- Text/visual hook evaluation
- Retention prediction

### Viral Score Factors
- Hook Strength (30%)
- Trend Alignment (25%)
- Watch Time Prediction (25%)
- Engagement Drivers (20%)

### Content Formats
- Tutorial, POV, Storytime, Transition, Duet, Stitch, Green Screen, Challenge

---

## Milestone 16: X (Twitter) Studio

### Components to Create

#### ThreadBuilder
- Multi-tweet composer
- Drag-drop reordering
- Numbering styles: None, Simple (1/), Total (1/10), Emoji

#### EngagementScoreCard
- Overall score
- Retweets, likes, replies, quotes, bookmarks
- Factor breakdown
- Best posting times

#### CharacterCounter
- 280 limit tracker
- Link shortening (23 chars)
- Optimal length indicator (71-100)

#### QuoteTweetGenerator
- 6 angles: Agree, Disagree, Add Context, Ask Question, Humor, Summarize
- AI-generated suggestions

### Engagement Score Factors
- Hook Strength (30%)
- Thread Structure (25%)
- Post Timing (20%)
- Engagement Potential (25%)

### Thread Best Practices
- Strong hook with credibility
- One idea per tweet
- Visual breaks every 3-4 tweets
- End with CTA

---

## Integration Notes

### Authentication
- Implement auth flow (Supabase recommended)
- OAuth providers: Google, GitHub
- Protect routes requiring auth
- Role-based access for admin

### AI Integration
- Primary: Google Gemini 3 Pro Image
- Multi-model: OpenRouter (10+ models)
- Processing: Replicate (upscaling, background removal)
- Voice: OpenAI Realtime API
- Store API keys securely (encrypted)

### Voice Agent (17 Commands)
1. Generate image
2. Edit current design
3. Add text
4. Change background
5. Remove background
6. Upscale
7. Apply template
8. Change format
9. Undo/redo
10. Duplicate/delete
11. Move/resize
12. Change colors
13. Apply brand
14. Export
15. Navigate
16. Open settings

### State Management
- React Query for server state
- Context for: Auth, Canvas, AI, Voice, Toast
- Local state for UI interactions

### Mobile-First Design
- Bottom navigation on mobile
- Sidebar on desktop
- Touch-optimized interactions
- Dark mode by default

---

*Generated by Design OS*
