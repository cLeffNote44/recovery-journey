// Mock data for offline/demo mode
// TODO: Remove this when API is fully connected

import { DashboardStats, Facility, Administrator, Clinician, Patient, ActivityItem } from './types'

export const mockStats: DashboardStats = {
  total_facilities: 12,
  total_staff: 156,
  total_patients: 842,
  active_today: 623,
  facilities_change: 2,
  staff_change: 8,
  patients_change: 45,
  active_change: -12,
}

export const mockFacilities: Facility[] = [
  { id: '1', name: 'Hope Recovery Center', city: 'Austin', state: 'TX', status: 'active', patient_count: 85, staff_count: 18, last_active: '2025-11-21T10:30:00Z' },
  { id: '2', name: 'New Beginnings Treatment', city: 'Houston', state: 'TX', status: 'active', patient_count: 120, staff_count: 25, last_active: '2025-11-21T09:15:00Z' },
  { id: '3', name: 'Serenity Springs', city: 'Dallas', state: 'TX', status: 'active', patient_count: 65, staff_count: 12, last_active: '2025-11-21T08:45:00Z' },
  { id: '4', name: 'Pathway to Wellness', city: 'San Antonio', state: 'TX', status: 'pending', patient_count: 0, staff_count: 3, last_active: '2025-11-20T14:00:00Z' },
  { id: '5', name: 'Horizon Health', city: 'Denver', state: 'CO', status: 'suspended', patient_count: 45, staff_count: 8, last_active: '2025-11-15T16:30:00Z' },
]

export const mockAdministrators: Administrator[] = [
  { id: '1', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@hoperecovery.com', facility_name: 'Hope Recovery Center', status: 'active', last_login: '2025-11-21T08:00:00Z' },
  { id: '2', first_name: 'Michael', last_name: 'Chen', email: 'michael@newbeginnings.com', facility_name: 'New Beginnings Treatment', status: 'active', last_login: '2025-11-21T07:30:00Z' },
  { id: '3', first_name: 'Emily', last_name: 'Rodriguez', email: 'emily@serenitysprings.com', facility_name: 'Serenity Springs', status: 'active', last_login: '2025-11-20T18:00:00Z' },
  { id: '4', first_name: 'James', last_name: 'Wilson', email: 'james@pathway.com', facility_name: 'Pathway to Wellness', status: 'pending', last_login: null },
]

export const mockClinicians: Clinician[] = [
  { id: '1', first_name: 'Dr. Maria', last_name: 'Martinez', role: 'counselor', facility_name: 'Hope Recovery Center', patients_assigned: 12, last_active: '2025-11-21T10:00:00Z' },
  { id: '2', first_name: 'Dr. Robert', last_name: 'Thompson', role: 'therapist', facility_name: 'Hope Recovery Center', patients_assigned: 15, last_active: '2025-11-21T09:45:00Z' },
  { id: '3', first_name: 'Lisa', last_name: 'Anderson', role: 'case_manager', facility_name: 'New Beginnings Treatment', patients_assigned: 20, last_active: '2025-11-21T09:30:00Z' },
  { id: '4', first_name: 'Dr. Kevin', last_name: 'Park', role: 'counselor', facility_name: 'Serenity Springs', patients_assigned: 8, last_active: '2025-11-21T08:15:00Z' },
  { id: '5', first_name: 'Amanda', last_name: 'White', role: 'nurse', facility_name: 'New Beginnings Treatment', patients_assigned: 30, last_active: '2025-11-21T10:15:00Z' },
]

export const mockPatients: Patient[] = [
  { id: '1', first_name: 'John', last_name: 'Doe', facility_name: 'Hope Recovery Center', status: 'active', days_in_program: 45, counselor_name: 'Dr. Martinez' },
  { id: '2', first_name: 'Jane', last_name: 'Smith', facility_name: 'Hope Recovery Center', status: 'active', days_in_program: 30, counselor_name: 'Dr. Thompson' },
  { id: '3', first_name: 'Michael', last_name: 'Brown', facility_name: 'New Beginnings Treatment', status: 'active', days_in_program: 60, counselor_name: 'Lisa Anderson' },
  { id: '4', first_name: 'Sarah', last_name: 'Davis', facility_name: 'Serenity Springs', status: 'pending', days_in_program: 0, counselor_name: 'Dr. Park' },
  { id: '5', first_name: 'David', last_name: 'Wilson', facility_name: 'New Beginnings Treatment', status: 'discharged', days_in_program: 90, counselor_name: 'Lisa Anderson' },
]

export const mockRecentActivity: ActivityItem[] = [
  { id: '1', type: 'patient_added', message: 'New patient registered at Hope Recovery Center', time: '10 minutes ago' },
  { id: '2', type: 'staff_login', message: 'Dr. Martinez logged in', time: '25 minutes ago' },
  { id: '3', type: 'facility_created', message: 'New facility "Pathway to Wellness" created', time: '2 hours ago' },
  { id: '4', type: 'alert', message: 'Missed check-in alert for 3 patients at New Beginnings', time: '3 hours ago' },
]
