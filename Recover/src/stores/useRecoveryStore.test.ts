/**
 * useRecoveryStore Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useRecoveryStore } from './useRecoveryStore';
import type { Relapse, ReasonForSobriety } from '@/types/app';

describe('useRecoveryStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useRecoveryStore.getState();
    store.setSobrietyDate(new Date().toISOString().split('T')[0]);
    store.setRelapses([]);
    store.setCleanPeriods([]);
    store.setReasonsForSobriety([]);
    store.setUnlockedBadges([]);
    store.setCostPerDay(0);
    store.setSavingsGoal('');
    store.setSavingsGoalAmount(0);
    store.setStepWork(null);
  });

  it('should have initial state', () => {
    const state = useRecoveryStore.getState();

    expect(state.sobrietyDate).toBeTruthy();
    expect(state.relapses).toEqual([]);
    expect(state.cleanPeriods).toEqual([]);
    expect(state.reasonsForSobriety).toEqual([]);
    expect(state.unlockedBadges).toEqual([]);
    expect(state.costPerDay).toBe(0);
  });

  it('should set sobriety date', () => {
    const store = useRecoveryStore.getState();
    const newDate = '2024-06-01';

    store.setSobrietyDate(newDate);

    expect(useRecoveryStore.getState().sobrietyDate).toBe(newDate);
  });

  it('should add relapse', () => {
    const store = useRecoveryStore.getState();
    const relapse: Relapse = {
      id: 1,
      date: new Date().toISOString(),
      triggers: ['stress'],
      emotions: ['anxious'],
      context: 'Test relapse',
      supportUsed: ['sponsor'],
      lessonsLearned: 'Learned to manage stress better',
      actionPlan: 'Call sponsor earlier',
    };

    store.addRelapse(relapse);

    const state = useRecoveryStore.getState();
    expect(state.relapses).toHaveLength(1);
    expect(state.relapses[0]).toEqual(relapse);
  });

  it('should add multiple relapses', () => {
    const store = useRecoveryStore.getState();
    const relapse1: Relapse = {
      id: 1,
      date: new Date().toISOString(),
      triggers: ['stress'],
      emotions: ['anxious'],
      context: 'First relapse',
      supportUsed: ['sponsor'],
      lessonsLearned: 'Lesson 1',
      actionPlan: 'Plan 1',
    };
    const relapse2: Relapse = {
      id: 2,
      date: new Date().toISOString(),
      triggers: ['social'],
      emotions: ['lonely'],
      context: 'Second relapse',
      supportUsed: ['meeting'],
      lessonsLearned: 'Lesson 2',
      actionPlan: 'Plan 2',
    };

    store.addRelapse(relapse1);
    store.addRelapse(relapse2);

    const state = useRecoveryStore.getState();
    expect(state.relapses).toHaveLength(2);
    expect(state.relapses[0]).toEqual(relapse1);
    expect(state.relapses[1]).toEqual(relapse2);
  });

  it('should set all relapses', () => {
    const store = useRecoveryStore.getState();
    const relapses: Relapse[] = [
      {
        id: 1,
        date: '2024-01-01',
        triggers: ['stress'],
        emotions: ['anxious'],
        context: 'First',
        supportUsed: ['sponsor'],
        lessonsLearned: 'Lesson',
        actionPlan: 'Plan',
      },
      {
        id: 2,
        date: '2024-02-01',
        triggers: ['social'],
        emotions: ['lonely'],
        context: 'Second',
        supportUsed: ['meeting'],
        lessonsLearned: 'Lesson',
        actionPlan: 'Plan',
      },
    ];

    store.setRelapses(relapses);

    expect(useRecoveryStore.getState().relapses).toEqual(relapses);
  });

  it('should update relapse', () => {
    const store = useRecoveryStore.getState();
    const relapse: Relapse = {
      id: 1,
      date: '2024-01-01',
      triggers: ['stress'],
      emotions: ['anxious'],
      context: 'Original',
      supportUsed: ['sponsor'],
      lessonsLearned: 'Original lesson',
      actionPlan: 'Original plan',
    };

    store.addRelapse(relapse);
    store.updateRelapse(1, { context: 'Updated', lessonsLearned: 'Updated lesson' });

    const state = useRecoveryStore.getState();
    expect(state.relapses[0].context).toBe('Updated');
    expect(state.relapses[0].lessonsLearned).toBe('Updated lesson');
  });

  it('should delete relapse', () => {
    const store = useRecoveryStore.getState();
    const relapse: Relapse = {
      id: 1,
      date: '2024-01-01',
      triggers: ['stress'],
      emotions: ['anxious'],
      context: 'Test',
      supportUsed: ['sponsor'],
      lessonsLearned: 'Lesson',
      actionPlan: 'Plan',
    };

    store.addRelapse(relapse);
    expect(useRecoveryStore.getState().relapses).toHaveLength(1);

    store.deleteRelapse(1);
    expect(useRecoveryStore.getState().relapses).toHaveLength(0);
  });

  it('should set reasons for sobriety', () => {
    const store = useRecoveryStore.getState();
    const reasons: ReasonForSobriety[] = [
      { id: 1, reason: 'Health', description: 'Better health' },
      { id: 2, reason: 'Family', description: 'Family relationships' },
    ];

    store.setReasonsForSobriety(reasons);

    expect(useRecoveryStore.getState().reasonsForSobriety).toEqual(reasons);
  });

  it('should add reason for sobriety', () => {
    const store = useRecoveryStore.getState();
    const reason: ReasonForSobriety = {
      id: 1,
      reason: 'Career',
      description: 'Career goals',
    };

    store.addReasonForSobriety(reason);

    const state = useRecoveryStore.getState();
    expect(state.reasonsForSobriety).toHaveLength(1);
    expect(state.reasonsForSobriety[0]).toEqual(reason);
  });

  it('should update reason for sobriety', () => {
    const store = useRecoveryStore.getState();
    const reason: ReasonForSobriety = {
      id: 1,
      reason: 'Health',
      description: 'Original',
    };

    store.addReasonForSobriety(reason);
    store.updateReasonForSobriety(1, { description: 'Updated description' });

    const state = useRecoveryStore.getState();
    expect(state.reasonsForSobriety[0].description).toBe('Updated description');
  });

  it('should delete reason for sobriety', () => {
    const store = useRecoveryStore.getState();
    const reason: ReasonForSobriety = {
      id: 1,
      reason: 'Health',
      description: 'Better health',
    };

    store.addReasonForSobriety(reason);
    expect(useRecoveryStore.getState().reasonsForSobriety).toHaveLength(1);

    store.deleteReasonForSobriety(1);
    expect(useRecoveryStore.getState().reasonsForSobriety).toHaveLength(0);
  });

  it('should set unlocked badges', () => {
    const store = useRecoveryStore.getState();
    const badges = ['24h', '1week', '30days'];

    store.setUnlockedBadges(badges);

    expect(useRecoveryStore.getState().unlockedBadges).toEqual(badges);
  });

  it('should unlock badge', () => {
    const store = useRecoveryStore.getState();

    store.unlockBadge('24h');
    store.unlockBadge('1week');

    const state = useRecoveryStore.getState();
    expect(state.unlockedBadges).toHaveLength(2);
    expect(state.unlockedBadges).toContain('24h');
    expect(state.unlockedBadges).toContain('1week');
  });

  it('should not add duplicate badge', () => {
    const store = useRecoveryStore.getState();

    store.unlockBadge('24h');
    store.unlockBadge('24h'); // Try to add again

    const state = useRecoveryStore.getState();
    expect(state.unlockedBadges).toHaveLength(1);
  });

  it('should set cost per day', () => {
    const store = useRecoveryStore.getState();

    store.setCostPerDay(15.5);

    expect(useRecoveryStore.getState().costPerDay).toBe(15.5);
  });

  it('should set savings goal', () => {
    const store = useRecoveryStore.getState();

    store.setSavingsGoal('New car');
    store.setSavingsGoalAmount(5000);

    const state = useRecoveryStore.getState();
    expect(state.savingsGoal).toBe('New car');
    expect(state.savingsGoalAmount).toBe(5000);
  });

  it('should manage clean periods', () => {
    const store = useRecoveryStore.getState();
    const period = {
      id: 1,
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      daysClean: 31,
    };

    store.addCleanPeriod(period);

    expect(useRecoveryStore.getState().cleanPeriods).toHaveLength(1);
    expect(useRecoveryStore.getState().cleanPeriods[0]).toEqual(period);
  });
});
