# TypeScript Type System Documentation

This document explains the organization of TypeScript types within Nanobanna Pro and provides guidance on where to find or add new type definitions.

## Type Organization

Types are categorized into several files based on their domain and usage:

### 1. `src/types/index.ts` (Core Domain Types)
The "catch-all" for fundamental application types used across many components.
*   **Key Types**: `BannerElement`, `ChatMessage`, `Toast`, `ConnectionState`.
*   **When to use**: If the type represents a core concept of the user interface or banner data structure.

### 2. `src/types/ai.ts` (AI & Analytics Types)
Specific to the AI sub-system, performance tracking, and brand enforcement.
*   **Key Types**: `ModelMetadata`, `PerformanceMetric`, `BrandProfile`, `ToolChain`.
*   **When to use**: If the type is related to model configurations, metrics aggregation, or AI-driven brand logic.

### 3. `src/types/api.ts` (API Schema Types)
Request and response schemas for communicating with the backend.
*   **Key Types**: `UserProfile`, `UserPreferences`, `ApiKeysResponse`, `ToolCall`.
*   **When to use**: When defining the interface for an API endpoint or parsing backend responses.

### 4. `src/types/database.ts` (Database Row Types)
Raw row structures that mirror the backend database schema.
*   **Key Types**: `ImageRecord`, `ConversationRow`.
*   **When to use**: When working with direct database results before they are mapped to domain types.

### 5. `src/services/commands/types.ts` (Implementation Types)
Internal types for the Command Pattern and Service Layer.
*   **Key Types**: `Command`, `CommandContext`.
*   **When to use**: For internal service logic that shouldn't be exposed to UI components.

## Best Practices

1.  **Prefer Explicit Imports**: Avoid `import * as Types`. Import only the specific interfaces you need.
2.  **Avoid Circular Dependencies**: If two type files depend on each other, extract the shared types to `src/types/index.ts`.
3.  **Naming Convention**: Use `PascalCase` for Interfaces and Type Aliases. Avoid prefixing with `I` (e.g., use `BannerElement`, not `IBannerElement`).
4.  **Shared Contract**: Types in `src/types/api.ts` should be treated as a "shared contract" between the frontend and backend. Any changes there must be coordinated with backend updates.

## Common Type Mappings

| Frontend Type | Backend Equivalent | Purpose |
| :--- | :--- | :--- |
| `BannerElement` | `elements` (jsonb) | Representation of a design layer. |
| `ChatMessage` | `chat_messages` table | Individual turn in a conversation. |
| `ModelMetadata` | `MODEL_REGISTRY` | Static info about AI model capabilities. |
