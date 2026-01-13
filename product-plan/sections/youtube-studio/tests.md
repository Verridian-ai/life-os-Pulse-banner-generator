# YouTube Studio Tests

## Unit Tests

### CTR Score Calculation
- [ ] Calculate overall CTR from weighted factors
- [ ] Score text readability (contrast, size, font)
- [ ] Detect faces and emotions in thumbnails
- [ ] Analyze color contrast and saturation
- [ ] Calculate brand consistency score
- [ ] Generate improvement suggestions

### Title Analyzer
- [ ] Count characters and validate length (50-60 optimal)
- [ ] Detect power words and emotional triggers
- [ ] Check for number patterns (listicles)
- [ ] Calculate clickability score
- [ ] Suggest title improvements

### Keyword Suggestions
- [ ] Generate relevant keywords from content
- [ ] Display search volume estimates
- [ ] Rank by relevance and competition
- [ ] Filter by category/topic

## Integration Tests

### Thumbnail Designer
- [ ] Load YouTube format presets (1280x720, etc.)
- [ ] Display safe zones overlay
- [ ] Preview profile picture placement
- [ ] Export in correct dimensions

### A/B Testing
- [ ] Generate 3-5 thumbnail variants
- [ ] Display side-by-side comparison
- [ ] Show CTR predictions per variant
- [ ] Track selection history

## User Flow Tests

### Happy Path: Create Thumbnail
1. User selects YouTube format
2. User uploads or generates image
3. System calculates CTR score
4. User views suggestions
5. User makes adjustments
6. CTR score improves
7. User exports thumbnail

### Empty States
- [ ] No image uploaded — show upload prompt
- [ ] No title entered — prompt for title analysis
- [ ] No keywords — suggest based on content

### Error Handling
- [ ] Invalid image format — show supported formats
- [ ] Image too small — suggest upscaling
- [ ] API failure — retry with fallback
