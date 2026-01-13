# Instagram Studio Tests

## Unit Tests

### Engagement Score Calculation
- [ ] Calculate overall engagement from weighted factors
- [ ] Score visual quality (composition, colors, faces)
- [ ] Analyze caption quality (length, emojis, questions)
- [ ] Evaluate hashtag effectiveness
- [ ] Predict optimal posting time
- [ ] Generate improvement suggestions

### Hashtag Optimizer
- [ ] Load hashtag categories (branded, community, niche, etc.)
- [ ] Calculate combined reach estimate
- [ ] Validate hashtag count (max 30)
- [ ] Detect banned/shadow-banned hashtags
- [ ] Suggest related hashtags

### Carousel Planning
- [ ] Support 2-10 slides
- [ ] Maintain aspect ratio across slides
- [ ] Track individual slide content
- [ ] Preview swipe animation

## Integration Tests

### Format Switching
- [ ] Switch between Post, Story, Reel formats
- [ ] Maintain content when switching (crop/refit)
- [ ] Update safe zones per format
- [ ] Preview at correct aspect ratio

### Grid Preview
- [ ] Display 9-post grid preview
- [ ] Show how new post fits aesthetic
- [ ] Analyze color consistency
- [ ] Suggest improvements for feed flow

## User Flow Tests

### Happy Path: Create Carousel
1. User selects Carousel format
2. User adds 5 slides
3. System calculates engagement score
4. User adds hashtags from suggestions
5. Score improves
6. User schedules post

### Empty States
- [ ] No content — show format selection
- [ ] No hashtags — suggest relevant sets
- [ ] No caption — show generator prompt

### Error Handling
- [ ] Too many slides (>10) — show limit message
- [ ] Invalid aspect ratio — offer crop tool
- [ ] Hashtag limit exceeded — highlight excess
