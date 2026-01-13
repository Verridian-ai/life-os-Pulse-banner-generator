import { describe, it, expect } from 'vitest';
import {
    calculateSimilarity,
    standardizeString,
    computeSimHash,
    hammingDistance,
    bigintToString,
    stringToBigint
} from './stringUtils';

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

describe('SimHash LSH Functions', () => {
    describe('computeSimHash', () => {
        it('should return consistent hash for same input', () => {
            const text = 'professional blue banner for linkedin';
            const hash1 = computeSimHash(text);
            const hash2 = computeSimHash(text);
            expect(hash1).toBe(hash2);
        });

        it('should return similar hashes for similar text', () => {
            const text1 = 'professional blue banner for linkedin';
            const text2 = 'professional blue banner for linkedIn'; // case diff
            const hash1 = computeSimHash(text1);
            const hash2 = computeSimHash(text2);
            // Similar text should have low hamming distance
            const dist = hammingDistance(hash1, hash2);
            expect(dist).toBeLessThanOrEqual(10);
        });

        it('should return different hashes for different text', () => {
            const text1 = 'professional blue banner';
            const text2 = 'cute cat playing piano';
            const hash1 = computeSimHash(text1);
            const hash2 = computeSimHash(text2);
            // Different text should have higher hamming distance
            const dist = hammingDistance(hash1, hash2);
            expect(dist).toBeGreaterThan(15);
        });

        it('should handle short strings', () => {
            const short = 'hi';
            const hash = computeSimHash(short);
            expect(hash).toBeDefined();
            expect(typeof hash).toBe('bigint');
        });

        it('should handle empty string', () => {
            const hash = computeSimHash('');
            expect(hash).toBe(0n);
        });
    });

    describe('hammingDistance', () => {
        it('should return 0 for identical values', () => {
            expect(hammingDistance(0n, 0n)).toBe(0);
            expect(hammingDistance(123n, 123n)).toBe(0);
        });

        it('should count differing bits correctly', () => {
            // 0b0001 vs 0b0011 = 1 bit different
            expect(hammingDistance(1n, 3n)).toBe(1);
            // 0b1111 vs 0b0000 = 4 bits different
            expect(hammingDistance(15n, 0n)).toBe(4);
        });

        it('should handle large values', () => {
            const a = 0xFFFFFFFFFFFFFFFFn; // all 1s
            const b = 0n; // all 0s
            expect(hammingDistance(a, b)).toBe(64);
        });
    });

    describe('bigint serialization', () => {
        it('should round-trip correctly', () => {
            const original = 0xDEADBEEF12345678n;
            const str = bigintToString(original);
            const restored = stringToBigint(str);
            expect(restored).toBe(original);
        });

        it('should pad to 16 characters', () => {
            const small = 255n;
            const str = bigintToString(small);
            expect(str.length).toBe(16);
            expect(str).toBe('00000000000000ff');
        });

        it('should handle zero', () => {
            const str = bigintToString(0n);
            expect(str).toBe('0000000000000000');
            expect(stringToBigint(str)).toBe(0n);
        });
    });
});
