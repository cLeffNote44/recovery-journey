import type { Craving, CheckIn, Meeting, Meditation } from '@/types/app';

/**
 * Advanced Analytics Engine
 * Analyzes user data to generate insights, patterns, and recommendations
 */

export interface CravingPattern {
  timeOfDay: { hour: number; count: number; avgIntensity: number }[];
  dayOfWeek: { day: number; count: number; avgIntensity: number }[];
  topTriggers: { trigger: string; count: number; successRate: number }[];
  peakTimes: string[];
  riskFactors: string[];
}

export interface MoodTrend {
  trend: 'improving' | 'stable' | 'declining';
  avgMood: number;
  recentAvg: number;
  prediction: string;
  recommendations: string[];
}

export interface SuccessMetrics {
  overallSuccessRate: number;
  recentSuccessRate: number;
  improvement: number;
  strongestStrategies: string[];
  weakestAreas: string[];
}

export interface Insight {
  id: string;
  type: 'success' | 'warning' | 'tip' | 'achievement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  recommendations?: string[];
}

export interface AnalyticsReport {
  cravingPatterns: CravingPattern;
  moodTrend: MoodTrend;
  successMetrics: SuccessMetrics;
  insights: Insight[];
  weeklyStats: {
    cravingsThisWeek: number;
    cravingsLastWeek: number;
    checkInsThisWeek: number;
    meetingsThisWeek: number;
    meditationsThisWeek: number;
  };
}

/**
 * Analyze craving patterns
 */
