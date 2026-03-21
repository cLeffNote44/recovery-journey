/**
 * Badge System Utilities
 * Calculates earned badges based on user progress
 */

import { Badge } from '@/types/app';
import { BADGES } from './constants';
import { calculateDaysSober, calculateStreak } from './utils-app';
import type { CheckIn, Meditation, Meeting, Craving, Gratitude, GrowthLog, Challenge } from '@/types/app';

export interface BadgeProgress {
  badge: Badge;
  isUnlocked: boolean;
  progress: number;
  progressText: string;
  earnedDate?: string;
}

/**
 * Calculate all badges and their progress
 */
export function calculateBadgeProgress(data: {
  sobrietyDate: string;
  checkIns: CheckIn[];
  meditations: Meditation[];
  meetings: Meeting[];
  cravings: Craving[];
  gratitude: Gratitude[];
  growthLogs: GrowthLog[];
  challenges: Challenge[];
  unlockedBadges: string[];
}): BadgeProgress[] {
  const daysSober = calculateDaysSober(data.sobrietyDate);
  const streak = calculateStreak(data.checkIns);
  const cravingsOvercome = data.cravings.filter(c => c.overcame).length;

  return BADGES.map(badge => {
    let currentValue = 0;
    let isUnlocked = false;

    // Calculate current value based on badge type
    if (!badge.type) {
      // Recovery milestone badges (days sober)
      currentValue = daysSober;
    } else {
      switch (badge.type) {
        case 'checkins':
          currentValue = data.checkIns.length;
          break;
        case 'meditations':
          currentValue = data.meditations.length;
          break;
        case 'meetings':
          currentValue = data.meetings.length;
          break;
        case 'cravings':
          currentValue = cravingsOvercome;
          break;
        case 'gratitude':
          currentValue = data.gratitude.length;
          break;
        case 'growth-logs':
          currentValue = data.growthLogs.length;
          break;
        case 'challenges':
          currentValue = data.challenges.length;
          break;
        case 'streak':
          currentValue = streak;
          break;
      }
    }

    // Check if badge is unlocked
    isUnlocked = currentValue >= badge.requirement;

    // Special badges need custom logic
    if (badge.id === 'earlybird' || badge.id === 'nightowl' || badge.id === 'perfectweek' || badge.id === 'centurion' || badge.id === 'allbadges') {
      // For now, mark these as unlocked if they're in the unlockedBadges array
      isUnlocked = data.unlockedBadges.includes(badge.id);
    }

    const progress = Math.min(100, Math.round((currentValue / badge.requirement) * 100));
    const progressText = `${currentValue}/${badge.requirement}`;

    return {
      badge,
      isUnlocked,
      progress,
      progressText,
      earnedDate: isUnlocked ? (data.unlockedBadges.includes(badge.id) ? undefined : new Date().toISOString()) : undefined
    };
  });
}

/**
 * Get only earned badges
 */
export function getEarnedBadges(badgeProgress: BadgeProgress[]): BadgeProgress[] {
  return badgeProgress.filter(bp => bp.isUnlocked);
}

/**
 * Get in-progress badges (not earned, not secret, making progress)
 */
export function getInProgressBadges(badgeProgress: BadgeProgress[]): BadgeProgress[] {
  return badgeProgress.filter(bp => !bp.isUnlocked && !bp.badge.secret && bp.progress > 0);
}

/**
 * Get locked badges (not earned, not secret, no progress)
 */
export function getLockedBadges(badgeProgress: BadgeProgress[]): BadgeProgress[] {
  return badgeProgress.filter(bp => !bp.isUnlocked && !bp.badge.secret && bp.progress === 0);
}

/**
 * Get secret badges (only show if unlocked)
 */
export function getSecretBadges(badgeProgress: BadgeProgress[]): BadgeProgress[] {
  return badgeProgress.filter(bp => bp.badge.secret && bp.isUnlocked);
}

/**
 * Get recently earned badges (last 5)
 */
export function getRecentlyEarnedBadges(badgeProgress: BadgeProgress[], limit: number = 5): BadgeProgress[] {
  return getEarnedBadges(badgeProgress)
    .sort((a, b) => {
      if (!a.earnedDate) return 1;
      if (!b.earnedDate) return -1;
      return new Date(b.earnedDate).getTime() - new Date(a.earnedDate).getTime();
    })
    .slice(0, limit);
}

/**
 * Get badge tier color
 */
export function getBadgeTierColor(tier?: string): string {
  switch (tier) {
    case 'bronze':
      return 'text-orange-600 dark:text-orange-400';
    case 'silver':
      return 'text-gray-400 dark:text-gray-300';
    case 'gold':
      return 'text-yellow-500 dark:text-yellow-400';
    case 'platinum':
      return 'text-cyan-400 dark:text-cyan-300';
    case 'diamond':
      return 'text-purple-500 dark:text-purple-400';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Get badge category color
 */
export function getBadgeCategoryColor(category?: string): string {
  switch (category) {
    case 'recovery':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'engagement':
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
    case 'wellness':
      return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
    case 'growth':
      return 'bg-pink-500/10 text-pink-600 dark:text-pink-400';
    case 'crisis':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'special':
      return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
}

/**
 * Helper function for testing badge unlocking
 * Takes simplified statistics and returns unlocked badges
 *
 * @example
 * ```typescript
 * const badges = getUnlockedBadges({
 *   daysSober: 7,
 *   checkInsCount: 7,
 *   streak: 7
 * });
 * ```
 */
export function getUnlockedBadges(stats: {
  daysSober: number;
  checkInsCount?: number;
  cravingsOvercome?: number;
  meetingsAttended?: number;
  meditationMinutes?: number;
  gratitudeCount?: number;
  growthLogsCount?: number;
  challengesCompleted?: number;
  streak?: number;
}): Badge[] {
  // Create mock data objects from statistics
  const mockDate = new Date();
  mockDate.setDate(mockDate.getDate() - stats.daysSober);
  const sobrietyDate = mockDate.toISOString().split('T')[0];

  // Create minimal data arrays for badge calculation
  const checkIns: CheckIn[] = Array.from({ length: stats.checkInsCount || 0 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    mood: 5,
  }));

  const cravings: Craving[] = Array.from({ length: stats.cravingsOvercome || 0 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    intensity: 5,
    trigger: 'test',
    overcame: true,
  }));

  const meetings: Meeting[] = Array.from({ length: stats.meetingsAttended || 0 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    type: 'AA',
    notes: '',
  }));

  const meditations: Meditation[] = Array.from({ length: stats.meditationMinutes || 0 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    duration: 1, // 1 meditation = 1 minute for simplicity
    type: 'breathing',
  }));

  const gratitude: Gratitude[] = Array.from({ length: stats.gratitudeCount || 0 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    content: 'test gratitude',
  }));

  const growthLogs: GrowthLog[] = Array.from({ length: stats.growthLogsCount || 0 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    milestone: 'test milestone',
  }));

  const challenges: Challenge[] = Array.from({ length: stats.challengesCompleted || 0 }, (_, i) => ({
    id: i + 1,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    challenge: 'test challenge',
    completed: true,
  }));

  // Calculate badge progress
  const badgeProgress = calculateBadgeProgress({
    sobrietyDate,
    checkIns,
    meditations,
    meetings,
    cravings,
    gratitude,
    growthLogs,
    challenges,
    unlockedBadges: [],
  });

  // Return only the unlocked badges (just the Badge objects)
  return getEarnedBadges(badgeProgress).map(bp => bp.badge);
}
