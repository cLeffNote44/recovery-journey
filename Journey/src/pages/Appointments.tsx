import { useState } from 'react'
import {
  Calendar,
  Clock,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Video,
  Users,
  AlertCircle,
  Repeat,
  CalendarDays,
  ClipboardList,
  Trash2,
  Edit2,
} from 'lucide-react'
import {
  programs,
  mockAppointmentPatients as mockPatients,
  mockClinicians,
  mockPatientPrograms,
  timeSlots,
  dayNames,
  fullDayNames,
  monthNames,
  formatTime,
  generateProgramAppointments,
  individualAppointments,
  type Appointment,
  type PatientProgram,
  type ProgramType,
} from '../data/appointmentsData'
import {
  AppointmentModal,
  ProgramAssignmentModal,
  AppointmentDetailModal,
  type AppointmentFormData,
  type ProgramAssignmentData,
} from '../components/Appointments'
import { SectionErrorBoundary } from '../components/ErrorBoundary'

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([
    ...generateProgramAppointments(),
    ...individualAppointments,
  ])
  const [patientPrograms, setPatientPrograms] = useState<PatientProgram[]>(mockPatientPrograms)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 21)) // Nov 21, 2025
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showProgramModal, setShowProgramModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [activeTab, setActiveTab] = useState<'calendar' | 'programs'>('calendar')

  const getWeekDays = () => {
    const days = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getMonthDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days: (Date | null)[] = []

    // Add empty slots for days before the first of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }

  const formatDateKey = (date: Date) => date.toISOString().split('T')[0]

  const getAppointmentsForDate = (date: Date) => {
    const dateKey = formatDateKey(date)
    return appointments.filter(a => a.date === dateKey)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'individual': return <User className="w-4 h-4" />
      case 'group': return <Users className="w-4 h-4" />
      case 'telehealth': return <Video className="w-4 h-4" />
      case 'assessment': return <AlertCircle className="w-4 h-4" />
      case 'family': return <Users className="w-4 h-4" />
      case 'medical': return <ClipboardList className="w-4 h-4" />
      case 'case-management': return <ClipboardList className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string, programId?: string) => {
    if (programId) {
      const program = programs.find(p => p.id === programId)
      if (program) {
        const colors: Record<string, string> = {
          indigo: 'bg-indigo-100 dark:bg-indigo-900 border-indigo-300 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200',
          emerald: 'bg-emerald-100 dark:bg-emerald-900 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200',
          rose: 'bg-rose-100 dark:bg-rose-900 border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200',
          sky: 'bg-sky-100 dark:bg-sky-900 border-sky-300 dark:border-sky-700 text-sky-800 dark:text-sky-200',
        }
        return colors[program.color] || colors.indigo
      }
    }
    switch (type) {
      case 'individual': return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200'
      case 'group': return 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200'
      case 'telehealth': return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200'
      case 'assessment': return 'bg-orange-100 dark:bg-orange-900 border-orange-300 dark:border-orange-700 text-orange-800 dark:text-orange-200'
      case 'family': return 'bg-pink-100 dark:bg-pink-900 border-pink-300 dark:border-pink-700 text-pink-800 dark:text-pink-200'
      case 'medical': return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
      default: return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
    }
  }

  const getProgramColor = (type: ProgramType) => {
    const colors: Record<ProgramType, string> = {
      iop: 'bg-indigo-500',
      php: 'bg-emerald-500',
      residential: 'bg-rose-500',
      outpatient: 'bg-sky-500',
    }
    return colors[type]
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      'no-show': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'on-hold': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      discharged: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
      </span>
    )
  }

  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate)
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7))
    } else if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + direction)
    } else {
      newDate.setMonth(currentDate.getMonth() + direction)
    }
    setCurrentDate(newDate)
  }

  const isToday = (date: Date) => {
    const today = new Date(2025, 10, 21) // Mock today
    return formatDateKey(date) === formatDateKey(today)
  }

  const handleCreateAppointment = (formData: AppointmentFormData) => {
    const patient = mockPatients.find(p => p.id === formData.patientId)
    const clinician = mockClinicians.find(c => c.id === formData.clinicianId)
    const appointment: Appointment = {
      id: Date.now().toString(),
      ...formData,
      patientName: patient?.name || '',
      clinicianName: clinician?.name,
      status: 'scheduled',
    }
    setAppointments([...appointments, appointment])
    setShowCreateModal(false)
  }

  const handleAssignProgram = (data: ProgramAssignmentData) => {
    const patient = mockPatients.find(p => p.id === data.patientId)
    if (!patient) return

    const newPatientProgram: PatientProgram = {
      id: `pp-${Date.now()}`,
      patientId: data.patientId,
      patientName: patient.name,
      programId: data.programId,
      startDate: data.startDate,
      status: 'active',
    }
    setPatientPrograms([...patientPrograms, newPatientProgram])

    // Generate appointments for this patient
    const program = programs.find(p => p.id === data.programId)
    if (program) {
      const newAppointments: Appointment[] = []
      const startDate = new Date(data.startDate)

      // Generate 4 weeks of appointments
      for (let week = 0; week < 4; week++) {
        program.schedule.days.forEach((dayOfWeek) => {
          const date = new Date(startDate)
          const daysUntilTarget = (dayOfWeek - startDate.getDay() + 7) % 7
          date.setDate(startDate.getDate() + (week * 7) + daysUntilTarget)

          program.sessions.forEach((session, idx) => {
            const sessionStartHour = parseInt(program.schedule.startTime.split(':')[0]) + idx
            if (sessionStartHour < parseInt(program.schedule.endTime.split(':')[0])) {
              newAppointments.push({
                id: `new-prog-${patient.id}-${week}-${dayOfWeek}-${idx}`,
                title: session,
                patientId: patient.id,
                patientName: patient.name,
                type: session.toLowerCase().includes('group') ? 'group' : 'individual',
                programId: program.id,
                date: date.toISOString().split('T')[0],
                startTime: `${sessionStartHour.toString().padStart(2, '0')}:00`,
                endTime: `${(sessionStartHour + 1).toString().padStart(2, '0')}:00`,
                location: `Room ${100 + idx}`,
                status: 'scheduled',
                isRecurring: true,
                clinicianId: mockClinicians[idx % mockClinicians.length].id,
                clinicianName: mockClinicians[idx % mockClinicians.length].name,
              })
            }
          })
        })
      }
      setAppointments([...appointments, ...newAppointments])
    }

    setShowProgramModal(false)
  }

  const handleCancelAppointment = (appointmentId: string) => {
    setAppointments(appointments.map(a =>
      a.id === appointmentId ? { ...a, status: 'cancelled' } : a
    ))
    setSelectedAppointment(null)
  }

  const handleCompleteAppointment = (appointmentId: string) => {
    setAppointments(appointments.map(a =>
      a.id === appointmentId ? { ...a, status: 'completed' } : a
    ))
    setSelectedAppointment(null)
  }

  const weekDays = getWeekDays()
  const monthDays = getMonthDays()

  return (
    <SectionErrorBoundary>
    <div className="animate-fadeIn h-full flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments & Programs</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule sessions and manage patient programs</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProgramModal(true)}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 flex items-center gap-2"
            aria-label="Assign program to patient"
          >
            <CalendarDays className="w-5 h-5" aria-hidden="true" />
            Assign Program
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
            aria-label="Create new appointment"
          >
            <Plus className="w-5 h-5" aria-hidden="true" />
            New Appointment
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div
        className="flex gap-1 mb-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit"
        role="tablist"
        aria-label="Appointments view options"
      >
        <button
          onClick={() => setActiveTab('calendar')}
          role="tab"
          aria-selected={activeTab === 'calendar'}
          aria-controls="calendar-panel"
          id="calendar-tab"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4 inline mr-2" aria-hidden="true" />
          Calendar
        </button>
        <button
          onClick={() => setActiveTab('programs')}
          role="tab"
          aria-selected={activeTab === 'programs'}
          aria-controls="programs-panel"
          id="programs-tab"
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'programs'
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          }`}
        >
          <ClipboardList className="w-4 h-4 inline mr-2" aria-hidden="true" />
          Patient Programs
        </button>
      </div>

      {activeTab === 'calendar' ? (
        <>
          {/* Calendar Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateDate(-1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => navigateDate(1)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {viewMode === 'day'
                  ? `${fullDayNames[currentDate.getDay()]}, ${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`
                  : `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              </h2>
              <button
                onClick={() => setCurrentDate(new Date(2025, 10, 21))}
                className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
              >
                Today
              </button>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {['day', 'week', 'month'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as 'day' | 'week' | 'month')}
                  className={`px-3 py-1.5 rounded text-sm font-medium ${
                    viewMode === mode ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {viewMode === 'month' ? (
              // Month View
              <div className="h-full flex flex-col">
                <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
                  {dayNames.map((day) => (
                    <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r last:border-r-0 border-gray-200 dark:border-gray-700">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="flex-1 grid grid-cols-7 auto-rows-fr">
                  {monthDays.map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-2 border-r border-b border-gray-100 dark:border-gray-700 last:border-r-0 min-h-[100px] ${
                        day && isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      } ${!day ? 'bg-gray-50 dark:bg-gray-900' : ''}`}
                    >
                      {day && (
                        <>
                          <p className={`text-sm font-medium mb-1 ${
                            isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                          }`}>
                            {day.getDate()}
                          </p>
                          <div className="space-y-1 overflow-y-auto max-h-[80px]">
                            {getAppointmentsForDate(day).slice(0, 3).map((apt) => (
                              <button
                                key={apt.id}
                                onClick={() => setSelectedAppointment(apt)}
                                className={`w-full text-left px-1 py-0.5 rounded text-xs truncate ${getTypeColor(apt.type, apt.programId)}`}
                              >
                                {formatTime(apt.startTime)} {apt.title}
                              </button>
                            ))}
                            {getAppointmentsForDate(day).length > 3 && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                                +{getAppointmentsForDate(day).length - 3} more
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : viewMode === 'day' ? (
              // Day View
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
                {timeSlots.map((time) => {
                  const dayAppointments = getAppointmentsForDate(currentDate).filter(a => a.startTime === time)
                  return (
                    <div key={time} className="flex border-b border-gray-100 dark:border-gray-700">
                      <div className="w-24 p-3 text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 text-right flex-shrink-0">
                        {formatTime(time)}
                      </div>
                      <div className="flex-1 p-2 min-h-[80px]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          {dayAppointments.map((apt) => (
                            <button
                              key={apt.id}
                              onClick={() => setSelectedAppointment(apt)}
                              className={`text-left p-3 rounded-lg border ${getTypeColor(apt.type, apt.programId)} hover:opacity-80 transition-opacity`}
                            >
                              <div className="flex items-center gap-2 mb-1">
                                {getTypeIcon(apt.type)}
                                <span className="font-medium">{apt.title}</span>
                                {apt.isRecurring && <Repeat className="w-3 h-3 opacity-60" />}
                              </div>
                              <p className="text-sm opacity-75">{apt.patientName}</p>
                              <p className="text-xs opacity-60 mt-1">{formatTime(apt.startTime)} - {formatTime(apt.endTime)} • {apt.location}</p>
                              {apt.clinicianName && (
                                <p className="text-xs opacity-60">{apt.clinicianName}</p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // Week View
              <>
                <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
                  <div className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
                    Time
                  </div>
                  {weekDays.map((day, idx) => (
                    <div
                      key={idx}
                      className={`p-3 text-center border-r last:border-r-0 border-gray-200 dark:border-gray-700 ${
                        isToday(day) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <p className="text-xs text-gray-500 dark:text-gray-400">{dayNames[day.getDay()]}</p>
                      <p className={`text-lg font-semibold ${
                        isToday(day) ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                      }`}>
                        {day.getDate()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 350px)' }}>
                  {timeSlots.map((time) => (
                    <div key={time} className="grid grid-cols-8 border-b border-gray-100 dark:border-gray-700">
                      <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 text-right pr-3">
                        {formatTime(time)}
                      </div>
                      {weekDays.map((day, idx) => {
                        const dayAppointments = getAppointmentsForDate(day).filter(a => a.startTime === time)
                        return (
                          <div
                            key={idx}
                            className={`p-1 min-h-[60px] border-r last:border-r-0 border-gray-100 dark:border-gray-700 ${
                              isToday(day) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            {dayAppointments.map((apt) => (
                              <button
                                key={apt.id}
                                onClick={() => setSelectedAppointment(apt)}
                                className={`w-full text-left p-1.5 rounded border text-xs mb-1 ${getTypeColor(apt.type, apt.programId)} hover:opacity-80 transition-opacity`}
                              >
                                <div className="flex items-center gap-1 mb-0.5">
                                  {getTypeIcon(apt.type)}
                                  <span className="font-medium truncate">{apt.title}</span>
                                  {apt.isRecurring && <Repeat className="w-3 h-3 opacity-60 flex-shrink-0" />}
                                </div>
                                <p className="truncate opacity-75">{apt.patientName}</p>
                              </button>
                            ))}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
            <span className="text-gray-500 dark:text-gray-400 font-medium">Programs:</span>
            {programs.map((p) => (
              <div key={p.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded ${getProgramColor(p.type)}`}></div>
                <span className="text-gray-600 dark:text-gray-400">{p.type.toUpperCase()}</span>
              </div>
            ))}
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">Individual:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Therapy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-green-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Telehealth</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-orange-500"></div>
              <span className="text-gray-600 dark:text-gray-400">Assessment</span>
            </div>
          </div>
        </>
      ) : (
        // Programs Tab
        <div className="flex-1 overflow-auto">
          {/* Program Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {programs.map((program) => (
              <div key={program.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-3 h-3 rounded-full ${getProgramColor(program.type)}`}></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{program.type.toUpperCase()}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{program.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">{program.description}</p>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  <p className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTime(program.schedule.startTime)} - {formatTime(program.schedule.endTime)}
                  </p>
                  <p className="flex items-center gap-1 mt-1">
                    <CalendarDays className="w-3 h-3" />
                    {program.schedule.days.map(d => dayNames[d]).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Patient Enrollments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">Patient Program Enrollments</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700">
                    <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Patient</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Program</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Start Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patientPrograms.map((pp) => {
                    const program = programs.find(p => p.id === pp.programId)
                    return (
                      <tr key={pp.id} className="border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300">
                              {pp.patientName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{pp.patientName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getProgramColor(program?.type || 'iop')}`}></div>
                            <span className="text-gray-900 dark:text-white">{program?.type.toUpperCase()}</span>
                          </div>
                        </td>
                        <td className="p-4 text-gray-600 dark:text-gray-400">{pp.startDate}</td>
                        <td className="p-4">{getStatusBadge(pp.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AppointmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateAppointment}
        patients={mockPatients}
        clinicians={mockClinicians}
      />

      <ProgramAssignmentModal
        isOpen={showProgramModal}
        onClose={() => setShowProgramModal(false)}
        onSubmit={handleAssignProgram}
        patients={mockPatients}
        excludePatientIds={patientPrograms.filter(pp => pp.status === 'active').map(pp => pp.patientId)}
      />

      <AppointmentDetailModal
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onCancel={handleCancelAppointment}
        onComplete={handleCompleteAppointment}
        getTypeIcon={getTypeIcon}
        getTypeColor={getTypeColor}
      />
    </div>
    </SectionErrorBoundary>
  )
}
