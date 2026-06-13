/**
 * Encrypted persistence adapter for Zustand stores.
 *
 * Wraps the platform `storage` (Capacitor Preferences on native, localStorage
 * on web) and transparently encrypts every persisted value with the device
 * master key (see device-encryption.ts). This is what keeps PHI in the
 * persisted Zustand stores (journal, recovery, settings, facility, etc.) as
 * ciphertext at rest.
 *
 * Legacy migration: values written before encryption was introduced are plain
 * JSON. On read we detect the absence of the encryption envelope and return
 * the plaintext as-is so the store still hydrates; the next write re-persists
 * it encrypted.
 */

import { createJSONStorage, type StateStorage } from 'zustand/middleware';
import { storage } from './storage';
import { encryptString, decryptString, isEncrypted } from './device-encryption';

const isProd = import.meta.env.PROD;

// Keys whose stored ciphertext could not be decrypted on read. We must NOT
// overwrite these on the next write: a transient decrypt failure (e.g. a key
// read hiccup) followed by an empty-state persist would permanently destroy
// recoverable PHI. Blocking the write preserves the ciphertext until the key
// is available again (a successful read or an explicit removeItem clears it).
const decryptFailed = new Set<string>();

// When true, all writes are dropped. Used by the device-wipe path so that
// resetting in-memory stores to empty does not re-create (empty) encrypted
// records after they were deleted.
let suspended = false;

/** Suspend all persistence writes (irreversible for the session — used by wipe). */
export function suspendPersistence(): void {
  suspended = true;
}

function createEncryptedStateStorage(): StateStorage {
  return {
    getItem: async (name: string): Promise<string | null> => {
      const raw = await storage.getItem(name);
      if (raw === null || raw === undefined) return null;

      if (isEncrypted(raw)) {
        try {
          const plaintext = await decryptString(raw);
          decryptFailed.delete(name);
          return plaintext;
        } catch (error) {
          // Could not decrypt (wrong/rotated/unavailable key or tampering).
          // Flag the key so a subsequent write doesn't clobber the ciphertext,
          // and hydrate from initial state for this session.
          decryptFailed.add(name);
          console.error(`[EncryptedStorage] Failed to decrypt "${name}" — preserving ciphertext, not overwriting`);
          return null;
        }
      }

      // Legacy plaintext value: return as-is; the next setItem re-encrypts it.
      decryptFailed.delete(name);
      return raw;
    },

    setItem: async (name: string, value: string): Promise<void> => {
      if (suspended) return;
      if (decryptFailed.has(name)) {
        // Don't overwrite data we failed to read — it may be recoverable.
        console.error(`[EncryptedStorage] Skipping write to "${name}": prior decrypt failed`);
        return;
      }
      try {
        const envelope = await encryptString(value);
        await storage.setItem(name, envelope);
      } catch (error) {
        // Never silently fall back to writing plaintext PHI. If encryption is
        // unavailable we drop the persisted write; the in-memory store keeps
        // working for the session.
        console.error(`[EncryptedStorage] Failed to encrypt "${name}" — not persisting`);
        if (!isProd) {
          // surface the underlying error in dev/test for debugging
          // eslint-disable-next-line no-console
          console.debug(error);
        }
      }
    },

    removeItem: async (name: string): Promise<void> => {
      decryptFailed.delete(name);
      await storage.removeItem(name);
    },
  };
}

/**
 * Build a Zustand `persist` storage that encrypts all values at rest.
 * Usage: `persist(creator, { name: 'journal-store', storage: createEncryptedStorage() })`
 */
export function createEncryptedStorage() {
  return createJSONStorage(() => createEncryptedStateStorage());
}
