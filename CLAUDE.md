# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Explorative Chat is a multi-conversation LLM chat application that allows users to branch off conversations to explore related topics. The core innovation is the ability to select text from any message and create a new conversation with that context, all within a grouped, side-by-side layout.

## Commands

```bash
# Development
npm run dev          # Start dev server on localhost:3000

# Build and Production
npm run build        # Production build
npm run start        # Run production build

# Linting
npm run lint         # Run ESLint
```

## Environment Configuration

**Required**: Create `.env.local` with:
```
OPENROUTER_API_KEY=your_key_here
```

The API key is used server-side only (never exposed to client). All LLM requests flow through `/api/chat` route which reads the key from environment variables.

## Architecture

### Data Flow

1. **Storage Layer** (`src/lib/storage/`): IndexedDB via Dexie
   - `db.ts`: Database schema (conversations, groups, messages tables)
   - `operations.ts`: CRUD operations (designed to be database-agnostic for future migration)

2. **API Layer** (`src/app/api/chat/route.ts`): Server-side proxy to OpenRouter
   - Reads API key from environment
   - Streams LLM responses back to client
   - Keeps API key secure (never sent to browser)

3. **Client Layer** (`src/lib/openrouter/client.ts`): Thin client that calls `/api/chat`
   - `OpenRouterClient.streamChat()`: Async generator for streaming responses
   - No API key required on client side

### Core Concepts

**ConversationGroup**: Container for multiple related conversations
- Has `conversationIds[]` array
- Auto-saved to IndexedDB on any change
- Can be restored as a complete set

**Conversation**: Individual chat thread
- Belongs to one group (via `groupId`)
- Has `messages[]` array, `model` selection, and `position` in group layout
- Each conversation can use a different LLM model

**Message**: User or assistant message in a conversation
- Branching metadata: `branchSourceConversationId`, `branchSourceMessageId`, `branchSelectedText`
- When a message is created from branching, it stores what text was selected and from which conversation/message

**Branching Flow**:
1. User selects text in any message → `MessageList` calls `onMessageSelect`
2. `ConversationPanel` stores selection in state → renders `BranchButton` (floating)
3. User clicks Branch → `handleBranch` creates new conversation with selected text as initial message
4. New conversation is added to current group

### Component Hierarchy

```
page.tsx (Home)
├── GroupsList (sidebar)
│   └── Lists all saved groups
└── GroupView (main content)
    └── PanelGroup (resizable horizontal layout)
        └── ConversationPanel (one per conversation)
            ├── MessageList (displays messages)
            ├── MessageInput (send messages)
            └── BranchButton (floating, shown on text selection)
```

### State Management

- **No global state library**: Uses React `useState` and prop drilling
- **Top-level state** (in `page.tsx`): Active group, list of groups, active conversations
- **Component state**: Messages in `ConversationPanel`, streaming state, text selection
- **Persistence**: All state auto-saved to IndexedDB via `src/lib/storage/operations.ts`

## Key Implementation Details

### Streaming LLM Responses

The client uses an async generator pattern:

```typescript
for await (const chunk of client.streamChat(model, messages, signal)) {
  fullResponse += chunk;
  setStreamingContent(fullResponse);
}
```

Server-side route streams OpenRouter's SSE response directly to client.

### Keyboard Shortcuts

`useKeyboardShortcuts` hook in `src/hooks/useKeyboardShortcuts.ts`:
- Takes array of shortcuts with key combo and action
- Can be enabled/disabled (e.g., disabled when modals are open)
- Uses `metaKey` for cross-platform Cmd/Ctrl support

### Resizable Panels

Uses `react-resizable-panels`:
- Only active when 2+ conversations in group
- Single conversation renders without panels (full width)
- Each panel has min size of 20%

### Storage Migration Pattern

Storage operations are intentionally designed to be swapped:
- All components import from `src/lib/storage/operations.ts`
- To migrate to database: Replace IndexedDB calls in `operations.ts`, keep same function signatures
- No component changes needed

## Adding New Features

### Adding a New LLM Model

Edit `src/lib/openrouter/client.ts` → `POPULAR_MODELS` array:

```typescript
export const POPULAR_MODELS = [
  { id: 'provider/model-name', name: 'Display Name' },
  // ...
];
```

### Adding Keyboard Shortcuts

Edit `src/app/page.tsx` → `useKeyboardShortcuts` call:

```typescript
useKeyboardShortcuts([
  {
    key: 'k',
    metaKey: true,
    description: 'Do something',
    action: () => handleAction(),
  },
]);
```

Update `src/components/KeyboardShortcutsHelp.tsx` to display new shortcut.

### Modifying Data Schema

1. Update types in `src/lib/types.ts`
2. Increment version in `src/lib/storage/db.ts`:
   ```typescript
   this.version(2).stores({
     // new schema
   });
   ```
3. Add migration logic if needed (Dexie handles additive changes automatically)

## Important Constraints

- Minimum 1 conversation per group (can't close the last one)
- Group names auto-generate if not set
- Conversation titles auto-generate from first message (not yet implemented, on roadmap)
- Branching always adds to current group (not a new group)
