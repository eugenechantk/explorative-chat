# Explorative Chat - Product Requirements Document

## Executive Summary

Explorative Chat is a multi-conversation LLM chat application that enables users to branch conversations to explore related topics. The core innovation is the ability to select text from any message and create new conversation branches with that context, all within a grouped, side-by-side layout.

---

## 1. DATA MODEL

### 1.1 Core Entities

#### Conversation
Represents a container for multiple related branches.

**Schema:**
```typescript
{
  id: string                    // Unique identifier (timestamp + random)
  branchIds: string[]           // Array of branch IDs in this conversation
  name?: string                 // Auto-generated or user-set title
  tags?: string[]               // Optional tags for organization
  createdAt: number             // Unix timestamp
  updatedAt: number             // Unix timestamp (auto-updated)
}
```

**Constraints:**
- Must have at least one branch
- Name auto-generates after first user message in first branch
- Sorted by `updatedAt` DESC in sidebar

#### Branch
Represents an individual chat thread within a conversation.

**Schema:**
```typescript
{
  id: string                    // Unique identifier
  conversationId: string        // Parent conversation ID
  messages: Message[]           // Array of messages (stored separately in DB)
  model: string                 // OpenRouter model identifier
  title?: string                // Auto-generated or user-set
  createdAt: number             // Unix timestamp
  updatedAt: number             // Unix timestamp (auto-updated)
  position: number              // Order in conversation layout (0-indexed)
  mentionedTexts?: string[]     // Referenced texts from branching
}
```

**Constraints:**
- Position 0 branch cannot be closed (primary branch)
- Sorted by `position` ASC in UI
- Default model: 'anthropic/claude-3.5-sonnet'

#### Message
Represents a single message in a branch.

**Schema:**
```typescript
{
  id: string                      // Unique identifier
  branchId: string                // Parent branch ID
  role: 'user' | 'assistant' | 'system'
  content: string                 // Message text (markdown supported)
  timestamp: number               // Unix timestamp
  // Branching metadata (optional)
  branchSourceBranchId?: string   // Source branch if created from branching
  branchSourceMessageId?: string  // Source message if created from branching
  branchSelectedText?: string     // Selected text that triggered branch
}
```

**Constraints:**
- Sorted by `timestamp` ASC
- Content supports markdown with GFM
- User messages may contain references section (auto-prepended)

### 1.2 Storage Architecture

**Technology:** IndexedDB (Dexie.js)

**Database Schema (v3):**
```javascript
branches: 'id, conversationId, createdAt, updatedAt, position'
conversations: 'id, createdAt, updatedAt'
messages: 'id, branchId, timestamp'
```

**Storage Availability:**
- Check IndexedDB availability on load (fails in Safari private mode)
- Show error if unavailable: "Storage not available. Please disable private browsing mode."

**Data Operations:**
- All CRUD operations abstracted in `operations.ts`
- Auto-update `updatedAt` on all updates
- Cascade delete: Conversation → Branches → Messages
- ID generation: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

**Export/Import:**
- `exportData()`: Returns all conversations, branches, messages
- `importData()`: Bulk import from export file
- `clearAllData()`: Wipes entire database

---

## 2. USER FLOWS

### 2.1 First-Time User Experience

1. **Initial Load (No Data)**
   - Show centered empty state: "NO ACTIVE CONVERSATION"
   - Display "CREATE A NEW CONVERSATION TO START CHATTING"
   - Show loading spinner during initial data fetch

2. **Create First Conversation**
   - Click "NEW CONVERSATION" button (sidebar or empty state)
   - System creates:
     - New conversation with empty `branchIds[]`
     - Initial branch with position 0, no messages
     - Updates conversation with `branchIds: [branch.id]`
   - Navigates to new conversation
   - Shows empty branch state: "START A NEW BRANCH"

3. **Send First Message**
   - User types in textarea
   - Press Enter (or Shift+Enter for new line)
   - Message saved as user message
   - Streaming assistant response begins
   - **Trigger:** After first user message sent, conversation title auto-generates in background

### 2.2 Conversation Management Flow

#### Creating Conversations
1. Click "+ NEW CONVERSATION" button (top of sidebar)
2. System prevents double-clicks with loading state
3. Creates conversation + initial branch atomically
4. Adds to sidebar list (top position)
5. Auto-selects new conversation

#### Selecting Conversations
1. Click conversation in sidebar
2. System loads all branches for that conversation
3. Main view updates to show all branches
4. First branch auto-selected as active

#### Deleting Conversations
1. Click trash icon on conversation item
2. Show confirmation: "Are you sure you want to delete this conversation and all its branches?"
3. If confirmed:
   - Show deleting state (opacity 50%, disabled)
   - Cascade delete all branches and messages
   - Remove from sidebar
   - If was active, clear main view

### 2.3 Branching Flow (Core Feature)

#### Branching to New Branch

1. **Select Text**
   - User selects text in any message
   - System detects selection via `selectionchange` event
   - Walks DOM to find `data-message-id` attribute
   - Calculates selection bounding box position

2. **Show Branch Button**
   - Delay 800ms (allows iOS native UI to show first)
   - Renders floating button at selection midpoint
   - Position: `x: rect.left + rect.width/2, y: rect.top + scrollY`
   - Button shows: "NEW" with GitBranch icon

