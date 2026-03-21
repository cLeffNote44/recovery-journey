/**
 * Badge System Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateBadgeProgress,
  getEarnedBadges,
  getInProgressBadges,
  getLockedBadges,
  getSecretBadges,
  getRecentlyEarnedBadges,
  getUnlockedBadges,
  getBadgeTierColor,
  getBadgeCategoryColor,
} from './badges';

describe('Badge System', () => {
  describe('getUnlockedBadges', () => {
    it('should unlock first week badge with 7 days sober', () => {
      const badges = getUnlockedBadges({ daysSober: 7 });
      const firstWeek = badges.find(b => b.id === '1week');
      expect(firstWeek).toBeDefined();
    });

    it('should unlock check-in badges', () => {
      const badges = getUnlockedBadges({ daysSober: 7, checkInsCount: 50 });
      const checkInBadge = badges.find(b => b.type === 'checkins' && b.requirement === 50);
      expect(checkInBadge).toBeDefined();
    });

    it('should unlock craving badges', () => {
      const badges = getUnlockedBadges({ daysSober: 1, cravingsOvercome: 1 });
      const cravingBadge = badges.find(b => b.id === 'craving1');
      expect(cravingBadge).toBeDefined();
    });

    it('should unlock meeting badges', () => {
      const badges = getUnlockedBadges({ daysSober: 1, meetingsAttended: 10 });
      const meetingBadge = badges.find(b => b.type === 'meetings' && b.requirement === 10);
      expect(meetingBadge).toBeDefined();
    });

    it('should unlock meditation badges', () => {
      const badges = getUnlockedBadges({ daysSober: 1, meditationMinutes: 25 });
      const meditationBadge = badges.find(b => b.type === 'meditations' && b.requirement === 25);
      expect(meditationBadge).toBeDefined();
    });

    it('should not unlock badges when requirements not met', () => {
      const badges = getUnlockedBadges({ daysSober: 5 });
      const firstWeek = badges.find(b => b.id === '1week');
      expect(firstWeek).toBeUndefined();
    });

    it('should unlock multiple badges when requirements met', () => {
      const badges = getUnlockedBadges({
        daysSober: 30,
        checkInsCount: 30,
        cravingsOvercome: 10,
        meetingsAttended: 20,
      });
      expect(badges.length).toBeGreaterThan(1);
    });
  });

  describe('calculateBadgeProgress', () => {
    it('should calculate correct progress for partial completion', () => {
      const mockDate = new Date();
      mockDate.setDate(mockDate.getDate() - 3);
      const sobrietyDate = mockDate.toISOString().split('T')[0];

      const progress = calculateBadgeProgress({
        sobrietyDate,
        checkIns: [],
        meditations: [],
        meetings: [],
        cravings: [],
        gratitude: [],
        growthLogs: [],
        challenges: [],
        unlockedBadges: [],
      });

      const firstWeek = progress.find(p => p.badge.id === '1week');
      expect(firstWeek).toBeDefined();
      expect(firstWeek?.progress).toBeLessThan(100);
      expect(firstWeek?.isUnlocked).toBe(false);
    });

    it('should mark badge as unlocked when requirement met', () => {
      const mockDate = new Date();
      mockDate.setDate(mockDate.getDate() - 7);
      const sobrietyDate = mockDate.toISOString().split('T')[0];

      const progress = calculateBadgeProgress({
        sobrietyDate,
        checkIns: [],
        meditations: [],
        meetings: [],
        cravings: [],
        gratitude: [],
        growthLogs: [],
        challenges: [],
        unlockedBadges: [],
      });

      const firstWeek = progress.find(p => p.badge.id === '1week');
      expect(firstWeek?.isUnlocked).toBe(true);
      expect(firstWeek?.progress).toBe(100);
    });
  });

  describe('Badge Filter Functions', () => {
    const mockProgress = [
      {
        badge: { id: 'earned1', name: 'Earned 1', requirement: 5, secret: false },
        isUnlocked: true,
        progress: 100,
        progressText: '5/5',
        earnedDate: '2025-01-01T00:00:00.000Z',
      },
      {
        badge: { id: 'inprogress1', name: 'In Progress', requirement: 10, secret: false },
        isUnlocked: false,
        progress: 50,
        progressText: '5/10',
      },
      {
        badge: { id: 'locked1', name: 'Locked', requirement: 100, secret: false },
        isUnlocked: false,
        progress: 0,
        progressText: '0/100',
      },
      {
        badge: { id: 'secret1', name: 'Secret', requirement: 1, secret: true },
        isUnlocked: true,
        progress: 100,
        progressText: '1/1',
        earnedDate: '2025-01-02T00:00:00.000Z',
      },
    ];

    it('should filter earned badges', () => {
      const earned = getEarnedBadges(mockProgress as any);
      expect(earned).toHaveLength(2);
      expect(earned.every(b => b.isUnlocked)).toBe(true);
    });

    it('should filter in-progress badges', () => {
      const inProgress = getInProgressBadges(mockProgress as any);
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].badge.id).toBe('inprogress1');
    });

    it('should filter locked badges', () => {
      const locked = getLockedBadges(mockProgress as any);
      expect(locked).toHaveLength(1);
      expect(locked[0].badge.id).toBe('locked1');
    });

    it('should filter secret badges', () => {
      const secret = getSecretBadges(mockProgress as any);
      expect(secret).toHaveLength(1);
      expect(secret[0].badge.id).toBe('secret1');
    });

    it('should get recently earned badges', () => {
      const recent = getRecentlyEarnedBadges(mockProgress as any, 5);
      expect(recent).toHaveLength(2);
      // Should be sorted by date, most recent first
      expect(recent[0].badge.id).toBe('secret1');
      expect(recent[1].badge.id).toBe('earned1');
    });
  });

  describe('Badge Display Functions', () => {
    it('should return correct tier colors', () => {
      expect(getBadgeTierColor('bronze')).toContain('orange');
      expect(getBadgeTierColor('silver')).toContain('gray');
      expect(getBadgeTierColor('gold')).toContain('yellow');
      expect(getBadgeTierColor('platinum')).toContain('cyan');
      expect(getBadgeTierColor('diamond')).toContain('purple');
      expect(getBadgeTierColor(undefined)).toContain('muted');
    });

    it('should return correct category colors', () => {
      expect(getBadgeCategoryColor('recovery')).toContain('green');
      expect(getBadgeCategoryColor('engagement')).toContain('blue');
      expect(getBadgeCategoryColor('wellness')).toContain('purple');
      expect(getBadgeCategoryColor('growth')).toContain('pink');
      expect(getBadgeCategoryColor('crisis')).toContain('orange');
      expect(getBadgeCategoryColor('special')).toContain('yellow');
      expect(getBadgeCategoryColor(undefined)).toContain('muted');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values correctly', () => {
      const badges = getUnlockedBadges({ daysSober: 0 });
      // 0 days sober should not unlock any badges
      const weekBadge = badges.find(b => b.id === '1week');
      expect(weekBadge).toBeUndefined();
    });

    it('should handle negative values gracefully', () => {
      const badges = getUnlockedBadges({ daysSober: -1 });
      // Negative days should not unlock badges
      const weekBadge = badges.find(b => b.id === '1week');
      expect(weekBadge).toBeUndefined();
    });

    it('should handle very large values', () => {
      const badges = getUnlockedBadges({ daysSober: 10000 });
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should handle empty badge progress array', () => {
      const earned = getEarnedBadges([]);
      expect(earned).toEqual([]);

      const inProgress = getInProgressBadges([]);
      expect(inProgress).toEqual([]);

      const locked = getLockedBadges([]);
      expect(locked).toEqual([]);
    });
  });
});
