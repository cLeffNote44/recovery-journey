/**
 * Fastify Type Augmentations
 *
 * Extends Fastify's built-in types with our custom properties.
 * This file must be included in tsconfig.json's "include" array.
 */

import type { StaffRole } from '@prisma/client'

// JWT payload types
export interface StaffJwtPayload {
  id: string
  email: string
  role: StaffRole
  facilityId: string | null
}

export interface PatientJwtPayload {
  id: string
  type: 'patient'
  facilityId: string
  deviceId: string
}

export type JwtPayload = StaffJwtPayload | PatientJwtPayload

declare module 'fastify' {
  interface FastifyRequest {
    staffUser?: StaffJwtPayload
    patientUser?: PatientJwtPayload
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}
