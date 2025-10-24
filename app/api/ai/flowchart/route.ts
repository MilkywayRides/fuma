import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, currentCode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are a flowchart code generator. Generate JavaScript code that returns a flowchart definition object.
The code must follow this declarative format:

return {
  nodes: [
    { id: 'unique-id', type: 'input'|'default'|'output', x: number, y: number, title: 'string', content: 'string' }
  ],
  edges: [
    { from: 'source-id', to: 'target-id' }
  ]
};

Rules:
- Use descriptive IDs (e.g., 'start', 'process1', 'decision', 'end')
- Position nodes with good spacing (150-200px apart)
- Use 'input' type for start nodes, 'output' for end nodes, 'default' for others
- Keep titles short (1-3 words)
- For content with formulas: use template literals with backticks and escape properly
- Example: content: \`Formula: \\\\(x^2\\\\)\` or use single-line strings only
- CRITICAL: All strings must be valid JavaScript - no unescaped newlines in quotes
- Return ONLY valid JavaScript code, no explanations

Current code context:
${currentCode}`;

    let apiKey: string | undefined;
    let apiUrl: string;
    let requestBody: any;

    switch (model) {
      case 'gpt-4':
      case 'gpt-3.5':
        apiKey = process.env.OPENAI_API_KEY;
        apiUrl = 'https://api.openai.com/v1/chat/completions';
        requestBody = {
          model: model === 'gpt-4' ? 'gpt-4' : 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        };
        break;

      case 'claude-3':
        apiKey = process.env.ANTHROPIC_API_KEY;
        apiUrl = 'https://api.anthropic.com/v1/messages';
        requestBody = {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n${prompt}` }
          ],
        };
        break;

      case 'gemini':
        apiKey = process.env.GOOGLE_API_KEY;
        apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        requestBody = {
          contents: [{
            parts: [{ text: `${systemPrompt}\n\n${prompt}` }]
          }],
        };
        break;

      case 'grok':
        apiKey = process.env.XAI_API_KEY;
        apiUrl = 'https://api.x.ai/v1/chat/completions';
        requestBody = {
          model: 'grok-beta',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
        };
        break;

      default:
        return NextResponse.json({ error: 'Invalid model' }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ 
        error: `API key not configured for ${model}. Add ${model.toUpperCase().replace('-', '_')}_API_KEY to .env` 
      }, { status: 500 });
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (model === 'claude-3') {
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (model !== 'gemini') {
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

    const data = await response.json();
    let generatedCode: string;

    switch (model) {
      case 'gpt-4':
      case 'gpt-3.5':
      case 'grok':
        generatedCode = data.choices[0].message.content;
        break;
      case 'claude-3':
        generatedCode = data.content[0].text;
        break;
      case 'gemini':
        generatedCode = data.candidates[0].content.parts[0].text;
        break;
      default:
        generatedCode = '';
    }

    const codeMatch = generatedCode.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
    if (codeMatch) {
      generatedCode = codeMatch[1];
    }

    generatedCode = generatedCode
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();

    try {
      new Function(generatedCode);
    } catch (syntaxError: any) {
      return NextResponse.json({ 
        error: `Generated code has syntax error: ${syntaxError.message}. Please try again with simpler prompt.` 
      }, { status: 400 });
    }

    return NextResponse.json({ code: generatedCode });
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
