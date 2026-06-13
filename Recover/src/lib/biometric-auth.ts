/**
 * Biometric Authentication Manager
 *
 * Handles Face ID, Touch ID, Fingerprint, and Face Unlock authentication
 * with PIN fallback for device security.
 */

import { Capacitor } from '@capacitor/core';
import type {
  BiometricAuthPlugin,
  CheckBiometryResult,
  BiometricAuthError
} from '@/types/biometric-auth';

export interface BiometricSettings {
  enabled: boolean;
  requireOnStartup: boolean;
  requireOnResume: boolean;
  timeoutMinutes: number;
  pinEnabled: boolean;
  pinHash?: string;
  failedAttempts?: number;
  lockoutUntil?: number; // Timestamp when lockout expires
  lastFailedAttempt?: number; // Timestamp of last failed attempt
}

export interface BiometricAvailability {
  isAvailable: boolean;
  biometryType: 'none' | 'touchId' | 'faceId' | 'fingerprint' | 'face' | 'iris';
  reason?: string;
}

export interface PinValidationResult {
  success: boolean;
  error?: string;
  remainingAttempts?: number;
  lockoutSeconds?: number;
}

// Security constants for PIN rate limiting
const MAX_PIN_ATTEMPTS = 5; // Maximum failed attempts before lockout
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes lockout
const ATTEMPT_RESET_DURATION_MS = 30 * 60 * 1000; // Reset counter after 30 minutes of no attempts
const PIN_PBKDF2_ITERATIONS = 100000; // PBKDF2 iterations for PIN hashing

class BiometricAuthManager {
  private static instance: BiometricAuthManager;
  private settings: BiometricSettings;
  private lastAuthTime: number = 0;
  private isNative: boolean;

  private constructor() {
    this.isNative = Capacitor.isNativePlatform();
    this.settings = this.loadSettings();
  }

  public static getInstance(): BiometricAuthManager {
    if (!BiometricAuthManager.instance) {
      BiometricAuthManager.instance = new BiometricAuthManager();
    }
    return BiometricAuthManager.instance;
  }

  /**
   * Check if biometric authentication is available on this device
   */
  public async checkAvailability(): Promise<BiometricAvailability> {
    if (!this.isNative) {
      return {
        isAvailable: false,
        biometryType: 'none',
        reason: 'Biometric authentication only available on native platforms'
      };
    }

    try {
      // Dynamically import only on native platforms
      const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth') as { BiometricAuth: BiometricAuthPlugin };
      const result = await BiometricAuth.checkBiometry();

      // Map the BiometryType enum to our string types
      let mappedType: BiometricAvailability['biometryType'] = 'none';
      if (result.biometryType !== undefined && result.biometryType !== null) {
        const typeStr = String(result.biometryType).toLowerCase();
        if (typeStr.includes('touchid') || typeStr.includes('touch')) {
          mappedType = 'touchId';
        } else if (typeStr.includes('faceid')) {
          mappedType = 'faceId';
        } else if (typeStr.includes('face')) {
          mappedType = 'face';
        } else if (typeStr.includes('fingerprint')) {
          mappedType = 'fingerprint';
        } else if (typeStr.includes('iris')) {
          mappedType = 'iris';
        }
      }

      return {
        isAvailable: result.isAvailable,
        biometryType: mappedType,
        reason: result.reason
      };
    } catch (error) {
      console.error('Error checking biometric availability:', error);
      return {
        isAvailable: false,
        biometryType: 'none',
        reason: 'Error checking biometric availability'
      };
    }
  }

