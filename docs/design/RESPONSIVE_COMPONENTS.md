# Mobile-First Responsive Component Specifications

This document defines the responsive behavior for key components, based on the specific "Mobile" vs "Desktop" splits defined in `lifeos-complete-concept Original.html`.

## 1. Canvas Editor (`CanvasEditor.tsx`)

The central workspace transforms significantly between devices.

### Mobile (< 768px)

- **Layout:** Vertical Stack (Top Nav -> Canvas -> Action Area -> Bottom Nav).
- **Canvas:** Full width card, `aspect-[4/1]`.
- **Tools:** Hidden by default. Accessed via FABs.
- **Navigation:** Fixed Bottom Nav (`absolute bottom-0`).
- **FABs:** `bottom-20` (Above nav).
  - Left: "Palette" & "Layers" (Small).
  - Right: "AI Studio" (Primary).

### Desktop (≥ 768px)

- **Layout:** Centered Workspace + Floating Panels.
- **Canvas:** Centered, larger max-width (`max-w-md` or larger).
- **Tools:** Persistent side panels or floating toolbars.
- **Navigation:** Top Header (Tabs: Studio, Quick Gen, Partner).
- **Sub-Nav:** Pill-shaped toggle (`Canvas | Templates | Posts`).

---

## 2. Format Selector (`CanvasFormatSelector.tsx`)

### Mobile

- **Trigger:** Tappable badge above canvas (e.g., "LinkedIn ▼").
- **View:** Full-screen modal or tall bottom sheet? (Concept shows "Dropdown Panel" - likely a centered modal on mobile for better reachability).

### Desktop

- **View:** Floating "Dropdown Panel" (`w-[280px]`).
- **Interactions:** Keyboard navigation support (`↑↓` to navigate, `Enter` to select).
- **Visuals:** Detailed list with icons, dimensions text (`1584 × 396`), and aspect ratios.

---

## 3. AI Studio / Generative Sidebar (`GenerativeSidebar.tsx`)

### Mobile (Bottom Sheet)

- **Container:** `drawer rounded-t-3xl` (Bottom Sheet).
- **Drag Handle:** Visible (`w-10 h-1 bg-slate-600`).
- **Header:** "AI Studio" title + Close (✕) button.
- **Content:**
  - "Nano Banana Badge" (Premium credits).
  - Prompt Input (`h-20`).
  - Quick Actions Row (Enhance, Magic, Library).
  - Quality Selector Row (1K, 2K, 4K).
  - "Generate Background" (Primary CTA, full width).

### Desktop (Side Panel)

- **Container:** `drawer rounded-2xl` (Side Panel).
- **Width:** Fixed (`max-w-[360px]`).
- **Content:** Identical internal structure to mobile, but vertically stacked in a persistent sidebar.

---

## 4. Navigation System (`Header.tsx` / Bottom Nav)

### Mobile

- **Top Bar:** Minimal. "LIFE OS" Logo + User Avatar + Mic Icon.
- **Bottom Bar:** Primary Navigation.
  - 4 Items: Canvas, Templates, Posts, Media.
  - Style: Glassmorphism `bg-zinc-900/95`.
  - Labels: Micro-text (`text-[9px]`).

### Desktop

- **Top Bar:** Full Header.
  - Left: Logo.
  - Center: Navigation Tabs (Pill shape).
  - Right: Tools (Mic, Help, User).
- **Bottom Bar:** Hidden. Replaced by Sub-Nav pill or sidebar.

---

## 5. UI Elements

### Floating Action Buttons (FABs)

- **Appearance:** Glassmorphism (`backdrop-blur`).
- **Shape:** Rounded Squircle (`rounded-2xl`).
- **Icons:** 20px (`w-5 h-5`).

### Safe Zones

- **Visual:** Dashed border (`border-2 dashed`).
- **Labels:** Small floating badges (`px-1.5 py-0.5`).
- **Concept:** "Profile Safe Zone" overlay.
