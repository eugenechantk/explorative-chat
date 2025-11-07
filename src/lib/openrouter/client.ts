/**
 * OpenRouter API client with streaming support
 */

import type { OpenRouterMessage, OpenRouterRequest, OpenRouterStreamChunk } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Send a chat completion request with streaming
   */
  async *streamChat(
    model: string,
    messages: OpenRouterMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'Explorative Chat',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      } satisfies OpenRouterRequest),
      signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed: OpenRouterStreamChunk = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (e) {
              console.error('Error parsing stream chunk:', e);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Send a chat completion request without streaming (for simpler use cases)
   */
  async chat(model: string, messages: OpenRouterMessage[]): Promise<string> {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : '',
        'X-Title': 'Explorative Chat',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
      } satisfies OpenRouterRequest),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }
}

// Storage key for API key
export const OPENROUTER_API_KEY_STORAGE = 'openrouter_api_key';

/**
 * Get API key from localStorage
 */
export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(OPENROUTER_API_KEY_STORAGE);
}

/**
 * Store API key in localStorage
 */
export function storeApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OPENROUTER_API_KEY_STORAGE, apiKey);
}

/**
 * Clear API key from localStorage
 */
export function clearStoredApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OPENROUTER_API_KEY_STORAGE);
}

/**
 * Popular OpenRouter models for selection
 */
export const POPULAR_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'openai/gpt-4', name: 'GPT-4' },
  { id: 'openai/gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  { id: 'google/gemini-pro', name: 'Gemini Pro' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B' },
] as const;
