# Milestone 9: Quick Generate Wizard

Build the streamlined design creation flow with A/B testing.

## Prerequisites
- Foundation complete
- Platform Studio complete
- Templates complete

## Deliverables

### Components
1. **QuickGenerateWizard** — Main wizard container
2. **StepIndicator** — Progress dots navigation
3. **StartingPointStep** — Template or fresh choice
4. **DescriptionStep** — Prompt input with enhancement
5. **FormatStep** — Platform and format selection
6. **GeneratingStep** — Loading state with progress
7. **ABTestResults** — Multiple variant comparison
8. **VariantCard** — Individual design option

### Hooks
1. **useWizardState** — Step and data management
2. **usePromptEnhance** — AI prompt improvement

## Data Model

```typescript
interface WizardState {
  step: WizardStep;
  startingPoint: 'fresh' | 'template';
  selectedTemplate?: Template;
  prompt: string;
  enhancedPrompt?: string;
  referenceImage?: ReferenceImage;
  platform: PlatformType;
  format: CanvasFormat;
  brandProfileId?: string;
  variants: GeneratedDesign[];
  selectedVariant?: GeneratedDesign;
}

interface GeneratedDesign {
  id: string;
  imageUrl: string;
  prompt: string;
  platform: PlatformType;
  format: CanvasFormat;
  generatedAt: Date;
  model: string;
}
```

## Implementation Notes

### Wizard Flow
1. **Starting Point** — Choose template or fresh start
2. **Description** — Enter prompt, toggle enhancement
3. **Format** — Select platform and dimensions
4. **Generating** — Show progress (generate 3-5 variants)
5. **Results** — Compare and select variant
6. **Refine** (optional) — Open in full studio

### Prompt Enhancement
- AI adds style modifiers, quality keywords
- Shows original vs. enhanced
- User can edit enhanced version
- Platform-specific optimizations

### A/B Testing
- Generate 3-5 variants simultaneously
- Same prompt, different seeds
- Side-by-side comparison view
- Regenerate individual or all

### Navigation
- Back button preserves state
- Skip to step (if previous complete)
- Cancel with confirmation

## Mobile Considerations
- One step per screen
- Large touch targets
- Swipeable variant carousel
- Bottom-fixed navigation buttons
