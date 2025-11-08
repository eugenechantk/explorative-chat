/**
 * Core data types for the explorative chat application
 * Designed to be storage-agnostic for easy migration from IndexedDB to database
 */

export interface Message {
  id: string;
  branchId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  // Branching metadata
  branchSourceBranchId?: string;
  branchSourceMessageId?: string;
  branchSelectedText?: string;
}

export interface Branch {
  id: string;
  conversationId: string;
  messages: Message[];
  model: string; // OpenRouter model identifier
  title?: string; // Auto-generated or user-set
  createdAt: number;
  updatedAt: number;
  position: number; // Order in the conversation layout (0-indexed)
  initialInput?: string; // Prepopulated input text (e.g., from branching) - deprecated, use mentionedTexts
  mentionedTexts?: string[]; // Array of referenced texts from branching
}

export interface Conversation {
  id: string;
  branchIds: string[];
  name?: string; // Auto-generated or user-set
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

// For OpenRouter API
export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
}

export interface OpenRouterStreamChunk {
  id: string;
  choices: Array<{
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason?: string;
  }>;
}

// UI State types
export interface BranchContext {
  sourceBranchId: string;
  sourceMessageId?: string;
  selectedText?: string;
}
