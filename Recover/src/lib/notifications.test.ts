import { describe, it, expect, vi, beforeEach } from 'vitest';

// Hoisted so the vi.mock factories (which run before imports) can reference them.
const mocks = vi.hoisted(() => ({
  schedule: vi.fn().mockResolvedValue(undefined),
  cancel: vi.fn().mockResolvedValue(undefined),
  getPending: vi.fn().mockResolvedValue({ notifications: [] }),
  checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
  isNative: vi.fn().mockReturnValue(true),
}));

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    schedule: mocks.schedule,
    cancel: mocks.cancel,
    getPending: mocks.getPending,
    checkPermissions: mocks.checkPermissions,
    requestPermissions: vi.fn(),
    removeAllDeliveredNotifications: vi.fn(),
  },
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: mocks.isNative },
}));

import { scheduleMedicationReminders, cancelMedicationReminders } from './notifications';

const GENERIC_BODY = 'You have a reminder. Open the app for details.';
const futureDate = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
const pastDate = () => new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();

/** The notifications passed to the most recent schedule() call. */
function scheduledNotifications() {
  const calls = mocks.schedule.mock.calls
  const lastCall = calls[calls.length - 1]
  return lastCall?.[0]?.notifications ?? []
}

describe('medication reminders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isNative.mockReturnValue(true);
    mocks.checkPermissions.mockResolvedValue({ display: 'granted' });
    mocks.getPending.mockResolvedValue({ notifications: [] });
  });

  it('schedules one daily repeating reminder per active med per time', async () => {
    await scheduleMedicationReminders([
      { id: 1, isActive: true, times: ['09:00', '21:00'] },
    ]);

    expect(mocks.schedule).toHaveBeenCalledTimes(1);
    const notifs = scheduledNotifications();
    expect(notifs).toHaveLength(2);
    for (const n of notifs) {
      expect(n.schedule.every).toBe('day');
      expect(n.extra.type).toBe('medication');
      expect(n.extra.medicationId).toBe(1);
    }
  });

  it('never puts the medication name/details in the lock-screen body (HIPAA)', async () => {
    await scheduleMedicationReminders([{ id: 1, isActive: true, times: ['08:00'] }]);
    const [n] = scheduledNotifications();
    expect(n.body).toBe(GENERIC_BODY);
    expect(n.title).toBe('Reminder');
  });

  it('skips inactive medications', async () => {
    await scheduleMedicationReminders([
      { id: 1, isActive: false, times: ['09:00'] },
    ]);
    // Nothing to schedule → schedule() not called.
    expect(mocks.schedule).not.toHaveBeenCalled();
  });

  it('ignores malformed times', async () => {
    await scheduleMedicationReminders([
      { id: 1, isActive: true, times: ['not-a-time', '07:30'] },
    ]);
    const notifs = scheduledNotifications();
    expect(notifs).toHaveLength(1);
    expect(notifs[0].extra.time).toBe('07:30');
  });

  it('schedules a refill reminder for a future refill date', async () => {
    await scheduleMedicationReminders([
      { id: 5, isActive: true, refillReminder: true, refillDate: futureDate() },
    ]);
    const refill = scheduledNotifications().find(
      (n: { extra: { type: string } }) => n.extra.type === 'medication-refill'
    );
    expect(refill).toBeTruthy();
    expect(refill.extra.medicationId).toBe(5);
    expect(refill.body).toBe(GENERIC_BODY);
  });

  it('does not schedule a refill reminder whose window already passed', async () => {
    await scheduleMedicationReminders([
      { id: 5, isActive: true, refillReminder: true, refillDate: pastDate() },
    ]);
    expect(mocks.schedule).not.toHaveBeenCalled();
  });

  it('cancels existing medication reminders before scheduling (idempotent)', async () => {
    mocks.getPending.mockResolvedValue({
      notifications: [
        { id: 500000, extra: { type: 'medication' } },
        { id: 600000, extra: { type: 'medication-refill' } },
        { id: 1, extra: { type: 'daily-checkin' } }, // unrelated — must be left alone
      ],
    });

    await scheduleMedicationReminders([{ id: 1, isActive: true, times: ['09:00'] }]);

    expect(mocks.cancel).toHaveBeenCalledWith({
      notifications: [{ id: 500000 }, { id: 600000 }],
    });
  });

  it('is a no-op off native platforms', async () => {
    mocks.isNative.mockReturnValue(false);
    await scheduleMedicationReminders([{ id: 1, isActive: true, times: ['09:00'] }]);
    await cancelMedicationReminders();
    expect(mocks.checkPermissions).not.toHaveBeenCalled();
    expect(mocks.schedule).not.toHaveBeenCalled();
    expect(mocks.getPending).not.toHaveBeenCalled();
  });
});
