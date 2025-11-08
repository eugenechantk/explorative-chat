/**
 * Generate a semantic title for a conversation using LLM
 */

export async function generateConversationTitle(
  userMessage: string,
  assistantMessage: string
): Promise<string> {
  try {
    console.log('[generateTitle] Starting title generation...');

    // Build the prompt based on what we have
    let prompt = 'Based on this user message, generate a short, descriptive title (max 5 words). Only respond with the title, nothing else.\n\nUser: ' + userMessage.slice(0, 500);

    if (assistantMessage) {
      prompt = 'Based on this conversation, generate a short, descriptive title (max 5 words). Only respond with the title, nothing else.\n\nUser: ' + userMessage.slice(0, 500) + '\n\nAssistant: ' + assistantMessage.slice(0, 500);
    }

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-haiku',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    console.log('[generateTitle] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generateTitle] API error:', errorText);
      throw new Error('Failed to generate title: ' + errorText);
    }

    if (!response.body) {
      throw new Error('Response body is null');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    // Clean up the title (remove quotes, trim, limit length)
    const cleanedTitle = fullResponse.trim().replace(/^["']|["']$/g, '').slice(0, 50);
    console.log('[generateTitle] Generated title:', cleanedTitle);
    return cleanedTitle;
  } catch (error) {
    console.error('[generateTitle] Error generating conversation title:', error);
    // Return a fallback title
    return 'New Conversation';
  }
}
