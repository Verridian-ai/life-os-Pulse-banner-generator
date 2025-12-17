import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ImageGallery from './ImageGallery';
import { CanvasContext } from '../../context/CanvasContext';
import * as database from '../../services/database';

// Mock the database service
vi.mock('../../services/database', () => ({
  getUserImages: vi.fn(),
  toggleImageFavorite: vi.fn(),
  deleteImageRecord: vi.fn(),
}));

const mockCanvasContext = {
  setBgImage: vi.fn(),
  canvasRef: { current: null },
  bgImage: null,
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
};

describe('ImageGallery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state initially', () => {
    vi.mocked(database.getUserImages).mockImplementation(
      () => new Promise(() => {}), // Never resolves to keep loading
    );

    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <ImageGallery />
      </CanvasContext.Provider>,
    );

    expect(screen.getByText(/Loading images/i)).toBeInTheDocument();
  });

  it('should display error message when loading fails', async () => {
    const errorMessage = 'Failed to load images from database';
    vi.mocked(database.getUserImages).mockRejectedValue(new Error(errorMessage));

    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <ImageGallery />
      </CanvasContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to Load Gallery/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should show retry button on error', async () => {
    vi.mocked(database.getUserImages).mockRejectedValue(new Error('Database error'));

    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <ImageGallery />
      </CanvasContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  it('should retry loading when retry button is clicked', async () => {
    vi.mocked(database.getUserImages)
      .mockRejectedValueOnce(new Error('First error'))
      .mockResolvedValueOnce([
        {
          id: '1',
          storage_url: 'https://example.com/image.png',
          file_name: 'image.png',
          prompt: 'Test prompt',
          model_used: 'test-model',
          quality: '2K',
          generation_type: 'generate',
          tags: [],
          is_favorite: false,
          created_at: new Date().toISOString(),
        },
      ]);

    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <ImageGallery />
      </CanvasContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /Retry/i });
    fireEvent.click(retryButton);

    await waitFor(() => {
      expect(database.getUserImages).toHaveBeenCalledTimes(2);
    });
  });

  it('should display images when successfully loaded', async () => {
    const mockImages = [
      {
        id: '1',
        storage_url: 'https://example.com/image1.png',
        file_name: 'image1.png',
        prompt: 'Test prompt 1',
        model_used: 'gemini-3-pro',
        quality: '2K',
        generation_type: 'generate',
        tags: ['test'],
        is_favorite: false,
        created_at: new Date().toISOString(),
      },
      {
        id: '2',
        storage_url: 'https://example.com/image2.png',
        file_name: 'image2.png',
        prompt: 'Test prompt 2',
        model_used: 'gemini-3-pro',
        quality: '4K',
        generation_type: 'edit',
        tags: [],
        is_favorite: true,
        created_at: new Date().toISOString(),
      },
    ];

    vi.mocked(database.getUserImages).mockResolvedValue(mockImages);

    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <ImageGallery />
      </CanvasContext.Provider>,
    );

    await waitFor(
      () => {
        // Images use prompt as alt text, not file_name
        expect(screen.getByAltText('Test prompt 1')).toBeInTheDocument();
        expect(screen.getByAltText('Test prompt 2')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should show empty state when no images exist', async () => {
    vi.mocked(database.getUserImages).mockResolvedValue([]);

    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <ImageGallery />
      </CanvasContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/No Images Found/i)).toBeInTheDocument();
      expect(screen.getByText(/Generate your first image to get started/i)).toBeInTheDocument();
    });
  });

  it('should dismiss error when dismiss button is clicked', async () => {
    vi.mocked(database.getUserImages).mockRejectedValue(new Error('Database error'));

    render(
      <CanvasContext.Provider value={mockCanvasContext}>
        <ImageGallery />
      </CanvasContext.Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to Load Gallery/i)).toBeInTheDocument();
    });

    const dismissButton = screen.getByRole('button', { name: /Dismiss/i });
    fireEvent.click(dismissButton);

    await waitFor(() => {
      expect(screen.queryByText(/Failed to Load Gallery/i)).not.toBeInTheDocument();
    });
  });
});
