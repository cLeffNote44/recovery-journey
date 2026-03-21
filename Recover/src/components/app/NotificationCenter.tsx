import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Bell,
  X,
  AlertTriangle,
  Calendar,
  Users,
  Moon,
  Target,
  Heart,
  Flame,
  CheckCircle
} from 'lucide-react';
import { calculateDaysSober } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'warning' | 'reminder' | 'milestone' | 'positive';
  icon: React.ReactNode;
  title: string;
  message: string;
  priority: number; // Higher = more important
}

interface NotificationCenterProps {
  onNavigate: (tab: string) => void;
}

export function NotificationCenter({ onNavigate }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('dismissed_notifications');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const {
    sobrietyDate,
    checkIns,
    cravings,
    meetings,
    sleepEntries,
    relapses
  } = useAppData();

  const notifications = useMemo(() => {
    const alerts: Notification[] = [];
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const dayOfWeek = now.getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // 1. Check-in reminder
    const hasCheckedInToday = checkIns.some(c => c.date === today);
    if (!hasCheckedInToday) {
      const hour = now.getHours();
      if (hour >= 10) { // After 10 AM
        alerts.push({
          id: 'checkin-today',
          type: 'reminder',
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          title: "Don't forget to check in",
          message: 'Complete your daily check-in to maintain your streak.',
          priority: 8
        });
      }
    }

    // 2. High-risk day warning (based on craving patterns)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentCravings = cravings.filter(c => new Date(c.date) >= thirtyDaysAgo);

    if (recentCravings.length >= 5) {
      const dayCount = new Map<number, number>();
      recentCravings.forEach(c => {
        const day = new Date(c.date).getDay();
        dayCount.set(day, (dayCount.get(day) || 0) + 1);
      });

      const topDay = Array.from(dayCount.entries())
        .sort((a, b) => b[1] - a[1])[0];

      if (topDay) {
        const percentage = Math.round((topDay[1] / recentCravings.length) * 100);

        // Warning for tomorrow
        const tomorrow = (dayOfWeek + 1) % 7;
        if (topDay[0] === tomorrow && percentage >= 25) {
          alerts.push({
            id: `high-risk-tomorrow-${tomorrow}`,
            type: 'warning',
            icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
            title: `Tomorrow is ${dayNames[tomorrow]}`,
            message: `${percentage}% of your cravings occur on ${dayNames[tomorrow]}s. Plan extra support.`,
            priority: 9
          });
        }

        // Warning for today
        if (topDay[0] === dayOfWeek && percentage >= 25) {
          alerts.push({
            id: `high-risk-today-${dayOfWeek}`,
            type: 'warning',
            icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
            title: `Today is a high-risk day`,
            message: `${dayNames[dayOfWeek]}s account for ${percentage}% of your cravings. Stay vigilant.`,
            priority: 10
          });
        }
      }
    }

    // 3. Meeting attendance reminder
    if (meetings.length > 0) {
      const lastMeeting = meetings
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const daysSinceLastMeeting = Math.floor(
        (now.getTime() - new Date(lastMeeting.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastMeeting >= 5 && daysSinceLastMeeting < 7) {
        alerts.push({
          id: 'meeting-reminder-5',
          type: 'reminder',
          icon: <Users className="w-5 h-5 text-blue-500" />,
          title: 'Schedule a meeting',
          message: `It's been ${daysSinceLastMeeting} days since your last meeting. Regular attendance strengthens recovery.`,
          priority: 7
        });
      } else if (daysSinceLastMeeting >= 7) {
        alerts.push({
          id: 'meeting-overdue',
          type: 'warning',
          icon: <Users className="w-5 h-5 text-amber-500" />,
          title: 'Meeting overdue',
          message: `${daysSinceLastMeeting} days since your last meeting. Your support network is important.`,
          priority: 8
        });
      }
    }

    // 4. Milestone approaching
    const daysSober = calculateDaysSober(sobrietyDate);
    const milestones = [7, 14, 30, 60, 90, 120, 180, 365, 500, 730, 1000];

    for (const milestone of milestones) {
      const daysUntil = milestone - daysSober;
      if (daysUntil > 0 && daysUntil <= 3) {
        alerts.push({
          id: `milestone-${milestone}`,
          type: 'milestone',
          icon: <Target className="w-5 h-5 text-blue-500" />,
          title: `${daysUntil} day${daysUntil === 1 ? '' : 's'} until ${milestone}-day milestone!`,
          message: `You're almost there! Keep going strong.`,
          priority: 6
        });
        break; // Only show nearest milestone
      }
    }

    // 5. Sleep quality warning
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentSleep = sleepEntries.filter(s => new Date(s.date) >= sevenDaysAgo);

    if (recentSleep.length >= 3) {
      const avgQuality = recentSleep.reduce((sum, s) => sum + s.quality, 0) / recentSleep.length;

      if (avgQuality < 5) {
        alerts.push({
          id: 'sleep-warning',
          type: 'warning',
          icon: <Moon className="w-5 h-5 text-indigo-500" />,
          title: 'Poor sleep detected',
          message: `Average sleep quality: ${avgQuality.toFixed(1)}/10. Poor sleep increases craving risk.`,
          priority: 7
        });
      }
    }

    // 6. Streak celebration
    const streak = checkIns.filter((c, i, arr) => {
      const checkDate = new Date(c.date);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);
      return c.date === expectedDate.toISOString().split('T')[0];
    }).length;

    if (streak === 7 || streak === 14 || streak === 30) {
      alerts.push({
        id: `streak-${streak}`,
        type: 'positive',
        icon: <Flame className="w-5 h-5 text-orange-500" />,
        title: `${streak}-day check-in streak!`,
        message: 'Amazing consistency! Your dedication is paying off.',
        priority: 5
      });
    }

    // 7. Recovery encouragement after setback
    if (relapses.length > 0) {
      const lastRelapse = relapses
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const daysSinceRelapse = Math.floor(
        (now.getTime() - new Date(lastRelapse.date).getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSinceRelapse === 7) {
        alerts.push({
          id: 'week-after-setback',
          type: 'positive',
          icon: <Heart className="w-5 h-5 text-blue-500" />,
          title: 'One week strong!',
          message: 'You\'ve been clean for a week since your last setback. You\'re rebuilding!',
          priority: 6
        });
      }
    }

    // Filter out dismissed notifications and sort by priority
    return alerts
      .filter(n => !dismissedIds.has(n.id))
      .sort((a, b) => b.priority - a.priority);
  }, [sobrietyDate, checkIns, cravings, meetings, sleepEntries, relapses, dismissedIds]);

  const dismissNotification = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);

    // Save to localStorage (expires at midnight)
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('dismissed_notifications', JSON.stringify(Array.from(newDismissed)));
    localStorage.setItem('dismissed_notifications_date', today);
  };

  // Clear dismissed notifications at midnight
  useMemo(() => {
    const savedDate = localStorage.getItem('dismissed_notifications_date');
    const today = new Date().toISOString().split('T')[0];
    if (savedDate && savedDate !== today) {
      localStorage.removeItem('dismissed_notifications');
      localStorage.removeItem('dismissed_notifications_date');
      setDismissedIds(new Set());
    }
  }, []);

  const unreadCount = notifications.length;

  const getTypeStyles = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-900';
      case 'reminder':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900';
      case 'milestone':
        return 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-900';
      case 'positive':
        return 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-900';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        className="bg-white/90 backdrop-blur-sm shadow-lg relative"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <Card className="absolute right-0 top-12 w-72 max-h-[28rem] overflow-hidden z-50 shadow-xl">
            <div className="p-3 border-b flex items-center justify-between">
              <h3 className="font-semibold">Notifications</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <CardContent className="p-0 overflow-y-auto max-h-96">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                  <p className="text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`p-3 ${getTypeStyles(notification.type)} border-l-4 relative`}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-50 hover:opacity-100"
                        onClick={() => dismissNotification(notification.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                      <div className="flex items-start gap-3 pr-6">
                        <div className="mt-0.5">{notification.icon}</div>
                        <div>
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
