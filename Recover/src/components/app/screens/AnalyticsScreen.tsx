import { useEffect, useState, useRef, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnalyticsScreenSkeleton } from '@/components/LoadingSkeletons';
import { Spinner } from '@/components/LoadingSkeletons';
import { TrendingUp, Calendar, Heart, Brain, Target, Award, AlertCircle, Apple, Flame, Users, Moon, FileText, X, Sparkles, BarChart3 } from 'lucide-react';
import { calculateDaysSober, calculateStreak, getMoodTrend, getTotalMeditationMinutes } from '@/lib/utils';
import { BADGES } from '@/lib/constants';
import { celebrate } from '@/lib/celebrations';
import { PDFReport } from '@/components/PDFReport';
import { generatePDFFromElement, generateReportFilename } from '@/lib/pdf-generator';
import type { ReportOptions } from '@/lib/pdf-generator';
import { generateAnalyticsReport } from '@/lib/analytics-engine';
import { InsightsPanel } from '@/components/app/InsightsPanel';
import { VisualizationsPanel } from '@/components/app/VisualizationsPanel';
import type { HALTCheck } from '@/types/app';
import { toast } from 'sonner';

export function AnalyticsScreen() {
  const context = useAppData();
  const {
    sobrietyDate,
    checkIns,
    meetings,
    growthLogs,
    challenges,
    gratitude,
    cravings,
    meditations,
    unlockedBadges,
    setUnlockedBadges,
    celebrationsEnabled,
    loading
  } = context;

  // PDF Export state
  const [showExportModal, setShowExportModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOptions>({
    dateRange: 'all',
    includeCharts: true,
    includeGrowthLogs: true,
    includeGratitude: true
  });
  const reportRef = useRef<HTMLDivElement>(null);

  const daysSober = calculateDaysSober(sobrietyDate);
  const streak = calculateStreak(checkIns);
  const moodTrend = getMoodTrend(checkIns);
  const totalMeditationMinutes = getTotalMeditationMinutes(meditations);

  const totalEntries = checkIns.length + meetings.length + growthLogs.length +
                       challenges.length + gratitude.length + cravings.length + meditations.length;

  const cravingsOvercome = cravings.filter(c => c.overcame).length;
  const successRate = cravings.length > 0 ? (cravingsOvercome / cravings.length) * 100 : 0;

  const weeksStrong = Math.floor(daysSober / 7);

  // Generate advanced analytics report
  const analyticsReport = useMemo(
    () => generateAnalyticsReport(cravings, checkIns, meetings, meditations, daysSober),
    [cravings, checkIns, meetings, meditations, daysSober]
  );

  // HALT Analytics
  const allHALTData: HALTCheck[] = [
    ...checkIns.filter(c => c.halt).map(c => c.halt!),
    ...cravings.filter(c => c.halt).map(c => c.halt!)
  ];

  const hasHALTData = allHALTData.length > 0;

  const avgHALT = hasHALTData ? {
    hungry: allHALTData.reduce((sum, h) => sum + h.hungry, 0) / allHALTData.length,
    angry: allHALTData.reduce((sum, h) => sum + h.angry, 0) / allHALTData.length,
    lonely: allHALTData.reduce((sum, h) => sum + h.lonely, 0) / allHALTData.length,
    tired: allHALTData.reduce((sum, h) => sum + h.tired, 0) / allHALTData.length,
  } : null;

  const getHighestHALTFactor = () => {
    if (!avgHALT) return null;
    const factors = [
      { name: 'Hungry', value: avgHALT.hungry, icon: Apple, color: 'text-green-500' },
      { name: 'Angry', value: avgHALT.angry, icon: Flame, color: 'text-red-500' },
      { name: 'Lonely', value: avgHALT.lonely, icon: Users, color: 'text-blue-500' },
      { name: 'Tired', value: avgHALT.tired, icon: Moon, color: 'text-blue-500' },
    ];
    return factors.sort((a, b) => b.value - a.value)[0];
  };

  const highestFactor = getHighestHALTFactor();

  // Mood Calendar Data (last 12 weeks)
  const getMoodCalendarData = () => {
    const weeks = 12;
    const days = weeks * 7;
    const data: Array<{ date: string; mood: number | null }> = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const checkIn = checkIns.find(c => c.date === dateStr);
      data.push({ date: dateStr, mood: checkIn?.mood || null });
    }

    return data;
  };

  // Trigger Breakdown
  const getTriggerBreakdown = () => {
    const triggerCounts: Record<string, number> = {};
    cravings.forEach(craving => {
      triggerCounts[craving.trigger] = (triggerCounts[craving.trigger] || 0) + 1;
    });
    return Object.entries(triggerCounts)
      .map(([trigger, count]) => ({ trigger, count }))
      .sort((a, b) => b.count - a.count);
  };

  // Week-over-Week Comparison
  const getWeekOverWeekStats = () => {
    const now = new Date();
    const lastWeekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const twoWeeksAgoStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);

    const lastWeekCheckIns = checkIns.filter(c => {
      const date = new Date(c.date);
      return date >= lastWeekStart && date < now;
    });

    const previousWeekCheckIns = checkIns.filter(c => {
      const date = new Date(c.date);
      return date >= twoWeeksAgoStart && date < lastWeekStart;
    });

    const lastWeekCravings = cravings.filter(c => {
      const date = new Date(c.date);
      return date >= lastWeekStart && date < now;
    });

    const previousWeekCravings = cravings.filter(c => {
      const date = new Date(c.date);
      return date >= twoWeeksAgoStart && date < lastWeekStart;
    });

    return {
      checkIns: {
        current: lastWeekCheckIns.length,
        previous: previousWeekCheckIns.length,
        change: lastWeekCheckIns.length - previousWeekCheckIns.length
      },
      cravings: {
        current: lastWeekCravings.length,
        previous: previousWeekCravings.length,
        change: lastWeekCravings.length - previousWeekCravings.length
      }
    };
  };

  const moodCalendarData = getMoodCalendarData();
  const triggerBreakdown = getTriggerBreakdown();
  const weekOverWeekStats = getWeekOverWeekStats();

  // Handle PDF generation
  const handleGeneratePDF = async () => {
    if (!reportRef.current) {
      toast.error('Report not ready. Please try again.');
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const filename = generateReportFilename(reportOptions);
      await generatePDFFromElement(reportRef.current, filename);
      toast.success('PDF report generated successfully!');
      setShowExportModal(false);
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Check for newly unlocked badges and celebrate
  useEffect(() => {
    if (!celebrationsEnabled) return;

    const newlyUnlockedBadges: string[] = [];

    BADGES.forEach(badge => {
      const isAlreadyUnlocked = unlockedBadges.includes(badge.id);
      if (isAlreadyUnlocked) return;

      let progress = 0;

      if (!badge.type) {
        progress = (daysSober / badge.requirement) * 100;
      } else if (badge.type === 'checkins') {
        progress = (checkIns.length / badge.requirement) * 100;
      } else if (badge.type === 'meditations') {
        progress = (meditations.length / badge.requirement) * 100;
      } else if (badge.type === 'cravings') {
        progress = (cravingsOvercome / badge.requirement) * 100;
      } else if (badge.type === 'meetings') {
        progress = (meetings.length / badge.requirement) * 100;
      } else if (badge.type === 'gratitude') {
        progress = (gratitude.length / badge.requirement) * 100;
      } else if (badge.type === 'streak') {
        progress = (streak / badge.requirement) * 100;
      }

      if (progress >= 100) {
        newlyUnlockedBadges.push(badge.id);
      }
    });

    if (newlyUnlockedBadges.length > 0) {
      // Update unlocked badges
      setUnlockedBadges([...unlockedBadges, ...newlyUnlockedBadges]);

      // Celebrate each new badge
      setTimeout(() => celebrate('badge'), 500);
    }
  }, [daysSober, checkIns.length, meditations.length, cravingsOvercome,
      meetings.length, gratitude.length, streak, celebrationsEnabled]);

  // Show loading skeleton while data is loading
  if (loading) {
    return <AnalyticsScreenSkeleton />;
  }

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <Button
          onClick={() => setShowExportModal(true)}
          variant="outline"
          size="sm"
          aria-label="Export PDF report"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </Button>
      </div>

      {/* Tabs for Analytics Views */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="visualizations" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6 mt-6">
          <InsightsPanel
            insights={analyticsReport.insights}
            cravingPatterns={analyticsReport.cravingPatterns}
            moodTrend={analyticsReport.moodTrend}
            successMetrics={analyticsReport.successMetrics}
          />
        </TabsContent>

        {/* Visualizations Tab */}
        <TabsContent value="visualizations" className="space-y-6 mt-6">
          <VisualizationsPanel
            cravings={cravings}
            checkIns={checkIns}
            meetings={meetings}
            meditations={meditations}
          />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6 mt-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{totalEntries}</div>
            <div className="text-sm text-muted-foreground">Total Entries</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-500">{weeksStrong}</div>
            <div className="text-sm text-muted-foreground">Weeks Strong</div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Activity Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Check-ins</span>
              <span className="text-sm font-medium">{checkIns.length}</span>
            </div>
            <Progress value={(checkIns.length / Math.max(daysSober, 1)) * 100} />
          </div>
          
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Meetings</span>
              <span className="text-sm font-medium">{meetings.length}</span>
            </div>
            <Progress value={Math.min((meetings.length / 25) * 100, 100)} className="bg-blue-200" />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Meditations</span>
              <span className="text-sm font-medium">{meditations.length} ({totalMeditationMinutes} min)</span>
            </div>
            <Progress value={Math.min((meditations.length / 50) * 100, 100)} className="bg-purple-200" />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Gratitude</span>
              <span className="text-sm font-medium">{gratitude.length}</span>
            </div>
            <Progress value={Math.min((gratitude.length / 30) * 100, 100)} className="bg-blue-200" />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm">Growth Logs</span>
              <span className="text-sm font-medium">{growthLogs.length}</span>
            </div>
            <Progress value={Math.min((growthLogs.length / 20) * 100, 100)} className="bg-green-200" />
          </div>
        </CardContent>
      </Card>

      {/* Craving Success Rate */}
      {cravings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Craving Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-green-500">{successRate.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">
                {cravingsOvercome} out of {cravings.length} cravings overcome
              </div>
            </div>
            <Progress value={successRate} className="h-3" />
          </CardContent>
        </Card>
      )}

      {/* HALT Analytics */}
      {hasHALTData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              HALT Pattern Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground mb-4">
                Based on {allHALTData.length} HALT assessment{allHALTData.length !== 1 ? 's' : ''}
              </p>
              {highestFactor && (
                <div className="flex flex-col items-center gap-2">
                  <highestFactor.icon className={`w-12 h-12 ${highestFactor.color}`} />
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Highest Factor</div>
                    <div className={`text-2xl font-bold ${highestFactor.color}`}>
                      {highestFactor.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average: {highestFactor.value.toFixed(1)}/10
                    </div>
                  </div>
                </div>
              )}
            </div>

            {avgHALT && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Apple className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Hungry</span>
                    </div>
                    <span className="text-sm font-medium">{avgHALT.hungry.toFixed(1)}/10</span>
                  </div>
                  <Progress value={avgHALT.hungry * 10} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Angry</span>
                    </div>
                    <span className="text-sm font-medium">{avgHALT.angry.toFixed(1)}/10</span>
                  </div>
                  <Progress value={avgHALT.angry * 10} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Lonely</span>
                    </div>
                    <span className="text-sm font-medium">{avgHALT.lonely.toFixed(1)}/10</span>
                  </div>
                  <Progress value={avgHALT.lonely * 10} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Tired</span>
                    </div>
                    <span className="text-sm font-medium">{avgHALT.tired.toFixed(1)}/10</span>
                  </div>
                  <Progress value={avgHALT.tired * 10} className="h-2" />
                </div>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                💡 Focus on addressing your highest factor to reduce relapse risk. Check-ins and cravings with HALT data are included in this analysis.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mood Trend */}
      {checkIns.some(c => c.mood) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Mood Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className={`text-2xl font-bold ${
                moodTrend === 'improving' ? 'text-green-500' :
                moodTrend === 'declining' ? 'text-orange-500' :
                'text-blue-500'
              }`}>
                {moodTrend === 'improving' ? '📈 Improving' :
                 moodTrend === 'declining' ? '📉 Needs Attention' :
                 '➡️ Stable'}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Based on your recent check-ins
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {BADGES.slice(0, 9).map(badge => {
              const isUnlocked = unlockedBadges.includes(badge.id);
              let progress = 0;
              
              if (!badge.type) {
                progress = Math.min((daysSober / badge.requirement) * 100, 100);
              } else if (badge.type === 'checkins') {
                progress = Math.min((checkIns.length / badge.requirement) * 100, 100);
              } else if (badge.type === 'meditations') {
                progress = Math.min((meditations.length / badge.requirement) * 100, 100);
              } else if (badge.type === 'cravings') {
                progress = Math.min((cravingsOvercome / badge.requirement) * 100, 100);
              } else if (badge.type === 'meetings') {
                progress = Math.min((meetings.length / badge.requirement) * 100, 100);
              } else if (badge.type === 'gratitude') {
                progress = Math.min((gratitude.length / badge.requirement) * 100, 100);
              } else if (badge.type === 'streak') {
                progress = Math.min((streak / badge.requirement) * 100, 100);
              }

              return (
                <div
                  key={badge.id}
                  className={`p-3 rounded-lg border-2 text-center ${
                    isUnlocked || progress >= 100
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                      : 'border-border opacity-50'
                  }`}
                >
                  <div className="text-3xl mb-1">{badge.icon}</div>
                  <div className="text-xs font-medium">{badge.name}</div>
                  {!isUnlocked && progress < 100 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {progress.toFixed(0)}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Streak Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Check-in Streak
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500">{streak}</div>
            <div className="text-sm text-muted-foreground">Consecutive days</div>
            {streak > 0 && (
              <p className="text-sm mt-3">
                🔥 Keep it going! Check in daily to maintain your streak.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Mood Calendar (GitHub-style) */}
      {checkIns.some(c => c.mood) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Mood Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs text-muted-foreground">Last 12 weeks</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Less</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-sm bg-muted border" />
                    <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
                    <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
                    <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500" />
                    <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-300" />
                  </div>
                  <span className="text-muted-foreground">More</span>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-1">
                {moodCalendarData.map((day, i) => {
                  const moodColor = day.mood === null ? 'bg-muted border' :
                    day.mood >= 9 ? 'bg-green-800 dark:bg-green-300' :
                    day.mood >= 7 ? 'bg-green-600 dark:bg-green-500' :
                    day.mood >= 5 ? 'bg-green-400 dark:bg-green-700' :
                    day.mood >= 3 ? 'bg-yellow-400 dark:bg-yellow-600' :
                    'bg-red-400 dark:bg-red-600';

                  return (
                    <div
                      key={i}
                      className={`aspect-square rounded-sm ${moodColor}`}
                      title={`${day.date}: ${day.mood ? `Mood ${day.mood}/10` : 'No check-in'}`}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Each square represents a day. Darker green = better mood.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trigger Breakdown */}
      {cravings.length > 0 && triggerBreakdown.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Craving Triggers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {triggerBreakdown.slice(0, 5).map((item, idx) => {
                const percentage = (item.count / cravings.length) * 100;
                const colors = [
                  'bg-red-500',
                  'bg-orange-500',
                  'bg-yellow-500',
                  'bg-blue-500',
                  'bg-blue-500'
                ];
                return (
                  <div key={item.trigger}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{item.trigger}</span>
                      <span className="text-sm text-muted-foreground">
                        {item.count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colors[idx % colors.length]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground text-center mt-4">
              💡 Knowing your triggers helps you prepare and develop coping strategies
            </p>
          </CardContent>
        </Card>
      )}

      {/* Week-over-Week Comparison */}
      {checkIns.length >= 7 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Week-over-Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-300">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {weekOverWeekStats.checkIns.current}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Check-ins (Last 7 days)</div>
                  {weekOverWeekStats.checkIns.change !== 0 && (
                    <div className={`text-xs font-medium ${weekOverWeekStats.checkIns.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {weekOverWeekStats.checkIns.change > 0 ? '↑' : '↓'} {Math.abs(weekOverWeekStats.checkIns.change)} from previous week
                    </div>
                  )}
                </div>

                <div className="text-center p-4 rounded-lg bg-gray-50 border border-gray-300">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {weekOverWeekStats.cravings.current}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">Cravings (Last 7 days)</div>
                  {weekOverWeekStats.cravings.change !== 0 && (
                    <div className={`text-xs font-medium ${weekOverWeekStats.cravings.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {weekOverWeekStats.cravings.change < 0 ? '↓' : '↑'} {Math.abs(weekOverWeekStats.cravings.change)} from previous week
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                {weekOverWeekStats.checkIns.change > 0 && weekOverWeekStats.cravings.change <= 0
                  ? '🎉 Great progress! More check-ins and fewer cravings.'
                  : weekOverWeekStats.checkIns.change > 0
                  ? '✅ Keep up the check-ins! They help you stay accountable.'
                  : '💪 Stay consistent with daily check-ins to track your progress.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>

      {/* PDF Export Modal */}
      {showExportModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-modal-title"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle id="export-modal-title">Export PDF Report</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowExportModal(false)}
                  aria-label="Close export dialog"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Date Range Selector */}
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <Select
                  value={reportOptions.dateRange}
                  onValueChange={(value) =>
                    setReportOptions({ ...reportOptions, dateRange: value as ReportOptions['dateRange'] })
                  }
                >
                  <SelectTrigger id="date-range">
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Past 7 Days</SelectItem>
                    <SelectItem value="month">Past 30 Days</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <Label>Include in Report</Label>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-growth"
                    checked={reportOptions.includeGrowthLogs}
                    onCheckedChange={(checked) =>
                      setReportOptions({ ...reportOptions, includeGrowthLogs: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="include-growth"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Growth & Learning Logs
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-gratitude"
                    checked={reportOptions.includeGratitude}
                    onCheckedChange={(checked) =>
                      setReportOptions({ ...reportOptions, includeGratitude: checked as boolean })
                    }
                  />
                  <label
                    htmlFor="include-gratitude"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Gratitude Journal Entries
                  </label>
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF}
                className="w-full bg-gradient-to-r from-slate-600 to-gray-700"
              >
                {isGeneratingPDF ? (
                  <>
                    <Spinner className="mr-2" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate PDF Report
                  </>
                )}
              </Button>

              {/* Hidden PDF Report Component */}
              <div className="hidden">
                <PDFReport ref={reportRef} data={context} options={reportOptions} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