3. **Click "NEW"**
   - Creates new branch with:
     - Position: `existingBranches.length`
     - `mentionedTexts: [selectedText]`
     - Empty messages array
   - Adds to conversation's `branchIds`
   - Scrolls to new branch (smooth scroll, 100ms delay)
   - Clears text selection

4. **Mentioned Text Display**
   - New branch shows selected text in input area
   - Displays as quoted callout: "REFERENCED TEXT"
   - Truncates to 3 lines with "..." if longer
   - User can remove via X button

5. **Send with References**
   - When user types message and sends:
   - System prepends references:
     ```
     [Reference 1]
     {mentioned text}

     ---

     {user message}
     ```
   - Clears `mentionedTexts` array after sending

#### Branching to Existing Branch

1. **Select Text** (same as above)

2. **Show Branch Button with Dropdown**
   - If multiple branches exist, show chevron dropdown
   - Clicking chevron shows list: "BRANCH TO BRANCH"
   - Lists all branches except current one
   - Shows branch title or "BRANCH {position + 1}"

3. **Click Existing Branch**
   - Appends selected text to target branch's `mentionedTexts[]`
   - Updates branch in DB
   - Scrolls to target branch (smooth scroll, 100ms delay)
   - Clears text selection

### 2.4 Branch Management Flow

#### Adding Branches
1. Click "+ NEW BRANCH" button (top bar)
2. Creates branch at next position
3. Scrolls to new branch automatically
4. Focus on input (mobile: keyboard opens)

#### Closing Branches
1. Click X button in branch header
2. **Constraint:** Cannot close if:
   - Only 1 branch remains
   - Branch position is 0 (primary branch)
3. Deletes branch and all messages
4. Re-indexes remaining branches (updates positions)
5. Updates conversation's `branchIds` array

#### Changing Models
1. Click Settings icon in branch header
2. Shows model selector dropdown
3. Select from 8 popular models:
   - Claude 3.5 Sonnet (default)
   - Claude 3 Opus
   - Claude 3 Haiku
   - GPT-4 Turbo
   - GPT-4
   - GPT-3.5 Turbo
   - Gemini Pro
   - Llama 3 70B
4. Updates branch model, saves to DB
5. Subsequent messages use new model

### 2.5 Message Flow

#### Sending Messages

1. **Input**
   - Type in auto-resizing textarea (max 200px height)
   - Press Enter to send, Shift+Enter for new line
   - Can send with only referenced text (no typed message)

2. **Validation**
   - Disabled during streaming
   - Requires either message text OR mentioned texts

3. **Submission**
   - Creates user message with full content
   - Saves to DB immediately
   - Clears textarea (resets to auto height)
   - Blurs input (closes mobile keyboard)
   - Scrolls to top after 100ms

4. **Streaming Response**
   - Shows streaming indicator (animated cursor)
   - Creates AbortController for cancellation
   - Chunks streamed via Server-Sent Events (SSE)
   - Content updates in real-time
   - Scrolls to top of streaming message (smooth, block: start)

5. **Completion**
   - Creates assistant message with full response
   - Saves to DB
   - Clears streaming state
   - Enables input again

#### Auto-scroll Behavior
- **When streaming starts:** Scroll to top of new assistant message
- **When new branch added:** Scroll to new branch panel
- **When branch receives reference:** Scroll to target branch panel
- **After message sent on mobile:** Scroll to top to show header

---

## 3. UI INTERACTIONS

### 3.1 Layout & Responsiveness

#### Mobile (< 768px)
- **Sidebar:**
  - Starts closed
  - Opens as overlay (z-index 30) with backdrop
  - Full width when open
  - Swipe/click backdrop to close

- **Branch Layout:**
  - Horizontal scroll with snap points
  - Each branch takes full viewport width
  - Snap-x snap-mandatory
  - Touch-optimized (44px min tap targets)

- **Input:**
  - Font-size 16px (prevents zoom on iOS)
  - Keyboard pushes content up
  - Auto-blur on send

#### Desktop (≥ 768px)
- **Sidebar:**
  - Auto-opens on mount
  - Fixed position, 288px width
  - No backdrop needed

- **Branch Layout:**
  - Horizontal scroll (no snap)
  - Each branch 720px wide
  - Side-by-side viewing
  - Smooth scroll between branches

### 3.2 Visual States

#### Loading States

**Initial App Load:**
```
┌─────────────────────────────┐
│                             │
│    ⟳ (spinning animation)   │
│       LOADING...            │
│                             │
└─────────────────────────────┘
```

**Creating Conversation:**
- Button shows spinner + "CREATING..."
- Button disabled
- Prevents double-clicks

**Deleting Conversation:**
- List item opacity 50%
- Pointer events disabled
- Trash icon shows spinner

**Streaming Message:**
- Assistant icon with message
- Animated blinking cursor (w-1.5 h-4, bg-zinc-500, animate-pulse)
- Input disabled, Send button shows spinning Loader2 icon

#### Empty States

