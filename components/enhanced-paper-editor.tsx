'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Type, Image, Square, Circle, Move, Trash2, Download, Plus, Copy, Undo, Redo, Save, Minus, RotateCw, Palette, AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline, Zap, Triangle, ArrowRight } from 'lucide-react';

interface Element {
  id: string;
  type: 'text' | 'image' | 'shape' | 'line';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  opacity?: number;
  rotation?: number;
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  lineType?: 'straight' | 'arrow';
  pageId: string;
  zIndex?: number;
}

interface Page {
  id: string;
  name: string;
  elements: Element[];
}

interface EnhancedPaperEditorProps {
  initialTitle?: string;
  initialPages?: Page[];
  onSave: (title: string, pages: Page[]) => void;
}

export function EnhancedPaperEditor({ initialTitle = '', initialPages = [], onSave }: EnhancedPaperEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [pages, setPages] = useState<Page[]>(initialPages.length > 0 ? initialPages : [{ id: '1', name: 'Page 1', elements: [] }]);
  const [currentPageId, setCurrentPageId] = useState(pages[0]?.id || '1');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<string | null>(null);
  const [history, setHistory] = useState<Page[][]>([pages]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const currentPage = pages.find(p => p.id === currentPageId) || pages[0];
  const selectedEl = currentPage?.elements.find(el => el.id === selectedElement);

  const saveToHistory = (newPages: Page[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(newPages)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const updatePages = (newPages: Page[]) => {
    setPages(newPages);
    saveToHistory(newPages);
  };

  const addPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      name: `Page ${pages.length + 1}`,
      elements: []
    };
    updatePages([...pages, newPage]);
    setCurrentPageId(newPage.id);
  };

  const deletePage = (pageId: string) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter(p => p.id !== pageId);
    updatePages(newPages);
    if (currentPageId === pageId) {
      setCurrentPageId(newPages[0].id);
    }
  };

  const addElement = (type: 'text' | 'shape' | 'line', shapeType?: 'rectangle' | 'circle' | 'triangle', lineType?: 'straight' | 'arrow') => {
    const newElement: Element = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'text' ? 'New Text' : '',
      x: 100,
      y: 100,
      width: type === 'text' ? 120 : type === 'line' ? 150 : 100,
      height: type === 'text' ? 30 : type === 'line' ? 2 : 100,
      fontSize: 16,
      fontWeight: 'normal',
      fontFamily: 'Arial',
      color: '#000000',
      backgroundColor: type === 'shape' ? '#3b82f6' : 'transparent',
      borderRadius: shapeType === 'circle' ? 50 : 0,
      borderWidth: 0,
      borderColor: '#000000',
      opacity: 100,
      rotation: 0,
      shapeType,
      lineType,
      pageId: currentPageId,
      zIndex: Date.now(),
    };

    const newPages = pages.map(page => 
      page.id === currentPageId 
        ? { ...page, elements: [...page.elements, newElement] }
        : page
    );
    updatePages(newPages);
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<Element>) => {
    // Validate numeric values to prevent NaN
    const validatedUpdates = { ...updates };
    if ('width' in validatedUpdates && (isNaN(Number(validatedUpdates.width)) || Number(validatedUpdates.width) < 1)) {
      validatedUpdates.width = 100;
    }
    if ('height' in validatedUpdates && (isNaN(Number(validatedUpdates.height)) || Number(validatedUpdates.height) < 1)) {
      validatedUpdates.height = 30;
    }
    if ('fontSize' in validatedUpdates && (isNaN(Number(validatedUpdates.fontSize)) || Number(validatedUpdates.fontSize) < 8)) {
      validatedUpdates.fontSize = 16;
    }
    if ('x' in validatedUpdates && isNaN(Number(validatedUpdates.x))) {
      validatedUpdates.x = 0;
    }
    if ('y' in validatedUpdates && isNaN(Number(validatedUpdates.y))) {
      validatedUpdates.y = 0;
    }

    const newPages = pages.map(page => ({
      ...page,
      elements: page.elements.map(el => el.id === id ? { ...el, ...validatedUpdates } : el)
    }));
    setPages(newPages);
  };

  const deleteElement = (id: string) => {
    const newPages = pages.map(page => ({
      ...page,
      elements: page.elements.filter(el => el.id !== id)
    }));
    updatePages(newPages);
    setSelectedElement(null);
  };

  const duplicateElement = (id: string) => {
    const element = currentPage.elements.find(el => el.id === id);
    if (!element) return;

    const newElement = {
      ...element,
      id: Math.random().toString(36).substr(2, 9),
      x: element.x + 20,
      y: element.y + 20,
    };

    const newPages = pages.map(page => 
      page.id === currentPageId 
        ? { ...page, elements: [...page.elements, newElement] }
        : page
    );
    updatePages(newPages);
    setSelectedElement(newElement.id);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPages(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPages(history[historyIndex + 1]);
    }
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    const element = currentPage.elements.find(el => el.id === elementId);
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
        x: Math.max(0, e.clientX - rect.left - dragOffset.x),
        y: Math.max(0, e.clientY - rect.top - dragOffset.y),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      saveToHistory(pages);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, elementId: string, corner: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = currentPage.elements.find(el => el.id === elementId);
    if (!element) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width || 100;
    const startHeight = element.height || 30;

    setResizing(elementId);

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (corner.includes('right')) newWidth = Math.max(20, startWidth + deltaX);
      if (corner.includes('left')) newWidth = Math.max(20, startWidth - deltaX);
      if (corner.includes('bottom')) newHeight = Math.max(20, startHeight + deltaY);
      if (corner.includes('top')) newHeight = Math.max(20, startHeight - deltaY);

      updateElement(elementId, { width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setResizing(null);
      saveToHistory(pages);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Top Toolbar */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Design"
            className="text-lg font-medium border-none shadow-none focus-visible:ring-0 w-64 bg-transparent"
          />
          
          <div className="flex items-center gap-1 border-r border-border pr-4">
            <Button variant="ghost" size="sm" onClick={undo} disabled={historyIndex <= 0}>
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(25, zoom - 25))}>
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowGrid(!showGrid)}>
            Grid
          </Button>
          <Button onClick={() => onSave(title, pages)} className="bg-primary hover:bg-primary/90">
            <Save className="mr-2 h-4 w-4" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Toolbar */}
        <div className="w-20 bg-card border-r border-border">
          <ScrollArea className="h-full">
            <div className="flex flex-col items-center py-4 gap-1">
              <div className="text-xs text-muted-foreground mb-2">Tools</div>
              
              <Button variant="ghost" size="sm" onClick={() => addElement('text')} className="w-16 h-12 p-0 hover:bg-accent flex flex-col gap-1">
                <Type className="h-4 w-4" />
                <span className="text-xs">Text</span>
              </Button>
              
              <div className="w-full border-t border-border my-1"></div>
              
              <Button variant="ghost" size="sm" onClick={() => addElement('shape', 'rectangle')} className="w-16 h-12 p-0 hover:bg-accent flex flex-col gap-1">
                <Square className="h-4 w-4" />
                <span className="text-xs">Box</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => addElement('shape', 'circle')} className="w-16 h-12 p-0 hover:bg-accent flex flex-col gap-1">
                <Circle className="h-4 w-4" />
                <span className="text-xs">Circle</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => addElement('shape', 'triangle')} className="w-16 h-12 p-0 hover:bg-accent flex flex-col gap-1">
                <Triangle className="h-4 w-4" />
                <span className="text-xs">Triangle</span>
              </Button>
              
              <div className="w-full border-t border-border my-1"></div>
              
              <Button variant="ghost" size="sm" onClick={() => addElement('line', undefined, 'straight')} className="w-16 h-12 p-0 hover:bg-accent flex flex-col gap-1">
                <Minus className="h-4 w-4" />
                <span className="text-xs">Line</span>
              </Button>
              
              <Button variant="ghost" size="sm" onClick={() => addElement('line', undefined, 'arrow')} className="w-16 h-12 p-0 hover:bg-accent flex flex-col gap-1">
                <ArrowRight className="h-4 w-4" />
                <span className="text-xs">Arrow</span>
              </Button>

              <div className="w-full border-t border-border my-1"></div>
              
              <Button variant="outline" size="sm" onClick={addPage} className="w-16 h-12 p-0 hover:bg-accent flex flex-col gap-1 border-dashed mb-4">
                <Plus className="h-4 w-4" />
                <span className="text-xs">Page</span>
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Canvas */}
          <ScrollArea className="flex-1 bg-muted/30">
            <div className="p-8" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
              <div
                ref={canvasRef}
                className={`relative mx-auto bg-white dark:bg-white shadow-lg mb-8 ${showGrid ? 'bg-grid-pattern' : ''}`}
                style={{ 
                  width: '794px', 
                  height: '1123px',
                  backgroundImage: showGrid ? 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' : 'none',
                  backgroundSize: showGrid ? '20px 20px' : 'auto'
                }}
                onClick={() => setSelectedElement(null)}
              >
                {currentPage?.elements.map((element) => (
                  <div
                    key={element.id}
                    className={`absolute select-none ${
                      selectedElement === element.id ? 'ring-2 ring-primary ring-offset-2' : ''
                    } ${editingElement === element.id ? '' : 'cursor-move'}`}
                    style={{
                      left: element.x || 0,
                      top: element.y || 0,
                      width: element.width || 100,
                      height: element.height || 30,
                      fontSize: element.fontSize || 16,
                      fontWeight: element.fontWeight || 'normal',
                      fontFamily: element.fontFamily || 'Arial',
                      color: element.color || '#000000',
                      backgroundColor: element.backgroundColor || 'transparent',
                      borderRadius: element.borderRadius || 0,
                      borderWidth: element.borderWidth || 0,
                      borderColor: element.borderColor || '#000000',
                      borderStyle: element.borderWidth ? 'solid' : 'none',
                      opacity: (element.opacity || 100) / 100,
                      transform: `rotate(${element.rotation || 0}deg)`,
                      zIndex: element.zIndex || 0,
                    }}
                    onMouseDown={(e) => editingElement !== element.id && handleMouseDown(e, element.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedElement(element.id);
                    }}
                    onDoubleClick={() => {
                      if (element.type === 'text') {
                        setEditingElement(element.id);
                      }
                    }}
                  >
                    {element.type === 'text' ? (
                      editingElement === element.id ? (
                        <textarea
                          value={element.content}
                          onChange={(e) => updateElement(element.id, { content: e.target.value })}
                          onBlur={() => setEditingElement(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              setEditingElement(null);
                            }
                          }}
                          className="w-full h-full p-1 border-none outline-none resize-none bg-transparent"
                          style={{
                            fontSize: element.fontSize || 16,
                            fontWeight: element.fontWeight || 'normal',
                            fontFamily: element.fontFamily || 'Arial',
                            color: element.color || '#000000',
                          }}
                          autoFocus
                        />
                      ) : (
                        <div className="p-1 w-full h-full flex items-center justify-center">{element.content}</div>
                      )
                    ) : element.type === 'line' ? (
                      <div 
                        className="w-full h-full flex items-center"
                        style={{ backgroundColor: element.color }}
                      >
                        {element.lineType === 'arrow' && (
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1">
                            <div 
                              className="w-0 h-0 border-l-4 border-t-2 border-b-2 border-transparent"
                              style={{ borderLeftColor: element.color }}
                            />
                          </div>
                        )}
                      </div>
                    ) : element.shapeType === 'triangle' ? (
                      <div 
                        className="w-full h-full"
                        style={{
                          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                          backgroundColor: element.backgroundColor
                        }}
                      />
                    ) : (
                      <div className="w-full h-full" />
                    )}
                    {selectedElement === element.id && editingElement !== element.id && (
                      <>
                        <Move className="absolute -top-6 -right-6 h-4 w-4 text-primary bg-white rounded shadow" />
                        {/* Resize handles */}
                        <div 
                          className="absolute -top-1 -left-1 w-2 h-2 bg-primary rounded-full cursor-nw-resize"
                          onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'top-left')}
                        ></div>
                        <div 
                          className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full cursor-ne-resize"
                          onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'top-right')}
                        ></div>
                        <div 
                          className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary rounded-full cursor-sw-resize"
                          onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'bottom-left')}
                        ></div>
                        <div 
                          className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary rounded-full cursor-se-resize"
                          onMouseDown={(e) => handleResizeMouseDown(e, element.id, 'bottom-right')}
                        ></div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Page Navigation */}
          <div className="bg-card border-t border-border px-4 py-2 flex items-center gap-2 overflow-x-auto">
            {pages.map((page, index) => (
              <div key={page.id} className="flex items-center gap-1">
                <Button
                  variant={currentPageId === page.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPageId(page.id)}
                  className="min-w-20"
                >
                  {page.name}
                </Button>
                {pages.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePage(page.id)}
                    className="w-6 h-6 p-0 text-destructive hover:text-destructive"
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={addPage} className="hover:bg-accent">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Right Properties Panel */}
        {selectedEl && (
          <div className="w-80 bg-card border-l border-border p-4 space-y-4">
            <h3 className="font-medium text-foreground">Properties</h3>
            
            {selectedEl.type === 'text' && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-muted-foreground">Text</label>
                  <Textarea
                    value={selectedEl.content}
                    onChange={(e) => updateElement(selectedEl.id, { content: e.target.value })}
                    rows={3}
                    className="bg-background"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Font Size</label>
                    <Input
                      type="number"
                      value={selectedEl.fontSize}
                      onChange={(e) => updateElement(selectedEl.id, { fontSize: parseInt(e.target.value) })}
                      min="8"
                      max="72"
                      className="bg-background"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Color</label>
                    <Input
                      type="color"
                      value={selectedEl.color}
                      onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                      className="bg-background h-10"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-muted-foreground">Width</label>
                <Input
                  type="number"
                  value={selectedEl.width}
                  onChange={(e) => updateElement(selectedEl.id, { width: parseInt(e.target.value) })}
                  className="bg-background"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Height</label>
                <Input
                  type="number"
                  value={selectedEl.height}
                  onChange={(e) => updateElement(selectedEl.id, { height: parseInt(e.target.value) })}
                  className="bg-background"
                />
              </div>
            </div>

            {selectedEl.type === 'shape' && (
              <div>
                <label className="text-sm text-muted-foreground">Background</label>
                <Input
                  type="color"
                  value={selectedEl.backgroundColor}
                  onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                  className="bg-background h-10"
                />
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => duplicateElement(selectedEl.id)} className="flex-1">
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>
              <Button variant="destructive" size="sm" onClick={() => deleteElement(selectedEl.id)} className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
