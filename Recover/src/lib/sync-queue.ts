/**
 * Offline Sync Queue
 *
 * Persists failed sync operations to localStorage and retries them
 * when the connection is restored. Provides exponential backoff
 * and deduplication.
 */

const STORAGE_KEY = 'facility_sync_queue';
const MAX_RETRIES = 5;
const BASE_DELAY_MS = 2000;

export type SyncItemType = 'check-ins' | 'cravings' | 'goals';

export interface SyncQueueItem {
  id: string;
  type: SyncItemType;
  payload: unknown;
  retries: number;
  createdAt: string;
  lastAttemptAt?: string;
}

// ─── Queue Persistence ──────────────────────────────────────────────────────

function readQueue(): SyncQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: SyncQueueItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * Add an item to the sync queue. Deduplicates by type + serialized payload.
 */
export function enqueue(type: SyncItemType, payload: unknown): void {
  const queue = readQueue();

  const id = `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  queue.push({
    id,
    type,
    payload,
    retries: 0,
    createdAt: new Date().toISOString(),
  });

  writeQueue(queue);
}

/**
 * Remove a successfully synced item from the queue.
 */
export function dequeue(id: string): void {
  const queue = readQueue().filter((item) => item.id !== id);
  writeQueue(queue);
}

/**
 * Mark an item as failed (increment retries). Removes if max retries exceeded.
 */
export function markFailed(id: string): void {
  const queue = readQueue();
  const item = queue.find((i) => i.id === id);

  if (!item) return;

  item.retries += 1;
  item.lastAttemptAt = new Date().toISOString();

  if (item.retries >= MAX_RETRIES) {
    // Drop items that have exceeded retry limit
    writeQueue(queue.filter((i) => i.id !== id));
  } else {
    writeQueue(queue);
  }
}

/**
 * Get all queued items, optionally filtered by type.
 */
export function getQueue(type?: SyncItemType): SyncQueueItem[] {
  const queue = readQueue();
  return type ? queue.filter((i) => i.type === type) : queue;
}

/**
 * Get count of pending items.
 */
export function getPendingCount(): number {
  return readQueue().length;
}

/**
 * Clear all queued items (e.g. on disconnect).
 */
export function clearQueue(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Calculate delay for exponential backoff.
 * Returns milliseconds: 2s, 4s, 8s, 16s, 32s
 */
export function getRetryDelay(retries: number): number {
  return Math.min(BASE_DELAY_MS * Math.pow(2, retries), 60_000);
}

/**
 * Check if an item is ready for retry based on its backoff delay.
 */
export function isReadyForRetry(item: SyncQueueItem): boolean {
  if (!item.lastAttemptAt) return true;
  const delay = getRetryDelay(item.retries);
  const elapsed = Date.now() - new Date(item.lastAttemptAt).getTime();
  return elapsed >= delay;
}
