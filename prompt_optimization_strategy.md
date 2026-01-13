# Prompt Optimization Strategy: Nano Banana Pro

## 1. Executive Summary

This document outlines a comprehensive strategy to optimize the prompt engineering pipeline for Nano Banana Pro. Based on deep analysis of the current codebase (`promptEnhancer.ts`, `ai.ts`) and the extracted toolset (`prompt_enhancement_tools.md`), this strategy aims to elevate generation quality across all supported models (Imagen 3, Flux, Ideogram) by implementing model-aware prompt enhancement and expanding the semantic keyword arsenal.

## 2. Current Architecture Analysis

### 2.1 The "Nano Banana" Identity

- **Frontend**: "Nano Banana Pro" is presented as `google/gemini-3-pro-image-preview` in `src/constants.ts`.
- **Backend**: The route `/api/ai/image/generate` maps `google/nano-banana-pro` to `google/imagen-3` on Replicate.
- **Enhancer**: The `PROMPT_ENHANCER_SYSTEM` uses a "Prompt Architect" persona focused heavily on photography keywords (Camera bodies, Film stocks) and is currently hard-coded for LinkedIn Banner dimensions (1584x396).

### 2.2 Identified Gaps

1. **Model Agnosticism**: The current enhancer applies the same "Photorealism" formula to all requests, which is suboptimal for models like **Ideogram** (typography focus) or **Flux** (which prefers natural language over comma-separated keyword soup).
2. **Dimension Rigidity**: The system prompt explicitly instructs for "LinkedIn banner (1584x396)", which conflicts with the multi-platform canvas support (Instagram, TikTok, YouTube) defined in `src/constants.ts`.
3. **Keyword Stagnation**: The current "Secret Keyword Arsenal" is excellent for photorealism but lacks specific triggers for:
    - **3D Illustration / SaaS**: (Critical for tech startups)
    - **Typography / Text**: (Critical for Ideogram)
    - **Broadcast / Video**: (Critical for the new Video models like Luma/Kling)

## 3. Optimization Plan

### 3.1 Phase 1: Context-Aware Expansion

We will refactor `PromptEnhanceContext` to include a `targetModel` and `platformFormat`. This allows the enhanced prompt to dynamically adapt its structure.

**Proposed Interface Update:**

```typescript
export interface PromptEnhanceContext {
    industry?: string;
    style?: string;
    brandColors?: string[];
    // NEW FIELDS
    targetModel?: 'imagen-3' | 'flux' | 'ideogram' | 'sd3';
    platformFormat?: string; // e.g., "Instagram Story (9:16)"
}
```

### 3.2 Phase 2: System Prompt Refactoring (`PROMPT_ENHANCER_SYSTEM`)

We will rewrite the system prompt to be a "Multi-Specialist". Instead of just a "Photographer", it will dynamically switch personas based on user intent.

**New Persona Modules:**

1. **The Photographer** (Existing, refined): For "Nano Banana Pro" / Imagen 3.
2. **The Typographer** (New): Specialized for **Ideogram V3**. Focuses on `text "text_content"`, font styles, and legibility.
3. **The Director** (New): Specialized for **Video Models** (Kling/Luma). Focuses on motion descriptors (`camera_move_left`, `slow pan`, `bokeh push-in`).
4. **The Illustrator** (New): Specialized for **SaaS/Tech**. Focuses on "Is0metric", "3D Render", "Claymorphism", "Glassmorphism".

### 3.3 Phase 3: Model-Specific Tuning

#### Target: Nano Banana Pro (Imagen 3)

* **Strategy**: Maintain the high-fidelity photorealism keywords. Imagen 3 excels with natural lighting and texture descriptions.
- **New Keywords**: `HDR`, `subsurface scattering`, `micro-details`.

#### Target: Flux (Schnell/Dev)

* **Strategy**: Shift to **Natural Language** flow. Flux follows complex instructions better than keyword lists.
- **Prompt Structure**: "A high definition photo of [Subject]... [Lighting]... [Style]..." instead of "[Subject], [Lighting], [Style]".

#### Target: Ideogram V3

* **Strategy**: Enforce "Text Isolation".
- **New Keywords**: `typography`, `poster design`, `text render`, `font "Inter"`.

## 4. Implementation Steps

1. **Update `src/services/llm-types.ts`**: Add `targetModel` and `platformFormat` to `PromptEnhanceContext`.
2. **Refactor `server/src/prompts/promptEnhancer.ts`**:
    - Extract the "Secret Keyword Arsenal" into a structured JSON/Object for easier maintenance.
    - Implement the logic to select the correct "Persona" based on the new context fields.
    - Add specific "Video" prompts for the new video model support (Kling/Luma).
3. **Update `server/src/routes/ai.ts`**: Pass the new context fields from the frontend request to the prompt enhancer.

## 5. Next Actions for User

- **Approve** this optimization strategy.
- **Select** which Phase to prioritize (typically Phase 2: System Prompt Refactoring provides the highest immediate ROI).
