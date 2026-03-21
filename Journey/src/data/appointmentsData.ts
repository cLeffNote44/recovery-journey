/**
 * Appointments Data
 *
 * Program definitions, mock patients, clinicians, and helper data
 * for the Appointments page.
 */

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type ProgramType = 'iop' | 'php' | 'residential' | 'outpatient'
export type AppointmentType =
  | 'individual'
  | 'group'
  | 'telehealth'
  | 'assessment'
  | 'family'
  | 'medical'
  | 'case-management'
export type RecurrencePattern = 'none' | 'daily' | 'weekly' | 'custom'

export interface Program {
  id: string
  name: string
  type: ProgramType
  description: string
  schedule: {
    days: number[] // 0=Sun, 1=Mon, etc.
    startTime: string
    endTime: string
  }
  sessions: string[] // List of session types included
  color: string
}

export interface Appointment {
  id: string
  title: string
  patientId: string
  patientName: string
  type: AppointmentType
  programId?: string
  date: string
  startTime: string
  endTime: string
  location: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  notes?: string
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
  clinicianId?: string
  clinicianName?: string
}

export interface PatientProgram {
  id: string
  patientId: string
  patientName: string
  programId: string
  startDate: string
  endDate?: string
  status: 'active' | 'completed' | 'on-hold' | 'discharged'
}

// =============================================================================
// PROGRAM DEFINITIONS
// =============================================================================

export const programs: Program[] = [
  {
    id: 'iop-1',
    name: 'Intensive Outpatient Program (IOP)',
    type: 'iop',
    description: '9 hours/week, 3 days per week',
    schedule: { days: [1, 3, 5], startTime: '09:00', endTime: '12:00' }, // Mon, Wed, Fri
    sessions: ['Group Therapy', 'Individual Therapy', 'Psychoeducation', 'Life Skills'],
    color: 'indigo',
  },
  {
    id: 'php-1',
    name: 'Partial Hospitalization Program (PHP)',
    type: 'php',
    description: '30 hours/week, 5 days per week',
    schedule: { days: [1, 2, 3, 4, 5], startTime: '09:00', endTime: '15:00' }, // Mon-Fri
    sessions: [
      'Group Therapy',
      'Individual Therapy',
      'Medical Consultation',
      'Art Therapy',
      'Family Session',
      'Case Management',
    ],
    color: 'emerald',
  },
  {
    id: 'res-1',
    name: 'Residential Treatment',
    type: 'residential',
    description: '24/7 supervised care',
    schedule: { days: [0, 1, 2, 3, 4, 5, 6], startTime: '00:00', endTime: '23:59' },
    sessions: [
      'Morning Group',
      'Individual Therapy',
      'Afternoon Activities',
      'Evening Process Group',
      'Medical Rounds',
    ],
    color: 'rose',
  },
  {
    id: 'op-1',
    name: 'Outpatient Services',
    type: 'outpatient',
    description: '1-2 sessions per week',
    schedule: { days: [2, 4], startTime: '10:00', endTime: '11:00' }, // Tue, Thu
    sessions: ['Individual Therapy', 'Medication Management'],
    color: 'sky',
  },
]

// =============================================================================
// MOCK DATA
// =============================================================================

export const mockAppointmentPatients = [
  { id: '1', name: 'John Doe', program: 'iop-1' },
  { id: '2', name: 'Jane Smith', program: 'php-1' },
  { id: '3', name: 'Michael Brown', program: 'iop-1' },
  { id: '4', name: 'Sarah Davis', program: 'php-1' },
  { id: '5', name: 'David Wilson', program: 'res-1' },
  { id: '6', name: 'Emily Johnson', program: 'op-1' },
  { id: '7', name: 'Robert Taylor', program: null },
]

export const mockClinicians = [
  { id: 'c1', name: 'Dr. Amanda Foster' },
  { id: 'c2', name: 'Dr. James Mitchell' },
  { id: 'c3', name: 'Lisa Thompson, LCSW' },
  { id: 'c4', name: 'Mark Davis, LPC' },
]

