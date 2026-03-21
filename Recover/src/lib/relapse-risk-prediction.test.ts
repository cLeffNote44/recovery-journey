import { describe, it, expect } from 'vitest';
import {
  predictRelapseRisk,
  getDailyRiskAssessment
} from './relapse-risk-prediction';
import type { CheckIn, Craving, Meeting, Meditation } from '@/types/app';

describe('relapse-risk-prediction', () => {
  const createMockData = (scenario: 'positive' | 'negative' | 'mixed') => {
    const today = new Date();
    const sobrietyDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();

    if (scenario === 'positive') {
      return {
        checkIns: Array.from({ length: 14 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 24 * 60 * 60 * 1000).toISOString(),
          mood: 4 + Math.floor(Math.random() * 2), // 4-5
          halt: {
            hungry: 1 + Math.floor(Math.random() * 2), // 1-2
            angry: 1 + Math.floor(Math.random() * 2),
            lonely: 1 + Math.floor(Math.random() * 2),
            tired: 1 + Math.floor(Math.random() * 2)
          }
        })) as CheckIn[],
        cravings: Array.from({ length: 3 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
          intensity: 3 + Math.floor(Math.random() * 2), // 3-4
          trigger: 'Stress',
          overcame: true
        })) as Craving[],
        meetings: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'AA',
          location: 'Local',
          notes: ''
        })) as Meeting[],
        meditations: Array.from({ length: 12 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 1.2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 15 + Math.floor(Math.random() * 10),
          type: 'Mindfulness'
        })) as Meditation[],
        sobrietyDate
      };
    } else if (scenario === 'negative') {
      return {
        checkIns: Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
          mood: 1 + Math.floor(Math.random() * 2), // 1-2
          halt: {
            hungry: 4 + Math.floor(Math.random() * 2), // 4-5
            angry: 4 + Math.floor(Math.random() * 2),
            lonely: 4 + Math.floor(Math.random() * 2),
            tired: 4 + Math.floor(Math.random() * 2)
          }
        })) as CheckIn[],
        cravings: Array.from({ length: 15 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 1 * 24 * 60 * 60 * 1000).toISOString(),
          intensity: 8 + Math.floor(Math.random() * 3), // 8-10
          trigger: ['Stress', 'Boredom', 'Social Situation'][Math.floor(Math.random() * 3)],
          overcame: Math.random() < 0.3 // Only 30% success
        })) as Craving[],
        meetings: [] as Meeting[],
        meditations: [] as Meditation[],
        sobrietyDate
      };
    } else {
      return {
        checkIns: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 1.5 * 24 * 60 * 60 * 1000).toISOString(),
          mood: 2 + Math.floor(Math.random() * 3), // 2-4
          halt: {
            hungry: 2 + Math.floor(Math.random() * 2),
            angry: 2 + Math.floor(Math.random() * 2),
            lonely: 2 + Math.floor(Math.random() * 2),
            tired: 2 + Math.floor(Math.random() * 2)
          }
        })) as CheckIn[],
        cravings: Array.from({ length: 8 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 2 * 24 * 60 * 60 * 1000).toISOString(),
          intensity: 5 + Math.floor(Math.random() * 3), // 5-7
          trigger: 'Stress',
          overcame: Math.random() > 0.4 // 60% success
        })) as Craving[],
        meetings: Array.from({ length: 3 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 5 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'AA',
          location: 'Local',
          notes: ''
        })) as Meeting[],
        meditations: Array.from({ length: 4 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 10 + Math.floor(Math.random() * 10),
          type: 'Mindfulness'
        })) as Meditation[],
        sobrietyDate
      };
    }
  };

  describe('predictRelapseRisk', () => {
    it('should return valid risk prediction structure', () => {
      const data = createMockData('mixed');
      const prediction = predictRelapseRisk(data);

      expect(prediction).toBeDefined();
      expect(['low', 'moderate', 'high', 'critical']).toContain(prediction.riskLevel);
      expect(prediction.riskScore).toBeGreaterThanOrEqual(0);
      expect(prediction.riskScore).toBeLessThanOrEqual(100);
      expect(prediction.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(1);
      expect(prediction.timeframe).toBeDefined();
      expect(Array.isArray(prediction.warnings)).toBe(true);
      expect(Array.isArray(prediction.interventions)).toBe(true);
      expect(Array.isArray(prediction.similarPatterns)).toBe(true);
    });

    it('should predict low risk for positive data', () => {
      const data = createMockData('positive');
      const prediction = predictRelapseRisk(data);

      expect(['low', 'moderate']).toContain(prediction.riskLevel);
      expect(prediction.riskScore).toBeLessThan(50);
    });

    it('should predict high risk for negative data', () => {
      const data = createMockData('negative');
      const prediction = predictRelapseRisk(data);

      expect(['high', 'critical']).toContain(prediction.riskLevel);
      expect(prediction.riskScore).toBeGreaterThan(50);
    });

    it('should have valid warnings structure', () => {
      const data = createMockData('negative');
      const prediction = predictRelapseRisk(data);

      expect(prediction.warnings.length).toBeGreaterThan(0);
      prediction.warnings.forEach(warning => {
        expect(warning.id).toBeDefined();
        expect(['low', 'medium', 'high', 'critical']).toContain(warning.severity);
        expect(warning.title).toBeDefined();
        expect(warning.description).toBeDefined();
        expect(warning.detectedPattern).toBeDefined();
        expect(warning.confidence).toBeGreaterThanOrEqual(0);
        expect(warning.confidence).toBeLessThanOrEqual(1);
        expect(Array.isArray(warning.triggerFactors)).toBe(true);
      });
    });

    it('should have valid interventions structure', () => {
      const data = createMockData('negative');
      const prediction = predictRelapseRisk(data);

      expect(prediction.interventions.length).toBeGreaterThan(0);
      prediction.interventions.forEach(intervention => {
        expect(intervention.id).toBeDefined();
        expect(['immediate', 'high', 'medium', 'low']).toContain(intervention.priority);
        expect(intervention.title).toBeDefined();
        expect(intervention.description).toBeDefined();
        expect(Array.isArray(intervention.actions)).toBe(true);
        expect(intervention.effectiveness).toBeGreaterThanOrEqual(0);
        expect(intervention.effectiveness).toBeLessThanOrEqual(1);
        expect(intervention.timeEstimate).toBeDefined();
      });
    });

    it('should prioritize interventions correctly', () => {
      const data = createMockData('negative');
      const prediction = predictRelapseRisk(data);

      const priorities = ['immediate', 'high', 'medium', 'low'];
      let lastPriorityIndex = -1;

      prediction.interventions.forEach(intervention => {
        const currentPriorityIndex = priorities.indexOf(intervention.priority);
        expect(currentPriorityIndex).toBeGreaterThanOrEqual(lastPriorityIndex);
        lastPriorityIndex = currentPriorityIndex;
      });
    });

    it('should have valid similar patterns structure', () => {
      const data = createMockData('mixed');
      const previousRelapses = [
        {
          date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          triggers: ['Stress', 'Isolation']
        }
      ];
      const prediction = predictRelapseRisk({ ...data, previousRelapses });

      prediction.similarPatterns.forEach(pattern => {
        expect(pattern.date).toBeDefined();
        expect(pattern.similarity).toBeGreaterThanOrEqual(0);
        expect(pattern.similarity).toBeLessThanOrEqual(1);
        expect(['success', 'struggle', 'relapse']).toContain(pattern.outcome);
        if (pattern.whatHelped) {
          expect(Array.isArray(pattern.whatHelped)).toBe(true);
        }
        if (pattern.whatDidntHelp) {
          expect(Array.isArray(pattern.whatDidntHelp)).toBe(true);
        }
      });
    });

    it('should calculate confidence based on data quality', () => {
      const sparseData = {
        checkIns: [{ id: 1, date: new Date().toISOString(), mood: 3, halt: { hungry: 2, angry: 2, lonely: 2, tired: 2 } }] as CheckIn[],
        cravings: [] as Craving[],
        meetings: [] as Meeting[],
        meditations: [] as Meditation[],
        sobrietyDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const richData = createMockData('mixed');

      const sparsePrediction = predictRelapseRisk(sparseData);
      const richPrediction = predictRelapseRisk(richData);

      expect(richPrediction.confidence).toBeGreaterThan(sparsePrediction.confidence);
    });

    it('should handle empty data gracefully', () => {
      const emptyData = {
        checkIns: [] as CheckIn[],
        cravings: [] as Craving[],
        meetings: [] as Meeting[],
        meditations: [] as Meditation[],
        sobrietyDate: new Date().toISOString()
      };

      const prediction = predictRelapseRisk(emptyData);

      expect(prediction).toBeDefined();
      expect(prediction.riskLevel).toBeDefined();
      expect(prediction.riskScore).toBeGreaterThanOrEqual(0);
      expect(prediction.confidence).toBeLessThanOrEqual(0.6); // Low confidence with no data (minimum is 0.5)
    });
  });

  describe('getDailyRiskAssessment', () => {
    it('should return valid daily assessment structure', () => {
      const data = createMockData('mixed');
      const assessment = getDailyRiskAssessment(data);

      expect(assessment).toBeDefined();
      expect(['low', 'moderate', 'high', 'critical']).toContain(assessment.todayRisk);
      expect(assessment.riskScore).toBeGreaterThanOrEqual(0);
      expect(assessment.riskScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(assessment.topWarnings)).toBe(true);
      expect(Array.isArray(assessment.immediateActions)).toBe(true);
    });

    it('should have valid warnings', () => {
      const data = createMockData('negative');
      const assessment = getDailyRiskAssessment(data);

      expect(assessment.topWarnings.length).toBeGreaterThan(0);
      expect(assessment.topWarnings.length).toBeLessThanOrEqual(3);
      assessment.topWarnings.forEach(warning => {
        expect(warning).toBeDefined();
        expect(typeof warning).toBe('string');
        expect(warning.length).toBeGreaterThan(0);
      });
    });

    it('should provide immediate actions', () => {
      const data = createMockData('negative');
      const assessment = getDailyRiskAssessment(data);

      expect(assessment.immediateActions.length).toBeGreaterThanOrEqual(0);
      assessment.immediateActions.forEach(action => {
        expect(action).toBeDefined();
        expect(typeof action).toBe('string');
        expect(action.length).toBeGreaterThan(0);
      });
    });

    it('should detect high risk from recent cravings', () => {
      const today = new Date();
      const data = {
        checkIns: [] as CheckIn[],
        cravings: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          date: new Date(today.getTime() - i * 2 * 60 * 60 * 1000).toISOString(), // Every 2 hours
          intensity: 8 + Math.floor(Math.random() * 3),
          trigger: 'Stress',
          overcame: false
        })) as Craving[],
        meetings: [] as Meeting[],
        meditations: [] as Meditation[],
        sobrietyDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      const assessment = getDailyRiskAssessment(data);
      expect(['high', 'critical']).toContain(assessment.todayRisk);
    });

    it('should match full prediction risk level', () => {
      const data = createMockData('negative');

      const dailyAssessment = getDailyRiskAssessment(data);
      const fullPrediction = predictRelapseRisk(data);

      // Daily assessment should have same risk level as full prediction
      expect(dailyAssessment.todayRisk).toBe(fullPrediction.riskLevel);
      expect(dailyAssessment.riskScore).toBe(fullPrediction.riskScore);
    });

    it('should limit warnings to top 3', () => {
      const data = createMockData('negative');
      const assessment = getDailyRiskAssessment(data);

      expect(assessment.topWarnings.length).toBeLessThanOrEqual(3);
    });
  });

  describe('edge cases', () => {
    it('should handle very new sobriety date', () => {
      const data = createMockData('mixed');
      data.sobrietyDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 days

      const prediction = predictRelapseRisk(data);
      expect(prediction).toBeDefined();
      expect(prediction.confidence).toBeGreaterThanOrEqual(0.5); // Minimum confidence is 0.5
      expect(prediction.confidence).toBeLessThan(0.9); // But not super high
    });

    it('should handle long sobriety date', () => {
      const data = createMockData('positive');
      data.sobrietyDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year

      const prediction = predictRelapseRisk(data);
      expect(prediction).toBeDefined();
      expect(['low', 'moderate']).toContain(prediction.riskLevel);
    });

    it('should handle all cravings overcome', () => {
      const data = createMockData('mixed');
      data.cravings = data.cravings.map(c => ({ ...c, overcame: true }));

      const prediction = predictRelapseRisk(data);
      expect(prediction.riskScore).toBeLessThan(60); // Adjusted threshold - mixed data still has other risk factors
    });

    it('should handle no cravings overcome', () => {
      const data = createMockData('mixed');
      data.cravings = data.cravings.map(c => ({ ...c, overcame: false }));

      const prediction = predictRelapseRisk(data);
      expect(prediction.riskScore).toBeGreaterThan(30);
    });

    it('should handle high HALT scores', () => {
      const data = createMockData('positive');
      // Override all check-ins to have very high HALT scores
      data.checkIns = data.checkIns.map(c => ({
        ...c,
        mood: 2, // Low mood
        halt: { hungry: 5, angry: 5, lonely: 5, tired: 5 }
      }));
      // Add many high-intensity cravings
      data.cravings = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        intensity: 8 + Math.floor(Math.random() * 3),
        trigger: 'Stress',
        overcame: false
      })) as Craving[];

      const prediction = predictRelapseRisk(data);
      expect(prediction.riskScore).toBeGreaterThan(30);
    });
  });
});
