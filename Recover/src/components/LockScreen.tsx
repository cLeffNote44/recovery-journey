/**
 * LockScreen Component
 *
 * Handles app locking with biometric authentication (Face ID, Touch ID, Fingerprint)
 * and PIN fallback for enhanced privacy and security.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Fingerprint, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  biometricAuthManager,
  type BiometricAvailability
} from '@/lib/biometric-auth';
import { toast } from 'sonner';
import { pinSchema, validateForm } from '@/lib/validation-schemas';

interface LockScreenProps {
  onUnlock: () => void;
  reason?: string;
}

export function LockScreen({ onUnlock, reason }: LockScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState<BiometricAvailability | null>(null);
  const [showPinInput, setShowPinInput] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    checkBiometricAndAttemptAuth();
  }, []);

  const checkBiometricAndAttemptAuth = async () => {
    const availability = await biometricAuthManager.checkAvailability();
    setBiometricAvailable(availability);

    const settings = biometricAuthManager.getSettings();

    // Automatically attempt biometric auth if available
    if (availability.isAvailable && settings.enabled) {
      attemptBiometricAuth();
    } else if (settings.pinEnabled) {
      setShowPinInput(true);
    } else {
      // No security configured, unlock immediately
      onUnlock();
    }
  };

  const attemptBiometricAuth = async () => {
    setIsAuthenticating(true);
    setError('');

    try {
      const success = await biometricAuthManager.authenticate(
        reason || 'Unlock Recover'
      );

      if (success) {
        toast.success('Authentication successful');
        onUnlock();
      } else {
        // Failed or cancelled, show PIN option
        const settings = biometricAuthManager.getSettings();
        if (settings.pinEnabled) {
          setShowPinInput(true);
          setError('Biometric authentication failed. Please enter your PIN.');
        } else {
          setError('Authentication required to continue');
        }
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      const settings = biometricAuthManager.getSettings();
      if (settings.pinEnabled) {
        setShowPinInput(true);
        setError('Please enter your PIN');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate PIN format with Zod
    const validation = validateForm(pinSchema, { pin });
    if (!validation.success) {
      const errorMessage = Object.values(validation.errors)[0];
      setError(errorMessage || 'Invalid PIN format');
      return;
    }

    // Validate PIN with rate limiting
    const result = biometricAuthManager.validatePin(pin);

    if (result.success) {
      toast.success('PIN correct');
      onUnlock();
    } else {
      setError(result.error || 'Incorrect PIN. Please try again.');
      setPin('');

      // Show toast for lockout
      if (result.lockoutSeconds) {
        toast.error(result.error, { duration: 5000 });
      }
    }
  };

  const getBiometricIcon = () => {
    if (!biometricAvailable) return <Fingerprint className="w-16 h-16" />;

    switch (biometricAvailable.biometryType) {
      case 'faceId':
      case 'face':
        return <ShieldCheck className="w-16 h-16" />;
      case 'touchId':
      case 'fingerprint':
        return <Fingerprint className="w-16 h-16" />;
      case 'iris':
        return <ShieldCheck className="w-16 h-16" />;
      default:
        return <Lock className="w-16 h-16" />;
    }
  };

  const getBiometricLabel = () => {
    if (!biometricAvailable) return 'Authenticate';

    switch (biometricAvailable.biometryType) {
      case 'faceId':
        return 'Face ID';
      case 'face':
        return 'Face Unlock';
      case 'touchId':
        return 'Touch ID';
      case 'fingerprint':
        return 'Fingerprint';
      case 'iris':
        return 'Iris Scan';
      default:
        return 'Biometric';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-primary/10 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-4"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          {/* App Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
              <Lock className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-center mb-2">Recover</h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {reason || 'Please authenticate to continue'}
          </p>

          <AnimatePresence mode="wait">
            {!showPinInput && biometricAvailable?.isAvailable ? (
              <motion.div
                key="biometric"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Biometric Icon */}
                <div className="flex justify-center">
                  <motion.div
                    animate={{
                      scale: isAuthenticating ? [1, 1.1, 1] : 1
                    }}
                    transition={{
                      duration: 1,
                      repeat: isAuthenticating ? Infinity : 0
                    }}
                    className="text-primary"
                  >
                    {getBiometricIcon()}
                  </motion.div>
                </div>

                {/* Biometric Button */}
                <Button
                  onClick={attemptBiometricAuth}
                  disabled={isAuthenticating}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isAuthenticating ? 'Authenticating...' : `Unlock with ${getBiometricLabel()}`}
                </Button>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}

                {/* PIN Fallback Option */}
                {biometricAuthManager.getSettings().pinEnabled && (
                  <Button
                    onClick={() => setShowPinInput(true)}
                    variant="ghost"
                    className="w-full"
                  >
                    Use PIN Instead
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="pin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* PIN Input Form */}
                <form onSubmit={handlePinSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="pin" className="text-sm font-medium">
                      Enter PIN
                    </label>
                    <Input
                      id="pin"
                      type="password"
                      inputMode="numeric"
                      placeholder="Enter your PIN"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      maxLength={6}
                      className="h-12 text-center text-lg tracking-widest"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Enter your {biometricAuthManager.getSettings().pinEnabled ? '4-6' : '4'} digit PIN
                    </p>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <p>{error}</p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full h-12 text-lg"
                    size="lg"
                    disabled={pin.length < 4}
                  >
                    Unlock
                  </Button>

                  {/* Back to Biometric Option */}
                  {biometricAvailable?.isAvailable && (
                    <Button
                      onClick={() => {
                        setShowPinInput(false);
                        setError('');
                        setPin('');
                      }}
                      variant="ghost"
                      className="w-full"
                      type="button"
                    >
                      Use {getBiometricLabel()} Instead
                    </Button>
                  )}
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground mt-8">
            Your data is encrypted and secure
          </p>
        </div>
      </motion.div>
    </div>
  );
}
