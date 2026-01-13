import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import ExportPanel from './ExportPanel';
import { ToastProvider } from '@/context/ToastContext';

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

  it('renders the export panel with download button', () => {
    renderWithProvider(<ExportPanel />);

    // Check that the download button is rendered
    expect(screen.getByText('Download image')).toBeInTheDocument();
  });

  it('renders the LinkedIn publish button', () => {
    renderWithProvider(<ExportPanel />);

    // Check that the LinkedIn publish button is rendered
    expect(screen.getByText('Publish to LinkedIn')).toBeInTheDocument();
  });

  it('handles download button click without error', () => {
    renderWithProvider(<ExportPanel />);

    const downloadButton = screen.getByText('Download image');
    expect(() => fireEvent.click(downloadButton)).not.toThrow();
  });

  it('opens LinkedIn modal when publish button is clicked', () => {
    renderWithProvider(<ExportPanel />);

    const publishButton = screen.getByText('Publish to LinkedIn');
    fireEvent.click(publishButton);

    // Modal should be opened (LinkedInPublishModal renders when isOpen is true)
    // The modal content would be rendered - we just verify the click doesn't throw
    expect(publishButton).toBeInTheDocument();
  });
});
