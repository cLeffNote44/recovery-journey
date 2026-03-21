import { CheckIn, Badge, SleepEntry, ExerciseEntry, NutritionEntry, Craving, Relapse, CleanPeriod, AppData, TWELVE_STEPS } from '@/types/app';

export function calculateDaysSober(sobrietyDate: string): number {
  const start = new Date(sobrietyDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateStreak(checkIns: CheckIn[]): number {
  if (!checkIns || checkIns.length === 0) return 0;

  const sortedCheckIns = [...checkIns].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const checkIn of sortedCheckIns) {
    // Parse date as local date (YYYY-MM-DD) to avoid timezone issues
    const parts = checkIn.date.split('-');
    const checkInDate = new Date(
      parseInt(parts[0]!),
      parseInt(parts[1]!) - 1,
      parseInt(parts[2]!)
    );
    checkInDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }

  return streak;
}

export function getMoodTrend(checkIns: CheckIn[]): 'improving' | 'declining' | 'stable' {
  if (!checkIns || checkIns.length < 2) return 'stable';
  
  const recentCheckIns = checkIns
    .filter(c => c.mood)
    .slice(-7)
    .map(c => c.mood!);
  
  if (recentCheckIns.length < 2) return 'stable';
  
  const avgRecent = recentCheckIns.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, recentCheckIns.length);
  const avgPrevious = recentCheckIns.slice(0, -3).reduce((a, b) => a + b, 0) / Math.max(1, recentCheckIns.length - 3);
  
  if (avgRecent > avgPrevious + 0.5) return 'improving';
  if (avgRecent < avgPrevious - 0.5) return 'declining';
  return 'stable';
}

export function getMilestone(days: number): { text: string; color: string } {
  if (days >= 365) {
    const years = Math.floor(days / 365);
    return { text: `${years} Year${years > 1 ? 's' : ''}`, color: 'from-purple-500 to-purple-600' };
  }
  if (days >= 180) return { text: '6 Months', color: 'from-blue-500 to-blue-600' };
  if (days >= 90) return { text: '90 Days', color: 'from-green-500 to-green-600' };
  if (days >= 30) return { text: '30 Days', color: 'from-orange-500 to-orange-600' };
  if (days >= 7) return { text: '1 Week', color: 'from-red-500 to-red-600' };
  return { text: 'Starting Strong', color: 'from-pink-500 to-pink-600' };
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function getBreathingPhase(time: number): { phase: string; color: string; instruction: string } {
  const cycle = time % 14; // 4 in + 4 hold + 6 out
  if (cycle >= 10) return { phase: 'Inhale', color: 'bg-blue-500', instruction: '4 seconds - Breathe in slowly' };
  if (cycle >= 6) return { phase: 'Hold', color: 'bg-yellow-500', instruction: '4 seconds - Hold your breath' };
  return { phase: 'Exhale', color: 'bg-green-500', instruction: '6 seconds - Breathe out slowly' };
}

export function calculateBadgeProgress(
  badge: Badge,
  data: {
    daysSober: number;
    checkIns: CheckIn[];
    meditations: any[];
    cravings: any[];
    meetings: any[];
    gratitude: any[];
  }
): number {
  const { daysSober, checkIns, meditations, cravings, meetings, gratitude } = data;
  
  let current = 0;
  if (!badge.type) {
    current = daysSober;
  } else if (badge.type === 'checkins') {
    current = checkIns?.length || 0;
  } else if (badge.type === 'meditations') {
    current = meditations?.length || 0;
  } else if (badge.type === 'cravings') {
    current = cravings?.filter(c => c.overcame).length || 0;
  } else if (badge.type === 'meetings') {
    current = meetings?.length || 0;
  } else if (badge.type === 'gratitude') {
    current = gratitude?.length || 0;
  } else if (badge.type === 'streak') {
    current = calculateStreak(checkIns);
  }
  
  return Math.min((current / badge.requirement) * 100, 100);
}

export function calculateTotalSavings(daysSober: number, costPerDay: number): number {
  return daysSober * costPerDay;
}

export function getSavingsProgress(totalSavings: number, goalAmount: number): number {
  if (!goalAmount) return 0;
  return Math.min((totalSavings / goalAmount) * 100, 100);
}

export function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(date: string): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
}

