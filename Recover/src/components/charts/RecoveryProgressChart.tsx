import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertCircle } from 'lucide-react';
import type { Setback } from '@/types/app';

interface RecoveryProgressChartProps {
  recoveryStartDate: string;
  setbacks: Setback[];
}

interface DataPoint {
  date: string;
  displayDate: string;
  totalDays: number;
  hasSetback?: boolean;
  setbackType?: 'slip' | 'relapse';
}

/**
 * RecoveryProgressChart
 *
 * Shows the overall recovery journey over time with:
 * - Total days in recovery (always increasing)
 * - Visual markers for setbacks (slips and relapses)
 * - Upward trend demonstrating continuous progress
 *
 * Optimized with React.memo and useMemo to prevent unnecessary re-renders
 */
export const RecoveryProgressChart = memo(function RecoveryProgressChart({ recoveryStartDate, setbacks }: RecoveryProgressChartProps) {
  // Memoize data generation to prevent recalculation on every render
  const data = useMemo((): DataPoint[] => {
    const startDate = new Date(recoveryStartDate);
    const today = new Date();
    const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    // If recovery just started (less than 7 days), show daily
    // Otherwise show weekly data points
    const showDaily = totalDays < 14;
    const interval = showDaily ? 1 : 7;

    const data: DataPoint[] = [];

    // Create data points at regular intervals
    for (let i = 0; i <= totalDays; i += interval) {
      const currentDate = new Date(startDate);
      currentDate.setDate(currentDate.getDate() + i);

      const dateStr = currentDate.toISOString().split('T')[0];

      // Check if there's a setback on this date
      const setback = setbacks.find(s => s.date === dateStr);

      data.push({
        date: dateStr,
        displayDate: showDaily
          ? currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: totalDays > 365 ? 'numeric' : undefined }),
        totalDays: i,
        hasSetback: !!setback,
        setbackType: setback?.type
      });
    }

    // Always add today as the last point
    if (data.length === 0 || data[data.length - 1].totalDays !== totalDays) {
      const setback = setbacks.find(s => s.date === today.toISOString().split('T')[0]);
      data.push({
        date: today.toISOString().split('T')[0],
        displayDate: today.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        totalDays,
        hasSetback: !!setback,
        setbackType: setback?.type
      });
    }

    return data;
  }, [recoveryStartDate, setbacks]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Recovery Progress Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Start your recovery journey to see progress
          </div>
        </CardContent>
      </Card>
    );
  }

  // Memoize computed values
  const totalDays = useMemo(() => data[data.length - 1].totalDays, [data]);
  const slipCount = useMemo(() => setbacks.filter(s => s.type === 'slip').length, [setbacks]);
  const relapseCount = useMemo(() => setbacks.filter(s => s.type === 'relapse').length, [setbacks]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const point = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: 'hsl(var(--popover))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          padding: '12px'
        }}
      >
        <p className="font-semibold mb-1">{point.displayDate}</p>
        <p className="text-sm">
          <span className="text-muted-foreground">Day </span>
          <span className="font-bold text-primary">{point.totalDays}</span>
          <span className="text-muted-foreground"> of recovery</span>
        </p>
        {point.hasSetback && (
          <p className="text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-orange-500" />
            <span className="text-orange-600 font-medium">
              {point.setbackType === 'slip' ? 'Slip' : 'Relapse'}
            </span>
          </p>
        )}
      </div>
    );
  };

  // Calculate tick interval based on data length to prevent overcrowding
  const getTickInterval = () => {
    if (data.length <= 7) return 0; // Show all
    if (data.length <= 30) return Math.floor(data.length / 5);
    return Math.floor(data.length / 6);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            Recovery Progress Timeline
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {totalDays} {totalDays === 1 ? 'day' : 'days'}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="displayDate"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              interval={getTickInterval()}
              angle={data.length > 14 ? -45 : 0}
              textAnchor={data.length > 14 ? 'end' : 'middle'}
              height={data.length > 14 ? 60 : 30}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              label={{ value: 'Days in Recovery', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              iconType="line"
              wrapperStyle={{ paddingTop: '20px' }}
            />

            {/* Main progress line - always upward */}
            <Line
              type="monotone"
              dataKey="totalDays"
              stroke="hsl(var(--chart-1))"
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6 }}
              name="Total Recovery Days"
            />

            {/* Setback markers */}
            {data.filter(d => d.hasSetback).map((point, idx) => (
              <ReferenceDot
                key={`${point.date}-${idx}`}
                x={point.displayDate}
                y={point.totalDays}
                r={8}
                fill={point.setbackType === 'slip' ? 'hsl(25 95% 53%)' : 'hsl(0 84% 60%)'}
                stroke="hsl(var(--background))"
                strokeWidth={2}
                label={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Legend and summary */}
        <div className="mt-4 space-y-3">
          {/* Setback indicators */}
          {(slipCount > 0 || relapseCount > 0) && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-muted-foreground">
                  Slip ({slipCount})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-muted-foreground">
                  Relapse ({relapseCount})
                </span>
              </div>
            </div>
          )}

          {/* Encouraging message */}
          <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium">
              📈 {totalDays} days of continuous recovery progress
              {setbacks.length > 0 && (
                <span className="text-xs block mt-1 opacity-75">
                  Despite {setbacks.length} {setbacks.length === 1 ? 'setback' : 'setbacks'},
                  you're still moving forward. Every day counts! 💪
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
