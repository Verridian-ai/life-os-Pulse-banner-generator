# Onboarding — Implementation Instructions

First-time user experience that introduces Signal and collects preferences.

---

## Overview

The onboarding flow guides new users through:
1. Welcome screen
2. Profile setup
3. Platform selection
4. API configuration (optional)
5. First design prompt

---

## Components to Create

### OnboardingPage

Main page component managing step state.

```typescript
interface OnboardingPageProps {
  onComplete: () => void;
}

type OnboardingStep = 'welcome' | 'profile' | 'platforms' | 'api' | 'first-design';
```

**State:**
- `currentStep: OnboardingStep`
- `profileData: { firstName, lastName, username, avatarUrl }`
- `selectedPlatforms: string[]`
- `apiKeys: { gemini?, openrouter?, replicate? }`

---

### Step 1: WelcomeStep

**Visual:**
- Logo with subtle animation (fade-in + scale)
- Large "Welcome to Signal" heading
- "Amplify your professional signal through AI" tagline
- Primary gradient button: "Get Started"

**Styling:**
```tsx
<div className="flex flex-col items-center justify-center min-h-screen text-center p-8">
  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 mb-8" />
  <h1 className="text-4xl font-bold text-white mb-4">Welcome to Signal</h1>
  <p className="text-zinc-400 mb-8">Amplify your professional signal through AI</p>
  <button className="px-8 py-4 bg-gradient-to-r from-sky-500 to-teal-500 rounded-xl font-bold">
    Get Started
  </button>
</div>
```

---

### Step 2: ProfileStep

**Fields:**
- First name (required)
- Last name (required)
- Username (optional)
- Avatar upload (optional)

**Layout:**
- Card container with glass effect
- Stacked inputs with labels
- Progress indicator at top
- Continue button at bottom

**Validation:**
- First name required, min 2 characters
- Last name required, min 2 characters

---

### Step 3: PlatformsStep

**Visual:**
- "What platforms do you create for?" heading
- 6 platform cards in 2x3 grid (mobile) or 3x2 (desktop)
- Multi-select behavior
- Selected: sky border + checkmark badge

**Platforms:**
```typescript
const platforms = [
  { id: 'linkedin', name: 'LinkedIn', icon: LinkedinIcon },
  { id: 'youtube', name: 'YouTube', icon: YoutubeIcon },
  { id: 'instagram', name: 'Instagram', icon: InstagramIcon },
  { id: 'facebook', name: 'Facebook', icon: FacebookIcon },
  { id: 'tiktok', name: 'TikTok', icon: TikTokIcon },
  { id: 'x', name: 'X', icon: TwitterIcon },
];
```

**Behavior:**
- Minimum 1 platform required
- Toggle selection on click

---

### Step 4: ApiStep (Optional)

**Fields:**
- Gemini API key (recommended)
- OpenRouter API key
- Replicate API key (for images)

**Features:**
- Password-type inputs (hide keys)
- Help links for each provider
- "Skip for now" text link
- Keys can be added later in Settings

**Security:**
- Store keys encrypted
- Never log or expose keys

---

### Step 5: FirstDesignStep

**Options:**
- Top 3 template thumbnails
- "Start from scratch" button

**Behavior:**
- Template click: opens studio with template
- Scratch: opens studio with blank canvas
- Marks onboarding complete

---

### ProgressIndicator

Reusable component showing step progress.

```typescript
interface ProgressIndicatorProps {
  steps: string[];
  currentIndex: number;
}
```

**Visual:**
- Row of dots
- Current: sky-500 filled
- Completed: sky-500 outline
- Upcoming: zinc-700

---

## Data Flow

### On Complete
1. Save user profile to database
2. Save platform preferences
3. Save API keys (encrypted)
4. Set `onboarding_complete: true` flag
5. Navigate to Dashboard or Studio

### Skip Behavior
- Profile: Cannot skip (required)
- Platforms: Can proceed with none (shows prompt later)
- API: Skip adds keys later in Settings

---

## Responsive Design

**Mobile:**
- Full-width cards
- Stacked layout
- Touch-friendly buttons (min 44px)

**Desktop:**
- Centered card (max-width: 480px)
- More visual spacing

---

## Completion Checklist

- [ ] OnboardingPage with step state management
- [ ] WelcomeStep with logo and CTA
- [ ] ProfileStep with form validation
- [ ] PlatformsStep with multi-select
- [ ] ApiStep with secure inputs
- [ ] FirstDesignStep with template options
- [ ] ProgressIndicator component
- [ ] Data persistence on complete
- [ ] Mobile responsive layout

---

*Next: Milestone 3 — Dashboard*
