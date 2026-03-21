/**
 * Store Migration Utility
 *
 * Migrates data from old AppContext localStorage format to new Zustand stores
 * This ensures users don't lose their data when upgrading to the new architecture
 */

import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import type { AppData } from '@/types/app';

const OLD_STORAGE_KEY = 'recovery_journey_data';
const MIGRATION_FLAG_KEY = 'zustand_migration_completed';

/**
 * Check if migration has already been completed
 */
export function isMigrationCompleted(): boolean {
  return localStorage.getItem(MIGRATION_FLAG_KEY) === 'true';
}

/**
 * Mark migration as completed
 */
function markMigrationCompleted(): void {
  localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
}

/**
 * Get old AppContext data from localStorage
 */
function getOldAppData(): AppData | null {
  try {
    const data = localStorage.getItem(OLD_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as AppData;
  } catch (error) {
    console.error('Error reading old app data:', error);
    return null;
  }
}

/**
 * Main migration function
 * Call this once on app startup before rendering any components
 */
export function migrateToZustandStores(): {
  success: boolean;
  message: string;
  dataFound: boolean;
} {
  // Check if migration already completed
  if (isMigrationCompleted()) {
    return {
      success: true,
      message: 'Migration already completed',
      dataFound: false,
    };
  }

  // Get old data
  const oldData = getOldAppData();
  if (!oldData) {
    // No old data found, mark as migrated and continue
    markMigrationCompleted();
    return {
      success: true,
      message: 'No old data found, starting fresh',
      dataFound: false,
    };
  }

  try {
    // Migrate to RecoveryStore
    const recoveryStore = useRecoveryStore.getState();
    if (oldData.sobrietyDate) recoveryStore.setSobrietyDate(oldData.sobrietyDate);
    if (oldData.relapses) recoveryStore.setRelapses(oldData.relapses);
    if (oldData.cleanPeriods) recoveryStore.setCleanPeriods(oldData.cleanPeriods);
    if (oldData.stepWork) recoveryStore.setStepWork(oldData.stepWork);
    if (oldData.reasonsForSobriety) recoveryStore.setReasonsForSobriety(oldData.reasonsForSobriety);
    if (oldData.unlockedBadges) recoveryStore.setUnlockedBadges(oldData.unlockedBadges);
    if (oldData.costPerDay !== undefined) recoveryStore.setCostPerDay(oldData.costPerDay);
    if (oldData.savingsGoal) recoveryStore.setSavingsGoal(oldData.savingsGoal);
    if (oldData.savingsGoalAmount !== undefined) recoveryStore.setSavingsGoalAmount(oldData.savingsGoalAmount);

    // Migrate to JournalStore
    const journalStore = useJournalStore.getState();
    if (oldData.checkIns) journalStore.setCheckIns(oldData.checkIns);
    if (oldData.gratitude) journalStore.setGratitude(oldData.gratitude);
    if (oldData.growthLogs) journalStore.setGrowthLogs(oldData.growthLogs);
    if (oldData.meetings) journalStore.setMeetings(oldData.meetings);
    if (oldData.meditations) journalStore.setMeditations(oldData.meditations);
    if (oldData.challenges) journalStore.setChallenges(oldData.challenges);

    // Migrate to ActivitiesStore
    const activitiesStore = useActivitiesStore.getState();
    if (oldData.cravings) activitiesStore.setCravings(oldData.cravings);
    if (oldData.events) activitiesStore.setEvents(oldData.events);

    // Migrate to SettingsStore
    const settingsStore = useSettingsStore.getState();
    if (oldData.userProfile) settingsStore.setUserProfile(oldData.userProfile);
    if (oldData.darkMode !== undefined) settingsStore.setDarkMode(oldData.darkMode);
    if (oldData.notificationSettings) settingsStore.setNotificationSettings(oldData.notificationSettings);
    if (oldData.onboardingCompleted !== undefined) settingsStore.setOnboardingCompleted(oldData.onboardingCompleted);
    if (oldData.celebrationsEnabled !== undefined) settingsStore.setCelebrationsEnabled(oldData.celebrationsEnabled);
    if (oldData.goals) settingsStore.setGoals(oldData.goals);
    if (oldData.goalProgress) settingsStore.setGoalProgress(oldData.goalProgress);
    if (oldData.contacts) settingsStore.setContacts(oldData.contacts);
    if (oldData.relapsePlan) settingsStore.setRelapsePlan(oldData.relapsePlan);
    if (oldData.skillBuilding) settingsStore.setSkillBuilding(oldData.skillBuilding);
    if (oldData.sleepEntries) settingsStore.setSleepEntries(oldData.sleepEntries);
    if (oldData.medications) settingsStore.setMedications(oldData.medications);
    if (oldData.medicationLogs) settingsStore.setMedicationLogs(oldData.medicationLogs);
    if (oldData.exerciseEntries) settingsStore.setExerciseEntries(oldData.exerciseEntries);
    if (oldData.nutritionEntries) settingsStore.setNutritionEntries(oldData.nutritionEntries);
    if (oldData.customQuotes) settingsStore.setCustomQuotes(oldData.customQuotes);
    if (oldData.favoriteQuoteIds) settingsStore.setFavoriteQuoteIds(oldData.favoriteQuoteIds);
    if (oldData.quoteSettings) settingsStore.setQuoteSettings(oldData.quoteSettings);

    // Mark migration as completed
    markMigrationCompleted();

    // Optionally backup old data (keep for 30 days in case of issues)
    const backupKey = `${OLD_STORAGE_KEY}_backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(oldData));

    return {
      success: true,
      message: `Migration completed successfully! Migrated ${Object.keys(oldData).length} data fields.`,
      dataFound: true,
    };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      dataFound: true,
    };
  }
}

/**
 * Force reset migration (for testing/debugging only)
 * WARNING: This will trigger migration again on next app load
 */
export function resetMigrationFlag(): void {
  localStorage.removeItem(MIGRATION_FLAG_KEY);
  console.warn('Migration flag reset. Migration will run again on next app load.');
}

/**
 * Clean up old AppContext data after successful migration
 * Only call this after confirming migration worked correctly
 */
export function cleanupOldData(): void {
  if (!isMigrationCompleted()) {
    console.warn('Cannot cleanup: migration not yet completed');
    return;
  }

  try {
    // Remove old storage key
    localStorage.removeItem(OLD_STORAGE_KEY);
    console.log('Old AppContext data cleaned up successfully');
  } catch (error) {
    console.error('Error cleaning up old data:', error);
  }
}
