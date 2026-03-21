/**
 * Store Migration Utility
 *
 * Migrates data from old AppContext storage to new Zustand stores
 */

import { storage } from '@/lib/storage';
import { useRecoveryStore } from './useRecoveryStore';
import { useJournalStore } from './useJournalStore';
import { useActivitiesStore } from './useActivitiesStore';
import { useSettingsStore } from './useSettingsStore';
import { useQuotesStore } from './useQuotesStore';

const OLD_STORAGE_KEY = 'recovery_journey_data';
const MIGRATION_FLAG = 'zustand_migration_completed';

/**
 * Check if migration has already been completed
 */
export function isMigrationCompleted(): boolean {
  return localStorage.getItem(MIGRATION_FLAG) === 'true';
}

/**
 * Mark migration as completed
 */
export function markMigrationCompleted(): void {
  localStorage.setItem(MIGRATION_FLAG, 'true');
}

/**
 * Migrate data from old AppContext storage to new Zustand stores
 */
export async function migrateToZustand(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Check if migration already completed
    if (isMigrationCompleted()) {
      return { success: true };
    }

    // Load old data
    const stored = await storage.getItem(OLD_STORAGE_KEY);
    if (!stored) {
      markMigrationCompleted();
      return { success: true };
    }

    const oldData = JSON.parse(stored);

    // Migrate to Recovery Store
    const recoveryStore = useRecoveryStore.getState();
    recoveryStore.setRecoveryStartDate(oldData.recoveryStartDate || oldData.sobrietyDate || new Date().toISOString().split('T')[0]);
    recoveryStore.setSobrietyDate(oldData.sobrietyDate || new Date().toISOString().split('T')[0]);
    recoveryStore.setSetbacks(oldData.setbacks || []);
    recoveryStore.setReasonsForSobriety(oldData.reasonsForSobriety || []);
    recoveryStore.setUnlockedBadges(oldData.unlockedBadges || []);
    recoveryStore.setCostPerDay(oldData.costPerDay || 0);
    recoveryStore.setSavingsGoal(oldData.savingsGoal || '');
    recoveryStore.setSavingsGoalAmount(oldData.savingsGoalAmount || 0);
    recoveryStore.setCelebrationsEnabled(oldData.celebrationsEnabled !== undefined ? oldData.celebrationsEnabled : true);

    // Migrate to Journal Store
    const journalStore = useJournalStore.getState();
    journalStore.setCheckIns(oldData.checkIns || []);
    journalStore.setGratitude(oldData.gratitude || []);
    journalStore.setGrowthLogs(oldData.growthLogs || []);

    // Migrate to Activities Store
    const activitiesStore = useActivitiesStore.getState();
    activitiesStore.setMeetings(oldData.meetings || []);
    activitiesStore.setMeditations(oldData.meditations || []);
    activitiesStore.setCravings(oldData.cravings || []);
    activitiesStore.setChallenges(oldData.challenges || []);
    activitiesStore.setEvents(oldData.events || []);

    // Migrate to Settings Store
    const settingsStore = useSettingsStore.getState();
    settingsStore.setDarkMode(oldData.darkMode || false);
    settingsStore.setNotificationSettings(oldData.notificationSettings || {
      enabled: false,
      dailyReminderTime: '09:00',
      streakReminders: true,
      meetingReminders: true,
      milestoneNotifications: true,
    });
    settingsStore.setOnboardingCompleted(oldData.onboardingCompleted || false);
    settingsStore.setGoals(oldData.goals || []);
    settingsStore.setGoalProgress(oldData.goalProgress || []);
    settingsStore.setContacts(oldData.contacts || []);
    settingsStore.setRelapsePlan(oldData.relapsePlan || {
      warningSigns: [],
      highRiskSituations: [],
      greenActions: [],
      yellowActions: [],
      redActions: [],
    });
    settingsStore.setSkillBuilding(oldData.skillBuilding || {
      mindfulnessChallenge: {
        currentDay: 0,
        startDate: new Date().toISOString().split('T')[0],
        completedDays: [],
        notes: {},
      },
      triggerExercises: [],
      connectionPrompts: [],
      copingSkillUsage: [],
      breathingExercises: [],
      values: [],
      valuesReflections: [],
      selfCompassionEntries: [],
    });

    // Migrate to Quotes Store
    const quotesStore = useQuotesStore.getState();
    quotesStore.setFavoriteQuotes(oldData.favoriteQuotes || []);
    quotesStore.setCustomQuotes(oldData.customQuotes || []);

    // Mark migration as completed
    markMigrationCompleted();

    return { success: true };
  } catch (error) {
    console.error('[Store Migration] Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Reset migration flag (for testing only)
 */
export function resetMigration(): void {
  localStorage.removeItem(MIGRATION_FLAG);
}
