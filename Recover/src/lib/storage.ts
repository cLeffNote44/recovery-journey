import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Storage utility that uses Capacitor Preferences on native platforms
 * and localStorage on web for reliable data persistence
 */

const isNative = Capacitor.isNativePlatform();

// Migration flag to track if we've migrated data from localStorage to Preferences
const MIGRATION_KEY = 'recovery_journey_migrated';

/**
 * Migrate data from localStorage to Capacitor Preferences (one-time operation)
 */
async function migrateFromLocalStorage(key: string): Promise<void> {
  if (!isNative) return; // Only need to migrate on native platforms

  try {
    // Check if we've already migrated
    const migrated = await Preferences.get({ key: MIGRATION_KEY });
    if (migrated.value === 'true') {
      console.log('[Storage] Already migrated from localStorage');
      return;
    }

    // Try to get data from localStorage (which would be from the WebView)
    const localStorageData = localStorage.getItem(key);
    if (localStorageData) {
      console.log('[Storage] Migrating data from localStorage to Preferences');
      // Save to Preferences
      await Preferences.set({ key, value: localStorageData });
      // Mark as migrated
      await Preferences.set({ key: MIGRATION_KEY, value: 'true' });
      console.log('[Storage] Migration complete');
    } else {
      console.log('[Storage] No data in localStorage to migrate');
      // Still mark as migrated so we don't check again
      await Preferences.set({ key: MIGRATION_KEY, value: 'true' });
    }
  } catch (error) {
    console.error('[Storage] Migration failed:', error);
  }
}

export const storage = {
  /**
   * Get an item from storage
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (isNative) {
        // Attempt migration on first read
        await migrateFromLocalStorage(key);

        const { value } = await Preferences.get({ key });
        console.log(`[Storage] GET ${key}:`, value ? `${value.substring(0, 100)}...` : 'null');
        return value;
      } else {
        const value = localStorage.getItem(key);
        console.log(`[Storage] GET ${key}:`, value ? `${value.substring(0, 100)}...` : 'null');
        return value;
      }
    } catch (error) {
      console.error(`[Storage] Error getting ${key}:`, error);
      return null;
    }
  },

  /**
   * Set an item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isNative) {
        await Preferences.set({ key, value });
        console.log(`[Storage] SET ${key}:`, value.substring(0, 100) + '...');
      } else {
        localStorage.setItem(key, value);
        console.log(`[Storage] SET ${key}:`, value.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error(`[Storage] Error setting ${key}:`, error);
      throw error;
    }
  },

  /**
   * Remove an item from storage
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (isNative) {
        await Preferences.remove({ key });
        console.log(`[Storage] REMOVE ${key}`);
      } else {
        localStorage.removeItem(key);
        console.log(`[Storage] REMOVE ${key}`);
      }
    } catch (error) {
      console.error(`[Storage] Error removing ${key}:`, error);
    }
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      if (isNative) {
        await Preferences.clear();
        console.log('[Storage] CLEAR all Preferences');
      } else {
        localStorage.clear();
        console.log('[Storage] CLEAR all localStorage');
      }
    } catch (error) {
      console.error('[Storage] Error clearing storage:', error);
    }
  }
};
