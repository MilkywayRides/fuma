'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

interface PaperViewerProps {
  title: string;
  pages: Page[];
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
}

export function PaperViewer({ title, pages, authorName, createdAt, updatedAt }: PaperViewerProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [zoom, setZoom] = useState(100);

  const currentPage = pages[currentPageIndex] || pages[0];

  const exportToPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/papers">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Papers
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
              <p className="text-sm text-muted-foreground">
                By {authorName} • {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(50, zoom - 25))}>
                -
              </Button>
              <span className="text-sm font-medium min-w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(200, zoom + 25))}>
                +
              </Button>
            </div>
            <Button onClick={exportToPDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-8" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}>
            <div
              className="relative mx-auto bg-white shadow-lg mb-8"
              style={{ width: '794px', height: '1123px' }}
            >
              {currentPage?.elements.map((element) => (
                <div
                  key={element.id}
                  className="absolute select-none"
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
                >
                  {element.type === 'text' ? (
                    <div className="p-1 w-full h-full flex items-center justify-center">{element.content}</div>
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
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        {/* Page Navigation */}
        {pages.length > 1 && (
          <div className="bg-card border-t border-border px-4 py-3">
            <div className="container mx-auto flex items-center justify-center gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                disabled={currentPageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="text-sm font-medium">
                Page {currentPageIndex + 1} of {pages.length}
              </span>
              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentPageIndex(Math.min(pages.length - 1, currentPageIndex + 1))}
                disabled={currentPageIndex === pages.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
