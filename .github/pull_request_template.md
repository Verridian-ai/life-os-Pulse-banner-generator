## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

<!-- Mark the relevant option with an 'x' -->

- [ ] 🐛 Bug fix (non-breaking change that fixes an issue)
- [ ] ✨ New feature (non-breaking change that adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📝 Documentation update
- [ ] 🎨 Code style/refactoring (formatting, renaming, etc.)
- [ ] ⚡ Performance improvement
- [ ] ✅ Test update
- [ ] 🔧 Configuration change
- [ ] 🔒 Security fix

## Related Issues

<!-- Link related issues here. Use "Fixes #123" to auto-close issues when merged -->

Fixes #
Related to #

## Changes Made

<!-- List the main changes made in this PR -->

-
-
-

## Screenshots / Videos

<!-- If applicable, add screenshots or videos to demonstrate the changes -->

| Before | After |
|--------|-------|
|        |       |

## Testing

<!-- Describe how you tested these changes -->

### Test Environment

- [ ] Local development
- [ ] Staging environment
- [ ] Production-like environment

### Test Cases

- [ ] Test case 1
- [ ] Test case 2
- [ ] Test case 3

### Browser Testing

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile (iOS/Android)

## Checklist

<!-- Mark completed items with an 'x' -->

### Code Quality

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] No console.log statements in production code
- [ ] Code is properly formatted (ran `npm run format`)

### Testing

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally (`npx vitest run`)
- [ ] I have tested this on multiple browsers/devices

### Documentation

- [ ] I have updated the documentation accordingly
- [ ] I have updated CLAUDE.md if architecture changed
- [ ] I have added/updated JSDoc comments for new functions

### Security & Performance

- [ ] No sensitive data is exposed (API keys, tokens, etc.)
- [ ] No security vulnerabilities introduced
- [ ] Performance impact is acceptable (checked bundle size)
- [ ] Images are optimized
- [ ] No unnecessary re-renders

### Database & Backend

- [ ] Database migrations are included (if applicable)
- [ ] Supabase RLS policies updated (if applicable)
- [ ] API endpoints are properly secured
- [ ] Error handling is implemented

## Deployment Notes

<!-- Any special considerations for deployment? -->

- [ ] Requires environment variable changes
- [ ] Requires database migration
- [ ] Requires Vercel configuration update
- [ ] Requires secrets rotation
- [ ] Should be deployed during low-traffic period

### Environment Variables

<!-- List any new environment variables -->

```env
VITE_NEW_VARIABLE=value
```

## Breaking Changes

<!-- If this PR includes breaking changes, describe them and the migration path -->

**Breaking Changes:**
-

**Migration Steps:**
1.
2.
3.

## Performance Impact

<!-- Describe any performance implications -->

- Bundle size change:
- Load time impact:
- Memory impact:

## Rollback Plan

<!-- How can this change be rolled back if issues arise? -->

1.
2.
3.

## Additional Context

<!-- Add any other context about the PR here -->

## Reviewer Notes

<!-- Any specific areas you want reviewers to focus on? -->

**Please review:**
-
-
-

---

## Post-Merge Tasks

<!-- Tasks to complete after merging -->

- [ ] Update related documentation
- [ ] Notify team in Slack/Discord
- [ ] Monitor error rates in production
- [ ] Update project board
- [ ] Create follow-up issues if needed

---

**By submitting this PR, I confirm that:**
- ✅ I have read and followed the [contributing guidelines](../CONTRIBUTING.md)
- ✅ I have tested my changes thoroughly
- ✅ I am ready for code review
