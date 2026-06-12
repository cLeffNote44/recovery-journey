/**
 * Authentication Middleware
 *
 * Provides JWT authentication and role-based access control for
 * both staff and patient users.
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import type { StaffRole } from '@prisma/client'
import { ApiError } from '../lib/error-handler.js'

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

// Issued after password verification when 2FA is enabled; only exchangeable
// at /auth/staff/login/2fa. Must never authenticate a regular request.
export interface TwoFactorPendingPayload {
  id: string
  type: '2fa_pending'
}

export type JwtPayload = StaffJwtPayload | PatientJwtPayload | TwoFactorPendingPayload

// Extend FastifyRequest with user data
declare module 'fastify' {
  interface FastifyRequest {
    staffUser?: StaffJwtPayload
    patientUser?: PatientJwtPayload
  }
}

// Extend @fastify/jwt types
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: JwtPayload
    user: JwtPayload
  }
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    const decoded = await request.jwtVerify<JwtPayload>()

    if ('email' in decoded) {
      request.staffUser = decoded
    } else if (decoded.type === 'patient') {
      request.patientUser = decoded
    } else {
      // 2FA-pending and any unknown payload shapes are not authenticated users
      throw new Error('Unrecognized token payload')
    }
  } catch {
    throw ApiError.unauthorized('Invalid or expired token')
  }
}

/**
 * Require staff authentication (not patient)
 */
export async function requireStaff(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await authenticate(request, reply)

  if (!request.staffUser) {
    throw ApiError.forbidden('Staff access required')
  }
}

/**
 * Require specific staff roles
 */
export function requireRoles(...roles: StaffRole[]) {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await requireStaff(request, reply)

    if (!request.staffUser || !roles.includes(request.staffUser.role)) {
      throw ApiError.forbidden(`Required role: ${roles.join(' or ')}`)
    }
  }
}

/**
 * Require patient authentication
 */
export async function requirePatient(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  await authenticate(request, reply)

  if (!request.patientUser) {
    throw ApiError.forbidden('Patient access required')
  }
}

/**
 * Require super admin role
 */
export const requireSuperAdmin = requireRoles('SUPER_ADMIN')

/**
 * Require facility admin or super admin
 */
export const requireFacilityAdmin = requireRoles('SUPER_ADMIN', 'FACILITY_ADMIN')

/**
 * Require any staff member at the same facility (or super admin)
 */
export function requireSameFacility(facilityIdParam: string = 'facilityId') {
  return async function (request: FastifyRequest, reply: FastifyReply): Promise<void> {
    await requireStaff(request, reply)

    const user = request.staffUser!
    const facilityId = (request.params as Record<string, string>)[facilityIdParam]
      ?? (request.query as Record<string, string>)[facilityIdParam]
      ?? (request.body as Record<string, string>)?.[facilityIdParam]

    // Super admins can access any facility
    if (user.role === 'SUPER_ADMIN') return

    // Staff must be at the same facility
    if (user.facilityId !== facilityId) {
      throw ApiError.forbidden('Access denied to this facility')
    }
  }
}

/**
 * Check if staff can access a patient (same facility or assigned counselor)
 */
export async function canAccessPatient(
  staffUser: StaffJwtPayload,
  patientFacilityId: string,
  _assignedCounselorId?: string | null
): Promise<boolean> {
  // Super admins can access any patient
  if (staffUser.role === 'SUPER_ADMIN') return true

  // Must be at the same facility
  if (staffUser.facilityId !== patientFacilityId) return false

  // Facility admins can access any patient in their facility
  if (staffUser.role === 'FACILITY_ADMIN') return true

  // Counselors can access patients in their facility
  // (Could be restricted to only assigned patients if needed)
  return true
}
