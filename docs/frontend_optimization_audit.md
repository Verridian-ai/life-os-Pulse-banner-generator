# Frontend Optimization Audit & Tracking

## 1. Visual Layout & Design System Alignment

- [ ] **Tailwind Configuration**
  - [ ] Add Neumorphic shadows (`neu-sm`, `neu-md`, `neu-inset`) to `tailwind.config.js`.
  - [ ] Add Blur Budget limits to `backdropBlur`.
- [ ] **Global CSS (`index.css`)**
  - [ ] Add CSS Variables for Neumorphic depth and colors (`--color-bg-base`, `--neu-shadow-dark`, etc.).
  - [ ] Implement `neu-raised`, `neu-inset`, `glass-*` utility classes.
- [ ] **Component Consistency**
  - [ ] Refactor `styles.ts` to use new `shadow-neu-*` classes instead of hardcoded specific values.
  - [ ] Ensure `Header.tsx` uses consistent design tokens.

## 2. Touch Optimization

- [ ] **Target Sizes**
  - [ ] Update `BTN_BASE` in `styles.ts` to have `min-height: 44px` (currently `h-10` on mobile).
  - [ ] Audit `Header.tsx` buttons (some manual overrides exist, ensure consistency).
  - [ ] Audit `GenerativeSidebar.tsx` inputs and buttons.
- [ ] **Touch Events**
  - [ ] Verify `BannerCanvas` (Completed previously).
  - [ ] Check `CanvasEditor` gestures.

## 3. Code Quality & Performance

- [ ] **React Optimization**
  - [ ] `BannerCanvas.tsx`: Profile interaction handlers are inline; consider `useCallback`.
  - [ ] `App.tsx`: `handleGenerate`, `handleMagicPrompt` are large async functions; check for unnecessary re-creations.
- [ ] **CSS/Tailwind**
  - [ ] Remove unused legacy shadowing if replaced by `neu-*` classes.
  - [ ] Ensure `will-change` is used only where necessary (Guidelines Section 7.1).

## 4. Cross-Device Verification

- [ ] **Mobile (xs/sm)**
  - [ ] Check Header layout on 320px.
  - [ ] Check Sidebar bottom sheet behavior.
- [ ] **Desktop**
  - [ ] Verify Glassmorphism blur (40px vs 20px).

## 5. Specific Component Audits

### CanvasEditor.tsx

- [ ] Check touch interactions.

### ImageGallery.tsx

- [ ] Check grid responsiveness (columns per breakpoint).
