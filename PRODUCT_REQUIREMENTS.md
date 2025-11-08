# Explorative Chat - Product Requirements Document

## Executive Summary

Explorative Chat is a multi-conversation LLM chat application that enables users to branch conversations to explore related topics. The core innovation is the ability to select text from any message and create new conversation branches with that context, all within a grouped, side-by-side layout.

---

## 1. DATA MODEL

### 1.1 Core Entities

#### Conversation
Represents a container for multiple related branches.

**Properties:**
- `id` (string): Unique identifier generated from timestamp and random string
- `branchIds` (string[]): Array of branch IDs in this conversation
- `name` (string, optional): Auto-generated or user-set title
- `tags` (string[], optional): Tags for organization
- `createdAt` (number): Unix timestamp of creation
- `updatedAt` (number): Unix timestamp of last update

**Constraints:**
- Must have at least one branch
- Name auto-generates after first user message in first branch
- Sorted by updatedAt descending in sidebar

#### Branch
Represents an individual chat thread within a conversation.

**Properties:**
- `id` (string): Unique identifier
- `conversationId` (string): Parent conversation ID
- `messages` (Message[]): Array of messages
- `model` (string): LLM model identifier (e.g., 'anthropic/claude-3.5-sonnet')
- `title` (string, optional): Auto-generated or user-set
- `createdAt` (number): Unix timestamp
- `updatedAt` (number): Unix timestamp
- `position` (number): Order in conversation layout (0-indexed)
- `mentionedTexts` (string[], optional): Referenced texts from branching

**Constraints:**
- Position 0 branch cannot be closed (primary branch)
- Sorted by position ascending in UI
- Default model: 'anthropic/claude-3.5-sonnet'

#### Message
Represents a single message in a branch.

**Properties:**
- `id` (string): Unique identifier
- `branchId` (string): Parent branch ID
- `role` (enum): 'user', 'assistant', or 'system'
- `content` (string): Message text (supports markdown)
- `timestamp` (number): Unix timestamp
- `branchSourceBranchId` (string, optional): Source branch if created from branching
- `branchSourceMessageId` (string, optional): Source message if created from branching
- `branchSelectedText` (string, optional): Selected text that triggered branch

**Constraints:**
- Sorted by timestamp ascending
- Content supports GitHub Flavored Markdown
- User messages may contain auto-prepended references section

### 1.2 Storage Requirements

**Persistence:**
- Local storage (IndexedDB or equivalent)
- Must check storage availability on load
- Display error if unavailable: "Storage not available. Please disable private browsing mode."

**Operations:**
- Create, Read, Update, Delete for all entities
- Auto-update `updatedAt` timestamp on all updates
- Cascade delete: Conversation → Branches → Messages
- Support export/import of all data

**Indexing:**
- Conversations indexed by: id, createdAt, updatedAt
- Branches indexed by: id, conversationId, position
- Messages indexed by: id, branchId, timestamp

---

## 2. USER FLOWS

### 2.1 First-Time User Experience

**Initial Load (No Data):**
1. Show loading indicator during data fetch
2. Display empty state: "NO ACTIVE CONVERSATION"
3. Show helpful text: "CREATE A NEW CONVERSATION TO START CHATTING"
4. Provide prominent "Create" button

**Create First Conversation:**
1. User clicks "NEW CONVERSATION" button
2. System creates new conversation with empty branchIds array
3. System creates initial branch (position 0, no messages)
4. System updates conversation with branch ID
5. Navigate to new conversation
6. Show empty branch state: "START A NEW BRANCH"
7. Focus on message input

**Send First Message:**
1. User types message in input field
2. User presses Enter to send (Shift+Enter for new line)
3. System saves message as user message
4. System begins streaming assistant response
5. After first user message sent, system generates conversation title in background
6. Title updates appear automatically when ready

### 2.2 Conversation Management

**Creating Conversations:**
1. Click "NEW CONVERSATION" button in sidebar
2. Prevent double-clicks with loading state
3. Create conversation and initial branch atomically
4. Add to top of sidebar list
5. Auto-select new conversation

**Selecting Conversations:**
1. Click conversation item in sidebar
2. Load all branches for that conversation
3. Update main view to show all branches
4. Auto-select first branch as active

