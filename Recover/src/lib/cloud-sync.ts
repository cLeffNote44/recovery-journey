/**
 * Cloud Backup & Sync System
 *
 * Provides secure cloud backup and cross-device synchronization using
 * browser-based encryption and Supabase cloud storage.
 */

import type { AppData } from '@/types/app';
import { supabase, isSupabaseConfigured, BACKUP_BUCKET, getBackupPath, getMetadataPath } from './supabase';

export interface CloudSyncConfig {
  apiEndpoint?: string;
  encryptionEnabled: boolean;
  autoSyncInterval?: number; // minutes
  lastSyncTimestamp?: string;
  syncEnabled: boolean;
  deviceId: string;
  userId?: string;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'success' | 'error';
  lastSyncTime?: string;
  lastSyncError?: string;
  pendingChanges: number;
  cloudVersion?: string;
  localVersion?: string;
  needsResolution: boolean;
}

export interface BackupMetadata {
  id: string;
  timestamp: string;
  deviceId: string;
  deviceName: string;
  dataVersion: string;
  size: number; // bytes
  encrypted: boolean;
  checksum: string;
}

export interface CloudBackup {
  metadata: BackupMetadata;
  data: string; // Encrypted or plain JSON
}

// Simple encryption using Web Crypto API
export class CloudEncryption {
  private static async getKey(password: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('recovery-journey-salt'), // In production, use unique salt per user
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  static async encrypt(data: string, password: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await this.getKey(password);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(data)
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(encryptedData: string, password: string): Promise<string> {
    const key = await this.getKey(password);
    const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
}

// Local storage manager for sync state
export class SyncStateManager {
  private static SYNC_CONFIG_KEY = 'cloud_sync_config';
  private static SYNC_STATUS_KEY = 'cloud_sync_status';
  private static PENDING_CHANGES_KEY = 'cloud_pending_changes';

  static getConfig(): CloudSyncConfig {
    const stored = localStorage.getItem(this.SYNC_CONFIG_KEY);
    if (!stored) {
      return {
        encryptionEnabled: true,
        syncEnabled: false,
        deviceId: this.generateDeviceId(),
        autoSyncInterval: 30 // 30 minutes default
      };
    }
    try {
      return JSON.parse(stored);
    } catch {
      // If stored data is corrupted, return default config
      return {
        encryptionEnabled: true,
        syncEnabled: false,
        deviceId: this.generateDeviceId(),
        autoSyncInterval: 30
      };
    }
  }

  static saveConfig(config: CloudSyncConfig): void {
    localStorage.setItem(this.SYNC_CONFIG_KEY, JSON.stringify(config));
  }

  static getStatus(): SyncStatus {
    const stored = localStorage.getItem(this.SYNC_STATUS_KEY);
    if (!stored) {
      return {
        status: 'idle',
        pendingChanges: 0,
        needsResolution: false
      };
    }
    return JSON.parse(stored);
  }

  static saveStatus(status: SyncStatus): void {
    localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(status));
  }

  static markPendingChange(): void {
    const status = this.getStatus();
    status.pendingChanges++;
    this.saveStatus(status);
  }

  static clearPendingChanges(): void {
    const status = this.getStatus();
    status.pendingChanges = 0;
    this.saveStatus(status);
  }

  private static generateDeviceId(): string {
    let deviceId = localStorage.getItem('device_id');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      localStorage.setItem('device_id', deviceId);
    }
    return deviceId;
  }

  static getDeviceName(): string {
    const stored = localStorage.getItem('device_name');
    if (stored) return stored;

    // Try to detect device info
    const ua = navigator.userAgent;
    let name = 'Unknown Device';

    if (ua.includes('iPhone')) name = 'iPhone';
    else if (ua.includes('iPad')) name = 'iPad';
    else if (ua.includes('Android')) name = 'Android Device';
    else if (ua.includes('Mac')) name = 'Mac';
    else if (ua.includes('Windows')) name = 'Windows PC';
    else if (ua.includes('Linux')) name = 'Linux Device';

    return name;
  }

  static setDeviceName(name: string): void {
    localStorage.setItem('device_name', name);
  }
}

// Cloud sync service
export class CloudSyncService {
  private config: CloudSyncConfig;
  private autoSyncTimer?: number;

