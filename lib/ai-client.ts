interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
}

interface ChatResponse {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chat(messages: ChatMessage[], options?: { max_tokens?: number; temperature?: number }): Promise<string> {
  const url = process.env.AI_MODEL_URL || process.env.NEXT_PUBLIC_AI_MODEL_URL;
  const apiKey = process.env.AI_API_SECRET;

  if (!url || !apiKey) {
    throw new Error('AI_MODEL_URL and AI_API_SECRET must be set');
  }

  const response = await fetch(`${url}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      messages,
      max_tokens: options?.max_tokens || 1000,
      temperature: options?.temperature || 0.7
    } as ChatRequest)
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.statusText}`);
  }

  const data: ChatResponse = await response.json();
  return data.content;
}
