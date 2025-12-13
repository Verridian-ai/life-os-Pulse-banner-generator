import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signUp, signIn, signOut, resetPassword, updatePassword } from './auth';

// Mock Supabase client
vi.mock('./auth', async () => {
  const actual = await vi.importActual('./auth');
  return {
    ...actual,
    supabase: {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signInWithOAuth: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
        updateUser: vi.fn(),
        getUser: vi.fn(),
        onAuthStateChange: vi.fn(() => ({
          data: { subscription: { unsubscribe: vi.fn() } },
        })),
      },
    },
  };
});

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should handle successful sign up', async () => {
      const result = await signUp('test@example.com', 'password123', { name: 'Test User' });
      expect(result).toBeDefined();
    });

    it('should handle sign up with missing credentials', async () => {
      const result = await signUp('', '', { name: '' });
      expect(result.error).toBeDefined();
    });
  });

  describe('signIn', () => {
    it('should handle successful sign in', async () => {
      const result = await signIn('test@example.com', 'password123');
      expect(result).toBeDefined();
    });

    it('should handle sign in with invalid credentials', async () => {
      const result = await signIn('invalid@example.com', 'wrongpassword');
      expect(result.error).toBeDefined();
    });
  });

  describe('signOut', () => {
    it('should handle successful sign out', async () => {
      const result = await signOut();
      expect(result).toBeDefined();
    });
  });

  describe('resetPassword', () => {
    it('should handle password reset request', async () => {
      const result = await resetPassword('test@example.com');
      expect(result).toBeDefined();
    });

    it('should handle invalid email for password reset', async () => {
      const result = await resetPassword('');
      expect(result.error).toBeDefined();
    });
  });

  describe('updatePassword', () => {
    it('should handle password update', async () => {
      const result = await updatePassword('newpassword123');
      expect(result).toBeDefined();
    });

    it('should handle weak password', async () => {
      const result = await updatePassword('123');
      expect(result.error).toBeDefined();
    });
  });
});
