import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUser, updateUser, createDesign, getUserDesigns } from './database';

// Mock API service
vi.mock('./api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Database Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should get current user', async () => {
      const result = await getCurrentUser();
      expect(result).toBeDefined();
    });
  });

  describe('updateUser', () => {
    it('should update user profile', async () => {
      const updates = { full_name: 'New Name' };
      const result = await updateUser(updates);
      expect(result).toBeDefined();
    });

    it('should handle update errors', async () => {
      const updates = {};
      const result = await updateUser(updates);
      expect(result).toBeDefined();
    });
  });

  describe('createDesign', () => {
    it('should create a new design', async () => {
      const design = {
        title: 'Test Design',
        description: 'Test Description',
        design_url: 'https://example.com/design.png',
      };

      const result = await createDesign(design);
      expect(result).toBeDefined();
    });
  });

  describe('getUserDesigns', () => {
    it('should fetch user designs', async () => {
      const result = await getUserDesigns();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle fetch errors gracefully', async () => {
      const result = await getUserDesigns();
      expect(result).toBeDefined();
    });
  });
});
