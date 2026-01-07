import { describe, it, expect } from 'vitest';
import { calculateSimilarity, standardizeString } from './stringUtils';

describe('Similarity Logic', () => {
    describe('standardizeString', () => {
        it('should lowercase and trim', () => {
            expect(standardizeString('  Test String  ')).toBe('test string');
        });

        it('should normalize whitespace', () => {
            expect(standardizeString('word1   word2\t word3')).toBe('word1 word2 word3');
        });
    });

    describe('calculateSimilarity', () => {
        it('should return 1.0 for identical strings', () => {
            expect(calculateSimilarity('test', 'test')).toBe(1.0);
        });

        it('should return 0.0 for completely different strings of same length', () => {
            // 'abc' vs 'xyz' is 0 similarity? 
            // Levenshtein('abc', 'xyz') is 3. Max len 3. 1 - 3/3 = 0.
            expect(calculateSimilarity('abc', 'xyz')).toBe(0.0);
        });

        it('should return high score for minor differences', () => {
            const s1 = 'professional blue banner';
            const s2 = 'professional blue baner'; // Typo
            // 'banner' vs 'baner' -> distance 1.
            // Length: 24 vs 23. Max 24.
            // Distance: 1. Score: 1 - 1/24 = 0.958.
            expect(calculateSimilarity(s1, s2)).toBeGreaterThan(0.9);
        });

        it('should return high score for whitespace differences if standardized', () => {
            // Note: calculateSimilarity itself uses Levenshtein. 
            // Use standardizeString first for best results.
            const raw1 = ' professional  blue   banner ';
            const raw2 = 'professional blue banner';

            const s1 = standardizeString(raw1);
            const s2 = standardizeString(raw2);

            expect(s1).toBe(s2); // Should be identical after standardization
            expect(calculateSimilarity(s1, s2)).toBe(1.0);
        });

        it('should handle small changes', () => {
            // "dark mode" vs "drak mode"
            // distance 2 (swap). Length 9.
            // 1 - 2/9 = 0.77.
            expect(calculateSimilarity('dark mode', 'drak mode')).toBeCloseTo(0.77, 1);
        });
    });
});
