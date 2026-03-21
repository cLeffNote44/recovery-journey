import { CalendarEvent } from '@/types/app';

/**
 * Generate recurring event instances for a date range
 * Fixed version with proper handling of all frequency types
 */
export function generateRecurringInstances(
  event: CalendarEvent,
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  if (!event.recurring) return [];

  const instances: CalendarEvent[] = [];
  const { frequency, interval, endDate: recurrenceEndDate, daysOfWeek, dayOfMonth, monthOfYear, excludedDates } = event.recurring;

  const eventDate = new Date(event.date + 'T00:00:00'); // Ensure consistent parsing
  const maxEndDate = recurrenceEndDate ? new Date(recurrenceEndDate + 'T23:59:59') : endDate;
  const effectiveEndDate = maxEndDate < endDate ? maxEndDate : endDate;

  // Normalize start date to beginning of day
  const normalizedStartDate = new Date(startDate);
  normalizedStartDate.setHours(0, 0, 0, 0);

  let iterationCount = 0;
  const maxIterations = 1000; // Safety limit

  // For weekly events, determine which days to include
  const effectiveDaysOfWeek = frequency === 'weekly'
    ? (daysOfWeek && daysOfWeek.length > 0 ? daysOfWeek : [eventDate.getDay()])
    : [];

  // Start iterating from the event's original date
  let currentDate = new Date(eventDate);

  while (currentDate <= effectiveEndDate && iterationCount < maxIterations) {
    iterationCount++;

    // Only process dates on or after the original event date
    if (currentDate >= eventDate) {
      let shouldInclude = false;
      const dateStr = formatDateString(currentDate);

      switch (frequency) {
        case 'daily': {
          const daysDiff = daysBetween(eventDate, currentDate);
          shouldInclude = daysDiff >= 0 && daysDiff % interval === 0;
          break;
        }

        case 'weekly': {
          const currentDayOfWeek = currentDate.getDay();

          // Check if this day of week should be included
          if (effectiveDaysOfWeek.includes(currentDayOfWeek)) {
            // Calculate weeks since the event started (using the first occurrence in that week)
            const eventWeekStart = getWeekStart(eventDate);
            const currentWeekStart = getWeekStart(currentDate);
            const weeksDiff = Math.round((currentWeekStart.getTime() - eventWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));

            shouldInclude = weeksDiff >= 0 && weeksDiff % interval === 0;
          }
          break;
        }

        case 'monthly': {
          const targetDay = dayOfMonth || eventDate.getDate();
          const monthsDiff = monthsBetween(eventDate, currentDate);

          // Handle months with fewer days
          const daysInCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
          const adjustedTargetDay = Math.min(targetDay, daysInCurrentMonth);

          shouldInclude = currentDate.getDate() === adjustedTargetDay &&
                         monthsDiff >= 0 &&
                         monthsDiff % interval === 0;
          break;
        }

        case 'yearly': {
          const targetMonth = (monthOfYear || (eventDate.getMonth() + 1)) - 1;
          const targetDay = dayOfMonth || eventDate.getDate();
          const yearsDiff = currentDate.getFullYear() - eventDate.getFullYear();

          // Handle Feb 29 on non-leap years
          const daysInTargetMonth = new Date(currentDate.getFullYear(), targetMonth + 1, 0).getDate();
          const adjustedTargetDay = Math.min(targetDay, daysInTargetMonth);

          shouldInclude = currentDate.getMonth() === targetMonth &&
                         currentDate.getDate() === adjustedTargetDay &&
                         yearsDiff >= 0 &&
                         yearsDiff % interval === 0;
          break;
        }
      }

      // Add instance if it should be included and is within our range
      if (shouldInclude && currentDate >= normalizedStartDate && currentDate <= effectiveEndDate) {
        // Skip if this date is excluded
        if (!excludedDates?.includes(dateStr)) {
          instances.push({
            ...event,
            id: event.id * 10000 + iterationCount, // Deterministic ID for instance
            date: dateStr,
            isRecurringInstance: true,
            parentEventId: event.id
          });
        }
      }
    }

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return instances;
}

/**
 * Get the start of the week (Sunday) for a given date
 */
function getWeekStart(date: Date): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - result.getDay());
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Calculate days between two dates (ignoring time)
 */
function daysBetween(date1: Date, date2: Date): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return Math.round((d2.getTime() - d1.getTime()) / (24 * 60 * 60 * 1000));
}

/**
 * Calculate months between two dates
 */
function monthsBetween(date1: Date, date2: Date): number {
  return (date2.getFullYear() - date1.getFullYear()) * 12 +
         (date2.getMonth() - date1.getMonth());
}

/**
 * Format date to YYYY-MM-DD string
 */
function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get all events for a specific date (including recurring instances)
 */
