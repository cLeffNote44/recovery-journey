import { describe, it, expect } from 'vitest';
import {
  generateInsights,
  analyzeCravingPatterns,
  analyzeMoodTrend,
  calculateSuccessMetrics,
  generateAnalyticsReport
} from './analytics-engine';
import { calculateDaysSober } from './utils-app';
import type { CheckIn, Craving, Meeting, Meditation, GrowthLog } from '@/types/app';

describe('analytics-engine', () => {
  describe('generateInsights', () => {
    it('should generate insights for empty data', () => {
      const cravingPatterns = analyzeCravingPatterns([]);
      const moodTrend = analyzeMoodTrend([]);
      const successMetrics = calculateSuccessMetrics([], [], [], []);
      const daysSober = 0;

      const insights = generateInsights(cravingPatterns, moodTrend, successMetrics, daysSober);

      expect(insights).toBeDefined();
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should generate insights with check-in data', () => {
      const today = new Date();
      const checkIns: CheckIn[] = [
        { id: 1, date: today.toISOString(), mood: 5 },
        { id: 2, date: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(), mood: 4 },
        { id: 3, date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), mood: 3 }
      ];

      const cravingPatterns = analyzeCravingPatterns([]);
      const moodTrend = analyzeMoodTrend(checkIns);
      const successMetrics = calculateSuccessMetrics([], checkIns, [], []);
      const daysSober = 7;

      const insights = generateInsights(cravingPatterns, moodTrend, successMetrics, daysSober);

      expect(insights).toBeDefined();
      expect(insights.length).toBeGreaterThan(0);
    });

    it('should use generateAnalyticsReport for comprehensive testing', () => {
      const today = new Date();
      const checkIns: CheckIn[] = Array.from({ length: 30 }, (_, i) => ({
        id: i + 1,
        date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
        mood: Math.floor(Math.random() * 3) + 3,
        halt: {
          hungry: Math.floor(Math.random() * 5) + 1,
          angry: Math.floor(Math.random() * 5) + 1,
          lonely: Math.floor(Math.random() * 5) + 1,
          tired: Math.floor(Math.random() * 5) + 1
        }
      }));

      const cravings: Craving[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        date: new Date(today.getTime() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
        intensity: Math.floor(Math.random() * 5) + 5,
        trigger: ['Stress', 'Boredom', 'Social Situation'][Math.floor(Math.random() * 3)],
        overcame: Math.random() > 0.3
      }));

      const sobrietyDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      const daysSober = calculateDaysSober(sobrietyDate);

      const report = generateAnalyticsReport(cravings, checkIns, [], [], daysSober);

      expect(report).toBeDefined();
      expect(report.cravingPatterns).toBeDefined();
      expect(report.moodTrend).toBeDefined();
      expect(report.successMetrics).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(Array.isArray(report.insights)).toBe(true);
    });
  });
});
