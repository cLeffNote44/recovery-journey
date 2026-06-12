/**
 * Device encryption tests.
 *
 * jsdom has no IndexedDB, so these exercise the in-memory key fallback. The
 * AES-GCM round-trip behaviour is identical; only the key's persistence
 * differs (IndexedDB in real browsers/WebViews).
 */

import { describe, it, expect } from 'vitest';
import { encryptString, decryptString, isEncrypted, wipeMasterKey } from './device-encryption';

describe('device-encryption', () => {
  it('round-trips a UTF-8 string', async () => {
    const plaintext = JSON.stringify({ note: 'craving at 3pm', mood: 4, emoji: '😬' });
    const envelope = await encryptString(plaintext);

    expect(isEncrypted(envelope)).toBe(true);
    expect(envelope).not.toContain('craving');

    const decrypted = await decryptString(envelope);
    expect(decrypted).toBe(plaintext);
  });

  it('produces a different ciphertext each time (random IV)', async () => {
    const a = await encryptString('same input');
    const b = await encryptString('same input');
    expect(a).not.toBe(b);
    expect(await decryptString(a)).toBe('same input');
    expect(await decryptString(b)).toBe('same input');
  });

  it('treats non-envelope values as not encrypted', () => {
    expect(isEncrypted('{"plain":"json"}')).toBe(false);
    expect(isEncrypted('rcv1:abc')).toBe(true);
  });

  it('fails to decrypt a non-envelope value', async () => {
    await expect(decryptString('{"plain":"json"}')).rejects.toThrow();
  });

  it('crypto-shred makes prior ciphertext unrecoverable', async () => {
    const envelope = await encryptString('secret');
    await wipeMasterKey();
    // After the key is destroyed a fresh key is generated; the old ciphertext
    // can no longer be decrypted (GCM auth tag fails).
    await expect(decryptString(envelope)).rejects.toThrow();
  });
});
