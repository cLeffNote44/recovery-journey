import { useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  addToTrash,
  addUndoAction,
  popUndoAction,
  getItemTypeDisplayName,
  type TrashItemType
} from '@/lib/trash-system';

interface UseUndoDeleteOptions {
  onUndo?: () => void;
}

/**
 * Hook for managing soft delete with undo functionality
 */
export function useUndoDelete(options: UseUndoDeleteOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Soft delete an item with undo capability
   */
  const softDelete = useCallback(<T extends { id: number }>(
    type: TrashItemType,
    item: T,
    setItems: React.Dispatch<React.SetStateAction<T[]>>
  ) => {
    // Add to trash
    addToTrash(type, item);

    // Add undo action
    const actionId = addUndoAction({
      type: 'delete',
      itemType: type,
      data: item
    });

    // Remove from active list
    setItems(prev => prev.filter(i => i.id !== item.id));

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Show undo toast
    const displayName = getItemTypeDisplayName(type);
    toast(`${displayName} deleted`, {
      description: 'Click Undo to restore',
      action: {
        label: 'Undo',
        onClick: () => {
          // Restore item
          const action = popUndoAction(actionId);
          if (action) {
            setItems(prev => [...prev, action.data as T]);
            // Note: item stays in trash but user has it back
            // In a full implementation, we'd also remove from trash
            toast.success(`${displayName} restored`);
            options.onUndo?.();
          }
        }
      },
      duration: 8000
    });
  }, [options]);

  /**
   * Delete with confirmation and undo
   */
  const deleteWithConfirm = useCallback(<T extends { id: number }>(
    type: TrashItemType,
    item: T,
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    confirmMessage?: string
  ) => {
    const displayName = getItemTypeDisplayName(type);
    const message = confirmMessage || `Delete this ${displayName.toLowerCase()}?`;

    if (confirm(message)) {
      softDelete(type, item, setItems);
      return true;
    }
    return false;
  }, [softDelete]);

  return {
    softDelete,
    deleteWithConfirm
  };
}

/**
 * Simple function to soft delete without hooks
 * Use this when you can't use hooks (e.g., in event handlers)
 */
export function softDeleteItem<T extends { id: number }>(
  type: TrashItemType,
  item: T,
  setItems: React.Dispatch<React.SetStateAction<T[]>>
): string {
  // Add to trash
  addToTrash(type, item);

  // Add undo action
  const actionId = addUndoAction({
    type: 'delete',
    itemType: type,
    data: item
  });

  // Remove from active list
  setItems(prev => prev.filter(i => i.id !== item.id));

  // Show undo toast
  const displayName = getItemTypeDisplayName(type);
  toast(`${displayName} deleted`, {
    description: 'Click Undo to restore',
    action: {
      label: 'Undo',
      onClick: () => {
        const action = popUndoAction(actionId);
        if (action) {
          setItems(prev => [...prev, action.data as T]);
          toast.success(`${displayName} restored`);
        }
      }
    },
    duration: 8000
  });

  return actionId;
}
