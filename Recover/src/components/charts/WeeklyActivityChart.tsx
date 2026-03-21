import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import type { ActivityDistributionData } from '@/lib/chart-utils';

interface WeeklyActivityChartProps {
  data: ActivityDistributionData[];
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Weekly Activity Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No activity data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Weekly Activity Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="week"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '12px'
              }}
              cursor={{ fill: 'hsl(var(--muted))' }}
            />
            <Legend />
            <Bar
              dataKey="checkIns"
              stackId="a"
              fill="hsl(var(--primary))"
              name="Check-Ins"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="meetings"
              stackId="a"
              fill="hsl(var(--success))"
              name="Meetings"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="meditations"
              stackId="a"
              fill="hsl(var(--purple))"
              name="Meditations"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="cravings"
              stackId="a"
              fill="hsl(var(--orange))"
              name="Cravings"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-muted-foreground mt-4 text-center">
          Your recovery activities over the last 12 weeks
        </p>
      </CardContent>
    </Card>
  );
}
