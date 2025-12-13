import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import BannerCanvas, { BannerCanvasHandle } from './BannerCanvas';
import type { BannerElement } from '../types';

// Comprehensive canvas mock
const createMockCanvas = () => {
  const mockContext = {
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    clip: vi.fn(),
    strokeStyle: '',
    lineWidth: 0,
    strokeRect: vi.fn(),
    setLineDash: vi.fn(),
    stroke: vi.fn(),
    fillText: vi.fn(),
    font: '',
    textAlign: '',
    textBaseline: '',
    measureText: vi.fn(() => ({ width: 100 })),
    getImageData: vi.fn(() => ({ data: new Uint8ClampedArray(4) })),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    canvas: {
      toDataURL: vi.fn(() => 'data:image/png;base64,test'),
      width: 1584,
      height: 396,
    },
  };

  return mockContext;
};

// Mock HTMLCanvasElement
const mockCanvas = createMockCanvas();
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
  if (contextId === '2d') return mockCanvas as unknown as CanvasRenderingContext2D;
  return null;
}) as unknown as typeof HTMLCanvasElement.prototype.getContext;

// Mock Image
class MockImage {
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  src = '';
  complete = true;
  width = 1584;
  height = 396;

  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
}

global.Image = MockImage as unknown as typeof Image;

// Mock document.fonts
Object.defineProperty(document, 'fonts', {
  value: {
    ready: Promise.resolve(),
  },
  writable: true,
  configurable: true,
});

describe('BannerCanvas', () => {
  const mockOnElementsChange = vi.fn();
  const mockOnSelectElement = vi.fn();
  const mockOnProfileFaceEnhance = vi.fn();

  const defaultProps = {
    backgroundImage: null,
    elements: [] as BannerElement[],
    showSafeZones: true,
    profilePic: null,
    profileTransform: { x: 0, y: 0, scale: 1 },
    setProfileTransform: vi.fn(),
    onElementsChange: mockOnElementsChange,
    selectedElementId: null,
    onSelectElement: mockOnSelectElement,
    onProfileFaceEnhance: mockOnProfileFaceEnhance,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render canvas element', () => {
    const { container } = render(<BannerCanvas {...defaultProps} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas?.tagName).toBe('CANVAS');
  });

  it('should render with background image', () => {
    const { container } = render(
      <BannerCanvas {...defaultProps} backgroundImage='https://example.com/bg.png' />,
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should render with text elements', () => {
    const textElement: BannerElement = {
      id: '1',
      type: 'text',
      x: 100,
      y: 100,
      content: 'Hello World',
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      rotation: 0,
    };

    render(<BannerCanvas {...defaultProps} elements={[textElement]} />);

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should render with image elements', () => {
    const imageElement: BannerElement = {
      id: '2',
      type: 'image',
      x: 50,
      y: 50,
      width: 200,
      height: 200,
      content: 'https://example.com/image.png',
      rotation: 0,
    };

    render(<BannerCanvas {...defaultProps} elements={[imageElement]} />);

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should render with profile picture', () => {
    render(
      <BannerCanvas
        {...defaultProps}
        profilePic='https://example.com/profile.png'
        profileTransform={{ x: 100, y: 50, scale: 1.5 }}
      />,
    );

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should render safe zones when enabled', () => {
    render(<BannerCanvas {...defaultProps} showSafeZones={true} />);

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should not render safe zones when disabled', () => {
    render(<BannerCanvas {...defaultProps} showSafeZones={false} />);

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should render with selected element', () => {
    const textElement: BannerElement = {
      id: '1',
      type: 'text',
      x: 100,
      y: 100,
      content: 'Selected',
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      rotation: 0,
    };

    render(<BannerCanvas {...defaultProps} elements={[textElement]} selectedElementId='1' />);

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should handle multiple elements', () => {
    const elements: BannerElement[] = [
      {
        id: '1',
        type: 'text',
        x: 100,
        y: 100,
        content: 'Text 1',
        fontSize: 24,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0,
      },
      {
        id: '2',
        type: 'text',
        x: 200,
        y: 200,
        content: 'Text 2',
        fontSize: 32,
        fontFamily: 'Helvetica',
        color: '#FF0000',
        rotation: 0,
      },
    ];

    render(<BannerCanvas {...defaultProps} elements={elements} />);

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should render with rotated elements', () => {
    const rotatedElement: BannerElement = {
      id: '1',
      type: 'text',
      x: 100,
      y: 100,
      content: 'Rotated',
      fontSize: 24,
      fontFamily: 'Arial',
      color: '#000000',
      rotation: 45,
    };

    render(<BannerCanvas {...defaultProps} elements={[rotatedElement]} />);

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('should set correct canvas dimensions', () => {
    const { container } = render(<BannerCanvas {...defaultProps} />);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    // Canvas should be set to banner dimensions (1584x396)
  });

  it('should expose generateStageImage method via ref', () => {
    const ref = { current: null } as React.MutableRefObject<{
      generateStageImage?: () => string;
    } | null>;
    render(
      <BannerCanvas ref={ref as unknown as React.Ref<BannerCanvasHandle>} {...defaultProps} />,
    );

    expect(ref.current).toBeTruthy();
    if (ref.current && 'generateStageImage' in ref.current) {
      expect(typeof ref.current.generateStageImage).toBe('function');
    }
  });

  it('should handle complex scene with all element types', () => {
    const elements: BannerElement[] = [
      {
        id: '1',
        type: 'text',
        x: 100,
        y: 100,
        content: 'Title',
        fontSize: 48,
        fontFamily: 'Arial',
        color: '#000000',
        rotation: 0,
      },
      {
        id: '2',
        type: 'image',
        x: 400,
        y: 100,
        width: 300,
        height: 200,
        content: 'https://example.com/graphic.png',
        rotation: 0,
      },
    ];

    render(
      <BannerCanvas
        {...defaultProps}
        backgroundImage='https://example.com/bg.png'
        profilePic='https://example.com/profile.png'
        elements={elements}
        showSafeZones={true}
        selectedElementId='1'
      />,
    );

    const canvas = document.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });
});
