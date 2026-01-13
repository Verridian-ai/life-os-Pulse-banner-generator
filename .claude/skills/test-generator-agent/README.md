# Test Generator Agent

> Auto-generate comprehensive test suites with high coverage for React components, hooks, services, and utilities.

## Quick Start

### Generate Component Tests
```
User: "Generate tests for CreditDisplay component"

Agent generates:
✓ Rendering tests
✓ Interaction tests
✓ State management tests
✓ Error handling tests
✓ Edge case tests
✓ Accessibility tests

Coverage: 90%+
```

### Generate Hook Tests
```
User: "Add tests for useDebounce hook"

Agent generates:
✓ Initial state tests
✓ State update tests
✓ Cleanup tests
✓ Edge case tests

Coverage: 100%
```

### Increase Coverage
```
User: "Increase coverage for llm.ts to 80%"

Agent:
1. Analyzes existing tests
2. Identifies coverage gaps
3. Generates missing test cases
4. Verifies coverage target met
```

---

## Capabilities

| Feature | Description |
|---------|-------------|
| **Unit Tests** | Pure functions, utilities, services |
| **Component Tests** | React components with RTL |
| **Hook Tests** | Custom hooks with renderHook |
| **Integration Tests** | API routes, full data flows |
| **E2E Tests** | Critical user journeys (Playwright) |
| **Coverage Analysis** | Identify untested code paths |
| **Edge Cases** | Boundary conditions, null handling |
| **Mock Generation** | Auto-generate mocks for dependencies |

---

## Test Patterns

### Arrange-Act-Assert (AAA)
```typescript
it('updates count on button click', () => {
  // Arrange
  render(<Counter initialCount={0} />);

  // Act
  fireEvent.click(screen.getByRole('button'));

  // Assert
  expect(screen.getByText('1')).toBeInTheDocument();
});
```

### Given-When-Then (BDD)
```typescript
it('completes checkout flow', async () => {
  // Given: User has items in cart
  await addToCart('Product A');

  // When: User completes checkout
  await clickCheckout();
  await fillPaymentInfo();
  await submitOrder();

  // Then: Order is confirmed
  expect(await getOrderStatus()).toBe('confirmed');
});
```

---

## Usage Examples

### 1. New Component Tests
```
User: "Create tests for src/features/dashboard/components/StatsCard.tsx"

Output:
✓ src/features/dashboard/components/StatsCard.test.tsx
  - 15 test cases
  - 92% coverage
  - All edge cases covered
```

### 2. Existing Tests Enhancement
```
User: "The tests for UserForm are missing validation tests"

Output:
✓ Updated src/features/auth/components/UserForm.test.tsx
  - Added 8 validation test cases
  - Coverage: 68% → 85%
```

### 3. Hook Tests
```
User: "Generate tests for useLocalStorage hook"

Output:
✓ src/hooks/useLocalStorage.test.ts
  - Tests for get, set, remove
  - Tests for JSON serialization
  - Tests for storage events
  - Tests for SSR compatibility
  - Coverage: 100%
```

### 4. Service Integration Tests
```
User: "Add integration tests for auth service"

Output:
✓ src/services/auth.test.ts
  - Login flow tests
  - Token refresh tests
  - Error handling tests
  - Session management tests
  - Coverage: 88%
```

### 5. E2E Tests
```
User: "Create E2E test for banner creation flow"

Output:
✓ tests/e2e/banner-creation.spec.ts
  - Complete flow from upload to download
  - Tests for AI generation
  - Tests for manual editing
  - Tests for error scenarios
```

---

## Coverage Targets

| Test Type | Min Coverage | Target Coverage |
|-----------|--------------|-----------------|
| Unit Tests | 80% | 90%+ |
| Component Tests | 80% | 85%+ |
| Hook Tests | 90% | 100% |
| Integration Tests | 70% | 80%+ |
| Services | 85% | 90%+ |

---

## Best Practices

### 1. Test Behavior, Not Implementation
```typescript
// ❌ Bad: Testing implementation details
expect(component.state.count).toBe(1);

// ✅ Good: Testing user-visible behavior
expect(screen.getByText('1')).toBeInTheDocument();
```

