import { describe, it, expect } from 'vitest';
import {
  calculateRelapseRisk,
  detectPatterns,
  analyzeCorrelations,
  generatePredictions,
  generateAdvancedReport
} from './advanced-analytics';
import type { CheckIn, Craving, Meeting, Meditation, GrowthLog } from '@/types/app';

describe('advanced-analytics', () => {
  const createMockData = () => {
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

    const cravings: Craving[] = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      date: new Date(today.getTime() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
      intensity: Math.floor(Math.random() * 5) + 5,
      trigger: ['Stress', 'Boredom', 'Social Situation'][Math.floor(Math.random() * 3)],
      overcame: Math.random() > 0.3
    }));

    const meetings: Meeting[] = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      date: new Date(today.getTime() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'AA',
      location: 'Local',
      notes: ''
    }));

    const meditations: Meditation[] = Array.from({ length: 12 }, (_, i) => ({
      id: i + 1,
      date: new Date(today.getTime() - i * 2.5 * 24 * 60 * 60 * 1000).toISOString(),
      duration: 15 + Math.floor(Math.random() * 20),
      type: 'Mindfulness'
    }));

    const growthLogs: GrowthLog[] = Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      date: new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000).toISOString(),
      title: `Growth ${i + 1}`,
      description: 'Test growth'
    }));

    return { checkIns, cravings, meetings, meditations, growthLogs, sobrietyDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString() };
  };

  describe('calculateRelapseRisk', () => {
    it('should calculate risk score', () => {
      const data = createMockData();
      const riskScore = calculateRelapseRisk(data);

      expect(riskScore).toBeDefined();
      expect(riskScore.score).toBeGreaterThanOrEqual(0);
      expect(riskScore.score).toBeLessThanOrEqual(100);
      expect(['low', 'moderate', 'high', 'critical']).toContain(riskScore.level);
      expect(Array.isArray(riskScore.factors)).toBe(true);
      expect(Array.isArray(riskScore.recommendations)).toBe(true);
      expect(['improving', 'stable', 'worsening']).toContain(riskScore.trend);
    });

    it('should have valid risk factors', () => {
      const data = createMockData();
      const riskScore = calculateRelapseRisk(data);

      expect(riskScore.factors.length).toBeGreaterThan(0);
      riskScore.factors.forEach(factor => {
        expect(factor.name).toBeDefined();
        expect(factor.factor).toBeDefined();
        expect(factor.weight).toBeGreaterThanOrEqual(0);
        expect(factor.weight).toBeLessThanOrEqual(1);
        expect(factor.score).toBeGreaterThanOrEqual(0);
        expect(['low', 'moderate', 'high', 'critical']).toContain(factor.level);
        expect(factor.description).toBeDefined();
        expect(Array.isArray(factor.mitigationActions)).toBe(true);
      });
    });

    it('should calculate low risk for positive data', () => {
      const today = new Date();
      const data = {
        checkIns: Array.from({ length: 30 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
          mood: 5,
          halt: { hungry: 2, angry: 1, lonely: 2, tired: 2 }
        })),
        cravings: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
          intensity: 3,
          trigger: 'Stress',
          overcame: true
        })),
        meetings: Array.from({ length: 20 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'AA',
          location: 'Local',
          notes: ''
        })),
        meditations: Array.from({ length: 25 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 1.2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 20,
          type: 'Mindfulness'
        })),
        growthLogs: [] as GrowthLog[],
        sobrietyDate: new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      };

      const riskScore = calculateRelapseRisk(data);
      expect(['low', 'moderate']).toContain(riskScore.level);
    });
  });

  describe('detectPatterns', () => {
    it('should detect patterns in data', () => {
      const data = createMockData();
      const patterns = detectPatterns({
        checkIns: data.checkIns,
        cravings: data.cravings,
        meetings: data.meetings
      });

      expect(patterns).toBeDefined();
      expect(Array.isArray(patterns.patterns)).toBe(true);
      expect(patterns.confidence).toBeGreaterThanOrEqual(0);
      expect(patterns.confidence).toBeLessThanOrEqual(1);
      expect(patterns.timeframe).toBeDefined();
    });

    it('should identify pattern types', () => {
      const data = createMockData();
      const patterns = detectPatterns({
        checkIns: data.checkIns,
        cravings: data.cravings,
        meetings: data.meetings
      });

      patterns.patterns.forEach(pattern => {
        expect(['craving', 'mood', 'activity', 'behavior', 'time', 'day', 'correlation']).toContain(pattern.type);
        expect(pattern.pattern).toBeDefined();
        expect(pattern.frequency).toBeGreaterThanOrEqual(0);
        expect(['positive', 'negative', 'neutral']).toContain(pattern.impact);
        expect(pattern.description).toBeDefined();
        expect(pattern.correlation).toBeGreaterThanOrEqual(-1);
        expect(pattern.correlation).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('analyzeCorrelations', () => {
    it('should analyze correlations between metrics', () => {
      const data = createMockData();
      const correlations = analyzeCorrelations({
        checkIns: data.checkIns,
        cravings: data.cravings,
        meetings: data.meetings,
        meditations: data.meditations
      });

      expect(correlations).toBeDefined();
      expect(Array.isArray(correlations.correlations)).toBe(true);
      expect(Array.isArray(correlations.strongCorrelations)).toBe(true);
      expect(Array.isArray(correlations.insights)).toBe(true);
    });

    it('should have valid correlation objects', () => {
      const data = createMockData();
      const correlations = analyzeCorrelations({
        checkIns: data.checkIns,
        cravings: data.cravings,
        meetings: data.meetings,
        meditations: data.meditations
      });

      correlations.correlations.forEach(corr => {
        expect(corr.variable1).toBeDefined();
        expect(corr.variable2).toBeDefined();
        expect(corr.coefficient).toBeGreaterThanOrEqual(-1);
        expect(corr.coefficient).toBeLessThanOrEqual(1);
        expect(['weak', 'moderate', 'strong']).toContain(corr.strength);
        expect(['positive', 'negative', 'none']).toContain(corr.direction);
        expect(corr.significance).toBeGreaterThanOrEqual(0);
        expect(corr.significance).toBeLessThanOrEqual(1);
        expect(corr.pValue).toBeDefined();
        expect(corr.interpretation).toBeDefined();
      });
    });

    it('should identify strong correlations', () => {
      const data = createMockData();
      const correlations = analyzeCorrelations({
        checkIns: data.checkIns,
        cravings: data.cravings,
        meetings: data.meetings,
        meditations: data.meditations
      });

      // Strong correlations should only contain moderate or strong strength
      // (sometimes there are no strong correlations with random data)
      correlations.strongCorrelations.forEach(corr => {
        expect(['moderate', 'strong']).toContain(corr.strength);
      });
    });
  });

  describe('generatePredictions', () => {
    it('should generate predictions', () => {
      const data = createMockData();
      const predictions = generatePredictions({
        checkIns: data.checkIns,
        cravings: data.cravings,
        sobrietyDate: data.sobrietyDate
      });

      expect(predictions).toBeDefined();
      expect(Array.isArray(predictions.predictions)).toBe(true);
      expect(predictions.accuracy).toBeGreaterThanOrEqual(0);
      expect(predictions.accuracy).toBeLessThanOrEqual(1);
      expect(predictions.confidence).toBeGreaterThanOrEqual(0);
      expect(predictions.confidence).toBeLessThanOrEqual(1);
      expect(predictions.methodology).toBeDefined();
    });

    it('should have valid prediction objects', () => {
      const data = createMockData();
      const predictions = generatePredictions({
        checkIns: data.checkIns,
        cravings: data.cravings,
        sobrietyDate: data.sobrietyDate
      });

      predictions.predictions.forEach(pred => {
        expect(pred.metric).toBeDefined();
        expect(typeof pred.currentValue).toBe('number');
        expect(typeof pred.predictedValue).toBe('number');
        expect(pred.timeframe).toBeDefined();
        expect(pred.confidence).toBeGreaterThanOrEqual(0);
        expect(pred.confidence).toBeLessThanOrEqual(1);
        expect(['improving', 'declining', 'stable']).toContain(pred.trend);
        expect(pred.confidenceInterval).toBeDefined();
        expect(pred.confidenceInterval.low).toBeLessThanOrEqual(pred.confidenceInterval.high);
        expect(Array.isArray(pred.factors)).toBe(true);
      });
    });
  });

  describe('generateAdvancedReport', () => {
    it('should generate comprehensive report', () => {
      const data = createMockData();
      const report = generateAdvancedReport(data);

      expect(report).toBeDefined();
      expect(report.riskScore).toBeDefined();
      expect(report.patterns).toBeDefined();
      expect(report.correlations).toBeDefined();
      expect(report.predictions).toBeDefined();
      expect(report.summary).toBeDefined();
      expect(report.generatedAt).toBeDefined();
    });

    it('should have valid summary data', () => {
      const data = createMockData();
      const report = generateAdvancedReport(data);

      expect(report.summary.totalDays).toBeGreaterThanOrEqual(0);
      expect(report.summary.avgMood).toBeGreaterThanOrEqual(0);
      expect(report.summary.avgMood).toBeLessThanOrEqual(5);
      expect(report.summary.checkInRate).toBeGreaterThanOrEqual(0);
      expect(report.summary.cravingSuccessRate).toBeGreaterThanOrEqual(0);
      expect(report.summary.cravingSuccessRate).toBeLessThanOrEqual(1);
      expect(report.summary.engagementScore).toBeGreaterThanOrEqual(0);
      expect(report.summary.engagementScore).toBeLessThanOrEqual(100);
      expect(['positive', 'neutral', 'negative']).toContain(report.summary.overallTrend);
      expect(Array.isArray(report.summary.keyInsights)).toBe(true);
    });

    it('should handle empty data gracefully', () => {
      const emptyData = {
        checkIns: [],
        cravings: [],
        meetings: [],
        meditations: [],
        growthLogs: [],
        sobrietyDate: new Date().toISOString()
      };

      const report = generateAdvancedReport(emptyData);
      expect(report).toBeDefined();
      expect(report.riskScore).toBeDefined();
      expect(report.patterns).toBeDefined();
      expect(report.correlations).toBeDefined();
      expect(report.predictions).toBeDefined();
      expect(report.summary).toBeDefined();
    });
  });
});
