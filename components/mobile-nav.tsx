'use client'

import { Menu, Search, BookOpen, FileText, Newspaper, Users, X } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import Link from 'next/link'
import { APP_NAME } from '@/lib/config'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { MobileUserSection } from './mobile-user-section'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  const triggerSearch = () => {
    setOpen(false)
    setTimeout(() => {
      const event = new KeyboardEvent('keydown', {
        key: 'k',
        code: 'KeyK',
        ctrlKey: true,
        metaKey: true,
        bubbles: true,
        cancelable: true,
      })
      document.dispatchEvent(event)
    }, 100)
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="md:hidden" 
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {open && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden" 
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-4 top-4 z-50 md:hidden">
            <Card className="w-full shadow-2xl border-2">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold">{APP_NAME}</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => setOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Navigate through the app</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pb-6">
                <button
                  className="w-full flex items-center gap-3 px-4 h-11 rounded-xl bg-muted/50 hover:bg-muted border border-border hover:border-primary/30 transition-all text-sm text-muted-foreground hover:text-foreground"
                  onClick={triggerSearch}
                >
                  <Search className="h-4 w-4" />
                  <span>Search...</span>
                </button>

                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground px-2 mb-2">MENU</p>
                  <Link 
                    href="/books" 
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "active:scale-95 transition-transform"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Books</span>
                      <span className="text-xs text-muted-foreground">Browse collection</span>
                    </div>
                  </Link>
                  <Link 
                    href="/docs" 
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "active:scale-95 transition-transform"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Docs</span>
                      <span className="text-xs text-muted-foreground">Documentation</span>
                    </div>
                  </Link>
                  <Link 
                    href="/blog" 
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "active:scale-95 transition-transform"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <Newspaper className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Blog</span>
                      <span className="text-xs text-muted-foreground">Latest articles</span>
                    </div>
                  </Link>
                  <Link 
                    href="/community" 
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "active:scale-95 transition-transform"
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">Community</span>
                      <span className="text-xs text-muted-foreground">Join discussion</span>
                    </div>
                  </Link>
                </div>

                <div className="pt-2 border-t">
                  <MobileUserSection onClose={() => setOpen(false)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </>
  )
}
