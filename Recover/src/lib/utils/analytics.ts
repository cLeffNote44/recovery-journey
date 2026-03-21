/**
 * Analytics Utilities
 *
 * Functions for analyzing trends, correlations, and generating insights
 */

import type { CheckIn, SleepEntry, ExerciseEntry, NutritionEntry, Craving, Relapse } from '@/types/app';

export interface WellnessCorrelation {
  metric: string;
  correlation: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-1
  insight: string;
}

/**
 * Analyze mood trend over recent check-ins
 */
export function getMoodTrend(checkIns: CheckIn[]): 'improving' | 'declining' | 'stable' {
  if (!checkIns || checkIns.length < 2) return 'stable';

  const recentCheckIns = checkIns
    .filter(c => c.mood)
    .slice(-7)
    .map(c => c.mood!);

  if (recentCheckIns.length < 2) return 'stable';

  const firstHalf = recentCheckIns.slice(0, Math.floor(recentCheckIns.length / 2));
  const secondHalf = recentCheckIns.slice(Math.floor(recentCheckIns.length / 2));

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const difference = secondAvg - firstAvg;

  if (difference > 1) return 'improving';
  if (difference < -1) return 'declining';
  return 'stable';
}

/**
 * Calculate correlation between sleep quality and mood
 */
export function getSleepMoodCorrelation(
  sleepEntries: SleepEntry[],
  checkIns: CheckIn[]
): WellnessCorrelation {
  if (!sleepEntries.length || !checkIns.length) {
    return {
      metric: 'Sleep Quality',
      correlation: 'neutral',
      strength: 0,
      insight: 'Not enough data to determine correlation'
    };
  }

  // Match sleep entries with check-ins on the same day
  const matches: Array<{ sleep: number; mood: number }> = [];

  sleepEntries.forEach(sleep => {
    const checkIn = checkIns.find(c => c.date === sleep.date && c.mood);
    if (checkIn && checkIn.mood) {
      matches.push({ sleep: sleep.quality, mood: checkIn.mood });
    }
  });

  if (matches.length < 3) {
    return {
      metric: 'Sleep Quality',
      correlation: 'neutral',
      strength: 0,
      insight: 'Need more data points to determine correlation'
    };
  }

  // Calculate Pearson correlation coefficient
  const n = matches.length;
  const sumSleep = matches.reduce((sum, m) => sum + m.sleep, 0);
  const sumMood = matches.reduce((sum, m) => sum + m.mood, 0);
  const sumSleepMood = matches.reduce((sum, m) => sum + m.sleep * m.mood, 0);
  const sumSleepSq = matches.reduce((sum, m) => sum + m.sleep * m.sleep, 0);
  const sumMoodSq = matches.reduce((sum, m) => sum + m.mood * m.mood, 0);

  const numerator = (n * sumSleepMood) - (sumSleep * sumMood);
  const denominator = Math.sqrt(
    ((n * sumSleepSq) - (sumSleep * sumSleep)) *
    ((n * sumMoodSq) - (sumMood * sumMood))
  );

  const correlation = denominator === 0 ? 0 : numerator / denominator;
  const strength = Math.abs(correlation);

  let insight = '';
  if (strength > 0.5 && correlation > 0) {
    insight = 'Better sleep quality strongly correlates with improved mood';
  } else if (strength > 0.3 && correlation > 0) {
    insight = 'Better sleep quality moderately correlates with better mood';
  } else if (strength > 0.3 && correlation < 0) {
    insight = 'Poor sleep quality may be affecting your mood negatively';
  } else {
    insight = 'Sleep quality shows weak correlation with mood';
  }

  return {
    metric: 'Sleep Quality',
    correlation: correlation > 0.1 ? 'positive' : (correlation < -0.1 ? 'negative' : 'neutral'),
    strength,
    insight
  };
}

/**
 * Calculate correlation between exercise and cravings
 */
