/**
 * Keyboard Shortcuts Hook
 *
 * Provides global keyboard shortcut handling
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  action: () => void;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (isTyping && !event.ctrlKey && !event.metaKey) {
        return;
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = !shortcut.ctrl || event.ctrlKey;
        const altMatches = !shortcut.alt || event.altKey;
        const shiftMatches = !shortcut.shift || event.shiftKey;
        const metaMatches = !shortcut.meta || event.metaKey;

        if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, enabled]);
}

/**
 * Format shortcut for display
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];

  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('⌘');

  parts.push(shortcut.key.toUpperCase());

  return parts.join('+');
}

/**
 * Global keyboard shortcuts for the app
 */
export const GLOBAL_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
  {
    key: 'h',
    ctrl: true,
    description: 'Go to Home',
  },
  {
    key: 'j',
    ctrl: true,
    description: 'Go to Journal',
  },
  {
    key: 'a',
    ctrl: true,
    description: 'Go to Analytics',
  },
  {
    key: 'c',
    ctrl: true,
    description: 'Go to Calendar',
  },
  {
    key: 's',
    ctrl: true,
    description: 'Go to Settings',
  },
  {
    key: 'e',
    ctrl: true,
    shift: true,
    description: 'Open Emergency Support',
  },
  {
    key: 'k',
    ctrl: true,
    description: 'Open Keyboard Shortcuts Help',
  },
  {
    key: '/',
    ctrl: true,
    description: 'Focus Search',
  },
  {
    key: 'Escape',
    description: 'Close Modals/Dialogs',
  },
];
