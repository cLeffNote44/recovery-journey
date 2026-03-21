/**
 * Haptics Manager for Recover
 *
 * Provides haptic feedback for mobile devices using the Vibration API.
 * Falls back gracefully on devices that don't support vibration.
 */

type HapticType =
  | 'light'        // Subtle feedback for taps
  | 'medium'       // Standard feedback for actions
  | 'heavy'        // Strong feedback for important actions
  | 'success'      // Pattern for successful completion
  | 'warning'      // Pattern for warnings/alerts
  | 'error'        // Pattern for errors
  | 'selection';   // Quick feedback for selections

interface HapticSettings {
  enabled: boolean;
  intensity: number; // 0.0 to 1.0 (used to scale patterns)
}

class HapticsManager {
  private settings: HapticSettings = {
    enabled: true,
    intensity: 1.0,
  };

  private supportsVibration: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      this.supportsVibration = true;
      this.loadSettings();
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings() {
    try {
      const stored = localStorage.getItem('haptic_settings');
      if (stored) {
        this.settings = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load haptic settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings() {
    try {
      localStorage.setItem('haptic_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save haptic settings:', error);
    }
  }

  /**
   * Scale vibration pattern by intensity
   */
  private scalePattern(pattern: number[]): number[] {
    return pattern.map(duration => Math.round(duration * this.settings.intensity));
  }

  /**
   * Vibrate with pattern
   */
  private vibrate(pattern: number | number[]): void {
    if (!this.settings.enabled || !this.supportsVibration) return;

    try {
      if (Array.isArray(pattern)) {
        navigator.vibrate(this.scalePattern(pattern));
      } else {
        navigator.vibrate(Math.round(pattern * this.settings.intensity));
      }
    } catch (error) {
      console.error('Vibration failed:', error);
    }
  }

  /**
   * Trigger haptic feedback by type
   */
  impact(type: HapticType): void {
    if (!this.settings.enabled || !this.supportsVibration) return;

    switch (type) {
      case 'light':
        // Very subtle, quick vibration
        this.vibrate(10);
        break;

      case 'medium':
        // Standard feedback
        this.vibrate(20);
        break;

      case 'heavy':
        // Strong feedback
        this.vibrate(40);
        break;

      case 'success':
        // Double pulse for success
        this.vibrate([20, 50, 30]);
        break;

      case 'warning':
        // Two quick pulses
        this.vibrate([30, 100, 30]);
        break;

      case 'error':
        // Three quick pulses
        this.vibrate([20, 50, 20, 50, 20]);
        break;

      case 'selection':
        // Ultra-light for selections
        this.vibrate(5);
        break;

      default:
        console.warn(`Unknown haptic type: ${type}`);
    }
  }

  /**
   * Enable haptics
   */
  enable(): void {
    this.settings.enabled = true;
    this.saveSettings();
  }

  /**
   * Disable haptics
   */
  disable(): void {
    this.settings.enabled = false;
    this.saveSettings();
  }

  /**
   * Toggle haptics
   */
  toggle(): boolean {
    this.settings.enabled = !this.settings.enabled;
    this.saveSettings();
    return this.settings.enabled;
  }

  /**
   * Set intensity (0.0 to 1.0)
   */
  setIntensity(intensity: number): void {
    this.settings.intensity = Math.max(0, Math.min(1, intensity));
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): HapticSettings {
    return { ...this.settings };
  }

  /**
   * Check if haptics are enabled
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Check if device supports haptics
   */
  isSupported(): boolean {
    return this.supportsVibration;
  }

  /**
   * Get current intensity
   */
  getIntensity(): number {
    return this.settings.intensity;
  }

  /**
   * Custom vibration pattern
   */
  customPattern(pattern: number[]): void {
    this.vibrate(pattern);
  }
}

// Export singleton instance
export const hapticsManager = new HapticsManager();

// Export type for use in other files
export type { HapticType };
