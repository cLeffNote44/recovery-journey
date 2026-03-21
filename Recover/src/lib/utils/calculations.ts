/**
 * Calculation Utilities
 *
 * Pure calculation functions for recovery metrics and statistics
 */

import type { CheckIn, Badge, Craving, Relapse, CleanPeriod } from '@/types/app';

/**
 * Calculate number of days sober from a starting date
 */
export function calculateDaysSober(sobrietyDate: string): number {
  const start = new Date(sobrietyDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate current check-in streak
 */
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

/**
 * Calculate progress towards a badge
 */
export function calculateBadgeProgress(
  badges: Badge[],
  badgeId: string,
  currentCount: number
): { earned: boolean; progress: number } {
  const badge = badges.find(b => b.id === badgeId);
  if (!badge) return { earned: false, progress: 0 };

  const earned = badge.earnedDate !== undefined;
  const progress = Math.min((currentCount / badge.requirement) * 100, 100);

  return { earned, progress };
}

/**
 * Calculate total savings from recovery
 */
export function calculateTotalSavings(daysSober: number, costPerDay: number): number {
  return daysSober * costPerDay;
}

/**
 * Calculate progress towards savings goal
 */
export function getSavingsProgress(totalSavings: number, goalAmount: number): number {
  return goalAmount > 0 ? Math.min((totalSavings / goalAmount) * 100, 100) : 0;
}

/**
 * Calculate total sober days in current year
 */
export function calculateTotalSoberDaysThisYear(checkIns: CheckIn[]): number {
  const currentYear = new Date().getFullYear();

  return checkIns.filter(checkIn => {
    const checkInDate = new Date(checkIn.date);
    return checkInDate.getFullYear() === currentYear;
  }).length;
}

/**
 * Calculate total recovery days including before relapse
 */
export function calculateTotalRecoveryDays(
  sobrietyDate: string,
  cleanPeriods: CleanPeriod[]
): number {
  let totalDays = 0;

  // Add days from completed clean periods
  for (const period of cleanPeriods) {
    if (period.endDate) {
      const start = new Date(period.startDate);
      const end = new Date(period.endDate);
      const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      totalDays += days;
    }
  }

  // Add current clean period
  const currentPeriod = cleanPeriods.find(p => !p.endDate);
  if (currentPeriod) {
    totalDays += calculateDaysSober(currentPeriod.startDate);
  } else {
    // Fallback to sobriety date if no clean periods
    totalDays += calculateDaysSober(sobrietyDate);
  }

  return totalDays;
}

/**
 * Calculate average time between relapses
 */
export function calculateAverageTimeBetweenRelapses(
  relapses: Relapse[]
): number | null {
  if (relapses.length < 2) return null;

  const sortedRelapses = [...relapses].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let totalDays = 0;
  for (let i = 1; i < sortedRelapses.length; i++) {
    const prevDate = new Date(sortedRelapses[i - 1]!.date);
    const currDate = new Date(sortedRelapses[i]!.date);
    const days = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
    totalDays += days;
  }

  return Math.round(totalDays / (sortedRelapses.length - 1));
}

/**
 * Calculate success rate (clean days vs. relapse days)
 */
export function calculateSuccessRate(
  totalRecoveryDays: number,
  relapses: Relapse[]
): number {
  if (totalRecoveryDays === 0) return 100;

  const relapseDays = relapses.length;
  const cleanDays = totalRecoveryDays - relapseDays;

  return Math.round((cleanDays / totalRecoveryDays) * 100);
}

/**
 * Calculate how many days were clean before a relapse
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
 * Calculate wellness score from multiple factors
 */
export function calculateWellnessScore(
  mood: number,
  sleepQuality: number,
  exerciseMinutes: number,
  cravingLevel: number
): number {
  // Weight factors
  const moodWeight = 0.35;
  const sleepWeight = 0.25;
  const exerciseWeight = 0.20;
  const cravingWeight = 0.20; // Inverse - lower is better

  // Normalize exercise (0-60 min = 0-10 scale)
  const normalizedExercise = Math.min(exerciseMinutes / 6, 10);

  // Invert craving level (higher craving = lower score)
  const invertedCraving = 10 - cravingLevel;

  // Calculate weighted score
  const score = (
    (mood * moodWeight) +
    (sleepQuality * sleepWeight) +
    (normalizedExercise * exerciseWeight) +
    (invertedCraving * cravingWeight)
  );

  return Math.round(score * 10) / 10; // Round to 1 decimal
}