  /**
   * Authenticate using biometrics
   */
  public async authenticate(reason: string = 'Authenticate to unlock Recover'): Promise<boolean> {
    if (!this.isNative) {
      // On web, fall back to PIN if enabled
      if (this.settings.pinEnabled) {
        return false; // Will trigger PIN prompt
      }
      return true; // No auth on web
    }

    try {
      // Dynamically import only on native platforms
      const { BiometricAuth } = await import('@aparajita/capacitor-biometric-auth') as { BiometricAuth: BiometricAuthPlugin };
      await BiometricAuth.authenticate({
        reason,
        cancelTitle: 'Cancel',
        allowDeviceCredential: true, // Allow device PIN as fallback
        iosFallbackTitle: 'Use PIN',
        androidTitle: 'Authenticate',
        androidSubtitle: reason,
        androidConfirmationRequired: false
      });

      this.lastAuthTime = Date.now();
      return true;
    } catch (error) {
      // Check error type and handle accordingly
      const biometricError = error as BiometricAuthError;
      const errorCode = biometricError?.code;

      // User cancelled or failed auth (common error codes)
      if (errorCode === 10 || errorCode === 13 || errorCode === 'USER_CANCEL') {
        return false;
      }

      // Biometrics not available, fall back to PIN
      if (this.settings.pinEnabled) {
        return false; // Will trigger PIN prompt
      }

      return false;
    }
  }

  /**
   * Check if authentication is required based on timeout
   */
  public isAuthRequired(): boolean {
    if (!this.settings.enabled) {
      return false;
    }

    // Check if timeout has expired
    const timeoutMs = this.settings.timeoutMinutes * 60 * 1000;
    const timeSinceAuth = Date.now() - this.lastAuthTime;

    return timeSinceAuth > timeoutMs;
  }

  /**
   * Check if PIN attempts are currently locked out
   */
  public isPinLockedOut(): { locked: boolean; remainingSeconds?: number } {
    const now = Date.now();

    // Check if we're in lockout period
    if (this.settings.lockoutUntil && this.settings.lockoutUntil > now) {
      const remainingMs = this.settings.lockoutUntil - now;
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return { locked: true, remainingSeconds };
    }

    // Lockout expired, reset attempt counter
    if (this.settings.lockoutUntil && this.settings.lockoutUntil <= now) {
      this.settings.failedAttempts = 0;
      this.settings.lockoutUntil = undefined;
      this.saveSettings();
    }

    // Reset failed attempts if it's been a while since last attempt
    if (this.settings.lastFailedAttempt &&
        (now - this.settings.lastFailedAttempt) > ATTEMPT_RESET_DURATION_MS) {
      this.settings.failedAttempts = 0;
      this.settings.lastFailedAttempt = undefined;
      this.saveSettings();
    }

    return { locked: false };
  }

