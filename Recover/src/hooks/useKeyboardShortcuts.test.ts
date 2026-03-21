/**
 * useKeyboardShortcuts Hook Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKeyboardShortcuts, formatShortcut } from './useKeyboardShortcuts';
import type { KeyboardShortcut } from './useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should call action when matching shortcut is pressed', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'k',
        ctrl: true,
        description: 'Test shortcut',
        action,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not call action when shortcut is disabled', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'k',
        ctrl: true,
        description: 'Test shortcut',
        action,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: false,
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });

  it('should not call action when typing in input', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'k',
        description: 'Test shortcut',
        action,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: true,
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      bubbles: true,
    });
    input.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });

  it('should call action when ctrl+key is pressed in input', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'k',
        ctrl: true,
        description: 'Test shortcut',
        action,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: true,
      })
    );

    const input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    });
    input.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);

    document.body.removeChild(input);
  });

  it('should handle multiple modifier keys', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'e',
        ctrl: true,
        shift: true,
        description: 'Test shortcut',
        action,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'e',
      ctrlKey: true,
      shiftKey: true,
    });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should not call action when modifiers do not match', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'k',
        ctrl: true,
        shift: true,
        description: 'Test shortcut',
        action,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: true,
      })
    );

    // Only ctrl pressed, not shift
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });

  it('should handle case-insensitive key matching', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'K',
        ctrl: true,
        description: 'Test shortcut',
        action,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should handle Escape key', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'Escape',
        description: 'Close modal',
        action,
      },
    ];

    renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: true,
      })
    );

    const event = new KeyboardEvent('keydown', {
      key: 'Escape',
    });
    window.dispatchEvent(event);

    expect(action).toHaveBeenCalledTimes(1);
  });

  it('should clean up event listeners on unmount', () => {
    const action = vi.fn();
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'k',
        ctrl: true,
        description: 'Test shortcut',
        action,
      },
    ];

    const { unmount } = renderHook(() =>
      useKeyboardShortcuts({
        shortcuts,
        enabled: true,
      })
    );

    unmount();

    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
    });
    window.dispatchEvent(event);

    expect(action).not.toHaveBeenCalled();
  });
});

describe('formatShortcut', () => {
  it('should format shortcut with ctrl', () => {
    const shortcut: KeyboardShortcut = {
      key: 'k',
      ctrl: true,
      description: 'Test',
      action: () => {},
    };

    expect(formatShortcut(shortcut)).toBe('Ctrl+K');
  });

  it('should format shortcut with multiple modifiers', () => {
    const shortcut: KeyboardShortcut = {
      key: 'e',
      ctrl: true,
      shift: true,
      description: 'Test',
      action: () => {},
    };

    expect(formatShortcut(shortcut)).toBe('Ctrl+Shift+E');
  });

  it('should format shortcut with alt', () => {
    const shortcut: KeyboardShortcut = {
      key: 'f',
      alt: true,
      description: 'Test',
      action: () => {},
    };

    expect(formatShortcut(shortcut)).toBe('Alt+F');
  });

  it('should format shortcut with meta', () => {
    const shortcut: KeyboardShortcut = {
      key: 'k',
      meta: true,
      description: 'Test',
      action: () => {},
    };

    expect(formatShortcut(shortcut)).toBe('⌘+K');
  });

  it('should format shortcut without modifiers', () => {
    const shortcut: KeyboardShortcut = {
      key: 'Escape',
      description: 'Test',
      action: () => {},
    };

    expect(formatShortcut(shortcut)).toBe('ESCAPE');
  });

  it('should uppercase the key', () => {
    const shortcut: KeyboardShortcut = {
      key: 'a',
      ctrl: true,
      description: 'Test',
      action: () => {},
    };

    expect(formatShortcut(shortcut)).toBe('Ctrl+A');
  });
});