  constructor() {
    this.config = SyncStateManager.getConfig();
  }

  /**
   * Create a backup of app data
   */
  async createBackup(
    appData: AppData,
    password?: string
  ): Promise<CloudBackup> {
    const jsonData = JSON.stringify(appData);
    const shouldEncrypt = Boolean(this.config.encryptionEnabled && password);

    let data: string;
    if (shouldEncrypt && password) {
      data = await CloudEncryption.encrypt(jsonData, password);
    } else {
      data = jsonData;
    }

    const metadata: BackupMetadata = {
      id: this.generateBackupId(),
      timestamp: new Date().toISOString(),
      deviceId: this.config.deviceId,
      deviceName: SyncStateManager.getDeviceName(),
      dataVersion: '1.0',
      size: new Blob([data]).size,
      encrypted: shouldEncrypt,
      checksum: await this.calculateChecksum(jsonData)
    };

    return { metadata, data };
  }

  /**
   * Restore data from a backup
   */
  async restoreBackup(
    backup: CloudBackup,
    password?: string
  ): Promise<AppData> {
    let jsonData: string;

    if (backup.metadata.encrypted) {
      if (!password) {
        throw new Error('Password required to decrypt backup');
      }
      jsonData = await CloudEncryption.decrypt(backup.data, password);
    } else {
      jsonData = backup.data;
    }

    // Verify checksum
    const checksum = await this.calculateChecksum(jsonData);
    if (checksum !== backup.metadata.checksum) {
      throw new Error('Backup data corrupted - checksum mismatch');
    }

    return JSON.parse(jsonData);
  }

  /**
   * Upload backup to cloud using Supabase Storage
   */
  async uploadBackup(
    backup: CloudBackup,
    userId: string
  ): Promise<{ success: boolean; backupId: string; url?: string }> {
    // Use Supabase if configured, otherwise fall back to localStorage
    if (isSupabaseConfigured() && supabase) {
      try {
        const filePath = getBackupPath(userId, backup.metadata.id);
        const backupData = JSON.stringify(backup);

        // Upload backup file to Supabase Storage
        const { data, error } = await supabase.storage
          .from(BACKUP_BUCKET)
          .upload(filePath, backupData, {
            contentType: 'application/json',
            upsert: true, // Overwrite if exists
          });

        if (error) {
          console.error('Supabase upload error:', error);
          throw error;
        }

        // Update metadata file with list of all backups
        const backupsList = await this.getBackupsList(userId);
        const updatedList = [...backupsList.filter(b => b.id !== backup.metadata.id), backup.metadata];
        const metadataPath = getMetadataPath(userId);

        await supabase.storage
          .from(BACKUP_BUCKET)
          .upload(metadataPath, JSON.stringify(updatedList), {
            contentType: 'application/json',
            upsert: true,
          });

        // Get public URL
        const { data: urlData } = supabase.storage
          .from(BACKUP_BUCKET)
          .getPublicUrl(filePath);

        return {
          success: true,
          backupId: backup.metadata.id,
          url: urlData.publicUrl
        };
      } catch (error) {
        console.error('Upload failed:', error);
        return {
          success: false,
          backupId: backup.metadata.id
        };
      }
    } else {
      // Fallback to localStorage if Supabase not configured
      const cloudKey = `cloud_backup_${userId}_${backup.metadata.id}`;

      try {
        // Simulate network delay
        await this.delay(1000);

        // Store in localStorage (simulating cloud storage)
        localStorage.setItem(cloudKey, JSON.stringify(backup));

        // Store in list of backups
        const backupsList = await this.getBackupsList(userId);
        backupsList.push(backup.metadata);
        localStorage.setItem(`cloud_backups_list_${userId}`, JSON.stringify(backupsList));

        return {
          success: true,
          backupId: backup.metadata.id,
          url: `cloud://${userId}/${backup.metadata.id}`
        };
      } catch (error) {
        console.error('Upload failed:', error);
        return {
          success: false,
          backupId: backup.metadata.id
        };
      }
    }
  }

