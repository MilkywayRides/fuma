'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MarkdownContent } from './markdown-content';
import 'easymde/dist/easymde.min.css';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const options = useMemo(() => ({
    spellChecker: false,
    placeholder: placeholder || 'Write your content here...',
    toolbar: [
      'bold', 'italic', 'heading', '|',
      'quote', 'code', 'unordered-list', 'ordered-list', '|',
      'link', 'image', '|',
      'preview', 'side-by-side', 'fullscreen', '|',
      'guide',
      {
        name: 'math',
        action: (editor: any) => {
          const cm = editor.codemirror;
          const selection = cm.getSelection();
          cm.replaceSelection(`$${selection}$`);
        },
        className: 'fa fa-superscript',
        title: 'Inline Math',
      } as any,
      {
        name: 'mathBlock',
        action: (editor: any) => {
          const cm = editor.codemirror;
          const selection = cm.getSelection();
          cm.replaceSelection(`\n\`\`\`math\n${selection}\n\`\`\`\n`);
        },
        className: 'fa fa-calculator',
        title: 'Math Block',
      } as any,
    ] as any,
    status: ['lines', 'words', 'cursor'] as any,
    minHeight: '400px',
  }), [placeholder]);

  return (
    <div className="space-y-3">
      <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
        <button
          type="button"
          onClick={() => setShowPreview(false)}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
            !showPreview ? 'bg-background text-foreground shadow' : 'hover:bg-background/50'
          }`}
        >
          Editor
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
            showPreview ? 'bg-background text-foreground shadow' : 'hover:bg-background/50'
          }`}
        >
          Preview
        </button>
      </div>

      {!showPreview ? (
        <SimpleMDE value={value} onChange={onChange} options={options} />
      ) : (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 min-h-[400px]">
          <MarkdownContent content={value} />
        </div>
      )}

      <div className="rounded-lg border bg-muted/50 p-4">
        <p className="text-sm font-semibold mb-2">Markdown Guide</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <div><code className="bg-background px-1.5 py-0.5 rounded"># Heading</code> - Headers</div>
          <div><code className="bg-background px-1.5 py-0.5 rounded">**bold**</code> - Bold text</div>
          <div><code className="bg-background px-1.5 py-0.5 rounded">*italic*</code> - Italic text</div>
          <div><code className="bg-background px-1.5 py-0.5 rounded">`code`</code> - Inline code</div>
          <div><code className="bg-background px-1.5 py-0.5 rounded">```js</code> - Code blocks</div>
          <div><code className="bg-background px-1.5 py-0.5 rounded">$x^2$</code> - Inline math</div>
          <div><code className="bg-background px-1.5 py-0.5 rounded">```math</code> - Math blocks</div>
          <div><code className="bg-background px-1.5 py-0.5 rounded">[text](url)</code> - Links</div>
        </div>
      </div>
    </div>
  );
}