**No Conversations:**
```
┌─────────────────────────────┐
│    📁 (FolderOpen icon)     │
│ NO SAVED CONVERSATIONS YET  │
│  CREATE A CONVERSATION TO   │
│       GET STARTED           │
└─────────────────────────────┘
```

**Empty Branch:**
```
┌─────────────────────────────┐
│      ✨ (Sparkles icon)     │
│    START A NEW BRANCH       │
│  TYPE A MESSAGE BELOW TO    │
│           BEGIN             │
└─────────────────────────────┘
```

#### Interactive Feedback

**Buttons:**
- Base: `bg-zinc-900 border-zinc-800`
- Hover: `bg-zinc-800 border-zinc-700`
- Active: `bg-zinc-700`
- Disabled: `opacity-50 cursor-not-allowed`

**Conversation List Items:**
- Inactive: `bg-black`
- Hover: `bg-zinc-950`
- Active: `bg-zinc-900`

**Branch Selection Button:**
- Animated appearance: `animate-in fade-in zoom-in duration-200`
- Shadow: `shadow-2xl`
- Touch-optimized: `touch-manipulation`
- Dropdown: Chevron rotates 180° when open

**Copy Code Button:**
- Shows "Copy" → "Copied ✓" (2s timeout)

### 3.3 Scrolling & Snapping

#### Auto-scroll Behaviors

**When new branch added:**
```javascript
requestAnimationFrame(() => {
  setTimeout(() => {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'start'
    });
  }, 100);
});
```

**When streaming starts:**
```javascript
element.scrollIntoView({
  behavior: 'smooth',
  block: 'start'  // Shows top of message
});
```

**When text added to branch:**
- Scrolls to target branch panel
- Same smooth scroll with 100ms delay

#### Snap Points (Mobile Only)

**Branch Panels:**
- `scroll-snap-type: x mandatory`
- `scroll-snap-align: start`
- Full viewport width per panel
- Disabled on desktop (lg:snap-none)

### 3.4 Text Selection & Branch Button

#### Selection Detection

**Event Listener:**
- Listen to `document.selectionchange`
- Use `requestAnimationFrame` to stabilize selection
- Extract `window.getSelection().toString().trim()`

**DOM Traversal:**
- Find anchor node
- Walk up max 20 levels
- Stop at element with `data-message-id`
- Log error if max depth exceeded

**Position Calculation:**
```javascript
const range = selection.getRangeAt(0);
const rect = range.getBoundingClientRect();
if (rect.width > 0 && rect.height > 0) {
  position = {
    x: rect.left + rect.width / 2,
    y: rect.top + window.scrollY
  };
}
```

#### Button Positioning

**Initial State:**
- Always rendered (no conditional rendering)
- `opacity: 0`, `pointer-events: none`
- `position: absolute`, `z-index: 50`
- `transform: translate(-50%, -100%) -mt-2`

**Show State:**
- Direct DOM manipulation (no state updates)
- `style.left = x`, `style.top = y`
- `style.opacity = 1`, `style.pointerEvents = auto`

**iOS Safari Optimization:**
- 800ms delay before showing button
- Prevents clearing native selection UI
- Uses refs instead of state (no re-renders)
- `preventDefault()` on button mousedown/touchstart

#### Button Interactions

**Prevent Selection Loss:**
```javascript
const handleButtonMouseDown = (e, handler) => {
  e.preventDefault();
  e.stopPropagation();
  handler();
};
```

**Clear Selection After Action:**
```javascript
window.getSelection()?.removeAllRanges();
```

### 3.5 Input Interactions

#### Auto-resizing Textarea

**Resize Logic:**
```javascript
textarea.style.height = 'auto';
textarea.style.height = `${Math.min(scrollHeight, 200)}px`;
```

**Max Height:** 200px (scrolls vertically beyond this)

#### Mentioned Texts Display

**Appearance:**
- Shows above textarea
- Border-bottom separates from input
- Max-height: 400px with overflow-y scroll

**Each Reference:**
```
┌─────────────────────────────────┐
│ 💬 REFERENCED TEXT (1/2)     ✕ │
│ {truncated to 3 lines...}       │
└─────────────────────────────────┘
```

**Removal:**
- Click X button
- Filters out from array
- If all removed, section hides

#### Keyboard Behavior
- Enter: Send message
- Shift+Enter: New line
- Mobile: 16px font prevents auto-zoom
- Blur on send (closes keyboard)

### 3.6 Message Rendering

#### Markdown Support

**Rendering:** ReactMarkdown with:
- `remark-gfm` (GitHub Flavored Markdown)
- `rehype-highlight` (syntax highlighting)
- `highlight.js/styles/github-dark.css`

**Supported Elements:**
- Headings (h1-h3)
- Paragraphs with custom spacing
- Lists (ul, ol) with 6px left padding
- Code blocks with language detection
- Inline code with background
- Blockquotes with left border
- Tables with borders
- Links (open in new tab)

#### Code Blocks

**Features:**
- Language label in header
- Copy button (shows "Copied" feedback)
- Syntax highlighting
- Horizontal scroll if overflow

