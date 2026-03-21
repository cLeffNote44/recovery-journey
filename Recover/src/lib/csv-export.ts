/**
 * CSV Export Utilities
 *
 * Export recovery data to CSV format for analysis in Excel, Google Sheets, etc.
 */

import type { CheckIn, Craving, Meeting, Meditation, GrowthLog, Goal, Contact } from '@/types/app';

export type ExportDataType =
  | 'all'
  | 'checkins'
  | 'cravings'
  | 'meetings'
  | 'meditations'
  | 'growthLogs'
  | 'goals'
  | 'contacts'
  | 'analytics';

export interface CSVExportOptions {
  dataTypes: ExportDataType[];
  dateRange?: {
    start: string;
    end: string;
  };
  includeHeaders?: boolean;
  separator?: ',' | ';' | '\t';
}

/**
 * Convert array of objects to CSV string
 */
function arrayToCSV(data: any[], headers: string[], separator: string = ','): string {
  if (data.length === 0) return '';

  // Header row
  const headerRow = headers.map(h => escapeCsvValue(h)).join(separator);

  // Data rows
  const dataRows = data.map(item => {
    return headers.map(header => {
      const value = item[header];
      return escapeCsvValue(value);
    }).join(separator);
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV values (handle commas, quotes, newlines)
 */
function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return '';

  const stringValue = String(value);

  // If value contains separator, quotes, or newlines, wrap in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Filter data by date range
 */
function filterByDateRange<T extends { date: string }>(
  data: T[],
  range?: { start: string; end: string }
): T[] {
  if (!range) return data;

  const startDate = new Date(range.start);
  const endDate = new Date(range.end);

  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
}

/**
 * Export check-ins to CSV
 */
export function exportCheckInsCSV(
  checkIns: CheckIn[],
  options: Partial<CSVExportOptions> = {}
): string {
  const filtered = filterByDateRange(checkIns, options.dateRange);

  const headers = [
    'date',
    'mood',
    'notes',
    'halt_hungry',
    'halt_angry',
    'halt_lonely',
    'halt_tired'
  ];

  const data = filtered.map(checkIn => ({
    date: checkIn.date,
    mood: checkIn.mood,
    notes: checkIn.notes || '',
    halt_hungry: checkIn.halt?.hungry ? 'Yes' : 'No',
    halt_angry: checkIn.halt?.angry ? 'Yes' : 'No',
    halt_lonely: checkIn.halt?.lonely ? 'Yes' : 'No',
    halt_tired: checkIn.halt?.tired ? 'Yes' : 'No'
  }));

  return arrayToCSV(data, headers, options.separator);
}

/**
 * Export cravings to CSV
 */
export function exportCravingsCSV(
  cravings: Craving[],
  options: Partial<CSVExportOptions> = {}
): string {
  const filtered = filterByDateRange(cravings, options.dateRange);

  const headers = [
    'date',
    'intensity',
    'trigger',
    'coping_strategy',
    'overcame',
    'notes'
  ];

  const data = filtered.map(craving => ({
    date: craving.date,
    intensity: craving.intensity,
    trigger: craving.trigger,
    coping_strategy: craving.copingStrategy || '',
    overcame: craving.overcame ? 'Yes' : 'No',
    notes: craving.triggerNotes || ''
  }));

  return arrayToCSV(data, headers, options.separator);
}

/**
 * Export meetings to CSV
 */
export function exportMeetingsCSV(
  meetings: Meeting[],
  options: Partial<CSVExportOptions> = {}
): string {
  const filtered = filterByDateRange(meetings, options.dateRange);

  const headers = [
    'date',
    'type',
    'notes',
    'duration_minutes'
  ];

  const data = filtered.map(meeting => ({
    date: meeting.date,
    type: meeting.type,
    notes: meeting.notes || '',
    duration_minutes: '' // Duration not tracked in current schema
  }));

  return arrayToCSV(data, headers, options.separator);
}

/**
 * Export meditations to CSV
 */
export function exportMeditationsCSV(
  meditations: Meditation[],
  options: Partial<CSVExportOptions> = {}
): string {
  const filtered = filterByDateRange(meditations, options.dateRange);

  const headers = [
    'date',
    'minutes',
    'type',
    'notes'
  ];

  const data = filtered.map(meditation => ({
    date: meditation.date,
    minutes: meditation.duration,
    type: meditation.type || '',
    notes: meditation.notes || ''
  }));

  return arrayToCSV(data, headers, options.separator);
}

/**
 * Export growth logs to CSV
 */
export function exportGrowthLogsCSV(
  growthLogs: GrowthLog[],
  options: Partial<CSVExportOptions> = {}
): string {
  const filtered = filterByDateRange(growthLogs, options.dateRange);

  const headers = [
    'date',
    'title',
    'description',
    'mood'
  ];

  const data = filtered.map(log => ({
    date: log.date,
    title: log.title,
    description: log.description,
    mood: '' // Mood not tracked in growth logs
  }));

  return arrayToCSV(data, headers, options.separator);
}

/**
 * Export goals to CSV
 */
export function exportGoalsCSV(
  goals: Goal[],
  options: Partial<CSVExportOptions> = {}
): string {
  const headers = [
    'title',
    'description',
    'category',
    'target_type',
    'target_value',
    'current_value',
    'frequency',
    'completed',
    'start_date',
    'completion_date'
  ];

  const data = goals.map(goal => ({
    title: goal.title,
    description: goal.description || '',
    category: goal.category,
    target_type: goal.targetType,
    target_value: goal.targetValue || 0,
    current_value: goal.currentValue,
    frequency: goal.frequency,
    completed: goal.isCompleted ? 'Yes' : 'No',
    start_date: goal.startDate || '',
    completion_date: goal.completedDate || ''
  }));

  return arrayToCSV(data, headers, options.separator);
}

/**
 * Export contacts to CSV
 */
export function exportContactsCSV(
  contacts: Contact[],
  options: Partial<CSVExportOptions> = {}
): string {
  const headers = [
    'name',
    'relationship',
    'phone',
    'email',
    'notes'
  ];

  const data = contacts.map(contact => ({
    name: contact.name,
    relationship: contact.role,
    phone: contact.phone || '',
    email: contact.email || '',
    notes: contact.notes || ''
  }));

  return arrayToCSV(data, headers, options.separator);
}

/**
 * Export analytics summary to CSV
 */
export function exportAnalyticsSummaryCSV(
  summary: {
    totalDays: number;
    avgMood: number;
    checkInRate: number;
    cravingSuccessRate: number;
    engagementScore: number;
    totalCheckIns: number;
    totalCravings: number;
    totalMeetings: number;
    totalMeditations: number;
  },
  options: Partial<CSVExportOptions> = {}
): string {
  const headers = [
    'metric',
    'value'
  ];

  const data = [
    { metric: 'Total Days Sober', value: summary.totalDays },
    { metric: 'Average Mood (1-5)', value: summary.avgMood.toFixed(2) },
    { metric: 'Check-In Rate (%)', value: (summary.checkInRate * 100).toFixed(1) },
    { metric: 'Craving Success Rate (%)', value: (summary.cravingSuccessRate * 100).toFixed(1) },
    { metric: 'Engagement Score (0-100)', value: summary.engagementScore },
    { metric: 'Total Check-Ins', value: summary.totalCheckIns },
    { metric: 'Total Cravings', value: summary.totalCravings },
    { metric: 'Total Meetings', value: summary.totalMeetings },
    { metric: 'Total Meditations', value: summary.totalMeditations }
  ];

  return arrayToCSV(data, headers, options.separator);
}

/**
 * Export all data to ZIP (multiple CSV files)
 */
export function exportAllDataCSV(data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
  growthLogs: GrowthLog[];
  goals: Goal[];
  contacts: Contact[];
  analyticsSummary?: any;
}, options: Partial<CSVExportOptions> = {}): Map<string, string> {
  const files = new Map<string, string>();

  // Export each data type
  if (data.checkIns.length > 0) {
    files.set('check-ins.csv', exportCheckInsCSV(data.checkIns, options));
  }

  if (data.cravings.length > 0) {
    files.set('cravings.csv', exportCravingsCSV(data.cravings, options));
  }

  if (data.meetings.length > 0) {
    files.set('meetings.csv', exportMeetingsCSV(data.meetings, options));
  }

  if (data.meditations.length > 0) {
    files.set('meditations.csv', exportMeditationsCSV(data.meditations, options));
  }

  if (data.growthLogs.length > 0) {
    files.set('growth-logs.csv', exportGrowthLogsCSV(data.growthLogs, options));
  }

  if (data.goals.length > 0) {
    files.set('goals.csv', exportGoalsCSV(data.goals, options));
  }

  if (data.contacts.length > 0) {
    files.set('contacts.csv', exportContactsCSV(data.contacts, options));
  }

  if (data.analyticsSummary) {
    files.set('analytics-summary.csv', exportAnalyticsSummaryCSV(data.analyticsSummary, options));
  }

  return files;
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download multiple CSVs as separate files
 */
export function downloadMultipleCSVs(files: Map<string, string>, prefix: string = 'recovery-journey'): void {
  files.forEach((csv, filename) => {
    setTimeout(() => {
      downloadCSV(csv, `${prefix}-${filename}`);
    }, 100); // Slight delay between downloads
  });
}

/**
 * Main export function with type selection
 */
export function exportData(
  dataType: ExportDataType,
  allData: {
    checkIns: CheckIn[];
    cravings: Craving[];
    meetings: Meeting[];
    meditations: Meditation[];
    growthLogs: GrowthLog[];
    goals: Goal[];
    contacts: Contact[];
    analyticsSummary?: any;
  },
  options: Partial<CSVExportOptions> = {}
): void {
  const timestamp = new Date().toISOString().split('T')[0];

  switch (dataType) {
    case 'checkins':
      downloadCSV(
        exportCheckInsCSV(allData.checkIns, options),
        `recovery-journey-checkins-${timestamp}.csv`
      );
      break;

    case 'cravings':
      downloadCSV(
        exportCravingsCSV(allData.cravings, options),
        `recovery-journey-cravings-${timestamp}.csv`
      );
      break;

    case 'meetings':
      downloadCSV(
        exportMeetingsCSV(allData.meetings, options),
        `recovery-journey-meetings-${timestamp}.csv`
      );
      break;

    case 'meditations':
      downloadCSV(
        exportMeditationsCSV(allData.meditations, options),
        `recovery-journey-meditations-${timestamp}.csv`
      );
      break;

    case 'growthLogs':
      downloadCSV(
        exportGrowthLogsCSV(allData.growthLogs, options),
        `recovery-journey-growth-logs-${timestamp}.csv`
      );
      break;

    case 'goals':
      downloadCSV(
        exportGoalsCSV(allData.goals, options),
        `recovery-journey-goals-${timestamp}.csv`
      );
      break;

    case 'contacts':
      downloadCSV(
        exportContactsCSV(allData.contacts, options),
        `recovery-journey-contacts-${timestamp}.csv`
      );
      break;

    case 'analytics':
      if (allData.analyticsSummary) {
        downloadCSV(
          exportAnalyticsSummaryCSV(allData.analyticsSummary, options),
          `recovery-journey-analytics-${timestamp}.csv`
        );
      }
      break;

    case 'all':
      const allFiles = exportAllDataCSV(allData, options);
      downloadMultipleCSVs(allFiles, `recovery-journey-${timestamp}`);
      break;
  }
}
