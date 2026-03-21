/**
 * useModal Hook
 *
 * Reusable hook for managing modal state (open/close)
 * Eliminates the need for repetitive useState declarations for modals
 */

import { useState, useCallback } from 'react';

export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    // Aliases for common naming patterns
    show: open,
    hide: close,
  };
}

/**
 * useMultiModal Hook
 *
 * Manage multiple modals with a single hook
 *
 * @example
 * const modals = useMultiModal(['create', 'edit', 'delete']);
 * modals.create.open();
 * modals.edit.close();
 */
export function useMultiModal<T extends string>(
  modalNames: readonly T[]
): Record<T, ReturnType<typeof useModal>> {
  const modals = {} as Record<T, ReturnType<typeof useModal>>;

  modalNames.forEach((name) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    modals[name] = useModal();
  });

  return modals;
}