export function getTotalMeditationMinutes(meditations: any[]): number {
  if (!meditations || meditations.length === 0) return 0;
  return meditations.reduce((total, m) => total + (m.duration || 0), 0);
}

/**
 * Calculate total sober days this year (cumulative, doesn't reset on relapse)
 * This counts all unique days where the user has checked in during the current year
 */
export function calculateTotalSoberDaysThisYear(checkIns: CheckIn[]): number {
  if (!checkIns || checkIns.length === 0) return 0;

  const currentYear = new Date().getFullYear();
  const uniqueDays = new Set<string>();

  checkIns.forEach(checkIn => {
    const checkInDate = new Date(checkIn.date);
    if (checkInDate.getFullYear() === currentYear) {
      uniqueDays.add(checkIn.date);
    }
  });

  return uniqueDays.size;
}

/**
 * Wellness Correlation Analysis Functions
 * Calculate correlations between wellness metrics (sleep, exercise, nutrition) and mood/cravings
 */

export interface WellnessCorrelation {
  metric: string;
  correlation: 'positive' | 'negative' | 'neutral';
  strength: number; // 0-1
  insight: string;
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
 * Calculate overall wellness score based on sleep, exercise, and nutrition
 */
export function calculateWellnessScore(
  sleepEntries: SleepEntry[],
  exerciseEntries: ExerciseEntry[],
  nutritionEntries: NutritionEntry[],
  days: number = 7
): number {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);
  const cutoffString = cutoffDate.toISOString().split('T')[0];

  // Filter to recent entries
  const recentSleep = sleepEntries.filter(e => e.date >= cutoffString);
  const recentExercise = exerciseEntries.filter(e => e.date >= cutoffString);
  const recentNutrition = nutritionEntries.filter(e => e.date >= cutoffString);

  let score = 0;
  let components = 0;

  // Sleep score (0-33)
  if (recentSleep.length > 0) {
    const avgSleepQuality = recentSleep.reduce((sum, e) => sum + e.quality, 0) / recentSleep.length;
    const avgSleepHours = recentSleep.reduce((sum, e) => sum + e.hoursSlept, 0) / recentSleep.length;

    // Quality score
    score += (avgSleepQuality / 10) * 20;

    // Hours score (optimal 7-9 hours)
    const hoursScore = avgSleepHours >= 7 && avgSleepHours <= 9 ? 13 :
                       avgSleepHours >= 6 && avgSleepHours <= 10 ? 10 : 5;
    score += hoursScore;

    components++;
  }

  // Exercise score (0-33)
  if (recentExercise.length > 0) {
    const exerciseDays = new Set(recentExercise.map(e => e.date)).size;
    const avgIntensity = recentExercise.reduce((sum, e) => sum + e.intensity, 0) / recentExercise.length;

    // Frequency score (3+ days per week is good)
    const frequencyScore = Math.min((exerciseDays / 3) * 20, 20);
    score += frequencyScore;

    // Intensity score
    score += (avgIntensity / 10) * 13;

    components++;
  }

  // Nutrition score (0-34)
  if (recentNutrition.length > 0) {
    const avgQuality = recentNutrition.reduce((sum, e) => sum + e.nutritionQuality, 0) / recentNutrition.length;
    const mealsPerDay = recentNutrition.length / days;
    const emotionalEatingRatio = recentNutrition.filter(e => e.emotionalEating).length / recentNutrition.length;

    // Quality score
    score += (avgQuality / 10) * 20;

    // Meal frequency score (3-4 meals/day is good)
    const frequencyScore = mealsPerDay >= 3 && mealsPerDay <= 4 ? 7 : 3;
    score += frequencyScore;

    // Emotional eating penalty
    score += Math.max(7 - (emotionalEatingRatio * 14), 0);

    components++;
  }

  // Normalize to 0-100
  if (components === 0) return 0;
  return Math.round(score / components * (100 / 33));
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
      insights.push('You\'re maintaining good nutrition quality!');
    } else if (avgQuality < 5) {
      insights.push('Your nutrition quality could be improved. Focus on whole, nutritious foods.');
    }

    if (emotionalEating > recentNutrition.length * 0.3) {
      insights.push('Notice: Frequent emotional eating detected. Consider mindful eating practices.');
    }
  }

  return insights;
}

