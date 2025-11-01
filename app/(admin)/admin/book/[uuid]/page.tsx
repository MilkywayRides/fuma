'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, GripVertical, Settings } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import Link from 'next/link'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useRouter, useParams } from 'next/navigation'

function SortablePageCard({ page, uuid }: { page: any; uuid: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: page.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:border-primary transition-colors">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <FileText className="h-5 w-5" />
            <Link href={`/admin/book/${uuid}/${page.slug}`} className="flex-1">
              <CardTitle className="text-lg hover:underline">{page.title}</CardTitle>
            </Link>
          </div>
          <CardDescription>
            Created {new Date(page.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default function BookDetailPage() {
  const params = useParams()
  const uuid = params.uuid as string
  const [pages, setPages] = useState<any[]>([])
  const [book, setBook] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [pageTitle, setPageTitle] = useState('')
  const [premium, setPremium] = useState(false)
  const [price, setPrice] = useState(0)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetch(`/api/books/${uuid}/pages`).then(res => res.json()).then(setPages)
    fetch(`/api/books/${uuid}/info`).then(res => res.json()).then(data => {
      setBook(data.book)
      setPremium(data.book.premium)
      setPrice(data.book.price)
    })
  }, [uuid])

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      await fetch(`/api/books/${uuid}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premium, price }),
      })
      toast({ title: 'Success', description: 'Settings saved' })
      setSettingsOpen(false)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = pages.findIndex(p => p.id === active.id)
    const newIndex = pages.findIndex(p => p.id === over.id)
    const newPages = arrayMove(pages, oldIndex, newIndex)
    setPages(newPages)

    try {
      await fetch(`/api/books/${uuid}/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageIds: newPages.map(p => p.id) }),
      })
      toast({ title: 'Success', description: 'Page order updated' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update order', variant: 'destructive' })
    }
  }

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const slug = generateSlug(pageTitle)
      const newPage = { slug, title: pageTitle, createdAt: new Date() }
      setPages([...pages, newPage])
      toast({ title: 'Success', description: 'Page created successfully' })
      setOpen(false)
      setPageTitle('')
      router.push(`/admin/book/${uuid}/${slug}`)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create page', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{book?.title || 'Book Pages'}</h1>
          <p className="text-muted-foreground">Manage pages for this book</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Book Settings</DialogTitle>
                <DialogDescription>Configure premium access and pricing</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="premium">Premium Book</Label>
                  <Switch id="premium" checked={premium} onCheckedChange={setPremium} />
                </div>
                {premium && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (Credits)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      min="0"
                    />
                  </div>
                )}
                <Button onClick={handleSaveSettings} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Page</DialogTitle>
              <DialogDescription>Enter the title for your new page</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePage} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pageTitle">Page Title</Label>
                <Input
                  id="pageTitle"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  placeholder="Enter page title"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Page'}
              </Button>
            </form>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No pages yet. Create your first page to get started.
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={pages.map(p => p.id)} strategy={rectSortingStrategy}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pages.map((page, index) => (
                <SortablePageCard key={page.id || `page-${index}`} page={page} uuid={uuid} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
