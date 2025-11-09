'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Zap } from 'lucide-react';
import { PlanDialog } from '@/components/plan-dialog';
import { TriggerDialog } from '@/components/trigger-dialog';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [triggers, setTriggers] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<any>(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showTriggerDialog, setShowTriggerDialog] = useState(false);

  useEffect(() => {
    fetchPlans();
    fetchTriggers();
  }, []);

  const fetchPlans = async () => {
    const res = await fetch('/api/admin/plans');
    const data = await res.json();
    setPlans(data);
  };

  const fetchTriggers = async () => {
    const res = await fetch('/api/admin/triggers');
    const data = await res.json();
    setTriggers(data);
  };

  const deletePlan = async (id: number) => {
    if (!confirm('Delete this plan?')) return;
    await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
    fetchPlans();
  };

  const deleteTrigger = async (id: number) => {
    if (!confirm('Delete this trigger?')) return;
    await fetch(`/api/admin/triggers/${id}`, { method: 'DELETE' });
    fetchTriggers();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payment Plans & Triggers</h1>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Subscription Plans</h2>
            <Button onClick={() => { setSelectedPlan(null); setShowPlanDialog(true); }}>
              <Plus className="w-4 h-4 mr-2" /> New Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className={plan.popular ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.description}</CardDescription>
                    </div>
                    {plan.popular && <Badge>Popular</Badge>}
                  </div>
                  <div className="text-3xl font-bold mt-2">
                    ${(plan.price / 100).toFixed(2)}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold mb-2">Features:</p>
                    <ul className="text-sm space-y-1">
                      {plan.features?.map((f: string, i: number) => (
                        <li key={i}>• {f}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2">Permissions:</p>
                    <div className="text-xs space-y-1">
                      {Object.entries(plan.permissions || {}).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span>{key}:</span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setSelectedPlan(plan); setShowPlanDialog(true); }}>
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deletePlan(plan.id)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Payment Triggers</h2>
            <Button onClick={() => { setSelectedTrigger(null); setShowTriggerDialog(true); }}>
              <Zap className="w-4 h-4 mr-2" /> New Trigger
            </Button>
          </div>

          <div className="grid gap-4">
            {triggers.map((trigger) => (
              <Card key={trigger.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {trigger.name}
                        {trigger.active && <Badge variant="outline">Active</Badge>}
                      </CardTitle>
                      <CardDescription>Event: {trigger.event}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setSelectedTrigger(trigger); setShowTriggerDialog(true); }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteTrigger(trigger.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold mb-2">Actions:</p>
                  <div className="space-y-2">
                    {trigger.actions?.map((action: any, i: number) => (
                      <div key={i} className="text-sm bg-muted p-2 rounded">
                        <span className="font-semibold">{action.type}</span>
                        <pre className="text-xs mt-1 overflow-auto">{JSON.stringify(action.config, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {showPlanDialog && (
        <PlanDialog
          plan={selectedPlan}
          onClose={() => { setShowPlanDialog(false); fetchPlans(); }}
        />
      )}

      {showTriggerDialog && (
        <TriggerDialog
          trigger={selectedTrigger}
          plans={plans}
          onClose={() => { setShowTriggerDialog(false); fetchTriggers(); }}
        />
      )}
    </div>
  );
}