**Inline vs Block:**
- Block: Starts with \`\`\` and language
- Inline: Single backticks, inline rendering

#### User-selectable Text
- All message content: `select-text` CSS class
- Enables text selection for branching

---

## 4. BUSINESS LOGIC

### 4.1 LLM Integration

#### API Architecture

**Server-side Proxy (Security):**
```
Client → /api/chat → OpenRouter → Client (stream)
```

**Benefits:**
- API key never exposed to browser
- Stored in `.env.local` (server-only)
- Can't be extracted from client code

**Request Format:**
```javascript
POST /api/chat
{
  model: string,
  messages: [
    { role: 'user' | 'assistant' | 'system', content: string }
  ]
}
```

**Response:** Server-Sent Events (SSE)
```
data: {"id":"...","choices":[{"delta":{"content":"..."}}]}
data: {"id":"...","choices":[{"delta":{"content":"..."}}]}
data: [DONE]
```

#### Streaming Implementation

**Client Side:**
```javascript
async *streamChat(model, messages, signal) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ model, messages }),
    signal  // AbortController for cancellation
  });

  const reader = response.body.getReader();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value);
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') return;

        const parsed = JSON.parse(data);
        yield parsed.choices[0]?.delta?.content;
      }
    }
  }
}
```

**Server Side (route.ts):**
```javascript
const response = await fetch(OPENROUTER_API_URL, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': referer,
    'X-Title': 'Explorative Chat'
  },
  body: JSON.stringify({ model, messages, stream: true })
});

return new Response(response.body, {
  headers: {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  }
});
```

#### Error Handling

**API Key Missing:**
```json
{
  "error": "OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env.local"
}
```

**API Error:**
```json
{
  "error": "OpenRouter API error: {status} {details}"
}
```

**Client Handling:**
- Catch AbortError (user cancelled)
- Show alert for other errors
- Clear streaming state
- Re-enable input

### 4.2 Automatic Title Generation

#### Trigger Conditions

**When to Generate:**
- After first user message sent
- Only if conversation has no name
- Only in branch with position 0 (primary)
- Only once per conversation

**Implementation:**
```javascript
if (messages.length === 1 &&
    branch.position === 0 &&
    !conversation.name) {
  generateConversationTitle(userMessage, '')
    .then(title => updateConversation(id, { name: title }))
    .then(() => notifyParent())
    .catch(err => console.error(err));
}
```

#### Title Generation Logic

**Model Used:** `anthropic/claude-3-haiku` (fast, cheap)

**Prompt:**
```
Based on this user message, generate a short, descriptive
title (max 5 words). Only respond with the title, nothing else.

User: {first 500 chars of message}
```

**If assistant message available:**
```
Based on this conversation, generate a short, descriptive
title (max 5 words). Only respond with the title, nothing else.

User: {first 500 chars}
Assistant: {first 500 chars}
```

**Processing:**
1. Stream response chunks (same SSE pattern)
2. Concatenate full response
3. Clean: Remove quotes, trim, limit to 50 chars
4. Fallback: "New Conversation" on error

**Async Execution:**
- Runs in background (non-blocking)
- Updates DB when complete
- Notifies parent to refresh UI
- User can continue chatting during generation

**Parent Refresh Logic:**
```javascript
// Updates conversation metadata only (not branches)
const updatedConversation = await getConversation(id);
setConversations(prev => prev.map(c =>
  c.id === id ? updatedConversation : c
));
if (activeConversation?.id === id) {
  setActiveConversation(updatedConversation);
  // DO NOT touch activeBranches
}
```

### 4.3 Keyboard Shortcuts

#### Implementation

**Hook:** `useKeyboardShortcuts(shortcuts[], enabled)`

**Event Handling:**
```javascript
window.addEventListener('keydown', (e) => {
  for (const shortcut of shortcuts) {
    if (matches(e, shortcut)) {
      e.preventDefault();
      shortcut.action();
      break;
    }
  }
});
```

**Matching Logic:**
```javascript
const matches = (e, shortcut) => {
  return e.key === shortcut.key &&
         (shortcut.ctrlKey === undefined || e.ctrlKey === shortcut.ctrlKey) &&
         (shortcut.shiftKey === undefined || e.shiftKey === shortcut.shiftKey) &&
         (shortcut.metaKey === undefined || e.metaKey === shortcut.metaKey) &&
         (shortcut.altKey === undefined || e.altKey === shortcut.altKey);
};
```

#### Active Shortcuts

**Global (page.tsx):**

| Shortcut | Description | Action |
|----------|-------------|--------|
| Cmd/Ctrl + T | New conversation | Creates conversation + branch |
| Cmd/Ctrl + / | Show keyboard shortcuts | Opens help modal |
| Escape | Close dialog | Closes any open modal |

**Conditional:**
- Shortcuts disabled when modals open (`enabled = !showModal`)
- Platform-aware: `metaKey` = Cmd on Mac, Ctrl on Windows

#### Shortcut Display Format

**Mac:** ⌘T, ⌥N, ⇧K
**Windows/Linux:** Ctrl+T, Alt+N, Shift+K

**Format Function:**
```javascript
formatShortcut(shortcut) {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const parts = [];

  if (shortcut.metaKey) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.ctrlKey) parts.push('Ctrl');
  if (shortcut.shiftKey) parts.push('Shift');
  if (shortcut.altKey) parts.push(isMac ? '⌥' : 'Alt');

  parts.push(shortcut.key.toUpperCase());
  return parts.join('+');
}
```

### 4.4 State Management

#### Architecture

**Pattern:** Local state + prop drilling (no global store)

**Rationale:**
- Simple, predictable data flow
- Easy to debug
- No external dependencies
- Suitable for app complexity level

#### State Locations

**Top Level (page.tsx):**
```javascript
conversations: Conversation[]       // All conversations from DB
activeConversation: Conversation    // Currently selected
activeBranches: Branch[]            // Branches in active conversation
sidebarOpen: boolean                // Sidebar visibility
showShortcutsHelp: boolean          // Modal state
isLoading: boolean                  // Initial load
isCreating: boolean                 // Prevent double-create
createError: string | null          // Error display
```

**GroupView:**
```javascript
branches: Branch[]                  // Synced from props
activeBranchId: string              // Currently focused branch
```

**ConversationPanel:**
```javascript
messages: Message[]                 // Synced from branch.messages
isStreaming: boolean                // LLM streaming state
streamingContent: string            // Current stream buffer
selectedModel: string               // LLM model choice
showModelSelector: boolean          // Model dropdown state
branchSelectionRef: {               // Text selection (ref, not state!)
  message: Message
  text: string
  position: { x: number, y: number }
}
abortControllerRef: AbortController // Stream cancellation
```

**MessageInput:**
```javascript
message: string                     // Current input text
mentions: string[]                  // Referenced texts
```

**BranchButton:**
```javascript
showDropdown: boolean               // Existing branches dropdown
// Position controlled via direct DOM manipulation (no state)
```

#### State Synchronization

**Parent → Child (Props):**
```javascript
// page.tsx → GroupView
<GroupView
  group={activeConversation}
  conversations={activeBranches}
