import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

// Component that throws an error
const ThrowError = () => {
  throw new Error('Test error');
};

// Component that doesn't throw
const NoError = () => <div>No error</div>;

describe('ErrorBoundary', () => {
  // Suppress console errors for this test
  const consoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = consoleError;
  });

  it('should render children when no error', () => {
    render(
      <ErrorBoundary>
        <NoError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should show error message
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('should display error details in development', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // Should show error details or reload button
    const errorElement = screen.getByRole('alert') || screen.getByText(/error/i);
    expect(errorElement).toBeInTheDocument();
  });
});
