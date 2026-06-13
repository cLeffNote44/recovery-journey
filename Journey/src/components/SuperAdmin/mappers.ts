// Map backend (camelCase) admin payloads to the SuperAdmin view types.
//
// The backend admin endpoints return camelCase fields; the SuperAdmin UI was
// authored against snake_case shapes. These adapters live in one place so the
// dashboard can consume real data without leaking the mismatch everywhere.

import type {
  DashboardStats,
  Facility,
  Administrator,
  Clinician,
  Patient,
  ActivityItem,
} from './types'

// Loose shapes of the backend (camelCase) admin payloads we adapt from.
interface BackendStats {
  totalFacilities?: number
  totalStaff?: number
  totalPatients?: number
  activePatients?: number
}

interface BackendFacility {
  id: string
  name: string
  city?: string
  state?: string
  status?: string
  patientCount?: number
  staffCount?: number
  _count?: { patients?: number; staff?: number }
  updatedAt?: string
  createdAt?: string
}

interface BackendStaff {
  id: string
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  status?: string
  facilityName?: string | null
  lastLoginAt?: string | null
  patientsAssigned?: number
}

interface BackendAdminPatient {
  id: string
  firstName?: string
  lastName?: string
  status?: string
  admissionDate?: string | null
  facilityName?: string | null
  counselorName?: string | null
}

interface BackendActivity {
  id: string
  action?: string
  description?: string
  timestamp?: string
  staff?: { firstName?: string; lastName?: string } | null
}

function daysSince(date: string | Date | null | undefined): number {
  if (!date) return 0
  const then = new Date(date).getTime()
  if (Number.isNaN(then)) return 0
  return Math.max(0, Math.floor((Date.now() - then) / 86_400_000))
}

/** Human-friendly relative time, e.g. "10 minutes ago". */
export function relativeTime(date: string | Date | null | undefined): string {
  if (!date) return ''
  const then = new Date(date).getTime()
  if (Number.isNaN(then)) return ''
  const diffMs = Date.now() - then
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function mapStats(s: BackendStats | null | undefined): DashboardStats {
  const n = (v: unknown) => (typeof v === 'number' ? v : 0)
  return {
    total_facilities: n(s?.totalFacilities),
    total_staff: n(s?.totalStaff),
    total_patients: n(s?.totalPatients),
    // "Active Today" — the backend exposes active-patient count, not daily active.
    active_today: n(s?.activePatients),
    // The backend does not track period-over-period deltas yet.
    facilities_change: 0,
    staff_change: 0,
    patients_change: 0,
    active_change: 0,
  }
}

export function mapFacility(f: BackendFacility): Facility {
  return {
    id: f.id,
    name: f.name,
    city: f.city ?? '',
    state: f.state ?? '',
    status: String(f.status ?? 'active').toLowerCase() as Facility['status'],
    patient_count: f.patientCount ?? f._count?.patients ?? 0,
    staff_count: f.staffCount ?? f._count?.staff ?? 0,
    last_active: f.updatedAt ?? f.createdAt ?? '',
  }
}

export function mapAdministrator(a: BackendStaff): Administrator {
  return {
    id: a.id,
    first_name: a.firstName ?? '',
    last_name: a.lastName ?? '',
    email: a.email ?? '',
    facility_name: a.facilityName ?? '—',
    status: String(a.status ?? 'active').toLowerCase() as Administrator['status'],
    last_login: a.lastLoginAt ?? null,
  }
}

export function mapClinician(c: BackendStaff): Clinician {
  return {
    id: c.id,
    first_name: c.firstName ?? '',
    last_name: c.lastName ?? '',
    role: String(c.role ?? 'counselor').toLowerCase() as Clinician['role'],
    facility_name: c.facilityName ?? '—',
    patients_assigned: c.patientsAssigned ?? 0,
    last_active: c.lastLoginAt ?? '',
  }
}

export function mapAdminPatient(p: BackendAdminPatient): Patient {
  return {
    id: p.id,
    first_name: p.firstName ?? '',
    last_name: p.lastName ?? '',
    facility_name: p.facilityName ?? '—',
    status: String(p.status ?? 'active').toLowerCase() as Patient['status'],
    days_in_program: daysSince(p.admissionDate),
    counselor_name: p.counselorName ?? 'Unassigned',
  }
}

export function mapActivity(a: BackendActivity): ActivityItem {
  const action = String(a.action ?? '')
  let type: ActivityItem['type'] = 'staff_login'
  if (/DELETE|DEACTIVATE|SUSPEND|FAIL|REVOK/i.test(action)) type = 'alert'
  else if (/FACILITY/i.test(action)) type = 'facility_created'
  else if (/LOGIN|LOGOUT/i.test(action)) type = 'staff_login'
  else if (/CREATE|REGISTER|ASSIGN/i.test(action)) type = 'patient_added'

  const actor = a.staff
    ? `${a.staff.firstName ?? ''} ${a.staff.lastName ?? ''}`.trim()
    : ''
  const message =
    (typeof a.description === 'string' && a.description) ||
    (actor ? `${actor}: ${action}` : action) ||
    'Activity'

  return { id: a.id, type, message, time: relativeTime(a.timestamp) }
}
