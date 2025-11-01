"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "var(--primary)",
  },
} satisfies ChartConfig

export function EarningsChart({ data }: { data: { date: string; earnings: number }[] }) {
  const chartData = data.reverse().map(d => ({
    date: new Date(d.date).toISOString().split('T')[0],
    earnings: d.earnings / 100,
  }))

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Earnings</CardTitle>
          <CardDescription>No earnings data available yet</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          <div className="flex h-[150px] items-center justify-center text-muted-foreground text-sm">
            No book purchases yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Earnings</CardTitle>
        <CardDescription>Book purchase revenue over time</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[150px] w-full">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillEarnings" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-earnings)" stopOpacity={1.0} />
                <stop offset="95%" stopColor="var(--color-earnings)" stopOpacity={0.1} />
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
                const date = new Date(value)
                return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  }}
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="earnings"
              type="natural"
              fill="url(#fillEarnings)"
              stroke="var(--color-earnings)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
