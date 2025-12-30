import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePromptEnhance } from './usePromptEnhance';

// Mock the LLM service
vi.mock('@/services/llm', () => ({
  enhancePrompt: vi.fn(),
}));

describe('usePromptEnhance', () => {
  let mockEnhancePrompt: ReturnType<typeof vi.fn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Get the mocked function
    const llmModule = await import('@/services/llm');
    mockEnhancePrompt = llmModule.enhancePrompt as ReturnType<typeof vi.fn>;
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => usePromptEnhance());

    expect(result.current.isEnhancing).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.enhance).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should set error when prompt is empty', async () => {
    const { result } = renderHook(() => usePromptEnhance());

    let enhancedPrompt: string | null = null;
    await act(async () => {
      enhancedPrompt = await result.current.enhance('');
    });

    expect(enhancedPrompt).toBeNull();
    expect(result.current.error).toBe('Please enter a prompt to enhance');
    expect(result.current.isEnhancing).toBe(false);
  });

  it('should set error when prompt is only whitespace', async () => {
    const { result } = renderHook(() => usePromptEnhance());

    let enhancedPrompt: string | null = null;
    await act(async () => {
      enhancedPrompt = await result.current.enhance('   ');
    });

    expect(enhancedPrompt).toBeNull();
    expect(result.current.error).toBe('Please enter a prompt to enhance');
  });

  it('should set isEnhancing to true while enhancing', async () => {
    // Create a promise that we can resolve manually
    let resolvePromise: (value: { enhancedPrompt: string; originalPrompt: string }) => void;
    const pendingPromise = new Promise<{ enhancedPrompt: string; originalPrompt: string }>(
      (resolve) => {
        resolvePromise = resolve;
      },
    );

    mockEnhancePrompt.mockReturnValue(pendingPromise);

    const { result } = renderHook(() => usePromptEnhance());

    // Start enhancement (don't await)
    let enhancePromise: Promise<string | null>;
    act(() => {
      enhancePromise = result.current.enhance('test prompt');
    });

    // Check that isEnhancing is true
    expect(result.current.isEnhancing).toBe(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!({ enhancedPrompt: 'Enhanced test prompt', originalPrompt: 'test prompt' });
      await enhancePromise;
    });

    // Check that isEnhancing is false after completion
    expect(result.current.isEnhancing).toBe(false);
  });

  it('should return enhanced prompt on success', async () => {
    mockEnhancePrompt.mockResolvedValue({
      enhancedPrompt: 'A beautifully enhanced prompt with rich details',
      originalPrompt: 'test prompt',
    });

    const { result } = renderHook(() => usePromptEnhance());

    let enhancedPrompt: string | null = null;
    await act(async () => {
      enhancedPrompt = await result.current.enhance('test prompt');
    });

    expect(enhancedPrompt).toBe('A beautifully enhanced prompt with rich details');
    expect(result.current.error).toBeNull();
    expect(result.current.isEnhancing).toBe(false);
  });

  it('should pass context to enhancePrompt service', async () => {
    mockEnhancePrompt.mockResolvedValue({
      enhancedPrompt: 'Enhanced with context',
      originalPrompt: 'test',
    });

    const { result } = renderHook(() => usePromptEnhance());

    const context = {
      industry: 'tech',
      style: 'professional',
      brandColors: ['#1a73e8', '#34a853'],
    };

    await act(async () => {
      await result.current.enhance('test prompt', context);
    });

    expect(mockEnhancePrompt).toHaveBeenCalledWith('test prompt', context);
  });

  it('should set error when enhancement returns empty result', async () => {
    mockEnhancePrompt.mockResolvedValue({
      enhancedPrompt: '',
      originalPrompt: 'test prompt',
    });

    const { result } = renderHook(() => usePromptEnhance());

    let enhancedPrompt: string | null = null;
    await act(async () => {
      enhancedPrompt = await result.current.enhance('test prompt');
    });

    expect(enhancedPrompt).toBeNull();
    expect(result.current.error).toBe('Enhancement returned empty result');
  });

  it('should handle API errors gracefully', async () => {
    mockEnhancePrompt.mockRejectedValue(new Error('API Error: Rate limit exceeded'));

    const { result } = renderHook(() => usePromptEnhance());

    let enhancedPrompt: string | null = null;
    await act(async () => {
      enhancedPrompt = await result.current.enhance('test prompt');
    });

    expect(enhancedPrompt).toBeNull();
    expect(result.current.error).toBe('API Error: Rate limit exceeded');
    expect(result.current.isEnhancing).toBe(false);
  });

  it('should handle non-Error exceptions gracefully', async () => {
    mockEnhancePrompt.mockRejectedValue('Unknown error string');

    const { result } = renderHook(() => usePromptEnhance());

    let enhancedPrompt: string | null = null;
    await act(async () => {
      enhancedPrompt = await result.current.enhance('test prompt');
    });

    expect(enhancedPrompt).toBeNull();
    expect(result.current.error).toBe('Enhancement failed');
  });

  it('should clear error before starting new enhancement', async () => {
    // First call fails
    mockEnhancePrompt.mockRejectedValueOnce(new Error('First error'));

    const { result } = renderHook(() => usePromptEnhance());

    await act(async () => {
      await result.current.enhance('test prompt');
    });

    expect(result.current.error).toBe('First error');

    // Second call succeeds
    mockEnhancePrompt.mockResolvedValueOnce({
      enhancedPrompt: 'Success!',
      originalPrompt: 'test prompt 2',
    });

    await act(async () => {
      await result.current.enhance('test prompt 2');
    });

    expect(result.current.error).toBeNull();
  });

  it('should clear error using clearError function', async () => {
    mockEnhancePrompt.mockRejectedValue(new Error('Some error'));

    const { result } = renderHook(() => usePromptEnhance());

    await act(async () => {
      await result.current.enhance('test prompt');
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should call enhancePrompt service with correct prompt', async () => {
    mockEnhancePrompt.mockResolvedValue({
      enhancedPrompt: 'Enhanced',
      originalPrompt: 'original',
    });

    const { result } = renderHook(() => usePromptEnhance());

    await act(async () => {
      await result.current.enhance('Create a LinkedIn banner with mountains');
    });

    expect(mockEnhancePrompt).toHaveBeenCalledWith(
      'Create a LinkedIn banner with mountains',
      undefined,
    );
  });

  it('should log prompt enhancement in console', async () => {
    mockEnhancePrompt.mockResolvedValue({
      enhancedPrompt: 'Enhanced prompt',
      originalPrompt: 'test',
    });

    const { result } = renderHook(() => usePromptEnhance());

    await act(async () => {
      await result.current.enhance('A very long test prompt that will be truncated in logs');
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      '[usePromptEnhance] Enhancing prompt:',
      expect.stringContaining('A very long test prompt'),
    );
    expect(consoleLogSpy).toHaveBeenCalledWith('[usePromptEnhance] Enhancement successful');
  });

  it('should log errors in console', async () => {
    mockEnhancePrompt.mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => usePromptEnhance());

    await act(async () => {
      await result.current.enhance('test prompt');
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('[usePromptEnhance] Error:', 'Test error');
  });

  it('should handle multiple concurrent calls correctly', async () => {
    let callCount = 0;
    mockEnhancePrompt.mockImplementation(async (prompt: string) => {
      callCount++;
      const currentCall = callCount;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return {
        enhancedPrompt: `Enhanced ${currentCall}: ${prompt}`,
        originalPrompt: prompt,
      };
    });

    const { result } = renderHook(() => usePromptEnhance());

    let result1: string | null = null;
    let result2: string | null = null;

    await act(async () => {
      const [r1, r2] = await Promise.all([
        result.current.enhance('prompt 1'),
        result.current.enhance('prompt 2'),
      ]);
      result1 = r1;
      result2 = r2;
    });

    // Both calls should complete
    expect(mockEnhancePrompt).toHaveBeenCalledTimes(2);
    expect(result1).toContain('Enhanced');
    expect(result2).toContain('Enhanced');
  });

  it('should maintain stable function references across rerenders', () => {
    const { result, rerender } = renderHook(() => usePromptEnhance());

    const initialEnhance = result.current.enhance;
    const initialClearError = result.current.clearError;

    rerender();

    expect(result.current.enhance).toBe(initialEnhance);
    expect(result.current.clearError).toBe(initialClearError);
  });

  it('should handle undefined enhancedPrompt in response', async () => {
    mockEnhancePrompt.mockResolvedValue({
      enhancedPrompt: undefined as unknown as string,
      originalPrompt: 'test',
    });

    const { result } = renderHook(() => usePromptEnhance());

    let enhancedPrompt: string | null = null;
    await act(async () => {
      enhancedPrompt = await result.current.enhance('test prompt');
    });

    expect(enhancedPrompt).toBeNull();
    expect(result.current.error).toBe('Enhancement returned empty result');
  });
});
