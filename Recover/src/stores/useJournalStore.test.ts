/**
 * useJournalStore Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useJournalStore } from './useJournalStore';
import type { CheckIn, Gratitude, GrowthLog } from '@/types/app';

describe('useJournalStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useJournalStore.getState();
    store.setCheckIns([]);
    store.setGratitude([]);
    store.setGrowthLogs([]);
  });

  it('should have initial state', () => {
    const state = useJournalStore.getState();

    expect(state.checkIns).toEqual([]);
    expect(state.gratitude).toEqual([]);
    expect(state.growthLogs).toEqual([]);
  });

  it('should add check-in', () => {
    const store = useJournalStore.getState();
    const checkIn: CheckIn = {
      id: '1',
      date: new Date().toISOString(),
      mood: 8,
      notes: 'Feeling great',
      triggers: [],
      copingStrategies: [],
    };

    store.addCheckIn(checkIn);

    const state = useJournalStore.getState();
    expect(state.checkIns).toHaveLength(1);
    expect(state.checkIns[0]).toEqual(checkIn);
  });

  it('should add multiple check-ins', () => {
    const store = useJournalStore.getState();
    const checkIn1: CheckIn = {
      id: '1',
      date: new Date().toISOString(),
      mood: 8,
      notes: 'First check-in',
      triggers: [],
      copingStrategies: [],
    };
    const checkIn2: CheckIn = {
      id: '2',
      date: new Date().toISOString(),
      mood: 6,
      notes: 'Second check-in',
      triggers: ['stress'],
      copingStrategies: ['meditation'],
    };

    store.addCheckIn(checkIn1);
    store.addCheckIn(checkIn2);

    const state = useJournalStore.getState();
    expect(state.checkIns).toHaveLength(2);
  });

  it('should set all check-ins', () => {
    const store = useJournalStore.getState();
    const checkIns: CheckIn[] = [
      {
        id: '1',
        date: new Date().toISOString(),
        mood: 8,
        notes: 'First',
        triggers: [],
        copingStrategies: [],
      },
      {
        id: '2',
        date: new Date().toISOString(),
        mood: 6,
        notes: 'Second',
        triggers: [],
        copingStrategies: [],
      },
    ];

    store.setCheckIns(checkIns);

    expect(useJournalStore.getState().checkIns).toEqual(checkIns);
  });

  it('should add gratitude entry', () => {
    const store = useJournalStore.getState();
    const entry: Gratitude = {
      id: '1',
      date: new Date().toISOString(),
      entry: 'Grateful for my family',
    };

    store.addGratitude(entry);

    const state = useJournalStore.getState();
    expect(state.gratitude).toHaveLength(1);
    expect(state.gratitude[0]).toEqual(entry);
  });

  it('should set all gratitude entries', () => {
    const store = useJournalStore.getState();
    const entries: Gratitude[] = [
      {
        id: '1',
        date: new Date().toISOString(),
        entry: 'First',
      },
      {
        id: '2',
        date: new Date().toISOString(),
        entry: 'Second',
      },
    ];

    store.setGratitude(entries);

    expect(useJournalStore.getState().gratitude).toEqual(entries);
  });

  it('should add growth log', () => {
    const store = useJournalStore.getState();
    const log: GrowthLog = {
      id: '1',
      date: new Date().toISOString(),
      title: 'Managing stress',
      description: 'Practiced meditation and felt more calm',
    };

    store.addGrowthLog(log);

    const state = useJournalStore.getState();
    expect(state.growthLogs).toHaveLength(1);
    expect(state.growthLogs[0]).toEqual(log);
  });

  it('should set all growth logs', () => {
    const store = useJournalStore.getState();
    const logs: GrowthLog[] = [
      {
        id: '1',
        date: new Date().toISOString(),
        title: 'First',
        description: 'First description',
      },
      {
        id: '2',
        date: new Date().toISOString(),
        title: 'Second',
        description: 'Second description',
      },
    ];

    store.setGrowthLogs(logs);

    expect(useJournalStore.getState().growthLogs).toEqual(logs);
  });
});
