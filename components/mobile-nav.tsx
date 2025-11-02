'use client'

import { Menu } from 'lucide-react'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import Link from 'next/link'
import { APP_NAME } from '@/lib/config'
import { useState } from 'react'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col gap-4 mt-8">
          <Link 
            href="/books" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-md transition-colors"
            onClick={() => setOpen(false)}
          >
            Books
          </Link>
          <Link 
            href="/docs" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-md transition-colors"
            onClick={() => setOpen(false)}
          >
            Docs
          </Link>
          <Link 
            href="/blog" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-md transition-colors"
            onClick={() => setOpen(false)}
          >
            Blog
          </Link>
          <Link 
            href="/community" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent px-3 py-2 rounded-md transition-colors"
            onClick={() => setOpen(false)}
          >
            Community
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}
