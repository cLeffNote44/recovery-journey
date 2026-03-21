/**
 * Mock Data for Development and Offline Mode
 *
 * WARNING: This data is ONLY for development and offline fallback.
 * The app should clearly indicate to users when they're viewing mock data
 * instead of live data from the API.
 */

// ============================================================================
// PATIENT DATA
// ============================================================================

export interface MockPatient {
  id: string
  first_name: string
  last_name: string
  status: 'active' | 'pending' | 'discharged'
  days_sober: number
  check_in_streak: number
  admission_date: string
  counselor_name: string
  registration_key?: string
}

export const mockPatients: MockPatient[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    first_name: 'John',
    last_name: 'Doe',
    status: 'active',
    days_sober: 51,
    check_in_streak: 7,
    admission_date: '2025-10-01',
    counselor_name: 'Dr. Martinez',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    first_name: 'Jane',
    last_name: 'Smith',
    status: 'pending',
    days_sober: 0,
    check_in_streak: 0,
    admission_date: '2025-11-20',
    counselor_name: 'Dr. Thompson',
    registration_key: 'HOP3-N7B4-Q2K9',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    first_name: 'Michael',
    last_name: 'Johnson',
    status: 'active',
    days_sober: 67,
    check_in_streak: 12,
    admission_date: '2025-09-15',
    counselor_name: 'Dr. Thompson',
  },
]

export interface MockPatientDetail {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  phone: string
  email: string
  status: string
  admission_date: string
  sobriety_date: string
  days_sober: number
  check_in_streak: number
  total_check_ins: number
  counselor_name: string
  substances: string[]
  currentPhase: string
  phaseProgress: number
}

export const mockPatientDetail: MockPatientDetail = {
  id: '30000000-0000-0000-0000-000000000001',
  first_name: 'John',
  last_name: 'Doe',
  date_of_birth: '1985-03-15',
  phone: '(555) 123-4567',
  email: 'john.doe@email.com',
  status: 'active',
  admission_date: '2025-10-01',
  sobriety_date: '2025-10-01',
  days_sober: 51,
  check_in_streak: 7,
  total_check_ins: 45,
  counselor_name: 'Dr. Maria Martinez',
  substances: ['Alcohol', 'Cocaine'],
  currentPhase: 'Phase 2: Intensive Therapy',
  phaseProgress: 65,
}

// ============================================================================
// TIMELINE DATA
// ============================================================================

export interface TimelineEvent {
  id: string
  date: string
  type: 'milestone' | 'check-in' | 'therapy' | 'alert' | 'goal' | 'phase'
  title: string
  description: string
}

export const mockTimeline: TimelineEvent[] = [
  { id: '1', date: '2025-11-21', type: 'check-in', title: 'Daily Check-in', description: 'Mood: 9/10 - "Best day yet! Feeling strong."' },
  { id: '2', date: '2025-11-20', type: 'therapy', title: 'Group Therapy Session', description: 'Participated in family dynamics discussion' },
  { id: '3', date: '2025-11-19', type: 'milestone', title: '50 Days Sober!', description: 'Major milestone achieved' },
  { id: '4', date: '2025-11-18', type: 'check-in', title: 'Daily Check-in', description: 'Mood: 7/10 - Good progress at work' },
  { id: '5', date: '2025-11-17', type: 'goal', title: 'Goal Completed', description: 'Completed "Attend 5 group sessions" goal' },
  { id: '6', date: '2025-11-15', type: 'therapy', title: 'Individual Therapy', description: 'Worked on coping strategies with Dr. Martinez' },
  { id: '7', date: '2025-11-14', type: 'alert', title: 'Craving Reported', description: 'Successfully used grounding techniques' },
  { id: '8', date: '2025-11-10', type: 'phase', title: 'Phase 2: Intensive Therapy', description: 'Progressed from detox to intensive therapy phase' },
  { id: '9', date: '2025-11-01', type: 'milestone', title: '30 Days Sober!', description: 'First major milestone' },
  { id: '10', date: '2025-10-15', type: 'phase', title: 'Phase 1: Detox Complete', description: 'Successfully completed medical detoxification' },
  { id: '11', date: '2025-10-01', type: 'milestone', title: 'Treatment Started', description: 'Admitted to Hope Recovery Center' },
]

export interface CheckIn {
  date: string
  mood: number
  notes: string
}