/>

// GroupView → ConversationPanel
<ConversationPanel
  conversation={branch}
  availableConversations={branches}
/>
```

**Child → Parent (Callbacks):**
```javascript
// ConversationPanel → GroupView
onBranch={(context) => {
  // Create new branch with context
}}

// GroupView → page.tsx
onGroupUpdate={(conversation, branches) => {
  setActiveConversation(conversation);
  setActiveBranches(branches);
}}
```

**State Persistence:**
- All state changes saved to IndexedDB immediately
- No "Save" button needed
- Auto-updates `updatedAt` timestamp

#### Critical State Rules

**Branch Messages:**
```javascript
// WRONG: This loses local changes
useEffect(() => {
  setMessages(conversation.messages);
}, [conversation.messages]);

// RIGHT: Only sync on branch ID change or more messages
useEffect(() => {
  if (prevBranchId !== conversation.id) {
    setMessages(conversation.messages);
  } else if (conversation.messages.length > messages.length) {
    setMessages(conversation.messages);
  }
}, [conversation.id, conversation.messages]);
```

**Selection Ref (iOS Fix):**
```javascript
// WRONG: State update triggers re-render, loses iOS selection
const [selection, setSelection] = useState(null);

// RIGHT: Ref doesn't trigger re-render
const selectionRef = useRef(null);
selectionRef.current = { message, text, position };
```

### 4.5 Mobile Optimizations

#### iOS Safari Fixes

**Text Selection:**
- Use refs instead of state (prevents re-render)
- 800ms delay before showing branch button
- `preventDefault()` on button mousedown
- Direct DOM manipulation for positioning
- Always render button (no conditional)

**Keyboard Handling:**
- 16px font size (prevents auto-zoom)
- `blur()` input after send
- Scroll to top after keyboard closes

**Touch Targets:**
- Minimum 44px × 44px (Apple guidelines)
- `touch-manipulation` CSS
- Larger padding on mobile

**CSS Properties:**
```css
-webkit-user-select: text;
-webkit-touch-callout: default;
user-select: text;
```

#### Viewport Handling

**Height Units:**
```css
height: 100dvh;  /* Dynamic viewport height */
```

**Benefits:**
- Adjusts when mobile browser chrome shows/hides
- Prevents content from being cut off
- Better than `100vh` on mobile

#### Scroll Behavior

**Mobile:**
- `scroll-snap-type: x mandatory`
- Full-width panels (100vw)
- Horizontal swipe navigation

**Desktop:**
- No snap points (`lg:snap-none`)
- Fixed-width panels (720px)
- Smooth scrolling between panels

---

## 5. TECHNICAL CONSTRAINTS

### 5.1 Browser Compatibility

**Required Features:**
- IndexedDB (fails gracefully in Safari private mode)
- Fetch API with streaming
- ReadableStream (for SSE)
- CSS Grid & Flexbox
- CSS scroll-snap
- CSS custom properties (variables)

**Tested Browsers:**
- Chrome/Edge (latest)
- Safari (desktop & iOS)
- Firefox (latest)

**Known Issues:**
- Safari private mode: IndexedDB unavailable
- iOS Safari: Text selection requires special handling

### 5.2 Performance Considerations

**Database:**
- IndexedDB indexed by: `conversationId`, `branchId`, `position`, `timestamp`
- Queries sorted by index (fast)
- Cascade deletes handled in code (not by DB)

**Rendering:**
- Messages virtualized via simple scroll (no library)
- Markdown parsed on-demand per message
- Syntax highlighting via `rehype-highlight`

**Memory:**
- AbortController cleaned up on unmount
- Event listeners removed on unmount
- Refs cleared when components unmount

**Network:**
- Streaming reduces time-to-first-token
- No polling (uses SSE)
- API key never sent to client

### 5.3 Security

**API Key Protection:**
- Stored in `.env.local` (server-only)
- Never exposed in client bundle
- Proxy pattern via `/api/chat`
- Validation on server side

**XSS Prevention:**
- Markdown rendered via ReactMarkdown (safe)
- No `dangerouslySetInnerHTML`
- Links open in new tab with `noopener noreferrer`

**Data Storage:**
- Client-side only (IndexedDB)
- No server-side persistence
- User responsible for backups (export/import)

---

## 6. DESIGN SYSTEM

### 6.1 Color Palette

**Cyberpunk Dark Theme:**

```css
--background: #000000        /* Pure black */
--surface: #0a0a0a          /* Slightly lighter black */
--surface-2: #18181b        /* zinc-900 */
--surface-3: #27272a        /* zinc-800 */
--surface-4: #3f3f46        /* zinc-700 */

