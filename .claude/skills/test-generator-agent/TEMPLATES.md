# Test Templates & Patterns

> Comprehensive templates for all test types in Nanobanna Pro

---

## Table of Contents

1. [React Component Templates](#react-component-templates)
2. [Hook Templates](#hook-templates)
3. [Service Templates](#service-templates)
4. [API Route Templates](#api-route-templates)
5. [E2E Templates](#e2e-templates)
6. [Mock Factories](#mock-factories)
7. [Test Data Generators](#test-data-generators)

---

## React Component Templates

### 1. Stateless Component with Props

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';
import type { ComponentNameProps } from './types';

describe('ComponentName', () => {
  const defaultProps: ComponentNameProps = {
    title: 'Test Title',
    description: 'Test Description',
    onAction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with required props', () => {
    render(<ComponentName {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('handles optional props', () => {
    render(<ComponentName {...defaultProps} optional="value" />);
    expect(screen.getByText('value')).toBeInTheDocument();
  });

  it('calls callback with correct arguments', () => {
    render(<ComponentName {...defaultProps} />);
    const button = screen.getByRole('button');
    button.click();
    expect(defaultProps.onAction).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'action' })
    );
  });
});
```

### 2. Component with State

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatefulComponent } from './StatefulComponent';

describe('StatefulComponent', () => {
  it('initializes with default state', () => {
    render(<StatefulComponent />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('updates state on user interaction', () => {
    render(<StatefulComponent />);
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    fireEvent.click(incrementButton);
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('resets state on reset button click', () => {
    render(<StatefulComponent />);
    const incrementButton = screen.getByRole('button', { name: /increment/i });
    const resetButton = screen.getByRole('button', { name: /reset/i });

    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    expect(screen.getByText('Count: 2')).toBeInTheDocument();

    fireEvent.click(resetButton);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });
});
```

### 3. Component with Context

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComponentWithContext } from './ComponentWithContext';
import { AuthContext } from '@/context/AuthContext';

describe('ComponentWithContext', () => {
  const mockContextValue = {
    user: { id: '1', name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true,
    logout: vi.fn(),
  };

  const renderWithContext = (contextValue = mockContextValue) => {
    return render(
      <AuthContext.Provider value={contextValue}>
        <ComponentWithContext />
      </AuthContext.Provider>
    );
  };

  it('displays user information when authenticated', () => {
    renderWithContext();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  it('shows login prompt when not authenticated', () => {
    renderWithContext({ ...mockContextValue, isAuthenticated: false });
    expect(screen.getByText(/please log in/i)).toBeInTheDocument();
  });

  it('calls logout when logout button clicked', () => {
    renderWithContext();
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    logoutButton.click();
    expect(mockContextValue.logout).toHaveBeenCalledTimes(1);
  });
});
```

### 4. Component with Async Data

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AsyncComponent } from './AsyncComponent';
import * as api from '@/services/api';

vi.mock('@/services/api');

describe('AsyncComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(api.fetchData).mockReturnValue(new Promise(() => {})); // Never resolves
    render(<AsyncComponent />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays data after successful fetch', async () => {
    const mockData = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ];
    vi.mocked(api.fetchData).mockResolvedValue(mockData);

    render(<AsyncComponent />);

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  it('displays error message on fetch failure', async () => {
    vi.mocked(api.fetchData).mockRejectedValue(new Error('Network error'));

    render(<AsyncComponent />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  it('allows retry after error', async () => {
    vi.mocked(api.fetchData)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce([{ id: '1', name: 'Item 1' }]);

    render(<AsyncComponent />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry/i });
    retryButton.click();

    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
  });
});
```

### 5. Form Component

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormComponent } from './FormComponent';

describe('FormComponent', () => {
  const mockOnSubmit = vi.fn();

  const setup = () => {
    const user = userEvent.setup();
    render(<FormComponent onSubmit={mockOnSubmit} />);
    return { user };
  };

  it('validates required fields', async () => {
    const { user } = setup();
    const submitButton = screen.getByRole('button', { name: /submit/i });

    await user.click(submitButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const { user } = setup();
    const emailInput = screen.getByLabelText(/email/i);

    await user.type(emailInput, 'invalid-email');
    await user.tab();

    expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const { user } = setup();

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  it('clears form after successful submission', async () => {
    mockOnSubmit.mockResolvedValue({ success: true });
    const { user } = setup();

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
    });
  });

  it('displays server errors', async () => {
    mockOnSubmit.mockRejectedValue({ message: 'Email already exists' });
    const { user } = setup();

    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });
});
```

---

## Hook Templates

### 1. Simple State Hook

```typescript
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from './useCounter';

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter());
    expect(result.current.count).toBe(0);
  });

  it('initializes with custom value', () => {
    const { result } = renderHook(() => useCounter(10));
    expect(result.current.count).toBe(10);
  });

  it('increments count', () => {
    const { result } = renderHook(() => useCounter());

    act(() => {
      result.current.increment();
    });

    expect(result.current.count).toBe(1);
  });

  it('decrements count', () => {
    const { result } = renderHook(() => useCounter(5));

    act(() => {
      result.current.decrement();
    });

    expect(result.current.count).toBe(4);
  });

  it('resets to initial value', () => {
    const { result } = renderHook(() => useCounter(10));

    act(() => {
      result.current.increment();
      result.current.increment();
    });

    expect(result.current.count).toBe(12);

    act(() => {
      result.current.reset();
    });

    expect(result.current.count).toBe(10);
  });
});
```

### 2. Async Data Hook

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFetch } from './useFetch';
import * as api from '@/services/api';

vi.mock('@/services/api');

describe('useFetch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useFetch('/api/data'));

    expect(result.current.data).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches data on mount', async () => {
    const mockData = { id: '1', name: 'Test' };
    vi.mocked(api.get).mockResolvedValue(mockData);

    const { result } = renderHook(() => useFetch('/api/data', { immediate: true }));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch errors', async () => {
    const mockError = new Error('Network error');
    vi.mocked(api.get).mockRejectedValue(mockError);

    const { result } = renderHook(() => useFetch('/api/data', { immediate: true }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toEqual(mockError);
  });

  it('refetches data on demand', async () => {
    const mockData1 = { id: '1', name: 'First' };
    const mockData2 = { id: '2', name: 'Second' };

    vi.mocked(api.get)
      .mockResolvedValueOnce(mockData1)
      .mockResolvedValueOnce(mockData2);

    const { result } = renderHook(() => useFetch('/api/data', { immediate: true }));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData1);
    });

    act(() => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2);
    });
  });
});
```

### 3. Effect Hook with Cleanup

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useEventListener } from './useEventListener';

describe('useEventListener', () => {
  it('adds event listener on mount', () => {
    const handler = vi.fn();
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

    renderHook(() => useEventListener('click', handler));

    expect(addEventListenerSpy).toHaveBeenCalledWith('click', handler, undefined);
  });

  it('removes event listener on unmount', () => {
    const handler = vi.fn();
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useEventListener('click', handler));
    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', handler, undefined);
  });

  it('updates handler when callback changes', () => {
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const { rerender } = renderHook(
      ({ callback }) => useEventListener('click', callback),
      { initialProps: { callback: handler1 } }
    );

    window.dispatchEvent(new Event('click'));
    expect(handler1).toHaveBeenCalledTimes(1);

    rerender({ callback: handler2 });

    window.dispatchEvent(new Event('click'));
    expect(handler1).toHaveBeenCalledTimes(1); // Not called again
    expect(handler2).toHaveBeenCalledTimes(1);
  });
});
```

---

## Service Templates

### 1. API Service

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiService } from './apiService';

describe('apiService', () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('get', () => {
    it('fetches data successfully', async () => {
      const mockResponse = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiService.get('/api/endpoint');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/endpoint'),
        expect.objectContaining({ method: 'GET' })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles 404 errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiService.get('/api/endpoint')).rejects.toThrow('Not Found');
    });

    it('includes authorization header when token provided', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiService.get('/api/endpoint', { token: 'test-token' });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('post', () => {
    it('sends data successfully', async () => {
      const mockResponse = { id: '1', created: true };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const payload = { name: 'Test' };
      const result = await apiService.post('/api/endpoint', payload);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/endpoint'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('handles validation errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Validation failed', fields: ['name'] }),
      });

      await expect(apiService.post('/api/endpoint', {})).rejects.toThrow();
    });
  });
});
```

### 2. Utility Service

```typescript
import { describe, it, expect } from 'vitest';
import { formatters } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats positive numbers', () => {
      expect(formatters.formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('formats negative numbers', () => {
      expect(formatters.formatCurrency(-1234.56)).toBe('-$1,234.56');
    });

    it('handles zero', () => {
      expect(formatters.formatCurrency(0)).toBe('$0.00');
    });

    it('rounds to 2 decimal places', () => {
      expect(formatters.formatCurrency(1234.567)).toBe('$1,234.57');
      expect(formatters.formatCurrency(1234.564)).toBe('$1,234.56');
    });

    it('handles very large numbers', () => {
      expect(formatters.formatCurrency(1234567890.12)).toBe('$1,234,567,890.12');
    });
  });

  describe('formatDate', () => {
    it('formats dates in default format', () => {
      const date = new Date('2025-12-13T10:30:00Z');
      expect(formatters.formatDate(date)).toMatch(/Dec 13, 2025/);
    });

    it('handles invalid dates', () => {
      expect(formatters.formatDate(new Date('invalid'))).toBe('Invalid Date');
    });

    it('supports custom formats', () => {
      const date = new Date('2025-12-13');
      expect(formatters.formatDate(date, 'yyyy-MM-dd')).toBe('2025-12-13');
    });
  });
});
```

---

## API Route Templates

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { db } from '../db';

describe('POST /api/banners', () => {
  beforeEach(async () => {
    await db.seed();
  });

  afterEach(async () => {
    await db.cleanup();
  });

  it('creates banner with valid data', async () => {
    const response = await request(app)
      .post('/api/banners')
      .set('Authorization', 'Bearer test-token')
      .send({
        title: 'Test Banner',
        template: 'professional',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      title: 'Test Banner',
      template: 'professional',
      createdAt: expect.any(String),
    });
  });

  it('requires authentication', async () => {
    await request(app)
      .post('/api/banners')
      .send({ title: 'Test' })
      .expect(401);
  });

  it('validates required fields', async () => {
    const response = await request(app)
      .post('/api/banners')
      .set('Authorization', 'Bearer test-token')
      .send({})
      .expect(400);

    expect(response.body.error).toContain('required');
  });
});
```

---

## E2E Templates

```typescript
import { test, expect } from '@playwright/test';

test.describe('Banner Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('creates banner successfully', async ({ page }) => {
    await page.click('text=Create Banner');
    await page.click('text=Professional Template');
    await page.fill('input[name="title"]', 'My LinkedIn Banner');
    await page.click('button:has-text("Generate")');

    await expect(page.locator('.banner-preview')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=My LinkedIn Banner')).toBeVisible();
  });
});
```

---

## Mock Factories

### User Factory
```typescript
export const createMockUser = (overrides = {}) => ({
  id: crypto.randomUUID(),
  name: 'Test User',
  email: 'test@example.com',
  credits: 100,
  isPremium: false,
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

### Banner Factory
```typescript
export const createMockBanner = (overrides = {}) => ({
  id: crypto.randomUUID(),
  userId: 'user-123',
  title: 'Test Banner',
  template: 'professional',
  backgroundImage: null,
  elements: [],
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

---

## Test Data Generators

### Random String
```typescript
export const randomString = (length = 10) => {
  return Math.random().toString(36).substring(2, 2 + length);
};
```

### Random Email
```typescript
export const randomEmail = () => {
  return `test-${randomString()}@example.com`;
};
```

### Random Date
```typescript
export const randomDate = (start = new Date(2020, 0, 1), end = new Date()) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};
```