/**
 * Relapse Analysis Functions
 * Calculate statistics and insights from relapse tracking data
 */

/**
 * Calculate total recovery days across all clean periods
 */
export function calculateTotalRecoveryDays(
  cleanPeriods: CleanPeriod[],
  currentSobrietyDate: string
): number {
  let total = 0;

  // Add completed periods
  cleanPeriods.forEach(period => {
    if (period.endDate) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      total += Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
  });

  // Add current period
  const currentPeriod = cleanPeriods.find(p => !p.endDate);
  if (currentPeriod) {
    total += calculateDaysSober(currentPeriod.startDate);
  } else {
    total += calculateDaysSober(currentSobrietyDate);
  }

  return total;
}

/**
 * Calculate average time between relapses
 */
export function calculateAverageTimeBetweenRelapses(
  relapses: Relapse[]
): number | null {
  if (relapses.length < 2) return null;

  const sortedRelapses = [...relapses].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalDays = 0;
  for (let i = 1; i < sortedRelapses.length; i++) {
    const prevDate = new Date(sortedRelapses[i - 1]!.date);
    const currDate = new Date(sortedRelapses[i]!.date);
    totalDays += Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  return Math.floor(totalDays / (sortedRelapses.length - 1));
}

/**
 * Get relapse trend (improving, stable, or declining)
 */
export function getRelapseTrend(
  relapses: Relapse[]
): 'improving' | 'stable' | 'declining' | 'no-data' {
  if (relapses.length < 2) return 'no-data';

  const sortedRelapses = [...relapses].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Compare first half vs second half
  const midpoint = Math.floor(sortedRelapses.length / 2);
  const firstHalf = sortedRelapses.slice(0, midpoint);
  const secondHalf = sortedRelapses.slice(midpoint);

  // Calculate average days clean before relapse for each half
  const firstHalfAvg = firstHalf.reduce((sum, r) => sum + r.daysCleanBefore, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, r) => sum + r.daysCleanBefore, 0) / secondHalf.length;

  // Also consider frequency (time between relapses)
  const firstHalfFrequency = calculateAverageTimeBetweenRelapses(firstHalf) || 0;
  const secondHalfFrequency = calculateAverageTimeBetweenRelapses(secondHalf) || 0;

  // Improving: longer clean periods and/or less frequent relapses
  if (secondHalfAvg > firstHalfAvg * 1.2 || secondHalfFrequency > firstHalfFrequency * 1.2) {
    return 'improving';
  }

  // Declining: shorter clean periods and/or more frequent relapses
  if (secondHalfAvg < firstHalfAvg * 0.8 || secondHalfFrequency < firstHalfFrequency * 0.8) {
    return 'declining';
  }

  return 'stable';
}

/**
 * Get most effective coping strategies based on days clean before relapse
 */
export function getMostEffectiveCopingStrategies(
  relapses: Relapse[]
): Array<{ support: string; avgDaysClean: number }> {
  if (relapses.length === 0) return [];

  const supportStats = new Map<string, { total: number; count: number }>();

  relapses.forEach(relapse => {
    relapse.supportUsed.forEach(support => {
      const current = supportStats.get(support) || { total: 0, count: 0 };
      supportStats.set(support, {
        total: current.total + relapse.daysCleanBefore,
        count: current.count + 1
      });
    });
  });

  return Array.from(supportStats.entries())
    .map(([support, stats]) => ({
      support,
      avgDaysClean: Math.round(stats.total / stats.count)
    }))
    .sort((a, b) => b.avgDaysClean - a.avgDaysClean);
}

/**
 * Calculate relapse success rate (percentage of total time spent sober)
 */
export function calculateSuccessRate(
  totalRecoveryDays: number,
  startDate: string
): number {
  const start = new Date(startDate);
  const today = new Date();
  const totalDaysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (totalDaysSinceStart === 0) return 100;

  return Math.round((totalRecoveryDays / totalDaysSinceStart) * 100);
}

/**
 * Get encouraging message based on progress
 */
