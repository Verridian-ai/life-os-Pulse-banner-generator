// Action Executor - Execute AI assistant tool calls on behalf of the user
import type { BannerElement } from '@/types';
import { Tab, StudioMode } from '@/constants';
import type { Command, CommandContext } from './commands/types';
import {
  GenerateBackgroundCommand,
  MagicEditCommand,
  RemoveBackgroundCommand,
  UpscaleImageCommand,
  RestoreImageCommand,
  EnhanceFaceCommand,
  BatchUpscaleCommand,
  BatchRemoveBackgroundCommand,
} from './commands/imageCommands';
import {
  AddTextElementCommand,
  UpdateElementCommand,
  DeleteElementCommand,
  ListElementsCommand,
  BringToFrontCommand,
  SendToBackCommand,
  DuplicateElementCommand,
  LockElementCommand,
  GroupElementsCommand,
  BatchDeleteElementsCommand,
  BatchUpdateElementsCommand,
  BatchMoveElementsCommand,
} from './commands/canvasCommands';
import {
  NavigateToTabCommand,
  UndoActionCommand,
  RedoActionCommand,
} from './commands/uiCommands';
import {
  SuggestPromptsCommand,
  WriteEnhancedPromptCommand,
  AnalyzeImageCommand,
  AnalyzeBannerCommand,
  CompareImagesCommand,
} from './commands/analysisCommands';
import { ToolSchemas } from './validationSchemas';

export interface ToolCall {
  name: string;
  args: Record<string, unknown>;
}

export interface ActionResult {
  success: boolean;
  result?: string;
  error?: string;
  preview?: string; // Image URL for preview
  imageUrl?: string; // Image URL for action result
  action?: string; // Action type identifier
}

export type OnUpdateCallback = (imageUrl: string, type: 'background' | 'profile') => void;

export type SetGenPromptCallback = (prompt: string) => void;

// Canvas manipulation callbacks for voice control
export interface CanvasCallbacks {
  addElement?: (element: BannerElement) => void;
  updateElement?: (id: string, updates: Partial<BannerElement>) => void;
  deleteElement?: (id: string) => void;
  getElements?: () => BannerElement[];
  undo?: () => void;
  redo?: () => void;
  setActiveTab?: (tab: Tab) => void;
  setStudioMode?: (mode: StudioMode) => void;
  bringToFront?: (id: string) => void;
  sendToBack?: (id: string) => void;
}

/**
 * ActionExecutor - Handles execution of AI tool calls
 */
export class ActionExecutor {
  private onUpdate: OnUpdateCallback;
  private previewMode: boolean;
  private getCanvasImage: () => string | undefined;
  private setGenPrompt?: SetGenPromptCallback;
  private canvasCallbacks: CanvasCallbacks;
  private commands: Map<string, Command>;

  constructor(
    onUpdate: OnUpdateCallback,
    previewMode = false,
    getCanvasImage?: () => string | undefined,
    setGenPrompt?: SetGenPromptCallback,
    canvasCallbacks?: CanvasCallbacks
  ) {
    this.onUpdate = onUpdate;
    this.previewMode = previewMode;
    this.getCanvasImage = getCanvasImage || (() => undefined);
    this.setGenPrompt = setGenPrompt;
    this.canvasCallbacks = canvasCallbacks || {};
    this.commands = new Map();
    this.registerDefaultCommands();
  }

  private registerDefaultCommands() {
    this.registerCommand(new GenerateBackgroundCommand());
    this.registerCommand(new MagicEditCommand());
    this.registerCommand(new RemoveBackgroundCommand());
    this.registerCommand(new UpscaleImageCommand());
    this.registerCommand(new RestoreImageCommand());
    this.registerCommand(new EnhanceFaceCommand());
    this.registerCommand(new AddTextElementCommand());
    this.registerCommand(new UpdateElementCommand());
    this.registerCommand(new DeleteElementCommand());
    this.registerCommand(new ListElementsCommand());
    this.registerCommand(new NavigateToTabCommand());
    this.registerCommand(new UndoActionCommand());
    this.registerCommand(new RedoActionCommand());
    this.registerCommand(new SuggestPromptsCommand());
    this.registerCommand(new WriteEnhancedPromptCommand());
    this.registerCommand(new AnalyzeImageCommand());
    this.registerCommand(new AnalyzeBannerCommand());
    this.registerCommand(new CompareImagesCommand());
    this.registerCommand(new BatchUpscaleCommand());
    this.registerCommand(new BatchRemoveBackgroundCommand());
    this.registerCommand(new BringToFrontCommand());
    this.registerCommand(new SendToBackCommand());
    this.registerCommand(new DuplicateElementCommand());
    this.registerCommand(new LockElementCommand());
    this.registerCommand(new GroupElementsCommand());
    this.registerCommand(new BatchDeleteElementsCommand());
    this.registerCommand(new BatchUpdateElementsCommand());
    this.registerCommand(new BatchMoveElementsCommand());
  }

  public registerCommand(command: Command) {
    this.commands.set(command.name, command);
  }

  /**
   * Set canvas manipulation callbacks
   */
  setCanvasCallbacks(callbacks: CanvasCallbacks) {
    this.canvasCallbacks = { ...this.canvasCallbacks, ...callbacks };
    console.log('[ActionExecutor] Canvas callbacks configured');
  }

  /**
   * Set the prompt setter callback for voice-to-prompt enhancement
   */
  setPromptSetter(setter: SetGenPromptCallback) {
    this.setGenPrompt = setter;
    console.log('[ActionExecutor] Prompt setter configured');
  }

  /**
   * Set canvas image getter for magic edit operations
   */
  setCanvasImageGetter(getter: () => string | undefined) {
    this.getCanvasImage = getter;
    console.log('[ActionExecutor] Canvas image getter set');
  }

  /**
   * Set preview mode
   */
  setPreviewMode(enabled: boolean) {
    this.previewMode = enabled;
    console.log('[ActionExecutor] Preview mode:', enabled ? 'ON' : 'OFF');
  }

  /**
   * Execute a tool call
   */
  async executeToolCall(toolCall: ToolCall): Promise<ActionResult> {
    console.log('[ActionExecutor] Executing tool:', toolCall.name, toolCall.args);

    // Validate arguments if a schema exists
    const schema = ToolSchemas[toolCall.name];
    if (schema) {
      const validationResult = schema.safeParse(toolCall.args);
      if (!validationResult.success) {
        console.error(`[ActionExecutor] Invalid arguments for ${toolCall.name}:`, validationResult.error);
        return {
          success: false,
          error: `Invalid arguments: ${validationResult.error.message}`,
        };
      }
      // Use validated arguments (though we still pass original args as commands expect specific types, 
      // Zod ensures they match structure)
    }

    const command = this.commands.get(toolCall.name);

    if (!command) {
      console.error(`[ActionExecutor] Unknown tool: ${toolCall.name}`);
      return {
        success: false,
        error: `Unknown tool: ${toolCall.name}`,
      };
    }

    const context: CommandContext = {
      onUpdate: this.onUpdate,
      previewMode: this.previewMode,
      getCanvasImage: this.getCanvasImage,
      setGenPrompt: this.setGenPrompt,
      canvasCallbacks: this.canvasCallbacks,
    };

    try {
      return await command.execute(toolCall.args, context);
    } catch (error) {
      console.error('[ActionExecutor] Tool execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Apply a previewed action to the canvas
   */
  applyPreview(imageUrl: string, type: 'background' | 'profile' = 'background') {
    console.log('[ActionExecutor] Applying preview:', { imageUrl, type });
    this.onUpdate(imageUrl, type);
  }
}