export function getEventsForDate(
  events: CalendarEvent[],
  date: string
): CalendarEvent[] {
  const targetDate = new Date(date + 'T00:00:00');
  const dateStr = formatDateString(targetDate);

  // Get regular (non-recurring) events for this date
  const regularEvents = events.filter(e => !e.recurring && e.date === dateStr);

  // Generate recurring instances for this specific date
  const recurringEvents = events.filter(e => e.recurring);
  const recurringInstances = recurringEvents.flatMap(event => {
    return generateRecurringInstances(event, targetDate, targetDate);
  });

  // Sort by time
  return [...regularEvents, ...recurringInstances].sort((a, b) => {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
}

/**
 * Get all events in a date range (including recurring instances)
 */
export function getEventsInRange(
  events: CalendarEvent[],
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  // Get regular events in range
  const regularEvents = events.filter(e => {
    if (e.recurring) return false;
    const eventDate = new Date(e.date + 'T00:00:00');
    return eventDate >= startDate && eventDate <= endDate;
  });

  // Generate all recurring instances in range
  const recurringEvents = events.filter(e => e.recurring);
  const recurringInstances = recurringEvents.flatMap(event =>
    generateRecurringInstances(event, startDate, endDate)
  );

  // Combine and sort by date, then time
  return [...regularEvents, ...recurringInstances].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;

    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return a.time.localeCompare(b.time);
  });
}

/**
 * Get upcoming events with reminders
 */
export function getUpcomingReminders(
  events: CalendarEvent[],
  currentDate: Date,
  lookAheadHours: number = 24
): Array<{ event: CalendarEvent; reminderMinutes: number; reminderTime: Date }> {
  const endDate = new Date(currentDate.getTime() + lookAheadHours * 60 * 60 * 1000);
  const allEvents = getEventsInRange(events, currentDate, endDate);

  const reminders: Array<{ event: CalendarEvent; reminderMinutes: number; reminderTime: Date }> = [];

  allEvents.forEach(event => {
    if (!event.reminders || event.reminders.length === 0) return;

    // Parse event date and time
    const eventDateTime = new Date(event.date + 'T00:00:00');
    if (event.time) {
      const [hours, minutes] = event.time.split(':').map(Number);
      eventDateTime.setHours(hours, minutes, 0, 0);
    } else {
      // Default to 9 AM if no time specified
      eventDateTime.setHours(9, 0, 0, 0);
    }

    event.reminders.forEach(reminder => {
      const reminderTime = new Date(eventDateTime.getTime() - reminder.minutes * 60 * 1000);

      // Only include reminders that are in the future
      if (reminderTime > currentDate && reminderTime <= endDate) {
        reminders.push({
          event,
          reminderMinutes: reminder.minutes,
          reminderTime
        });
      }
    });
  });

  return reminders.sort((a, b) => a.reminderTime.getTime() - b.reminderTime.getTime());
}

/**
 * Format time for display (12-hour format)
 */
