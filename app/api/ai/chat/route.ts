import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { messages, model, stream = true } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const systemPrompt = `You are BlazeAI, a helpful assistant for flowchart discussions. You help users understand, plan, and discuss their flowcharts. You provide conversational responses, not code. Be concise and helpful.`;

    let apiKey: string | undefined;
    let apiUrl: string;
    let requestBody: any;

    switch (model) {
      case 'blazeai':
        apiKey = process.env.AI_API_SECRET;
        apiUrl = `${process.env.AI_MODEL_URL}/v1/chat/completions`;
        requestBody = {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        };
        break;

      case 'blazeai-beta':
        apiKey = process.env.AI_API_SECRET;
        apiUrl = `${process.env.AI_MODEL_URL_V2 || process.env.AI_MODEL_URL}/v1/chat/completions`;
        requestBody = {
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        };
        break;

      case 'gpt-4':
      case 'gpt-3.5':
        apiKey = process.env.OPENAI_API_KEY;
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        requestBody = {
          model: model === 'gpt-4' ? 'gpt-4' : 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.7,
        };
        break;

      case 'claude-3':
        apiKey = process.env.ANTHROPIC_API_KEY;
        apiUrl = 'https://api.anthropic.com/v1/messages';
        requestBody = {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: messages,
          system: systemPrompt,
        };
        break;

      case 'grok':
        apiKey = process.env.XAI_API_KEY;
        apiUrl = 'https://api.x.ai/v1/chat/completions';
        requestBody = {
          model: 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature: 0.7,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ 
        error: `API key not configured for ${model}` 
      }, { status: 500 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (model === 'blazeai' || model === 'blazeai-beta') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (model === 'claude-3') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error: `API error: ${error}` }, { status: response.status });
    }

    // For now, return non-streaming response
    // Streaming will be added when BlazeAI supports it
    const data = await response.json();
    let content: string;

    switch (model) {
      case 'blazeai':
      case 'blazeai-beta':
        content = data.content || '';
        break;
      case 'gpt-4':
      case 'gpt-3.5':
      case 'grok':
        content = data.choices[0].message.content;
        break;
      case 'claude-3':
        content = data.content[0].text;
        break;
      default:
        content = '';
    }

    // Simulate streaming by chunking the response
    if (stream) {
      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const words = content.split(' ');
          for (let i = 0; i < words.length; i++) {
            const chunk = (i === 0 ? words[i] : ' ' + words[i]);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 30));
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });
      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
