# Brand Kit Section — Test Instructions

Write tests for brand profile management.

## Core User Flows

### 1. View Brand Profiles
- User sees grid of brand profile cards
- Each card shows brand name, color swatches, and font
- Active brand profile is visually highlighted

### 2. Set Active Brand
- User can click "Use This Brand" to set active profile
- Active state updates immediately
- Toast notification confirms activation

### 3. Create Brand Profile
- User clicks "New Brand" button
- Brand creation modal/form opens
- User enters brand name, colors, fonts
- New brand appears in grid after save

### 4. Delete Brand Profile
- User opens menu on brand card
- Delete option prompts confirmation
- Brand is removed from grid
- Toast confirms deletion

## Empty States

- **No brands** — Show "No Brand Profiles Yet" with create CTA
- **Loading** — Show skeleton cards during load

## Edge Cases

- Handle brand with no colors defined
- Handle brand with many colors (5+ overflow indicator)
- Prevent deleting active brand without confirmation
- Handle API errors gracefully with toast messages

## Accessibility

- Brand cards are keyboard navigable
- Menu dropdown is accessible
- Color swatches have descriptive titles
- Delete confirmation is focus-trapped
