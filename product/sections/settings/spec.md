# Settings Section Specification

## Overview
Application settings including account, preferences, integrations, and billing.

## Section ID
`settings`

## Priority
Core

## User Stories
- As a user, I want to manage my account information
- As a user, I want to customize appearance and motion preferences
- As a user, I want to connect external services
- As a user, I want to manage my subscription and billing

## Screens

### Settings Overview
Main settings navigation.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                                    │
├──────────────────┬──────────────────────────────────────────┤
│  NAVIGATION      │  ACCOUNT                                  │
│  ────────────    │  ──────────────────────────────────────  │
│  ○ Account       │  Profile                                  │
│  ○ Appearance    │  ┌────────────────────────────────────┐  │
│  ○ Integrations  │  │ 👤  John Doe                        │  │
│  ○ Billing       │  │     john@example.com                │  │
│  ○ Data          │  │     [Edit Profile]                  │  │
│  ────────────    │  └────────────────────────────────────┘  │
│  ○ Help          │                                          │
│  ○ About         │  Password                                │
│                  │  ┌────────────────────────────────────┐  │
│                  │  │ Last changed 30 days ago           │  │
│                  │  │ [Change Password]                  │  │
│                  │  └────────────────────────────────────┘  │
│                  │                                          │
│                  │  Email Preferences                       │
│                  │  ┌────────────────────────────────────┐  │
│                  │  │ ☑ Product updates                  │  │
│                  │  │ ☐ Marketing emails                 │  │
│                  │  │ ☑ Design tips                      │  │
│                  │  └────────────────────────────────────┘  │
└──────────────────┴──────────────────────────────────────────┘
```

### Appearance Settings
Theme and motion preferences.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  APPEARANCE                                                  │
├─────────────────────────────────────────────────────────────┤
│  Theme                                                       │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐               │
│  │   ☀️        │ │   🌙       │ │   💻       │               │
│  │   Light    │ │   Dark     │ │   System   │               │
│  │   (Soon)   │ │  ●Active   │ │            │               │
│  └────────────┘ └────────────┘ └────────────┘               │
├─────────────────────────────────────────────────────────────┤
│  Motion                                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Animation Level                                      │    │
│  │ [○ Full] [○ Reduced] [○ None]                       │    │
│  │                                                      │    │
│  │ Luxury Lag (Spring Physics)                         │    │
│  │ [━━━━━━━━━━━●━] 80%                                │    │
│  │                                                      │    │
│  │ ☑ Good Friction (tactile feedback)                  │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Preview                                                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  [Interactive demo of current motion settings]       │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Billing Settings
Subscription and payment management.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  BILLING                                                     │
├─────────────────────────────────────────────────────────────┤
│  Current Plan                                                │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  PRO PLAN                               $12/month   │    │
│  │  ────────────────────────────────────────────────   │    │
│  │  ✓ Unlimited generations                            │    │
│  │  ✓ All templates                                    │    │
│  │  ✓ Brand kit                                        │    │
│  │  ✓ Priority support                                 │    │
│  │                                                      │    │
│  │  Next billing: Feb 15, 2025                         │    │
│  │  [Manage Subscription]                              │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Payment Method                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  💳 •••• •••• •••• 4242                             │    │
│  │     Expires 12/26                                   │    │
│  │     [Update Payment Method]                         │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│  Billing History                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Jan 15, 2025    Pro Plan    $12.00    [Download]   │    │
│  │  Dec 15, 2024    Pro Plan    $12.00    [Download]   │    │
│  │  Nov 15, 2024    Pro Plan    $12.00    [Download]   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Component Props

### SettingsView
```typescript
interface SettingsViewProps {
  user: User;
  subscription: Subscription;
  preferences: UserPreferences;
  integrations: Integration[];
  activeSection: SettingsSection;
  onUpdateProfile: (profile: Partial<User>) => void;
  onChangePassword: () => void;
  onUpdatePreferences: (prefs: Partial<UserPreferences>) => void;
  onConnectIntegration: (integrationId: string) => void;
  onDisconnectIntegration: (integrationId: string) => void;
  onManageSubscription: () => void;
  onNavigateSection: (section: SettingsSection) => void;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  motionLevel: 'full' | 'reduced' | 'none';
  luxuryLagAmount: number; // 0-100
  enableGoodFriction: boolean;
  emailPreferences: {
    productUpdates: boolean;
    marketing: boolean;
    designTips: boolean;
  };
}

type SettingsSection = 'account' | 'appearance' | 'integrations' | 'billing' | 'data' | 'help' | 'about';
```

## States

### Loading State
- Skeleton for profile section
- Loading indicator for integrations

### Saving State
- Inline loading indicator
- "Saving..." text
- Success toast on complete

### Error State
- Inline error message
- Retry action
- Preserve form state

## Interactions

### Theme Selection
- Click to select
- Instant preview
- Smooth transition

### Slider Controls
- Drag for adjustment
- Click for discrete values
- Number input alternative

### Toggle Switches
- Spring animation on toggle
- Immediate effect

## Design Tokens Applied
- Primary: Orange for active nav and CTAs
- Neutral: Stone for panels and sections
- Motion: User-configurable based on preferences
- Semantic: Green for connected, red for destructive

## Accessibility
- Keyboard navigation for all controls
- ARIA labels for toggle states
- Form validation announcements
- Focus management on section change
