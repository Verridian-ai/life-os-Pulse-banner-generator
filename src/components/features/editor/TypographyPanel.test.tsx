import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

import { TypographyPanel } from './TypographyPanel';
import type { BannerElement } from '../../../types';
import { CanvasStateProvider } from '../../../context/canvas/CanvasStateContext';
import { ElementsProvider } from '../../../context/canvas/ElementsContext';
import { ImageProvider } from '../../../context/canvas/ImageContext';
import { LayerProvider } from '../../../context/canvas/LayerContext';
import { HistoryProvider } from '../../../context/canvas/HistoryContext';

// Mock useCanvas hook since TypographyPanel uses it
vi.mock('@/context/CanvasContext', () => ({
  useCanvas: () => ({
    addElement: vi.fn(),
  }),
}));

// Test wrapper with required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <CanvasStateProvider>
    <ElementsProvider>
      <ImageProvider>
        <LayerProvider>
          <HistoryProvider>{children}</HistoryProvider>
        </LayerProvider>
      </ImageProvider>
    </ElementsProvider>
  </CanvasStateProvider>
);

// Custom render with provider
const renderWithProvider = (ui: React.ReactElement) => {
  return render(ui, { wrapper: TestWrapper });
};

describe('TypographyPanel', () => {
  const mockTextElement: BannerElement = {
    id: '1',
    type: 'text',
    content: 'Test Text',
    x: 100,
    y: 100,
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'Inter',
    color: '#ffffff',
    textAlign: 'left',
    letterSpacing: 0,
    lineHeight: 1.2,
    fontStyle: 'normal',
    textTransform: 'none',
    textDecoration: 'none',
    opacity: 100,
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('renders empty state when no element is selected', () => {
    renderWithProvider(<TypographyPanel selectedElement={null} onUpdate={mockOnUpdate} />);

    // Component shows "Add Text" presets and a hint to select existing text
    expect(screen.getByText(/select an existing text element to edit/i)).toBeInTheDocument();
  });

  it('renders empty state when non-text element is selected', () => {
    const imageElement: BannerElement = {
      id: '2',
      type: 'image',
      content: 'https://example.com/image.jpg',
      x: 0,
      y: 0,
    };

    renderWithProvider(<TypographyPanel selectedElement={imageElement} onUpdate={mockOnUpdate} />);

    // Component shows "Add Text" presets and a hint to select existing text
    expect(screen.getByText(/select an existing text element to edit/i)).toBeInTheDocument();
  });

  it('renders typography controls when text element is selected', () => {
    renderWithProvider(
      <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
    );

    expect(screen.getByText('Typography')).toBeInTheDocument();
    expect(screen.getByText('Font & Style')).toBeInTheDocument();
    expect(screen.getByText('Effects')).toBeInTheDocument();
    expect(screen.getByText('Spacing & Position')).toBeInTheDocument();
  });

  describe('Font Controls', () => {
    it('updates font family on selection', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const fontSelect = screen.getByLabelText('Font Family');
      fireEvent.change(fontSelect, { target: { value: 'Roboto' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ fontFamily: 'Roboto' });
    });

    it('updates font size via slider', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      // The font size slider has label "Size (px)"
      const sizeSlider = screen.getByLabelText(/size \(px\)/i);
      fireEvent.change(sizeSlider, { target: { value: '48' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ fontSize: 48 });
    });

    it('updates font weight via dropdown', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const weightSelect = screen.getByLabelText('Weight');
      fireEvent.change(weightSelect, { target: { value: '700' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ fontWeight: '700' });
    });

    it('toggles bold style', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const boldButton = screen.getByLabelText('Toggle bold');
      fireEvent.click(boldButton);

      expect(mockOnUpdate).toHaveBeenCalledWith({ fontWeight: '700' });
    });

    it('toggles italic style', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const italicButton = screen.getByLabelText('Toggle italic');
      fireEvent.click(italicButton);

      expect(mockOnUpdate).toHaveBeenCalledWith({ fontStyle: 'italic' });
    });

    it('toggles underline decoration', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const underlineButton = screen.getByLabelText('Toggle underline');
      fireEvent.click(underlineButton);

      expect(mockOnUpdate).toHaveBeenCalledWith({ textDecoration: 'underline' });
    });
  });

  describe('Color Controls', () => {
    it('updates text color via color picker', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const colorPicker = screen.getByLabelText('Color');
      fireEvent.change(colorPicker, { target: { value: '#ff0000' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ color: '#ff0000' });
    });

    it('updates opacity via slider', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const opacitySlider = screen.getByLabelText(/opacity: 100%/i);
      fireEvent.change(opacitySlider, { target: { value: '50' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ opacity: 50 });
    });
  });

  describe('Shadow Controls', () => {
    it('shows shadow controls when shadow is enabled', () => {
      const elementWithShadow = {
        ...mockTextElement,
        textShadowBlur: 10,
        textShadowOffsetX: 2,
        textShadowOffsetY: 2,
        textShadowColor: '#000000',
      };

      renderWithProvider(
        <TypographyPanel selectedElement={elementWithShadow} onUpdate={mockOnUpdate} />,
      );

      // Effects section is expanded by default
      expect(screen.getByText('Shadow')).toBeInTheDocument();
      expect(screen.getByText(/blur: 10px/i)).toBeInTheDocument();
      expect(screen.getByText(/x: 2px/i)).toBeInTheDocument();
      expect(screen.getByText(/y: 2px/i)).toBeInTheDocument();
    });
  });

  describe('Stroke Controls', () => {
    it('shows stroke controls when stroke is enabled', () => {
      const elementWithStroke = {
        ...mockTextElement,
        textStrokeWidth: 2,
        textStrokeColor: '#000000',
        textStrokeStyle: 'solid' as const,
      };

      renderWithProvider(
        <TypographyPanel selectedElement={elementWithStroke} onUpdate={mockOnUpdate} />,
      );

      // Effects section is expanded by default
      expect(screen.getByText('Stroke')).toBeInTheDocument();
      expect(screen.getByText(/width: 2px/i)).toBeInTheDocument();
    });
  });

  describe('Spacing & Position Controls', () => {
    it('updates letter spacing', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      // Expand spacing section
      const spacingButton = screen.getByText('Spacing & Position');
      fireEvent.click(spacingButton);

      const letterSpacingSlider = screen.getByLabelText(/letter spacing:/i);
      fireEvent.change(letterSpacingSlider, { target: { value: '5' } });

      expect(mockOnUpdate).toHaveBeenCalledWith({ letterSpacing: 5 });
    });

    it('updates text transform', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      // Expand spacing section
      const spacingButton = screen.getByText('Spacing & Position');
      fireEvent.click(spacingButton);

      const uppercaseButton = screen.getByTitle('Uppercase');
      fireEvent.click(uppercaseButton);

      expect(mockOnUpdate).toHaveBeenCalledWith({ textTransform: 'uppercase' });
    });

    it('updates text alignment', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      // Expand spacing section
      const spacingButton = screen.getByText('Spacing & Position');
      fireEvent.click(spacingButton);

      const centerButton = screen.getByTitle('Center');
      fireEvent.click(centerButton);

      expect(mockOnUpdate).toHaveBeenCalledWith({ textAlign: 'center' });
    });
  });

  describe('Section Toggle', () => {
    it('toggles font section visibility', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const fontButton = screen.getByText('Font & Style');

      // Initially expanded
      expect(screen.getByLabelText('Font Family')).toBeInTheDocument();

      // Collapse
      fireEvent.click(fontButton);
      expect(screen.queryByLabelText('Font Family')).not.toBeInTheDocument();

      // Expand again
      fireEvent.click(fontButton);
      expect(screen.getByLabelText('Font Family')).toBeInTheDocument();
    });

    it('toggles effects section visibility', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const effectsButton = screen.getByText('Effects');

      // Initially expanded (effects section is expanded by default)
      expect(screen.getByText('Shadow')).toBeInTheDocument();

      // Collapse
      fireEvent.click(effectsButton);
      expect(screen.queryByText('Shadow')).not.toBeInTheDocument();

      // Expand again
      fireEvent.click(effectsButton);
      expect(screen.getByText('Shadow')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides accessible labels for sliders', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      // Font size slider has label "Size (px)"
      expect(screen.getByLabelText(/size \(px\)/i)).toBeInTheDocument();
      // Opacity slider has label "Opacity: 100%"
      expect(screen.getByLabelText(/opacity: 100%/i)).toBeInTheDocument();
    });

    it('provides accessible button labels', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      expect(screen.getByLabelText('Toggle bold')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle italic')).toBeInTheDocument();
      expect(screen.getByLabelText('Toggle underline')).toBeInTheDocument();
    });

    it('shows accessibility tip for color contrast', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      expect(screen.getByText(/ensure sufficient color contrast/i)).toBeInTheDocument();
      expect(screen.getByText(/WCAG AA: 4.5:1/i)).toBeInTheDocument();
    });

    it('uses aria-pressed for toggle buttons', () => {
      renderWithProvider(
        <TypographyPanel selectedElement={mockTextElement} onUpdate={mockOnUpdate} />,
      );

      const boldButton = screen.getByLabelText('Toggle bold');
      expect(boldButton).toHaveAttribute('aria-pressed', 'false');

      const italicButton = screen.getByLabelText('Toggle italic');
      expect(italicButton).toHaveAttribute('aria-pressed', 'false');
    });
  });

  describe('Visual States', () => {
    it('highlights active bold button when weight >= 700', () => {
      const boldElement = { ...mockTextElement, fontWeight: '700' };
      renderWithProvider(<TypographyPanel selectedElement={boldElement} onUpdate={mockOnUpdate} />);

      const boldButton = screen.getByLabelText('Toggle bold');
      expect(boldButton).toHaveClass('bg-purple-500/30');
      expect(boldButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('highlights active italic button', () => {
      const italicElement = { ...mockTextElement, fontStyle: 'italic' };
      renderWithProvider(
        <TypographyPanel selectedElement={italicElement} onUpdate={mockOnUpdate} />,
      );

      const italicButton = screen.getByLabelText('Toggle italic');
      expect(italicButton).toHaveClass('bg-purple-500/30');
      expect(italicButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('highlights active underline button', () => {
      const underlinedElement = { ...mockTextElement, textDecoration: 'underline' };
      renderWithProvider(
        <TypographyPanel selectedElement={underlinedElement} onUpdate={mockOnUpdate} />,
      );

      const underlineButton = screen.getByLabelText('Toggle underline');
      expect(underlineButton).toHaveClass('bg-purple-500/30');
      expect(underlineButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('highlights active text transform button', () => {
      const uppercaseElement = { ...mockTextElement, textTransform: 'uppercase' as const };
      renderWithProvider(
        <TypographyPanel selectedElement={uppercaseElement} onUpdate={mockOnUpdate} />,
      );

      // Expand spacing section
      const spacingButton = screen.getByText('Spacing & Position');
      fireEvent.click(spacingButton);

      const uppercaseButton = screen.getByTitle('Uppercase');
      expect(uppercaseButton).toHaveClass('bg-purple-500/30');
    });

    it('highlights active text alignment button', () => {
      const centeredElement = { ...mockTextElement, textAlign: 'center' as const };
      renderWithProvider(
        <TypographyPanel selectedElement={centeredElement} onUpdate={mockOnUpdate} />,
      );

      // Expand spacing section
      const spacingButton = screen.getByText('Spacing & Position');
      fireEvent.click(spacingButton);

      const centerButton = screen.getByTitle('Center');
      expect(centerButton).toHaveClass('bg-purple-500/30');
    });
  });
});
