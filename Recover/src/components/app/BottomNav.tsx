import { memo } from 'react';
import { Home, Calendar, BookOpen, Users, Shield, Settings, Heart, Building2 } from "lucide-react";
import { useFacilityStore } from '@/stores/useFacilityStore';
import { Badge } from '@/components/ui/badge';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'journal', icon: BookOpen, label: 'Journal' },
  { id: 'prevention', icon: Shield, label: 'Prevention' },
  { id: 'wellness', icon: Heart, label: 'Wellness' },
  { id: 'facility', icon: Building2, label: 'Facility' },
  { id: 'settings', icon: Settings, label: 'Settings' }
];

export const BottomNav = memo(function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const unreadMessageCount = useFacilityStore((state) => state.unreadMessageCount);
  const isConnected = useFacilityStore((state) => state.isConnected);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 pb-safe" role="navigation" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16" role="tablist">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showBadge = tab.id === 'facility' && unreadMessageCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${tab.label} tab${isActive ? ' - currently selected' : ''}${showBadge ? `, ${unreadMessageCount} unread messages` : ''}`}
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''} ${
                      tab.id === 'facility' && isConnected ? 'text-green-500' : ''
                    }`}
                    aria-hidden="true"
                  />
                  {showBadge && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-medium">
                      {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

