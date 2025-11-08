/**
 * OpenRouter API client with streaming support
 * Now uses server-side API route to keep API key secure
 */

import type { OpenRouterMessage, OpenRouterStreamChunk } from '../types';

export class OpenRouterClient {
  /**
   * Send a chat completion request with streaming via our API route
   */
  async *streamChat(
    model: string,
    messages: OpenRouterMessage[],
    signal?: AbortSignal
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
      }),
      signal,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Chat API error: ${response.status} ${error}`);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Append new chunk to buffer
        buffer += decoder.decode(value, { stream: true });

        // Split by newlines and process complete lines
        const lines = buffer.split('\n');

        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

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
              console.error('Error parsing stream chunk:', e, 'Data:', data);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
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
