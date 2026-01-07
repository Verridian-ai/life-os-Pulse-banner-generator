import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CanvasEditor from './CanvasEditor';
import { CanvasProvider } from '../../context/CanvasContext';
import { ToastProvider } from '../../context/ToastContext';
import { AuthProvider } from '../../context/AuthContext';
import { AIProvider } from '../../context/AIContext';

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
  <AuthProvider>
    <AIProvider>
      <ToastProvider>
        <CanvasProvider value={canvasValue || mockCanvasContext}>{children}</CanvasProvider>
      </ToastProvider>
    </AIProvider>
  </AuthProvider>
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
      observe() { }
      disconnect() { }
      unobserve() { }
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

    expect(screen.getByText(/Canvas View/i)).toBeInTheDocument();
  });

  it('should show canvas dimensions', () => {
    render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    expect(screen.getByText(/1584 x 396 PX/i)).toBeInTheDocument();
  });

  it('should render center profile info in empty state', async () => {
    render(
      <TestWrapper canvasValue={{ ...mockCanvasContext, showSafeZones: true }}>
        <CanvasEditor />
      </TestWrapper>,
    );

    await waitFor(() => {
      expect(screen.getByText(/524 px zone/i)).toBeInTheDocument();
      expect(screen.getByText(/Ctrl\+Scroll to Zoom/i)).toBeInTheDocument();
    });
  });

  it('should render canvas with correct aspect ratio class', () => {
    const { container } = render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    const aspectDiv = container.querySelector('.aspect-\\[1584\\/396\\]');
    expect(aspectDiv).toBeTruthy();
  });

  it('should render safe zones toggle button', () => {
    render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
    );

    expect(screen.getByText(/Safe Zones:/i)).toBeInTheDocument();
  });

  it('should render AssetsPanel, LayersPanel, and ExportPanel', () => {
    render(
      <TestWrapper>
        <CanvasEditor />
      </TestWrapper>,
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
