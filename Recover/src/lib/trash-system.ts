/**
 * Trash System Utilities
 * Manages soft delete, restore, and permanent deletion of items
 */

export type TrashItemType =
  | 'checkIn'
  | 'craving'
  | 'meeting'
  | 'meditation'
  | 'growthLog'
  | 'challenge'
  | 'gratitude'
  | 'contact'
  | 'goal'
  | 'sleepEntry'
  | 'exerciseEntry'
  | 'nutritionEntry'
  | 'relapse'
  | 'reason';

export interface TrashItem {
  id: string;
  type: TrashItemType;
  data: any;
  deletedAt: string;
  expiresAt: string;
}

export interface UndoAction {
  id: string;
  type: 'delete' | 'update' | 'create';
  itemType: TrashItemType;
  data: any;
  previousData?: any;
  timestamp: number;
}

const TRASH_STORAGE_KEY = 'recovery_journey_trash';
const UNDO_HISTORY_KEY = 'recovery_journey_undo';
const TRASH_RETENTION_DAYS = 30;
const UNDO_TIMEOUT_MS = 10000; // 10 seconds

/**
 * Get display name for item type
 */
export function getItemTypeDisplayName(type: TrashItemType): string {
  const names: Record<TrashItemType, string> = {
    checkIn: 'Check-in',
    craving: 'Craving',
    meeting: 'Meeting',
    meditation: 'Meditation',
    growthLog: 'Growth Log',
    challenge: 'Challenge',
    gratitude: 'Gratitude',
    contact: 'Contact',
    goal: 'Goal',
    sleepEntry: 'Sleep Entry',
    exerciseEntry: 'Exercise Entry',
    nutritionEntry: 'Nutrition Entry',
    relapse: 'Setback',
    reason: 'Reason for Sobriety'
  };
  return names[type];
}

/**
 * Get item title for display
 */
export function getItemTitle(item: TrashItem): string {
  const { type, data } = item;

  switch (type) {
    case 'checkIn':
      return `Check-in - ${formatDate(data.date)}`;
    case 'craving':
      return `Craving - ${data.trigger}`;
    case 'meeting':
      return `${data.type} - ${data.location}`;
    case 'meditation':
      return `${data.type} Meditation`;
    case 'growthLog':
      return data.title;
    case 'challenge':
      return `Challenge - ${formatDate(data.date)}`;
    case 'gratitude':
      return data.entry?.substring(0, 50) + (data.entry?.length > 50 ? '...' : '');
    case 'contact':
      return data.name;
    case 'goal':
      return data.title;
    case 'sleepEntry':
      return `Sleep - ${formatDate(data.date)}`;
    case 'exerciseEntry':
      return `${data.type} - ${formatDate(data.date)}`;
    case 'nutritionEntry':
      return `Nutrition - ${formatDate(data.date)}`;
    case 'relapse':
      return `Setback - ${formatDate(data.date)}`;
    case 'reason':
      return data.text?.substring(0, 50) + (data.text?.length > 50 ? '...' : '');
    default:
      return 'Unknown Item';
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
}

/**
 * Load trash from localStorage
 */
export function loadTrash(): TrashItem[] {
  try {
    const stored = localStorage.getItem(TRASH_STORAGE_KEY);
    if (!stored) return [];

    const items: TrashItem[] = JSON.parse(stored);

    // Filter out expired items
    const now = new Date().getTime();
    const validItems = items.filter(item => {
      const expiresAt = new Date(item.expiresAt).getTime();
      return expiresAt > now;
    });

    // Save back if we filtered any
    if (validItems.length !== items.length) {
      saveTrash(validItems);
    }

    return validItems;
  } catch (error) {
    console.error('Failed to load trash:', error);
    return [];
  }
}

/**
 * Save trash to localStorage
 */
export function saveTrash(items: TrashItem[]): void {
  try {
    localStorage.setItem(TRASH_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save trash:', error);
  }
}

/**
 * Add item to trash
 */
export function addToTrash(type: TrashItemType, data: any): TrashItem {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const trashItem: TrashItem = {
    id: `trash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    data,
    deletedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString()
  };

  const trash = loadTrash();
  trash.push(trashItem);
  saveTrash(trash);

  return trashItem;
}

/**
 * Remove item from trash (for restore or permanent delete)
 */
export function removeFromTrash(trashId: string): TrashItem | null {
  const trash = loadTrash();
  const index = trash.findIndex(item => item.id === trashId);

  if (index === -1) return null;

  const [removed] = trash.splice(index, 1);
  saveTrash(trash);

  return removed;
}

/**
 * Empty entire trash
 */
export function emptyTrash(): void {
  saveTrash([]);
}

/**
 * Get trash statistics
 */
export function getTrashStats(): { total: number; byType: Record<string, number> } {
  const trash = loadTrash();
  const byType: Record<string, number> = {};

  trash.forEach(item => {
    byType[item.type] = (byType[item.type] || 0) + 1;
  });

  return {
    total: trash.length,
    byType
  };
}

/**
 * Load undo history
 */
export function loadUndoHistory(): UndoAction[] {
  try {
    const stored = localStorage.getItem(UNDO_HISTORY_KEY);
    if (!stored) return [];

    const actions: UndoAction[] = JSON.parse(stored);

    // Filter out expired actions (older than UNDO_TIMEOUT_MS)
    const now = Date.now();
    return actions.filter(action => now - action.timestamp < UNDO_TIMEOUT_MS);
  } catch (error) {
    console.error('Failed to load undo history:', error);
    return [];
  }
}

/**
 * Save undo history
 */
export function saveUndoHistory(actions: UndoAction[]): void {
  try {
    localStorage.setItem(UNDO_HISTORY_KEY, JSON.stringify(actions));
  } catch (error) {
    console.error('Failed to save undo history:', error);
  }
}

/**
 * Add action to undo history
 */
export function addUndoAction(action: Omit<UndoAction, 'id' | 'timestamp'>): string {
  const id = `undo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const fullAction: UndoAction = {
    ...action,
    id,
    timestamp: Date.now()
  };

  const history = loadUndoHistory();
  history.push(fullAction);

  // Keep only last 10 actions
  const trimmed = history.slice(-10);
  saveUndoHistory(trimmed);

  return id;
}

/**
 * Get and remove undo action
 */
export function popUndoAction(actionId: string): UndoAction | null {
  const history = loadUndoHistory();
  const index = history.findIndex(action => action.id === actionId);

  if (index === -1) return null;

  const [removed] = history.splice(index, 1);
  saveUndoHistory(history);

  return removed;
}

/**
 * Clear expired undo actions
 */
export function clearExpiredUndoActions(): void {
  const history = loadUndoHistory();
  saveUndoHistory(history); // loadUndoHistory already filters expired
}

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(item: TrashItem): number {
  const now = new Date().getTime();
  const expiresAt = new Date(item.expiresAt).getTime();
  const diff = expiresAt - now;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
}

/**
 * Group trash items by type
 */
export function groupTrashByType(items: TrashItem[]): Record<TrashItemType, TrashItem[]> {
  const grouped: Record<TrashItemType, TrashItem[]> = {} as Record<TrashItemType, TrashItem[]>;

  items.forEach(item => {
    if (!grouped[item.type]) {
      grouped[item.type] = [];
    }
    grouped[item.type].push(item);
  });

  return grouped;
}
