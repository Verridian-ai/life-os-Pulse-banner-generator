# LinkedIn Content Studio — Test Instructions

Write tests for LinkedIn content creation features.

## Core User Flows

### 1. Write Post Content
- User types in content editor
- Character count updates
- AI suggestions appear
- Hashtags are highlighted

### 2. Get AI Rewrite
- User clicks rewrite button
- Tone selector shown
- AI generates alternative
- User can accept or reject

### 3. View Viral Score
- Score updates as content changes
- Factor breakdown shown
- Improvement suggestions displayed
- Score animates on change

### 4. Generate Image
- User enters image prompt
- Format selector shown
- Image generates with progress
- Result appears in preview

### 5. Publish to LinkedIn
- User clicks publish
- Account selection shown
- Schedule option available
- Confirmation after success

## Empty States

- **No content** — Show writing prompts
- **No image** — Show image suggestion
- **No accounts** — Show connect CTA

## Edge Cases

- Handle LinkedIn API rate limits
- Handle OAuth token expiry
- Handle image generation failures
- Preserve drafts on navigation
- Handle very long posts (truncation warning)

## Accessibility

- Content editor has proper labels
- Score factors are announced
- Publish confirmation is focus-trapped
- All controls are keyboard accessible
