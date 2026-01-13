# Settings Section — Test Instructions

Write tests for settings and preferences.

## Core User Flows

### 1. Update Profile
- User edits name/email
- Changes save successfully
- Toast confirms update
- Profile reflects changes

### 2. Manage API Keys
- User enters API key
- Validation runs
- Status indicator updates
- Key is masked after save

### 3. Change Theme
- User selects theme option
- UI updates immediately
- Preference persists
- System theme detection works

### 4. Customize Shortcuts
- User clicks shortcut
- Key capture begins
- New binding saves
- Conflict detection works

### 5. Manage Subscription
- User views current plan
- Usage stats displayed
- Upgrade/downgrade available
- Payment method manageable

## Empty States

- **No API keys** — Show setup instructions
- **No payment method** — Show add card CTA

## Edge Cases

- Handle invalid API key format
- Handle API validation failure
- Handle shortcut conflicts
- Handle payment method errors
- Preserve settings on modal close

## Accessibility

- All form fields have labels
- Tab navigation works
- Focus trapped in modal
- Error messages are announced
- Toggle switches have proper roles
