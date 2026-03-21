import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * EmptyState Component
 *
 * Displays a friendly empty state when no data is available.
 * Includes an icon, title, description, and optional call-to-action button.
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={FileText}
 *   title="No Journal Entries"
 *   description="Start journaling to track your recovery progress"
 *   actionLabel="Add First Entry"
 *   onAction={() => setShowJournalDialog(true)}
 *   iconColor="text-blue-500"
 * />
 * ```
 */
interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Heading text for the empty state */
  title: string;
  /** Descriptive text explaining why the state is empty and what to do */
  description: string;
  /** Optional label for the call-to-action button */
  actionLabel?: string;
  /** Optional click handler for the action button */
  onAction?: () => void;
  /** Optional Tailwind color class for the icon (defaults to text-muted-foreground) */
  iconColor?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  iconColor = 'text-muted-foreground'
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2">
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className={`rounded-full bg-muted p-6 mb-4 ${iconColor}`}>
          <Icon className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} size="lg" className="bg-gradient-to-r from-slate-600 to-gray-700">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
