import { memo, useRef, useEffect } from 'react';
import { Home, BookOpen, Shield, Heart, Building2 } from "lucide-react";
import { useFacilityStore } from '@/stores/useFacilityStore';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Five primary daily destinations. Settings lives in the header; Calendar and
// the other secondary screens are reached from Home / Search / Notifications.
const tabs = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'journal', icon: BookOpen, label: 'Journal' },
  { id: 'prevention', icon: Shield, label: 'Prevention' },
  { id: 'wellness', icon: Heart, label: 'Wellness' },
  { id: 'facility', icon: Building2, label: 'Facility' }
];

export const BottomNav = memo(function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const unreadMessageCount = useFacilityStore((state) => state.unreadMessageCount);
  const isConnected = useFacilityStore((state) => state.isConnected);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll active tab into view
  useEffect(() => {
    if (activeButtonRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const button = activeButtonRef.current;
      const containerRect = container.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      // Center the active tab in the visible area
      const scrollLeft = button.offsetLeft - (containerRect.width / 2) + (buttonRect.width / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [activeTab]);

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50"
      role="navigation"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      <div
        ref={scrollRef}
        className="overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className="flex items-center h-16 w-full px-2"
          role="tablist"
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const showBadge = tab.id === 'facility' && unreadMessageCount > 0;

            return (
              <button
                key={tab.id}
                ref={isActive ? activeButtonRef : undefined}
                onClick={() => onTabChange(tab.id)}
                role="tab"
                aria-selected={isActive}
                aria-current={isActive ? 'page' : undefined}
                aria-label={`${tab.label} tab${isActive ? ' - currently selected' : ''}${showBadge ? `, ${unreadMessageCount} unread messages` : ''}`}
                className={`flex flex-1 flex-col items-center justify-center px-2 h-full transition-colors relative ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 mb-0.5 ${isActive ? 'fill-current' : ''} ${
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
                <span className={`text-[11px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
