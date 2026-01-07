import { ViralScore } from '../types';

/**
 * Analyzes content and returns a mock viral score.
 * In production, this would use a language model or heuristic set.
 */
export const calculateViralScore = (content: string): ViralScore => {
    if (!content || content.trim().length < 10) {
        return { overall: 0, hook: 0, readability: 0, engagement: 0, virality: 0 };
    }

    // Simple heuristics for demo purposes
    const hasHook = content.split('\n')[0].length < 80;
    const hasSpacing = content.includes('\n\n');
    const hasHashtags = content.includes('#');
    const length = content.length;

    const hook = hasHook ? 85 : 40;
    const readability = hasSpacing ? 90 : 50;
    const engagement = hasHashtags ? 75 : 60;
    const virality = length > 200 && length < 1200 ? 80 : 50;

    const overall = Math.round((hook + readability + engagement + virality) / 4);

    return {
        overall,
        hook,
        readability,
        engagement,
        virality,
    };
};
