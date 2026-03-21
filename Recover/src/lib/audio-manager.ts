/**
 * Audio Manager for Recover
 *
 * Manages sound effects throughout the app with volume control and enable/disable functionality.
 * Uses Web Audio API to generate simple, pleasant tones.
 */

type SoundType =
  | 'success'      // Check-in completion, goal completion
  | 'achievement'  // Badge unlock, milestone
  | 'celebration'  // Major milestones, special events
  | 'tap'          // Button taps, interactions
  | 'notification' // Gentle notification sound
  | 'warning'      // Alert, caution
  | 'complete';    // Task completion

interface AudioSettings {
  enabled: boolean;
  volume: number; // 0.0 to 1.0
}

class AudioManager {
  private audioContext: AudioContext | null = null;
  private settings: AudioSettings = {
    enabled: true,
    volume: 0.5,
  };

  constructor() {
    // Initialize Audio Context on first user interaction
    if (typeof window !== 'undefined') {
      this.loadSettings();
    }
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings() {
    try {
      const stored = localStorage.getItem('audio_settings');
      if (stored) {
        this.settings = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings() {
    try {
      localStorage.setItem('audio_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }
  }

  /**
   * Initialize Audio Context (must be called after user interaction)
   */
  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  /**
   * Create a tone using Web Audio API
   */
  private createTone(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    fadeOut: boolean = true
  ): void {
    if (!this.settings.enabled) return;

    try {
      const ctx = this.initAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      const volume = this.settings.volume;
      gainNode.gain.setValueAtTime(volume, ctx.currentTime);

      if (fadeOut) {
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      } else {
        gainNode.gain.setValueAtTime(volume, ctx.currentTime + duration);
      }

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      console.error('Failed to play tone:', error);
    }
  }


  /**
   * Play sound effect by type
   */
  play(type: SoundType): void {
    if (!this.settings.enabled) return;

    switch (type) {
      case 'success':
        // Pleasant ascending notes (C-E-G major chord)
        this.createTone(523.25, 0.15, 'sine'); // C5
        setTimeout(() => this.createTone(659.25, 0.15, 'sine'), 50); // E5
        setTimeout(() => this.createTone(783.99, 0.2, 'sine'), 100); // G5
        break;

      case 'achievement':
        // Triumphant fanfare (C-E-G-C)
        this.createTone(523.25, 0.2, 'sine'); // C5
        setTimeout(() => this.createTone(659.25, 0.2, 'sine'), 100); // E5
        setTimeout(() => this.createTone(783.99, 0.2, 'sine'), 200); // G5
        setTimeout(() => this.createTone(1046.50, 0.3, 'sine'), 300); // C6
        break;

      case 'celebration':
        // Energetic celebration sequence
        this.createTone(523.25, 0.15, 'sine'); // C5
        setTimeout(() => this.createTone(659.25, 0.15, 'sine'), 80);
        setTimeout(() => this.createTone(783.99, 0.15, 'sine'), 160);
        setTimeout(() => this.createTone(1046.50, 0.15, 'sine'), 240);
        setTimeout(() => this.createTone(1318.51, 0.25, 'sine'), 320); // E6
        break;

      case 'tap':
        // Subtle click
        this.createTone(800, 0.05, 'sine', false);
        break;

      case 'notification':
        // Gentle two-tone
        this.createTone(659.25, 0.15, 'sine'); // E5
        setTimeout(() => this.createTone(783.99, 0.2, 'sine'), 100); // G5
        break;

      case 'warning':
        // Attention-getting low tone
        this.createTone(392.00, 0.3, 'square'); // G4
        break;

      case 'complete':
        // Satisfying completion sound
        this.createTone(523.25, 0.2, 'sine'); // C5
        setTimeout(() => this.createTone(783.99, 0.25, 'sine'), 150); // G5
        break;

      default:
        console.warn(`Unknown sound type: ${type}`);
    }
  }

  /**
   * Enable sound effects
   */
  enable(): void {
    this.settings.enabled = true;
    this.saveSettings();
  }

  /**
   * Disable sound effects
   */
  disable(): void {
    this.settings.enabled = false;
    this.saveSettings();
  }

  /**
   * Toggle sound effects
   */
  toggle(): boolean {
    this.settings.enabled = !this.settings.enabled;
    this.saveSettings();
    return this.settings.enabled;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Check if sounds are enabled
   */
  isEnabled(): boolean {
    return this.settings.enabled;
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.settings.volume;
  }
}

// Export singleton instance
export const audioManager = new AudioManager();

// Export type for use in other files
export type { SoundType };
