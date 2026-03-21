/**
 * KeyboardShortcutsDialog Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { KeyboardShortcutsDialog } from './KeyboardShortcutsDialog';

// Mock the useKeyboardShortcuts hook
vi.mock('@/hooks/useKeyboardShortcuts', () => ({
  GLOBAL_SHORTCUTS: [
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
      key: 'Escape',
      description: 'Close Modals/Dialogs',
    },
  ],
  formatShortcut: (shortcut: any) => {
    const parts: string[] = [];
    if (shortcut.ctrl) parts.push('Ctrl');
    if (shortcut.shift) parts.push('Shift');
    parts.push(shortcut.key.toUpperCase());
    return parts.join('+');
  },
}));

describe('KeyboardShortcutsDialog', () => {
  it('should render when open', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsDialog isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Keyboard Shortcuts')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    const onClose = vi.fn();
    const { container } = render(
      <KeyboardShortcutsDialog isOpen={false} onClose={onClose} />
    );

    // Dialog should not be visible
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('should display navigation shortcuts', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsDialog isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Navigation')).toBeInTheDocument();
    expect(screen.getByText('Go to Home')).toBeInTheDocument();
    expect(screen.getByText('Go to Journal')).toBeInTheDocument();
    expect(screen.getByText('Go to Analytics')).toBeInTheDocument();
  });

  it('should display action shortcuts', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsDialog isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Actions')).toBeInTheDocument();
    expect(screen.getByText('Open Emergency Support')).toBeInTheDocument();
    expect(screen.getByText('Open Keyboard Shortcuts Help')).toBeInTheDocument();
  });

  it('should display general shortcuts', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsDialog isOpen={true} onClose={onClose} />);

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Close Modals/Dialogs')).toBeInTheDocument();
  });

  it('should display formatted shortcuts', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsDialog isOpen={true} onClose={onClose} />);

    // Check that shortcuts are formatted correctly
    expect(screen.getByText('Ctrl+H')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+J')).toBeInTheDocument();
    expect(screen.getByText('Ctrl+Shift+E')).toBeInTheDocument();
    expect(screen.getByText('ESCAPE')).toBeInTheDocument();
  });

  it('should display pro tip', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsDialog isOpen={true} onClose={onClose} />);

    expect(screen.getByText('Pro Tip:')).toBeInTheDocument();
    expect(
      screen.getByText(/at any time to see this shortcuts menu/i)
    ).toBeInTheDocument();
  });

  it('should have keyboard icon', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsDialog isOpen={true} onClose={onClose} />);

    // Check for lucide keyboard icon
    const icon = document.querySelector('svg.lucide-keyboard');
    expect(icon).toBeInTheDocument();
  });

  it('should display dialog description', () => {
    const onClose = vi.fn();
    render(<KeyboardShortcutsDialog isOpen={true} onClose={onClose} />);

    expect(
      screen.getByText('Use these keyboard shortcuts to navigate the app faster')
    ).toBeInTheDocument();
  });
});
