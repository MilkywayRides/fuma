import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Bot, MessageSquare, Database, Filter, Sparkles } from 'lucide-react';

export const GeminiNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [apiKey, setApiKey] = useState(data.api_key || '');

  const handleBlur = () => {
    setIsEditing(false);
    data.prompt = prompt;
    data.api_key = apiKey;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className={`px-4 py-3 rounded-lg border bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 shadow-md min-w-[220px] ${selected ? 'ring-2 ring-blue-500' : ''}`} onDoubleClick={() => setIsEditing(true)}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <span className="font-semibold text-sm">Google Gemini</span>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={handleBlur}
              placeholder="Enter prompt..."
              className="w-full bg-white dark:bg-gray-900 border rounded px-2 py-1 text-xs"
              rows={3}
            />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={handleBlur}
              placeholder="API Key (optional)"
              className="w-full bg-white dark:bg-gray-900 border rounded px-2 py-1 text-xs"
            />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {prompt || 'Double-click to configure'}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
});

GeminiNode.displayName = 'GeminiNode';

export const OpenAINode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [apiKey, setApiKey] = useState(data.api_key || '');

  const handleBlur = () => {
    setIsEditing(false);
    data.prompt = prompt;
    data.api_key = apiKey;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className={`px-4 py-3 rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 shadow-md min-w-[220px] ${selected ? 'ring-2 ring-green-500' : ''}`} onDoubleClick={() => setIsEditing(true)}>
        <div className="flex items-center gap-2 mb-2">
          <Bot className="h-4 w-4 text-green-600" />
          <span className="font-semibold text-sm">ChatGPT</span>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={handleBlur}
              placeholder="Enter prompt..."
              className="w-full bg-white dark:bg-gray-900 border rounded px-2 py-1 text-xs"
              rows={3}
            />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              onBlur={handleBlur}
              placeholder="API Key (optional)"
              className="w-full bg-white dark:bg-gray-900 border rounded px-2 py-1 text-xs"
            />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {prompt || 'Double-click to configure'}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
});

OpenAINode.displayName = 'OpenAINode';

export const DiscordNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(data.content || '');
  const [webhookUrl, setWebhookUrl] = useState(data.webhook_url || '');

  const handleBlur = () => {
    setIsEditing(false);
    data.content = content;
    data.webhook_url = webhookUrl;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className={`px-4 py-3 rounded-lg border bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950 dark:to-violet-950 shadow-md min-w-[220px] ${selected ? 'ring-2 ring-indigo-500' : ''}`} onDoubleClick={() => setIsEditing(true)}>
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-indigo-600" />
          <span className="font-semibold text-sm">Discord</span>
        </div>
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleBlur}
              placeholder="Message content..."
              className="w-full bg-white dark:bg-gray-900 border rounded px-2 py-1 text-xs"
              rows={2}
            />
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              onBlur={handleBlur}
              placeholder="Webhook URL"
              className="w-full bg-white dark:bg-gray-900 border rounded px-2 py-1 text-xs"
            />
          </div>
        ) : (
          <div className="text-xs text-muted-foreground">
            {content || 'Double-click to configure'}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
});

DiscordNode.displayName = 'DiscordNode';

export const DatabaseNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [query, setQuery] = useState(data.query || '');

  const handleBlur = () => {
    setIsEditing(false);
    data.query = query;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className={`px-4 py-3 rounded-lg border bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 shadow-md min-w-[220px] ${selected ? 'ring-2 ring-orange-500' : ''}`} onDoubleClick={() => setIsEditing(true)}>
        <div className="flex items-center gap-2 mb-2">
          <Database className="h-4 w-4 text-orange-600" />
          <span className="font-semibold text-sm">Database Query</span>
        </div>
        {isEditing ? (
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={handleBlur}
            placeholder="SELECT * FROM users..."
            className="w-full bg-white dark:bg-gray-900 border rounded px-2 py-1 text-xs font-mono"
            rows={3}
          />
        ) : (
          <div className="text-xs text-muted-foreground font-mono">
            {query || 'Double-click to configure'}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
});

DatabaseNode.displayName = 'DatabaseNode';

export const UserDataNode = memo(({ data, selected }: NodeProps) => {
  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className={`px-4 py-3 rounded-lg border bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950 dark:to-sky-950 shadow-md min-w-[200px] ${selected ? 'ring-2 ring-cyan-500' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <Database className="h-4 w-4 text-cyan-600" />
          <span className="font-semibold text-sm">User Data</span>
        </div>
        <div className="text-xs text-muted-foreground">
          Fetch user from database
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
});

UserDataNode.displayName = 'UserDataNode';

export const FilterNode = memo(({ data, selected }: NodeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [condition, setCondition] = useState(data.condition || '');

  const handleBlur = () => {
    setIsEditing(false);
    data.condition = condition;
  };

  return (
    <>
      <Handle type="target" position={Position.Left} />
      <div className={`px-4 py-3 rounded-lg border bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950 dark:to-rose-950 shadow-md min-w-[200px] ${selected ? 'ring-2 ring-pink-500' : ''}`} onDoubleClick={() => setIsEditing(true)}>
        <div className="flex items-center gap-2 mb-2">
          <Filter className="h-4 w-4 text-pink-600" />
          <span className="font-semibold text-sm">Filter</span>
        </div>
        {isEditing ? (
          <input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            onBlur={handleBlur}
            placeholder="item['age'] > 18"
            className="w-full bg-white dark:bg-gray-900 border rounded px-2 py-1 text-xs font-mono"
          />
        ) : (
          <div className="text-xs text-muted-foreground font-mono">
            {condition || 'Double-click to configure'}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </>
  );
});

FilterNode.displayName = 'FilterNode';