export function getExerciseCravingCorrelation(
  exerciseEntries: ExerciseEntry[],
  cravings: Craving[]
): WellnessCorrelation {
  if (!exerciseEntries.length || !cravings.length) {
    return {
      metric: 'Exercise',
      correlation: 'neutral',
      strength: 0,
      insight: 'Not enough data to determine correlation'
    };
  }

  // Create a map of dates to craving counts
  const cravingsByDate = new Map<string, number>();
  cravings.forEach(craving => {
    const count = cravingsByDate.get(craving.date) || 0;
    cravingsByDate.set(craving.date, count + 1);
  });

  // Calculate average cravings on exercise days vs non-exercise days
  const exerciseDates = new Set(exerciseEntries.map(e => e.date));
  const allDates = new Set([...exerciseDates, ...Array.from(cravingsByDate.keys())]);

  let exerciseDayCravings = 0;
  let nonExerciseDayCravings = 0;
  let exerciseDayCount = 0;
  let nonExerciseDayCount = 0;

  allDates.forEach(date => {
    const cravingCount = cravingsByDate.get(date) || 0;
    if (exerciseDates.has(date)) {
      exerciseDayCravings += cravingCount;
      exerciseDayCount++;
    } else {
      nonExerciseDayCravings += cravingCount;
      nonExerciseDayCount++;
    }
  });

  const avgExerciseDayCravings = exerciseDayCount > 0 ? exerciseDayCravings / exerciseDayCount : 0;
  const avgNonExerciseDayCravings = nonExerciseDayCount > 0 ? nonExerciseDayCravings / nonExerciseDayCount : 0;

  const difference = avgNonExerciseDayCravings - avgExerciseDayCravings;
  const strength = Math.min(Math.abs(difference) / 2, 1); // Normalize to 0-1

  let insight = '';
  if (difference > 0.5) {
    insight = `Exercise days show ${Math.round(difference * 100)}% fewer cravings on average`;
  } else if (difference > 0.2) {
    insight = 'Exercise appears to moderately reduce cravings';
  } else if (difference < -0.2) {
    insight = 'Exercise days show slightly more cravings (may indicate stress)';
  } else {
    insight = 'No significant correlation between exercise and cravings';
  }

  return {
    metric: 'Exercise',
    correlation: difference > 0.1 ? 'positive' : (difference < -0.1 ? 'negative' : 'neutral'),
    strength,
    insight
  };
}

/**
 * Calculate correlation between nutrition quality and mood
 */
export function getNutritionMoodCorrelation(
  nutritionEntries: NutritionEntry[],
  checkIns: CheckIn[]
): WellnessCorrelation {
  if (!nutritionEntries.length || !checkIns.length) {
    return {
      metric: 'Nutrition Quality',
      correlation: 'neutral',
      strength: 0,
      insight: 'Not enough data to determine correlation'
    };
  }

  // Calculate daily average nutrition quality
  const nutritionByDate = new Map<string, number[]>();
  nutritionEntries.forEach(entry => {
    const qualities = nutritionByDate.get(entry.date) || [];
    qualities.push(entry.nutritionQuality);
    nutritionByDate.set(entry.date, qualities);
  });

  // Match with check-in moods
  const matches: Array<{ nutrition: number; mood: number }> = [];

  nutritionByDate.forEach((qualities, date) => {
    const checkIn = checkIns.find(c => c.date === date && c.mood);
    if (checkIn && checkIn.mood) {
      const avgNutrition = qualities.reduce((a, b) => a + b, 0) / qualities.length;
      matches.push({ nutrition: avgNutrition, mood: checkIn.mood });
    }
  });

  if (matches.length < 3) {
    return {
      metric: 'Nutrition Quality',
      correlation: 'neutral',
      strength: 0,
      insight: 'Need more data points to determine correlation'
    };
  }

  // Simple correlation calculation
  const avgNutrition = matches.reduce((sum, m) => sum + m.nutrition, 0) / matches.length;
  const avgMood = matches.reduce((sum, m) => sum + m.mood, 0) / matches.length;

  const covariance = matches.reduce((sum, m) =>
    sum + (m.nutrition - avgNutrition) * (m.mood - avgMood), 0
  ) / matches.length;

  const nutritionStdDev = Math.sqrt(
    matches.reduce((sum, m) => sum + Math.pow(m.nutrition - avgNutrition, 2), 0) / matches.length
  );
  const moodStdDev = Math.sqrt(
    matches.reduce((sum, m) => sum + Math.pow(m.mood - avgMood, 2), 0) / matches.length
  );

  const correlation = (nutritionStdDev * moodStdDev) === 0 ? 0 : covariance / (nutritionStdDev * moodStdDev);
  const strength = Math.abs(correlation);

  let insight = '';
  if (strength > 0.5 && correlation > 0) {
    insight = 'Higher nutrition quality strongly correlates with better mood';
  } else if (strength > 0.3 && correlation > 0) {
    insight = 'Better nutrition moderately correlates with improved mood';
  } else if (strength > 0.3 && correlation < 0) {
    insight = 'Poor nutrition quality may be affecting mood negatively';
  } else {
    insight = 'Nutrition quality shows weak correlation with mood';
  }

  return {
    metric: 'Nutrition Quality',
    correlation: correlation > 0.1 ? 'positive' : (correlation < -0.1 ? 'negative' : 'neutral'),
    strength,
    insight
  };
}

/**
 * Get wellness insights summary
 */
