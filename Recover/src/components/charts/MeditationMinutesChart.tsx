import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import type { ChartDataPoint } from '@/lib/chart-utils';

interface MeditationMinutesChartProps {
  data: ChartDataPoint[];
}

export function MeditationMinutesChart({ data }: MeditationMinutesChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Meditation Minutes per Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No meditation data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);
  const avgPerWeek = Math.round(totalMinutes / data.length);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Meditation Minutes per Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: number) => [`${value} minutes`, 'Total']}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Legend />
            <Bar
              dataKey="value"
              fill="hsl(var(--purple))"
              name="Meditation Minutes"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Total: {totalMinutes} minutes ({(totalMinutes / 60).toFixed(1)} hours)
          </p>
          <p className="font-semibold">
            Avg per week: {avgPerWeek} min
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
