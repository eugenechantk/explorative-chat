# Explorative Chat

A multi-conversation LLM chat application that enables users to branch off conversations to explore related topics, clarify terms, and dive deeper into ideas - all within a single grouped interface.

## Features

### Core Functionality

- **Multi-Conversation Layout**: Display multiple conversations side-by-side in a horizontally resizable layout
- **Conversation Groups**: Group related conversations together and restore them as a set
- **Branching Conversations**: Select text from any message to branch into a new conversation with that context
- **Multiple LLM Providers**: Support for various models through OpenRouter (Claude, GPT, Gemini, Llama, etc.)
- **Local Storage**: All conversations stored locally in IndexedDB (architecture ready for database migration)
- **Dark Mode Support**: Full dark mode theming throughout the application

### User Experience

- **Floating Branch Button**: Select text and a floating button appears for easy branching
- **Keyboard Shortcuts**: Comprehensive keyboard shortcuts for power users
- **Resizable Panels**: Adjust conversation widths to your preference
- **Model Selection**: Choose different models per conversation
- **Streaming Responses**: Real-time streaming of LLM responses
- **Conversation History**: Browse and restore previous conversation groups

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OpenRouter API key ([get one here](https://openrouter.ai/keys))

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd explorative-chat
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

5. Enter your OpenRouter API key when prompted

## Usage

### Creating Conversations

1. Click "New Group" to start a new conversation group
2. Type your message and press Enter or click Send
3. Click "+ New Conversation" to add more conversations to the current group

### Branching Conversations

There are multiple ways to branch a conversation:

1. **Text Selection**: Select any text in a message, and a floating "Branch" button will appear
2. **Click Branch**: Click the button to create a new conversation with the selected text as context
3. The branched conversation will be added to your current group

### Managing Groups

- **Save Groups**: Groups are automatically saved to local storage
- **Browse Groups**: Use the sidebar to view and restore previous groups
- **Delete Groups**: Click the trash icon next to a group to delete it
- **Close Conversations**: Click the X on any conversation panel to close it (minimum 1 per group)

### Keyboard Shortcuts

Press `?` to view all available shortcuts:

- `Cmd/Ctrl + T` - New group
- `Cmd/Ctrl + N` - New conversation in current group
- `Cmd/Ctrl + W` - Close current conversation
- `Cmd/Ctrl + B` - Branch selected text
- `Cmd/Ctrl + [` - Previous conversation
- `Cmd/Ctrl + ]` - Next conversation
- `Cmd/Ctrl + Shift + S` - Save group
- `Esc` - Close dialog/modal
- `?` - Show keyboard shortcuts

## Technical Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Storage**: IndexedDB (via Dexie.js)
- **LLM Provider**: OpenRouter
- **UI Components**: React 19, lucide-react icons
- **Layout**: react-resizable-panels

### Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main application page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── GroupView.tsx         # Horizontal conversation group layout
│   ├── ConversationPanel.tsx # Individual conversation UI
│   ├── MessageList.tsx       # Message display
│   ├── MessageInput.tsx      # Message input field
│   ├── GroupsList.tsx        # Saved groups sidebar
│   ├── BranchButton.tsx      # Floating branch button
│   └── KeyboardShortcutsHelp.tsx # Shortcuts help modal
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── storage/
│   │   ├── db.ts            # Dexie database setup
│   │   └── operations.ts    # CRUD operations
│   └── openrouter/
│       └── client.ts        # OpenRouter API client
└── hooks/
    └── useKeyboardShortcuts.ts # Keyboard shortcuts hook
```

### Data Models

**ConversationGroup**
- Groups multiple conversations together
- Stores conversation IDs and metadata
- Can be restored as a complete set

**Conversation**
- Individual chat thread with an LLM
- Contains messages and model configuration
- Belongs to a group

**Message**
- Individual message in a conversation
- Tracks branching metadata if created from a branch
- Stores role (user/assistant) and content

## Customization

### Adding More Models

Edit `src/lib/openrouter/client.ts` and add to the `POPULAR_MODELS` array:

```typescript
export const POPULAR_MODELS = [
  { id: 'model-id', name: 'Model Name' },
  // Add your model here
];
```

### Changing Storage Backend

The storage layer is designed to be easily swapped:

1. Implement the same interface as `src/lib/storage/operations.ts`
2. Replace IndexedDB calls with your database client
3. Update imports in components

### Styling

The app uses Tailwind CSS. Customize colors in `src/app/globals.css`:

```css
:root {
  --background: /* your color */;
  --foreground: /* your color */;
}
```

## Future Enhancements

Potential features for future development:

- [ ] Cloud sync with database backend
- [ ] Conversation search
- [ ] Export conversations (Markdown, PDF)
- [ ] Conversation templates
- [ ] Collaborative groups (multi-user)
- [ ] Message editing
- [ ] Conversation forking (duplicate with variations)
- [ ] Custom keyboard shortcut configuration
- [ ] Integration with other LLM providers directly
- [ ] Voice input/output

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- LLM access via [OpenRouter](https://openrouter.ai/)
- Icons by [Lucide](https://lucide.dev/)