export function getWellnessInsights(
  sleepEntries: SleepEntry[],
  exerciseEntries: ExerciseEntry[],
  nutritionEntries: NutritionEntry[],
  checkIns: CheckIn[],
  cravings: Craving[]
): string[] {
  const insights: string[] = [];

  // Sleep insights
  if (sleepEntries.length > 0) {
    const recentSleep = sleepEntries.slice(-7);
    const avgHours = recentSleep.reduce((sum, e) => sum + e.hoursSlept, 0) / recentSleep.length;
    const avgQuality = recentSleep.reduce((sum, e) => sum + e.quality, 0) / recentSleep.length;

    if (avgHours < 6) {
      insights.push('You\'re averaging less than 6 hours of sleep. Aim for 7-9 hours for better recovery.');
    } else if (avgQuality < 5) {
      insights.push('Your sleep quality is low. Consider improving sleep hygiene or consulting a doctor.');
    } else if (avgHours >= 7 && avgHours <= 9 && avgQuality >= 7) {
      insights.push('Great sleep habits! You\'re getting quality rest.');
    }
  }

  // Exercise insights
  if (exerciseEntries.length > 0) {
    const recentExercise = exerciseEntries.slice(-7);
    const exerciseDays = new Set(recentExercise.map(e => e.date)).size;

    if (exerciseDays >= 3) {
      insights.push(`Excellent! You exercised ${exerciseDays} days this week.`);
    } else if (exerciseDays > 0) {
      insights.push(`You exercised ${exerciseDays} day(s) this week. Aim for 3+ for optimal benefits.`);
    }
  } else {
    insights.push('Consider adding exercise to your routine for mood and recovery benefits.');
  }

  // Nutrition insights
  if (nutritionEntries.length > 0) {
    const recentNutrition = nutritionEntries.slice(-7);
    const avgQuality = recentNutrition.reduce((sum, e) => sum + e.nutritionQuality, 0) / recentNutrition.length;
    const emotionalEating = recentNutrition.filter(e => e.emotionalEating).length;

    if (avgQuality >= 7) {
      insights.push('You\'re maintaining good nutrition habits!');
    } else if (avgQuality < 5) {
      insights.push('Your nutrition quality is low. Focus on balanced, nutritious meals.');
    }

    if (emotionalEating > 3) {
      insights.push(`Emotional eating detected in ${emotionalEating} entries. Consider mindful eating practices.`);
    }
  }

  // Craving insights
  if (cravings.length > 0) {
    const recentCravings = cravings.slice(-7);
    if (recentCravings.length > 5) {
      insights.push('High craving frequency detected. Use your coping strategies and reach out for support.');
    }
  }

  return insights;
}

/**
 * Analyze relapse trend
 */
export function getRelapseTrend(
  relapses: Relapse[]
): 'improving' | 'stable' | 'concerning' {
  if (relapses.length < 2) return 'stable';

  const sortedRelapses = [...relapses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Calculate intervals between relapses
  const intervals: number[] = [];
  for (let i = 1; i < sortedRelapses.length; i++) {
    const prevDate = new Date(sortedRelapses[i - 1]!.date);
    const currDate = new Date(sortedRelapses[i]!.date);
    const days = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    intervals.push(days);
  }

  // Compare recent intervals to older ones
  const midpoint = Math.floor(intervals.length / 2);
  const olderIntervals = intervals.slice(0, midpoint);
  const recentIntervals = intervals.slice(midpoint);

  const olderAvg = olderIntervals.reduce((a, b) => a + b, 0) / olderIntervals.length;
  const recentAvg = recentIntervals.reduce((a, b) => a + b, 0) / recentIntervals.length;

  if (recentAvg > olderAvg * 1.5) return 'improving';
  if (recentAvg < olderAvg * 0.6) return 'concerning';
  return 'stable';
}

/**
 * Get most effective coping strategies
 */
export function getMostEffectiveCopingStrategies(
  cravings: Craving[]
): Array<{ strategy: string; useCount: number; successRate: number }> {
  const strategyStats = new Map<string, { total: number; successful: number }>();

  cravings.forEach(craving => {
    if (craving.copingStrategy) {
      const stats = strategyStats.get(craving.copingStrategy) || { total: 0, successful: 0 };
      stats.total++;
      if (craving.outcome === 'successfully-resisted') {
        stats.successful++;
      }
      strategyStats.set(craving.copingStrategy, stats);
    }
  });

  const results = Array.from(strategyStats.entries())
    .map(([strategy, stats]) => ({
      strategy,
      useCount: stats.total,
      successRate: (stats.successful / stats.total) * 100
    }))
    .sort((a, b) => b.successRate - a.successRate || b.useCount - a.useCount);

  return results.slice(0, 5); // Top 5
}
