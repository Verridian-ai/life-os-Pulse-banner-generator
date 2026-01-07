# React Context Architecture & Provider Hierarchy

This document describes the state management architecture of Nanobanna Pro, focusing on the hierarchy and responsibilities of React Context providers.

## Provider Hierarchy

The application wraps the component tree in the following order (from outer-most to inner-most). This order is critical as some providers depend on state from others.

1.  **`ErrorBoundary`**: Catches unhandled runtime errors in the React tree.
2.  **`AuthProvider`**: Manages user authentication state, profiles, and API keys.
3.  **`ToastProvider`**: Provides global notification capabilities.
4.  **`ScreenReaderAnnouncerProvider`**: Handles accessibility announcements for screen readers.
5.  **`AIProvider`**: Manages AI model selection, performance metrics, and tool-chaining state.
6.  **`CanvasProvider`**: A composite provider that manages the banner design state. It internally nests:
    *   `CanvasStateProvider`: Core dimensions, zoom, and background image.
    *   `ElementsProvider`: Management of text and image elements on the canvas.
    *   `LayerProvider`: Z-index and ordering logic for elements.
    *   `HistoryProvider`: Undo/Redo functionality for canvas changes.
    *   `ImageProvider`: Reference image uploads and profile picture transformations.
7.  **`VoiceAgentProvider`**: Manages the connection to the OpenAI Realtime API and handles voice-to-action logic.

## Context Responsibilities

### `AuthContext`
*   **State**: Current user, session, loading status, user profile.
*   **Methods**: `signIn`, `signUp`, `signOut`, `updateProfile`.
*   **Location**: `src/context/AuthContext.tsx`

### `AIContext`
*   **State**: Selected provider/model, available models, performance metrics (cost, time), active tool chains.
*   **Methods**: `setSelectedModel`, `addMetric`, `updateBrandProfile`.
*   **Location**: `src/context/AIContext.tsx`

### `CanvasContext` (Combined)
*   **State**: All state related to the banner being designed.
*   **Methods**: `addElement`, `updateElement`, `undo`, `redo`, `setBgImage`.
*   **Note**: This is a performance-optimized combined context. For granular updates, use individual sub-context hooks.
*   **Location**: `src/context/canvas/`

### `VoiceAgentContext`
*   **State**: WebSocket connection status, transcript, pending actions awaiting approval.
*   **Methods**: `connect`, `disconnect`, `approveAction`, `rejectAction`.
*   **Location**: `src/context/VoiceAgentContext.tsx`

## Design Principles

1.  **Granular Contexts**: The large `CanvasContext` was split into 5 sub-contexts to prevent unnecessary re-renders of the entire canvas when only a small piece of state (like zoom) changes.
2.  **Action Approvals**: Actions triggered by voice or AI chat are stored in a `pendingAction` state within their respective contexts, allowing the UI to show a "Confirm/Reject" prompt before applying changes to the `CanvasContext`.
3.  **Cross-Context Communication**: The `VoiceAgentWrapper` in `App.tsx` acts as a bridge, passing callbacks from `CanvasContext` into `VoiceAgentProvider`.
