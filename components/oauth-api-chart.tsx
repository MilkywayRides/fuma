'use client';

import { useState, useEffect } from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardAction } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { RefreshCw, Radio } from 'lucide-react';

export function OAuthApiChart({ data: initialData, appId }: { data: any[]; appId: string }) {
  const [data, setData] = useState(initialData);
  const [isLive, setIsLive] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const chartData = data.reverse().map(item => ({
    date: new Date(item.date).toISOString().split('T')[0],
    requests: Number(item.requests),
  }));

  const fetchData = async () => {
    try {
      const res = await fetch(`/api/admin/oauth/${appId}/stats`);
      if (res.ok) {
        const newData = await res.json();
        setData(newData);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
  }, [isLive, appId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setIsRefreshing(false);
  };

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>API Requests</CardTitle>
        <CardDescription>Daily API request volume</CardDescription>
        <CardAction>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant={isLive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              <Radio className={`h-4 w-4 ${isLive ? 'animate-pulse' : ''}`} />
            </Button>
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {chartData.length === 0 ? (
          <div className="flex h-[250px] items-center justify-center text-muted-foreground">
            No API requests yet
          </div>
        ) : (
          <ChartContainer
            config={{
              requests: {
                label: 'Requests',
                color: 'var(--primary)',
              },
            }}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="fillRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-requests)" stopOpacity={1.0} />
                  <stop offset="95%" stopColor="var(--color-requests)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    }}
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="requests"
                type="natural"
                fill="url(#fillRequests)"
                stroke="var(--color-requests)"
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
