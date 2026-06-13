/**
 * TOTP helpers shared by 2FA setup/validation and the login flow.
 *
 * All TOTP verification must go through validateTotpCode so the
 * issuer/algorithm/digits/period parameters cannot drift between routes.
 */

import * as OTPAuth from 'otpauth'

export function createTotp(email: string, secretBase32: string): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer: 'Recovery Journey',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
}

export function validateTotpCode(email: string, secretBase32: string, code: string): boolean {
  return createTotp(email, secretBase32).validate({ token: code, window: 1 }) !== null
}