**Deleting Conversations:**
1. Click delete icon on conversation item
2. Show confirmation dialog: "Are you sure you want to delete this conversation and all its branches?"
3. If confirmed:
   - Show deleting state (dimmed, disabled)
   - Cascade delete all branches and messages
   - Remove from sidebar
   - Clear main view if was active conversation

**Sidebar Display:**
- Show conversation name or "UNTITLED CONVERSATION"
- Display metadata: last updated time, branch count
- Show tags if present
- Highlight active conversation

### 2.3 Branching Flow (Core Feature)

**Branching to New Branch:**

1. **Text Selection:**
   - User selects text within any message
   - System detects selection and identifies source message
   - System calculates selection position for button placement

2. **Show Branch Button:**
   - Display floating button near selection
   - On iOS, delay 800ms to allow native UI to appear first
   - Button shows "NEW" with branch icon

3. **Create New Branch:**
   - User clicks "NEW" button
   - System creates branch with:
     - Next available position number
     - Empty messages array
     - Selected text in mentionedTexts array
   - System adds branch ID to conversation
   - System scrolls to new branch smoothly
   - System clears text selection

4. **Display Referenced Text:**
   - New branch shows selected text in input area
   - Display as quoted callout labeled "REFERENCED TEXT"
   - Truncate to 3 lines with ellipsis if longer
   - Provide remove button (X) for each reference

5. **Send Message with References:**
   - When user sends message, system prepends references in format:
     ```
     [Reference 1]
     {mentioned text}

     ---

     {user message}
     ```
   - System clears mentionedTexts array after sending

**Branching to Existing Branch:**

1. **Show Dropdown:**
   - If multiple branches exist, show dropdown chevron
   - Clicking chevron reveals list: "BRANCH TO BRANCH"
   - List all branches except current one
   - Show branch title or "BRANCH {position + 1}"

2. **Add to Existing Branch:**
   - User clicks target branch from dropdown
   - System appends selected text to target branch's mentionedTexts array
   - System saves update to storage
   - System scrolls to target branch smoothly
   - System clears text selection

### 2.4 Branch Management

**Adding Branches:**
1. Click "NEW BRANCH" button in top bar
2. System creates branch at next position
3. System scrolls to new branch automatically
4. Focus on message input

**Closing Branches:**
1. Click X button in branch header
2. Check constraints:
   - Cannot close if only 1 branch remains
   - Cannot close position 0 (primary) branch
3. Delete branch and all messages
4. Re-index remaining branches (update positions sequentially)
5. Update conversation's branchIds array
6. If active branch was closed, select first remaining branch

**Changing Models:**
1. Click Settings icon in branch header
2. Display model selector dropdown
3. Show available models:
   - Claude 3.5 Sonnet (default)
   - Claude 3 Opus
   - Claude 3 Haiku
   - GPT-4 Turbo
   - GPT-4
   - GPT-3.5 Turbo
   - Gemini Pro
   - Llama 3 70B
4. User selects model
5. System updates branch, saves to storage
6. Subsequent messages use new model

### 2.5 Message Flow

**Sending Messages:**

1. **Input:**
   - Type in auto-resizing text field (max 200px height)
   - Press Enter to send, Shift+Enter for new line
   - Can send with only referenced text (no typed message required)

2. **Validation:**
   - Input disabled during streaming
   - Requires either message text OR mentioned texts

3. **Submission:**
   - Create user message with full content
   - Save to storage immediately
   - Clear text field (reset to auto height)
   - Dismiss keyboard on mobile
   - Scroll to top after 100ms on mobile

4. **Streaming Response:**
   - Display streaming indicator (animated cursor)
   - Stream chunks via Server-Sent Events (SSE)
   - Update content in real-time
   - Scroll to top of streaming message
   - Support cancellation via abort mechanism

5. **Completion:**
   - Create assistant message with full response
   - Save to storage
   - Clear streaming state
   - Re-enable input

**Auto-scroll Behavior:**
- When streaming starts: Scroll to top of new assistant message
- When new branch added: Scroll to new branch panel
- When branch receives reference: Scroll to target branch panel
- After message sent on mobile: Scroll to top to show header

---

## 3. UI INTERACTIONS

### 3.1 Layout Requirements

