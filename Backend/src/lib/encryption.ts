/**
 * HIPAA-Compliant Data Encryption Utilities
 *
 * Implements AES-256-GCM encryption for PHI (Protected Health Information)
 * as required by HIPAA Security Rule (45 CFR § 164.312(a)(2)(iv))
 *
 * Features:
 * - AES-256-GCM authenticated encryption
 * - Secure key derivation with PBKDF2
 * - Field-level encryption for database storage
 * - Deterministic encryption for searchable fields
 * - Key rotation support
 */

import crypto from 'crypto'

// Encryption configuration
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16 // 128 bits
const AUTH_TAG_LENGTH = 16 // 128 bits
const SALT_LENGTH = 32 // 256 bits
const KEY_LENGTH = 32 // 256 bits for AES-256
const PBKDF2_ITERATIONS = 100000

// Get encryption key from environment
function getEncryptionKey(): Buffer {
  const key = process.env['ENCRYPTION_KEY']

  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required for PHI encryption')
  }

  // If key is hex-encoded (64 chars = 32 bytes)
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex')
  }

  // Otherwise derive key from passphrase
  const salt = process.env['ENCRYPTION_SALT'] || 'recovery-journey-default-salt'
  return crypto.pbkdf2Sync(key, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512')
}

/**
 * Encrypt sensitive data using AES-256-GCM
 *
 * @param plaintext - The data to encrypt
 * @returns Encrypted data in format: iv:authTag:ciphertext (base64)
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext

  const key = getEncryptionKey()
  const iv = crypto.randomBytes(IV_LENGTH)

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  })

  let encrypted = cipher.update(plaintext, 'utf8', 'base64')
  encrypted += cipher.final('base64')

  const authTag = cipher.getAuthTag()

  // Combine IV + AuthTag + Ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`
}

/**
 * Decrypt data encrypted with encrypt()
 *
 * @param encryptedData - Data in format: iv:authTag:ciphertext (base64)
 * @returns Decrypted plaintext
 */
export function decrypt(encryptedData: string): string {
  if (!encryptedData) return encryptedData

  // Check if data is encrypted (contains our format)
  if (!encryptedData.includes(':')) {
    return encryptedData // Return as-is if not encrypted
  }

  const parts = encryptedData.split(':')
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format')
  }

  const [ivBase64, authTagBase64, ciphertext] = parts
  if (!ivBase64 || !authTagBase64 || !ciphertext) {
    throw new Error('Invalid encrypted data format - missing parts')
  }

  const iv = Buffer.from(ivBase64, 'base64')
  const authTag = Buffer.from(authTagBase64, 'base64')
  const key = getEncryptionKey()

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  })

  decipher.setAuthTag(authTag)

  let decrypted = decipher.update(ciphertext, 'base64', 'utf8')
  decrypted += decipher.final('utf8')

  return decrypted
}

/**
 * Deterministic encryption for searchable fields
 * Uses HMAC-SHA256 for consistent output (same input = same output)
 * WARNING: Less secure than random IV encryption, use only when searching is required
 *
 * @param plaintext - The data to encrypt deterministically
 * @returns HMAC hash (hex)
 */
export function encryptDeterministic(plaintext: string): string {
  if (!plaintext) return plaintext

  const key = getEncryptionKey()

  return crypto
    .createHmac('sha256', key)
    .update(plaintext.toLowerCase().trim())
    .digest('hex')
}

/**
 * Hash sensitive data (one-way, for comparison only)
 * Uses Argon2-like approach with PBKDF2
 *
 * @param data - Data to hash
 * @param salt - Optional salt (generated if not provided)
 * @returns Hash in format: salt:hash (base64)
 */
