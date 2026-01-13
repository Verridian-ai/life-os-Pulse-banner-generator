import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ToastProvider } from './ToastContext';

// Mock auth service (Neon/Lucia API-based auth)
vi.mock('../services/auth', () => ({
  signUp: vi.fn().mockResolvedValue({ user: null, error: null }),
  signIn: vi.fn().mockResolvedValue({ user: null, session: null, error: null }),
  signInWithGoogle: vi.fn().mockResolvedValue({ data: null, error: null }),
  signInWithGitHub: vi.fn().mockResolvedValue({ data: null, error: null }),
  signOut: vi.fn().mockResolvedValue({ error: null }),
  getSession: vi.fn().mockResolvedValue(null),
  getCurrentUser: vi.fn().mockResolvedValue(null),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } },
  })),
  getCurrentUserProfile: vi.fn().mockResolvedValue({ data: null, error: null }),
}));

// Mock database service (for getUserPreferences)
vi.mock('../services/database', () => ({
  getUserPreferences: vi.fn().mockResolvedValue(null),
  updateUserPreferences: vi.fn().mockResolvedValue(null),
}));

// Test component that uses auth context
const TestComponent = () => {
  const { user, isLoading } = useAuth();

  return (
    <div>
      <div data-testid='loading'>{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid='user'>{user ? 'Logged In' : 'Logged Out'}</div>
    </div>
  );
};

// Wrapper that provides required context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>
    <AuthProvider>{children}</AuthProvider>
  </ToastProvider>
);

describe('AuthContext', () => {
  it('should provide auth context', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  it('should show loading state initially', () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');
  });

  it('should handle no user state', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('Logged Out');
    });
  });
});
