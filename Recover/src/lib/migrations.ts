/**
 * Data Migration System
 *
 * Handles versioned data migrations to support breaking changes
 */

import type { AppData } from '@/types/app';

export interface MigrationResult {
  success: boolean;
  fromVersion: string;
  toVersion: string;
  errors?: string[];
  warnings?: string[];
}

/**
 * Migration function type
 * Uses Partial<AppData> to allow flexible data transformations
 * while maintaining some type safety
 */
export type Migration = (data: Partial<AppData> & Record<string, unknown>) => Partial<AppData> & Record<string, unknown>;

/**
 * Migration registry - add new migrations here
 */
const migrations: Record<string, Migration> = {
  '1.0': (data) => {
    // Base version - no migration needed
    return data;
  },

  '1.1': (data) => {
    // Example: Add new field with default
    return {
      ...data,
      skillBuilding: data.skillBuilding || {
        mindfulnessChallenge: {
          currentDay: 0,
          startDate: new Date().toISOString(),
          completedDays: [],
          notes: {}
        },
        triggerExercises: [],
        connectionPrompts: [],
        copingSkillUsage: [],
        breathingExercises: [],
        values: [],
        valuesReflections: [],
        selfCompassionEntries: []
      }
    };
  },

  '1.2': (data) => {
    // Example: Add setbacks field if missing
    return {
      ...data,
      setbacks: data.setbacks || [],
      recoveryStartDate: data.recoveryStartDate || data.sobrietyDate
    };
  },

  '2.0': (data) => {
    // Example: Breaking change - restructure check-ins
    const checkIns = Array.isArray(data.checkIns) ? data.checkIns : [];
    return {
      ...data,
      checkIns: checkIns.map((checkIn: Record<string, unknown>) => ({
        ...checkIn,
        // Ensure all check-ins have required fields
        id: checkIn.id || Date.now() + Math.random(),
        date: checkIn.date || new Date().toISOString()
      }))
    };
  }
};

/**
 * Get all available migration versions in order
 */
export function getMigrationVersions(): string[] {
  return Object.keys(migrations).sort((a, b) => {
    const [aMajor, aMinor] = a.split('.').map(Number);
    const [bMajor, bMinor] = b.split('.').map(Number);

    if (aMajor !== bMajor) return aMajor - bMajor;
    return aMinor - bMinor;
  });
}

/**
 * Compare version strings
 */
export function compareVersions(v1: string, v2: string): number {
  const [v1Major, v1Minor = 0] = v1.split('.').map(Number);
  const [v2Major, v2Minor = 0] = v2.split('.').map(Number);

  if (v1Major !== v2Major) return v1Major - v2Major;
  return v1Minor - v2Minor;
}

/**
 * Get required migrations to go from one version to another
 */
export function getRequiredMigrations(fromVersion: string, toVersion: string): string[] {
  const allVersions = getMigrationVersions();
  const required: string[] = [];

  let foundStart = false;
  for (const version of allVersions) {
    if (compareVersions(version, fromVersion) > 0 && compareVersions(version, toVersion) <= 0) {
      if (!foundStart) foundStart = true;
      required.push(version);
    }
  }

  return required;
}

/**
 * Run a single migration
 */
function runMigration(data: Partial<AppData> & Record<string, unknown>, version: string): Partial<AppData> & Record<string, unknown> {
  const migration = migrations[version];
  if (!migration) {
    throw new Error(`Migration ${version} not found`);
  }

  console.log(`[Migration] Running migration to version ${version}`);
  return migration(data);
}

/**
 * Migrate data from one version to another
 */
