import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Moon,
  Users,
  Heart,
  Target,
  Clock,
  Calendar
} from 'lucide-react';
import type {
  Craving,
  CheckIn,
  Meeting,
  SleepEntry,
  ExerciseEntry,
  Relapse
} from '@/types/app';

interface InsightCardsProps {
  cravings: Craving[];
  checkIns: CheckIn[];
  meetings: Meeting[];
  sleepEntries: SleepEntry[];
  exerciseEntries: ExerciseEntry[];
  relapses: Relapse[];
}

interface Insight {
  id: string;
  type: 'warning' | 'positive' | 'info';
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: string;
}

export function InsightCards({
  cravings,
  checkIns,
  meetings,
  sleepEntries,
  exerciseEntries,
  relapses
}: InsightCardsProps) {
  const insights = useMemo(() => {
    const results: Insight[] = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter data to last 30 days
    const recentCravings = cravings.filter(c => new Date(c.date) >= thirtyDaysAgo);
    const recentCheckIns = checkIns.filter(c => new Date(c.date) >= thirtyDaysAgo);
    const recentMeetings = meetings.filter(m => new Date(m.date) >= thirtyDaysAgo);
    const recentSleep = sleepEntries.filter(s => new Date(s.date) >= thirtyDaysAgo);
    const recentExercise = exerciseEntries.filter(e => new Date(e.date) >= thirtyDaysAgo);

    // Last 7 days data
    const weekCravings = cravings.filter(c => new Date(c.date) >= sevenDaysAgo);
    const weekMeetings = meetings.filter(m => new Date(m.date) >= sevenDaysAgo);

    // 1. Craving Trigger Pattern
    if (recentCravings.length >= 3) {
      const triggerCounts = new Map<string, number>();
      recentCravings.forEach(c => {
        triggerCounts.set(c.trigger, (triggerCounts.get(c.trigger) || 0) + 1);
      });

      const topTrigger = Array.from(triggerCounts.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (topTrigger && topTrigger[1] >= 2) {
        const percentage = Math.round((topTrigger[1] / recentCravings.length) * 100);
        results.push({
          id: 'top-trigger',
          type: 'warning',
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          title: `"${topTrigger[0]}" is your top trigger`,
          description: `${percentage}% of your recent cravings are triggered by ${topTrigger[0].toLowerCase()}.`,
          action: 'Develop specific coping strategies for this trigger'
        });
      }
    }

    // 2. Craving Success Rate
    if (recentCravings.length >= 5) {
      const overcameCount = recentCravings.filter(c => c.overcame).length;
      const successRate = Math.round((overcameCount / recentCravings.length) * 100);

      if (successRate >= 70) {
        results.push({
          id: 'craving-success',
          type: 'positive',
          icon: <TrendingUp className="w-5 h-5 text-green-500" />,
          title: `${successRate}% craving success rate`,
          description: `You've overcome ${overcameCount} of ${recentCravings.length} cravings. Your coping strategies are working!`,
        });
      } else if (successRate < 50 && recentCravings.length >= 3) {
        results.push({
          id: 'craving-struggle',
          type: 'warning',
          icon: <Target className="w-5 h-5 text-amber-500" />,
          title: 'Cravings need attention',
          description: `Only ${successRate}% success rate. Consider reviewing your coping strategies.`,
          action: 'Try adding new coping techniques'
        });
      }
    }

    // 3. Meeting Attendance Pattern
    if (weekMeetings.length === 0 && meetings.length > 0) {
      const daysSinceLastMeeting = meetings.length > 0
        ? Math.floor((now.getTime() - new Date(meetings[meetings.length - 1].date).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      if (daysSinceLastMeeting >= 7) {
        results.push({
          id: 'meeting-gap',
          type: 'warning',
          icon: <Users className="w-5 h-5 text-blue-500" />,
          title: `${daysSinceLastMeeting} days since last meeting`,
          description: 'Regular meeting attendance strengthens recovery.',
          action: 'Schedule a meeting this week'
        });
      }
    } else if (weekMeetings.length >= 3) {
      results.push({
        id: 'meeting-strong',
        type: 'positive',
        icon: <Users className="w-5 h-5 text-green-500" />,
        title: 'Strong meeting attendance',
        description: `${weekMeetings.length} meetings this week. Keep building your support network!`,
      });
    }

    // 4. Sleep Quality Correlation
    if (recentSleep.length >= 7) {
      const avgQuality = recentSleep.reduce((sum, s) => sum + s.quality, 0) / recentSleep.length;
      const avgDuration = recentSleep.reduce((sum, s) => sum + s.duration, 0) / recentSleep.length;

      if (avgQuality < 5) {
        results.push({
          id: 'sleep-quality',
          type: 'warning',
          icon: <Moon className="w-5 h-5 text-indigo-500" />,
          title: 'Sleep quality needs attention',
          description: `Average sleep quality: ${avgQuality.toFixed(1)}/10. Poor sleep can increase craving intensity.`,
          action: 'Focus on sleep hygiene'
        });
      } else if (avgQuality >= 7 && avgDuration >= 7) {
        results.push({
          id: 'sleep-good',
          type: 'positive',
          icon: <Moon className="w-5 h-5 text-green-500" />,
          title: 'Great sleep patterns',
          description: `Averaging ${avgDuration.toFixed(1)} hours with ${avgQuality.toFixed(1)}/10 quality. This supports your recovery!`,
        });
      }
    }

    // 5. Exercise Consistency
    if (recentExercise.length >= 8) {
      results.push({
        id: 'exercise-strong',
        type: 'positive',
        icon: <Zap className="w-5 h-5 text-green-500" />,
        title: 'Consistent exercise routine',
        description: `${recentExercise.length} workouts in the last 30 days. Exercise reduces stress and cravings!`,
      });
    } else if (recentExercise.length < 4 && recentExercise.length > 0) {
      results.push({
        id: 'exercise-low',
        type: 'info',
        icon: <Zap className="w-5 h-5 text-amber-500" />,
        title: 'Boost your exercise',
        description: `Only ${recentExercise.length} workouts this month. Regular exercise reduces cravings by up to 50%.`,
        action: 'Aim for 3+ workouts per week'
      });
    }

    // 6. Mood Trend Analysis
    if (recentCheckIns.length >= 7) {
      const checkInsWithMood = recentCheckIns.filter(c => c.mood !== undefined);
      if (checkInsWithMood.length >= 5) {
        const recentMoods = checkInsWithMood.slice(-7);
        const olderMoods = checkInsWithMood.slice(0, -7);

        if (olderMoods.length >= 3) {
          const recentAvg = recentMoods.reduce((sum, c) => sum + (c.mood || 0), 0) / recentMoods.length;
          const olderAvg = olderMoods.reduce((sum, c) => sum + (c.mood || 0), 0) / olderMoods.length;
          const diff = recentAvg - olderAvg;

          if (diff >= 0.5) {
            results.push({
              id: 'mood-improving',
              type: 'positive',
              icon: <TrendingUp className="w-5 h-5 text-green-500" />,
              title: 'Mood is trending up',
              description: 'Your recent check-ins show improved mood. Keep doing what works!',
            });
          } else if (diff <= -0.5) {
            results.push({
              id: 'mood-declining',
              type: 'warning',
              icon: <TrendingDown className="w-5 h-5 text-amber-500" />,
              title: 'Mood needs attention',
              description: 'Recent check-ins show lower mood. Consider reaching out to your support network.',
              action: 'Talk to a trusted contact'
            });
          }
        }
      }
    }

    // 7. Craving Time Patterns
    if (recentCravings.length >= 5) {
      // Analyze day of week
      const dayCount = new Map<number, number>();
      recentCravings.forEach(c => {
        const day = new Date(c.date).getDay();
        dayCount.set(day, (dayCount.get(day) || 0) + 1);
      });

      const topDay = Array.from(dayCount.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (topDay && topDay[1] >= 3) {
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const percentage = Math.round((topDay[1] / recentCravings.length) * 100);

        if (percentage >= 30) {
          results.push({
            id: 'day-pattern',
            type: 'info',
            icon: <Calendar className="w-5 h-5 text-blue-500" />,
            title: `${dayNames[topDay[0]]}s are high-risk`,
            description: `${percentage}% of your cravings occur on ${dayNames[topDay[0]]}s.`,
            action: 'Plan extra support for this day'
          });
        }
      }
    }

    // 8. HALT Pattern Detection
    const checkInsWithHalt = recentCheckIns.filter(c => c.halt);
    if (checkInsWithHalt.length >= 5) {
      const haltScores = {
        hungry: 0,
        angry: 0,
        lonely: 0,
        tired: 0
      };

      checkInsWithHalt.forEach(c => {
        if (c.halt) {
          if (c.halt.hungry >= 7) haltScores.hungry++;
          if (c.halt.angry >= 7) haltScores.angry++;
          if (c.halt.lonely >= 7) haltScores.lonely++;
          if (c.halt.tired >= 7) haltScores.tired++;
        }
      });

      const topHalt = Object.entries(haltScores)
        .sort((a, b) => b[1] - a[1])[0];

      if (topHalt[1] >= 3) {
        const haltMessages: Record<string, string> = {
          hungry: 'Keep healthy snacks available and maintain regular meals',
          angry: 'Practice anger management techniques and stress relief',
          lonely: 'Reach out to your support network regularly',
          tired: 'Prioritize sleep and rest when feeling fatigued'
        };

        results.push({
          id: 'halt-pattern',
          type: 'warning',
          icon: <Clock className="w-5 h-5 text-orange-500" />,
          title: `Frequently feeling ${topHalt[0]}`,
          description: `You often report high ${topHalt[0]} levels.`,
          action: haltMessages[topHalt[0]]
        });
      }
    }

    // 9. Check-in Consistency
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    });

    const checkInDays = new Set(checkIns.map(c => c.date));
    const weekCheckIns = last7Days.filter(d => checkInDays.has(d)).length;

    if (weekCheckIns === 7) {
      results.push({
        id: 'perfect-week',
        type: 'positive',
        icon: <Heart className="w-5 h-5 text-blue-500" />,
        title: 'Perfect check-in week!',
        description: 'You checked in every day this week. Outstanding commitment!',
      });
    }

    // Limit to 4 most relevant insights
    return results.slice(0, 4);
  }, [cravings, checkIns, meetings, sleepEntries, exerciseEntries, relapses]);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-500" />
          Pattern Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map(insight => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border ${
              insight.type === 'positive'
                ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900'
                : insight.type === 'warning'
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{insight.icon}</div>
              <div className="flex-1">
                <p className="font-medium text-sm">{insight.title}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.description}
                </p>
                {insight.action && (
                  <p className="text-xs font-medium mt-2 text-primary">
                    Tip: {insight.action}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
