# Agent System Integration Guide

> **Status**: ✅ Complete | **Last Updated**: 2026-01-08

This document provides a comprehensive guide for developers working with the Nanobanna Pro Agent System.

---

## Overview

The Agent System enables voice-controlled banner creation through a multi-agent architecture with 47 voice commands, intelligent routing, and knowledge-based assistance.

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **Action Executor** | `src/services/actionExecutor.ts` | Executes voice commands with validation |
| **Agent Router** | `src/services/agentRouter.ts` | Routes commands to specialized agents |
| **Agent Registry** | `src/services/agentRegistry.ts` | Defines 7 specialized agents |
| **Voice Context** | `src/context/VoiceAgentContext.tsx` | WebSocket connection, state management |
| **Cognee Service** | `server/src/services/cognee.ts` | Knowledge base operations |

---

## Voice Commands (47 Total)

### Image Generation & Processing (8)
| Command | Description | Preview Mode |
|---------|-------------|--------------|
| `generate_background` | Generate AI background | ✅ Yes |
| `magic_edit` | Edit image with AI | ✅ Yes |
| `remove_background` | Remove image background | ✅ Yes |
| `upscale_image` | Upscale image quality | ✅ Yes |
| `restore_image` | Restore old/damaged images | ✅ Yes |
| `enhance_face` | Enhance facial features | ✅ Yes |
| `batch_upscale` | Upscale multiple images | ✅ Yes |
| `batch_remove_background` | Remove background from multiple | ✅ Yes |

### Canvas Elements (12)
| Command | Description |
|---------|-------------|
| `add_text_element` | Add text to canvas |
| `update_element` | Update element properties |
| `delete_element` | Delete element by ID |
| `list_elements` | List all canvas elements |
| `bring_to_front` | Move element to front |
| `send_to_back` | Move element to back |
| `duplicate_element` | Duplicate an element |
| `lock_element` | Lock/unlock element |
| `group_elements` | Group multiple elements |
| `batch_delete_elements` | Delete multiple elements |
| `batch_update_elements` | Update multiple elements |
| `batch_move_elements` | Move multiple elements |

### Navigation & History (5)
| Command | Description |
|---------|-------------|
| `navigate_to_tab` | Switch between tabs |
| `undo_action` | Undo last action |
| `redo_action` | Redo last undone action |
| `toggle_safe_zones` | Toggle safe zone visibility |
| `reset_canvas` | Reset canvas to default |

### AI Analysis (6)
| Command | Description |
|---------|-------------|
| `suggest_prompts` | Get prompt suggestions |
| `write_enhanced_prompt` | Enhance a prompt |
| `analyze_image` | Analyze image content |
| `analyze_banner` | Analyze banner design |
| `compare_images` | Compare two images |
| `check_brand_consistency` | Check brand alignment |

### Gallery & Templates (8)
| Command | Description |
|---------|-------------|
| `save_design` | Save current design |
| `load_design` | Load saved design |
| `delete_design` | Delete saved design |
| `export_design` | Export design to file |
| `list_designs` | List all saved designs |
| `apply_template` | Apply a template |
| `list_templates` | List available templates |
| `search_templates` | Search templates |

### Brand & Profile (8)
| Command | Description |
|---------|-------------|
| `extract_brand` | Extract brand from images |
| `apply_brand_profile` | Apply brand profile |
| `list_brand_profiles` | List brand profiles |
| `set_profile_picture` | Set profile picture |
| `remove_profile_picture` | Remove profile picture |
| `transform_profile` | Transform profile picture |
| `set_zoom` | Set canvas zoom level |
| `center_canvas` | Center canvas view |

---

## Agent Architecture

### 7 Specialized Agents

| Agent ID | Name | Expertise |
|----------|------|-----------|
| `canvas-agent` | Canvas Specialist | Element manipulation, layers |
| `image-agent` | Image Processing | Generation, editing, enhancement |
| `brand-agent` | Brand Guardian | Brand consistency, profiles |
| `gallery-agent` | Gallery Manager | Designs, templates, exports |
| `navigation-agent` | Navigation Expert | Tabs, history, UI state |
| `analysis-agent` | AI Analyst | Image/banner analysis |
| `general-agent` | General Assistant | Fallback, general queries |

### Routing Logic

```typescript
import { routeToAgent, getAgentForCommand } from '@/services/agentRouter';

// Route a command to the appropriate agent
const agent = getAgentForCommand('generate_background');
// Returns: 'image-agent'

// Route with context
const result = await routeToAgent(command, args, context);
```

---

## Adding New Commands

### 1. Define Command Schema

```typescript
// src/services/commands/types.ts
export const myCommandSchema = z.object({
  param1: z.string(),
  param2: z.number().optional(),
});
```

### 2. Implement Command

```typescript
// src/services/commands/myCommands.ts
export async function executeMyCommand(
  args: z.infer<typeof myCommandSchema>,
  context: CommandContext
): Promise<CommandResult> {
  // Implementation
  return { success: true, message: 'Done' };
}
```

### 3. Register in ActionExecutor

```typescript
// src/services/actionExecutor.ts
case 'my_command':
  return await executeMyCommand(validatedArgs, context);
```

---

## Testing

```bash
# Run all tests
npx vitest run

# Run specific test file
npx vitest run src/services/actionExecutor.test.ts

# Watch mode
npx vitest
```

---

## Deployment

### Cognee Service (Knowledge Base)

```bash
cd cognee-service
gcloud builds submit --config=cloudbuild.yaml
```

### Seed Agent Knowledge

```bash
npx tsx server/src/scripts/seedAgentKnowledge.ts
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `COGNEE_API_URL` | Cognee service endpoint |
| `OPENAI_API_KEY` | For voice agent WebSocket |

---

## Metrics

- **468 tests passing** (100% pass rate)
- **47 voice commands** implemented
- **7 specialized agents** with knowledge bases
- **Build time**: ~4 seconds
- **Bundle size**: ~700KB gzipped

---

*For technical details, see `docs/VOICE_AGENT_TECHNICAL.md`*

