'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface FlowExecutionStatus {
  id: number;
  flowId: string;
  status: 'running' | 'completed' | 'error';
  output?: any;
  error?: string;
}

interface FlowExecutionContextType {
  activeExecutions: Map<number, FlowExecutionStatus>;
  executeFlow: (flowId: string, nodes: any[], edges: any[]) => Promise<number>;
  stopExecution: (executionId: number) => Promise<void>;
}

const FlowExecutionContext = createContext<FlowExecutionContextType | null>(null);

export function useFlowExecution() {
  const context = useContext(FlowExecutionContext);
  if (!context) {
    throw new Error('useFlowExecution must be used within a FlowExecutionProvider');
  }
  return context;
}

export function FlowExecutionProvider({ children }: { children: React.ReactNode }) {
  const [activeExecutions, setActiveExecutions] = useState<Map<number, FlowExecutionStatus>>(
    new Map()
  );
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const { toast } = useToast();

  // Initialize WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001');

    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'execution_update') {
        setActiveExecutions((prev) => {
          const next = new Map(prev);
          next.set(data.execution.id, data.execution);
          return next;
        });

        // Show toast for completed or errored executions
        if (data.execution.status === 'completed') {
          toast({
            title: 'Flow Execution Completed',
            description: `Flow ${data.execution.flowId} completed successfully.`,
          });
        } else if (data.execution.status === 'error') {
          toast({
            title: 'Flow Execution Failed',
            description: data.execution.error || 'Unknown error occurred.',
            variant: 'destructive',
          });
        }
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      // Attempt to reconnect after a delay
      setTimeout(() => {
        setSocket(null);
      }, 5000);
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [toast]);

  const executeFlow = async (flowId: string, nodes: any[], edges: any[]) => {
    try {
      const response = await fetch(`/api/admin/scripts/${flowId}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nodes, edges }),
      });

      if (!response.ok) {
        throw new Error('Failed to start flow execution');
      }

      const data = await response.json();
      const executionId = data.executionId;

      // Initialize execution status
      setActiveExecutions((prev) => {
        const next = new Map(prev);
        next.set(executionId, {
          id: executionId,
          flowId,
          status: 'running',
        });
        return next;
      });

      return executionId;
    } catch (error) {
      console.error('Error executing flow:', error);
      toast({
        title: 'Error',
        description: 'Failed to start flow execution',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const stopExecution = async (executionId: number) => {
    try {
      const execution = activeExecutions.get(executionId);
      if (!execution) {
        throw new Error('Execution not found');
      }

      await fetch(`/api/admin/scripts/${execution.flowId}/execute/${executionId}`, {
        method: 'DELETE',
      });

      setActiveExecutions((prev) => {
        const next = new Map(prev);
        next.delete(executionId);
        return next;
      });
    } catch (error) {
      console.error('Error stopping execution:', error);
      toast({
        title: 'Error',
        description: 'Failed to stop flow execution',
        variant: 'destructive',
      });
    }
  };

  return (
    <FlowExecutionContext.Provider
      value={{
        activeExecutions,
        executeFlow,
        stopExecution,
      }}
    >
      {children}
    </FlowExecutionContext.Provider>
  );
}