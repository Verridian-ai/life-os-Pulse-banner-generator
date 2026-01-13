# Chat & Brainstorm Section — Test Instructions

Write tests for the conversational AI interface.

## Core User Flows

### 1. Send Message
- User types message in input
- Message appears in conversation
- AI response appears after processing
- Loading indicator shown during generation

### 2. Attach Image
- User clicks attachment button
- File picker opens
- Selected image shows preview
- Image sends with message

### 3. Mode Switching
- User switches between Design, Search, Voice modes
- Mode indicator updates
- AI behavior adapts to mode

### 4. Conversation History
- User opens history panel
- Past conversations listed
- Click loads conversation
- Messages restored

### 5. Archive/Delete
- User archives conversation
- Conversation moves to archive
- Delete removes permanently
- Confirmation required for delete

## Empty States

- **No conversations** — Show welcome message with suggestions
- **No messages** — Show starter prompts
- **Loading** — Show message skeleton

## Edge Cases

- Handle very long messages (truncation/expansion)
- Handle failed message sends (retry option)
- Handle network disconnection
- Handle attachments that fail to upload
- Preserve draft messages on navigation

## Accessibility

- Messages are announced to screen reader
- Input has proper label
- Keyboard navigation through conversation
- Focus management on new messages
