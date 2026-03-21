import type { Craving, CheckIn, Meeting, Meditation } from '@/types/app';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface CravingTimelineData {
  date: string;
  intensity: number;
  count: number;
}

export interface MoodDistributionData {
  mood: string;
  count: number;
  percentage: number;
}

export interface ActivityDistributionData {
  week: string;
  cravings: number;
  meetings: number;
  meditations: number;
  checkIns: number;
}

export interface SuccessRateData {
  week: string;
  successRate: number;
  total: number;
}

/**
 * Generate craving intensity timeline data
 */
export function generateCravingTimeline(cravings: Craving[]): CravingTimelineData[] {
  const dailyData = new Map<string, { totalIntensity: number; count: number }>();

  cravings.forEach(craving => {
    const date = craving.date.split('T')[0];
    const existing = dailyData.get(date) || { totalIntensity: 0, count: 0 };
    dailyData.set(date, {
      totalIntensity: existing.totalIntensity + craving.intensity,
      count: existing.count + 1
    });
  });

  const sortedDates = Array.from(dailyData.keys()).sort();

  return sortedDates.map(date => {
    const data = dailyData.get(date)!;
    return {
      date,
      intensity: Math.round(data.totalIntensity / data.count * 10) / 10,
      count: data.count
    };
  });
}

/**
 * Generate mood distribution data
 */
export function generateMoodDistribution(checkIns: CheckIn[]): MoodDistributionData[] {
  const moodCounts = new Map<number, number>();
  const moodLabels = {
    1: '😢 Very Bad',
    2: '😟 Bad',
    3: '😐 Okay',
    4: '🙂 Good',
    5: '😄 Great'
  };

  checkIns.forEach(checkIn => {
    if (checkIn.mood) {
      moodCounts.set(checkIn.mood, (moodCounts.get(checkIn.mood) || 0) + 1);
    }
  });

  const total = checkIns.filter(c => c.mood).length;

  return Array.from(moodCounts.entries())
    .sort(([a], [b]) => a - b)
    .map(([mood, count]) => ({
      mood: moodLabels[mood as keyof typeof moodLabels] || `Mood ${mood}`,
      count,
      percentage: Math.round((count / total) * 100)
    }));
}

/**
 * Generate weekly activity distribution
 */
export function generateWeeklyActivityDistribution(
  cravings: Craving[],
  meetings: Meeting[],
  meditations: Meditation[],
  checkIns: CheckIn[]
): ActivityDistributionData[] {
  const weeklyData = new Map<string, {
    cravings: number;
    meetings: number;
    meditations: number;
    checkIns: number;
  }>();

  const getWeekKey = (dateStr: string): string => {
    const date = new Date(dateStr);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart.toISOString().split('T')[0];
  };

  // Count cravings by week
  cravings.forEach(craving => {
    const week = getWeekKey(craving.date);
    const existing = weeklyData.get(week) || { cravings: 0, meetings: 0, meditations: 0, checkIns: 0 };
    weeklyData.set(week, { ...existing, cravings: existing.cravings + 1 });
  });

  // Count meetings by week
  meetings.forEach(meeting => {
    const week = getWeekKey(meeting.date);
    const existing = weeklyData.get(week) || { cravings: 0, meetings: 0, meditations: 0, checkIns: 0 };
    weeklyData.set(week, { ...existing, meetings: existing.meetings + 1 });
  });

  // Count meditations by week
  meditations.forEach(meditation => {
    const week = getWeekKey(meditation.date);
    const existing = weeklyData.get(week) || { cravings: 0, meetings: 0, meditations: 0, checkIns: 0 };
    weeklyData.set(week, { ...existing, meditations: existing.meditations + 1 });
  });

  // Count check-ins by week
  checkIns.forEach(checkIn => {
    const week = getWeekKey(checkIn.date);
    const existing = weeklyData.get(week) || { cravings: 0, meetings: 0, meditations: 0, checkIns: 0 };
    weeklyData.set(week, { ...existing, checkIns: existing.checkIns + 1 });
  });

  // Get last 12 weeks
  const sortedWeeks = Array.from(weeklyData.keys()).sort().slice(-12);

  return sortedWeeks.map(week => {
    const data = weeklyData.get(week)!;
    const weekDate = new Date(week);
    const formattedWeek = `${weekDate.getMonth() + 1}/${weekDate.getDate()}`;
    return {
      week: formattedWeek,
      ...data
    };
  });
}

/**
 * Generate success rate over time
 */
export function generateSuccessRateTrend(cravings: Craving[]): SuccessRateData[] {
  const weeklyData = new Map<string, { successful: number; total: number }>();

  const getWeekKey = (dateStr: string): string => {
    const date = new Date(dateStr);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart.toISOString().split('T')[0];
  };

  cravings.forEach(craving => {
    const week = getWeekKey(craving.date);
    const existing = weeklyData.get(week) || { successful: 0, total: 0 };
    weeklyData.set(week, {
      successful: existing.successful + (craving.overcame ? 1 : 0),
      total: existing.total + 1
    });
  });

  // Get last 12 weeks
  const sortedWeeks = Array.from(weeklyData.keys()).sort().slice(-12);

  return sortedWeeks.map(week => {
    const data = weeklyData.get(week)!;
    const weekDate = new Date(week);
    const formattedWeek = `${weekDate.getMonth() + 1}/${weekDate.getDate()}`;
    return {
      week: formattedWeek,
      successRate: Math.round((data.successful / data.total) * 100),
      total: data.total
    };
  });
}

/**
 * Generate meditation minutes per week
 */
export function generateMeditationWeeklyMinutes(meditations: Meditation[]): ChartDataPoint[] {
  const weeklyMinutes = new Map<string, number>();

  const getWeekKey = (dateStr: string): string => {
    const date = new Date(dateStr);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay());
    return weekStart.toISOString().split('T')[0];
  };

  meditations.forEach(meditation => {
    const week = getWeekKey(meditation.date);
    weeklyMinutes.set(week, (weeklyMinutes.get(week) || 0) + meditation.duration);
  });

  // Get last 12 weeks
  const sortedWeeks = Array.from(weeklyMinutes.keys()).sort().slice(-12);

  return sortedWeeks.map(week => {
    const weekDate = new Date(week);
    const formattedWeek = `${weekDate.getMonth() + 1}/${weekDate.getDate()}`;
    return {
      date: formattedWeek,
      value: weeklyMinutes.get(week)!,
      label: `${weeklyMinutes.get(week)} min`
    };
  });
}

/**
 * Filter data by date range
 */
export function filterByDateRange<T extends { date: string }>(
  data: T[],
  dateRange: 'week' | 'month' | 'quarter' | 'year' | 'all'
): T[] {
  if (dateRange === 'all') return data;

  const now = new Date();
  let startDate: Date;

  switch (dateRange) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'quarter':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(0);
  }

  return data.filter(item => new Date(item.date) >= startDate);
}

/**
 * Export chart as image (helper for html2canvas)
 */
export async function exportChartAsImage(elementId: string, filename: string): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found`);
    }

    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2
    });

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  } catch (error) {
    console.error('Error exporting chart:', error);
    throw new Error('Failed to export chart as image');
  }
}
