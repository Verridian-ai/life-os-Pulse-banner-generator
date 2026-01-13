import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import ExportPanel from './ExportPanel';
import { ToastProvider } from '../../../context/ToastContext';

// Mock the CanvasContext
vi.mock('@/context/CanvasContext', () => ({
  useCanvas: () => ({
    canvasRef: {
      current: {
        generateStageImage: () => 'data:image/png;base64,mockImageData',
      },
    },
  }),
}));

// Test wrapper with required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToastProvider>{children}</ToastProvider>
);

// Custom render with provider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

describe('ExportPanel', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders the export panel container', () => {
    const { container } = renderWithProvider(<ExportPanel />);

    // Check that the panel container is rendered with proper styling
    const panel = container.querySelector('.bg-zinc-900\\/40');
    expect(panel).toBeInTheDocument();
  });

  it('renders with glassmorphism styling', () => {
    const { container } = renderWithProvider(<ExportPanel />);

    // Check for backdrop blur (glassmorphism)
    const panel = container.querySelector('.backdrop-blur-md');
    expect(panel).toBeInTheDocument();
  });

  it('renders LinkedInPublishModal component (initially hidden)', () => {
    renderWithProvider(<ExportPanel />);

    // The modal is rendered but not visible (isOpen=false by default)
    // We verify the component renders without errors
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders with proper border styling', () => {
    const { container } = renderWithProvider(<ExportPanel />);

    // Check for border styling
    const panel = container.querySelector('.border-white\\/10');
    expect(panel).toBeInTheDocument();
  });
});