export function analyzeCravingPatterns(cravings: Craving[]): CravingPattern {
  if (cravings.length === 0) {
    return {
      timeOfDay: [],
      dayOfWeek: [],
      topTriggers: [],
      peakTimes: [],
      riskFactors: []
    };
  }

  // Time of day analysis (24 hours)
  const hourlyData: { [hour: number]: { count: number; totalIntensity: number } } = {};
  for (let i = 0; i < 24; i++) {
    hourlyData[i] = { count: 0, totalIntensity: 0 };
  }

  // Day of week analysis (0 = Sunday, 6 = Saturday)
  const dailyData: { [day: number]: { count: number; totalIntensity: number } } = {};
  for (let i = 0; i < 7; i++) {
    dailyData[i] = { count: 0, totalIntensity: 0 };
  }

  // Trigger analysis
  const triggerData: { [trigger: string]: { count: number; overcame: number } } = {};

  cravings.forEach(craving => {
    const date = new Date(craving.date);
    const hour = date.getHours();
    const day = date.getDay();

    // Hour analysis
    hourlyData[hour].count++;
    hourlyData[hour].totalIntensity += craving.intensity;

    // Day analysis
    dailyData[day].count++;
    dailyData[day].totalIntensity += craving.intensity;

    // Trigger analysis
    if (!triggerData[craving.trigger]) {
      triggerData[craving.trigger] = { count: 0, overcame: 0 };
    }
    triggerData[craving.trigger].count++;
    if (craving.overcame) {
      triggerData[craving.trigger].overcame++;
    }
  });

  // Process time of day data
  const timeOfDay = Object.entries(hourlyData)
    .map(([hour, data]) => ({
      hour: parseInt(hour),
      count: data.count,
      avgIntensity: data.count > 0 ? data.totalIntensity / data.count : 0
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);

  // Process day of week data
  const dayOfWeek = Object.entries(dailyData)
    .map(([day, data]) => ({
      day: parseInt(day),
      count: data.count,
      avgIntensity: data.count > 0 ? data.totalIntensity / data.count : 0
    }))
    .filter(d => d.count > 0)
    .sort((a, b) => b.count - a.count);

  // Process trigger data
  const topTriggers = Object.entries(triggerData)
    .map(([trigger, data]) => ({
      trigger,
      count: data.count,
      successRate: data.count > 0 ? (data.overcame / data.count) * 100 : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Identify peak times (hours with most cravings)
  const peakTimes = timeOfDay
    .slice(0, 3)
    .map(t => {
      const hour = t.hour;
      if (hour < 12) return `${hour}:00 AM`;
      if (hour === 12) return '12:00 PM';
      return `${hour - 12}:00 PM`;
    });

  // Identify risk factors
  const riskFactors: string[] = [];

  // Check for high-intensity patterns
  const highIntensityCravings = cravings.filter(c => c.intensity >= 7);
  if (highIntensityCravings.length > cravings.length * 0.3) {
    riskFactors.push('Frequent high-intensity cravings');
  }

  // Check for low success rate
  const successRate = (cravings.filter(c => c.overcame).length / cravings.length) * 100;
  if (successRate < 60) {
    riskFactors.push('Success rate below 60%');
  }

  // Check for weekend patterns
  const weekendCravings = cravings.filter(c => {
    const day = new Date(c.date).getDay();
    return day === 0 || day === 6;
  });
  if (weekendCravings.length > cravings.length * 0.4) {
    riskFactors.push('Higher craving frequency on weekends');
  }

  return {
    timeOfDay,
    dayOfWeek,
    topTriggers,
    peakTimes,
    riskFactors
  };
}

/**
 * Analyze mood trends
 */
export function analyzeMoodTrend(checkIns: CheckIn[]): MoodTrend {
  const checkInsWithMood = checkIns.filter(c => c.mood !== undefined);

  if (checkInsWithMood.length === 0) {
    return {
      trend: 'stable',
      avgMood: 0,
      recentAvg: 0,
      prediction: 'Not enough data to analyze mood trends',
      recommendations: ['Complete daily check-ins with mood tracking']
    };
  }

  // Calculate overall average
  const totalMood = checkInsWithMood.reduce((sum, c) => sum + (c.mood || 0), 0);
  const avgMood = totalMood / checkInsWithMood.length;

  // Calculate recent average (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentCheckIns = checkInsWithMood.filter(c => new Date(c.date) >= weekAgo);
  const recentAvg = recentCheckIns.length > 0
    ? recentCheckIns.reduce((sum, c) => sum + (c.mood || 0), 0) / recentCheckIns.length
    : avgMood;

  // Determine trend
  let trend: 'improving' | 'stable' | 'declining';
  const difference = recentAvg - avgMood;
  if (difference > 0.5) {
    trend = 'improving';
  } else if (difference < -0.5) {
    trend = 'declining';
  } else {
    trend = 'stable';
  }

  // Generate prediction
  let prediction = '';
  const recommendations: string[] = [];

  if (trend === 'improving') {
    prediction = 'Your mood is trending upward! Keep up the great work.';
    recommendations.push('Continue current recovery activities');
    recommendations.push('Share your success strategies with others');
  } else if (trend === 'declining') {
    prediction = 'Your mood appears to be declining. Consider reaching out for support.';
    recommendations.push('Schedule time with your sponsor or therapist');
    recommendations.push('Attend additional support meetings');
    recommendations.push('Practice self-care activities daily');
    recommendations.push('Review your reasons for sobriety');
  } else {
    prediction = 'Your mood is stable. Focus on maintaining your current routine.';
    recommendations.push('Maintain consistent daily check-ins');
    recommendations.push('Continue regular meeting attendance');
  }

  return {
    trend,
    avgMood,
    recentAvg,
    prediction,
    recommendations
  };
}

/**
 * Calculate success metrics
 */
export function calculateSuccessMetrics(
  cravings: Craving[],
  checkIns: CheckIn[],
  meetings: Meeting[],
  meditations: Meditation[]
): SuccessMetrics {
  // Overall craving success rate
  const overallSuccessRate = cravings.length > 0
    ? (cravings.filter(c => c.overcame).length / cravings.length) * 100
    : 100;

  // Recent success rate (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCravings = cravings.filter(c => new Date(c.date) >= thirtyDaysAgo);
  const recentSuccessRate = recentCravings.length > 0
    ? (recentCravings.filter(c => c.overcame).length / recentCravings.length) * 100
    : 100;

  const improvement = recentSuccessRate - overallSuccessRate;

  // Identify strongest strategies (based on notes from successful cravings)
  const strongestStrategies: string[] = [];
  const successfulCravings = cravings.filter(c => c.overcame);

  if (successfulCravings.some(c => c.strategy?.toLowerCase().includes('meeting'))) {
    strongestStrategies.push('Attending support meetings');
  }
  if (successfulCravings.some(c => c.strategy?.toLowerCase().includes('call') || c.strategy?.toLowerCase().includes('contact'))) {
    strongestStrategies.push('Reaching out to support network');
  }
  if (successfulCravings.some(c => c.strategy?.toLowerCase().includes('meditation') || c.strategy?.toLowerCase().includes('breathe'))) {
    strongestStrategies.push('Meditation and breathing exercises');
  }
  if (successfulCravings.some(c => c.strategy?.toLowerCase().includes('exercise') || c.strategy?.toLowerCase().includes('walk'))) {
    strongestStrategies.push('Physical activity');
  }

  // Identify weak areas
  const weakestAreas: string[] = [];

  // Check check-in consistency
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentCheckIns = checkIns.filter(c => new Date(c.date) >= weekAgo);
  if (recentCheckIns.length < 5) {
    weakestAreas.push('Inconsistent daily check-ins');
  }

  // Check meeting attendance
  const recentMeetings = meetings.filter(m => new Date(m.date) >= weekAgo);
  if (recentMeetings.length === 0) {
    weakestAreas.push('Low meeting attendance');
  }

  // Check meditation practice
  const recentMeditations = meditations.filter(m => new Date(m.date) >= weekAgo);
  if (recentMeditations.length < 3) {
    weakestAreas.push('Infrequent meditation practice');
  }

  return {
    overallSuccessRate,
    recentSuccessRate,
    improvement,
    strongestStrategies,
    weakestAreas
  };
}

/**
 * Generate personalized insights
 */
export function generateInsights(
  cravingPatterns: CravingPattern,
  moodTrend: MoodTrend,
  successMetrics: SuccessMetrics,
  daysSober: number
): Insight[] {
  const insights: Insight[] = [];

  // Achievement insights
  if (daysSober >= 30) {
    insights.push({
      id: 'achievement-30',
      type: 'achievement',
      title: '30+ Days Strong!',
      description: `You've reached ${daysSober} days of sobriety. This is a major accomplishment!`,
      priority: 'high'
    });
  }

  // Success rate insights
  if (successMetrics.recentSuccessRate > 80) {
    insights.push({
      id: 'success-high',
      type: 'success',
      title: 'Excellent Success Rate',
      description: `You're overcoming ${successMetrics.recentSuccessRate.toFixed(0)}% of cravings. Your strategies are working!`,
      priority: 'medium',
      recommendations: successMetrics.strongestStrategies
    });
  } else if (successMetrics.recentSuccessRate < 60) {
    insights.push({
      id: 'success-low',
      type: 'warning',
      title: 'Success Rate Needs Attention',
      description: 'Consider strengthening your coping strategies and reaching out for support.',
      priority: 'high',
      recommendations: [
        'Talk to your sponsor about challenging moments',
        'Attend more frequent support meetings',
        'Review and update your relapse prevention plan'
      ]
    });
  }

  // Mood insights
  if (moodTrend.trend === 'declining') {
    insights.push({
      id: 'mood-declining',
      type: 'warning',
      title: 'Mood Trend Declining',
      description: 'Your recent mood has been lower than usual. This is a good time to prioritize self-care.',
      priority: 'high',
      recommendations: moodTrend.recommendations
    });
  } else if (moodTrend.trend === 'improving') {
    insights.push({
      id: 'mood-improving',
      type: 'success',
      title: 'Mood Improving',
      description: 'Your mood has been trending upward recently. Keep doing what you\'re doing!',
      priority: 'medium'
    });
  }

  // Craving pattern insights
  if (cravingPatterns.peakTimes.length > 0) {
    insights.push({
      id: 'peak-times',
      type: 'tip',
      title: 'Identified Peak Craving Times',
      description: `Your cravings are most frequent around ${cravingPatterns.peakTimes.join(', ')}. Plan extra support during these times.`,
      priority: 'medium',
      recommendations: [
        'Schedule activities during peak craving times',
        'Have your support contacts readily available',
        'Practice preventive coping strategies before peak times'
      ]
    });
  }

  // Risk factor insights
  if (cravingPatterns.riskFactors.length > 0) {
    insights.push({
      id: 'risk-factors',
      type: 'warning',
      title: 'Risk Factors Detected',
      description: 'Some patterns suggest areas needing attention.',
      priority: 'high',
      recommendations: cravingPatterns.riskFactors.map(factor =>
        `Address: ${factor}`
      )
    });
  }

  // Improvement insights
  if (successMetrics.improvement > 10) {
    insights.push({
      id: 'improvement',
      type: 'success',
      title: 'Significant Improvement',
      description: `Your success rate has improved by ${successMetrics.improvement.toFixed(0)}% recently!`,
      priority: 'medium'
    });
  }

  // Trigger insights
  if (cravingPatterns.topTriggers.length > 0) {
    const worstTrigger = cravingPatterns.topTriggers[0];
    if (worstTrigger.successRate < 50) {
      insights.push({
        id: 'trigger-challenge',
        type: 'tip',
        title: `Challenging Trigger: ${worstTrigger.trigger}`,
        description: `${worstTrigger.trigger} appears frequently but has a lower success rate. Consider developing specific strategies for this trigger.`,
        priority: 'medium',
        recommendations: [
          'Work with your sponsor on this specific trigger',
          'Practice role-playing scenarios',
          'Identify early warning signs'
        ]
      });
    }
  }

  // Sort by priority
  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Generate complete analytics report
 */
export function generateAnalyticsReport(
  cravings: Craving[],
  checkIns: CheckIn[],
  meetings: Meeting[],
  meditations: Meditation[],
  daysSober: number
): AnalyticsReport {
  const cravingPatterns = analyzeCravingPatterns(cravings);
  const moodTrend = analyzeMoodTrend(checkIns);
  const successMetrics = calculateSuccessMetrics(cravings, checkIns, meetings, meditations);
  const insights = generateInsights(cravingPatterns, moodTrend, successMetrics, daysSober);

  // Calculate weekly stats
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  const weeklyStats = {
    cravingsThisWeek: cravings.filter(c => new Date(c.date) >= weekAgo).length,
    cravingsLastWeek: cravings.filter(c => {
      const date = new Date(c.date);
      return date >= twoWeeksAgo && date < weekAgo;
    }).length,
    checkInsThisWeek: checkIns.filter(c => new Date(c.date) >= weekAgo).length,
    meetingsThisWeek: meetings.filter(m => new Date(m.date) >= weekAgo).length,
    meditationsThisWeek: meditations.filter(m => new Date(m.date) >= weekAgo).length
  };

  return {
    cravingPatterns,
    moodTrend,
    successMetrics,
    insights,
    weeklyStats
  };
}
