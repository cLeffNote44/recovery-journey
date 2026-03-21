import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDaysSober,
  calculateStreak,
  getMilestone,
  calculateTotalSavings,
  getMoodTrend
} from './utils-app';
import { getUnlockedBadges } from './badges';
import type { CheckIn, Badge } from '@/types/app';

describe('utils-app', () => {
  describe('calculateDaysSober', () => {
    it('should calculate days sober correctly', () => {
      const sobrietyDate = new Date();
      sobrietyDate.setDate(sobrietyDate.getDate() - 30);
      const days = calculateDaysSober(sobrietyDate.toISOString());
      // Account for rounding/time zones - should be approximately 30 days
      expect(days).toBeGreaterThanOrEqual(29);
      expect(days).toBeLessThanOrEqual(31);
    });

    it('should return 0 for today', () => {
      const today = new Date().toISOString();
      const days = calculateDaysSober(today);
      expect(days).toBe(0);
    });

    it('should return 1 for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const days = calculateDaysSober(yesterday.toISOString());
      expect(days).toBe(1);
    });
  });

  describe('calculateStreak', () => {
    it('should return 0 for empty check-ins', () => {
      const streak = calculateStreak([]);
      expect(streak).toBe(0);
    });

    it('should calculate consecutive days correctly', () => {
      const today = new Date();
      const checkIns: CheckIn[] = [
        { id: 1, date: today.toISOString(), mood: 4, notes: '' },
        {
          id: 2,
          date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(),
          mood: 5,
          notes: ''
        },
        {
          id: 3,
          date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          mood: 3,
          notes: ''
        }
      ];
      const streak = calculateStreak(checkIns);
      expect(streak).toBe(3);
    });

    it('should stop at first gap', () => {
      const today = new Date();
      const checkIns: CheckIn[] = [
        { id: 1, date: today.toISOString(), mood: 4, notes: '' },
        // Missing yesterday
        {
          id: 2,
          date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          mood: 5,
          notes: ''
        }
      ];
      const streak = calculateStreak(checkIns);
      expect(streak).toBe(1);
    });
  });

  describe('getMilestone', () => {
    it('should return first day milestone', () => {
      const milestone = getMilestone(1);
      expect(milestone).toBeDefined();
      expect(milestone.text).toBe('Starting Strong');
      expect(milestone.color).toBeDefined();
    });

    it('should return 7 day milestone', () => {
      const milestone = getMilestone(7);
      expect(milestone).toBeDefined();
      expect(milestone.text).toBe('1 Week');
      expect(milestone.color).toBeDefined();
    });

    it('should return 30 day milestone', () => {
      const milestone = getMilestone(30);
      expect(milestone).toBeDefined();
      expect(milestone.text).toBe('30 Days');
      expect(milestone.color).toBeDefined();
    });

    it('should return 365 day milestone', () => {
      const milestone = getMilestone(365);
      expect(milestone).toBeDefined();
      expect(milestone.text).toBe('1 Year');
      expect(milestone.color).toBeDefined();
    });

    it('should return general milestone for other days', () => {
      const milestone = getMilestone(42);
      expect(milestone).toBeDefined();
      // 42 days should return '30 Days' since that's the closest defined milestone
      expect(milestone.text).toBe('30 Days');
    });
  });

  describe('calculateTotalSavings', () => {
    it('should calculate savings correctly', () => {
      const savings = calculateTotalSavings(30, 10);
      expect(savings).toBe(300);
    });

    it('should return 0 for zero days', () => {
      const savings = calculateTotalSavings(0, 10);
      expect(savings).toBe(0);
    });

    it('should return 0 for zero cost', () => {
      const savings = calculateTotalSavings(30, 0);
      expect(savings).toBe(0);
    });
  });

  describe('getMoodTrend', () => {
    it('should return improving for increasing moods', () => {
      const checkIns: CheckIn[] = [
        { id: 1, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), mood: 2, notes: '' },
        { id: 2, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), mood: 3, notes: '' },
        { id: 3, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), mood: 4, notes: '' },
        { id: 4, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), mood: 4, notes: '' },
        { id: 5, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), mood: 5, notes: '' }
      ];
      const trend = getMoodTrend(checkIns);
      expect(trend).toBe('improving');
    });

    it('should return declining for decreasing moods', () => {
      const checkIns: CheckIn[] = [
        { id: 1, date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), mood: 5, notes: '' },
        { id: 2, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), mood: 4, notes: '' },
        { id: 3, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), mood: 3, notes: '' },
        { id: 4, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), mood: 2, notes: '' },
        { id: 5, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), mood: 2, notes: '' }
      ];
      const trend = getMoodTrend(checkIns);
      expect(trend).toBe('declining');
    });

    it('should return stable for consistent moods', () => {
      const checkIns: CheckIn[] = [
        { id: 1, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), mood: 3, notes: '' },
        { id: 2, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), mood: 3, notes: '' },
        { id: 3, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), mood: 3, notes: '' },
        { id: 4, date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), mood: 3, notes: '' }
      ];
      const trend = getMoodTrend(checkIns);
      expect(trend).toBe('stable');
    });

    it('should return stable for empty check-ins', () => {
      const trend = getMoodTrend([]);
      expect(trend).toBe('stable');
    });
  });

  describe('getUnlockedBadges', () => {
    it('should unlock 24h badge after 1 day', () => {
      const badges = getUnlockedBadges({
        daysSober: 1,
        checkInsCount: 1,
        cravingsOvercome: 0,
        meetingsAttended: 0,
        meditationMinutes: 0,
        gratitudeCount: 0,
        growthLogsCount: 0,
        challengesCompleted: 0,
        streak: 1
      });
      expect(badges.some(b => b.id === '24h')).toBe(true);
    });

    it('should unlock week badge after 7 days', () => {
      const badges = getUnlockedBadges({
        daysSober: 7,
        checkInsCount: 7,
        cravingsOvercome: 0,
        meetingsAttended: 0,
        meditationMinutes: 0,
        gratitudeCount: 0,
        growthLogsCount: 0,
        challengesCompleted: 0,
        streak: 7
      });
      expect(badges.some(b => b.id === '1week')).toBe(true);
    });

    it('should unlock 30 day badge after 30 days', () => {
      const badges = getUnlockedBadges({
        daysSober: 30,
        checkInsCount: 30,
        cravingsOvercome: 0,
        meetingsAttended: 0,
        meditationMinutes: 0,
        gratitudeCount: 0,
        growthLogsCount: 0,
        challengesCompleted: 0,
        streak: 30
      });
      expect(badges.some(b => b.id === '30days')).toBe(true);
    });

    it('should unlock check-in badge after 50 check-ins', () => {
      const badges = getUnlockedBadges({
        daysSober: 50,
        checkInsCount: 50,
        cravingsOvercome: 0,
        meetingsAttended: 0,
        meditationMinutes: 0,
        gratitudeCount: 0,
        growthLogsCount: 0,
        challengesCompleted: 0,
        streak: 50
      });
      expect(badges.some(b => b.id === 'checkin50')).toBe(true);
    });

    it('should unlock urge defender badge after overcoming 10 cravings', () => {
      const badges = getUnlockedBadges({
        daysSober: 10,
        checkInsCount: 10,
        cravingsOvercome: 10,
        meetingsAttended: 0,
        meditationMinutes: 0,
        gratitudeCount: 0,
        growthLogsCount: 0,
        challengesCompleted: 0,
        streak: 10
      });
      expect(badges.some(b => b.id === 'craving10')).toBe(true);
    });
  });
});
