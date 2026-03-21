/**
 * Cloud Sync Tests
 *
 * Tests the cloud backup and synchronization system including:
 * - CloudEncryption (AES-256-GCM encryption/decryption)
 * - SyncStateManager (localStorage management)
 * - Cloud backup creation and restoration
 * - Conflict resolution
 * - Metadata management
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  CloudEncryption,
  SyncStateManager,
  CloudSyncService,
  type CloudSyncConfig,
  type SyncStatus,
  type BackupMetadata,
} from './cloud-sync';

// Mock crypto API for testing
const mockCrypto = {
  subtle: {
    importKey: vi.fn(),
    deriveKey: vi.fn(),
    encrypt: vi.fn(),
    decrypt: vi.fn(),
    // ✅ Add digest for checksum calculation
    digest: vi.fn((algorithm, data) => {
      // Simple mock hash - return consistent hash for same input
      const str = String.fromCharCode(...new Uint8Array(data));
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash;
      }
      // Return as ArrayBuffer (SHA-256 produces 32 bytes)
      const buffer = new ArrayBuffer(32);
      const view = new Uint8Array(buffer);
      view[0] = (hash >> 24) & 0xff;
      view[1] = (hash >> 16) & 0xff;
      view[2] = (hash >> 8) & 0xff;
      view[3] = hash & 0xff;
      return Promise.resolve(buffer);
    }),
  },
  getRandomValues: vi.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
};

// Mock Supabase
vi.mock('./supabase', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ data: {}, error: null })),
        download: vi.fn(() => Promise.resolve({ data: new Blob(), error: null })),
        list: vi.fn(() => Promise.resolve({ data: [], error: null })),
        remove: vi.fn(() => Promise.resolve({ data: {}, error: null })),
      })),
    },
  },
  isSupabaseConfigured: vi.fn(() => true),
  BACKUP_BUCKET: 'backups',
  getBackupPath: vi.fn((userId, backupId) => `${userId}/${backupId}.json`),
  getMetadataPath: vi.fn((userId, backupId) => `${userId}/${backupId}-metadata.json`),
}));

describe('CloudEncryption', () => {
  beforeEach(() => {
    // Reset crypto mocks
    vi.clearAllMocks();

    // Setup crypto mock return values
    global.window = {
      crypto: mockCrypto as any,
    } as any;

    // Mock text encoder/decoder
    global.TextEncoder = class TextEncoder {
      encode(str: string) {
        return new Uint8Array(str.split('').map((c) => c.charCodeAt(0)));
      }
    } as any;

    global.TextDecoder = class TextDecoder {
      decode(input: ArrayBuffer | Uint8Array) {
        // Handle both ArrayBuffer and Uint8Array
        const arr = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
        return String.fromCharCode(...Array.from(arr));
      }
    } as any;
  });

  describe('encrypt', () => {
    it('should encrypt data with password', async () => {
      const testData = 'sensitive recovery data';
      const password = 'secure-password-123';

      // Mock crypto operations
      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(32));

      const encrypted = await CloudEncryption.encrypt(testData, password);

      expect(encrypted).toBeTruthy();
      expect(typeof encrypted).toBe('string');
      expect(mockCrypto.subtle.importKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalled();
      expect(mockCrypto.subtle.encrypt).toHaveBeenCalled();
    });

    it('should generate unique IV for each encryption', async () => {
      const testData = 'test data';
      const password = 'password';

      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(32));

      const encrypted1 = await CloudEncryption.encrypt(testData, password);
      const encrypted2 = await CloudEncryption.encrypt(testData, password);

      // Even with same data and password, encrypted results should differ (due to random IV)
      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should use PBKDF2 with 100k iterations', async () => {
      const testData = 'test';
      const password = 'password';

      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(16));

      await CloudEncryption.encrypt(testData, password);

      // Check that deriveKey was called with PBKDF2 and 100k iterations
      expect(mockCrypto.subtle.deriveKey).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'PBKDF2',
          iterations: 100000,
          hash: 'SHA-256',
        }),
        expect.anything(),
        expect.objectContaining({ name: 'AES-GCM', length: 256 }),
        false,
        ['encrypt', 'decrypt']
      );
    });

    it('should handle encryption errors gracefully', async () => {
      const testData = 'test';
      const password = 'password';

      mockCrypto.subtle.importKey.mockRejectedValue(new Error('Encryption failed'));

      await expect(CloudEncryption.encrypt(testData, password)).rejects.toThrow();
    });
  });

  describe('decrypt', () => {
    it('should decrypt encrypted data with correct password', async () => {
      const testData = 'original data';
      const password = 'correct-password';

      // Mock successful encryption and decryption
      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(32));
      mockCrypto.subtle.decrypt.mockResolvedValue(
        new TextEncoder().encode(testData).buffer
      );

      const encrypted = await CloudEncryption.encrypt(testData, password);
      const decrypted = await CloudEncryption.decrypt(encrypted, password);

      expect(decrypted).toBe(testData);
      expect(mockCrypto.subtle.decrypt).toHaveBeenCalled();
    });

    it('should fail with incorrect password', async () => {
      const testData = 'secret data';
      const correctPassword = 'correct-password';
      const wrongPassword = 'wrong-password';

      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(32));

      const encrypted = await CloudEncryption.encrypt(testData, correctPassword);

      // Mock decrypt failure with wrong password
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));

      await expect(CloudEncryption.decrypt(encrypted, wrongPassword)).rejects.toThrow();
    });

    it('should handle malformed encrypted data', async () => {
      const malformedData = 'not-base64-encrypted-data';
      const password = 'password';

      await expect(CloudEncryption.decrypt(malformedData, password)).rejects.toThrow();
    });
  });

  describe('Round-trip encryption/decryption', () => {
    it('should successfully encrypt and decrypt complex JSON data', async () => {
      const complexData = JSON.stringify({
        sobrietyDate: '2024-01-01',
        checkIns: [
          { id: 1, date: '2024-01-01', mood: 5 },
          { id: 2, date: '2024-01-02', mood: 4 },
        ],
        badges: ['24h', '1week', '30days'],
        settings: {
          darkMode: true,
          notifications: { enabled: true },
        },
      });
      const password = 'strong-password-123';

      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(128));
      mockCrypto.subtle.decrypt.mockResolvedValue(
        new TextEncoder().encode(complexData).buffer
      );

      const encrypted = await CloudEncryption.encrypt(complexData, password);
      const decrypted = await CloudEncryption.decrypt(encrypted, password);

      expect(JSON.parse(decrypted)).toEqual(JSON.parse(complexData));
    });
  });
});

describe('SyncStateManager', () => {
  // Create a proper in-memory localStorage for these tests
  let localStorageData: Record<string, string> = {};

  beforeEach(() => {
    // Reset in-memory storage
    localStorageData = {};

    // Implement proper localStorage mock
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageData[key] || null,
        setItem: (key: string, value: string) => {
          localStorageData[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageData[key];
        },
        clear: () => {
          localStorageData = {};
        },
      },
      writable: true,
    });

    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return default config when nothing stored', () => {
      const config = SyncStateManager.getConfig();

      expect(config.encryptionEnabled).toBe(true);
      expect(config.syncEnabled).toBe(false);
      expect(config.deviceId).toBeTruthy();
      expect(config.autoSyncInterval).toBe(30);
    });

    it('should load stored config from localStorage', () => {
      const storedConfig: CloudSyncConfig = {
        encryptionEnabled: false,
        syncEnabled: true,
        deviceId: 'device-123',
        userId: 'user-456',
        autoSyncInterval: 60,
      };

      localStorage.setItem('cloud_sync_config', JSON.stringify(storedConfig));

      const config = SyncStateManager.getConfig();

      expect(config).toEqual(storedConfig);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem('cloud_sync_config', 'invalid-json{{{');

      const config = SyncStateManager.getConfig();

      // Should return default config
      expect(config.encryptionEnabled).toBe(true);
      expect(config.syncEnabled).toBe(false);
    });
  });

  describe('saveConfig', () => {
    it('should save config to localStorage', () => {
      const newConfig: CloudSyncConfig = {
        encryptionEnabled: true,
        syncEnabled: true,
        deviceId: 'my-device',
        userId: 'my-user',
        autoSyncInterval: 45,
      };

      SyncStateManager.saveConfig(newConfig);

      const stored = localStorage.getItem('cloud_sync_config');
      expect(JSON.parse(stored!)).toEqual(newConfig);
    });

    it('should overwrite existing config', () => {
      const config1: CloudSyncConfig = {
        encryptionEnabled: true,
        syncEnabled: false,
        deviceId: 'device-1',
      };

      const config2: CloudSyncConfig = {
        encryptionEnabled: false,
        syncEnabled: true,
        deviceId: 'device-2',
        userId: 'user-abc',
      };

      SyncStateManager.saveConfig(config1);
      SyncStateManager.saveConfig(config2);

      const stored = SyncStateManager.getConfig();
      expect(stored).toEqual(config2);
    });
  });

  describe('getStatus', () => {
    it('should return default status when nothing stored', () => {
      const status = SyncStateManager.getStatus();

      expect(status.status).toBe('idle');
      expect(status.pendingChanges).toBe(0);
      expect(status.needsResolution).toBe(false);
    });

    it('should load stored status from localStorage', () => {
      const storedStatus: SyncStatus = {
        status: 'success',
        lastSyncTime: '2024-01-15T10:30:00Z',
        pendingChanges: 5,
        cloudVersion: 'v2',
        localVersion: 'v2',
        needsResolution: false,
      };

      localStorage.setItem('cloud_sync_status', JSON.stringify(storedStatus));

      const status = SyncStateManager.getStatus();

      expect(status).toEqual(storedStatus);
    });
  });

  describe('saveStatus', () => {
    it('should save status to localStorage', () => {
      const newStatus: SyncStatus = {
        status: 'syncing',
        lastSyncTime: new Date().toISOString(),
        pendingChanges: 3,
        needsResolution: false,
      };

      SyncStateManager.saveStatus(newStatus);

      const stored = localStorage.getItem('cloud_sync_status');
      expect(JSON.parse(stored!)).toEqual(newStatus);
    });
  });

  describe('markPendingChange', () => {
    it('should increment pending changes counter', () => {
      SyncStateManager.markPendingChange();

      const status = SyncStateManager.getStatus();
      expect(status.pendingChanges).toBe(1);

      SyncStateManager.markPendingChange();
      const status2 = SyncStateManager.getStatus();
      expect(status2.pendingChanges).toBe(2);
    });
  });

  describe('clearPendingChanges', () => {
    it('should reset pending changes to zero', () => {
      SyncStateManager.markPendingChange();
      SyncStateManager.markPendingChange();
      SyncStateManager.markPendingChange();

      expect(SyncStateManager.getStatus().pendingChanges).toBe(3);

      SyncStateManager.clearPendingChanges();

      expect(SyncStateManager.getStatus().pendingChanges).toBe(0);
    });
  });

  describe('deviceId', () => {
    it('should generate stable device ID for same device', () => {
      const config1 = SyncStateManager.getConfig();
      const config2 = SyncStateManager.getConfig();

      // Device ID should be consistent across calls
      expect(config1.deviceId).toBeTruthy();
      expect(config2.deviceId).toBeTruthy();
      expect(config1.deviceId).toBe(config2.deviceId);
    });

    it('should generate device ID in correct format', () => {
      const config = SyncStateManager.getConfig();
      const deviceId = config.deviceId;

      // Should be a timestamp-based format with underscores
      expect(deviceId).toMatch(/^device_\d+_[a-z0-9]+$/i);
      expect(deviceId.length).toBeGreaterThan(10);
    });
  });
});

describe('CloudSyncService', () => {
  // Create a proper in-memory localStorage for these tests
  let localStorageData: Record<string, string> = {};

  beforeEach(() => {
    // Reset in-memory storage
    localStorageData = {};

    // Implement proper localStorage mock
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: (key: string) => localStorageData[key] || null,
        setItem: (key: string, value: string) => {
          localStorageData[key] = value;
        },
        removeItem: (key: string) => {
          delete localStorageData[key];
        },
        clear: () => {
          localStorageData = {};
        },
      },
      writable: true,
    });

    // Setup crypto mock
    global.window = {
      crypto: mockCrypto as any,
    } as any;

    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default config', () => {
      const service = new CloudSyncService();

      expect(service).toBeDefined();
    });
  });

  describe('createBackup', () => {
    it('should create encrypted backup with metadata', async () => {
      // Ensure encryption is enabled in config
      SyncStateManager.saveConfig({
        encryptionEnabled: true,
        syncEnabled: false,
        deviceId: 'test-device',
        autoSyncInterval: 30,
      });

      const service = new CloudSyncService();
      const testData = {
        sobrietyDate: '2024-01-01',
        checkIns: [],
      } as any;
      const password = 'backup-password';

      // Mock encryption
      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(128));

      const backup = await service.createBackup(testData, password);

      expect(backup.metadata).toBeDefined();
      expect(backup.metadata.encrypted).toBe(true);
      expect(backup.metadata.deviceId).toBeTruthy();
      expect(backup.metadata.timestamp).toBeTruthy();
      expect(backup.metadata.checksum).toBeTruthy();
      expect(backup.data).toBeTruthy();
    });

    it('should create unencrypted backup when no password provided', async () => {
      // Encryption enabled but no password = unencrypted backup
      SyncStateManager.saveConfig({
        encryptionEnabled: true,
        syncEnabled: false,
        deviceId: 'test-device',
        autoSyncInterval: 30,
      });

      const service = new CloudSyncService();
      const testData = {
        sobrietyDate: '2024-01-01',
      } as any;

      const backup = await service.createBackup(testData);

      expect(backup.metadata.encrypted).toBe(false);
      expect(backup.data).toBe(JSON.stringify(testData));
    });

    it('should generate checksum for data integrity', async () => {
      const service = new CloudSyncService();
      const testData = { test: 'data' } as any;

      const backup1 = await service.createBackup(testData);
      const backup2 = await service.createBackup(testData);

      // Same data should produce same checksum
      expect(backup1.metadata.checksum).toBe(backup2.metadata.checksum);
    });

    it('should include device information in metadata', async () => {
      const service = new CloudSyncService();
      const testData = { test: 'data' } as any;

      const backup = await service.createBackup(testData);

      expect(backup.metadata.deviceId).toBeTruthy();
      expect(backup.metadata.deviceName).toBeTruthy();
      expect(backup.metadata.dataVersion).toBeTruthy();
    });
  });

  describe('restoreBackup', () => {
    it('should restore encrypted backup with correct password', async () => {
      const service = new CloudSyncService();
      const originalData = {
        sobrietyDate: '2024-01-01',
        checkIns: [{ id: 1, mood: 5 }],
      } as any;
      const password = 'restore-password';

      // Mock encryption and decryption
      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(128));
      mockCrypto.subtle.decrypt.mockResolvedValue(
        new TextEncoder().encode(JSON.stringify(originalData)).buffer
      );

      const backup = await service.createBackup(originalData, password);
      const restored = await service.restoreBackup(backup, password);

      expect(restored).toEqual(originalData);
    });

    it('should fail to restore with incorrect password', async () => {
      const service = new CloudSyncService();
      const originalData = { test: 'data' } as any;
      const correctPassword = 'correct';
      const wrongPassword = 'wrong';

      mockCrypto.subtle.importKey.mockResolvedValue({});
      mockCrypto.subtle.deriveKey.mockResolvedValue({});
      mockCrypto.subtle.encrypt.mockResolvedValue(new ArrayBuffer(128));

      const backup = await service.createBackup(originalData, correctPassword);

      // Mock decrypt failure
      mockCrypto.subtle.decrypt.mockRejectedValue(new Error('Decryption failed'));

      await expect(service.restoreBackup(backup, wrongPassword)).rejects.toThrow();
    });

    it('should verify checksum after restoration', async () => {
      const service = new CloudSyncService();
      const originalData = { test: 'data' } as any;

      const backup = await service.createBackup(originalData);

      // Tamper with backup data
      backup.data = backup.data + 'tampered';

      await expect(service.restoreBackup(backup)).rejects.toThrow(/checksum/i);
    });

    it('should restore unencrypted backup without password', async () => {
      const service = new CloudSyncService();
      const originalData = { sobrietyDate: '2024-01-01' } as any;

      const backup = await service.createBackup(originalData);
      const restored = await service.restoreBackup(backup);

      expect(restored).toEqual(originalData);
    });
  });
});
