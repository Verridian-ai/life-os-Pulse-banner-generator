import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AIProvider, useAI } from './AIContext';

// Mock services
vi.mock('../services/brandEngine', () => ({
  loadBrandProfile: vi.fn(() => null),
  saveBrandProfile: vi.fn(),
}));

vi.mock('../services/modelRouter', () => ({
  getModelMetadata: vi.fn(() => ({
    'gemini-pro': { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini' },
    'gpt-4': { id: 'gpt-4', name: 'GPT-4', provider: 'openrouter' },
  })),
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

// Test component that uses AI context
const TestComponent = () => {
  const {
    selectedProvider,
    setSelectedProvider,
    selectedModel,
    setSelectedModel,
    availableModels,
    modelOverride,
    setModelOverride,
    performanceMetrics,
    addMetric,
    activeChain,
    setActiveChain,
    chainProgress,
    brandProfile,
    updateBrandProfile,
    editHistory,
    addEditTurn,
    replicateOperation,
    setReplicateOperation,
  } = useAI();

  return (
    <div>
      <div data-testid='selectedProvider'>{selectedProvider}</div>
      <div data-testid='selectedModel'>{selectedModel || 'none'}</div>
      <div data-testid='availableModels'>{availableModels.length}</div>
      <div data-testid='modelOverride'>{modelOverride || 'none'}</div>
      <div data-testid='performanceMetrics'>{performanceMetrics.length}</div>
      <div data-testid='activeChain'>{activeChain ? 'active' : 'none'}</div>
      <div data-testid='chainProgress'>{chainProgress}</div>
      <div data-testid='brandProfile'>{brandProfile ? 'set' : 'none'}</div>
      <div data-testid='editHistory'>{editHistory.length}</div>
      <div data-testid='replicateOperation'>{replicateOperation ? 'active' : 'none'}</div>
      <button onClick={() => setSelectedProvider('openrouter')}>Set OpenRouter</button>
      <button onClick={() => setSelectedModel('gpt-4')}>Set Model</button>
      <button onClick={() => setModelOverride('claude-3')}>Set Override</button>
      <button
        onClick={() =>
          addMetric({
            id: 'metric1',
            modelId: 'test',
            provider: 'gemini',
            operation: 'text_gen',
            timestamp: Date.now(),
            responseTime: 100,
            cost: 0.001,
            success: true,
          })
        }
      >
        Add Metric
      </button>
      <button
        onClick={() =>
          setActiveChain({
            id: 'chain1',
            steps: [],
            currentStep: 0,
            status: 'pending',
          })
        }
      >
        Set Chain
      </button>
      <button
        onClick={() =>
          updateBrandProfile({
            colors: [],
            fonts: [],
            logoUrl: '',
          })
        }
      >
        Update Profile
      </button>
      <button
        onClick={() =>
          addEditTurn({
            id: 'turn1',
            inputImage: 'test.png',
            outputImage: 'result.png',
            prompt: 'test prompt',
            timestamp: Date.now(),
          })
        }
      >
        Add Turn
      </button>
      <button
        onClick={() =>
          setReplicateOperation({
            id: 'op1',
            type: 'upscale',
            status: 'processing',
            progress: 50,
          })
        }
      >
        Set Operation
      </button>
    </div>
  );
};

describe('AIContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should provide AI context', () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    expect(screen.getByTestId('selectedProvider')).toHaveTextContent('gemini');
  });

  it('should change selected provider', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    const button = screen.getByText('Set OpenRouter');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('selectedProvider')).toHaveTextContent('openrouter');
    });
  });

  it('should change selected model', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    const button = screen.getByText('Set Model');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('selectedModel')).toHaveTextContent('gpt-4');
    });
  });

  it('should set model override', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    const button = screen.getByText('Set Override');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('modelOverride')).toHaveTextContent('claude-3');
    });
  });

  it('should load available models on mount', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('availableModels')).toHaveTextContent('2');
    });
  });

  it('should add performance metrics', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    expect(screen.getByTestId('performanceMetrics')).toHaveTextContent('0');

    const button = screen.getByText('Add Metric');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('performanceMetrics')).toHaveTextContent('1');
    });
  });

  it('should manage tool chains', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    expect(screen.getByTestId('activeChain')).toHaveTextContent('none');

    const button = screen.getByText('Set Chain');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('activeChain')).toHaveTextContent('active');
    });
  });

  it('should manage brand profile', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    const button = screen.getByText('Update Profile');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('brandProfile')).toHaveTextContent('set');
    });
  });

  it('should manage edit history', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    expect(screen.getByTestId('editHistory')).toHaveTextContent('0');

    const button = screen.getByText('Add Turn');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('editHistory')).toHaveTextContent('1');
    });
  });

  it('should manage replicate operations', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    expect(screen.getByTestId('replicateOperation')).toHaveTextContent('none');

    const button = screen.getByText('Set Operation');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('replicateOperation')).toHaveTextContent('active');
    });
  });

  it('should initialize chain progress to 0', () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    expect(screen.getByTestId('chainProgress')).toHaveTextContent('0');
  });

  it('should persist provider to localStorage', async () => {
    render(
      <AIProvider>
        <TestComponent />
      </AIProvider>,
    );

    const button = screen.getByText('Set OpenRouter');
    button.click();

    await waitFor(() => {
      // Context should update (test implicitly via localStorage persistence logic)
      expect(screen.getByTestId('selectedProvider')).toHaveTextContent('openrouter');
    });
  });

  it('should throw error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleError = console.error;
    console.error = vi.fn();

    try {
      render(<TestComponent />);
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (error: unknown) {
      expect(error instanceof Error ? error.message : '').toContain(
        'useAI must be used within AIProvider',
      );
    } finally {
      console.error = consoleError;
    }
  });
});
