/**
 * Device Encryption (encryption at rest)
 *
 * Provides AES-256-GCM encryption for all PHI persisted on the device.
 *
 * The master key is a NON-EXTRACTABLE WebCrypto `CryptoKey` stored in
 * IndexedDB. Because it is non-extractable, application JavaScript (and any
 * attacker who later reads the IndexedDB files) cannot export the raw key
 * bytes — crypto operations only ever reference the key by handle. Combined
 * with `android:allowBackup="false"`, this keeps the on-disk store contents
 * (journal entries, cravings, medications, counselor messages, treatment
 * plans) as ciphertext that cannot be trivially recovered from a lost or
 * backed-up device.
 *
 * NATIVE HARDENING (follow-up): on iOS/Android the IndexedDB key store lives
 * in the app sandbox but is not hardware-/Keystore-backed. A future change
 * should store the key in the iOS Keychain / Android Keystore via a secure
 * storage plugin and gate its release on biometric unlock. The interface
 * here (getOrCreateMasterKey / wipeMasterKey) is the seam for that.
 */

const DB_NAME = 'recover-secure';
const STORE_NAME = 'keys';
const KEY_ID = 'master-key-v1';
const MAGIC = 'rcv1'; // ciphertext envelope prefix: `${MAGIC}:${base64}`

const cryptoObj: Crypto | undefined =
  typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;

function hasSubtle(): boolean {
  return !!cryptoObj && !!cryptoObj.subtle;
}

function hasIndexedDB(): boolean {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

// In-memory key used only when IndexedDB is unavailable (unit tests / SSR).
// Real browsers and Capacitor WebViews always have IndexedDB, so production
// data is always backed by the persistent IndexedDB key.
let ephemeralKey: CryptoKey | null = null;
let cachedKey: CryptoKey | null = null;
// Shared in-flight init promise. Multiple stores hydrate concurrently on app
// load; without this they could each generate a DIFFERENT key and clobber the
// IndexedDB record (read-then-write is not atomic), leaving data encrypted
// under a key that no longer exists. Memoizing the promise serializes init so
// every caller resolves to the same key.
let keyInitPromise: Promise<CryptoKey> | null = null;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function idbGet(db: IDBDatabase, key: string): Promise<CryptoKey | undefined> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result as CryptoKey | undefined);
    req.onerror = () => reject(req.error);
  });
}

function idbPut(db: IDBDatabase, key: string, value: CryptoKey): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function idbDelete(db: IDBDatabase, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Get the device master key, creating and persisting it on first use.
 * The key is generated non-extractable so its raw bytes never leave WebCrypto.
 */
export async function getOrCreateMasterKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  if (keyInitPromise) return keyInitPromise;

  keyInitPromise = (async () => {
    if (!hasSubtle()) {
      throw new Error('WebCrypto SubtleCrypto is unavailable; cannot encrypt device data');
    }
    const subtle = cryptoObj!.subtle;

    if (!hasIndexedDB()) {
      if (!ephemeralKey) {
        ephemeralKey = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
          'encrypt',
          'decrypt',
        ]);
      }
      cachedKey = ephemeralKey;
      return ephemeralKey;
    }

    const db = await openDb();
    try {
      const existing = await idbGet(db, KEY_ID);
      if (existing) {
        cachedKey = existing;
        return existing;
      }
      const key = await subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
        'encrypt',
        'decrypt',
      ]);
      await idbPut(db, KEY_ID, key);
      cachedKey = key;
      return key;
    } finally {
      db.close();
    }
  })();

  try {
    return await keyInitPromise;
  } catch (error) {
    // Allow a later retry rather than caching a rejected promise forever.
    keyInitPromise = null;
    throw error;
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** True if a stored value is one of our encrypted envelopes. */
export function isEncrypted(value: string): boolean {
  return value.startsWith(`${MAGIC}:`);
}

/**
 * Encrypt a UTF-8 string. Output is `rcv1:<base64(iv|ciphertext)>`.
 */
export async function encryptString(plaintext: string): Promise<string> {
  const key = await getOrCreateMasterKey();
  const iv = cryptoObj!.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(plaintext);
  const ciphertext = await cryptoObj!.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return `${MAGIC}:${bytesToBase64(combined)}`;
}

/**
 * Decrypt a value produced by `encryptString`. Throws on tampering or a
 * missing/incorrect key.
 */
export async function decryptString(envelope: string): Promise<string> {
  if (!isEncrypted(envelope)) {
    throw new Error('Value is not an encrypted envelope');
  }
  const key = await getOrCreateMasterKey();
  const combined = base64ToBytes(envelope.slice(MAGIC.length + 1));
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  const plaintext = await cryptoObj!.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}

/**
 * Destroy the master key so all data encrypted with it becomes permanently
 * unrecoverable ("crypto-shredding"). Used by the device-wipe path.
 */
export async function wipeMasterKey(): Promise<void> {
  cachedKey = null;
  ephemeralKey = null;
  keyInitPromise = null;
  if (!hasIndexedDB()) return;
  try {
    const db = await openDb();
    try {
      await idbDelete(db, KEY_ID);
    } finally {
      db.close();
    }
  } catch {
    // best effort
  }
}