--text-primary: #ffffff     /* White */
--text-secondary: #d4d4d8   /* zinc-300 */
--text-tertiary: #a1a1aa    /* zinc-400 */
--text-disabled: #71717a    /* zinc-500 */
--text-muted: #52525b       /* zinc-600 */

--border: #27272a           /* zinc-800 */
--border-light: #3f3f46     /* zinc-700 */

--accent-blue: #3b82f6      /* Links */
--accent-blue-hover: #60a5fa
```

### 6.2 Typography

**Font Stacks:**
```css
--font-mono: ui-monospace, SFMono-Regular, SF Mono, Menlo,
             Consolas, Liberation Mono, monospace

--font-system: system-ui, -apple-system, BlinkMacSystemFont,
               Segoe UI, Roboto, sans-serif
```

**Scale:**
- `text-xs`: 0.75rem (12px) - Labels, metadata
- `text-sm`: 0.875rem (14px) - Body text, buttons
- `text-base`: 1rem (16px) - Messages, inputs (mobile: prevents zoom)
- `text-lg`: 1.125rem (18px) - H3
- `text-xl`: 1.25rem (20px) - H2
- `text-2xl`: 1.5rem (24px) - H1

**Usage:**
- All UI text: Monospace font
- Message content: System font (better readability)
- Code blocks: Monospace font

### 6.3 Spacing Scale

**Tailwind Scale:**
- `p-1`: 0.25rem (4px)
- `p-2`: 0.5rem (8px)
- `p-3`: 0.75rem (12px)
- `p-4`: 1rem (16px)
- `p-6`: 1.5rem (24px)

**Common Patterns:**
- Gap between items: `gap-2` or `gap-3`
- Button padding: `px-3 py-2` (desktop), `px-3 py-3` (mobile)
- Message padding: `px-3 py-3`
- Border radius: Usually 0 (sharp edges for cyberpunk aesthetic)

### 6.4 Component Patterns

**Buttons:**
```css
Base: bg-zinc-900 border border-zinc-800 text-white font-mono
Hover: hover:bg-zinc-800 hover:border-zinc-700
Active: active:bg-zinc-700
Disabled: disabled:opacity-50 disabled:cursor-not-allowed
Transition: transition-colors
```

**Inputs:**
```css
Base: bg-zinc-950 border-0 text-white placeholder:text-zinc-700
Focus: focus:outline-none
Font: font-system (for inputs to prevent zoom)
Size: text-base (16px minimum on mobile)
```

**Cards/Panels:**
```css
Base: bg-black border border-zinc-800
Hover: hover:bg-zinc-950
Active: bg-zinc-900
```

**Icons:**
- Lucide React icons
- Sizes: `w-4 h-4` (default), `w-3 h-3` (small), `w-12 h-12` (large empty states)
- Color: `text-zinc-500` (default), `text-white` (active)

---

## 7. ERROR HANDLING

### 7.1 User-Facing Errors

**Storage Unavailable:**
```
Alert: "Storage not available. Please disable private browsing mode."
Display: Error banner below "CREATE NEW CONVERSATION" button
Action: Disable conversation creation
```

**API Key Missing:**
```
Alert: "Error communicating with the API. Please make sure your
API key is set in .env.local and try again."
Display: Alert dialog
Action: Clear streaming state, re-enable input
```

**Conversation Creation Failed:**
```
Alert: "Error creating conversation: {error message}"
Display: Error banner + alert dialog
Action: Clear creating state, allow retry
```

**Conversation Deletion Failed:**
```
Alert: "Error deleting conversation. Please try again."
Display: Alert dialog
Action: Clear deleting state, restore UI
```

**Branch Operations Failed:**
```
Alert: "Error adding/closing branch. Please try again."
Display: Alert dialog
Action: Restore previous state
```

### 7.2 Silent Errors

**Title Generation Failed:**
```
Fallback: "New Conversation"
Log: console.error('[generateTitle] Error:', error)
Action: Continue without blocking user
```

**Selection Detection Failed:**
```
Log: console.log('[Selection] ERROR: {reason}')
Action: Branch button doesn't appear
```

**Stream Parsing Failed:**
```
Log: console.error('Error parsing stream chunk:', e, 'Data:', data)
Action: Skip chunk, continue streaming
```

### 7.3 Loading States

**Prevent Double Operations:**
```javascript
if (isCreating) return;  // Already creating
setIsCreating(true);     // Block new clicks
try {
  await createConversation();
} finally {
  setIsCreating(false);  // Always re-enable
}
```

**Visual Feedback:**
- Button shows spinner
- Button text changes (e.g., "CREATING...")
- Button disabled
- Prevents race conditions

---

## 8. ACCESSIBILITY

### 8.1 Keyboard Navigation

**Shortcuts:**
- Cmd/Ctrl + T: New conversation
- Cmd/Ctrl + /: Show shortcuts
- Escape: Close modals
- Enter: Send message (in textarea)
- Shift + Enter: New line (in textarea)

**Focus Management:**
- Inputs auto-focus when branches created
- Modals trap focus
- Escape closes modals

### 8.2 Screen Readers

**ARIA Labels:**
```html
<button aria-label="Send message">
<button aria-label="Remove reference">
<button aria-label="Delete conversation">
<button title="Change model">
```

**Semantic HTML:**
- `<button>` for all clickable actions
- `<textarea>` for message input
- `<select>` for model selection
- `<h1>`, `<h2>`, `<h3>` for headings

**Data Attributes:**
```html
data-message-id="{id}"        // For selection detection
data-branch-button             // For click-outside detection
```

### 8.3 Visual Accessibility

**Contrast Ratios:**
- White on black: 21:1 (AAA)
- zinc-300 on black: 12:1 (AAA)
- zinc-500 on black: 4.5:1 (AA for large text)

**Focus Indicators:**
- Default browser focus rings
- Hover states for all interactive elements

**Text Sizing:**
- Minimum 14px (text-sm)
- Message content: 16px (text-base)
- Mobile inputs: 16px (prevents zoom)

---

## 9. FUTURE ENHANCEMENTS

### Mentioned in Roadmap

**Auto-generate Branch Titles:**
- Currently: "BRANCH 1", "BRANCH 2"
- Future: Generate from first message in branch

**Conversation Tags:**
- Schema exists: `tags?: string[]`
- UI exists: Tag display in sidebar
- Missing: Tag input/editor

**Conversation Naming:**
- Currently: Auto-generated only
- Future: Manual rename capability

### Potential Features

**Export/Import UI:**
- Functions exist in codebase
- No UI for triggering export/import

**Search Conversations:**
- No search functionality
- Would need full-text index

**Conversation Sharing:**
- Export to shareable format
- Import shared conversations

**Branch Reordering:**
- Drag-and-drop to reorder
- Update position values

**Message Editing:**
- Edit past messages
- Regenerate from edited point

**Message Deletion:**
- Delete individual messages
- Clean up conversation history

**Collaborative Features:**
- Multi-user conversations
- Real-time sync
- Conflict resolution

---

## 10. IMPLEMENTATION CHECKLIST

### Core Data Layer
- [ ] Set up IndexedDB with Dexie
- [ ] Implement Conversation, Branch, Message tables
- [ ] Create CRUD operations abstraction layer
- [ ] Add cascade delete logic
- [ ] Implement storage availability check

### API Integration
- [ ] Set up server-side `/api/chat` proxy
- [ ] Implement OpenRouter integration
- [ ] Add SSE streaming support
- [ ] Handle API key security
- [ ] Add error handling

### UI Components

**Layout:**
- [ ] Sidebar with conversation list
- [ ] Responsive mobile/desktop layouts
- [ ] Top bar with controls
- [ ] Empty states

**Conversation Management:**
- [ ] Create conversation flow
- [ ] Delete conversation with confirmation
- [ ] Conversation list item with metadata
- [ ] Conversation selection

**Branch Management:**
- [ ] Horizontal scrollable branch layout
- [ ] Branch panel with header
- [ ] Add branch button
- [ ] Close branch button (with constraints)
- [ ] Model selector dropdown
- [ ] Auto-scroll to new branches

**Messages:**
- [ ] Message list with user/assistant styling
- [ ] Markdown rendering with GFM
- [ ] Code block with syntax highlighting
- [ ] Copy code button
- [ ] Streaming indicator
- [ ] Auto-scroll behaviors

**Input:**
- [ ] Auto-resizing textarea
- [ ] Mentioned texts display
- [ ] Remove mention functionality
- [ ] Send button with states
- [ ] Keyboard shortcuts (Enter/Shift+Enter)
- [ ] Mobile keyboard handling

**Branching:**
- [ ] Text selection detection
- [ ] Floating branch button with positioning
- [ ] Branch to new branch
- [ ] Branch to existing branch (dropdown)
- [ ] iOS Safari selection fixes
- [ ] Clear selection after branching

### Business Logic
- [ ] LLM streaming integration
- [ ] Auto-title generation
- [ ] Keyboard shortcuts system
- [ ] State management patterns
- [ ] Reference text prepending
- [ ] AbortController for cancellation

### Mobile Optimizations
- [ ] Touch target sizing (44px minimum)
- [ ] Viewport height handling (100dvh)
- [ ] Scroll snap for branch panels
- [ ] Blur input after send
- [ ] iOS Safari text selection fixes
- [ ] Font size to prevent zoom

### Polish
- [ ] Loading states for all async operations
- [ ] Error handling and user feedback
- [ ] Hover states and transitions
- [ ] Empty states with helpful text
- [ ] Confirmation dialogs
- [ ] Cyberpunk dark theme styling

### Testing Scenarios
- [ ] Create first conversation
- [ ] Send messages and receive responses
- [ ] Select text and branch to new branch
- [ ] Select text and branch to existing branch
- [ ] Add and remove branches
- [ ] Switch between conversations
- [ ] Delete conversations
- [ ] Change models mid-conversation
- [ ] Test on mobile devices
- [ ] Test in Safari private mode
- [ ] Test keyboard shortcuts
- [ ] Test with API key missing

---

## APPENDIX A: Component Hierarchy

```
Home (page.tsx)
├── Sidebar
│   ├── Header
│   │   └── Close Button (mobile)
│   ├── New Conversation Button
│   └── GroupsList
│       └── Conversation Items
│           ├── Metadata (date, branch count, tags)
│           └── Delete Button
│
├── Mobile Overlay (backdrop)
│
└── Main Content
    ├── Top Bar
    │   ├── Menu Button (when sidebar closed)
    │   ├── Conversation Title & Branch Count
    │   └── New Branch Button
    │
    └── GroupView
        └── Branch Panels (horizontal scroll)
            └── ConversationPanel (per branch)
                ├── Header
                │   ├── Branch Title
                │   ├── Settings Button (model selector)
                │   └── Close Button
                │
                ├── Model Selector (dropdown)
                │
                ├── MessageList
                │   ├── Empty State
                │   ├── Messages
                │   │   ├── Avatar (User/Bot icon)
                │   │   ├── Branch Metadata (if branched)
                │   │   └── MessageContent (markdown)
                │   └── Streaming Message
                │
                ├── MessageInput
                │   ├── Mentioned Texts Display
                │   │   └── Reference Cards (removable)
                │   ├── Auto-resizing Textarea
                │   └── Send Button
                │
                └── BranchButton (floating)
                    ├── New Branch Button
                    └── Dropdown (existing branches)