export function formatEventTime(time?: string): string {
  if (!time) return '';

  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Get human-readable recurring description
 */
export function getRecurringDescription(event: CalendarEvent): string {
  if (!event.recurring) return '';

  const { frequency, interval, daysOfWeek, endDate } = event.recurring;
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  let description = '';

  if (interval === 1) {
    switch (frequency) {
      case 'daily':
        description = 'Daily';
        break;
      case 'weekly':
        if (daysOfWeek && daysOfWeek.length > 0) {
          const days = daysOfWeek.sort((a, b) => a - b).map(d => dayNames[d]).join(', ');
          description = `Weekly on ${days}`;
        } else {
          // Default to event's day
          const eventDay = new Date(event.date + 'T00:00:00').getDay();
          description = `Weekly on ${dayNames[eventDay]}`;
        }
        break;
      case 'monthly':
        description = 'Monthly';
        break;
      case 'yearly':
        description = 'Yearly';
        break;
    }
  } else {
    switch (frequency) {
      case 'daily':
        description = `Every ${interval} days`;
        break;
      case 'weekly':
        description = `Every ${interval} weeks`;
        if (daysOfWeek && daysOfWeek.length > 0) {
          const days = daysOfWeek.sort((a, b) => a - b).map(d => dayNames[d]).join(', ');
          description += ` on ${days}`;
        }
        break;
      case 'monthly':
        description = `Every ${interval} months`;
        break;
      case 'yearly':
        description = `Every ${interval} years`;
        break;
    }
  }

  if (endDate) {
    description += ` until ${new Date(endDate + 'T00:00:00').toLocaleDateString()}`;
  }

  return description;
}

/**
 * Generate ICS (iCalendar) content for an event
 * This allows exporting to any calendar app (Google, Apple, Outlook, etc.)
 */
export function generateICS(event: CalendarEvent): string {
  const now = new Date();
  const uid = `${event.id}-${now.getTime()}@recover.app`;

  // Format date/time for ICS
  const formatICSDate = (dateStr: string, timeStr?: string): string => {
    const date = new Date(dateStr + 'T00:00:00');
    if (timeStr) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      date.setHours(hours, minutes, 0, 0);
      // Format as YYYYMMDDTHHMMSS
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }
    // All-day event format: YYYYMMDD
    return dateStr.replace(/-/g, '');
  };

  // Generate RRULE for recurring events
  const generateRRule = (): string => {
    if (!event.recurring) return '';

    const { frequency, interval, daysOfWeek, dayOfMonth, monthOfYear, endDate } = event.recurring;
    let rrule = `RRULE:FREQ=${frequency.toUpperCase()}`;

    if (interval > 1) {
      rrule += `;INTERVAL=${interval}`;
    }

    if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
      const dayMap = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
      rrule += `;BYDAY=${daysOfWeek.map(d => dayMap[d]).join(',')}`;
    }

    if (frequency === 'monthly' && dayOfMonth) {
      rrule += `;BYMONTHDAY=${dayOfMonth}`;
    }

    if (frequency === 'yearly') {
      if (monthOfYear) rrule += `;BYMONTH=${monthOfYear}`;
      if (dayOfMonth) rrule += `;BYMONTHDAY=${dayOfMonth}`;
    }

    if (endDate) {
      rrule += `;UNTIL=${endDate.replace(/-/g, '')}T235959Z`;
    }

    return rrule;
  };

  // Build ICS content
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Recover App//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatICSDate(now.toISOString().split('T')[0], now.toTimeString().slice(0, 5))}`,
  ];

  // Add start date/time
  if (event.time) {
    lines.push(`DTSTART:${formatICSDate(event.date, event.time)}`);
    // Default 1 hour duration
    const endDateTime = new Date(event.date + 'T' + event.time);
    endDateTime.setHours(endDateTime.getHours() + 1);
    lines.push(`DTEND:${formatICSDate(event.date, endDateTime.toTimeString().slice(0, 5))}`);
  } else {
    // All-day event
    lines.push(`DTSTART;VALUE=DATE:${formatICSDate(event.date)}`);
    const nextDay = new Date(event.date + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    lines.push(`DTEND;VALUE=DATE:${formatDateString(nextDay).replace(/-/g, '')}`);
  }

  lines.push(`SUMMARY:${escapeICSText(event.title)}`);

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
  }

  // Add recurrence rule
  const rrule = generateRRule();
  if (rrule) {
    lines.push(rrule);
  }

  // Add reminders as VALARM
  if (event.reminders && event.reminders.length > 0) {
    event.reminders.forEach(reminder => {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:${escapeICSText(event.title)}`);

      if (reminder.minutes === 0) {
        lines.push('TRIGGER:PT0M');
      } else if (reminder.minutes < 60) {
        lines.push(`TRIGGER:-PT${reminder.minutes}M`);
      } else if (reminder.minutes < 1440) {
        lines.push(`TRIGGER:-PT${reminder.minutes / 60}H`);
      } else {
        lines.push(`TRIGGER:-P${reminder.minutes / 1440}D`);
      }

      lines.push('END:VALARM');
    });
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Escape text for ICS format
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Download ICS file for an event
 */
export function downloadICS(event: CalendarEvent): void {
  const icsContent = generateICS(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate calendar URL for various providers
 */
export function getCalendarUrls(event: CalendarEvent): {
  google: string;
  outlook: string;
  yahoo: string;
  ics: string;
} {
  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(event.description || '');

  // Format dates for URLs
  const startDate = event.date.replace(/-/g, '');
  let endDate = startDate;

  if (event.time) {
    const start = new Date(event.date + 'T' + event.time);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default

    const formatDateTime = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Google Calendar
    const googleDates = `${formatDateTime(start)}/${formatDateTime(end)}`;

    // Generate URLs
    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${googleDates}&details=${description}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${start.toISOString()}&enddt=${end.toISOString()}&body=${description}`,
      yahoo: `https://calendar.yahoo.com/?v=60&title=${title}&st=${startDate}T${event.time.replace(':', '')}00&dur=0100&desc=${description}`,
      ics: 'download' // Will trigger ICS download
    };
  } else {
    // All-day event
    const nextDay = new Date(event.date + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    endDate = formatDateString(nextDay).replace(/-/g, '');

    return {
      google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${description}`,
      outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${event.date}&enddt=${event.date}&allday=true&body=${description}`,
      yahoo: `https://calendar.yahoo.com/?v=60&title=${title}&st=${startDate}&et=${endDate}&desc=${description}`,
      ics: 'download'
    };
  }
}
