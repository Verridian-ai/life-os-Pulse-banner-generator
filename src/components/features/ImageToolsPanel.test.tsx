import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ImageToolsPanel } from './ImageToolsPanel';
import { CanvasContext } from '../../context/CanvasContext';
import { AIContext } from '../../context/AIContext';
import * as apiKeyStorage from '../../services/apiKeyStorage';

// Mock dependencies
vi.mock('../../services/apiKeyStorage', () => ({
  getUserAPIKeys: vi.fn(),
}));

vi.mock('../../services/replicate', () => ({
  getReplicateService: vi.fn(() => ({
    upscale: vi.fn(),
    removeBackground: vi.fn(),
    restore: vi.fn(),
    faceEnhance: vi.fn(),
  })),
}));

const mockAIContext = {
  selectedProvider: 'replicate' as const,
  setSelectedProvider: vi.fn(),
  selectedModel: 'test-model',
  setSelectedModel: vi.fn(),
  availableModels: [],
  modelOverride: null,
  setModelOverride: vi.fn(),
  performanceMetrics: [],
  addMetric: vi.fn(),
  getTotalCost: vi.fn(() => 0),
  getAvgResponseTime: vi.fn(() => 0),
  activeChain: null,
  setActiveChain: vi.fn(),
  chainProgress: 0,
  brandProfile: null,
  updateBrandProfile: vi.fn(),
  editHistory: [],
  addEditTurn: vi.fn(),
  clearEditHistory: vi.fn(),
  replicateOperation: null,
  setReplicateOperation: vi.fn(),
};

const mockCanvasContext = {
  canvasRef: { current: null },
  bgImage: 'https://example.com/background.png',
  elements: [
    {
      id: 'layer-1',
      type: 'image' as const,
      content: 'https://example.com/layer-image.png',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
    },
  ],
  showSafeZones: false,
  setShowSafeZones: vi.fn(),
  profilePic: null,
  setProfilePic: vi.fn(),
  setElements: vi.fn(),
  selectedElementId: null,
  setSelectedElementId: vi.fn(),
  profileTransform: { x: 0, y: 0, scale: 1 },
  setProfileTransform: vi.fn(),
  addToHistory: vi.fn(),
  canUndo: false,
  canRedo: false,
  undo: vi.fn(),
  redo: vi.fn(),
  refImages: [],
  setRefImages: vi.fn(),
  setBgImage: vi.fn(),
};

describe('ImageToolsPanel - Layer Selection', () => {
  // Mocks removed as they are unused now

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
      openrouter_api_key: undefined,
      gemini_api_key: undefined,
      replicate_api_key: 'test-replicate-key',
    });
  });

  it('should render image tools panel', () => {
    render(
      <AIContext.Provider value={mockAIContext}>
        <CanvasContext.Provider value={mockCanvasContext}>
          <ImageToolsPanel />
        </CanvasContext.Provider>
      </AIContext.Provider>,
    );

    expect(screen.getByText(/Banner Workflow/i)).toBeInTheDocument();
  });

  it('should show "Background Image" indicator when no layer is selected', async () => {
    render(
      <AIContext.Provider value={mockAIContext}>
        <CanvasContext.Provider value={{ ...mockCanvasContext, selectedElementId: null }}>
          <ImageToolsPanel />
        </CanvasContext.Provider>
      </AIContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Banner Workflow/i)).toBeInTheDocument();
    });
  });

  it('should show "Selected Layer" indicator when image layer is selected', async () => {
    render(
      <AIContext.Provider value={mockAIContext}>
        <CanvasContext.Provider value={{ ...mockCanvasContext, selectedElementId: 'layer-1' }}>
          <ImageToolsPanel />
        </CanvasContext.Provider>
      </AIContext.Provider>,
    );

    await waitFor(
      () => {
        const layerIndicators = screen.queryAllByText(/Layer Workflow/i);
        expect(layerIndicators.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  });



  it('should auto-detect when text layer is selected (not image)', async () => {
    const contextWithTextLayer = {
      ...mockCanvasContext,
      elements: [
        {
          id: 'text-1',
          type: 'text' as const,
          content: 'Hello World',
          x: 100,
          y: 100,
          width: 200,
          height: 50,
          rotation: 0,
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#ffffff',
        },
      ],
      selectedElementId: 'text-1',
    };

    render(
      <AIContext.Provider value={mockAIContext}>
        <CanvasContext.Provider value={contextWithTextLayer}>
          <ImageToolsPanel />
        </CanvasContext.Provider>
      </AIContext.Provider>,
    );

    await waitFor(() => {
      // Should fallback to banner workflow when text layer is selected
      expect(screen.getByText(/Banner Workflow/i)).toBeInTheDocument();
    });
  });

  it('should show helper text when layer is selected', async () => {
    render(
      <AIContext.Provider value={mockAIContext}>
        <CanvasContext.Provider value={{ ...mockCanvasContext, selectedElementId: 'layer-1' }}>
          <ImageToolsPanel />
        </CanvasContext.Provider>
      </AIContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Layer Workflow/i)).toBeInTheDocument();
    });
  });

  it('should render all tool buttons', () => {
    render(
      <AIContext.Provider value={mockAIContext}>
        <CanvasContext.Provider value={mockCanvasContext}>
          <ImageToolsPanel />
        </CanvasContext.Provider>
      </AIContext.Provider>,
    );

    // In banner mode (default)
    expect(screen.getByText(/Inpaint/i)).toBeInTheDocument();
    expect(screen.getByText(/Magic Edit/i)).toBeInTheDocument();
    expect(screen.getByText(/Enhance Quality/i)).toBeInTheDocument();
  });
});

describe('ImageToolsPanel - Image Source Detection', () => {
  // Mocks removed as they are unused now

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(apiKeyStorage.getUserAPIKeys).mockResolvedValue({
      openrouter_api_key: undefined,
      gemini_api_key: undefined,
      replicate_api_key: 'test-replicate-key',
    });
  });

  it('should update image source when layer selection changes', async () => {
    const { rerender } = render(
      <AIContext.Provider value={mockAIContext}>
        <CanvasContext.Provider value={{ ...mockCanvasContext, selectedElementId: null }}>
          <ImageToolsPanel />
        </CanvasContext.Provider>
      </AIContext.Provider>,
    );

    await waitFor(
      () => {
        expect(screen.getByText(/Banner Workflow/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );

    // Simulate layer selection
    rerender(
      <AIContext.Provider value={mockAIContext}>
        <CanvasContext.Provider value={{ ...mockCanvasContext, selectedElementId: 'layer-1' }}>
          <ImageToolsPanel />
        </CanvasContext.Provider>
      </AIContext.Provider>,
    );

    await waitFor(
      () => {
        const layerIndicators = screen.queryAllByText(/Layer Workflow/i);
        expect(layerIndicators.length).toBeGreaterThan(0);
      },
      { timeout: 3000 },
    );
  });
});
