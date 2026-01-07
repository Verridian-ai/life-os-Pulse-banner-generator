import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as auth from './auth';
import { api } from './api';

// Mock api service
vi.mock('./api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signUp', () => {
    it('should handle successful sign up', async () => {
      vi.mocked(api.post).mockResolvedValue({ success: true, userId: '123' });
      vi.mocked(api.get).mockResolvedValue({ user: { id: '123', email: 'test@example.com' } });

      const result = await auth.signUp('test@example.com', 'password123');
      expect(result.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle sign up error', async () => {
      vi.mocked(api.post).mockResolvedValue({ error: 'Auth failed' });

      const result = await auth.signUp('test@example.com', 'password123');
      expect(result.user).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('signIn', () => {
    it('should handle successful sign in', async () => {
      vi.mocked(api.post).mockResolvedValue({ success: true });
      vi.mocked(api.get).mockResolvedValue({ user: { id: '123', email: 'test@example.com' } });

      const result = await auth.signIn('test@example.com', 'password123');
      expect(result.user).toBeDefined();
      expect(result.error).toBeNull();
    });

    it('should handle sign in error', async () => {
      vi.mocked(api.post).mockResolvedValue({ error: 'Invalid credentials' });

      const result = await auth.signIn('test@example.com', 'password123');
      expect(result.user).toBeNull();
      expect(result.error).toBeDefined();
    });
  });

  describe('signOut', () => {
    it('should handle successful sign out', async () => {
      vi.mocked(api.post).mockResolvedValue({});
      const result = await auth.signOut();
      expect(result.error).toBeNull();
    });
  });

  describe('resetPassword', () => {
    it('should handle password reset request', async () => {
      vi.mocked(api.post).mockResolvedValue({ success: true });
      const result = await auth.resetPassword('test@example.com');
      expect(result.error).toBeNull();
    });
  });

  describe('validateUsernameFormat', () => {
    it('should validate correct username', () => {
      const result = auth.validateUsernameFormat('test_user_123');
      expect(result.isValid).toBe(true);
    });

    it('should reject too short username', () => {
      const result = auth.validateUsernameFormat('ab');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('at least 3');
    });

    it('should reject invalid characters', () => {
      const result = auth.validateUsernameFormat('user-name');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('only contain');
    });
  });
});
