'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useFlowExecution } from '@/components/providers/flow-execution-provider';
import { StopIcon } from '@radix-ui/react-icons';
import { Button } from './ui/button';

interface FlowExecutionStatusProps {
  flowId: string;
}

export function FlowExecutionStatus({ flowId }: FlowExecutionStatusProps) {
  const { activeExecutions, stopExecution } = useFlowExecution();

  // Find executions for this flow
  const flowExecutions = Array.from(activeExecutions.values()).filter(
    (exec) => exec.flowId === flowId
  );

  if (flowExecutions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {flowExecutions.map((execution) => (
        <Card key={execution.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  execution.status === 'running'
                    ? 'default'
                    : execution.status === 'completed'
                    ? 'success'
                    : 'destructive'
                }
              >
                {execution.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Execution #{execution.id}
              </span>
            </div>
            {execution.status === 'running' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => stopExecution(execution.id)}
              >
                <StopIcon className="h-4 w-4" />
              </Button>
            )}
          </div>
          {execution.error && (
            <p className="mt-2 text-sm text-destructive">{execution.error}</p>
          )}
          {execution.output && (
            <pre className="mt-2 p-2 bg-muted rounded text-sm overflow-auto">
              {JSON.stringify(execution.output, null, 2)}
            </pre>
          )}
        </Card>
      ))}
    </div>
  );
}