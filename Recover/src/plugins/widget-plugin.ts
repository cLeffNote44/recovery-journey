/**
 * Capacitor Plugin for Native Widget Communication
 *
 * This plugin handles communication between the TypeScript app
 * and native iOS/Android widgets.
 */

import { registerPlugin } from '@capacitor/core';

export interface WidgetPlugin {
  /**
   * Update widget data on native platform
   * Writes to shared storage (UserDefaults on iOS, SharedPreferences on Android)
   */
  updateWidgetData(options: { data: string }): Promise<{ success: boolean }>;

  /**
   * Reload all widgets to show updated data
   * Triggers native widget refresh
   */
  reloadWidgets(): Promise<{ success: boolean }>;

  /**
   * Check if widgets are available on this platform
   */
  isAvailable(): Promise<{ available: boolean }>;
}

// Register the plugin - will use native implementation if available
const WidgetPluginNative = registerPlugin<WidgetPlugin>('WidgetPlugin', {
  web: {
    // Web fallback (no-op)
    updateWidgetData: async () => ({ success: false }),
    reloadWidgets: async () => ({ success: false }),
    isAvailable: async () => ({ available: false }),
  },
});

export default WidgetPluginNative;
