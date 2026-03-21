/**
 * Home Screen Widgets
 *
 * Native home screen widgets for iOS and Android showing:
 * - Days sober counter
 * - Daily motivational quote
 * - Quick access to check-in
 * - Sobriety streak visualization
 */

import { Capacitor } from '@capacitor/core';
import type { AppData } from '@/types/app';
import { calculateDaysSober, calculateStreak } from './utils-app';
import { getQuoteOfTheDay } from './quotes';
import WidgetPlugin from '@/plugins/widget-plugin';

export interface WidgetData {
  daysSober: number;
  streak: number;
  quote: string;
  quoteAuthor: string;
  lastCheckIn: string;
  nextMilestone: {
    days: number;
    name: string;
    daysRemaining: number;
  };
  timestamp: string;
}

export interface WidgetConfig {
  enabled: boolean;
  autoUpdate: boolean;
  updateInterval: number; // minutes
  showQuote: boolean;
  showStreak: boolean;
  showMilestone: boolean;
  theme: 'light' | 'dark' | 'auto';
  size: 'small' | 'medium' | 'large';
}

const DEFAULT_WIDGET_CONFIG: WidgetConfig = {
  enabled: true,
  autoUpdate: true,
  updateInterval: 60, // 1 hour
  showQuote: true,
  showStreak: true,
  showMilestone: true,
  theme: 'auto',
  size: 'medium'
};

const STORAGE_KEY = 'widget_config';
const WIDGET_DATA_KEY = 'widget_data';

/**
 * Check if widgets are supported on this platform
 */
export function areWidgetsSupported(): boolean {
  return Capacitor.isNativePlatform() && (
    Capacitor.getPlatform() === 'ios' ||
    Capacitor.getPlatform() === 'android'
  );
}

/**
 * Get widget configuration
 */
export function getWidgetConfig(): WidgetConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_WIDGET_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading widget config:', error);
  }
  return DEFAULT_WIDGET_CONFIG;
}

/**
 * Save widget configuration
 */
export function saveWidgetConfig(config: Partial<WidgetConfig>): void {
  try {
    const current = getWidgetConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving widget config:', error);
  }
}

/**
 * Calculate next milestone
 */
function getNextMilestone(daysSober: number): { days: number; name: string; daysRemaining: number } {
  const milestones = [
    { days: 1, name: 'First Day' },
    { days: 3, name: '3 Days' },
    { days: 7, name: 'One Week' },
    { days: 14, name: 'Two Weeks' },
    { days: 30, name: 'One Month' },
    { days: 60, name: 'Two Months' },
    { days: 90, name: '90 Days' },
    { days: 180, name: 'Six Months' },
    { days: 365, name: 'One Year' },
    { days: 730, name: 'Two Years' },
    { days: 1095, name: 'Three Years' },
    { days: 1825, name: 'Five Years' },
    { days: 3650, name: 'Ten Years' }
  ];

  for (const milestone of milestones) {
    if (daysSober < milestone.days) {
      return {
        days: milestone.days,
        name: milestone.name,
        daysRemaining: milestone.days - daysSober
      };
    }
  }

  // Beyond all milestones
  const nextYear = Math.ceil(daysSober / 365) * 365;
  return {
    days: nextYear,
    name: `${nextYear / 365} Years`,
    daysRemaining: nextYear - daysSober
  };
}

/**
 * Generate widget data from app data
 */
export function generateWidgetData(appData: AppData): WidgetData {
  const daysSober = calculateDaysSober(appData.sobrietyDate);
  const streak = calculateStreak(appData.checkIns);
  const quote = getQuoteOfTheDay();
  const nextMilestone = getNextMilestone(daysSober);

  // Find most recent check-in
  const sortedCheckIns = [...appData.checkIns].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastCheckIn = sortedCheckIns[0]?.date || '';

  return {
    daysSober,
    streak,
    quote: quote.text,
    quoteAuthor: quote.author,
    lastCheckIn,
    nextMilestone,
    timestamp: new Date().toISOString()
  };
}

/**
 * Update widget data
 * On native platforms, this would communicate with the native widget extension
 */
export async function updateWidgetData(appData: AppData): Promise<boolean> {
  try {
    const config = getWidgetConfig();
    if (!config.enabled) {
      return false;
    }

    const widgetData = generateWidgetData(appData);

    // Store data locally for web preview
    localStorage.setItem(WIDGET_DATA_KEY, JSON.stringify(widgetData));

    // On native platforms, use the Capacitor plugin to communicate with widget extension
    if (areWidgetsSupported()) {
      try {
        // Convert widget data to JSON string
        const dataString = JSON.stringify(widgetData);

        // Update widget data via native plugin
        const result = await WidgetPlugin.updateWidgetData({ data: dataString });

        if (result.success) {
          // Reload widgets to show new data
          await WidgetPlugin.reloadWidgets();
          console.log('Native widget updated successfully');
        } else {
          console.warn('Failed to update native widget');
        }
      } catch (error) {
        console.error('Error communicating with native widget:', error);
      }
    }

    return true;
  } catch (error) {
    console.error('Error updating widget data:', error);
    return false;
  }
}

/**
 * Get current widget data
 */
