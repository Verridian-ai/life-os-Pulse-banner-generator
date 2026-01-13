# Anti-Slop: Banning Generic AI Design

> Negative constraint protocol to prevent AI-generated design cliches
> Source: Extracted from Anti-Slop: Banning Generic AI Design.pdf

---

## 1. The Anti-Slop Manifesto

"Slop" refers to generic, overused AI-generated design patterns that make websites look indistinguishable from each other. This document establishes **negative constraints** - explicit bans on tired patterns.

**Core Principle**: What you DON'T do defines your brand as much as what you DO.

---

## 2. BANNED Color Palettes

### 2.1 Forbidden Hex Codes

| Color | Hex | Name | Why Banned |
|-------|-----|------|------------|
| ![#A020F0](https://via.placeholder.com/15/A020F0/A020F0) | `#A020F0` | AI Purple | Default AI/tech gradient color |
| ![#14B8A6](https://via.placeholder.com/15/14B8A6/14B8A6) | `#14B8A6` | Teal | Overused SaaS accent |
| ![#000000](https://via.placeholder.com/15/000000/000000) | `#000000` | Pure Black | Harsh, never use as background |
| ![#FFFFFF](https://via.placeholder.com/15/FFFFFF/FFFFFF) | `#FFFFFF` | Pure White | Harsh, prefer off-whites |
| ![#8B5CF6](https://via.placeholder.com/15/8B5CF6/8B5CF6) | `#8B5CF6` | Violet 500 | Tailwind default purple |
| ![#06B6D4](https://via.placeholder.com/15/06B6D4/06B6D4) | `#06B6D4` | Cyan 500 | Tailwind default cyan |

### 2.2 Banned Gradients

```css
/* BANNED: The AI Purple-Blue Gradient */
.banned-gradient-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* BANNED: The SaaS Teal-Blue */
.banned-gradient-2 {
  background: linear-gradient(135deg, #0ea5e9 0%, #14b8a6 100%);
}

/* BANNED: The Tech Purple-Pink */
.banned-gradient-3 {
  background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
}
```

### 2.3 Approved Alternatives

```css
/* APPROVED: Warm neutrals with subtle warmth */
.approved-bg {
  background: #FAF9F7;  /* Warm off-white */
}

/* APPROVED: Rich, non-generic accent */
.approved-accent {
  color: #D4AF37;  /* Gold - Life OS brand */
}

/* APPROVED: Sophisticated dark */
.approved-dark {
  background: #0A0A0B;  /* Near-black with warmth */
}

/* APPROVED: Custom gradient (unique to brand) */
.approved-gradient {
  background: linear-gradient(
    135deg,
    rgba(212, 175, 55, 0.1) 0%,   /* Brand gold */
    rgba(10, 10, 11, 0.05) 100%   /* Brand dark */
  );
}
```

---

## 3. BANNED Typography

### 3.1 Forbidden Fonts

| Font | Why Banned | Alternative |
|------|------------|-------------|
| Inter | Overused default | General Sans, Satoshi |
| Poppins | Generic SaaS | Clash Display, Cabinet Grotesk |
| Roboto | Google default | Outfit, DM Sans |
| Open Sans | Bland, default | Source Sans Pro, Nunito |
| Montserrat | Overused geometric | Manrope, Plus Jakarta Sans |

### 3.2 Forbidden Pairings

```css
/* BANNED: Same-classification pairings */
.banned-pairing-1 {
  /* Both geometric sans */
  font-family: 'Montserrat', sans-serif;  /* Heading */
  font-family: 'Poppins', sans-serif;     /* Body */
}

/* BANNED: Default + Default */
.banned-pairing-2 {
  font-family: 'Inter', sans-serif;       /* Heading */
  font-family: 'Open Sans', sans-serif;   /* Body */
}
```

### 3.3 Approved Pairings

```css
/* APPROVED: Contrast in classification */
.approved-pairing-1 {
  /* Display serif + Humanist sans */
  --font-heading: 'Clash Display', sans-serif;
  --font-body: 'Satoshi', sans-serif;
}

/* APPROVED: Geometric display + Readable body */
.approved-pairing-2 {
  --font-heading: 'General Sans', sans-serif;
  --font-body: 'Source Serif Pro', serif;
}

/* APPROVED: High contrast */
.approved-pairing-3 {
  --font-heading: 'Akzidenz-Grotesk', sans-serif;
  --font-body: 'Charter', serif;
}
```

### 3.4 Approved Display Fonts

| Font | Classification | Best For |
|------|----------------|----------|
| General Sans | Neo-grotesque | Headlines, UI |
| Clash Display | Display sans | Hero text, statements |
| Satoshi | Geometric humanist | Body, UI |
| Akzidenz-Grotesk | Classic grotesque | Premium brands |
| Cabinet Grotesk | Modern grotesque | Tech, startups |
| Manrope | Semi-rounded | Friendly tech |
| Plus Jakarta Sans | Modern geometric | SaaS (fresh) |

---

## 4. BANNED Layouts

### 4.1 Forbidden Patterns

**The Bento Grid Hero**
```
BANNED: The 2024 Bento Layout for hero sections

┌─────────────────┬───────┐
│                 │       │
│  Big Feature    │ Small │
│     Card        │ Card  │
│                 ├───────┤
├────────┬────────┤ Small │
│ Small  │ Small  │ Card  │
│ Card   │ Card   │       │
└────────┴────────┴───────┘

Why: Every AI tool uses this exact layout.
```

**The Hero + 3 Cards**
```
BANNED: The classic SaaS layout

┌─────────────────────────┐
│      HERO SECTION       │
│   Headline + CTA + Image│
└─────────────────────────┘
┌───────┐ ┌───────┐ ┌───────┐
│ Card 1│ │ Card 2│ │ Card 3│
│ Icon  │ │ Icon  │ │ Icon  │
│ Title │ │ Title │ │ Title │
│ Desc  │ │ Desc  │ │ Desc  │
└───────┘ └───────┘ └───────┘

Why: Lazy, predictable, forgettable.
```

**The Testimonial Carousel**
```
BANNED: Auto-rotating testimonials with dots

      ◄  "Great product!" - John D.  ►
              • ○ ○ ○ ○

Why: Nobody reads these, wastes space.
```

### 4.2 Approved Alternatives

**Asymmetric Hero**
```
APPROVED: Broken grid with visual tension

┌──────────────────────────────┐
│                    ┌────────┐│
│  HEADLINE          │        ││
│  that breaks       │ IMAGE  ││
│  convention        │ or 3D  ││
│                    │ SCENE  ││
│  [CTA]             │        ││
│          ┌─────────┴────────┤│
│          │ Supporting text  ││
└──────────┴──────────────────┘│
```

**Story-Driven Features**
```
APPROVED: Scrollytelling instead of static cards

│ Scroll ↓
│
├── Stage 1: Problem statement
│   [Visual demonstration]
│
├── Stage 2: Your struggle
│   [Relatable scenario]
│
├── Stage 3: The solution
│   [Product in action]
│
├── Stage 4: The transformation
│   [Before/after or results]
│
└── CTA
```

**Social Proof Wall**
```
APPROVED: Static testimonial with context

┌─────────────────────────────┐
│ "Specific quote about       │
│  measurable result"         │
│                             │
│ ┌──┐ Jane Smith             │
│ │  │ VP Engineering @ Corp  │
│ └──┘ (with verifiable role) │
└─────────────────────────────┘

Why: One strong testimonial > carousel of weak ones.
```

---

## 5. BANNED Styles

### 5.1 Forbidden Visual Treatments

**Corporate Memphis**
```
BANNED: Flat illustrations with:
- Disproportionate limbs
- Solid color fills
- No shading
- Generic "diverse" characters
- Purple/teal/orange palette

Why: Universally mocked, instantly dated.
```

**Excessive Glassmorphism**
```css
/* BANNED: Glass everywhere */
.banned-glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  /* When EVERYTHING is glass, nothing is special */
}
```

**Generic Blob Backgrounds**
```css
/* BANNED: The gradient blob */
.banned-blob {
  background:
    radial-gradient(circle at 20% 30%, rgba(167, 139, 250, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(56, 189, 248, 0.3) 0%, transparent 50%);
}

Why: Every AI landing page in 2024 has this.
```

**Floating 3D Objects**
```
BANNED: Random floating shapes

     🔮 ⬡
        ◈
   ⬢      🔷

Why: Meaningless decoration, no purpose.
```

### 5.2 Approved Alternatives

**Textured Illustration**
```
APPROVED: Illustration with:
- Grain/noise texture
- Subtle shadows
- Unique character design
- Brand-specific style
- Purpose-driven scenes
```

**Purposeful Glass**
```css
/* APPROVED: Glass with restraint */
.approved-glass {
  /* Use ONLY for overlays and modals */
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  /* Maximum 3 glass elements per page */
}

/* Prefer solid surfaces with subtle depth */
.approved-card {
  background: var(--surface-primary);
  border: 1px solid var(--border-subtle);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
```

**Meaningful 3D**
```
APPROVED: 3D that serves a purpose

- Product visualization
- Interactive data
- Demonstrating functionality
- Creating memorable moments

NOT: Floating shapes for decoration
```

---

## 6. BANNED Micro-Copy

### 6.1 Forbidden Phrases

| Banned | Alternative |
|--------|-------------|
| "Supercharge your workflow" | [Specific benefit] |
| "Unleash the power of AI" | [What it actually does] |
| "10x your productivity" | [Realistic metric] |
| "The future of [X]" | [Present value] |
| "Seamlessly integrate" | [How it connects] |
| "Best-in-class" | [Comparative fact] |
| "Revolutionary" | [What's actually new] |
| "Game-changing" | [Specific change] |
| "Frictionless experience" | [What's removed] |
| "Leverage the synergy" | [Plain English] |

### 6.2 Approved Patterns

```typescript
// BANNED
const bannedCopy = "Supercharge your design workflow with AI-powered tools";

// APPROVED
const approvedCopy = "Create LinkedIn banners in 30 seconds. No design skills needed.";

// BANNED
const bannedCTA = "Get Started Free";

// APPROVED
const approvedCTA = "Make your first banner";
```

---

## 7. Implementation: Lint Rules

### 7.1 ESLint Plugin (Conceptual)

```typescript
// eslint-plugin-anti-slop (conceptual)
module.exports = {
  rules: {
    'no-banned-colors': {
      create(context) {
        const bannedHex = ['#A020F0', '#14B8A6', '#000000', '#FFFFFF'];
        return {
          Literal(node) {
            if (bannedHex.includes(node.value?.toUpperCase?.())) {
              context.report({
                node,
                message: `Banned color: ${node.value}. See ANTI_SLOP_DESIGN_PROTOCOL.md`
              });
            }
          }
        };
      }
    }
  }
};
```

### 7.2 Stylelint Rules

```json
{
  "rules": {
    "color-no-invalid-hex": true,
    "declaration-property-value-disallowed-list": {
      "font-family": ["/Inter/", "/Poppins/", "/Roboto/", "/Open Sans/"],
      "color": ["#A020F0", "#14B8A6"],
      "background-color": ["#000000", "#FFFFFF"]
    }
  }
}
```

---

## 8. Compliance Checklist

### Before Launch
- [ ] No banned hex codes in codebase
- [ ] No banned fonts (Inter, Poppins, Roboto for display)
- [ ] No Bento Grid hero layout
- [ ] No Hero + 3 Cards pattern
- [ ] No Corporate Memphis illustrations
- [ ] No excessive glassmorphism (max 3 elements)
- [ ] No generic blob backgrounds
- [ ] No floating 3D shapes without purpose
- [ ] No banned marketing copy phrases
- [ ] Custom color palette defined

### Design Review
- [ ] Color palette is brand-specific, not default
- [ ] Typography creates contrast (different classifications)
- [ ] Layout has visual tension/asymmetry
- [ ] 3D elements serve functional purpose
- [ ] Copy is specific, not generic hype
- [ ] Glass effects used sparingly with purpose

---

## 9. Exception Process

To use a banned element, you must:

1. **Document the rationale** in PR description
2. **Get explicit approval** from design lead
3. **Create an issue** to replace it later
4. **Add a TODO comment** in code

```typescript
// TODO(design): Replace Inter with General Sans
// Exception approved by @lead on 2026-01-13
// Issue: #1234
// Rationale: Legacy component, migration scheduled for Q2
```

---

*Last Updated: 2026-01-13*
*Source: Anti-Slop: Banning Generic AI Design.pdf*
