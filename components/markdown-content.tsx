'use client';

import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import { EmbeddedFlowchart } from './embedded-flowchart';

export function MarkdownContent({ content, userId }: { content: string; userId?: string }) {
  // Parse flowchart embeds
  const parseContent = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    const flowchartRegex = /\[flowchart:([a-zA-Z0-9-_]+)\]/g;
    let lastIndex = 0;
    let match;

    while ((match = flowchartRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(<EmbeddedFlowchart key={match[1]} flowchartId={match[1]} userId={userId} />);
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
  };

  const contentParts = parseContent(content);

  return (
    <div className="prose prose-fd max-w-none">
      {contentParts.map((part, idx) => 
        typeof part === 'string' ? (
          <ReactMarkdown
            key={idx}
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={{
          h1: ({ children }) => <h1 className="text-3xl font-bold mt-8 mb-4">{children}</h1>,
          h2: ({ children }) => <h2 className="text-2xl font-bold mt-6 mb-3">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xl font-bold mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-4 leading-7">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-6 mb-4 space-y-2">{children}</ol>,
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-fd-muted px-1.5 py-0.5 rounded text-sm font-mono">{children}</code>
            ) : (
              <code className={`${className} block bg-fd-muted p-4 rounded-lg overflow-x-auto`}>{children}</code>
            );
          },
          pre: ({ children }) => <pre className="mb-4">{children}</pre>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-fd-primary pl-4 italic my-4">{children}</blockquote>
          ),
        }}
          >
            {part}
          </ReactMarkdown>
        ) : (
          <div key={idx} className="my-6">{part}</div>
        )
      )}
    </div>
  );
}
