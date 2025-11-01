'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

const CustomMarkdownEditor = dynamic(() => import('@/components/custom-markdown-editor').then(mod => mod.CustomMarkdownEditor), { ssr: false })

export default function PageEditorPage() {
  const params = useParams()
  const uuid = params.uuid as string
  const slug = params.slug as string
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetch(`/api/books/${uuid}/pages`)
      .then(res => res.json())
      .then(pages => {
        const page = pages.find((p: any) => p.slug === slug)
        if (page) setContent(page.content || '')
      })
  }, [uuid, slug])

  const handleSave = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/books/${uuid}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title: slug.replace(/-/g, ' '), content }),
      })
      if (res.ok) {
        toast({ title: 'Success', description: 'Page saved successfully' })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save page', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold capitalize">{slug.replace(/-/g, ' ')}</h1>
          <p className="text-muted-foreground">Edit page content</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Page'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
        </CardHeader>
        <CardContent>
          <CustomMarkdownEditor value={content} onChange={setContent} />
        </CardContent>
      </Card>
    </div>
  )
}
