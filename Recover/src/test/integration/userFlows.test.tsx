/**
 * Integration Tests - Critical User Flows
 *
 * Tests complete end-to-end user scenarios including:
 * - New user onboarding
 * - Daily check-in flow
 * - Craving management
 * - Milestone celebration
 * - Badge earning
 * - Data backup and restore
 * - Relapse tracking and recovery
 *
 * These tests validate store-level data flows to ensure
 * each user journey works correctly end-to-end.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { calculateDaysSober, calculateStreak } from '@/lib/utils';
import { getMilestone } from '@/lib/utils-app';
import { calculateBadgeProgress, getEarnedBadges } from '@/lib/badges';

// Helper to reset all stores to fresh state
const resetAllStores = () => {
  const recoveryStore = useRecoveryStore.getState();
  const journalStore = useJournalStore.getState();
  const activitiesStore = useActivitiesStore.getState();
  const settingsStore = useSettingsStore.getState();

  // Reset to initial state
  recoveryStore.setSobrietyDate('');
  recoveryStore.setCostPerDay(0);
  recoveryStore.setUnlockedBadges([]);
  recoveryStore.setReasonsForSobriety([]);
  recoveryStore.setCleanPeriods([]);
  recoveryStore.setRelapses([]);

  journalStore.setCheckIns([]);
  journalStore.setMeditations([]);
  journalStore.setMeetings([]);
  journalStore.setGratitude([]);
  journalStore.setGrowthLogs([]);
  journalStore.setChallenges([]);

  activitiesStore.setCravings([]);

  settingsStore.setGoals([]);
  settingsStore.setContacts([]);

  settingsStore.setDarkMode(false);
  settingsStore.setCelebrationsEnabled(true);
};

describe('Integration Tests - User Flows', () => {
  beforeEach(() => {
    resetAllStores();
    vi.clearAllMocks();
  });

  describe('Flow 1: New User Onboarding', () => {
    it('should complete full onboarding flow', () => {
      // Step 1: New user has no sobriety date (we cleared it in reset)
      const recoveryStore = useRecoveryStore.getState();
      expect(recoveryStore.sobrietyDate).toBe('');

      // Step 2: User sets sobriety date to today
      const today = new Date().toISOString().split('T')[0];
      recoveryStore.setSobrietyDate(today);

      // Step 3: Verify sobriety date is set
      expect(useRecoveryStore.getState().sobrietyDate).toBe(today);

      // Step 4: Verify days sober calculation works
      const daysSober = calculateDaysSober(today);
      // Math.ceil means same-day could be 0 or 1 depending on time
      expect(daysSober).toBeLessThanOrEqual(1);

      // Step 5: User completes first daily check-in
      const journalStore = useJournalStore.getState();
      const newCheckIn = {
        id: Date.now(),
        date: today,
        mood: 5,
        notes: 'First check-in!',
      };
      journalStore.setCheckIns([newCheckIn]);

      // Step 6: Verify check-in was saved
      expect(useJournalStore.getState().checkIns.length).toBe(1);
      expect(useJournalStore.getState().checkIns[0].mood).toBe(5);

      // Step 7: Verify milestone text for day 0
      const milestone = getMilestone(daysSober);
      expect(milestone.text).toContain('Starting Strong');
    });

    it('should guide user through setting up recovery reasons', () => {
      const recoveryStore = useRecoveryStore.getState();

      // User adds reasons for sobriety
      recoveryStore.setReasonsForSobriety([
        { id: 1, date: new Date().toISOString().split('T')[0], text: 'Better health' },
        { id: 2, date: new Date().toISOString().split('T')[0], text: 'Family relationships' },
        { id: 3, date: new Date().toISOString().split('T')[0], text: 'Career goals' },
      ]);

      // Verify reasons are stored
      expect(useRecoveryStore.getState().reasonsForSobriety).toHaveLength(3);
      expect(useRecoveryStore.getState().reasonsForSobriety[0].text).toBe('Better health');
    });
  });

  describe('Flow 2: Daily Check-In Journey', () => {
    it('should complete daily check-in with HALT assessment', () => {
      // Setup: User is 7 days sober
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      useRecoveryStore.getState().setSobrietyDate(sevenDaysAgo.toISOString().split('T')[0]);

      // Step 1: User creates check-in with HALT data
      const today = new Date().toISOString().split('T')[0];
      const checkIn = {
        id: Date.now(),
        date: today,
        mood: 4,
        notes: 'Feeling strong today. Grateful for support.',
        halt: {
          hungry: 2,
          angry: 1,
          lonely: 3,
          tired: 4,
        },
      };

      const journalStore = useJournalStore.getState();
      journalStore.setCheckIns([checkIn]);

      // Step 2: Verify check-in includes HALT data
      const checkIns = useJournalStore.getState().checkIns;
      expect(checkIns.length).toBe(1);
      expect(checkIns[0].notes).toContain('Feeling strong');
      expect(checkIns[0].halt).toBeDefined();
      expect(checkIns[0].halt!.hungry).toBe(2);
      expect(checkIns[0].halt!.tired).toBe(4);

      // Step 3: Verify streak calculation
      const streak = calculateStreak(checkIns);
      expect(streak).toBeGreaterThanOrEqual(1);
    });

    it('should build check-in streak over multiple days', () => {
      const journalStore = useJournalStore.getState();

      // Simulate 5 consecutive days of check-ins (today and 4 days back)
      const checkIns = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);

        checkIns.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          mood: 4 + (i % 2), // Varying moods: 4, 5, 4, 5, 4
          notes: `Day ${i + 1} check-in`,
        });
      }

      journalStore.setCheckIns(checkIns);

      // Verify 5-day streak is calculated
      const streak = calculateStreak(useJournalStore.getState().checkIns);
      expect(streak).toBe(5);
    });
  });

  describe('Flow 3: Craving Management', () => {
    it('should handle craving from trigger to resolution', () => {
      // Setup: User is 14 days sober
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
      useRecoveryStore.getState().setSobrietyDate(twoWeeksAgo.toISOString().split('T')[0]);

      // Step 1: User logs a craving
      const today = new Date().toISOString().split('T')[0];
      const craving = {
        id: 1,
        date: today,
        intensity: 8,
        trigger: 'Stress',
        triggerNotes: 'Difficult conversation at work triggered strong urge',
        copingStrategy: 'Called sponsor, went for a walk, deep breathing',
        overcame: true,
      };

      const activitiesStore = useActivitiesStore.getState();
      activitiesStore.setCravings([craving]);

      // Step 2: Verify craving logged with success
      const cravings = useActivitiesStore.getState().cravings;
      expect(cravings.length).toBe(1);
      expect(cravings[0].overcame).toBe(true);
      expect(cravings[0].trigger).toBe('Stress');
      expect(cravings[0].intensity).toBe(8);
      expect(cravings[0].copingStrategy).toBe('Called sponsor, went for a walk, deep breathing');
    });

    it('should show pattern recognition after multiple cravings', () => {
      const activitiesStore = useActivitiesStore.getState();

      // Simulate pattern: stress-triggered cravings over 5 days
      const cravings = [];
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        cravings.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          intensity: 7 + i,
          trigger: 'Stress',
          triggerNotes: `Stressful event ${i + 1}`,
          copingStrategy: 'Exercise',
          overcame: true,
        });
      }

      activitiesStore.setCravings(cravings);

      // Verify cravings stored
      const storedCravings = useActivitiesStore.getState().cravings;
      expect(storedCravings).toHaveLength(5);

      // Verify pattern: all cravings have same trigger
      const triggers = storedCravings.map(c => c.trigger);
      const uniqueTriggers = [...new Set(triggers)];
      expect(uniqueTriggers).toHaveLength(1);
      expect(uniqueTriggers[0]).toBe('Stress');

      // Verify all were overcome
      expect(storedCravings.every(c => c.overcame)).toBe(true);
    });
  });

  describe('Flow 4: Milestone and Badge Journey', () => {
    it('should earn badges as user progresses', () => {
      const recoveryStore = useRecoveryStore.getState();
      const journalStore = useJournalStore.getState();

      // Day 1: Check 24h badge - user is 1 day sober
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      recoveryStore.setSobrietyDate(oneDayAgo.toISOString().split('T')[0]);

      // Verify milestone text for 1 day
      const milestone1 = getMilestone(1);
      expect(milestone1.text).toContain('Starting Strong');

      // Day 7: Earn 1 Week badge
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      recoveryStore.setSobrietyDate(sevenDaysAgo.toISOString().split('T')[0]);

      // Add check-ins for streak badge
      const checkIns = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        checkIns.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          mood: 4,
          notes: '',
        });
      }
      journalStore.setCheckIns(checkIns);

      // Verify milestone text for 7 days
      const milestone7 = getMilestone(7);
      expect(milestone7.text).toContain('1 Week');

      // Calculate badge progress
      const badgeProgress = calculateBadgeProgress({
        sobrietyDate: useRecoveryStore.getState().sobrietyDate,
        checkIns: useJournalStore.getState().checkIns,
        meditations: [],
        meetings: [],
        cravings: [],
        gratitude: [],
        growthLogs: [],
        challenges: [],
        unlockedBadges: [],
      });

      // Verify badges are earned
      const earnedBadges = getEarnedBadges(badgeProgress);
      const earnedIds = earnedBadges.map(b => b.badge.id);
      expect(earnedIds).toContain('24h');
      expect(earnedIds).toContain('1week');

      // Verify streak badge
      expect(earnedIds).toContain('streak7');
    });

    it('should celebrate milestone achievements', () => {
      // Setup: User reaches 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      useRecoveryStore.getState().setSobrietyDate(thirtyDaysAgo.toISOString().split('T')[0]);

      // Enable celebrations
      useSettingsStore.getState().setCelebrationsEnabled(true);

      // Verify milestone text
      const daysSober = calculateDaysSober(useRecoveryStore.getState().sobrietyDate);
      expect(daysSober).toBeGreaterThanOrEqual(29);
      expect(daysSober).toBeLessThanOrEqual(31);

      const milestone = getMilestone(daysSober);
      expect(milestone.text).toContain('30');

      // Verify celebrations are enabled
      expect(useSettingsStore.getState().celebrationsEnabled).toBe(true);

      // Calculate badge progress for 30 days
      const badgeProgress = calculateBadgeProgress({
        sobrietyDate: useRecoveryStore.getState().sobrietyDate,
        checkIns: [],
        meditations: [],
        meetings: [],
        cravings: [],
        gratitude: [],
        growthLogs: [],
        challenges: [],
        unlockedBadges: [],
      });

      const earnedBadges = getEarnedBadges(badgeProgress);
      const earnedIds = earnedBadges.map(b => b.badge.id);
      expect(earnedIds).toContain('30days');
    });
  });

  describe('Flow 5: Relapse Tracking and Recovery', () => {
    it('should handle relapse documentation and recovery restart', () => {
      // Setup: User was 60 days sober
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      useRecoveryStore.getState().setSobrietyDate(sixtyDaysAgo.toISOString().split('T')[0]);

      const recoveryStore = useRecoveryStore.getState();
      const today = new Date().toISOString().split('T')[0];

      // Verify initial days sober
      const initialDays = calculateDaysSober(useRecoveryStore.getState().sobrietyDate);
      expect(initialDays).toBeGreaterThanOrEqual(59);

      // Step 1: User documents relapse
      const relapse = {
        id: 1,
        date: today,
        triggers: ['Stress', 'Social pressure'],
        emotions: ['Anxious', 'Overwhelmed'],
        circumstances: 'Work party, felt isolated without drinking',
        thoughts: 'Felt like one drink would not matter',
        consequences: 'Felt guilty and disappointed in myself',
        supportUsed: ['Called sponsor after'],
        lessonsLearned: 'Need better coping strategies for social events',
        preventionPlan: 'Practice saying no, leave early if uncomfortable',
        severity: 3,
        daysCleanBefore: 60,
        isPrivate: false,
      };

      recoveryStore.setRelapses([relapse]);

      // Step 2: Clean period is recorded (60 days)
      recoveryStore.setCleanPeriods([
        {
          id: 1,
          startDate: sixtyDaysAgo.toISOString().split('T')[0],
          endDate: today,
          daysClean: 60,
        },
      ]);

      // Step 3: Sobriety date resets to today
      recoveryStore.setSobrietyDate(today);

      // Step 4: Verify relapse was logged
      expect(useRecoveryStore.getState().relapses).toHaveLength(1);
      expect(useRecoveryStore.getState().cleanPeriods).toHaveLength(1);
      expect(useRecoveryStore.getState().cleanPeriods[0].daysClean).toBe(60);

      // Step 5: Verify fresh start
      const newDaysSober = calculateDaysSober(useRecoveryStore.getState().sobrietyDate);
      // Math.ceil means same-day could be 0 or 1
      expect(newDaysSober).toBeLessThanOrEqual(1);
    });

    it('should preserve badge progress after relapse', () => {
      const recoveryStore = useRecoveryStore.getState();

      // User had earned multiple badges before relapse
      recoveryStore.setUnlockedBadges(['24h', '1week', '30days']);

      // User experiences relapse
      const today = new Date().toISOString().split('T')[0];
      recoveryStore.setSobrietyDate(today);

      // Badges should still be preserved (achievements are permanent)
      expect(useRecoveryStore.getState().unlockedBadges).toContain('30days');
      expect(useRecoveryStore.getState().unlockedBadges).toContain('24h');
      expect(useRecoveryStore.getState().unlockedBadges).toContain('1week');
    });
  });

  describe('Flow 6: Data Backup and Restore', () => {
    it('should export data and restore successfully', () => {
      // Setup: User has significant data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      useRecoveryStore.getState().setSobrietyDate(thirtyDaysAgo.toISOString().split('T')[0]);
      useRecoveryStore.getState().setUnlockedBadges(['24h', '1week', '30days']);

      useJournalStore.getState().setCheckIns([
        { id: 1, date: '2024-01-01', mood: 5, notes: 'Great day' },
        { id: 2, date: '2024-01-02', mood: 4, notes: 'Good day' },
      ]);

      // Capture current state (simulating export)
      const originalState = {
        sobrietyDate: useRecoveryStore.getState().sobrietyDate,
        badges: useRecoveryStore.getState().unlockedBadges,
        checkIns: useJournalStore.getState().checkIns,
      };

      // Verify data exists before "export"
      expect(originalState.sobrietyDate).toBeTruthy();
      expect(originalState.badges).toHaveLength(3);
      expect(originalState.checkIns).toHaveLength(2);

      // Step 1: Clear all data (simulating data loss)
      resetAllStores();

      // Step 2: Verify data is cleared
      expect(useRecoveryStore.getState().sobrietyDate).toBe('');
      expect(useJournalStore.getState().checkIns).toHaveLength(0);
      expect(useRecoveryStore.getState().unlockedBadges).toHaveLength(0);

      // Step 3: Import/restore data
      useRecoveryStore.getState().setSobrietyDate(originalState.sobrietyDate);
      useRecoveryStore.getState().setUnlockedBadges(originalState.badges);
      useJournalStore.getState().setCheckIns(originalState.checkIns);

      // Step 4: Verify restoration
      expect(useRecoveryStore.getState().sobrietyDate).toBe(originalState.sobrietyDate);
      expect(useRecoveryStore.getState().unlockedBadges).toEqual(originalState.badges);
      expect(useJournalStore.getState().checkIns).toHaveLength(2);
      expect(useJournalStore.getState().checkIns[0].notes).toBe('Great day');
    });
  });

  describe('Flow 7: Complete Week Journey', () => {
    it('should complete a full week of recovery activities', () => {
      // Day 1: Start recovery
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      useRecoveryStore.getState().setSobrietyDate(sevenDaysAgo.toISOString().split('T')[0]);

      // Days 1-7: Daily check-ins
      const checkIns = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        checkIns.push({
          id: i + 1,
          date: date.toISOString().split('T')[0],
          mood: 3 + (i % 3), // Varying moods
          notes: `Day ${i + 1}`,
        });
      }
      useJournalStore.getState().setCheckIns(checkIns);

      // Days 3, 5: Cravings (both overcome)
      useActivitiesStore.getState().setCravings([
        {
          id: 1,
          date: checkIns[2].date,
          intensity: 7,
          trigger: 'Stress',
          overcame: true,
          copingStrategy: 'Exercise',
        },
        {
          id: 2,
          date: checkIns[4].date,
          intensity: 5,
          trigger: 'Social',
          overcame: true,
          copingStrategy: 'Called sponsor',
        },
      ]);

      // Days 2, 6: Attended meetings
      useJournalStore.getState().setMeetings([
        {
          id: 1,
          date: checkIns[1].date,
          type: 'AA',
          location: 'Community Center',
          notes: 'Inspiring',
        },
        {
          id: 2,
          date: checkIns[5].date,
          type: 'NA',
          location: 'Church Hall',
          notes: 'Supportive group',
        },
      ]);

      // Daily gratitude
      const gratitude = checkIns.map((ci, i) => ({
        id: i + 1,
        date: ci.date,
        entry: `Grateful for day ${i + 1}`,
      }));
      useJournalStore.getState().setGratitude(gratitude);

      // Verify all data
      const recoveryStore = useRecoveryStore.getState();
      const journalStore = useJournalStore.getState();
      const activitiesStore = useActivitiesStore.getState();

      expect(recoveryStore.sobrietyDate).toBeTruthy();
      expect(journalStore.checkIns).toHaveLength(7);
      expect(activitiesStore.cravings).toHaveLength(2);
      expect(activitiesStore.cravings.every((c) => c.overcame)).toBe(true);
      expect(journalStore.meetings).toHaveLength(2);
      expect(journalStore.gratitude).toHaveLength(7);

      // Verify 7-day streak
      const streak = calculateStreak(journalStore.checkIns);
      expect(streak).toBe(7);

      // Verify days sober
      const daysSober = calculateDaysSober(recoveryStore.sobrietyDate);
      expect(daysSober).toBeGreaterThanOrEqual(6);
      expect(daysSober).toBeLessThanOrEqual(8);

      // Verify milestone
      const milestone = getMilestone(daysSober);
      expect(milestone.text).toContain('1 Week');

      // Verify badge progress - week badge should be earned
      const badgeProgress = calculateBadgeProgress({
        sobrietyDate: recoveryStore.sobrietyDate,
        checkIns: journalStore.checkIns,
        meditations: [],
        meetings: journalStore.meetings,
        cravings: activitiesStore.cravings,
        gratitude: journalStore.gratitude,
        growthLogs: [],
        challenges: [],
        unlockedBadges: recoveryStore.unlockedBadges,
      });

      const earnedBadges = getEarnedBadges(badgeProgress);
      const earnedIds = earnedBadges.map(b => b.badge.id);
      expect(earnedIds).toContain('1week');
      expect(earnedIds).toContain('streak7');
    });
  });
});
