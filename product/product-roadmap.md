# Signal — Product Roadmap

## Development Sections

Signal is organized into self-contained sections that can be designed and built independently. Each section represents a core feature area of the application.

---

### 1. Application Shell
**ID:** `shell`
**Priority:** Foundation

The persistent navigation and layout that wraps all sections. Includes the glassmorphic header, responsive sidebar/bottom navigation, voice agent button, and user menu.

**Key Components:**
- AppShell (main wrapper)
- MainNav (desktop sidebar)
- BottomNav (mobile navigation with FAB)
- UserMenu (avatar dropdown)
- Voice Agent Button (Spring-animated FAB)

**Design Highlights:**
- Luxury Lag Spring physics on all interactive elements
- Anti-Slop orange/emerald color palette
- Good Friction press states
- Safe area support for notched devices

---

### 2. Dashboard
**ID:** `dashboard`
**Priority:** Core

The home view showing recent designs, quick actions, and usage statistics. The first screen users see after authentication.

**Key Screens:**
- Recent Designs grid with hover previews
- Quick Action cards (new design, templates, AI chat)
- Usage statistics and limits
- Upgrade prompts for free users

---

### 3. Design Studio
**ID:** `design-studio`
**Priority:** Core

The main creative workspace where users generate and refine designs. Includes the AI generation interface, canvas preview, and editing tools.

**Key Screens:**
- Generation prompt input
- Canvas with real-time preview
- Layer panel
- Style controls (colors, typography, effects)
- Export options

---

### 4. Templates Gallery
**ID:** `templates`
**Priority:** Core

Pre-designed templates organized by platform and use case. Users can browse, preview, and customize templates as starting points.

**Key Screens:**
- Category browser (by platform, industry, style)
- Template grid with hover previews
- Template detail modal
- Customization flow

---

### 5. Brand Kit
**ID:** `brand-kit`
**Priority:** Enhancement

Brand asset management including logos, colors, fonts, and design guidelines. Ensures consistency across all generated designs.

**Key Screens:**
- Logo upload and management
- Color palette editor
- Typography settings
- Brand voice guidelines
- Export brand kit

---

### 6. Platform Studios
**ID:** `platform-studios`
**Priority:** Enhancement

Specialized design interfaces optimized for specific platforms. Each studio understands the unique requirements of its target platform.

**Sub-sections:**
- LinkedIn Studio (`linkedin-studio`)
- Instagram Studio (`instagram-studio`)
- TikTok Studio (`tiktok-studio`)
- YouTube Studio (`youtube-studio`)
- X/Twitter Studio (`x-studio`)
- Facebook Studio (`facebook-studio`)

---

### 7. Projects
**ID:** `projects`
**Priority:** Core

Organization system for designs. Users can create projects, add designs, and manage collections.

**Key Screens:**
- Project list view
- Project detail with design grid
- Move/copy designs between projects
- Share project links

---

### 8. Settings
**ID:** `settings`
**Priority:** Core

Application settings including account, preferences, integrations, and billing.

**Key Screens:**
- Account settings
- Appearance (theme, motion preferences)
- Integrations (cloud storage, platforms)
- Billing and subscription
- Data export/delete

---

### 9. Onboarding
**ID:** `onboarding`
**Priority:** Core

First-run experience guiding new users through brand setup, preferences, and first design creation.

**Key Screens:**
- Welcome animation
- Brand color selection
- First design prompt
- Tutorial tooltips

---

### 10. Quick Generate
**ID:** `quick-generate`
**Priority:** Enhancement

One-click generation for common design types. Minimal input, maximum output.

**Key Screens:**
- Quick action cards
- Platform selector
- Instant preview
- Save/export

---

## Implementation Order

1. **Foundation**: Shell, Onboarding
2. **Core Experience**: Dashboard, Design Studio, Templates
3. **Organization**: Projects, Settings
4. **Platform Specific**: Platform Studios
5. **Enhancement**: Brand Kit, Quick Generate

---

## Design System Dependencies

All sections depend on the core design system tokens:
- `colors.json` — Orange/Emerald/Stone Anti-Slop palette
- `typography.json` — Space Grotesk headings, system body
- `motion.json` — Spring presets, Lerp factors, easing curves

The Shell must be implemented first as all other sections render within it.
