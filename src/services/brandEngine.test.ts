import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  extractBrandFromImages,
  saveBrandProfile,
  loadBrandProfile,
  updateBrandProfile,
  clearBrandProfile,
  checkBrandConsistency,
  generateBrandPrompt,
  exportBrandProfile,
  importBrandProfile,
} from './brandEngine';
import type { BrandProfile } from '../types/ai';

// Mock llm service
vi.mock('./llm', () => ({
  generateDesignChatResponse: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Brand Engine Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractBrandFromImages', () => {
    it('should extract brand profile from images using AI', async () => {
      const mockImages = ['data:image/png;base64,iVBORw0KGgoAAAANS...'];
      const mockResponse = {
        text: JSON.stringify({
          colors: [
            { hex: '#1E3A8A', name: 'Navy Blue', usage: 'primary' },
            { hex: '#F97316', name: 'Orange', usage: 'accent' },
          ],
          styleKeywords: ['modern', 'professional', 'tech'],
          industry: 'Technology',
        }),
      };

      const { generateDesignChatResponse } = await import('./llm');
      vi.mocked(generateDesignChatResponse).mockResolvedValue(mockResponse);

      const result = await extractBrandFromImages(mockImages);

      expect(generateDesignChatResponse).toHaveBeenCalledWith(
        expect.stringContaining('Analyze these images to extract brand identity'),
        mockImages
      );
      expect(result.colors).toHaveLength(2);
      expect(result.colors![0].hex).toBe('#1E3A8A');
      expect(result.styleKeywords).toEqual(['modern', 'professional', 'tech']);
      expect(result.industry).toBe('Technology');
      expect(result.version).toBe(1);
      expect(result.lastUpdated).toBeDefined();
    });

    it('should handle AI response with markdown code blocks', async () => {
      const mockImages = ['data:image/png;base64,test'];
      const mockResponse = {
        text: '```json\n{"colors": [{"hex": "#000000", "name": "Black", "usage": "primary"}], "styleKeywords": ["minimalist"]}\n```',
      };

      const { generateDesignChatResponse } = await import('./llm');
      vi.mocked(generateDesignChatResponse).mockResolvedValue(mockResponse);

      const result = await extractBrandFromImages(mockImages);

      expect(result.colors).toHaveLength(1);
      expect(result.styleKeywords).toEqual(['minimalist']);
    });

    it('should handle empty AI response gracefully', async () => {
      const mockImages = ['data:image/png;base64,test'];
      const mockResponse = { text: '{}' };

      const { generateDesignChatResponse } = await import('./llm');
      vi.mocked(generateDesignChatResponse).mockResolvedValue(mockResponse);

      const result = await extractBrandFromImages(mockImages);

      expect(result.colors).toEqual([]);
      expect(result.styleKeywords).toEqual([]);
    });

    it('should propagate errors from AI service', async () => {
      const mockImages = ['data:image/png;base64,test'];

      const { generateDesignChatResponse } = await import('./llm');
      vi.mocked(generateDesignChatResponse).mockRejectedValue(new Error('API error'));

      await expect(extractBrandFromImages(mockImages)).rejects.toThrow('API error');
    });
  });

  describe('saveBrandProfile', () => {
    it('should save brand profile to localStorage', () => {
      const profile: BrandProfile = {
        colors: [{ hex: '#1E3A8A', name: 'Navy Blue', usage: 'primary' }],
        fonts: [{ name: 'Inter', usage: 'body' }],
        styleKeywords: ['modern', 'clean'],
        industry: 'Technology',
        targetAudience: 'Professionals',
        lastUpdated: Date.now(),
        version: 1,
      };

      saveBrandProfile(profile);

      const stored = localStorageMock.getItem('brand_profile');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.colors).toHaveLength(1);
      expect(parsed.industry).toBe('Technology');
    });

    it('should handle save errors gracefully', () => {
      const profile: BrandProfile = {
        colors: [],
        fonts: [],
        styleKeywords: [],
        lastUpdated: Date.now(),
        version: 1,
      };

      // Mock localStorage.setItem to throw
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem = vi.fn(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => saveBrandProfile(profile)).not.toThrow();

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe('loadBrandProfile', () => {
    it('should load brand profile from localStorage', () => {
      const profile: BrandProfile = {
        colors: [{ hex: '#FF0000', name: 'Red', usage: 'accent' }],
        fonts: [{ name: 'Roboto', usage: 'heading' }],
        styleKeywords: ['bold'],
        lastUpdated: Date.now(),
        version: 1,
      };

      localStorageMock.setItem('brand_profile', JSON.stringify(profile));

      const loaded = loadBrandProfile();

      expect(loaded).toBeDefined();
      expect(loaded?.colors).toHaveLength(1);
      expect(loaded?.fonts[0].name).toBe('Roboto');
    });

    it('should return null when no profile exists', () => {
      const result = loadBrandProfile();
      expect(result).toBeNull();
    });

    it('should return null for invalid version', () => {
      const invalidProfile = {
        colors: [],
        fonts: [],
        styleKeywords: [],
        lastUpdated: Date.now(),
        version: 999, // Invalid version
      };

      localStorageMock.setItem('brand_profile', JSON.stringify(invalidProfile));

      const result = loadBrandProfile();
      expect(result).toBeNull();
    });

    it('should handle corrupted localStorage data', () => {
      localStorageMock.setItem('brand_profile', 'invalid-json-{{{');

      const result = loadBrandProfile();
      expect(result).toBeNull();
    });
  });

  describe('updateBrandProfile', () => {
    it('should update existing brand profile', () => {
      const original: BrandProfile = {
        colors: [{ hex: '#000000', name: 'Black', usage: 'primary' }],
        fonts: [],
        styleKeywords: ['minimalist'],
        lastUpdated: 1000,
        version: 1,
      };

      localStorageMock.setItem('brand_profile', JSON.stringify(original));

      const updates = {
        industry: 'Design',
        targetAudience: 'Creatives',
      };

      const updated = updateBrandProfile(updates);

      expect(updated).toBeDefined();
      expect(updated?.industry).toBe('Design');
      expect(updated?.targetAudience).toBe('Creatives');
      expect(updated?.colors).toHaveLength(1); // Original data preserved
      expect(updated?.lastUpdated).toBeGreaterThan(1000);
    });

    it('should return null when no profile exists', () => {
      const result = updateBrandProfile({ industry: 'Tech' });
      expect(result).toBeNull();
    });
  });

  describe('clearBrandProfile', () => {
    it('should remove brand profile from localStorage', () => {
      const profile: BrandProfile = {
        colors: [],
        fonts: [],
        styleKeywords: [],
        lastUpdated: Date.now(),
        version: 1,
      };

      localStorageMock.setItem('brand_profile', JSON.stringify(profile));

      clearBrandProfile();

      expect(localStorageMock.getItem('brand_profile')).toBeNull();
    });
  });

  describe('checkBrandConsistency', () => {
    it('should check if design matches brand guidelines', async () => {
      const imageBase64 = 'data:image/png;base64,test';
      const brandProfile: BrandProfile = {
        colors: [
          { hex: '#1E3A8A', name: 'Navy Blue', usage: 'primary' },
          { hex: '#F97316', name: 'Orange', usage: 'accent' },
        ],
        fonts: [],
        styleKeywords: ['modern', 'professional'],
        industry: 'Technology',
        lastUpdated: Date.now(),
        version: 1,
      };

      const mockResponse = {
        text: JSON.stringify({
          consistent: true,
          score: 85,
          issues: ['Color saturation slightly off'],
        }),
      };

      const { generateDesignChatResponse } = await import('./llm');
      vi.mocked(generateDesignChatResponse).mockResolvedValue(mockResponse);

      const result = await checkBrandConsistency(imageBase64, brandProfile);

      expect(generateDesignChatResponse).toHaveBeenCalledWith(
        expect.stringContaining('Analyze this image against the brand guidelines'),
        [imageBase64]
      );
      expect(result.consistent).toBe(true);
      expect(result.score).toBe(85);
      expect(result.issues).toHaveLength(1);
    });

    it('should return default values on AI error', async () => {
      const imageBase64 = 'data:image/png;base64,test';
      const brandProfile: BrandProfile = {
        colors: [],
        fonts: [],
        styleKeywords: [],
        lastUpdated: Date.now(),
        version: 1,
      };

      const { generateDesignChatResponse } = await import('./llm');
      vi.mocked(generateDesignChatResponse).mockRejectedValue(new Error('Network error'));

      const result = await checkBrandConsistency(imageBase64, brandProfile);

      expect(result.consistent).toBe(true);
      expect(result.score).toBe(100);
      expect(result.issues).toEqual([]);
    });
  });

  describe('generateBrandPrompt', () => {
    it('should enhance prompt with brand guidelines', () => {
      const basePrompt = 'Create a professional banner';
      const brandProfile: BrandProfile = {
        colors: [
          { hex: '#1E3A8A', name: 'Navy Blue', usage: 'primary' },
          { hex: '#F97316', name: 'Orange', usage: 'accent' },
        ],
        fonts: [],
        styleKeywords: ['modern', 'professional', 'tech'],
        industry: 'Technology',
        targetAudience: 'Professionals',
        lastUpdated: Date.now(),
        version: 1,
      };

      const enhanced = generateBrandPrompt(basePrompt, brandProfile);

      expect(enhanced).toContain('Create a professional banner');
      expect(enhanced).toContain('modern, professional, tech');
      expect(enhanced).toContain('#1E3A8A, #F97316');
      expect(enhanced).toContain('Technology');
      expect(enhanced).toContain('Professionals');
    });

    it('should handle minimal brand profile', () => {
      const basePrompt = 'Simple design';
      const brandProfile: BrandProfile = {
        colors: [],
        fonts: [],
        styleKeywords: [],
        lastUpdated: Date.now(),
        version: 1,
      };

      const enhanced = generateBrandPrompt(basePrompt, brandProfile);

      expect(enhanced).toContain('Simple design');
      expect(enhanced).toContain('professional'); // Default industry fallback
    });
  });

  describe('exportBrandProfile', () => {
    it('should export brand profile as JSON string', () => {
      const profile: BrandProfile = {
        colors: [{ hex: '#000000', name: 'Black', usage: 'primary' }],
        fonts: [{ name: 'Arial', usage: 'body' }],
        styleKeywords: ['classic'],
        industry: 'Finance',
        lastUpdated: Date.now(),
        version: 1,
      };

      localStorageMock.setItem('brand_profile', JSON.stringify(profile));

      const exported = exportBrandProfile();

      expect(exported).toBeDefined();
      const parsed = JSON.parse(exported);
      expect(parsed.industry).toBe('Finance');
      expect(parsed.colors).toHaveLength(1);
    });

    it('should return empty string when no profile exists', () => {
      const result = exportBrandProfile();
      expect(result).toBe('');
    });
  });

  describe('importBrandProfile', () => {
    it('should import valid brand profile JSON', () => {
      const validProfile: BrandProfile = {
        colors: [{ hex: '#FF5733', name: 'Coral', usage: 'accent' }],
        fonts: [],
        styleKeywords: ['vibrant', 'energetic'],
        industry: 'Marketing',
        lastUpdated: Date.now(),
        version: 1,
      };

      const success = importBrandProfile(JSON.stringify(validProfile));

      expect(success).toBe(true);
      const loaded = loadBrandProfile();
      expect(loaded?.industry).toBe('Marketing');
      expect(loaded?.styleKeywords).toEqual(['vibrant', 'energetic']);
    });

    it('should reject invalid JSON', () => {
      const success = importBrandProfile('invalid-json-{{{');
      expect(success).toBe(false);
    });

    it('should reject profiles with missing required fields', () => {
      const invalidProfile = {
        industry: 'Tech',
        // Missing required fields: colors, styleKeywords, version
      };

      const success = importBrandProfile(JSON.stringify(invalidProfile));
      expect(success).toBe(false);
    });

    it('should handle import errors gracefully', () => {
      // Profile with all required fields
      const partialProfile = {
        colors: [],
        styleKeywords: [],
        version: 1,
        // Missing fonts but should still be valid
      };

      const success = importBrandProfile(JSON.stringify(partialProfile));
      expect(success).toBe(true);
    });
  });
});
