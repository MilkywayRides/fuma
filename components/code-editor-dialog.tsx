'use client';

import { useState } from 'react';
import Editor from '@monaco-editor/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Code } from 'lucide-react';

interface CodeEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialCode: string;
  onSave: (code: string) => void;
}

export function CodeEditorDialog({ open, onOpenChange, initialCode, onSave }: CodeEditorDialogProps) {
  const [code, setCode] = useState(initialCode);

  const handleSave = () => {
    onSave(code);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Edit Flowchart JSON
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 border rounded-md overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="json"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Code
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