  /**
   * Download backup from cloud using Supabase Storage
   */
  async downloadBackup(
    userId: string,
    backupId: string
  ): Promise<CloudBackup | null> {
    // Use Supabase if configured, otherwise fall back to localStorage
    if (isSupabaseConfigured() && supabase) {
      try {
        const filePath = getBackupPath(userId, backupId);

        // Download backup file from Supabase Storage
        const { data, error } = await supabase.storage
          .from(BACKUP_BUCKET)
          .download(filePath);

        if (error) {
          console.error('Supabase download error:', error);
          return null;
        }

        // Read the blob as text
        const text = await data.text();
        return JSON.parse(text);
      } catch (error) {
        console.error('Download failed:', error);
        return null;
      }
    } else {
      // Fallback to localStorage if Supabase not configured
      const cloudKey = `cloud_backup_${userId}_${backupId}`;

      try {
        // Simulate network delay
        await this.delay(800);

        const stored = localStorage.getItem(cloudKey);
        if (!stored) return null;

        return JSON.parse(stored);
      } catch (error) {
        console.error('Download failed:', error);
        return null;
      }
    }
  }

  /**
   * List all backups for a user
   */
  async getBackupsList(userId: string): Promise<BackupMetadata[]> {
    // Use Supabase if configured, otherwise fall back to localStorage
    if (isSupabaseConfigured() && supabase) {
      try {
        const metadataPath = getMetadataPath(userId);

        // Download metadata file from Supabase Storage
        const { data, error } = await supabase.storage
          .from(BACKUP_BUCKET)
          .download(metadataPath);

        if (error) {
          // If metadata file doesn't exist yet, return empty array
          if (error.message.includes('not found')) {
            return [];
          }
          console.error('Supabase metadata download error:', error);
          return [];
        }

        // Read the blob as text
        const text = await data.text();
        return JSON.parse(text);
      } catch (error) {
        console.error('Failed to get backups list:', error);
        return [];
      }
    } else {
      // Fallback to localStorage if Supabase not configured
      const stored = localStorage.getItem(`cloud_backups_list_${userId}`);
      if (!stored) return [];

      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
  }

  /**
   * Delete a backup
   */
  async deleteBackup(userId: string, backupId: string): Promise<boolean> {
    // Use Supabase if configured, otherwise fall back to localStorage
    if (isSupabaseConfigured() && supabase) {
      try {
        const filePath = getBackupPath(userId, backupId);

        // Delete backup file from Supabase Storage
        const { error } = await supabase.storage
          .from(BACKUP_BUCKET)
          .remove([filePath]);

        if (error) {
          console.error('Supabase delete error:', error);
          return false;
        }

        // Update metadata file
        const backupsList = await this.getBackupsList(userId);
        const filtered = backupsList.filter(b => b.id !== backupId);
        const metadataPath = getMetadataPath(userId);

        await supabase.storage
          .from(BACKUP_BUCKET)
          .upload(metadataPath, JSON.stringify(filtered), {
            contentType: 'application/json',
            upsert: true,
          });

        return true;
      } catch (error) {
        console.error('Delete failed:', error);
        return false;
      }
    } else {
      // Fallback to localStorage if Supabase not configured
      const cloudKey = `cloud_backup_${userId}_${backupId}`;

      try {
        // Remove backup data
        localStorage.removeItem(cloudKey);

        // Update backups list
        const backupsList = await this.getBackupsList(userId);
        const filtered = backupsList.filter(b => b.id !== backupId);
        localStorage.setItem(`cloud_backups_list_${userId}`, JSON.stringify(filtered));

        return true;
      } catch (error) {
        console.error('Delete failed:', error);
        return false;
      }
    }
  }

  /**
   * Perform full sync operation
   */
  async sync(
    localData: AppData,
    userId: string,
    password?: string
  ): Promise<{
    success: boolean;
    action: 'uploaded' | 'downloaded' | 'merged' | 'conflict';
    data?: AppData;
    error?: string;
  }> {
    const status = SyncStateManager.getStatus();

    try {
      // Update status to syncing
      SyncStateManager.saveStatus({ ...status, status: 'syncing' });

      // Get latest cloud backup
      const backupsList = await this.getBackupsList(userId);
      const latestBackup = backupsList.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];

      if (!latestBackup) {
        // No cloud backup exists - upload current data
        const backup = await this.createBackup(localData, password);
        const result = await this.uploadBackup(backup, userId);

        if (result.success) {
          SyncStateManager.saveStatus({
            status: 'success',
            lastSyncTime: new Date().toISOString(),
            pendingChanges: 0,
            cloudVersion: backup.metadata.id,
            localVersion: backup.metadata.id,
            needsResolution: false
          });

          return { success: true, action: 'uploaded' };
        } else {
          throw new Error('Upload failed');
        }
      }

      // Compare local and cloud versions
      const cloudBackup = await this.downloadBackup(userId, latestBackup.id);
      if (!cloudBackup) {
        throw new Error('Failed to download cloud backup');
      }

      const cloudData = await this.restoreBackup(cloudBackup, password);

      // Simple conflict resolution: newest wins
      const localTimestamp = new Date(localData.sobrietyDate || 0).getTime();
      const cloudTimestamp = new Date(cloudData.sobrietyDate || 0).getTime();

      if (status.pendingChanges > 0) {
        // Local changes - upload new backup
        const backup = await this.createBackup(localData, password);
        const result = await this.uploadBackup(backup, userId);

        if (result.success) {
          SyncStateManager.saveStatus({
            status: 'success',
            lastSyncTime: new Date().toISOString(),
            pendingChanges: 0,
            cloudVersion: backup.metadata.id,
            localVersion: backup.metadata.id,
            needsResolution: false
          });

          return { success: true, action: 'uploaded' };
        }
      } else {
        // No local changes - use cloud data
        SyncStateManager.saveStatus({
          status: 'success',
          lastSyncTime: new Date().toISOString(),
          pendingChanges: 0,
          cloudVersion: latestBackup.id,
          localVersion: latestBackup.id,
          needsResolution: false
        });

        return { success: true, action: 'downloaded', data: cloudData };
      }

      throw new Error('Sync logic error');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      SyncStateManager.saveStatus({
        ...status,
        status: 'error',
        lastSyncError: errorMessage
      });

      return { success: false, action: 'conflict', error: errorMessage };
    }
  }

