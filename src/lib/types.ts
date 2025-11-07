/**
 * Core data types for the explorative chat application
 * Designed to be storage-agnostic for easy migration from IndexedDB to database
 */

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  // Branching metadata
  branchSourceConversationId?: string;
  branchSourceMessageId?: string;
  branchSelectedText?: string;
}

export interface Conversation {
  id: string;
  groupId: string;
  messages: Message[];
  model: string; // OpenRouter model identifier
  title?: string; // Auto-generated or user-set
  createdAt: number;
  updatedAt: number;
  position: number; // Order in the group layout (0-indexed)
}

export interface ConversationGroup {
  id: string;
  conversationIds: string[];
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
  sourceConversationId: string;
  sourceMessageId?: string;
  selectedText?: string;
}
