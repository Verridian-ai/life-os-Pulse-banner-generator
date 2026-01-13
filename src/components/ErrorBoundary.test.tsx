import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

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
      </ErrorBoundary>,
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    // Should show error message - component renders "Something unexpected happened"
    expect(screen.getByText(/something unexpected happened/i)).toBeInTheDocument();
  });

  it('should have role alert for accessibility', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>,
    );

    // Should show error alert for accessibility
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    // Should also have action buttons
    expect(screen.getByText(/try again/i)).toBeInTheDocument();
    expect(screen.getByText(/go to dashboard/i)).toBeInTheDocument();
  });
});
