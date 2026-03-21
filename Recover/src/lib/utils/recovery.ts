/**
 * Recovery Utilities
 *
 * Recovery-specific utilities for milestones, encouragement, meditation, and relapse processing
 */

import type { Relapse, CleanPeriod } from '@/types/app';

/**
 * Get milestone for days sober
 */
export function getMilestone(days: number): { text: string; color: string } {
  if (days >= 365) return { text: '🎉 1+ Years', color: 'text-gold-500' };
  if (days >= 180) return { text: '🌟 6+ Months', color: 'text-purple-500' };
  if (days >= 90) return { text: '💪 90+ Days', color: 'text-blue-500' };
  if (days >= 30) return { text: '🔥 30+ Days', color: 'text-orange-500' };
  if (days >= 7) return { text: '🌱 1+ Week', color: 'text-green-500' };
  return { text: '⭐ Getting Started', color: 'text-gray-500' };
}

/**
 * Get breathing exercise phase for meditation timer
 */
export function getBreathingPhase(time: number): { phase: string; color: string; instruction: string } {
  const cycle = time % 10;
  if (cycle < 4) return { phase: 'Inhale', color: 'text-blue-500', instruction: 'Breathe in slowly...' };
  if (cycle < 8) return { phase: 'Exhale', color: 'text-green-500', instruction: 'Breathe out gently...' };
  return { phase: 'Hold', color: 'text-purple-500', instruction: 'Hold your breath...' };
}

/**
 * Calculate total meditation minutes
 */
export function getTotalMeditationMinutes(meditations: Array<{duration?: number}>): number {
  return meditations.reduce((total, m) => {
    const duration = m.duration || 0;
    return total + duration;
  }, 0);
}

/**
 * Get encouraging message based on recovery progress
 */
export function getRecoveryEncouragement(
  totalRecoveryDays: number,
  currentCleanDays: number,
  relapses: Relapse[]
): string {
  // If no relapses
  if (relapses.length === 0) {
    if (currentCleanDays >= 365) {
      return `${currentCleanDays} days strong! You're an inspiration.`;
    } else if (currentCleanDays >= 90) {
      return `${currentCleanDays} days! You're building an incredible foundation.`;
    } else if (currentCleanDays >= 30) {
      return `${currentCleanDays} days! The first month is huge - keep going!`;
    } else if (currentCleanDays >= 7) {
      return `${currentCleanDays} days! The first week shows real commitment.`;
    } else {
      return `${currentCleanDays} ${currentCleanDays === 1 ? 'day' : 'days'}! Every day is a victory.`;
    }
  }

  // With relapses - emphasize total recovery days
  if (currentCleanDays >= 90) {
    return `${currentCleanDays} days clean now, ${totalRecoveryDays} total recovery days. You're proving you can do this!`;
  } else if (currentCleanDays >= 30) {
    return `${currentCleanDays} days clean! ${totalRecoveryDays} total recovery days show your dedication.`;
  } else if (currentCleanDays >= 7) {
    return `${currentCleanDays} days clean. ${totalRecoveryDays} total recovery days - you're learning and growing.`;
  } else {
    return `${totalRecoveryDays} total recovery days - every single one matters. Keep going!`;
  }
}

/**
 * Create a relapse entry object from form data
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
 * Returns updated clean periods array
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