  /**
   * Enable auto-sync
   */
  enableAutoSync(
    getSyncData: () => AppData,
    onSyncComplete: (result: any) => void,
    userId: string,
    password?: string
  ): void {
    if (this.autoSyncTimer) {
      this.disableAutoSync();
    }

    const intervalMs = (this.config.autoSyncInterval || 30) * 60 * 1000;

    this.autoSyncTimer = window.setInterval(async () => {
      const data = getSyncData();
      const result = await this.sync(data, userId, password);
      onSyncComplete(result);
    }, intervalMs);

    this.config.syncEnabled = true;
    SyncStateManager.saveConfig(this.config);
  }

  /**
   * Disable auto-sync
   */
  disableAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = undefined;
    }

    this.config.syncEnabled = false;
    SyncStateManager.saveConfig(this.config);
  }

  /**
   * Helper: Generate unique backup ID
   */
  private generateBackupId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  /**
   * Helper: Calculate checksum for data integrity
   */
  private async calculateChecksum(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const buffer = encoder.encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Helper: Simulate network delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Export backup to file for manual backup
   */
  async exportToFile(backup: CloudBackup): Promise<Blob> {
    const json = JSON.stringify(backup, null, 2);
    return new Blob([json], { type: 'application/json' });
  }

  /**
   * Import backup from file
   */
  async importFromFile(file: File): Promise<CloudBackup> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string);
          resolve(backup);
        } catch (error) {
          reject(new Error('Invalid backup file'));
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
}

// Export singleton instance
export const cloudSync = new CloudSyncService();
