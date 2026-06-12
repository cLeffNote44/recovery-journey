/**
 * Device data wipe ("log out / delete all data").
 *
 * Removes every trace of patient PHI from the device:
 *  - all persisted Zustand stores (Preferences on native, localStorage on web)
 *  - cloud-sync / device-id / facility-device / biometric / auto-backup keys
 *  - the in-memory store state (so the UI reflects the wipe before any reload)
 *  - the device master encryption key (crypto-shred: makes any residual
 *    ciphertext permanently unrecoverable)
 *
 * This is the real implementation behind Settings → "Delete all data".
 */

import { storage } from './storage';
import { wipeMasterKey } from './device-encryption';
import { suspendPersistence } from './encrypted-storage';
import { useFacilityStore } from '@/stores/useFacilityStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useRecoveryStore } from '@/stores/useRecoveryStore';

// Persisted Zustand store keys (routed through `storage`).
const STORE_KEYS = [
  'journal-store',
  'activities-store',
  'recovery-store',
  'settings-store',
  'facility-store',
  'quotes-store',
];

// Other keys written directly to localStorage by various modules.
const STANDALONE_KEYS = [
  'cloud_sync_config',
  'cloud_sync_status',
  'cloud_pending_changes',
  'cloud_backups_list',
  'device_id',
  'device_name',
  'facility_device_id',
  'facility_device_token',
  'biometric-settings',
  'sync-queue',
  'recovery_journey_data',
  'recovery_journey_migrated',
  'recover_last_backup',
  'recover_backup_reminder_dismissed',
];

// Prefixes for dynamically-named PHI keys (auto-backups, per-user cloud blobs).
const KEY_PREFIXES = ['recover_auto_backup_', 'cloud_backup_', 'cloud_backups_list_'];

function clearLocalStorageByPattern(): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && KEY_PREFIXES.some((p) => key.startsWith(p))) {
        toRemove.push(key);
      }
    }
    toRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

/**
 * Wipe all device data. After this resolves the caller should navigate the
 * user back to onboarding (the SettingsScreen reloads the page).
 */
export async function wipeAllDeviceData(): Promise<void> {
  // 1. Suspend persistence FIRST. Resetting the in-memory stores below
  //    triggers persist writes; without this they would re-create (empty)
  //    encrypted records after we delete them.
  suspendPersistence();

  // 2. Reset in-memory store state so the UI doesn't keep showing PHI.
  try {
    useFacilityStore.getState().disconnect();
    useJournalStore.getState().setCheckIns([]);
    useJournalStore.getState().setGratitude([]);
    useJournalStore.getState().setGrowthLogs([]);
    useJournalStore.getState().setMeetings([]);
    useJournalStore.getState().setMeditations([]);
    useJournalStore.getState().setChallenges([]);
    useActivitiesStore.getState().setCravings([]);
    useActivitiesStore.getState().setEvents([]);
    useRecoveryStore.getState().setRelapses([]);
  } catch {
    // store shape changed — non-fatal, the reload below covers it
  }

  // 3. Clear persisted store data + standalone keys via the platform storage
  //    (Capacitor Preferences on native, localStorage on web).
  for (const key of [...STORE_KEYS, ...STANDALONE_KEYS]) {
    try {
      await storage.removeItem(key);
    } catch {
      // continue wiping remaining keys
    }
  }

  // 4. Clear pattern-named keys and any residual WebView localStorage. On
  //    native, modules like cloud-sync/biometric write to WebView
  //    localStorage directly, so clear that too.
  clearLocalStorageByPattern();
  try {
    if (typeof localStorage !== 'undefined') localStorage.clear();
  } catch {
    // ignore
  }
  try {
    await storage.clear();
  } catch {
    // ignore
  }

  // 5. Crypto-shred: destroy the master key so any residual ciphertext is
  //    permanently unrecoverable.
  await wipeMasterKey();
}
