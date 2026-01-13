# Quick Generate Wizard — Test Instructions

Write tests for the quick generation flow.

## Core User Flows

### 1. Complete Wizard Flow
- User starts wizard
- Progresses through all steps
- Generates design variants
- Selects and opens in studio

### 2. Choose Starting Point
- User sees template/fresh options
- Template selection opens picker
- Fresh continues to description step

### 3. Prompt Enhancement
- User types prompt
- Enhancement toggle works
- Enhanced prompt is shown
- Reference image can be added

### 4. Compare Variants
- 3-5 variants generated
- User can compare side-by-side
- Regenerate individual variant
- Regenerate all variants

### 5. Select and Continue
- User selects variant
- Continue opens studio
- Selected design is loaded

## Empty States

- **No templates** — Show fresh start only
- **Generation failed** — Show retry option
- **Loading** — Show skeleton variants

## Edge Cases

- Handle generation timeout
- Handle API quota exceeded
- Preserve wizard state on back navigation
- Handle browser refresh during generation
- Handle very long prompts

## Accessibility

- Step indicator announces current step
- All form fields have labels
- Variant selection is keyboard navigable
- Loading states are announced