export const mockPatientPrograms: PatientProgram[] = [
  {
    id: 'pp1',
    patientId: '1',
    patientName: 'John Doe',
    programId: 'iop-1',
    startDate: '2025-11-01',
    status: 'active',
  },
  {
    id: 'pp2',
    patientId: '2',
    patientName: 'Jane Smith',
    programId: 'php-1',
    startDate: '2025-11-05',
    status: 'active',
  },
  {
    id: 'pp3',
    patientId: '3',
    patientName: 'Michael Brown',
    programId: 'iop-1',
    startDate: '2025-11-10',
    status: 'active',
  },
  {
    id: 'pp4',
    patientId: '4',
    patientName: 'Sarah Davis',
    programId: 'php-1',
    startDate: '2025-10-15',
    status: 'active',
  },
  {
    id: 'pp5',
    patientId: '5',
    patientName: 'David Wilson',
    programId: 'res-1',
    startDate: '2025-10-01',
    status: 'active',
  },
  {
    id: 'pp6',
    patientId: '6',
    patientName: 'Emily Johnson',
    programId: 'op-1',
    startDate: '2025-11-15',
    status: 'active',
  },
]

// =============================================================================
// HELPER DATA
// =============================================================================

export const timeSlots = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
]

export const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const fullDayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]
export const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export const formatTime = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Generate program appointments for enrolled patients
 */
export const generateProgramAppointments = (): Appointment[] => {
  const appointments: Appointment[] = []
  const baseDate = new Date(2025, 10, 17) // Nov 17, 2025 (Monday)

  // Generate 2 weeks of program sessions
  for (let week = 0; week < 2; week++) {
    mockPatientPrograms.forEach((pp) => {
      const program = programs.find((p) => p.id === pp.programId)
      if (!program) return

      program.schedule.days.forEach((dayOfWeek) => {
        const date = new Date(baseDate)
        date.setDate(baseDate.getDate() + week * 7 + dayOfWeek)

        // Add program sessions
        program.sessions.forEach((session, idx) => {
          const sessionStartHour = parseInt(program.schedule.startTime.split(':')[0]) + idx
          if (sessionStartHour < parseInt(program.schedule.endTime.split(':')[0])) {
            appointments.push({
              id: `prog-${pp.id}-${week}-${dayOfWeek}-${idx}`,
              title: session,
              patientId: pp.patientId,
              patientName: pp.patientName,
              type: session.toLowerCase().includes('group')
                ? 'group'
                : session.toLowerCase().includes('individual')
                  ? 'individual'
                  : session.toLowerCase().includes('family')
                    ? 'family'
                    : session.toLowerCase().includes('medical')
                      ? 'medical'
                      : 'group',
              programId: program.id,
              date: date.toISOString().split('T')[0],
              startTime: `${sessionStartHour.toString().padStart(2, '0')}:00`,
              endTime: `${(sessionStartHour + 1).toString().padStart(2, '0')}:00`,
              location: program.type === 'residential' ? 'Residential Unit' : `Room ${100 + idx}`,
              status: date < new Date(2025, 10, 21) ? 'completed' : 'scheduled',
              isRecurring: true,
              clinicianId: mockClinicians[idx % mockClinicians.length].id,
              clinicianName: mockClinicians[idx % mockClinicians.length].name,
            })
          }
        })
      })
    })
  }
  return appointments
}

// Individual therapy appointments (non-program)
export const individualAppointments: Appointment[] = [
  {
    id: 'ind-1',
    title: 'Individual Therapy',
    patientId: '7',
    patientName: 'Robert Taylor',
    type: 'individual',
    date: '2025-11-21',
    startTime: '14:00',
    endTime: '15:00',
    location: 'Room 105',
    status: 'scheduled',
    clinicianId: 'c1',
    clinicianName: 'Dr. Amanda Foster',
  },
  {
    id: 'ind-2',
    title: 'Initial Assessment',
    patientId: '7',
    patientName: 'Robert Taylor',
    type: 'assessment',
    date: '2025-11-22',
    startTime: '10:00',
    endTime: '12:00',
    location: 'Room 101',
    status: 'scheduled',
    clinicianId: 'c2',
    clinicianName: 'Dr. James Mitchell',
  },
  {
    id: 'ind-3',
    title: 'Telehealth Check-in',
    patientId: '6',
    patientName: 'Emily Johnson',
    type: 'telehealth',
    date: '2025-11-21',
    startTime: '16:00',
    endTime: '16:30',
    location: 'Virtual',
    status: 'scheduled',
    clinicianId: 'c3',
    clinicianName: 'Lisa Thompson, LCSW',
  },
]
