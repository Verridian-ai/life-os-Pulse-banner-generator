import type { ActionResult, CanvasCallbacks, SetGenPromptCallback, OnUpdateCallback } from '../actionExecutor';

export interface CommandContext {
  onUpdate: OnUpdateCallback;
  previewMode: boolean;
  getCanvasImage: () => string | undefined;
  setGenPrompt?: SetGenPromptCallback;
  canvasCallbacks: CanvasCallbacks;
}

export interface Command {
  name: string;
  execute(args: Record<string, unknown>, context: CommandContext): Promise<ActionResult> | ActionResult;
}
