import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export interface NotificationSettings {
  enabled: boolean;
  dailyReminderTime: string; // Format: "HH:mm" (24-hour)
  streakReminders: boolean;
  meetingReminders: boolean;
  milestoneNotifications: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  dailyReminderTime: '09:00',
  streakReminders: true,
  meetingReminders: true,
  milestoneNotifications: true,
};

/**
 * Check if the app is running on a native platform (iOS/Android)
 */
export function isNative(): boolean {
  return Capacitor.isNativePlatform();
}

/**
 * Request permission to show notifications
 * Returns true if permission is granted
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) {
    return false;
  }

  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Check if notification permissions are granted
 */
export async function checkNotificationPermission(): Promise<boolean> {
  if (!isNative()) {
    return false;
  }

  try {
    const permission = await LocalNotifications.checkPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return false;
  }
}

/**
 * Schedule daily check-in reminder
 */
export async function scheduleDailyCheckInReminder(time: string): Promise<void> {
  if (!isNative()) {
    return;
  }

  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) {
      return;
    }

    // Cancel existing daily reminder
    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

    // Parse time (format: "HH:mm")
    const [hour, minute] = time.split(':').map(Number);

    // Create schedule for daily notification
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const notification: ScheduleOptions = {
      notifications: [
        {
          id: 1,
          title: 'Daily Check-In',
          body: 'Time for your daily check-in. Open the app to get started.',
          schedule: {
            at: scheduledTime,
            every: 'day',
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: {
            type: 'daily-checkin',
          },
        },
      ],
    };

    await LocalNotifications.schedule(notification);
  } catch (error) {
    console.error('Error scheduling daily check-in reminder:', error);
  }
}

/**
 * Schedule a streak risk reminder (if user hasn't checked in today)
 */
export async function scheduleStreakRiskReminder(): Promise<void> {
  if (!isNative()) return;

  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) return;

    // Schedule for 8 PM today
    const scheduledTime = new Date();
    scheduledTime.setHours(20, 0, 0, 0);

    // If it's already past 8 PM, skip (will be handled tomorrow)
    if (scheduledTime < new Date()) {
      return;
    }

    const notification: ScheduleOptions = {
      notifications: [
        {
          id: 2,
          title: "Don't Break Your Streak!",
          body: "You haven't checked in today. Keep your streak alive!",
          schedule: {
            at: scheduledTime,
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: {
            type: 'streak-reminder',
          },
        },
      ],
    };

    await LocalNotifications.schedule(notification);
  } catch (error) {
    console.error('Error scheduling streak reminder:', error);
  }
}

/**
 * Schedule a meeting reminder
 */
export async function scheduleMeetingReminder(
  meetingId: number,
  title: string,
  dateTime: Date,
  minutesBefore: number = 30
): Promise<void> {
  if (!isNative()) return;

  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) return;

    const reminderTime = new Date(dateTime.getTime() - minutesBefore * 60 * 1000);

    // Don't schedule if the reminder time has already passed
    if (reminderTime < new Date()) {
      return;
    }

    // HIPAA / 42 CFR Part 2: notification text appears on the lock screen.
    // Do NOT include the meeting name or any recovery specifics — keep it
    // generic and put details behind the app's authenticated lock.
    const notification: ScheduleOptions = {
      notifications: [
        {
          id: 100 + meetingId, // Offset to avoid conflicts with other notification types
          title: 'Reminder',
          body: `You have a reminder in ${minutesBefore} minutes. Open the app for details.`,
          schedule: {
            at: reminderTime,
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: {
            type: 'meeting-reminder',
            meetingId,
          },
        },
      ],
    };

    await LocalNotifications.schedule(notification);
  } catch (error) {
    console.error('Error scheduling meeting reminder:', error);
  }
}

/**
 * Show a milestone celebration notification
 */
export async function showMilestoneNotification(
  milestone: string,
  daysSober: number
): Promise<void> {
  if (!isNative()) return;

  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) return;

    // HIPAA / 42 CFR Part 2: the day count and "sober" disclose recovery
    // status on the lock screen. Keep the body generic; the specifics
    // (milestone, days) live inside the authenticated app.
    const notification: ScheduleOptions = {
      notifications: [
        {
          id: Date.now(), // Use timestamp to avoid conflicts
          title: '🎉 Milestone Achieved!',
          body: 'You reached a new milestone. Open the app to celebrate!',
          schedule: {
            at: new Date(Date.now() + 1000), // Show in 1 second
          },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: {
            // Specifics travel in the (non-displayed) payload, surfaced only
            // after the user opens the authenticated app.
            type: 'milestone',
            daysSober,
            milestone,
          },
        },
      ],
    };

    await LocalNotifications.schedule(notification);
  } catch (error) {
    console.error('Error showing milestone notification:', error);
  }
}

