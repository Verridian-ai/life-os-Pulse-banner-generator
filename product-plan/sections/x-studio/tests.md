# X (Twitter) Studio Tests

## Unit Tests

### Engagement Score Calculation
- [ ] Calculate overall engagement score
- [ ] Score hook strength (first tweet)
- [ ] Evaluate thread structure
- [ ] Assess timing alignment
- [ ] Calculate engagement potential (reply drivers)
- [ ] Determine viral potential

### Character Optimization
- [ ] Count characters accurately (280 limit)
- [ ] Handle link shortening (23 chars)
- [ ] Track mentions and hashtags
- [ ] Warn when approaching limit
- [ ] Suggest text reductions

### Thread Analysis
- [ ] Count tweets in thread
- [ ] Calculate total characters
- [ ] Detect hook presence
- [ ] Check for CTA in final tweet
- [ ] Identify visual break opportunities
- [ ] Estimate reading time

## Integration Tests

### Thread Builder
- [ ] Add/remove tweets from thread
- [ ] Reorder tweets via drag-drop
- [ ] Apply numbering style (none, simple, total, emoji)
- [ ] Preview full thread
- [ ] Calculate per-tweet character counts

### Quote Tweet Generator
- [ ] Display 6 quote angles
- [ ] Generate AI suggestions per angle
- [ ] Preview quote tweet appearance
- [ ] Calculate predicted engagement

## User Flow Tests

### Happy Path: Create Thread
1. User selects Thread format
2. User writes hook (first tweet)
3. User adds 5+ tweets
4. System calculates engagement score
5. User applies "simple" numbering (1/)
6. User views suggestions
7. User adds CTA to final tweet
8. Score improves
9. User schedules at optimal time

### Empty States
- [ ] No content — show single tweet editor
- [ ] No media — suggest adding images
- [ ] No scheduling — show best times

### Error Handling
- [ ] Character limit exceeded — highlight overflow
- [ ] Empty tweet in thread — prevent submission
- [ ] Invalid poll options — show requirements (2-4)
