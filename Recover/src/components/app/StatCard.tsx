import { memo } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

/**
 * StatCard Component
 *
 * Displays a statistic with an icon, label, and value in a card format.
 * Useful for dashboard metrics and key performance indicators.
 *
 * @example
 * ```tsx
 * <StatCard
 *   icon={Trophy}
 *   label="Days Sober"
 *   value={30}
 *   gradient="from-slate-600 to-gray-700"
 *   onClick={() => navigate('/analytics')}
 * />
 * ```
 */
interface StatCardProps {
  /** Lucide icon component to display */
  icon: LucideIcon;
  /** Descriptive label for the statistic */
  label: string;
  /** The statistic value to display (number or formatted string) */
  value: string | number;
  /** Tailwind gradient classes for the icon background (e.g., "from-slate-600 to-gray-700") */
  gradient: string;
  /** Optional click handler to make the card interactive */
  onClick?: () => void;
}

export const StatCard = memo(function StatCard({ icon: Icon, label, value, gradient, onClick }: StatCardProps) {
  return (
    <Card
      className={`${onClick ? 'cursor-pointer hover:scale-105' : ''} transition-transform`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center mb-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
});