export function migrateData(
  data: Partial<AppData> & Record<string, unknown>,
  fromVersion: string,
  toVersion: string
): MigrationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check if migration is needed
    if (compareVersions(fromVersion, toVersion) === 0) {
      return {
        success: true,
        fromVersion,
        toVersion,
        warnings: ['No migration needed - already at target version']
      };
    }

    if (compareVersions(fromVersion, toVersion) > 0) {
      return {
        success: false,
        fromVersion,
        toVersion,
        errors: ['Cannot migrate backwards']
      };
    }

    // Get required migrations
    const requiredMigrations = getRequiredMigrations(fromVersion, toVersion);

    if (requiredMigrations.length === 0) {
      warnings.push('No migrations found between versions');
    }

    // Run migrations in sequence
    let migratedData = { ...data };
    for (const version of requiredMigrations) {
      try {
        migratedData = runMigration(migratedData, version);
        console.log(`[Migration] Successfully migrated to ${version}`);
      } catch (error) {
        const message = `Failed to migrate to ${version}: ${error}`;
        console.error(`[Migration] ${message}`);
        errors.push(message);
        return {
          success: false,
          fromVersion,
          toVersion,
          errors
        };
      }
    }

    // Validate migrated data
    const validation = validateMigratedData(migratedData);
    if (!validation.valid) {
      errors.push(...validation.errors);
      return {
        success: false,
        fromVersion,
        toVersion,
        errors
      };
    }

    return {
      success: true,
      fromVersion,
      toVersion,
      warnings: warnings.length > 0 ? warnings : undefined
    };

  } catch (error) {
    errors.push(`Migration failed: ${error}`);
    return {
      success: false,
      fromVersion,
      toVersion,
      errors
    };
  }
}

/**
 * Validate migrated data structure
 */
function validateMigratedData(data: Record<string, unknown>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required fields
  const requiredFields = [
    'sobrietyDate',
    'checkIns',
    'cravings',
    'meetings',
    'meditations',
    'gratitude',
    'growthLogs',
    'contacts',
    'reasonsForSobriety',
    'unlockedBadges'
  ];

  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field after migration: ${field}`);
    }
  }

  // Check array fields are actually arrays
  const arrayFields = [
    'checkIns',
    'cravings',
    'meetings',
    'meditations',
    'gratitude',
    'growthLogs',
    'contacts',
    'reasonsForSobriety',
    'unlockedBadges',
    'goals',
    'setbacks'
  ];

  for (const field of arrayFields) {
    if (field in data && !Array.isArray(data[field])) {
      errors.push(`Field ${field} must be an array`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create a backup before migration
 */
export function createMigrationBackup(data: unknown, fromVersion: string): void {
  const backup = {
    data,
    version: fromVersion,
    timestamp: new Date().toISOString()
  };

  try {
    localStorage.setItem(
      `recovery_migration_backup_${fromVersion}_${Date.now()}`,
      JSON.stringify(backup)
    );
    console.log(`[Migration] Created backup for version ${fromVersion}`);
  } catch (error) {
    console.error('[Migration] Failed to create backup:', error);
  }
}

/**
 * Restore from migration backup
 */
export function restoreFromBackup(backupKey: string): (Partial<AppData> & Record<string, unknown>) | null {
  try {
    const backup = localStorage.getItem(backupKey);
    if (backup) {
      const parsed = JSON.parse(backup);
      console.log(`[Migration] Restored backup from ${parsed.version}`);
      return parsed.data;
    }
  } catch (error) {
    console.error('[Migration] Failed to restore backup:', error);
  }
  return null;
}

/**
 * Clean up old migration backups
 */
export function cleanupOldBackups(keepLast: number = 3): void {
  try {
    const backupKeys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('recovery_migration_backup_')) {
        backupKeys.push(key);
      }
    }

    // Sort by timestamp (newest first)
    backupKeys.sort().reverse();

    // Remove old backups
    const toRemove = backupKeys.slice(keepLast);
    for (const key of toRemove) {
      localStorage.removeItem(key);
      console.log(`[Migration] Removed old backup: ${key}`);
    }
  } catch (error) {
    console.error('[Migration] Failed to cleanup backups:', error);
  }
}

/**
 * Automatic migration on app load
 */
export function autoMigrate(
  data: Partial<AppData> & Record<string, unknown>,
  dataVersion: string | undefined,
  targetVersion: string
): { data: Partial<AppData> & Record<string, unknown>; result: MigrationResult } {
  const fromVersion = dataVersion || '1.0';

  // Create backup before migration
  createMigrationBackup(data, fromVersion);

  // Run migration
  const result = migrateData(data, fromVersion, targetVersion);

  if (result.success) {
    console.log(`[Migration] Successfully migrated from ${fromVersion} to ${targetVersion}`);

    // Cleanup old backups
    cleanupOldBackups();

    return {
      data: result.success ? data : data, // Return migrated data
      result
    };
  } else {
    console.error(`[Migration] Migration failed:`, result.errors);
    return {
      data,
      result
    };
  }
}
