'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Type, Move, Trash2, Download } from 'lucide-react';

interface TextElement {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  fontWeight: string;
  color: string;
}

interface PaperEditorProps {
  initialTitle?: string;
  initialElements?: TextElement[];
  onSave: (title: string, elements: TextElement[]) => void;
}

export function PaperEditor({ initialTitle = '', initialElements = [], onSave }: PaperEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [elements, setElements] = useState<TextElement[]>(initialElements);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  const addTextElement = () => {
    const newElement: TextElement = {
      id: Math.random().toString(36).substr(2, 9),
      text: 'New Text',
      x: 100,
      y: 100,
      fontSize: 16,
      fontWeight: 'normal',
      color: '#000000',
    };
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<TextElement>) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...updates } : el));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    });
    setSelectedElement(elementId);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      updateElement(elementId, {
        x: e.clientX - rect.left - dragOffset.x,
        y: e.clientY - rect.top - dragOffset.y,
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const exportToPDF = () => {
    // Simple PDF export using browser print
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .canvas { position: relative; width: 794px; height: 1123px; border: 1px solid #ccc; background: white; }
            .text-element { position: absolute; user-select: none; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="canvas">
            ${elements.map(el => `
              <div class="text-element" style="
                left: ${el.x}px;
                top: ${el.y}px;
                font-size: ${el.fontSize}px;
                font-weight: ${el.fontWeight};
                color: ${el.color};
              ">${el.text}</div>
            `).join('')}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const selectedEl = elements.find(el => el.id === selectedElement);

  return (
    <div className="flex h-screen">
      {/* Toolbar */}
      <div className="w-80 border-r bg-muted/30 p-4 space-y-4">
        <div>
          <label className="text-sm font-medium">Paper Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter paper title"
          />
        </div>

        <Button onClick={addTextElement} className="w-full">
          <Type className="mr-2 h-4 w-4" />
          Add Text
        </Button>

        {selectedEl && (
          <Card className="p-4 space-y-3">
            <h3 className="font-medium">Edit Text</h3>
            <div>
              <label className="text-sm">Text</label>
              <Textarea
                value={selectedEl.text}
                onChange={(e) => updateElement(selectedEl.id, { text: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">Font Size</label>
                <Input
                  type="number"
                  value={selectedEl.fontSize}
                  onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                  min="8"
                  max="72"
                />
              </div>
              <div>
                <label className="text-sm">Color</label>
                <Input
                  type="color"
                  value={selectedEl.color}
                  onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm">Font Weight</label>
              <select
                value={selectedEl.fontWeight}
                onChange={(e) => updateElement(selectedEl.id, { fontWeight: e.target.value })}
                className="w-full p-2 border rounded"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
              </select>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteElement(selectedEl.id)}
              className="w-full"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </Card>
        )}

        <div className="space-y-2">
          <Button onClick={() => onSave(title, elements)} className="w-full">
            Save Paper
          </Button>
          <Button onClick={exportToPDF} variant="outline" className="w-full">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4 overflow-auto bg-gray-100">
        <div
          ref={canvasRef}
          className="relative mx-auto bg-white shadow-lg"
          style={{ width: '794px', height: '1123px' }}
          onClick={() => setSelectedElement(null)}
        >
          {elements.map((element) => (
            <div
              key={element.id}
              className={`absolute cursor-move select-none p-1 rounded ${
                selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                left: element.x,
                top: element.y,
                fontSize: element.fontSize,
                fontWeight: element.fontWeight,
                color: element.color,
              }}
              onMouseDown={(e) => handleMouseDown(e, element.id)}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element.id);
              }}
            >
              {element.text}
              {selectedElement === element.id && (
                <Move className="absolute -top-6 -right-6 h-4 w-4 text-blue-500" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
