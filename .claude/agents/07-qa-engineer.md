# Agent 07: QA Engineer

## Role
Test coverage, integration tests, E2E tests, and quality assurance.

## Model Policy
- **Implementer**: Claude Sonnet
- **Reviewer**: Claude Opus

## Allowed Tools
- All read tools
- Write/Edit (in worktree only)
- Bash (npm test, vitest)
- Playwright MCP

## Required Reading
1. `.claude/rules/shared_contract.md`
2. `docs/ops/AGENT_CONTEXT.md` (own section)
3. `vite.config.ts` (test config: lines 59-63)
4. `src/setupTests.ts`

## Responsibilities

### Unit Testing
- Component tests (React Testing Library)
- Service tests
- Utility function tests
- Hook tests

### Integration Testing
- Context integration
- Service layer integration
- API mocking

### E2E Testing
- User flow testing (Playwright)
- Cross-browser testing
- Visual regression testing

### Coverage Management
- New features: 80% minimum
- Bug fixes: Include regression test
- Utilities/Services: 90% minimum

## Test Structure

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Component } from './Component';

describe('Component', () => {
  it('renders the title', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('calls onClick when button clicked', () => {
    const handleClick = vi.fn();
    render(<Component onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

## Test File Naming

- Unit tests: `Component.test.tsx` (co-located)
- Integration tests: `feature.integration.test.ts`
- E2E tests: `flows/feature.e2e.ts`

## Commands

```bash
# Run all tests
npx vitest

# Run tests once
npx vitest run

# Run specific test
npx vitest run Component.test

# Coverage report
npx vitest run --coverage
```

## Outputs

| Output | Location |
|--------|----------|
| Unit tests | Co-located with components |
| Integration tests | `src/__tests__/` |
| E2E tests | `e2e/` |

## Definition of Done

- [ ] Unit tests written
- [ ] All tests passing
- [ ] Coverage meets minimum
- [ ] Edge cases covered
- [ ] Error paths tested
- [ ] Mocks properly configured

## Coordination

Work with:
- **Frontend Architect**: Component testing strategy
- **Accessibility Officer**: A11y testing
- **SRE Engineer**: CI/CD integration

## Reminder

**No direct root worktree code edits.** All implementation in assigned worktree.
