/**
 * Utility Functions Index
 *
 * Central barrel export for all utility modules.
 * Import utilities from '@/lib/utils' for clean, organized imports.
 */

// Re-export cn function from parent utils.ts for backward compatibility
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Calculation utilities
export {
  calculateDaysSober,
  calculateStreak,
  calculateBadgeProgress,
  calculateTotalSavings,
  getSavingsProgress,
  calculateTotalSoberDaysThisYear,
  calculateTotalRecoveryDays,
  calculateAverageTimeBetweenRelapses,
  calculateSuccessRate,
  calculateDaysCleanBefore,
  calculateWellnessScore
} from './calculations';

// Formatting utilities
export {
  formatTime,
  formatDate,
  formatDateTime,
  formatCurrency,
  formatNumber,
  formatDuration,
  formatPercentage,
  formatDateRange,
  formatRelativeTime
} from './formatting';

// Analytics utilities
export {
  type WellnessCorrelation,
  getMoodTrend,
  getSleepMoodCorrelation,
  getExerciseCravingCorrelation,
  getNutritionMoodCorrelation,
  getWellnessInsights,
  getRelapseTrend,
  getMostEffectiveCopingStrategies
} from './analytics';

// Recovery utilities
export {
  getMilestone,
  getBreathingPhase,
  getTotalMeditationMinutes,
  getRecoveryEncouragement,
  createRelapseEntry,
  processRelapseImpact
} from './recovery';

// Backup utilities
export {
  generateBackupFilename,
  exportBackup,
  validateBackupData,
  importBackup,
  createAutoBackup,
  getAutoBackups,
  restoreAutoBackup,
  shouldShowBackupReminder,
  dismissBackupReminder,
  isBackupReminderDismissed
} from './backup';
