import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GenerativeSidebar from './GenerativeSidebar';

// Mock the EnhanceButton component
vi.mock('../ui/EnhanceButton', () => ({
  EnhanceButton: ({ prompt, onEnhanced, showLabel }: any) => (
    <button
      data-testid="enhance-button-mock"
      onClick={() => onEnhanced('enhanced: ' + prompt)}
      disabled={!prompt}
    >
      {showLabel ? 'Enhance' : ''}
    </button>
  ),
}));

// Mock ImageToolsPanel
vi.mock('./ImageToolsPanel', () => ({
  ImageToolsPanel: () => <div data-testid="image-tools-panel">Image Tools Panel</div>,
}));

describe('GenerativeSidebar', () => {
  const defaultProps = {
    refImages: [],
    genPrompt: '',
    setGenPrompt: vi.fn(),
    genSize: '1K' as const,
    setGenSize: vi.fn(),
    isGenerating: false,
    onGenerate: vi.fn(),
    isMagicPrompting: false,
    onMagicPrompt: vi.fn(),
    isEnhancing: false,
    onEnhancePrompt: vi.fn(),
    editPrompt: '',
    setEditPrompt: vi.fn(),
    isEditing: false,
    onEdit: vi.fn(),
    onRemoveBg: vi.fn(),
    onUpscale: vi.fn(),
    bgImage: null,
    onImageUpdate: vi.fn(),
    magicEditSuggestions: [],
    generationSuggestions: [],
  };

  // Mock localStorage
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    localStorageMock = {};

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn((key: string) => localStorageMock[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;

    // Mock window.innerWidth for desktop view
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Trigger resize event
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('renders the AI Studio header', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      expect(screen.getByText('AI Studio')).toBeInTheDocument();
    });

    it('renders mode selector buttons', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      expect(screen.getByText('Generate')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Tools')).toBeInTheDocument();
    });

    it('renders in generate mode by default', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      expect(screen.getByPlaceholderText(/Describe your vision/i)).toBeInTheDocument();
    });

    it('renders collapse button', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      const collapseButton = screen.getByLabelText(/collapse/i);
      expect(collapseButton).toBeInTheDocument();
    });

    it('renders model dropdown button', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      const modelButton = screen.getByTitle(/Nano Banana Pro/i);
      expect(modelButton).toBeInTheDocument();
    });
  });

  describe('Prompt Input Handling', () => {
    it('allows typing in the prompt field', async () => {
      const user = userEvent.setup();
      const setGenPrompt = vi.fn();
      render(<GenerativeSidebar {...defaultProps} setGenPrompt={setGenPrompt} />);

      const textarea = screen.getByPlaceholderText(/Describe your vision/i);
      await user.type(textarea, 'A beautiful sunset');

      expect(setGenPrompt).toHaveBeenCalled();
    });

    it('displays the current prompt value', () => {
      render(<GenerativeSidebar {...defaultProps} genPrompt="Test prompt" />);
      const textarea = screen.getByPlaceholderText(/Describe your vision/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test prompt');
    });

    it('updates prompt when onChange is triggered', () => {
      const setGenPrompt = vi.fn();
      render(<GenerativeSidebar {...defaultProps} setGenPrompt={setGenPrompt} />);

      const textarea = screen.getByPlaceholderText(/Describe your vision/i);
      fireEvent.change(textarea, { target: { value: 'New prompt' } });

      expect(setGenPrompt).toHaveBeenCalledWith('New prompt');
    });
  });

  describe('Size Selection', () => {
    it('renders all size options', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      expect(screen.getByText('1K')).toBeInTheDocument();
      expect(screen.getByText('2K')).toBeInTheDocument();
      expect(screen.getByText('4K')).toBeInTheDocument();
    });

    it('highlights the selected size', () => {
      render(<GenerativeSidebar {...defaultProps} genSize="2K" />);
      const size2K = screen.getByText('2K');
      expect(size2K).toHaveClass('bg-zinc-700');
    });

    it('calls setGenSize when a size is clicked', async () => {
      const user = userEvent.setup();
      const setGenSize = vi.fn();
      render(<GenerativeSidebar {...defaultProps} setGenSize={setGenSize} />);

      const size4K = screen.getByText('4K');
      await user.click(size4K);

      expect(setGenSize).toHaveBeenCalledWith('4K');
    });

    it('allows switching between different sizes', async () => {
      const user = userEvent.setup();
      const setGenSize = vi.fn();
      render(<GenerativeSidebar {...defaultProps} setGenSize={setGenSize} />);

      await user.click(screen.getByText('2K'));
      expect(setGenSize).toHaveBeenCalledWith('2K');

      await user.click(screen.getByText('4K'));
      expect(setGenSize).toHaveBeenCalledWith('4K');
    });
  });

  describe('Generate Button', () => {
    it('renders the generate button on desktop', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      expect(screen.getByText('Generate Background')).toBeInTheDocument();
    });

    it('calls onGenerate when clicked', async () => {
      const user = userEvent.setup();
      const onGenerate = vi.fn();
      render(<GenerativeSidebar {...defaultProps} onGenerate={onGenerate} />);

      const generateButton = screen.getByText('Generate Background');
      await user.click(generateButton);

      expect(onGenerate).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during generation', () => {
      render(<GenerativeSidebar {...defaultProps} isGenerating={true} />);
      expect(screen.getByText('CREATING...')).toBeInTheDocument();
    });

    it('disables button during generation', () => {
      render(<GenerativeSidebar {...defaultProps} isGenerating={true} />);
      const generateButton = screen.getByText('CREATING...').closest('button');
      expect(generateButton).toBeDisabled();
    });
  });

  describe('Magic Prompt Button', () => {
    it('renders the magic prompt button', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      expect(screen.getByText('Magic Prompt')).toBeInTheDocument();
    });

    it('calls onMagicPrompt when clicked', async () => {
      const user = userEvent.setup();
      const onMagicPrompt = vi.fn();
      render(<GenerativeSidebar {...defaultProps} onMagicPrompt={onMagicPrompt} refImages={['image1.jpg']} />);

      const magicPromptButton = screen.getByText('Magic Prompt');
      await user.click(magicPromptButton);

      expect(onMagicPrompt).toHaveBeenCalledTimes(1);
    });

    it('is disabled when no reference images are provided', () => {
      render(<GenerativeSidebar {...defaultProps} refImages={[]} />);
      const magicPromptButton = screen.getByText('Magic Prompt').closest('button');
      expect(magicPromptButton).toBeDisabled();
    });

    it('is enabled when reference images are provided', () => {
      render(<GenerativeSidebar {...defaultProps} refImages={['image1.jpg', 'image2.jpg']} />);
      const magicPromptButton = screen.getByText('Magic Prompt').closest('button');
      expect(magicPromptButton).not.toBeDisabled();
    });

    it('shows loading state during magic prompting', () => {
      render(<GenerativeSidebar {...defaultProps} isMagicPrompting={true} refImages={['image1.jpg']} />);
      expect(screen.getByText('Analyzing...')).toBeInTheDocument();
    });

    it('disables button during magic prompting', () => {
      render(<GenerativeSidebar {...defaultProps} isMagicPrompting={true} refImages={['image1.jpg']} />);
      const magicPromptButton = screen.getByText('Analyzing...').closest('button');
      expect(magicPromptButton).toBeDisabled();
    });
  });

  describe('Enhance Prompt Button', () => {
    it('renders the enhance prompt button', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      expect(screen.getByText('Prompt Enhance')).toBeInTheDocument();
    });

    it('calls onEnhancePrompt when clicked', async () => {
      const user = userEvent.setup();
      const onEnhancePrompt = vi.fn();
      render(<GenerativeSidebar {...defaultProps} onEnhancePrompt={onEnhancePrompt} genPrompt="test prompt" />);

      const enhanceButton = screen.getByText('Prompt Enhance');
      await user.click(enhanceButton);

      expect(onEnhancePrompt).toHaveBeenCalledTimes(1);
    });

    it('is disabled when prompt is empty', () => {
      render(<GenerativeSidebar {...defaultProps} genPrompt="" />);
      const enhanceButton = screen.getByText('Prompt Enhance').closest('button');
      expect(enhanceButton).toBeDisabled();
    });

    it('is enabled when prompt has content', () => {
      render(<GenerativeSidebar {...defaultProps} genPrompt="test prompt" />);
      const enhanceButton = screen.getByText('Prompt Enhance').closest('button');
      expect(enhanceButton).not.toBeDisabled();
    });

    it('shows loading state during enhancement', () => {
      render(<GenerativeSidebar {...defaultProps} isEnhancing={true} genPrompt="test prompt" />);
      expect(screen.getByText('Enhancing...')).toBeInTheDocument();
    });

    it('disables button during enhancement', () => {
      render(<GenerativeSidebar {...defaultProps} isEnhancing={true} genPrompt="test prompt" />);
      const enhanceButton = screen.getByText('Enhancing...').closest('button');
      expect(enhanceButton).toBeDisabled();
    });
  });

  describe('Edit Mode', () => {
    it('switches to edit mode when Edit button is clicked', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      const editButton = screen.getByText('Edit');
      await user.click(editButton);

      // Check for edit mode content - look for textarea with edit-related placeholder
      await waitFor(() => {
        const editTextarea = screen.getByPlaceholderText(/Add a laptop|Describe your edit/i);
        expect(editTextarea).toBeInTheDocument();
      });
    });

    it('renders edit prompt textarea in edit mode', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      await user.click(screen.getByText('Edit'));

      await waitFor(() => {
        const editTextarea = screen.getByPlaceholderText(/Add a laptop|Describe your edit/i);
        expect(editTextarea).toBeInTheDocument();
      });
    });

    it('allows typing in edit prompt field', async () => {
      const user = userEvent.setup();
      const setEditPrompt = vi.fn();
      render(<GenerativeSidebar {...defaultProps} setEditPrompt={setEditPrompt} />);

      await user.click(screen.getByText('Edit'));

      await waitFor(async () => {
        const editTextarea = screen.getByPlaceholderText(/Add a laptop|Describe your edit/i);
        await user.type(editTextarea, 'Add text');
      });

      expect(setEditPrompt).toHaveBeenCalled();
    });

    it('calls onEdit when Edit button is clicked', async () => {
      const user = userEvent.setup();
      const onEdit = vi.fn();
      render(<GenerativeSidebar {...defaultProps} onEdit={onEdit} />);

      await user.click(screen.getByText('Edit'));
      // Find the button by role and text content
      const magicEditButton = screen.getByRole('button', { name: /magic edit/i });
      await user.click(magicEditButton);

      expect(onEdit).toHaveBeenCalledTimes(1);
    });

    it('shows loading state during editing', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} isEditing={true} />);

      await user.click(screen.getByText('Edit'));
      expect(screen.getByText('EDITING...')).toBeInTheDocument();
    });

    it('disables edit button during editing', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} isEditing={true} />);

      await user.click(screen.getByText('Edit'));
      const editButton = screen.getByText('EDITING...').closest('button');
      expect(editButton).toBeDisabled();
    });

    it('disables edit button during generation', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} isGenerating={true} />);

      await user.click(screen.getByText('Edit'));
      const editButton = screen.getByRole('button', { name: /magic edit/i });
      expect(editButton).toBeDisabled();
    });

    it('renders EnhanceButton in edit mode', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      await user.click(screen.getByText('Edit'));
      const enhanceButton = screen.getByTestId('enhance-button-mock');
      expect(enhanceButton).toBeInTheDocument();
    });
  });

  describe('Suggestion Chips', () => {
    it('renders generation suggestions when provided', () => {
      const suggestions = ['Sunset over ocean', 'Mountain landscape', 'City skyline'];
      render(<GenerativeSidebar {...defaultProps} generationSuggestions={suggestions} />);

      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });

    it('updates prompt when generation suggestion is clicked', async () => {
      const user = userEvent.setup();
      const setGenPrompt = vi.fn();
      const suggestions = ['Sunset over ocean'];
      render(<GenerativeSidebar {...defaultProps} generationSuggestions={suggestions} setGenPrompt={setGenPrompt} />);

      await user.click(screen.getByText('Sunset over ocean'));
      expect(setGenPrompt).toHaveBeenCalledWith('Sunset over ocean');
    });

    it('renders magic edit suggestions in edit mode', async () => {
      const user = userEvent.setup();
      const suggestions = ['Add a laptop', 'Change lighting'];
      render(<GenerativeSidebar {...defaultProps} magicEditSuggestions={suggestions} />);

      await user.click(screen.getByText('Edit'));

      suggestions.forEach(suggestion => {
        expect(screen.getByText(suggestion)).toBeInTheDocument();
      });
    });

    it('updates edit prompt when magic edit suggestion is clicked', async () => {
      const user = userEvent.setup();
      const setEditPrompt = vi.fn();
      const suggestions = ['Add a laptop'];
      render(<GenerativeSidebar {...defaultProps} magicEditSuggestions={suggestions} setEditPrompt={setEditPrompt} />);

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Add a laptop'));

      expect(setEditPrompt).toHaveBeenCalledWith('Add a laptop');
    });

    it('does not render suggestions when array is empty', () => {
      render(<GenerativeSidebar {...defaultProps} generationSuggestions={[]} />);

      // Check that no suggestion chips exist
      const suggestionChips = screen.queryAllByText(/✨/);
      expect(suggestionChips).toHaveLength(0);
    });
  });

  describe('Mode Switching', () => {
    it('shows generate content in generate mode', () => {
      render(<GenerativeSidebar {...defaultProps} />);
      expect(screen.getByText('Background Gen')).toBeInTheDocument();
    });

    it('shows edit content in edit mode', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      await user.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Add a laptop|Describe your edit/i)).toBeInTheDocument();
      });
    });

    it('shows tools panel in tools mode', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      await user.click(screen.getByText('Tools'));
      expect(screen.getByTestId('image-tools-panel')).toBeInTheDocument();
    });

    it('persists mode selection to localStorage', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      await user.click(screen.getByText('Edit'));

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('nanobanna-sidebar-mode', 'edit');
      });
    });

    it('highlights active mode button', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      const editButton = screen.getByTitle('Edit');
      await user.click(editButton);

      await waitFor(() => {
        expect(editButton).toHaveClass('from-yellow-600');
      });
    });
  });

  describe('Model Selection', () => {
    it('shows model dropdown when model button is clicked', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      const modelButton = screen.getByTitle(/Nano Banana Pro/i);
      await user.click(modelButton);

      // Check for model dropdown items
      expect(screen.getByText('Ideogram V3')).toBeInTheDocument();
      expect(screen.getByText('SD3 Large')).toBeInTheDocument();
    });

    it('closes dropdown when a model is selected', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      const modelButton = screen.getByTitle(/Nano Banana Pro/i);
      await user.click(modelButton);

      const ideogramOption = screen.getByText('Ideogram V3');
      await user.click(ideogramOption);

      await waitFor(() => {
        expect(screen.queryByText('Best for text in images')).not.toBeInTheDocument();
      });
    });

    it('persists model selection to localStorage', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      const modelButton = screen.getByTitle(/Nano Banana Pro/i);
      await user.click(modelButton);

      const ideogramOption = screen.getByText('Ideogram V3');
      await user.click(ideogramOption);

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('nanobanna-image-model', 'ideogram-v3');
      });
    });
  });

  describe('Collapse/Expand Functionality', () => {
    it('collapses sidebar when collapse button is clicked', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      const collapseButton = screen.getByLabelText(/collapse/i);
      await user.click(collapseButton);

      // Should show expand button
      await waitFor(() => {
        expect(screen.getByLabelText(/expand/i)).toBeInTheDocument();
      });
    });

    it('expands sidebar when expand button is clicked', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      // First collapse
      const collapseButton = screen.getByLabelText(/collapse/i);
      await user.click(collapseButton);

      // Then expand
      const expandButton = await screen.findByLabelText(/expand/i);
      await user.click(expandButton);

      // Should show AI Studio again
      await waitFor(() => {
        expect(screen.getByText('AI Studio')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('renders mobile FAB when collapsed on mobile', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      window.dispatchEvent(new Event('resize'));

      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      const collapseButton = screen.getByLabelText(/close/i);
      await user.click(collapseButton);

      await waitFor(() => {
        const fab = screen.getByLabelText(/expand/i);
        expect(fab).toHaveClass('fixed', 'bottom-6', 'right-6');
      });
    });

    it('renders desktop collapse button when not mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      window.dispatchEvent(new Event('resize'));

      render(<GenerativeSidebar {...defaultProps} />);

      const collapseButton = screen.getByLabelText(/collapse sidebar/i);
      expect(collapseButton).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('shows spinner during generation', () => {
      render(<GenerativeSidebar {...defaultProps} isGenerating={true} />);
      // Check that the creating text exists which confirms loading state
      expect(screen.getByText('CREATING...')).toBeInTheDocument();
      // Check for spinner by class
      const button = screen.getByText('CREATING...').closest('button');
      const spinner = button?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows spinner during magic prompting', () => {
      render(<GenerativeSidebar {...defaultProps} isMagicPrompting={true} refImages={['img.jpg']} />);
      const spinner = screen.getByText('Analyzing...').previousSibling;
      expect(spinner).toHaveClass('animate-spin');
    });

    it('shows spinner during enhancement', () => {
      render(<GenerativeSidebar {...defaultProps} isEnhancing={true} genPrompt="test" />);
      const spinner = screen.getByText('Enhancing...').previousSibling;
      expect(spinner).toHaveClass('animate-spin');
    });

    it('shows spinner during editing', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} isEditing={true} />);

      await user.click(screen.getByText('Edit'));
      // Check that the editing text exists which confirms loading state
      expect(screen.getByText('EDITING...')).toBeInTheDocument();
      // Check for spinner by class
      const button = screen.getByText('EDITING...').closest('button');
      const spinner = button?.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible labels for buttons', () => {
      render(<GenerativeSidebar {...defaultProps} />);

      expect(screen.getByLabelText(/collapse sidebar/i)).toBeInTheDocument();
    });

    it('has accessible title attributes', () => {
      render(<GenerativeSidebar {...defaultProps} />);

      expect(screen.getByTitle(/Nano Banana Pro/i)).toBeInTheDocument();
      expect(screen.getByTitle('Generate')).toBeInTheDocument();
      expect(screen.getByTitle('Edit')).toBeInTheDocument();
      expect(screen.getByTitle('Tools')).toBeInTheDocument();
    });

    it('uses proper button elements for interactive elements', () => {
      render(<GenerativeSidebar {...defaultProps} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('disables buttons appropriately', () => {
      render(<GenerativeSidebar {...defaultProps} isGenerating={true} genPrompt="" />);

      const generateButton = screen.getByText('CREATING...').closest('button');
      expect(generateButton).toBeDisabled();

      const enhanceButton = screen.getByText('Prompt Enhance').closest('button');
      expect(enhanceButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty string prompts', () => {
      render(<GenerativeSidebar {...defaultProps} genPrompt="" />);
      const textarea = screen.getByPlaceholderText(/Describe your vision/i) as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('handles whitespace-only prompts', () => {
      render(<GenerativeSidebar {...defaultProps} genPrompt="   " />);
      const enhanceButton = screen.getByText('Prompt Enhance').closest('button');
      expect(enhanceButton).toBeDisabled();
    });

    it('handles multiple rapid mode switches', async () => {
      const user = userEvent.setup();
      render(<GenerativeSidebar {...defaultProps} />);

      await user.click(screen.getByText('Edit'));
      await user.click(screen.getByText('Tools'));
      await user.click(screen.getByText('Generate'));

      expect(screen.getByText('Background Gen')).toBeInTheDocument();
    });

    it('handles missing optional props gracefully', () => {
      const minimalProps = {
        refImages: [],
        genPrompt: '',
        setGenPrompt: vi.fn(),
        genSize: '1K' as const,
        setGenSize: vi.fn(),
        isGenerating: false,
        onGenerate: vi.fn(),
        isMagicPrompting: false,
        onMagicPrompt: vi.fn(),
        editPrompt: '',
        setEditPrompt: vi.fn(),
        isEditing: false,
        onEdit: vi.fn(),
        onRemoveBg: vi.fn(),
        onUpscale: vi.fn(),
        bgImage: null,
        onImageUpdate: vi.fn(),
      };

      expect(() => render(<GenerativeSidebar {...minimalProps} />)).not.toThrow();
    });
  });
});
