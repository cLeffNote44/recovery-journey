import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { CravingTimelineChart } from '@/components/charts/CravingTimelineChart';
import { MoodDistributionChart } from '@/components/charts/MoodDistributionChart';
import { WeeklyActivityChart } from '@/components/charts/WeeklyActivityChart';
import { SuccessRateTrendChart } from '@/components/charts/SuccessRateTrendChart';
import { MeditationMinutesChart } from '@/components/charts/MeditationMinutesChart';
import {
  generateCravingTimeline,
  generateMoodDistribution,
  generateWeeklyActivityDistribution,
  generateSuccessRateTrend,
  generateMeditationWeeklyMinutes,
  filterByDateRange
} from '@/lib/chart-utils';
import type { Craving, CheckIn, Meeting, Meditation } from '@/types/app';
import { toast } from 'sonner';

interface VisualizationsPanelProps {
  cravings: Craving[];
  checkIns: CheckIn[];
  meetings: Meeting[];
  meditations: Meditation[];
}

type DateRange = 'week' | 'month' | 'quarter' | 'year' | 'all';

export function VisualizationsPanel({
  cravings,
  checkIns,
  meetings,
  meditations
}: VisualizationsPanelProps) {
  const [dateRange, setDateRange] = useState<DateRange>('all');

  // Filter data by date range
  const filteredCravings = useMemo(
    () => filterByDateRange(cravings, dateRange),
    [cravings, dateRange]
  );

  const filteredCheckIns = useMemo(
    () => filterByDateRange(checkIns, dateRange),
    [checkIns, dateRange]
  );

  const filteredMeetings = useMemo(
    () => filterByDateRange(meetings, dateRange),
    [meetings, dateRange]
  );

  const filteredMeditations = useMemo(
    () => filterByDateRange(meditations, dateRange),
    [meditations, dateRange]
  );

  // Generate chart data
  const cravingTimelineData = useMemo(
    () => generateCravingTimeline(filteredCravings),
    [filteredCravings]
  );

  const moodDistributionData = useMemo(
    () => generateMoodDistribution(filteredCheckIns),
    [filteredCheckIns]
  );

  const weeklyActivityData = useMemo(
    () => generateWeeklyActivityDistribution(
      filteredCravings,
      filteredMeetings,
      filteredMeditations,
      filteredCheckIns
    ),
    [filteredCravings, filteredMeetings, filteredMeditations, filteredCheckIns]
  );

  const successRateData = useMemo(
    () => generateSuccessRateTrend(filteredCravings),
    [filteredCravings]
  );

  const meditationData = useMemo(
    () => generateMeditationWeeklyMinutes(filteredMeditations),
    [filteredMeditations]
  );

  const handleExportCharts = async () => {
    try {
      // This would require implementing chart export functionality
      toast.info('Chart export coming soon! For now, take a screenshot.');
    } catch (error) {
      toast.error('Failed to export charts');
    }
  };

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={dateRange === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('week')}
              >
                Last Week
              </Button>
              <Button
                variant={dateRange === 'month' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('month')}
              >
                Last Month
              </Button>
              <Button
                variant={dateRange === 'quarter' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('quarter')}
              >
                Last Quarter
              </Button>
              <Button
                variant={dateRange === 'year' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('year')}
              >
                Last Year
              </Button>
              <Button
                variant={dateRange === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDateRange('all')}
              >
                All Time
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCharts}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export Charts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CravingTimelineChart data={cravingTimelineData} />
        <SuccessRateTrendChart data={successRateData} />
        <MoodDistributionChart data={moodDistributionData} />
        <MeditationMinutesChart data={meditationData} />
      </div>

      {/* Full Width Chart */}
      <WeeklyActivityChart data={weeklyActivityData} />

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-purple/10 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-2">📊 Understanding Your Visualizations</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Craving Intensity Timeline:</strong> Track how intense your cravings are over time.
              Lower intensity indicates stronger recovery.
            </p>
            <p>
              <strong>Success Rate Trend:</strong> Monitor your ability to overcome cravings.
              Aim for 70%+ success rate.
            </p>
            <p>
              <strong>Mood Distribution:</strong> See the breakdown of your emotional states.
              More positive moods indicate better wellbeing.
            </p>
            <p>
              <strong>Meditation Minutes:</strong> Track your mindfulness practice.
              Consistent meditation helps reduce stress and cravings.
            </p>
            <p>
              <strong>Weekly Activity:</strong> See your overall engagement with recovery activities.
              Higher activity correlates with better outcomes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
