import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CanvasProvider, useCanvas } from './CanvasContext';

// Test component that uses canvas context
const TestComponent = () => {
  const {
    bgImage,
    setBgImage,
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    showSafeZones,
    setShowSafeZones,
    profilePic,
    setProfilePic,
    refImages,
    setRefImages,
    isProcessingImg,
    setIsProcessingImg,
    canUndo,
    canRedo,
    addElement,
    deleteElement,
    profileTransform,
    setProfileTransform
  } = useCanvas();

  return (
    <div>
      <div data-testid="bgImage">{bgImage || 'none'}</div>
      <div data-testid="elements">{elements.length}</div>
      <div data-testid="selectedElementId">{selectedElementId || 'none'}</div>
      <div data-testid="showSafeZones">{showSafeZones ? 'true' : 'false'}</div>
      <div data-testid="profilePic">{profilePic || 'none'}</div>
      <div data-testid="refImages">{refImages.length}</div>
      <div data-testid="isProcessingImg">{isProcessingImg ? 'true' : 'false'}</div>
      <div data-testid="canUndo">{canUndo ? 'true' : 'false'}</div>
      <div data-testid="canRedo">{canRedo ? 'true' : 'false'}</div>
      <div data-testid="profileTransform">{JSON.stringify(profileTransform)}</div>
      <button onClick={() => setBgImage('test.png')}>Set BG</button>
      <button onClick={() => setElements([{ id: '1', type: 'text', x: 0, y: 0, text: 'Test' }])}>
        Add Element
      </button>
      <button onClick={() => setSelectedElementId('1')}>Select Element</button>
      <button onClick={() => setShowSafeZones(false)}>Hide Safe Zones</button>
      <button onClick={() => setProfilePic('profile.png')}>Set Profile</button>
      <button onClick={() => setRefImages(['ref1.png'])}>Add Ref</button>
      <button onClick={() => setIsProcessingImg(true)}>Set Processing</button>
      <button onClick={() => addElement({ id: '2', type: 'text', x: 0, y: 0, text: 'New' })}>
        Add New Element
      </button>
      <button onClick={() => deleteElement('1')}>Delete Element</button>
      <button onClick={() => setProfileTransform({ x: 10, y: 20, scale: 1.5 })}>
        Set Transform
      </button>
    </div>
  );
};

describe('CanvasContext', () => {
  it('should provide canvas context', () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    expect(screen.getByTestId('bgImage')).toHaveTextContent('none');
    expect(screen.getByTestId('elements')).toHaveTextContent('0');
  });

  it('should manage background image state', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    const button = screen.getByText('Set BG');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('bgImage')).toHaveTextContent('test.png');
    });
  });

  it('should manage elements state', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    const button = screen.getByText('Add Element');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('elements')).toHaveTextContent('1');
    });
  });

  it('should manage selected element ID', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    const button = screen.getByText('Select Element');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('selectedElementId')).toHaveTextContent('1');
    });
  });

  it('should toggle safe zones', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    expect(screen.getByTestId('showSafeZones')).toHaveTextContent('true');

    const button = screen.getByText('Hide Safe Zones');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('showSafeZones')).toHaveTextContent('false');
    });
  });

  it('should manage profile picture', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    const button = screen.getByText('Set Profile');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('profilePic')).toHaveTextContent('profile.png');
    });
  });

  it('should manage reference images', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    const button = screen.getByText('Add Ref');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('refImages')).toHaveTextContent('1');
    });
  });

  it('should manage processing state', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    expect(screen.getByTestId('isProcessingImg')).toHaveTextContent('false');

    const button = screen.getByText('Set Processing');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('isProcessingImg')).toHaveTextContent('true');
    });
  });

  it('should add elements', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    const button = screen.getByText('Add New Element');
    button.click();

    await waitFor(() => {
      expect(screen.getByTestId('elements')).toHaveTextContent('1');
    });
  });

  it('should delete elements', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    // First add an element
    screen.getByText('Add Element').click();

    await waitFor(() => {
      expect(screen.getByTestId('elements')).toHaveTextContent('1');
    });

    // Then delete it
    screen.getByText('Delete Element').click();

    await waitFor(() => {
      expect(screen.getByTestId('elements')).toHaveTextContent('0');
    });
  });

  it('should manage profile transform', async () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    const initialTransform = JSON.parse(screen.getByTestId('profileTransform').textContent || '{}');
    expect(initialTransform).toEqual({ x: 0, y: 0, scale: 1 });

    const button = screen.getByText('Set Transform');
    button.click();

    await waitFor(() => {
      const transform = JSON.parse(screen.getByTestId('profileTransform').textContent || '{}');
      expect(transform).toEqual({ x: 10, y: 20, scale: 1.5 });
    });
  });

  it('should initialize with correct undo/redo state', () => {
    render(
      <CanvasProvider>
        <TestComponent />
      </CanvasProvider>
    );

    expect(screen.getByTestId('canUndo')).toHaveTextContent('false');
    expect(screen.getByTestId('canRedo')).toHaveTextContent('false');
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
      expect(error instanceof Error ? error.message : '').toContain('useCanvas must be used within CanvasProvider');
    } finally {
      console.error = consoleError;
    }
  });
});
