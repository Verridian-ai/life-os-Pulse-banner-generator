# Milestone 7: Chat & Brainstorm

Build the conversational AI interface for design ideation.

## Prerequisites
- Foundation complete
- Dashboard complete
- Platform Studio complete (for action integration)

## Deliverables

### Components
1. **ChatInterface** — Main chat container with message list
2. **ChatHeader** — Mode tabs (Design, Search, Voice) and controls
3. **ChatMessage** — User and AI message rendering with markdown
4. **ChatInput** — Message composition with attachment support
5. **ConversationHistory** — Past conversations sidebar/drawer
6. **LoadingIndicator** — AI response generation animation
7. **ExecutingIndicator** — Action execution progress

### Services
1. **chatService** — API integration for chat completion
2. **chatPersistence** — Conversation storage (Supabase)

### Context
1. **ChatContext** — Conversation state, messages, sending logic

### Hooks
1. **useChatMessages** — Message state and send functionality
2. **useChatPersistence** — Database sync
3. **useFileAttachment** — Image upload handling
4. **useAutoScroll** — Scroll to latest message

## Data Model

```typescript
interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    actions?: ActionCommand[];
  };
}

interface Conversation {
  id: string;
  userId: string;
  title: string;
  mode: 'design' | 'search' | 'voice';
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
}
```

## Implementation Notes

### Message Rendering
- Render markdown with syntax highlighting for code
- Show image attachments inline
- Display action results when AI executes commands
- Loading skeleton during generation

### Mode Switching
- Design mode: AI can execute canvas actions
- Search mode: AI focuses on information retrieval
- Voice mode: Integrates with Voice Agent

### Conversation Persistence
- Auto-save conversations to database
- Generate title from first message
- Support archiving and deletion
- Restore on page refresh

## Mobile Considerations
- Full-screen chat interface
- Swipe from edge to reveal history
- Bottom-anchored input with keyboard handling
- Touch-friendly message actions