**Mobile (< 768px):**
- Sidebar starts closed
- Opens as overlay with backdrop
- Full width when open
- Swipe or tap backdrop to close
- Branch panels: horizontal scroll with snap points
- Each branch takes full viewport width
- Touch-optimized (44px minimum tap targets)

**Desktop (≥ 768px):**
- Sidebar auto-opens on mount
- Fixed position, 288px width
- No backdrop needed
- Branch panels: horizontal scroll without snap
- Each branch 720px wide
- Side-by-side viewing

### 3.2 Visual States

**Loading States:**

- **Initial app load:**
  - Spinning animation
  - Text: "LOADING..."

- **Creating conversation:**
  - Button shows spinner + "CREATING..."
  - Button disabled to prevent double-clicks

- **Deleting conversation:**
  - List item 50% opacity
  - Pointer events disabled
  - Spinner icon

- **Streaming message:**
  - Assistant icon with message
  - Animated blinking cursor
  - Input disabled
  - Send button shows spinning icon

**Empty States:**

- **No conversations:**
  - Folder icon (large)
  - "NO SAVED CONVERSATIONS YET"
  - "CREATE A CONVERSATION TO GET STARTED"

- **Empty branch:**
  - Sparkles icon (large)
  - "START A NEW BRANCH"
  - "TYPE A MESSAGE BELOW TO BEGIN"

**Interactive Feedback:**
- All buttons have hover and active states
- Conversation list items highlight on hover
- Active conversation prominently highlighted
- Branch selection button animates on appearance
- Code copy button shows "Copied" confirmation (2s)

### 3.3 Scrolling & Navigation

**Auto-scroll Triggers:**

1. **New branch added:**
   - Scroll to new branch panel
   - Use smooth scrolling
   - Delay 100ms for layout completion

2. **Streaming starts:**
   - Scroll to top of streaming message
   - Show beginning of response first

3. **Text added to branch:**
   - Scroll to target branch panel
   - Same smooth scroll with delay

**Snap Points (Mobile Only):**
- Branch panels snap to start position
- Mandatory snap on mobile
- Disabled on desktop (smooth scroll)

### 3.4 Text Selection & Branch Button

**Selection Detection:**
1. Listen for text selection events
2. Stabilize selection with animation frame
3. Extract selected text
4. Walk DOM to find parent message element
5. Calculate selection bounding box
6. Validate selection has dimensions

**Button Positioning:**
- Position absolutely at selection midpoint
- Offset above selection (avoid covering text)
- On iOS, delay 800ms before showing
- Use direct positioning (not layout-based)
- Always rendered but hidden when inactive

**Selection Preservation:**
- Prevent default on button interactions
- Stop event propagation
- Clear selection only after action completes
- On iOS, avoid state updates during selection

### 3.5 Input Interactions

**Auto-resizing Text Field:**
- Adjusts height based on content
- Maximum height: 200px
- Scrolls vertically beyond max
- Resets to initial height when cleared

**Mentioned Texts Display:**
- Appears above text field
- Separated by border
- Max height 400px with vertical scroll
- Each reference shows:
  - Quote icon
  - Label: "REFERENCED TEXT (n/total)"
  - Truncated text (3 lines max)
  - Remove button (X)

**Keyboard Behavior:**
- Enter: Send message
- Shift+Enter: New line
- Mobile: 16px font prevents auto-zoom
- Dismiss keyboard after send
- Support for platform-specific shortcuts

### 3.6 Message Rendering

**Markdown Support:**
- GitHub Flavored Markdown (GFM)
- Headings (h1-h3)
- Paragraphs with spacing
- Lists (ordered, unordered)
- Code blocks with language detection
- Inline code with background
- Blockquotes with left border
- Tables with borders
- Links (open in new tab/window)

**Code Blocks:**
- Language label in header
- Copy button with feedback
- Syntax highlighting
- Horizontal scroll if needed
- Distinction between inline and block code

**Content Selection:**
- All message text selectable for branching
- Preserve formatting during selection
- Selection works across message boundaries

---

## 4. BUSINESS LOGIC

### 4.1 LLM Integration

**API Architecture:**
- Client calls server-side proxy endpoint
- Server stores API key securely (never exposed to client)
- Server forwards requests to OpenRouter
- Server streams responses back to client
- Client never has direct access to API key

