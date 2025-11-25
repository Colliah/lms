"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeeklyChartProps {
  data: Array<{
    date: string;
    minutes: number;
  }>;
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const chartData = data.map((item) => ({
    day: new Date(item.date).toLocaleDateString("en-US", { weekday: "short" }),
    minutes: item.minutes,
  }));

  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  const averageMinutes =
    data.length > 0 ? Math.round(totalMinutes / data.length) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Progress</CardTitle>
        <CardDescription>
          Total: {totalMinutes} minutes · Average: {averageMinutes} min/day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "6px",
              }}
            />
            <Bar
              dataKey="minutes"
              fill="hsl(var(--primary))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