export function getWidgetData(): WidgetData | null {
  try {
    const stored = localStorage.getItem(WIDGET_DATA_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading widget data:', error);
  }
  return null;
}

/**
 * Request widget permissions (iOS 14+, Android 12+)
 */
export async function requestWidgetPermissions(): Promise<boolean> {
  if (!areWidgetsSupported()) {
    return false;
  }

  try {
    // On native platforms, this would request permissions
    // For now, assume granted
    return true;
  } catch (error) {
    console.error('Error requesting widget permissions:', error);
    return false;
  }
}

/**
 * Open widget configuration on device
 */
export async function openWidgetConfiguration(): Promise<void> {
  if (!areWidgetsSupported()) {
    console.warn('Widgets not supported on this platform');
    return;
  }

  try {
    // On iOS: Open widget gallery
    // On Android: Open app widget picker

    // This would be implemented via a Capacitor plugin
    console.log('Opening widget configuration...');

    // For now, show instructions
    const platform = Capacitor.getPlatform();
    if (platform === 'ios') {
      alert(
        'To add widget:\n' +
        '1. Long press on home screen\n' +
        '2. Tap + in top corner\n' +
        '3. Search for "Recover"\n' +
        '4. Choose widget size and tap "Add Widget"'
      );
    } else if (platform === 'android') {
      alert(
        'To add widget:\n' +
        '1. Long press on home screen\n' +
        '2. Tap "Widgets"\n' +
        '3. Find "Recover"\n' +
        '4. Drag widget to home screen'
      );
    }
  } catch (error) {
    console.error('Error opening widget configuration:', error);
  }
}

/**
 * Schedule automatic widget updates
 */
export function scheduleWidgetUpdates(appData: AppData): void {
  const config = getWidgetConfig();

  if (!config.enabled || !config.autoUpdate) {
    return;
  }

  // Clear any existing interval
  const existingInterval = (window as any).__widgetUpdateInterval;
  if (existingInterval) {
    clearInterval(existingInterval);
  }

  // Schedule updates
  const intervalMs = config.updateInterval * 60 * 1000;
  const interval = setInterval(() => {
    updateWidgetData(appData);
  }, intervalMs);

  (window as any).__widgetUpdateInterval = interval;

  // Also update immediately
  updateWidgetData(appData);
}

/**
 * Stop automatic widget updates
 */
export function stopWidgetUpdates(): void {
  const existingInterval = (window as any).__widgetUpdateInterval;
  if (existingInterval) {
    clearInterval(existingInterval);
    delete (window as any).__widgetUpdateInterval;
  }
}

/**
 * Widget Templates for different sizes
 */
export const WIDGET_TEMPLATES = {
  small: {
    width: 170,
    height: 170,
    components: ['daysSober', 'streak']
  },
  medium: {
    width: 360,
    height: 170,
    components: ['daysSober', 'streak', 'quote']
  },
  large: {
    width: 360,
    height: 376,
    components: ['daysSober', 'streak', 'quote', 'milestone', 'checkIn']
  }
};

/**
 * Generate widget preview HTML (for web and configuration screen)
 */
export function generateWidgetPreview(size: 'small' | 'medium' | 'large', data: WidgetData, theme: 'light' | 'dark' = 'light'): string {
  const isDark = theme === 'dark';
  const bgColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = isDark ? '#f9fafb' : '#111827';
  const accentColor = '#8b5cf6';
  const secondaryColor = isDark ? '#9ca3af' : '#6b7280';

  const template = WIDGET_TEMPLATES[size];
  const { width, height } = template;

  let html = `
    <div style="
      width: ${width}px;
      height: ${height}px;
      background: ${bgColor};
      border-radius: 24px;
      padding: 16px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      color: ${textColor};
    ">
  `;

  // Days sober (always shown)
  html += `
    <div>
      <div style="font-size: 48px; font-weight: bold; color: ${accentColor}; line-height: 1;">
        ${data.daysSober}
      </div>
      <div style="font-size: 14px; color: ${secondaryColor}; margin-top: 4px;">
        Days Sober
      </div>
    </div>
  `;

  if (size === 'medium' || size === 'large') {
    // Quote
    html += `
      <div style="flex: 1; display: flex; align-items: center; margin: 12px 0;">
        <div style="font-size: 12px; line-height: 1.4; color: ${textColor}; font-style: italic;">
          "${data.quote.length > 80 ? data.quote.substring(0, 80) + '...' : data.quote}"
        </div>
      </div>
    `;
  }

  if (size === 'large') {
    // Next milestone
    html += `
      <div style="
        background: ${isDark ? '#374151' : '#f3f4f6'};
        border-radius: 12px;
        padding: 12px;
        margin-top: 12px;
      ">
        <div style="font-size: 11px; color: ${secondaryColor}; text-transform: uppercase; margin-bottom: 4px;">
          Next Milestone
        </div>
        <div style="font-size: 16px; font-weight: 600; color: ${textColor};">
          ${data.nextMilestone.name}
        </div>
        <div style="font-size: 12px; color: ${secondaryColor}; margin-top: 2px;">
          ${data.nextMilestone.daysRemaining} days to go
        </div>
      </div>
    `;
  }

  // Streak indicator (bottom)
  html += `
    <div style="
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 8px;
      font-size: 12px;
      color: ${secondaryColor};
    ">
      <div style="
        width: 6px;
        height: 6px;
        background: #10b981;
        border-radius: 50%;
      "></div>
      ${data.streak} day streak
    </div>
  `;

  html += `</div>`;

  return html;
}
