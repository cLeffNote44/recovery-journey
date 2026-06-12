/**
 * Supabase Client Configuration
 *
 * Initializes and exports the Supabase client for cloud storage.
 * Uses environment variables for configuration.
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Cloud sync will use local storage fallback.\n' +
    'To enable cloud sync, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

// Create Supabase client
// If credentials are missing, create a dummy client that will fail gracefully
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // We don't need session persistence
        autoRefreshToken: false,
      },
    })
  : null;

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}

/**
 * Get the storage bucket name for backups.
 *
 * SECURITY REQUIREMENT (server-side config, not enforceable from the client):
 * this bucket MUST be PRIVATE with row-level security so a user can only read
 * their own `${userId}/...` objects. The client uploads only encrypted
 * backups (see CloudSyncService.uploadBackup) and reads via short-lived
 * signed URLs — never `getPublicUrl`. A public bucket would expose every
 * patient's PHI to anyone who can guess a path.
 */
export const BACKUP_BUCKET = 'recover-backups';

/**
 * Helper to get the file path for a user's backup
 */
export function getBackupPath(userId: string, backupId: string): string {
  return `${userId}/${backupId}.json`;
}

/**
 * Helper to get the metadata file path for a user
 */
export function getMetadataPath(userId: string): string {
  return `${userId}/metadata.json`;
}
