// Shared types for SuperAdmin components

export interface Facility {
  id: string
  name: string
  city: string
  state: string
  status: 'active' | 'pending' | 'suspended'
  patient_count: number
  staff_count: number
  last_active: string
}

export interface Administrator {
  id: string
  first_name: string
  last_name: string
  email: string
  facility_name: string
  status: 'active' | 'pending'
  last_login: string | null
}

export interface Clinician {
  id: string
  first_name: string
  last_name: string
  role: 'counselor' | 'therapist' | 'case_manager' | 'nurse'
  facility_name: string
  patients_assigned: number
  last_active: string
}

export interface Patient {
  id: string
  first_name: string
  last_name: string
  facility_name: string
  status: 'active' | 'pending' | 'discharged'
  days_in_program: number
  counselor_name: string
}

export interface DashboardStats {
  total_facilities: number
  total_staff: number
  total_patients: number
  active_today: number
  facilities_change: number
  staff_change: number
  patients_change: number
  active_change: number
}

export interface ActivityItem {
  id: string
  type: 'patient_added' | 'staff_login' | 'facility_created' | 'alert'
  message: string
  time: string
}

export type DashboardWidget =
  | 'facilities'
  | 'staff'
  | 'patients'
  | 'active'
  | 'recentActivity'
  | 'quickActions'
  | 'facilitiesTable'
  | 'analytics'
  | 'charts'

export const WIDGET_LABELS: Record<DashboardWidget, string> = {
  facilities: 'Total Facilities',
  staff: 'Total Staff',
  patients: 'Total Patients',
  active: 'Active Today',
  recentActivity: 'Recent Activity',
  quickActions: 'Quick Actions',
  facilitiesTable: 'Facilities Overview',
  analytics: 'Analytics',
  charts: 'Charts',
}