/**
 * Cancel a specific meeting reminder
 */
export async function cancelMeetingReminder(meetingId: number): Promise<void> {
  if (!isNative()) return;

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: 100 + meetingId }],
    });
  } catch (error) {
    console.error('Error canceling meeting reminder:', error);
  }
}

// Notification ID bands. Medication reminders are scheduled in bulk and
// cancelled by their `extra.type`, so the exact ids only need to be collision-
// free with the other notification kinds (daily=1, streak=2, meetings=100+).
const MED_REMINDER_BASE = 500000;
const MED_REFILL_BASE = 600000;
const MED_REMINDER_MAX = 90; // safety cap on total scheduled dose reminders

/** Minimal shape needed to schedule reminders from a Medication. */
export interface MedicationReminderInput {
  id: number;
  isActive?: boolean;
  times?: string[];
  refillDate?: string;
  refillReminder?: boolean;
}

/**
 * Cancel all medication dose + refill reminders (identified by extra.type).
 */
export async function cancelMedicationReminders(): Promise<void> {
  if (!isNative()) return;

  try {
    const pending = await LocalNotifications.getPending();
    const ours = pending.notifications.filter(
      (n) => n.extra?.type === 'medication' || n.extra?.type === 'medication-refill'
    );
    if (ours.length > 0) {
      await LocalNotifications.cancel({ notifications: ours.map((n) => ({ id: n.id })) });
    }
  } catch (error) {
    console.error('Error canceling medication reminders:', error);
  }
}

/**
 * (Re)schedule daily medication-time reminders and refill reminders from the
 * patient's medication list. Idempotent — cancels existing medication
 * reminders first.
 *
 * HIPAA / 42 CFR Part 2: the medication name never appears in the notification
 * body (which shows on the lock screen). The body is a generic prompt; the
 * specifics live in `extra`, surfaced only inside the authenticated app.
 */
export async function scheduleMedicationReminders(
  medications: MedicationReminderInput[]
): Promise<void> {
  if (!isNative()) return;

  try {
    const hasPermission = await checkNotificationPermission();
    if (!hasPermission) return;

    // Replace any previously-scheduled medication reminders.
    await cancelMedicationReminders();

    const now = new Date();
    const toSchedule: ScheduleOptions['notifications'] = [];

    // Daily dose reminders — one repeating notification per active med per time.
    let slot = 0;
    for (const med of medications) {
      if (med.isActive === false) continue;
      for (const time of med.times ?? []) {
        if (slot >= MED_REMINDER_MAX) break;
        const [hour, minute] = time.split(':').map(Number);
        if (Number.isNaN(hour) || Number.isNaN(minute)) continue;

        const at = new Date();
        at.setHours(hour, minute, 0, 0);
        if (at < now) at.setDate(at.getDate() + 1);

        toSchedule.push({
          id: MED_REMINDER_BASE + slot,
          title: 'Reminder',
          body: 'You have a reminder. Open the app for details.',
          schedule: { at, every: 'day' },
          sound: undefined,
          attachments: undefined,
          actionTypeId: '',
          extra: { type: 'medication', medicationId: med.id, time },
        });
        slot++;
      }
    }

    // Refill reminders — one-off, 3 days before the refill date at 9am.
    let refillSlot = 0;
    for (const med of medications) {
      if (med.isActive === false || !med.refillReminder || !med.refillDate) continue;
      const refill = new Date(med.refillDate);
      if (Number.isNaN(refill.getTime())) continue;

      const at = new Date(refill.getTime() - 3 * 24 * 60 * 60 * 1000);
      at.setHours(9, 0, 0, 0);
      if (at < now) continue; // refill window already passed

      toSchedule.push({
        id: MED_REFILL_BASE + refillSlot,
        title: 'Reminder',
        body: 'You have a reminder. Open the app for details.',
        schedule: { at },
        sound: undefined,
        attachments: undefined,
        actionTypeId: '',
        extra: { type: 'medication-refill', medicationId: med.id },
      });
      refillSlot++;
    }

    if (toSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: toSchedule });
    }
  } catch (error) {
    console.error('Error scheduling medication reminders:', error);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (!isNative()) return;

  try {
    await LocalNotifications.removeAllDeliveredNotifications();
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

/**
 * Initialize notifications when settings are enabled
 */
export async function initializeNotifications(
  settings: NotificationSettings
): Promise<void> {
  if (!settings.enabled) {
    await cancelAllNotifications();
    return;
  }

  // Schedule daily check-in reminder
  await scheduleDailyCheckInReminder(settings.dailyReminderTime);
}
