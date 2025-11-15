'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedPaperEditor } from '@/components/enhanced-paper-editor';
import { useToast } from '@/hooks/use-toast';

export default function NewPaperPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async (title: string, pages: any[]) => {
    console.log('Saving paper:', { title, pagesCount: pages.length });
    
    if (!title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a paper title',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      console.log('Making API request...');
      const response = await fetch('/api/admin/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: JSON.stringify(pages) }),
      });

      console.log('API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to save paper');
      }

      const { id } = await response.json();
      console.log('Paper saved with ID:', id);
      
      toast({
        title: 'Success',
        description: 'Paper created successfully',
      });
      
      router.push(`/admin/papers/${id}`);
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save paper',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return <EnhancedPaperEditor onSave={handleSave} />;
}