### 2. Descriptive Test Names
```typescript
// ❌ Bad
it('test1', () => { ... });

// ✅ Good
it('displays error message when API returns 400', () => { ... });
```

### 3. One Behavior Per Test
```typescript
// ❌ Bad: Multiple assertions for different behaviors
it('form works', () => {
  expect(form.isValid()).toBe(true);
  expect(form.onSubmit()).toBeCalled();
  expect(form.hasErrors()).toBe(false);
});

// ✅ Good: Separate tests
it('validates form correctly', () => { ... });
it('calls onSubmit when valid', () => { ... });
it('shows no errors when valid', () => { ... });
```

### 4. Meaningful Test Data
```typescript
// ❌ Bad: Arbitrary data
const user = { name: 'a', age: 1 };

// ✅ Good: Realistic data
const user = { name: 'John Doe', age: 30 };
```

### 5. Clean Up After Tests
```typescript
afterEach(() => {
  vi.clearAllMocks();
  cleanup();
});
```

---

## Common Test Scenarios

### Loading States
```typescript
it('shows loading spinner during fetch', async () => {
  render(<DataComponent />);
  expect(screen.getByRole('status')).toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
```

### Error States
```typescript
it('displays error message on fetch failure', async () => {
  mockFetch.mockRejectedValueOnce(new Error('Network error'));
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

### Empty States
```typescript
it('shows empty state when no data', () => {
  render(<DataList data={[]} />);
  expect(screen.getByText(/no data/i)).toBeInTheDocument();
});
```

### Conditional Rendering
```typescript
it('renders premium badge for premium users', () => {
  render(<UserProfile user={{ isPremium: true }} />);
  expect(screen.getByTestId('premium-badge')).toBeInTheDocument();
});

it('does not render premium badge for free users', () => {
  render(<UserProfile user={{ isPremium: false }} />);
  expect(screen.queryByTestId('premium-badge')).not.toBeInTheDocument();
});
```

---

## Mock Patterns

### Mock API Call
```typescript
vi.mock('@/services/api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: '1', name: 'Test' })),
}));
```

### Mock Context
```typescript
const mockAuth = { user: { id: '1' }, logout: vi.fn() };

const wrapper = ({ children }) => (
  <AuthContext.Provider value={mockAuth}>
    {children}
  </AuthContext.Provider>
);

render(<Component />, { wrapper });
```

### Mock Router
```typescript
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
```

---

## Performance Tips

1. **Run Tests in Parallel**: Vitest does this by default
2. **Use `test.concurrent`** for independent tests
3. **Mock Heavy Dependencies**: Don't make real API calls
4. **Avoid `waitFor` When Possible**: Use `findBy*` queries
5. **Keep Tests Focused**: One behavior per test

---

## Troubleshooting

### Flaky Tests
```typescript
// Use waitFor with timeout
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, { timeout: 3000 });

// Or use findBy (built-in waiting)
const element = await screen.findByText('Loaded');
```

### Async Issues
```typescript
// Always await async operations
await act(async () => {
  await result.current.fetchData();
});
```

### Mock Not Working
```typescript
// Clear mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Or reset to original implementation
afterAll(() => {
  vi.restoreAllMocks();
});
```

---

## Integration with CI/CD

### Pre-commit Hook
```bash
# .husky/pre-commit
npm run test:changed
npm run test:coverage -- --threshold 80
```

### GitHub Actions
```yaml
- name: Run Tests
  run: npm test -- --coverage
- name: Check Coverage
  run: npm run test:coverage -- --threshold 80
```

---

## Cost Estimate

| Task | Tokens | Cost |
|------|--------|------|
| Simple component (5 tests) | 12,000 | $0.29 |
| Complex component (15 tests) | 25,000 | $0.60 |
| Custom hook (8 tests) | 18,000 | $0.43 |
| Service (20 tests) | 32,000 | $0.77 |
| Integration test | 20,000 | $0.48 |
| E2E test | 15,000 | $0.36 |

**Average cost per test file**: $0.40-$0.70

---

## Related Skills

- **Coding Agent**: Implements the actual features
- **Debugging Agent**: Fixes failing tests
- **Refactoring Agent**: Updates tests during refactoring
- **QA Agent**: Runs test suites and validates coverage

---

## References

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
