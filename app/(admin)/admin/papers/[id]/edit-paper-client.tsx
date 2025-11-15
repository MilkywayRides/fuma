'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EnhancedPaperEditor } from '@/components/enhanced-paper-editor';
import { useToast } from '@/hooks/use-toast';

interface EditPaperClientProps {
  paperId: string;
  initialTitle: string;
  initialPages: any[];
}

export function EditPaperClient({ paperId, initialTitle, initialPages }: EditPaperClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const handleSave = async (title: string, pages: any[]) => {
    console.log('Updating paper:', { paperId, title, pagesCount: pages.length });
    
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
      console.log('Making API update request...');
      const response = await fetch(`/api/admin/papers/${paperId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content: JSON.stringify(pages) }),
      });

      console.log('API update response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API update error:', errorData);
        throw new Error(errorData.error || 'Failed to update paper');
      }

      console.log('Paper updated successfully');
      toast({
        title: 'Success',
        description: 'Paper updated successfully',
      });
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update paper',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <EnhancedPaperEditor
      initialTitle={initialTitle}
      initialPages={initialPages}
      onSave={handleSave}
    />
  );
}