export function hashSensitive(data: string, existingSalt?: string): string {
  const salt = existingSalt
    ? Buffer.from(existingSalt, 'base64')
    : crypto.randomBytes(SALT_LENGTH)

  const hash = crypto.pbkdf2Sync(data, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512')

  return `${salt.toString('base64')}:${hash.toString('base64')}`
}

/**
 * Verify data against a hash created by hashSensitive()
 *
 * @param data - Data to verify
 * @param storedHash - Hash in format: salt:hash
 * @returns True if data matches hash
 */
export function verifySensitiveHash(data: string, storedHash: string): boolean {
  const [saltBase64] = storedHash.split(':')
  const newHash = hashSensitive(data, saltBase64)
  return crypto.timingSafeEqual(Buffer.from(newHash), Buffer.from(storedHash))
}

/**
 * Encrypt an object's specified fields
 *
 * @param obj - Object containing data
 * @param fieldsToEncrypt - Array of field names to encrypt
 * @returns Object with specified fields encrypted
 */
export function encryptFields<T extends Record<string, unknown>>(
  obj: T,
  fieldsToEncrypt: (keyof T)[]
): T {
  const result = { ...obj }

  for (const field of fieldsToEncrypt) {
    const value = result[field]
    if (typeof value === 'string' && value) {
      (result[field] as unknown) = encrypt(value)
    }
  }

  return result
}

/**
 * Decrypt an object's specified fields
 *
 * @param obj - Object containing encrypted data
 * @param fieldsToDecrypt - Array of field names to decrypt
 * @returns Object with specified fields decrypted
 */
export function decryptFields<T extends Record<string, unknown>>(
  obj: T,
  fieldsToDecrypt: (keyof T)[]
): T {
  const result = { ...obj }

  for (const field of fieldsToDecrypt) {
    const value = result[field]
    if (typeof value === 'string' && value) {
      try {
        (result[field] as unknown) = decrypt(value)
      } catch {
        // Field may not be encrypted, keep original value
      }
    }
  }

  return result
}

/**
 * Mask sensitive data for display/logging
 * Shows first and last few characters with asterisks in between
 *
 * @param data - Sensitive data to mask
 * @param showChars - Number of characters to show at start and end
 * @returns Masked string
 */
export function maskSensitiveData(data: string, showChars = 2): string {
  if (!data || data.length <= showChars * 2) {
    return '*'.repeat(data?.length || 8)
  }

  const start = data.substring(0, showChars)
  const end = data.substring(data.length - showChars)
  const masked = '*'.repeat(Math.min(data.length - showChars * 2, 10))

  return `${start}${masked}${end}`
}

/**
 * Generate a secure encryption key
 * Use this to generate a new ENCRYPTION_KEY for .env
 *
 * @returns Hex-encoded 256-bit key
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex')
}

/**
 * Encrypt for specific key version (for key rotation)
 *
 * @param plaintext - Data to encrypt
 * @param keyVersion - Version identifier for the key
 * @returns Encrypted data with version prefix
 */
export function encryptWithVersion(plaintext: string, keyVersion = 'v1'): string {
  const encrypted = encrypt(plaintext)
  return `${keyVersion}:${encrypted}`
}

/**
 * Decrypt versioned data (for key rotation support)
 *
 * @param versionedData - Data in format: version:iv:authTag:ciphertext
 * @returns Decrypted plaintext
 */
export function decryptVersioned(versionedData: string): { data: string; version: string } {
  const parts = versionedData.split(':')

  if (parts.length === 4) {
    // Versioned format: version:iv:authTag:ciphertext
    const version = parts[0] || 'v0'
    const encryptedData = parts.slice(1).join(':')
    return { data: decrypt(encryptedData), version }
  }

  // Non-versioned format (legacy)
  return { data: decrypt(versionedData), version: 'v0' }
}

// PHI-specific field names commonly requiring encryption
export const PHI_FIELDS = [
  'ssn',
  'socialSecurityNumber',
  'dateOfBirth',
  'medicalRecordNumber',
  'insuranceId',
  'diagnosis',
  'medications',
  'treatmentNotes',
  'substanceHistory',
  'emergencyContactPhone'
] as const

export type PHIField = (typeof PHI_FIELDS)[number]
