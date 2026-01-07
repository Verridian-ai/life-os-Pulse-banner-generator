import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import ExportPanel from './ExportPanel';
import { PLATFORM_PRESETS } from '@/constants/platformPresets';

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

describe('ExportPanel', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  it('renders the export panel with all platform options', () => {
    render(<ExportPanel />);

    // Check that the title is rendered
    expect(screen.getByText('Ready to Launch?')).toBeInTheDocument();

    // Check that the platform selector exists
    const platformSelect = screen.getByLabelText('Platform');
    expect(platformSelect).toBeInTheDocument();

    // Check that all platform options are available
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(Object.keys(PLATFORM_PRESETS).length);

    // Verify each platform preset is in the dropdown
    Object.values(PLATFORM_PRESETS).forEach((preset) => {
      const optionText = `${preset.name} (${preset.width}x${preset.height})`;
      expect(screen.getByText(optionText)).toBeInTheDocument();
    });
  });

  it('renders all three fit mode options', () => {
    render(<ExportPanel />);

    // Check that all fit mode buttons exist
    expect(screen.getByText('Fit')).toBeInTheDocument();
    expect(screen.getByText('Crop')).toBeInTheDocument();
    expect(screen.getByText('Stretch')).toBeInTheDocument();

    // Check that "Fit" is selected by default
    const fitButton = screen.getByText('Fit');
    expect(fitButton).toHaveClass('bg-green-500/20');
  });

  it('changes platform selection when dropdown is changed', () => {
    render(<ExportPanel />);

    const platformSelect = screen.getByLabelText('Platform') as HTMLSelectElement;

    // Initially should be LinkedIn (default)
    expect(platformSelect.value).toBe('linkedin');

    // Change to YouTube
    fireEvent.change(platformSelect, { target: { value: 'youtube' } });
    expect(platformSelect.value).toBe('youtube');

    // Verify description updated
    expect(screen.getByText('Channel banner (safe zone: 1546x423)')).toBeInTheDocument();
  });

  it('changes fit mode when buttons are clicked', () => {
    render(<ExportPanel />);

    const fitButton = screen.getByText('Fit');
    const cropButton = screen.getByText('Crop');
    const stretchButton = screen.getByText('Stretch');

    // Initially "Fit" is selected
    expect(fitButton).toHaveClass('bg-green-500/20');
    expect(cropButton).not.toHaveClass('bg-green-500/20');

    // Click "Crop"
    fireEvent.click(cropButton);
    expect(cropButton).toHaveClass('bg-green-500/20');
    expect(fitButton).not.toHaveClass('bg-green-500/20');

    // Click "Stretch"
    fireEvent.click(stretchButton);
    expect(stretchButton).toHaveClass('bg-green-500/20');
    expect(cropButton).not.toHaveClass('bg-green-500/20');
  });

  it('shows correct fit mode descriptions', () => {
    render(<ExportPanel />);

    // Default is "contain"
    expect(screen.getByText('Letterbox to fit entire design')).toBeInTheDocument();

    // Click "Crop"
    const cropButton = screen.getByText('Crop');
    fireEvent.click(cropButton);
    expect(screen.getByText('Crop to fill without letterboxing')).toBeInTheDocument();

    // Click "Stretch"
    const stretchButton = screen.getByText('Stretch');
    fireEvent.click(stretchButton);
    expect(screen.getByText('Stretch to fill (may distort)')).toBeInTheDocument();
  });

  it('renders download button', () => {
    render(<ExportPanel />);

    const downloadButton = screen.getByRole('button', { name: /Download Banner/i });
    expect(downloadButton).toBeInTheDocument();
  });

  it('handles download button click', () => {
    render(<ExportPanel />);

    // Select YouTube platform
    const platformSelect = screen.getByLabelText('Platform');
    fireEvent.change(platformSelect, { target: { value: 'youtube' } });

    // Click download - should not throw error
    const downloadButton = screen.getByRole('button', { name: /Download Banner/i });
    expect(() => fireEvent.click(downloadButton)).not.toThrow();
  });
});
