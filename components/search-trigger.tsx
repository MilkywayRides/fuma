'use client'

import { Search } from 'lucide-react'
import { Button } from './ui/button'
import { useEffect } from 'react'

export function SearchTrigger() {
  const triggerSearch = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      metaKey: true,
      bubbles: true,
      cancelable: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full px-4 h-9 min-w-[200px] justify-start"
        onClick={triggerSearch}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden rounded-full"
        onClick={triggerSearch}
      >
        <Search className="h-5 w-5" />
      </Button>
    </>
  )
}
