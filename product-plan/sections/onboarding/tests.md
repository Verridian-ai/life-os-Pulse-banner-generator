# Onboarding — Test Instructions

Framework-agnostic test specifications for the onboarding flow.

---

## Unit Tests

### OnboardingPage

**Step Navigation:**
- Initial step is "welcome"
- "Get Started" advances to "profile"
- "Continue" on profile advances to "platforms"
- "Continue" on platforms advances to "api"
- "Skip" on api advances to "first-design"
- Completing first-design calls `onComplete`

**State Persistence:**
- Profile data persists between steps
- Selected platforms persist between steps
- API keys persist between steps

### ProfileStep

**Validation:**
- Empty first name shows error
- Empty last name shows error
- First name under 2 chars shows error
- Last name under 2 chars shows error
- Valid names enable continue button

**Avatar Upload:**
- Click triggers file picker
- Selected image shows preview
- Invalid file type shows error

### PlatformsStep

**Selection:**
- Click platform toggles selection
- Selected platforms show checkmark
- Can select multiple platforms
- Deselecting removes checkmark

### ApiStep

**Input Handling:**
- API keys are masked (password type)
- Can paste keys
- "Skip" button is always visible
- "Continue" validates non-empty keys

---

## Integration Tests

### Full Onboarding Flow

**Happy Path:**
1. Land on welcome screen
2. Click "Get Started"
3. Enter first name, last name
4. Click "Continue"
5. Select 2 platforms
6. Click "Continue"
7. Skip API configuration
8. Select a template
9. Verify redirect to studio

**Skip API Flow:**
1. Complete profile
2. Select platforms
3. Click "Skip for now" on API step
4. Verify advances to first-design

**Profile Validation:**
1. Leave first name empty
2. Click "Continue"
3. Verify error message shown
4. Verify still on profile step

---

## Accessibility Tests

**Keyboard Navigation:**
- Tab navigates through all inputs
- Enter submits current step
- Escape does not close (no modal)

**Screen Reader:**
- Step progress announced
- Error messages announced
- Button states announced

**Focus Management:**
- Focus moves to first input on step change
- Focus trapped within step

---

## Edge Cases

**Refresh Handling:**
- Refreshing mid-flow returns to welcome (no persistence)
- OR: Refreshing resumes at current step (with persistence)

**Back Navigation:**
- Browser back does not break flow
- Consider: Add back button to go to previous step

**Empty Platform Selection:**
- Warn user if no platforms selected
- Allow continue with warning

**Invalid API Key:**
- Show validation message
- Allow user to correct or skip

---

## Visual Tests

**Responsive:**
- Mobile: Stacked layout, touch-friendly
- Tablet: Centered card
- Desktop: Centered with max-width

**Dark Mode:**
- All text visible
- All buttons visible
- Icons have proper contrast

**Animations:**
- Logo fade-in on welcome
- Step transitions smooth
- Platform cards have hover states