```

## APPENDIX B: Data Flow Diagrams

### Conversation Creation Flow
```
User Click "New Conversation"
  ↓
Check isCreating (prevent double-click)
  ↓
Check IndexedDB available
  ↓
setIsCreating(true)
  ↓
Generate conversation ID
  ↓
Create conversation in DB
  ↓
Generate branch ID
  ↓
Create branch in DB
  ↓
Update conversation.branchIds
  ↓
setActiveConversation(new)
setActiveBranches([new branch])
  ↓
Reload conversations list
  ↓
setIsCreating(false)
```

### Branching Flow
```
User selects text in message
  ↓
selectionchange event fires
  ↓
requestAnimationFrame → Get selection
  ↓
Find message element (data-message-id)
  ↓
Calculate selection bounding box
  ↓
Delay 800ms (iOS Safari fix)
  ↓
Update selectionRef.current
  ↓
Show branch button (direct DOM manipulation)
  ↓
User clicks "NEW"
  ↓
Create branch with mentionedTexts: [selectedText]
  ↓
Add to conversation.branchIds
  ↓
Update state
  ↓
Scroll to new branch (100ms delay)
  ↓
Clear selection
```

### Message Send Flow
```
User types message + presses Enter
  ↓
handleSendMessage(content, mentionedTexts)
  ↓
