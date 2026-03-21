/**
 * Storage Quota Monitoring and Management
 *
 * Monitors storage usage and provides warnings/cleanup strategies
 */

export interface StorageQuota {
  usage: number;
  quota: number;
  percentUsed: number;
  available: number;
  canStore: boolean;
}

export interface StorageWarning {
  level: 'info' | 'warning' | 'critical';
  message: string;
  percentUsed: number;
  action: 'none' | 'archive' | 'export' | 'cleanup';
}

/**
 * Get current storage quota information
 */
export async function getStorageQuota(): Promise<StorageQuota> {
  // Check if Storage API is available
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentUsed = quota > 0 ? (usage / quota) * 100 : 0;
      const available = quota - usage;

      return {
        usage,
        quota,
        percentUsed,
        available,
        canStore: percentUsed < 95 // Allow storing if less than 95% used
      };
    } catch (error) {
      console.error('Error getting storage quota:', error);
    }
  }

  // Fallback estimates for browsers without Storage API
  // Typical localStorage limit is 5-10MB
  const storageKey = 'recovery_app_data';
  const currentData = localStorage.getItem(storageKey) || '';
  const usage = new Blob([currentData]).size;
  const quota = 5 * 1024 * 1024; // Assume 5MB limit
  const percentUsed = (usage / quota) * 100;

  return {
    usage,
    quota,
    percentUsed,
    available: quota - usage,
    canStore: percentUsed < 95
  };
}

/**
 * Check if storage warning should be shown
 */
export async function getStorageWarning(): Promise<StorageWarning | null> {
  const quota = await getStorageQuota();

  if (quota.percentUsed >= 95) {
    return {
      level: 'critical',
      message: 'Storage is nearly full! Please export and archive your data immediately.',
      percentUsed: quota.percentUsed,
      action: 'export'
    };
  }

  if (quota.percentUsed >= 85) {
    return {
      level: 'warning',
      message: 'Storage is running low. Consider exporting older data.',
      percentUsed: quota.percentUsed,
      action: 'archive'
    };
  }

  if (quota.percentUsed >= 70) {
    return {
      level: 'info',
      message: 'Storage is over 70% full. Regular backups are recommended.',
      percentUsed: quota.percentUsed,
      action: 'none'
    };
  }

  return null;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get storage usage breakdown
 */
export function getStorageBreakdown(): Record<string, number> {
  const breakdown: Record<string, number> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      breakdown[key] = new Blob([value]).size;
    }
  }

  return breakdown;
}

/**
 * Get recommendations for storage cleanup
 */
export async function getCleanupRecommendations(quota: StorageQuota): Promise<string[]> {
  const recommendations: string[] = [];

  if (quota.percentUsed >= 80) {
    recommendations.push('Export your data and clear old entries');
    recommendations.push('Archive check-ins older than 1 year');
    recommendations.push('Remove duplicate or test data');
  }

  if (quota.percentUsed >= 50) {
    recommendations.push('Regular backups recommended');
    recommendations.push('Consider archiving completed goals');
  }

  const breakdown = getStorageBreakdown();
  const appDataSize = breakdown['recovery_app_data'] || 0;
  const appDataPercent = quota.usage > 0 ? (appDataSize / quota.usage) * 100 : 0;

  if (appDataPercent > 90) {
    recommendations.push('App data is taking most space - cleanup within app');
  }

  return recommendations;
}

/**
 * Estimate if new data can be stored
 */
export async function canStoreData(estimatedSize: number): Promise<{
  canStore: boolean;
  reason?: string;
}> {
  const quota = await getStorageQuota();

  if (!quota.canStore) {
    return {
      canStore: false,
      reason: 'Storage is full'
    };
  }

  if (estimatedSize > quota.available) {
    return {
      canStore: false,
      reason: `Not enough space. Need ${formatBytes(estimatedSize)}, have ${formatBytes(quota.available)}`
    };
  }

  return { canStore: true };
}

/**
 * Monitor storage and show warnings
 */
export async function monitorStorage(): Promise<void> {
  const warning = await getStorageWarning();

  if (warning && typeof window !== 'undefined') {
    // Store last warning time to avoid spam
    const lastWarning = localStorage.getItem('last_storage_warning');
    const now = Date.now();

    // Only show warning once per day
    if (!lastWarning || now - parseInt(lastWarning) > 24 * 60 * 60 * 1000) {
      console.warn(`[Storage Monitor] ${warning.message}`);

      // Show toast if available
      if ((window as any).toast) {
        const toast = (window as any).toast;
        if (warning.level === 'critical') {
          toast.error(warning.message);
        } else if (warning.level === 'warning') {
          toast.warning(warning.message);
        } else {
          toast.info(warning.message);
        }
      }

      localStorage.setItem('last_storage_warning', now.toString());
    }
  }
}

/**
 * Hook for React components to monitor storage
 */
export function useStorageMonitor() {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [warning, setWarning] = useState<StorageWarning | null>(null);

  const checkStorage = async () => {
    const q = await getStorageQuota();
    const w = await getStorageWarning();
    setQuota(q);
    setWarning(w);
  };

  return {
    quota,
    warning,
    checkStorage,
    formatBytes
  };
}
