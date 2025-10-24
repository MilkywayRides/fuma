'use client';
import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const renderLatex = (text: string) => {
  return text.replace(/\\\((.*?)\\\)/g, (_, formula) => {
    try {
      return katex.renderToString(formula, { throwOnError: false });
    } catch {
      return formula;
    }
  }).replace(/\\\[(.*?)\\\]/gs, (_, formula) => {
    try {
      return katex.renderToString(formula, { displayMode: true, throwOnError: false });
    } catch {
      return formula;
    }
  });
};

export const DefaultNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title || 'Title');
  const [content, setContent] = useState(data.content || 'Content');

  const handleDoubleClick = () => setIsEditing(true);
  const handleBlur = () => {
    setIsEditing(false);
    data.title = title;
    data.content = content;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={true} />
      <div className={`px-4 py-3 rounded-lg border bg-card shadow-md min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`} onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              autoFocus
              className="w-full bg-transparent border-b font-semibold text-sm text-foreground focus:outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none resize-none"
              rows={2}
            />
          </div>
        ) : (
          <div>
            <div className="font-semibold text-sm text-foreground mb-1">{title}</div>
            <div className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderLatex(content) }} />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} isConnectable={true} />
    </>
  );
});

DefaultNode.displayName = 'DefaultNode';

export const InputNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title || 'Input');
  const [content, setContent] = useState(data.content || 'Start node');

  const handleDoubleClick = () => setIsEditing(true);
  const handleBlur = () => {
    setIsEditing(false);
    data.title = title;
    data.content = content;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={true} />
      <div className={`px-4 py-3 rounded-lg border bg-card shadow-md min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`} onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              autoFocus
              className="w-full bg-transparent border-b font-semibold text-sm text-foreground focus:outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none resize-none"
              rows={2}
            />
          </div>
        ) : (
          <div>
            <div className="font-semibold text-sm text-foreground mb-1">{title}</div>
            <div className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderLatex(content) }} />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} isConnectable={true} />
    </>
  );
});

InputNode.displayName = 'InputNode';

export const OutputNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(data.title || 'Output');
  const [content, setContent] = useState(data.content || 'End node');

  const handleDoubleClick = () => setIsEditing(true);
  const handleBlur = () => {
    setIsEditing(false);
    data.title = title;
    data.content = content;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} isConnectable={true} />
      <div className={`px-4 py-3 rounded-lg border bg-card shadow-md min-w-[200px] ${selected ? 'ring-2 ring-primary' : ''}`} onDoubleClick={handleDoubleClick}>
        {isEditing ? (
          <div className="space-y-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleBlur}
              autoFocus
              className="w-full bg-transparent border-b font-semibold text-sm text-foreground focus:outline-none"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent text-xs text-muted-foreground focus:outline-none resize-none"
              rows={2}
            />
          </div>
        ) : (
          <div>
            <div className="font-semibold text-sm text-foreground mb-1">{title}</div>
            <div className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: renderLatex(content) }} />
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} isConnectable={true} />
    </>
  );
});

OutputNode.displayName = 'OutputNode';
