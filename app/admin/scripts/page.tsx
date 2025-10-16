'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  PlusIcon, 
  PlayIcon, 
  ClockIcon, 
  CheckCircledIcon, 
  CrossCircledIcon 
} from '@radix-ui/react-icons';
import { generateUUID } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface FlowScript {
  id: string;
  title: string;
  description: string | null;
  published: boolean;
  createdAt: string;
  lastExecutedAt: string | null;
  executionCount: number;
  lastExecutionStatus?: 'success' | 'error' | 'running';
}

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<FlowScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        const response = await fetch('/api/admin/scripts');
        const data = await response.json();
        setScripts(data.scripts);
      } catch (error) {
        console.error('Failed to fetch scripts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchScripts();
  }, []);

  const createNewFlow = () => {
    const uuid = generateUUID(8);
    window.location.href = `/admin/scripts/${uuid}`;
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'success':
        return <CheckCircledIcon className="text-green-500" />;
      case 'error':
        return <CrossCircledIcon className="text-red-500" />;
      case 'running':
        return <ClockIcon className="text-blue-500 animate-spin" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Flow Scripts</h1>
          <Button disabled>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Flow
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Flow Scripts</h1>
        <Button onClick={createNewFlow}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Create New Flow
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scripts.map((script) => (
          <Card key={script.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{script.title}</CardTitle>
                {getStatusIcon(script.lastExecutionStatus)}
              </div>
              {script.description && (
                <CardDescription className="text-sm text-muted-foreground line-clamp-2">
                  {script.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center">
                  <ClockIcon className="mr-2 h-4 w-4" />
                  Created {formatDistanceToNow(new Date(script.createdAt))} ago
                </p>
                {script.lastExecutedAt && (
                  <p className="flex items-center">
                    <PlayIcon className="mr-2 h-4 w-4" />
                    Last run {formatDistanceToNow(new Date(script.lastExecutedAt))} ago
                  </p>
                )}
                <p className="flex items-center">
                  <span className="inline-flex items-center justify-center h-4 w-4 mr-2 text-xs font-medium">
                    #
                  </span>
                  {script.executionCount} executions
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.location.href = `/admin/scripts/${script.id}`}
                >
                  Edit
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  disabled={!script.published}
                >
                  <PlayIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {scripts.length === 0 && (
          <Card className="col-span-full p-6">
            <div className="text-center text-muted-foreground">
              <p>No flow scripts created yet.</p>
              <p className="text-sm mt-1">Create your first flow script to get started!</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}