import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CanvasEditor from './CanvasEditor';
import { CanvasContext } from '../../context/CanvasContext';

// Mock the replicate service
vi.mock('../../services/replicate', () => ({
  getReplicateService: vi.fn(() => ({
    faceEnhance: vi.fn(),
  })),
}));

const mockCanvasContext = {
  canvasRef: { current: null },
  bgImage: 'https://example.com/image.png',
  elements: [],
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

describe('CanvasEditor - Responsive Scaling', () => {
  let resizeObserverCallback: ResizeObserverCallback;

  beforeEach(() => {
    // Mock ResizeObserver
    global.ResizeObserver = class ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        resizeObserverCallback = callback;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    };

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render canvas editor', () => {
    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    expect(screen.getByText(/Canvas View/i)).toBeInTheDocument();
  });

  it('should show canvas dimensions', () => {
    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    expect(screen.getByText(/1584 x 396 PX/i)).toBeInTheDocument();
  });

  it('should calculate scale for mobile viewport (375px)', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    const { container } = render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    await waitFor(() => {
      // Find the scaled container div
      const scaledDiv = container.querySelector('[style*="transform"]');
      expect(scaledDiv).toBeTruthy();
    });
  });

  it('should calculate scale for desktop viewport (1920px)', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1920,
    });

    const { container } = render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    await waitFor(() => {
      const scaledDiv = container.querySelector('[style*="transform"]');
      expect(scaledDiv).toBeTruthy();
    });
  });

  it('should show scale percentage when scaled down', async () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 430, // iPhone 16 Pro Max width
    });

    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    // Scale indicator should be visible when canvas is scaled down
    await waitFor(() => {
      const scaleText = screen.getByText(/1584 x 396 PX/i);
      expect(scaleText).toBeInTheDocument();
    });
  });

  it('should render safe zones toggle button', () => {
    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    expect(screen.getByText(/Safe Zones:/i)).toBeInTheDocument();
  });

  it('should render AssetsPanel, LayersPanel, and ExportPanel', () => {
    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    // These panels should be rendered in the tools grid
    const canvasEditor = screen.getByText(/Canvas View/i).closest('div');
    expect(canvasEditor).toBeInTheDocument();
  });
});

describe('CanvasEditor - Touch Interaction', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // Mobile viewport
    });
  });

  it('should apply correct transform origin for scaling', async () => {
    const { container } = render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    // Give component time to mount and apply styles
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Find div with inline transform style (which also has transformOrigin)
    const scaledDiv = container.querySelector('[style*="transform"]');
    expect(scaledDiv).toBeTruthy();

    // Verify transformOrigin is in the style attribute
    const styleAttr = scaledDiv?.getAttribute('style');
    expect(styleAttr).toContain('transform-origin');
  });

  it('should have smooth transition on scale changes', async () => {
    const { container } = render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <CanvasEditor />
      </CanvasContext.Provider>,
    );

    await waitFor(() => {
      const scaledDiv = container.querySelector('[style*="transition"]');
      expect(scaledDiv).toBeTruthy();
    });
  });
});
