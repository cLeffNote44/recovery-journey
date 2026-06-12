import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest'
import { buildApp, mockPrisma, signTestToken } from '../test/setup.js'
import { AuditLogger } from '../lib/audit-log.js'
import type { FastifyInstance } from 'fastify'

// The setup mock returns a shared logger instance from fromRequest().
const auditLogger = (AuditLogger as unknown as { fromRequest: () => { log: ReturnType<typeof vi.fn> } }).fromRequest()

describe('Admin Routes (super-admin listings)', () => {
  let app: FastifyInstance
  let superAdminToken: string
  let counselorToken: string

  beforeAll(async () => {
    app = await buildApp()
    superAdminToken = signTestToken(app, {
      id: 'admin-1',
      email: 'admin@test.com',
      role: 'SUPER_ADMIN',
      facilityId: null,
      tokenVersion: 0,
    })
    counselorToken = signTestToken(app, {
      id: 'staff-1',
      email: 'counselor@test.com',
      role: 'COUNSELOR',
      facilityId: 'facility-1',
      tokenVersion: 0,
    })
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    vi.clearAllMocks()
    // requireStaff re-checks the live record; default to an active super admin.
    mockPrisma.staff.findUnique.mockResolvedValue({
      status: 'ACTIVE',
      role: 'SUPER_ADMIN',
      facilityId: null,
      tokenVersion: 0,
    })
  })

  const superAuth = () => ({ authorization: `Bearer ${superAdminToken}` })
  const asCounselor = () => {
    mockPrisma.staff.findUnique.mockResolvedValue({
      status: 'ACTIVE',
      role: 'COUNSELOR',
      facilityId: 'facility-1',
      tokenVersion: 0,
    })
    return { authorization: `Bearer ${counselorToken}` }
  }

  // ─── Administrators ─────────────────────────────────────────────────────────

  describe('GET /api/v1/admin/administrators', () => {
    it('returns facility administrators with their facility name', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([
        {
          id: 'a1',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah@x.com',
          status: 'ACTIVE',
          lastLoginAt: null,
          facility: { name: 'Hope Recovery Center' },
        },
      ])

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/administrators',
        headers: superAuth(),
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.success).toBe(true)
      expect(body.administrators).toHaveLength(1)
      expect(body.administrators[0]).toMatchObject({
        id: 'a1',
        firstName: 'Sarah',
        facilityName: 'Hope Recovery Center',
      })
      expect(mockPrisma.staff.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'FACILITY_ADMIN' } })
      )
    })

    it('rejects non-super-admins', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/administrators',
        headers: asCounselor(),
      })
      expect(res.statusCode).toBe(403)
    })

    it('rejects unauthenticated requests', async () => {
      const res = await app.inject({ method: 'GET', url: '/api/v1/admin/administrators' })
      expect(res.statusCode).toBe(401)
    })
  })

  // ─── Clinicians ─────────────────────────────────────────────────────────────

  describe('GET /api/v1/admin/clinicians', () => {
    it('returns counselors with assigned-patient counts', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([
        {
          id: 'c1',
          firstName: 'Maria',
          lastName: 'Martinez',
          email: 'maria@x.com',
          role: 'COUNSELOR',
          status: 'ACTIVE',
          lastLoginAt: null,
          facility: { name: 'Hope Recovery Center' },
          _count: { assignedPatients: 12 },
        },
      ])

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/clinicians',
        headers: superAuth(),
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.clinicians[0]).toMatchObject({
        id: 'c1',
        patientsAssigned: 12,
        facilityName: 'Hope Recovery Center',
      })
      expect(mockPrisma.staff.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'COUNSELOR' } })
      )
    })

    it('filters by facilityId when provided', async () => {
      mockPrisma.staff.findMany.mockResolvedValue([])
      await app.inject({
        method: 'GET',
        url: '/api/v1/admin/clinicians?facilityId=facility-1',
        headers: superAuth(),
      })
      expect(mockPrisma.staff.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { role: 'COUNSELOR', facilityId: 'facility-1' } })
      )
    })
  })

  // ─── Patients (cross-facility) ──────────────────────────────────────────────

  describe('GET /api/v1/admin/patients', () => {
    it('returns patients with facility + counselor name', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([
        {
          id: 'p1',
          firstName: 'John',
          lastName: 'Doe',
          status: 'ACTIVE',
          admissionDate: new Date('2025-01-01'),
          facility: { name: 'Hope Recovery Center' },
          assignedCounselor: { firstName: 'Maria', lastName: 'Martinez' },
        },
        {
          id: 'p2',
          firstName: 'Jane',
          lastName: 'Smith',
          status: 'PENDING',
          admissionDate: new Date('2025-02-01'),
          facility: { name: 'New Beginnings' },
          assignedCounselor: null,
        },
      ])

      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/patients',
        headers: superAuth(),
      })

      expect(res.statusCode).toBe(200)
      const body = res.json()
      expect(body.patients).toHaveLength(2)
      expect(body.patients[0]).toMatchObject({
        id: 'p1',
        facilityName: 'Hope Recovery Center',
        counselorName: 'Maria Martinez',
      })
      expect(body.patients[1].counselorName).toBeNull()

      // Listing patient names cross-facility is PHI access — it must be audited
      // with a valid AuditAction (a wrong enum would silently no-op in prod).
      expect(auditLogger.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'PATIENT_SEARCH', resourceType: 'patient' })
      )
    })

    it('applies status + facility filters', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([])
      await app.inject({
        method: 'GET',
        url: '/api/v1/admin/patients?status=ACTIVE&facilityId=facility-1',
        headers: superAuth(),
      })
      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { facilityId: 'facility-1', status: 'ACTIVE' } })
      )
    })

    it('rejects non-super-admins', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/api/v1/admin/patients',
        headers: asCounselor(),
      })
      expect(res.statusCode).toBe(403)
    })
  })
})