**Request Flow:**
1. Client sends model and messages array to proxy
2. Server validates API key exists
3. Server forwards to OpenRouter with streaming enabled
4. Server returns SSE stream to client
5. Client processes chunks as they arrive

**Response Streaming:**
- Server-Sent Events (SSE) format
- Each chunk contains delta content
- Special [DONE] message indicates completion
- Support for cancellation mid-stream

**Error Handling:**

- **API Key Missing:**
  - Alert: "Error communicating with the API. Please make sure your API key is set."
  - Clear streaming state
  - Re-enable input

- **API Error:**
  - Display status and error message
  - Clear streaming state
  - Allow retry

- **Stream Parsing Failed:**
  - Log error silently
  - Skip invalid chunk
  - Continue processing stream

- **Cancelled by User:**
  - Handle abort signal
  - Clean up resources
  - Return gracefully

### 4.2 Automatic Title Generation

**Trigger Conditions:**
- After first user message sent
- Only if conversation has no name
- Only in branch with position 0 (primary)
- Only once per conversation

**Generation Process:**
1. Use fast, cheap model (e.g., Claude Haiku)
2. Build prompt:
   - If only user message: "Based on this user message, generate a short, descriptive title (max 5 words)..."
   - If assistant response available: Include both in prompt
3. Stream response chunks
4. Concatenate full response
5. Clean: Remove quotes, trim, limit to 50 characters
6. Fallback: "New Conversation" on error

**Async Execution:**
- Runs in background (non-blocking)
- Updates storage when complete
- Notifies UI to refresh
- User can continue chatting during generation

### 4.3 Platform-Specific Optimizations

**iOS Considerations:**

- **Text Selection:**
  - Use non-reactive storage for selection data
  - 800ms delay before showing branch button
  - Prevent default on button press
  - Avoid re-renders during selection

- **Keyboard Handling:**
  - 16px minimum font size prevents auto-zoom
  - Dismiss keyboard after send
  - Scroll to top after keyboard closes

- **Touch Targets:**
  - Minimum 44px × 44px (Apple guidelines)
  - Touch-optimized CSS properties
  - Larger padding on mobile elements

**Web Considerations:**

- **Viewport Handling:**
  - Use dynamic viewport height units
  - Adjust when browser chrome shows/hides
  - Prevent content cutoff

- **Scroll Behavior:**
  - Smooth scrolling on desktop
  - Snap scrolling on mobile
  - Platform-appropriate momentum

---

## 5. TECHNICAL REQUIREMENTS

### 5.1 Browser/Platform Compatibility

**Required Features:**
- Local storage (IndexedDB or equivalent)
- Fetch API with streaming
- ReadableStream for SSE
- Responsive layout system
- Scroll snap (mobile)
- Modern CSS support

**Tested Platforms:**
- iOS Safari
- Chrome/Edge (latest)
- Firefox (latest)
- Safari desktop

**Known Issues:**
- Safari private mode: Storage unavailable
- iOS Safari: Text selection requires special handling

### 5.2 Performance Considerations

**Storage:**
- Indexed queries for fast retrieval
- Queries sorted by indexed fields
- Cascade deletes handled in code

**Rendering:**
- Messages rendered on-demand
- Markdown parsed per message
- Syntax highlighting as needed

**Memory:**
- Clean up resources on unmount
- Remove event listeners properly
- Clear refs when components unmount

**Network:**
- Streaming reduces time-to-first-token
- No polling (use SSE)
- API key never sent to client

### 5.3 Security

**API Key Protection:**
- Stored server-side only
- Never exposed in client bundle
- Proxy pattern for API calls
- Validation on server

**XSS Prevention:**
- Safe markdown rendering
- No dangerous HTML insertion
- Links open safely in new context

**Data Storage:**
- Client-side only
- No server-side persistence
- User responsible for backups

---

## 6. ERROR HANDLING

### 6.1 User-Facing Errors

**Storage Unavailable:**
- Alert: "Storage not available. Please disable private browsing mode."
- Display error banner
- Disable conversation creation

**API Key Missing:**
- Alert: "Error communicating with the API. Please make sure your API key is set."
- Clear streaming state
- Re-enable input

**Conversation Creation Failed:**
- Alert: "Error creating conversation: {error message}"
- Display in error banner and alert
- Allow retry

