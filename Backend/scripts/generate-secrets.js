#!/usr/bin/env node
/**
 * Generate Cryptographically Secure Secrets for Recovery Journey
 *
 * Usage:
 *   node scripts/generate-secrets.js
 *
 * This script generates secure random secrets for:
 * - JWT_SECRET (for access tokens)
 * - JWT_REFRESH_SECRET (for refresh tokens)
 * - Database password suggestion
 *
 * Copy the output to your .env file.
 */

import crypto from 'crypto';

console.log('');
console.log('='.repeat(70));
console.log('  RECOVERY JOURNEY - SECURE SECRET GENERATOR');
console.log('='.repeat(70));
console.log('');
console.log('Copy these values to your .env file:');
console.log('');
console.log('-'.repeat(70));

// Generate 64-byte (512-bit) secrets as hex strings (128 characters)
const jwtSecret = crypto.randomBytes(64).toString('hex');
const jwtRefreshSecret = crypto.randomBytes(64).toString('hex');
const dbPassword = crypto.randomBytes(24).toString('base64').replace(/[+/=]/g, '');

console.log('# JWT Secrets (512-bit, hex encoded)');
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log('');
console.log(`JWT_REFRESH_SECRET="${jwtRefreshSecret}"`);
console.log('');

console.log('-'.repeat(70));
console.log('');
console.log('# Suggested Database Password (32 chars, URL-safe)');
console.log(`# DB_PASSWORD="${dbPassword}"`);
console.log('');

console.log('-'.repeat(70));
console.log('');
console.log('SECURITY NOTES:');
console.log('  - NEVER commit these secrets to version control');
console.log('  - Use different secrets for each environment (dev/staging/prod)');
console.log('  - Store production secrets in a secrets manager (AWS Secrets Manager,');
console.log('    HashiCorp Vault, etc.) rather than .env files');
console.log('  - Rotate secrets periodically (at least annually)');
console.log('');
console.log('='.repeat(70));
console.log('');
