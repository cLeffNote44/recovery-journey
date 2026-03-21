/**
 * TypeScript definitions for @aparajita/capacitor-biometric-auth
 *
 * These types provide type safety for the biometric authentication plugin
 */

export enum BiometryType {
  none = 0,
  touchId = 1,
  faceId = 2,
  fingerprint = 3,
  face = 4,
  iris = 5
}

export enum BiometryErrorType {
  none = 0,
  authenticationFailed = 1,
  userCancel = 2,
  userFallback = 3,
  systemCancel = 4,
  passcodeNotSet = 5,
  biometryNotAvailable = 6,
  biometryNotEnrolled = 7,
  biometryLockout = 8,
  appCancel = 9,
  invalidContext = 10,
  notInteractive = 11,
  unknown = 12
}

export interface CheckBiometryResult {
  isAvailable: boolean;
  biometryType: BiometryType;
  biometryTypes: BiometryType[];
  reason?: string;
  code?: BiometryErrorType;
}

export interface AuthenticateOptions {
  reason: string;
  cancelTitle?: string;
  allowDeviceCredential?: boolean;
  iosFallbackTitle?: string;
  androidTitle?: string;
  androidSubtitle?: string;
  androidConfirmationRequired?: boolean;
  androidBiometryStrength?: 'weak' | 'strong';
}

export interface BiometricAuthPlugin {
  checkBiometry(): Promise<CheckBiometryResult>;
  authenticate(options: AuthenticateOptions): Promise<void>;
  setBiometryType(type: BiometryType): Promise<void>;
}

/**
 * Error type for biometric authentication errors
 */
export interface BiometricAuthError extends Error {
  code?: BiometryErrorType | number;
  message: string;
}
