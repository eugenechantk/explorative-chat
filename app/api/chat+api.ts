import Constants from 'expo-constants';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: Request) {
  try {
    // Get API key from environment variables
    const apiKey = Constants.expoConfig?.extra?.OPENROUTER_API_KEY || process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'OpenRouter API key not configured. Please set EXPO_PUBLIC_OPENROUTER_API_KEY in your environment' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { model, messages } = body;

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': request.headers.get('referer') || '',
        'X-Title': 'Explorative Chat',
      },
      body: JSON.stringify({
        model,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json(
        { error: `OpenRouter API error: ${response.status} ${error}` },
        { status: response.status }
      );
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