export const mockCheckIns: CheckIn[] = [
  { date: '2025-11-21', mood: 9, notes: 'Best day yet! Feeling strong.' },
  { date: '2025-11-20', mood: 7, notes: 'Attended group therapy.' },
  { date: '2025-11-19', mood: 8, notes: 'One month milestone!' },
  { date: '2025-11-18', mood: 7, notes: 'Good day at work.' },
  { date: '2025-11-17', mood: 6, notes: 'Had a tough day.' },
]

// ============================================================================
// DASHBOARD DATA
// ============================================================================

export interface DashboardStats {
  totalPatients: number
  activePatients: number
  pendingAdmissions: number
  checkInsToday: number
  alertsCount: number
  avgDaysSober: number
}

export const mockDashboardStats: DashboardStats = {
  totalPatients: 24,
  activePatients: 18,
  pendingAdmissions: 3,
  checkInsToday: 15,
  alertsCount: 2,
  avgDaysSober: 47,
}

export interface Appointment {
  id: number
  patient: string
  date: string
  time: string
  status: 'confirmed' | 'pending' | 'cancelled'
}

export const mockAppointments: Appointment[] = [
  { id: 1, patient: 'John Doe', date: 'Today', time: '2:00 PM', status: 'confirmed' },
  { id: 2, patient: 'Jane Smith', date: 'Today', time: '3:30 PM', status: 'confirmed' },
  { id: 3, patient: 'Michael Johnson', date: 'Tomorrow', time: '10:00 AM', status: 'pending' },
  { id: 4, patient: 'Sarah Wilson', date: 'Nov 23', time: '11:30 AM', status: 'confirmed' },
]

export interface DashboardMessage {
  id: number
  from: string
  preview: string
  time: string
}

export const mockDashboardMessages: DashboardMessage[] = [
  { id: 1, from: 'John Doe', preview: 'Thank you for the session today...', time: 'Just now' },
  { id: 2, from: 'Jane Smith', preview: 'I wanted to share my progress...', time: '2 min ago' },
  { id: 3, from: 'Michael Johnson', preview: 'Can we reschedule tomorrow...', time: '15 min ago' },
  { id: 4, from: 'Sarah Wilson', preview: 'I completed my weekly goals!', time: '1 hour ago' },
]

export interface Reminder {
  id: number
  title: string
  description: string
  iconType: 'clipboard' | 'users' | 'alert'
}

export const mockReminders: Reminder[] = [
  { id: 1, title: 'Review Treatment Plans', description: '3 patients have treatment plan reviews due this week', iconType: 'clipboard' },
  { id: 2, title: 'Pending Registrations', description: "2 patients haven't completed their app registration", iconType: 'users' },
  { id: 3, title: 'Check-in Alerts', description: '1 patient missed their daily check-in', iconType: 'alert' },
]

// ============================================================================
// MESSAGES DATA
// ============================================================================

export interface Conversation {
  id: number
  patient: string
  lastMessage: string
  time: string
  unread: boolean
}

export const mockConversations: Conversation[] = [
  {
    id: 1,
    patient: 'John Doe',
    lastMessage: 'Thank you for the session today...',
    time: 'Just now',
    unread: true,
  },
  {
    id: 2,
    patient: 'Jane Smith',
    lastMessage: 'I wanted to share my progress...',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 3,
    patient: 'Michael Johnson',
    lastMessage: 'Can we reschedule tomorrow...',
    time: '15 min ago',
    unread: false,
  },
  {
    id: 4,
    patient: 'Sarah Wilson',
    lastMessage: 'I completed my weekly goals!',
    time: '1 hour ago',
    unread: false,
  },
]

export interface Message {
  id: number
  sender: 'patient' | 'staff'
  text: string
  time: string
}

export const mockMessages: Message[] = [
  { id: 1, sender: 'patient', text: 'Hi Dr. Martinez, I wanted to thank you for the session today.', time: '2:30 PM' },
  { id: 2, sender: 'patient', text: 'The coping strategies you suggested really helped me this week.', time: '2:31 PM' },
  { id: 3, sender: 'staff', text: "I'm so glad to hear that, John! How have you been feeling overall?", time: '2:45 PM' },
  { id: 4, sender: 'patient', text: "Much better! I've been doing my daily check-ins and the breathing exercises have been helping with my cravings.", time: '2:47 PM' },
  { id: 5, sender: 'staff', text: "That's wonderful progress. Keep up the great work! Remember, I'm here if you need anything.", time: '2:50 PM' },
]