export function getRecoveryEncouragement(
  currentDays: number,
  totalRecoveryDays: number,
  relapseCount: number
): string {
  if (relapseCount === 0 && currentDays >= 30) {
    return "You're doing amazing! Keep up the incredible work.";
  }

  if (relapseCount === 0 && currentDays >= 7) {
    return "Great start! You're building a strong foundation.";
  }

  const trend = currentDays >= 30 ? 'strong' : currentDays >= 7 ? 'good' : 'fresh';

  if (relapseCount > 0) {
    if (currentDays > 90) {
      return `${currentDays} days is a major achievement! Your persistence is paying off.`;
    } else if (currentDays > 30) {
      return `You've made it past 30 days! Recovery is about progress, and you're making it.`;
    } else if (currentDays > 7) {
      return `Every day counts. You're learning and growing stronger.`;
    } else {
      return "Each day is a new opportunity. You're showing courage by continuing.";
    }
  }

  return `${totalRecoveryDays} total recovery days - every single one matters!`;
}

// ============================================================================
// DATA BACKUP & RESTORE UTILITIES
// ============================================================================

/**
 * Generate a backup filename with timestamp
 */
export function generateBackupFilename(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const timeStr = now.toTimeString().split(' ')[0]?.replace(/:/g, '-'); // HH-MM-SS
  return `recover-backup-${dateStr}-${timeStr}.json`;
}

/**
 * Export app data to JSON file
 */
export function exportBackup(data: AppData): void {
  const backup = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    appName: 'Recover',
    data: data
  };

  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = generateBackupFilename();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validate backup data structure
 */