Build full content (prepend references if any)
  ↓
Create user message
  ↓
Update local state (setMessages)
  ↓
Save message to DB
  ↓
Clear mentionedTexts in branch
  ↓
[If first message in primary branch]
  ├→ Check if conversation has no name
  └→ Generate title in background
  ↓
setIsStreaming(true)
  ↓
Create AbortController
  ↓
Call OpenRouter via /api/chat
  ↓
for await (chunk of stream) {
  ├→ Append to fullResponse
  └→ setStreamingContent(fullResponse)
}
  ↓
Create assistant message
  ↓
Update local state
  ↓
Save message to DB
  ↓
setIsStreaming(false)
```

---

## APPENDIX C: Environment Setup

### Required Files

**.env.local:**
```bash
OPENROUTER_API_KEY=your_key_here
```

**package.json dependencies:**
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "dexie": "^3.2.0",
    "dexie-react-hooks": "^1.1.0",
    "react-markdown": "^9.0.0",
    "remark-gfm": "^4.0.0",
    "rehype-highlight": "^7.0.0",
    "highlight.js": "^11.9.0",
    "lucide-react": "^0.300.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@types/react": "^18.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### Development Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run start        # Run production build
npm run lint         # Run ESLint
```

---

**Document Version:** 1.0
**Last Updated:** 2025
**Platform:** Web (Next.js 14, React 18)
**Status:** Complete specification based on production codebase