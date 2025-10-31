'use client';

import { useState } from 'react';
import { MarkdownContent } from './markdown-content';
import { FlowchartSelector } from './flowchart-selector';
import { 
  Bold, Italic, Code, Link, Image, List, ListOrdered, 
  Quote, Heading1, Heading2, Eye, Edit3, Maximize2, 
  Type, Calculator, Workflow 
} from 'lucide-react';

interface CustomMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomMarkdownEditor({ value, onChange, placeholder }: CustomMarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFlowchartSelector, setShowFlowchartSelector] = useState(false);

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('markdown-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const toolbarButtons = [
    { icon: Heading1, label: 'Heading 1', action: () => insertText('# ', '\n') },
    { icon: Heading2, label: 'Heading 2', action: () => insertText('## ', '\n') },
    { icon: Bold, label: 'Bold', action: () => insertText('**', '**') },
    { icon: Italic, label: 'Italic', action: () => insertText('*', '*') },
    { icon: Code, label: 'Inline Code', action: () => insertText('`', '`') },
    { icon: Quote, label: 'Quote', action: () => insertText('> ', '\n') },
    { icon: List, label: 'Bullet List', action: () => insertText('- ', '\n') },
    { icon: ListOrdered, label: 'Numbered List', action: () => insertText('1. ', '\n') },
    { icon: Link, label: 'Link', action: () => insertText('[', '](url)') },
    { icon: Image, label: 'Image', action: () => insertText('![alt](', ')') },
    { icon: Type, label: 'Code Block', action: () => insertText('\n```js\n', '\n```\n') },
    { icon: Calculator, label: 'Math', action: () => insertText('$', '$') },
    { icon: Workflow, label: 'Flowchart', action: () => setShowFlowchartSelector(true) },
  ];

  const handleFlowchartSelect = (id: string) => {
    insertText(`\n[flowchart:${id}]\n`, '');
  };

  return (
    <>
    <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-background' : ''}`}>
      <div className={`flex flex-col ${isFullscreen ? 'h-screen' : 'h-full'}`}>
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-2 p-2 border rounded-t-lg bg-muted/50">
          <div className="flex items-center gap-1 flex-wrap">
            {toolbarButtons.map((btn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={btn.action}
                title={btn.label}
                className="p-2 hover:bg-accent rounded transition-colors"
              >
                <btn.icon className="w-4 h-4" />
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              title={showPreview ? 'Edit' : 'Preview'}
              className={`p-2 rounded transition-colors ${showPreview ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
            >
              {showPreview ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title="Fullscreen"
              className="p-2 hover:bg-accent rounded transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor/Preview Area */}
        <div className="flex-1 border-x border-b rounded-b-lg overflow-hidden">
          {!showPreview ? (
            <textarea
              id="markdown-textarea"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || 'Write your content here... Supports markdown, code blocks, and math equations!'}
              className="w-full h-full min-h-[500px] p-4 bg-background text-foreground resize-none focus:outline-none font-mono text-sm"
              style={{ minHeight: isFullscreen ? 'calc(100vh - 100px)' : '500px' }}
            />
          ) : (
            <div 
              className="w-full h-full min-h-[500px] p-6 overflow-auto bg-background"
              style={{ minHeight: isFullscreen ? 'calc(100vh - 100px)' : '500px' }}
            >
              <MarkdownContent content={value} />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-2 text-xs text-muted-foreground border-x border-b rounded-b-lg bg-muted/30">
          <div className="flex gap-4">
            <span>{(value || '').length} characters</span>
            <span>{(value || '').split('\n').length} lines</span>
            <span>{(value || '').split(/\s+/).filter(w => w).length} words</span>
          </div>
          <div className="flex gap-2">
            <span className="hidden sm:inline">Markdown supported</span>
          </div>
        </div>

        {/* Quick Guide */}
        {!isFullscreen && (
        <div className="mt-4 p-3 rounded-lg border bg-card text-card-foreground">
          <p className="text-sm font-semibold mb-2">Quick Guide</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded">**text**</code>
              <span className="text-muted-foreground">Bold</span>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded">*text*</code>
              <span className="text-muted-foreground">Italic</span>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded">`code`</code>
              <span className="text-muted-foreground">Code</span>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded">$x^2$</code>
              <span className="text-muted-foreground">Math</span>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded"># H1</code>
              <span className="text-muted-foreground">Heading</span>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded">- item</code>
              <span className="text-muted-foreground">List</span>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded">[text](url)</code>
              <span className="text-muted-foreground">Link</span>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded">```js</code>
              <span className="text-muted-foreground">Code Block</span>
            </div>
            <div className="flex items-center gap-1">
              <code className="bg-muted px-1.5 py-0.5 rounded">[flowchart:id]</code>
              <span className="text-muted-foreground">Flowchart</span>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
    {showFlowchartSelector && (
      <FlowchartSelector
        onSelect={handleFlowchartSelect}
        onClose={() => setShowFlowchartSelector(false)}
      />
    )}
    </>
  );
}
