/**
 * String Utility Functions
 */

/**
 * Calculate Levenshtein distance between two strings
 * Used for finding similar prompts in AI cache
 */
export const levenshteinDistance = (a: string, b: string): number => {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
};

/**
 * Calculate normalized similarity score between 0 and 1
 * 1 = identical, 0 = completely different
 */
export const calculateSimilarity = (a: string, b: string): number => {
    const maxLength = Math.max(a.length, b.length);
    if (maxLength === 0) return 1.0;

    const distance = levenshteinDistance(a, b);
    return 1 - distance / maxLength;
};

/**
 * Standardize string for comparison (lowercase, trim, collapse whitespace)
 */
export const standardizeString = (str: string): string => {
    return str.toLowerCase().trim().replace(/\s+/g, ' ');
};

/**
 * Get platform-specific shortcut key
 * Replaces 'Ctrl' with 'Cmd' on Mac
 */
export const getShortcutKey = (shortcut: string): string => {
    const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
    if (isMac) {
        return shortcut.replace('Ctrl', 'Cmd');
    }
    return shortcut;
};

/**
 * Format tooltip with keyboard shortcut hint
 */
export const formatTooltip = (label: string, shortcut?: string): string => {
    if (!shortcut) return label;
    return `${label} (${getShortcutKey(shortcut)})`;
};

/**
 * Compute 64-bit SimHash signature for text similarity
 * Uses 3-gram tokenization and FNV-1a hashing
 */
export function computeSimHash(text: string): bigint {
    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
    if (normalized.length < 3) {
        // For very short strings, use simple character-based hash
        let hash = 0n;
        for (let i = 0; i < normalized.length; i++) {
            hash = (hash << 8n) | BigInt(normalized.charCodeAt(i));
        }
        return hash;
    }

    // Generate 3-grams
    const grams: string[] = [];
    for (let i = 0; i <= normalized.length - 3; i++) {
        grams.push(normalized.slice(i, i + 3));
    }

    // Accumulator for 64 bit positions (positive/negative weights)
    const bits: number[] = new Array(64).fill(0);

    for (const gram of grams) {
        // FNV-1a hash for each gram
        let hash = 2166136261n; // FNV offset basis
        for (let i = 0; i < gram.length; i++) {
            hash ^= BigInt(gram.charCodeAt(i));
            hash = (hash * 16777619n) & 0xFFFFFFFFFFFFFFFFn; // FNV prime, mask to 64 bits
        }

        // Update bit accumulator
        for (let i = 0; i < 64; i++) {
            if ((hash >> BigInt(i)) & 1n) {
                bits[i]++;
            } else {
                bits[i]--;
            }
        }
    }

    // Collapse to signature
    let signature = 0n;
    for (let i = 0; i < 64; i++) {
        if (bits[i] > 0) {
            signature |= (1n << BigInt(i));
        }
    }

    return signature;
}

/**
 * Calculate Hamming distance between two 64-bit SimHash signatures
 * Returns number of differing bits (0 = identical, 64 = completely different)
 */
export function hammingDistance(a: bigint, b: bigint): number {
    let xor = a ^ b;
    let count = 0;
    while (xor > 0n) {
        count += Number(xor & 1n);
        xor >>= 1n;
    }
    return count;
}

/**
 * Convert bigint to string for storage (JSON doesn't support bigint)
 */
export function bigintToString(n: bigint): string {
    return n.toString(16).padStart(16, '0');
}

/**
 * Convert string back to bigint
 */
export function stringToBigint(s: string): bigint {
    return BigInt('0x' + s);
}
