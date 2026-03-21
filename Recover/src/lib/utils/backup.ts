/**
 * Backup & Restore Utilities
 *
 * Functions for creating, validating, and restoring data backups
 */

import type { AppData } from '@/types/app';

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
export function validateBackupData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Backup file is empty or corrupted');
    return { valid: false, errors };
  }

  const backup = data as Record<string, unknown>;

  // Check if it's a Recover backup
  if (backup.appName !== 'Recover') {
    errors.push('This does not appear to be a valid Recover backup file');
  }

  // Check version (for future compatibility)
  if (!backup.version) {
    errors.push('Backup file is missing version information');
  }

  // Check if data object exists
  if (!backup.data) {
    errors.push('Backup file is missing data');
    return { valid: false, errors };
  }

  const backupData = backup.data as Record<string, unknown>;

  // Validate critical fields
  const requiredFields = ['sobrietyDate', 'checkIns', 'meetings', 'cravings'];
  for (const field of requiredFields) {
    if (!(field in backupData)) {
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
    if (backupData[field] && !Array.isArray(backupData[field])) {
      errors.push(`Field ${field} should be an array`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Import backup from file
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
      const parsed = JSON.parse(content);

      // Validate backup
      const validation = validateBackupData(parsed);
      if (!validation.valid) {
        onError(validation.errors);
        return;
      }

      // Return validated data with safety checks
      const safeData = {
        ...parsed.data,
        // Ensure arrays exist
        checkIns: parsed.data.checkIns || [],
        meetings: parsed.data.meetings || [],
        cravings: parsed.data.cravings || [],
        meditations: parsed.data.meditations || [],
        gratitude: parsed.data.gratitude || [],
        growthLogs: parsed.data.growthLogs || [],
        contacts: parsed.data.contacts || [],
        goals: parsed.data.goals || [],
        goalProgress: parsed.data.goalProgress || [],
        challenges: parsed.data.challenges || [],
        events: parsed.data.events || [],
        reasonsForSobriety: parsed.data.reasonsForSobriety || [],
        unlockedBadges: parsed.data.unlockedBadges || [],
        customQuotes: parsed.data.customQuotes || [],
        sleepEntries: parsed.data.sleepEntries || [],
        exerciseEntries: parsed.data.exerciseEntries || [],
        nutritionEntries: parsed.data.nutritionEntries || [],
        medications: parsed.data.medications || [],
        medicationLogs: parsed.data.medicationLogs || [],
        relapses: parsed.data.relapses || [],
        cleanPeriods: parsed.data.cleanPeriods || [],
        setbacks: parsed.data.setbacks || [],
        // Ensure objects exist
        skillBuilding: parsed.data.skillBuilding || {
          mindfulnessChallenge: { currentDay: 0, completedDays: [], notes: {} },
          triggerExercises: [],
          connectionPrompts: [],
          copingSkillUsage: [],
          breathingExercises: [],
          values: [],
          valuesReflections: [],
          selfCompassionEntries: []
        },
        insights: parsed.data.insights || {
          patternInsights: [],
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
