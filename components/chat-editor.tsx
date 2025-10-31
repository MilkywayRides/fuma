'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bold, Italic, Strikethrough, Code, Link, List, ListOrdered, Quote, Smile, Paperclip, Send, AtSign, Sigma } from 'lucide-react';

interface ChatEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
  users?: string[];
}

const emojis = ['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '👎', '🎉', '🔥', '💯', '❤️', '✨', '🚀', '👀', '💪'];

export function ChatEditor({ value, onChange, onSend, disabled, placeholder, users = [] }: ChatEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });

  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
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

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const newText = value.substring(0, start) + emoji + value.substring(start);
    onChange(newText);
    setShowEmoji(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const insertMention = (username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    const newText = value.substring(0, lastAtIndex) + '@' + username + ' ' + value.substring(start);
    onChange(newText);
    setShowMentions(false);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = lastAtIndex + username.length + 2;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1 && lastAtIndex === textBeforeCursor.length - 1) {
      setShowMentions(true);
      setMentionSearch('');
    } else if (lastAtIndex !== -1) {
      const searchText = textBeforeCursor.substring(lastAtIndex + 1);
      if (searchText && !searchText.includes(' ')) {
        setShowMentions(true);
        setMentionSearch(searchText);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user && user.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/*,.pdf,.doc,.docx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // TODO: Implement file upload
        console.log('File selected:', file.name);
      }
    };
    input.click();
  };

  return (
    <div className="bg-muted rounded-lg p-2">
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('**', '**')}
          disabled={disabled}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('*', '*')}
          disabled={disabled}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('~~', '~~')}
          disabled={disabled}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('`', '`')}
          disabled={disabled}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('[', '](url)')}
          disabled={disabled}
          title="Link"
        >
          <Link className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('- ')}
          disabled={disabled}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('1. ')}
          disabled={disabled}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('> ')}
          disabled={disabled}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => {
            const textarea = textareaRef.current;
            if (textarea) {
              const start = textarea.selectionStart;
              onChange(value.substring(0, start) + '@' + value.substring(start));
              setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + 1, start + 1);
              }, 0);
            }
          }}
          disabled={disabled}
          title="Mention User"
        >
          <AtSign className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => insertMarkdown('$', '$')}
          disabled={disabled}
          title="Inline Math"
        >
          <Sigma className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-background rounded-md mb-2">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !showMentions) {
                e.preventDefault();
                onSend();
              } else if (e.key === 'Escape' && showMentions) {
                setShowMentions(false);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            className="w-full resize-none bg-transparent px-3 py-2.5 text-sm focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 max-h-[200px]"
          />
          {showMentions && filteredUsers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-2 bg-popover border rounded-md shadow-lg p-1 min-w-[200px]">
              {filteredUsers.map((user) => (
                <button
                  key={user}
                  onClick={() => insertMention(user)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted rounded transition-colors"
                >
                  @{user}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleFileUpload}
            disabled={disabled}
            title="Upload file"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Popover open={showEmoji} onOpenChange={setShowEmoji}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={disabled}
                title="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => insertEmoji(emoji)}
                    className="text-2xl hover:bg-muted rounded p-1 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          size="sm"
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </Button>
      </div>
    </div>
  );
}
