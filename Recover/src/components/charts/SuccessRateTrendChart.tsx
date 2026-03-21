import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import type { SuccessRateData } from '@/lib/chart-utils';

interface SuccessRateTrendChartProps {
  data: SuccessRateData[];
}

export function SuccessRateTrendChart({ data }: SuccessRateTrendChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Success Rate Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No craving data to display
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall trend
  const avgSuccessRate = data.reduce((sum, item) => sum + item.successRate, 0) / data.length;
  const recentAvg = data.slice(-4).reduce((sum, item) => sum + item.successRate, 0) / Math.min(4, data.length);
  const trend = recentAvg > avgSuccessRate ? 'improving' : recentAvg < avgSuccessRate ? 'declining' : 'stable';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Success Rate Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="week"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              domain={[0, 100]}
              label={{ value: 'Success %', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: number, name: string, props: any) => {
                if (name === 'successRate') {
                  return [`${value}% (${props.payload.total} cravings)`, 'Success Rate'];
                }
                return [value, name];
              }}
            />
            <Legend />
            <ReferenceLine
              y={70}
              stroke="hsl(var(--success))"
              strokeDasharray="3 3"
              label={{ value: 'Target: 70%', position: 'right' }}
            />
            <Line
              type="monotone"
              dataKey="successRate"
              stroke={
                trend === 'improving'
                  ? 'hsl(var(--success))'
                  : trend === 'declining'
                  ? 'hsl(var(--destructive))'
                  : 'hsl(var(--primary))'
              }
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--background))', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7 }}
              name="Success Rate"
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            {trend === 'improving' && '📈 Improving trend - Keep it up!'}
            {trend === 'declining' && '📉 Declining trend - Review your strategies'}
            {trend === 'stable' && '➡️ Stable trend - Maintain your progress'}
          </p>
          <p className="font-semibold">
            Recent Avg: {recentAvg.toFixed(0)}%
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
