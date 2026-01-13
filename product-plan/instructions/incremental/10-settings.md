# Milestone 10: Settings

Build user preferences, API configuration, and account management.

## Prerequisites
- Foundation complete
- Authentication complete

## Deliverables

### Components
1. **SettingsModal** — Main settings container
2. **SettingsTabs** — Tab navigation
3. **AccountSettings** — Profile and account
4. **APIKeySettings** — API key management
5. **APIKeyInput** — Individual key field with validation
6. **AppearanceSettings** — Theme and display
7. **ShortcutsSettings** — Keyboard customization
8. **NotificationsSettings** — Alert preferences
9. **BillingSettings** — Subscription management

### Services
1. **apiKeyStorage** — Encrypted key storage
2. **apiKeyValidator** — Key format and API validation
3. **settingsService** — Preferences persistence

### Context
1. **SettingsContext** — User preferences state

## Data Model

```typescript
interface UserSettings {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  notifications: NotificationPreferences;
  shortcuts: Record<string, string[]>;
}

interface APIKeyConfig {
  provider: 'openai' | 'replicate' | 'openrouter' | 'google';
  label: string;
  isSet: boolean;
  isValid?: boolean;
  lastValidated?: Date;
}

interface Subscription {
  plan: 'free' | 'pro' | 'team';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: Date;
}
```

## Implementation Notes

### API Key Management
- Masked display after entry
- Validation on save
- Status indicator (valid/invalid/unknown)
- Help links to get keys

### Theme System
- Light/Dark/System options
- Immediate preview on change
- Persist to localStorage + database
- System preference detection

### Keyboard Shortcuts
- List all shortcuts with categories
- Click to capture new binding
- Conflict detection
- Reset to defaults

### Billing
- Show current plan and usage
- Upgrade/downgrade flow
- Payment method management
- Invoice history

## Mobile Considerations
- Full-screen modal
- Stack tabs vertically
- Secure keyboard for API keys
- Native share for account links
