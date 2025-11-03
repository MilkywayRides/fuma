import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt, model, currentCode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const systemPrompt = `You are a flowchart code generator. Convert ANY user request into a flowchart.

IMPORTANT: Whatever the user asks (coffee recipe, login flow, algorithm, etc.), you MUST respond with ONLY a flowchart code in this EXACT format:

return {
  nodes: [
    { id: 'start', type: 'input', x: 100, y: 100, title: 'Start', content: 'Begin' },
    { id: 'step1', type: 'default', x: 300, y: 100, title: 'Step 1', content: 'Description' },
    { id: 'end', type: 'output', x: 500, y: 100, title: 'End', content: 'Done' }
  ],
  edges: [
    { from: 'start', to: 'step1' },
    { from: 'step1', to: 'end' }
  ]
};

RULES:
- ALWAYS respond with flowchart code, NEVER plain text
- Start with 'return {' and end with '};'
- Break down the process into logical steps as nodes
- Use descriptive titles and content for each step
- Space nodes 150-200px apart horizontally or vertically
- Types: 'input' (start), 'default' (process/step), 'output' (end)
- NO explanations, NO text, ONLY the return statement

Current flowchart:
${currentCode}`;

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
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7,
        };
        break;

      case 'blazeai-beta':
        apiKey = process.env.AI_API_SECRET;
        apiUrl = `${process.env.AI_MODEL_URL_V2 || process.env.AI_MODEL_URL}/v1/chat/completions`;
        requestBody = {
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          max_tokens: 1500,
          temperature: 0.3,
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

    if (model === 'blazeai' || model === 'blazeai-beta') {
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (model === 'claude-3') {
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
    console.log('AI Response:', model, data);
    let generatedCode: string;

    switch (model) {
      case 'blazeai':
      case 'blazeai-beta':
        generatedCode = data.content || data.response || data.choices?.[0]?.message?.content || '';
        break;
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

    // Extract code from markdown blocks
    const codeMatch = generatedCode.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
    if (codeMatch) {
      generatedCode = codeMatch[1];
    }

    // Clean HTML entities
    generatedCode = generatedCode
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim();

    // Extract nodes and edges arrays if present
    const nodesMatch = generatedCode.match(/const\s+nodes\s*=\s*\[([\s\S]*?)\];/);
    const edgesMatch = generatedCode.match(/const\s+edges\s*=\s*\[([\s\S]*?)\];/);
    
    if (nodesMatch && edgesMatch) {
      // Reconstruct as return statement
      generatedCode = `return {\n  nodes: [${nodesMatch[1]}],\n  edges: [${edgesMatch[1]}]\n};`;
    } else {
      // Extract only the return statement if there's extra text
      const returnMatch = generatedCode.match(/return\s*\{[\s\S]*?\};?/);
      if (returnMatch) {
        generatedCode = returnMatch[0];
      } else if (!generatedCode.includes('return')) {
        // If no return statement found, wrap in return if it looks like an object
        if (generatedCode.trim().startsWith('{') && generatedCode.trim().endsWith('}')) {
          generatedCode = `return ${generatedCode}`;
        }
      }
    }

    // Remove any trailing notes or text after the return statement
    generatedCode = generatedCode.replace(/;?\s*```[\s\S]*$/, '');
    generatedCode = generatedCode.replace(/;?\s*Note:?[\s\S]*$/i, '');
    generatedCode = generatedCode.trim();

    if (!generatedCode || generatedCode.trim() === '') {
      return NextResponse.json({ 
        error: 'No code generated by AI. Please try again.' 
      }, { status: 400 });
    }

    // Try to validate syntax, but don't fail if it's just incomplete
    try {
      new Function(generatedCode);
    } catch (syntaxError: any) {
      console.warn('Generated code may have syntax issues:', syntaxError.message);
      console.log('Generated code:', generatedCode);
      // Still return the code - let user fix it
    }

    return NextResponse.json({ code: generatedCode });
  } catch (error: any) {
    console.error('AI API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
