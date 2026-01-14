import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CanvasEditor from './CanvasEditor';
import { CanvasProvider } from '../../context/CanvasContext';
import { ToastProvider } from '../../context/ToastContext';
import { AuthProvider } from '../../context/AuthContext';
import { AIProvider } from '../../context/AIContext';

// Mock window.matchMedia for useMediaQuery hook
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock the replicate service
vi.mock('../../services/replicate', () => ({
  getReplicateService: vi.fn(() => ({
    faceEnhance: vi.fn(),
  })),
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TestWrapper: React.FC<{ children: React.ReactNode; canvasValue?: any }> = ({
  children,
  canvasValue,
}) => (
  <ToastProvider>
    <AuthProvider>
      <AIProvider>
        <CanvasProvider value={canvasValue || mockCanvasContext}>{children}</CanvasProvider>
      </AIProvider>
    </AuthProvider>
  </ToastProvider>
);

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
  // Placeholder for callback if needed in future tests
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let resizeObserverCallback: ResizeObserverCallback;

  beforeEach(() => {
    // Mock ResizeObserver
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).ResizeObserver = class ResizeObserver {
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
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    // Check for canvas element
    const canvas = document.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('should show canvas dimensions in format selector', () => {
    render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    // The format selector shows dimensions like "1584 × 396"
    expect(screen.getByText(/1584/)).toBeInTheDocument();
  });

  it('should render safe zones toggle with correct state when enabled', () => {
    render(
      <TestWrapper canvasValue={{ ...mockCanvasContext, showSafeZones: true }}>
        <CanvasEditor />
      </TestWrapper>,
    );

    // When safe zones are enabled, the toggle button should have active styling (bg-purple-600)
    const safeZonesButton = screen.getByTitle('Toggle Safe Zones');
    expect(safeZonesButton).toBeInTheDocument();
    expect(safeZonesButton).toHaveClass('bg-purple-600');
  });

  it('should render canvas editor layout with header and actions', () => {
    const { container } = render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    // Check that the canvas editor renders the main structure
    // The editor has a max-width container
    const maxWidthContainer = container.querySelector('.max-w-\\[1400px\\]');
    expect(maxWidthContainer).toBeTruthy();
  });

  it('should render safe zones toggle button', () => {
    render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    // The button has title "Toggle Safe Zones" and text "Safe Zones"
    expect(screen.getByTitle('Toggle Safe Zones')).toBeInTheDocument();
  });

  it('should render canvas container', () => {
    const { container } = render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    // Check that the canvas container is rendered
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
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

  it('should apply correct touch-none to canvas', async () => {
    const { container } = render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas?.className).toContain('touch-none');
  });
});