**Conversation Deletion Failed:**
- Alert: "Error deleting conversation. Please try again."
- Restore UI to previous state

**Branch Operations Failed:**
- Alert: "Error adding/closing branch. Please try again."
- Restore previous state

### 6.2 Silent Errors

**Title Generation Failed:**
- Fallback: "New Conversation"
- Log error to console
- Continue without blocking user

**Selection Detection Failed:**
- Log error to console
- Branch button doesn't appear
- User can retry selection

**Stream Parsing Failed:**
- Log error to console
- Skip invalid chunk
- Continue processing stream

### 6.3 Loading State Management

**Prevent Double Operations:**
- Track operation in progress
- Block new clicks during operation
- Always clear flag in finally block
- Show visual feedback during operation

**Visual Feedback:**
- Button shows spinner during operation
- Button text changes (e.g., "CREATING...")
- Button disabled
- Prevents race conditions

---

## 7. ACCESSIBILITY

### 7.1 Keyboard Navigation

**Shortcuts:**
- Cmd/Ctrl + T: New conversation
- Cmd/Ctrl + /: Show shortcuts help
- Escape: Close modals
- Enter: Send message (in text field)
- Shift + Enter: New line (in text field)

**Focus Management:**
- Inputs auto-focus when branches created
- Modals trap focus
- Escape closes modals
- Logical tab order

### 7.2 Screen Readers

**Labels:**
- All interactive elements have labels
- Icons have text alternatives
- Buttons describe their action
- Form inputs have associated labels

**Semantic Structure:**
- Proper heading hierarchy
- Buttons for all clickable actions
- Appropriate input types
- Clear content structure

**Identifiers:**
- Unique IDs for messages (selection detection)
- Accessible names for all controls

### 7.3 Visual Accessibility

**Contrast:**
- High contrast text (minimum AA, prefer AAA)
- Clear focus indicators
- Hover states for all interactive elements

**Text Sizing:**
- Minimum 14px for UI text
- Minimum 16px for content
- Mobile inputs 16px (prevents zoom)
- Scalable with system settings

---

## 8. FUTURE ENHANCEMENTS

### Mentioned in Roadmap

**Auto-generate Branch Titles:**
- Currently: "BRANCH 1", "BRANCH 2"
- Future: Generate from first message in branch

**Conversation Tags:**
- Schema exists but no UI for editing
- Add tag input/management interface

**Conversation Naming:**
- Currently: Auto-generated only
- Future: Manual rename capability

### Potential Features

**Export/Import UI:**
- Functions exist but no UI
- Add export/import interface

**Search Conversations:**
- Full-text search capability
- Filter by tags, date, content

**Conversation Sharing:**
- Export to shareable format
- Import shared conversations

**Branch Reordering:**
- Drag-and-drop to reorder
- Manual position updates

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

## APPENDIX: Data Flow Examples

### Conversation Creation Flow
1. User clicks "New Conversation"
2. Check if already creating (prevent double-click)
3. Check storage available
4. Set creating state
5. Generate conversation ID
6. Create conversation in storage
7. Generate branch ID
8. Create branch in storage
9. Update conversation with branch ID
10. Set as active conversation
11. Set active branches
12. Reload conversations list
13. Clear creating state

### Branching Flow
1. User selects text in message
2. Selection event fires
3. Stabilize selection
4. Find parent message element
5. Calculate selection bounding box
6. Delay for platform (800ms on iOS)
7. Store selection data
8. Show branch button
9. User clicks "NEW"
10. Create branch with mentioned text
11. Add to conversation's branch IDs
12. Update UI state
13. Scroll to new branch (100ms delay)
14. Clear selection

### Message Send Flow
1. User types message and presses Enter
2. Build full content (prepend references if any)
3. Create user message object
4. Update local state
5. Save message to storage
6. Clear mentioned texts in branch
7. If first message in primary branch: Generate title in background
8. Set streaming state
9. Call LLM API via proxy
10. Process stream chunks as they arrive
11. Update streaming content display
12. On completion: Create assistant message
13. Update local state
14. Save message to storage
15. Clear streaming state

---

**Document Version:** 2.0
**Last Updated:** 2025
**Status:** Platform-agnostic functional specification