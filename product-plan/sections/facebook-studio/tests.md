# Facebook Studio Tests

## Unit Tests

### Engagement Score Calculation
- [ ] Calculate overall score from weighted factors
- [ ] Score content type (image > link > text)
- [ ] Analyze text quality (length, emojis, formatting)
- [ ] Evaluate visual quality
- [ ] Assess timing alignment
- [ ] Calculate audience match

### Boost Recommendation
- [ ] Determine if boost is recommended
- [ ] Calculate estimated reach
- [ ] Suggest appropriate budget
- [ ] Provide reasoning for recommendation

### Ad Variant Generation
- [ ] Generate 3-5 headline variants
- [ ] Create body text variations
- [ ] Predict CTR per variant
- [ ] Estimate CPC per variant

## Integration Tests

### Format Switching
- [ ] Switch between Post, Cover, Event, Story
- [ ] Maintain content when possible
- [ ] Update dimensions correctly
- [ ] Show format-specific options

### CTA Integration
- [ ] Display 8 CTA options
- [ ] Preview button on post
- [ ] Link CTA to destination URL
- [ ] Track CTA selection

## User Flow Tests

### Happy Path: Create Ad
1. User selects Post format
2. User uploads image
3. User enters copy
4. System generates 3 ad variants
5. User selects best variant
6. User chooses CTA
7. System shows boost recommendation
8. User exports/publishes

### Empty States
- [ ] No content — show format selector
- [ ] No copy — suggest AI generation
- [ ] No CTA — prompt selection

### Error Handling
- [ ] Text too long (>63,206 chars) — show limit
- [ ] Image wrong ratio — offer crop
- [ ] Invalid URL — highlight error