export function validateBackupData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data) {
    errors.push('Backup file is empty or corrupted');
    return { valid: false, errors };
  }

  // Check if it's a Recover backup
  if (data.appName !== 'Recover') {
    errors.push('This does not appear to be a valid Recover backup file');
  }

  // Check version (for future compatibility)
  if (!data.version) {
    errors.push('Backup file is missing version information');
  }

  // Check if data object exists
  if (!data.data) {
    errors.push('Backup file is missing data');
    return { valid: false, errors };
  }

  // Validate critical fields
  const requiredFields = ['sobrietyDate', 'checkIns', 'meetings', 'cravings'];
  for (const field of requiredFields) {
    if (!(field in data.data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate arrays are actually arrays
  const arrayFields = [
    'checkIns', 'meetings', 'growthLogs', 'challenges', 'gratitude',
    'contacts', 'events', 'cravings', 'meditations', 'reasonsForSobriety',
    'goals', 'goalProgress', 'customQuotes', 'sleepEntries', 'medications',
    'medicationLogs', 'exerciseEntries', 'nutritionEntries', 'relapses', 'cleanPeriods'
  ];

  for (const field of arrayFields) {
    if (data.data[field] && !Array.isArray(data.data[field])) {
      errors.push(`Field ${field} should be an array`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Import backup data from JSON file
 */
export function importBackup(
  file: File,
  onSuccess: (data: AppData) => void,
  onError: (errors: string[]) => void
): void {
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      const content = e.target?.result as string;
      const backup = JSON.parse(content);

      // Validate backup
      const validation = validateBackupData(backup);
      if (!validation.valid) {
        onError(validation.errors);
        return;
      }

      // Extract data
      const importedData: AppData = backup.data;

      // Additional safety: ensure all required arrays exist
      const safeData: AppData = {
        userProfile: importedData.userProfile || null,
        sobrietyDate: importedData.sobrietyDate || new Date().toISOString().split('T')[0]!,
        checkIns: importedData.checkIns || [],
        meetings: importedData.meetings || [],
        growthLogs: importedData.growthLogs || [],
        challenges: importedData.challenges || [],
        gratitude: importedData.gratitude || [],
        contacts: importedData.contacts || [],
        events: importedData.events || [],
        cravings: importedData.cravings || [],
        meditations: importedData.meditations || [],
        relapsePlan: importedData.relapsePlan || {
          warningSigns: [],
          highRiskSituations: [],
          greenActions: [],
          yellowActions: [],
          redActions: []
        },
        darkMode: importedData.darkMode ?? false,
        costPerDay: importedData.costPerDay || 0,
        savingsGoal: importedData.savingsGoal || '',
        savingsGoalAmount: importedData.savingsGoalAmount || 0,
        reasonsForSobriety: importedData.reasonsForSobriety || [],
        unlockedBadges: importedData.unlockedBadges || [],
        notificationSettings: importedData.notificationSettings || {
          enabled: false,
          dailyReminderTime: '09:00',
          streakReminders: true,
          meetingReminders: true,
          milestoneNotifications: true
        },
        onboardingCompleted: importedData.onboardingCompleted ?? false,
        celebrationsEnabled: importedData.celebrationsEnabled ?? true,
        goals: importedData.goals || [],
        goalProgress: importedData.goalProgress || [],
        customQuotes: importedData.customQuotes || [],
        favoriteQuoteIds: importedData.favoriteQuoteIds || [],
        quoteSettings: importedData.quoteSettings || {
          refreshFrequency: 'daily',
          lastRefresh: new Date().toISOString(),
          disabledQuoteIds: []
        },
        skillBuilding: importedData.skillBuilding || {
          mindfulnessChallenge: {
            currentDay: 0,
            completedDays: [],
            notes: {}
          },
          copingSkillUsage: [],
          triggerExercises: [],
          connectionPrompts: [],
          valuesClarification: [],
          selfCompassion: []
        },
        sleepEntries: importedData.sleepEntries || [],
        medications: importedData.medications || [],
        medicationLogs: importedData.medicationLogs || [],
        exerciseEntries: importedData.exerciseEntries || [],
        nutritionEntries: importedData.nutritionEntries || [],
        relapses: importedData.relapses || [],
        cleanPeriods: importedData.cleanPeriods || [],
        stepWork: importedData.stepWork || {
          currentStep: 1,
          steps: TWELVE_STEPS.map((step) => ({
            stepNumber: step.number,
            status: 'not-started' as const,
            notes: '',
            reflections: [],
            exercises: []
          })),
          sponsorNotes: '',
          lastReviewDate: undefined
        }
      };

      onSuccess(safeData);
    } catch (error) {
      onError(['Failed to parse backup file. Please ensure it is a valid JSON file.']);
    }
  };

  reader.onerror = () => {
    onError(['Failed to read backup file. Please try again.']);
  };

  reader.readAsText(file);
}

/**
 * Create an automatic backup in localStorage
 */
export function createAutoBackup(data: AppData): void {
  try {
    const backup = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      appName: 'Recover',
      data: data
    };

    // Store in localStorage with timestamp
    const backupKey = `recover_auto_backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(backup));

    // Keep only the last 5 auto backups
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('recover_auto_backup_'));
    if (allKeys.length > 5) {
      // Sort by timestamp (oldest first)
      allKeys.sort();
      // Remove oldest backups
      for (let i = 0; i < allKeys.length - 5; i++) {
        localStorage.removeItem(allKeys[i]!);
      }
    }

    // Update last backup timestamp
    localStorage.setItem('recover_last_backup', new Date().toISOString());
  } catch (error) {
    console.error('Failed to create auto backup:', error);
  }
}

/**
 * Get list of auto backups from localStorage
 */
export function getAutoBackups(): Array<{ key: string; date: string }> {
  const backups: Array<{ key: string; date: string }> = [];

  try {
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith('recover_auto_backup_'));

    for (const key of allKeys) {
      const backup = localStorage.getItem(key);
      if (backup) {
        try {
          const parsed = JSON.parse(backup);
          backups.push({
            key,
            date: parsed.exportDate || 'Unknown date'
          });
        } catch {
          // Skip invalid backups
        }
      }
    }

    // Sort by date (newest first)
    backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Failed to get auto backups:', error);
  }

  return backups;
}

/**
 * Restore from auto backup
 */
export function restoreAutoBackup(
  key: string,
  onSuccess: (data: AppData) => void,
  onError: (errors: string[]) => void
): void {
  try {
    const backup = localStorage.getItem(key);
    if (!backup) {
      onError(['Backup not found']);
      return;
    }

    const parsed = JSON.parse(backup);
    const validation = validateBackupData(parsed);

    if (!validation.valid) {
      onError(validation.errors);
      return;
    }

    onSuccess(parsed.data);
  } catch (error) {
    onError(['Failed to restore backup']);
  }
}

/**
 * Check if backup reminder should be shown (if no backup in 7 days)
 */
export function shouldShowBackupReminder(): boolean {
  const lastBackup = localStorage.getItem('recover_last_backup');
  if (!lastBackup) return true;

  try {
    const lastBackupDate = new Date(lastBackup);
    const daysSinceBackup = Math.floor(
      (Date.now() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceBackup >= 7;
  } catch {
    return true;
  }
}

/**
 * Dismiss backup reminder for 7 days
 */
export function dismissBackupReminder(): void {
  localStorage.setItem('recover_backup_reminder_dismissed', new Date().toISOString());
}

/**
 * Check if backup reminder was dismissed recently
 */
export function isBackupReminderDismissed(): boolean {
  const dismissed = localStorage.getItem('recover_backup_reminder_dismissed');
  if (!dismissed) return false;

  try {
    const dismissedDate = new Date(dismissed);
    const daysSinceDismiss = Math.floor(
      (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceDismiss < 7;
  } catch {
    return false;
  }
}

/**
 * Calculate how many days were clean before a relapse
 *
 * Finds the most recent clean period before the relapse date and calculates
 * the number of days from the start of that period to the relapse.
 *
 * @param relapseDate - The date of the relapse (YYYY-MM-DD)
 * @param cleanPeriods - Array of clean periods
 * @param sobrietyDate - Original sobriety date as fallback
 * @returns Number of days clean before the relapse
 */
export function calculateDaysCleanBefore(
  relapseDate: string,
  cleanPeriods: CleanPeriod[],
  sobrietyDate: string
): number {
  const mostRecentPeriod = cleanPeriods
    .filter(p => !p.endDate || p.endDate <= relapseDate)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0];

  if (!mostRecentPeriod) {
    return calculateDaysSober(sobrietyDate);
  }

  const start = new Date(mostRecentPeriod.startDate);
  const end = new Date(relapseDate);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Create a relapse entry object from form data
 *
 * @param formData - Relapse form data
 * @param daysCleanBefore - Number of days clean before this relapse
 * @returns Complete relapse object
 */
export function createRelapseEntry(
  formData: {
    date: string;
    time?: string;
    substance?: string;
    triggers: string;
    circumstances: string;
    emotions: string;
    thoughts: string;
    consequences: string;
    lessonsLearned: string;
    preventionPlan: string;
    supportUsed: string;
    severity: 'minor' | 'moderate' | 'severe';
    isPrivate: boolean;
  },
  daysCleanBefore: number
): Relapse {
  return {
    id: Date.now(),
    date: formData.date,
    time: formData.time || undefined,
    substance: formData.substance || undefined,
    triggers: formData.triggers,
    circumstances: formData.circumstances,
    emotions: formData.emotions,
    thoughts: formData.thoughts,
    consequences: formData.consequences,
    lessonsLearned: formData.lessonsLearned,
    preventionPlan: formData.preventionPlan,
    supportUsed: formData.supportUsed,
    severity: formData.severity,
    daysCleanBefore,
    isPrivate: formData.isPrivate
  };
}

/**
 * Process the impact of a relapse on clean periods
 *
 * Ends the current clean period at the relapse date and creates a new clean period
 * starting the day after the relapse.
 *
 * @param relapseDate - The date of the relapse (YYYY-MM-DD)
 * @param relapseId - ID of the relapse entry
 * @param cleanPeriods - Current array of clean periods
 * @returns Updated array of clean periods
 */
export function processRelapseImpact(
  relapseDate: string,
  relapseId: number,
  cleanPeriods: CleanPeriod[]
): CleanPeriod[] {
  const updatedPeriods = [...cleanPeriods];

  // End the current clean period
  const currentPeriod = updatedPeriods.find(p => !p.endDate);
  if (currentPeriod) {
    const index = updatedPeriods.findIndex(p => p.id === currentPeriod.id);
    updatedPeriods[index] = {
      ...currentPeriod,
      endDate: relapseDate,
      relapseId
    };
  }

  // Start a new clean period from tomorrow
  const tomorrow = new Date(relapseDate);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const newPeriod: CleanPeriod = {
    id: Date.now() + 1,
    startDate: tomorrow.toISOString().split('T')[0]!
  };
  updatedPeriods.push(newPeriod);

  return updatedPeriods;
}