  /**
   * Validate PIN with rate limiting
   */
  public async validatePin(pin: string): Promise<PinValidationResult> {
    // Check if locked out
    const lockoutStatus = this.isPinLockedOut();
    if (lockoutStatus.locked) {
      return {
        success: false,
        error: `Too many failed attempts. Try again in ${lockoutStatus.remainingSeconds}s`,
        lockoutSeconds: lockoutStatus.remainingSeconds
      };
    }

    if (!this.settings.pinHash) {
      return {
        success: false,
        error: 'PIN not configured'
      };
    }

    const isValid = await this.verifyPin(pin, this.settings.pinHash);

    if (isValid) {
      // Successful authentication - reset attempts and update last auth time
      this.settings.failedAttempts = 0;
      this.settings.lastFailedAttempt = undefined;
      this.settings.lockoutUntil = undefined;
      this.saveSettings();
      this.lastAuthTime = Date.now();

      return { success: true };
    } else {
      // Failed attempt - increment counter
      const failedAttempts = (this.settings.failedAttempts || 0) + 1;
      this.settings.failedAttempts = failedAttempts;
      this.settings.lastFailedAttempt = Date.now();

      // Check if we should lock out
      if (failedAttempts >= MAX_PIN_ATTEMPTS) {
        this.settings.lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        this.saveSettings();

        return {
          success: false,
          error: `Too many failed attempts. Account locked for ${LOCKOUT_DURATION_MS / 60000} minutes`,
          lockoutSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000)
        };
      }

      this.saveSettings();
      const remainingAttempts = MAX_PIN_ATTEMPTS - failedAttempts;

      return {
        success: false,
        error: `Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining`,
        remainingAttempts
      };
    }
  }

  /**
   * Set or update PIN
   */
  public async setPin(pin: string): Promise<void> {
    this.settings.pinHash = await this.hashPin(pin);
    this.settings.pinEnabled = true;
    this.saveSettings();
  }

  /**
   * Remove PIN
   */
  public removePin(): void {
    this.settings.pinHash = undefined;
    this.settings.pinEnabled = false;
    this.saveSettings();
  }

  /**
   * Hash a PIN for storage using PBKDF2-SHA-256 with a random per-PIN salt.
   * Returns `pbkdf2$<iterations>$<saltB64>$<hashB64>`.
   *
   * (A non-cryptographic 32-bit hash was previously used here, which a 4-6
   * digit PIN could be brute-forced against in milliseconds.)
   */
  private async hashPin(pin: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hash = await this.derivePin(pin, salt, PIN_PBKDF2_ITERATIONS);
    return `pbkdf2$${PIN_PBKDF2_ITERATIONS}$${this.toB64(salt)}$${this.toB64(hash)}`;
  }

  /**
   * Verify a PIN against a stored `pbkdf2$...` hash in constant time.
   */
  private async verifyPin(pin: string, stored: string): Promise<boolean> {
    const parts = stored.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      // Legacy/unknown format — cannot be trusted; require the PIN to be reset.
      return false;
    }
    const iterations = parseInt(parts[1], 10) || PIN_PBKDF2_ITERATIONS;
    const salt = this.fromB64(parts[2]);
    const expected = this.fromB64(parts[3]);
    const actual = await this.derivePin(pin, salt, iterations);
    return this.timingSafeEqual(actual, expected);
  }

  private async derivePin(pin: string, salt: Uint8Array, iterations: number): Promise<Uint8Array> {
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(pin),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const bits = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    return new Uint8Array(bits);
  }

  private timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
    return diff === 0;
  }

  private toB64(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes));
  }

  private fromB64(b64: string): Uint8Array {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  /**
   * Update settings
   */
  public updateSettings(settings: Partial<BiometricSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.saveSettings();
  }

  /**
   * Get current settings
   */
  public getSettings(): BiometricSettings {
    return { ...this.settings };
  }

  /**
   * Enable biometric authentication
   */
  public async enable(): Promise<boolean> {
    const availability = await this.checkAvailability();

    if (!availability.isAvailable) {
      return false;
    }

    this.settings.enabled = true;
    this.saveSettings();
    return true;
  }

  /**
   * Disable biometric authentication
   */
  public disable(): void {
    this.settings.enabled = false;
    this.saveSettings();
  }

  /**
   * Mark as authenticated (for testing or manual override)
   */
  public markAuthenticated(): void {
    this.lastAuthTime = Date.now();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): BiometricSettings {
    const stored = localStorage.getItem('biometric-settings');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error loading biometric settings:', error);
      }
    }

    // Default settings
    return {
      enabled: false,
      requireOnStartup: true,
      requireOnResume: true,
      timeoutMinutes: 5,
      pinEnabled: false
    };
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    localStorage.setItem('biometric-settings', JSON.stringify(this.settings));
  }

  /**
   * Clear authentication state (for logout)
   */
  public clearAuthState(): void {
    this.lastAuthTime = 0;
  }
}

// Export singleton instance
export const biometricAuthManager = BiometricAuthManager.getInstance();

// Export helper functions for convenience
export const checkBiometricAvailability = () => biometricAuthManager.checkAvailability();
export const authenticateBiometric = (reason?: string) => biometricAuthManager.authenticate(reason);
export const isAuthRequired = () => biometricAuthManager.isAuthRequired();
export const validatePin = (pin: string): Promise<PinValidationResult> => biometricAuthManager.validatePin(pin);
export const isPinLockedOut = () => biometricAuthManager.isPinLockedOut();
export const setPin = (pin: string): Promise<void> => biometricAuthManager.setPin(pin);
export const removePin = () => biometricAuthManager.removePin();
export const getBiometricSettings = () => biometricAuthManager.getSettings();
export const updateBiometricSettings = (settings: Partial<BiometricSettings>) =>
  biometricAuthManager.updateSettings(settings);
