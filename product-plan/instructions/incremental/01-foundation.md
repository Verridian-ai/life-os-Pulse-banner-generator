# Foundation — Implementation Instructions

This milestone sets up the core infrastructure before building any features.

---

## 1. Design System

### Tailwind CSS v4 Configuration
Create your design tokens using Tailwind's built-in classes:

```css
/* src/styles/globals.css */
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono&display=swap');
```

### Color Palette
| Usage | Tailwind Class |
|-------|---------------|
| Primary | `sky-500` |
| Primary Hover | `sky-400` |
| Secondary | `teal-500` |
| Background | `zinc-950` |
| Card Background | `zinc-900` |
| Border | `white/10` |
| Text Primary | `white` |
| Text Secondary | `zinc-400` |

### Typography
| Usage | Font | Weight |
|-------|------|--------|
| Headings | Space Grotesk | 700 (bold) |
| Body | Space Grotesk | 400 (regular) |
| Code | JetBrains Mono | 400 |

### Glass Effect Pattern
```tsx
className="bg-zinc-900/80 backdrop-blur-xl border border-white/10"
```

---

## 2. Data Model

### Core Types
Create `src/types/database.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
}

export interface Design {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  platform: 'linkedin' | 'youtube' | 'instagram' | 'facebook' | 'tiktok' | 'x';
  thumbnail_url?: string;
  canvas_data?: object;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface BrandProfile {
  id: string;
  user_id: string;
  name: string;
  colors: Array<{
    hex: string;
    name: string;
    usage: 'primary' | 'accent' | 'background';
  }>;
  fonts?: Array<{
    name: string;
    usage: 'heading' | 'body';
  }>;
  industry?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  industry: string;
  background_url: string;
  prompt: string;
  elements?: object[];
}
```

---

## 3. Routing

### Route Structure
```
/                    → Dashboard (home)
/studio/:platform    → Platform Studio
/templates           → Templates Library
/brand               → Brand Kit
/onboarding          → Onboarding flow
```

### Implementation
Use your preferred router (React Router, Next.js, etc.):

```typescript
// Route configuration
const routes = [
  { path: '/', component: DashboardPage },
  { path: '/studio/:platform', component: StudioPage },
  { path: '/templates', component: TemplatesPage },
  { path: '/brand', component: BrandKitPage },
  { path: '/onboarding', component: OnboardingPage },
];
```

---

## 4. Application Shell

### AppShell Component
Create `src/components/shell/AppShell.tsx`:

**Props:**
```typescript
interface AppShellProps {
  children: React.ReactNode;
  navigationItems: NavigationItem[];
  activeItemId: string;
  onNavigate: (id: string) => void;
  onCreateNew?: () => void;
  onOpenSettings?: () => void;
  onOpenAuth?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  showVoiceAgent?: boolean;
  isVoiceActive?: boolean;
  onToggleVoice?: () => void;
}
```

**Structure:**
- Fixed header (h-16, z-50)
- Sidebar (w-64, hidden on mobile, fixed on desktop)
- Bottom nav (h-16, hidden on desktop)
- Main content area (ml-64 on desktop, pb-24 on mobile)

### MainNav Component
Sidebar navigation for desktop:
- Logo at top
- Nav items with icons
- Active state: sky gradient background

### BottomNav Component
Mobile navigation:
- 4 nav items evenly spaced
- Center FAB for create action
- Active state: sky color

### UserMenu Component
Dropdown menu with:
- User avatar and name (when signed in)
- Sign in button (when signed out)
- Settings link
- Sign out action

---

## 5. Auth Context

Create `src/context/AuthContext.tsx`:

```typescript
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: () => void;
  signOut: () => void;
}
```

Wrap your app with `AuthProvider`.

---

## Completion Checklist

- [ ] Tailwind v4 configured with design tokens
- [ ] Google Fonts loaded (Space Grotesk, JetBrains Mono)
- [ ] TypeScript types created
- [ ] Routing configured
- [ ] AppShell component created
- [ ] MainNav component created
- [ ] BottomNav component created
- [ ] UserMenu component created
- [ ] AuthContext set up

---

*Next: Milestone 2 — Onboarding*
