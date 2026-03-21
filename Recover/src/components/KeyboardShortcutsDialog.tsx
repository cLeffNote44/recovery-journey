/**
 * Keyboard Shortcuts Dialog
 *
 * Displays available keyboard shortcuts to users
 */

import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Keyboard } from 'lucide-react';
import { GLOBAL_SHORTCUTS, formatShortcut } from '@/hooks/useKeyboardShortcuts';
import type { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsDialog = memo(function KeyboardShortcutsDialog({
  isOpen,
  onClose,
}: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate the app faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Navigation Shortcuts */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Navigation</h3>
            <div className="space-y-2">
              {GLOBAL_SHORTCUTS.filter((s) =>
                s.description.startsWith('Go to')
              ).map((shortcut, index) => (
                <ShortcutRow
                  key={index}
                  shortcut={shortcut as KeyboardShortcut}
                />
              ))}
            </div>
          </div>

          {/* Actions Shortcuts */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">Actions</h3>
            <div className="space-y-2">
              {GLOBAL_SHORTCUTS.filter(
                (s) =>
                  !s.description.startsWith('Go to') &&
                  !s.description.includes('Close')
              ).map((shortcut, index) => (
                <ShortcutRow
                  key={index}
                  shortcut={shortcut as KeyboardShortcut}
                />
              ))}
            </div>
          </div>

          {/* General Shortcuts */}
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">General</h3>
            <div className="space-y-2">
              {GLOBAL_SHORTCUTS.filter((s) =>
                s.description.includes('Close')
              ).map((shortcut, index) => (
                <ShortcutRow
                  key={index}
                  shortcut={shortcut as KeyboardShortcut}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 p-3 bg-muted rounded-lg text-sm text-muted-foreground">
          <p className="font-semibold mb-1">Pro Tip:</p>
          <p>
            Press <kbd className="px-2 py-1 bg-background border rounded text-xs">Ctrl+K</kbd> at
            any time to see this shortcuts menu
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
});

function ShortcutRow({ shortcut }: { shortcut: KeyboardShortcut }) {
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm">{shortcut.description}</span>
        <kbd className="px-3 py-1.5 bg-muted border rounded text-xs font-mono font-semibold">
          {formatShortcut(shortcut)}
        </kbd>
      </div>
    </Card>
  );
}
