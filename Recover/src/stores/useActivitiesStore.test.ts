/**
 * useActivitiesStore Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useActivitiesStore } from './useActivitiesStore';
import type { Craving, CalendarEvent } from '@/types/app';

describe('useActivitiesStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useActivitiesStore.getState();
    store.setCravings([]);
    store.setEvents([]);
  });

  it('should have initial state', () => {
    const state = useActivitiesStore.getState();

    expect(state.cravings).toEqual([]);
    expect(state.events).toEqual([]);
  });

  describe('Cravings', () => {
    it('should add craving', () => {
      const store = useActivitiesStore.getState();
      const craving: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        copingStrategy: 'meditation',
        outcome: 'overcome',
      };

      store.addCraving(craving);

      const state = useActivitiesStore.getState();
      expect(state.cravings).toHaveLength(1);
      expect(state.cravings[0]).toEqual(craving);
    });

    it('should add multiple cravings', () => {
      const store = useActivitiesStore.getState();
      const craving1: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        outcome: 'overcome',
      };
      const craving2: Craving = {
        id: 2,
        date: new Date().toISOString(),
        intensity: 5,
        trigger: 'boredom',
        outcome: 'overcome',
      };

      store.addCraving(craving1);
      store.addCraving(craving2);

      const state = useActivitiesStore.getState();
      expect(state.cravings).toHaveLength(2);
      expect(state.cravings[0]).toEqual(craving1);
      expect(state.cravings[1]).toEqual(craving2);
    });

    it('should set all cravings', () => {
      const store = useActivitiesStore.getState();
      const cravings: Craving[] = [
        {
          id: 1,
          date: new Date().toISOString(),
          intensity: 7,
          trigger: 'stress',
          outcome: 'overcome',
        },
        {
          id: 2,
          date: new Date().toISOString(),
          intensity: 5,
          trigger: 'boredom',
          outcome: 'overcome',
        },
      ];

      store.setCravings(cravings);

      expect(useActivitiesStore.getState().cravings).toEqual(cravings);
    });

    it('should update craving', () => {
      const store = useActivitiesStore.getState();
      const craving: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        copingStrategy: 'meditation',
        outcome: 'overcome',
      };

      store.addCraving(craving);
      store.updateCraving(1, {
        intensity: 9,
        copingStrategy: 'exercise',
      });

      const state = useActivitiesStore.getState();
      expect(state.cravings[0].intensity).toBe(9);
      expect(state.cravings[0].copingStrategy).toBe('exercise');
      expect(state.cravings[0].trigger).toBe('stress'); // Unchanged
    });

    it('should not update non-existent craving', () => {
      const store = useActivitiesStore.getState();
      const craving: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        outcome: 'overcome',
      };

      store.addCraving(craving);
      store.updateCraving(999, { intensity: 10 }); // Non-existent ID

      const state = useActivitiesStore.getState();
      expect(state.cravings[0].intensity).toBe(7); // Unchanged
    });

    it('should delete craving', () => {
      const store = useActivitiesStore.getState();
      const craving1: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        outcome: 'overcome',
      };
      const craving2: Craving = {
        id: 2,
        date: new Date().toISOString(),
        intensity: 5,
        trigger: 'boredom',
        outcome: 'overcome',
      };

      store.addCraving(craving1);
      store.addCraving(craving2);
      expect(useActivitiesStore.getState().cravings).toHaveLength(2);

      store.deleteCraving(1);

      const state = useActivitiesStore.getState();
      expect(state.cravings).toHaveLength(1);
      expect(state.cravings[0].id).toBe(2);
    });

    it('should handle deleting non-existent craving', () => {
      const store = useActivitiesStore.getState();
      const craving: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        outcome: 'overcome',
      };

      store.addCraving(craving);
      store.deleteCraving(999); // Non-existent ID

      const state = useActivitiesStore.getState();
      expect(state.cravings).toHaveLength(1); // Unchanged
    });
  });

  describe('Events', () => {
    it('should add event', () => {
      const store = useActivitiesStore.getState();
      const event: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        time: '14:00',
        title: 'Therapy Session',
        description: 'Weekly therapy appointment',
      };

      store.addEvent(event);

      const state = useActivitiesStore.getState();
      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toEqual(event);
    });

    it('should add multiple events', () => {
      const store = useActivitiesStore.getState();
      const event1: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        time: '14:00',
        title: 'Therapy',
      };
      const event2: CalendarEvent = {
        id: 2,
        date: '2024-06-02',
        time: '19:00',
        title: 'Support Group',
      };

      store.addEvent(event1);
      store.addEvent(event2);

      const state = useActivitiesStore.getState();
      expect(state.events).toHaveLength(2);
      expect(state.events[0]).toEqual(event1);
      expect(state.events[1]).toEqual(event2);
    });

    it('should set all events', () => {
      const store = useActivitiesStore.getState();
      const events: CalendarEvent[] = [
        {
          id: 1,
          date: '2024-06-01',
          title: 'Therapy',
        },
        {
          id: 2,
          date: '2024-06-02',
          title: 'Meeting',
        },
      ];

      store.setEvents(events);

      expect(useActivitiesStore.getState().events).toEqual(events);
    });

    it('should update event', () => {
      const store = useActivitiesStore.getState();
      const event: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        time: '14:00',
        title: 'Therapy Session',
        description: 'Original description',
      };

      store.addEvent(event);
      store.updateEvent(1, {
        time: '15:00',
        description: 'Updated description',
      });

      const state = useActivitiesStore.getState();
      expect(state.events[0].time).toBe('15:00');
      expect(state.events[0].description).toBe('Updated description');
      expect(state.events[0].title).toBe('Therapy Session'); // Unchanged
    });

    it('should not update non-existent event', () => {
      const store = useActivitiesStore.getState();
      const event: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        title: 'Therapy',
      };

      store.addEvent(event);
      store.updateEvent(999, { title: 'Updated' }); // Non-existent ID

      const state = useActivitiesStore.getState();
      expect(state.events[0].title).toBe('Therapy'); // Unchanged
    });

    it('should delete event', () => {
      const store = useActivitiesStore.getState();
      const event1: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        title: 'Therapy',
      };
      const event2: CalendarEvent = {
        id: 2,
        date: '2024-06-02',
        title: 'Meeting',
      };

      store.addEvent(event1);
      store.addEvent(event2);
      expect(useActivitiesStore.getState().events).toHaveLength(2);

      store.deleteEvent(1);

      const state = useActivitiesStore.getState();
      expect(state.events).toHaveLength(1);
      expect(state.events[0].id).toBe(2);
    });

    it('should handle deleting non-existent event', () => {
      const store = useActivitiesStore.getState();
      const event: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        title: 'Therapy',
      };

      store.addEvent(event);
      store.deleteEvent(999); // Non-existent ID

      const state = useActivitiesStore.getState();
      expect(state.events).toHaveLength(1); // Unchanged
    });
  });

  describe('Multiple Activity Types', () => {
    it('should handle cravings and events simultaneously', () => {
      const store = useActivitiesStore.getState();

      const craving: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        outcome: 'overcome',
      };

      const event: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        title: 'Therapy',
      };

      store.addCraving(craving);
      store.addEvent(event);

      const state = useActivitiesStore.getState();
      expect(state.cravings).toHaveLength(1);
      expect(state.events).toHaveLength(1);
    });

    it('should update cravings without affecting events', () => {
      const store = useActivitiesStore.getState();

      const craving: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        outcome: 'overcome',
      };

      const event: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        title: 'Therapy',
      };

      store.addCraving(craving);
      store.addEvent(event);

      store.updateCraving(1, { intensity: 9 });

      const state = useActivitiesStore.getState();
      expect(state.cravings[0].intensity).toBe(9);
      expect(state.events).toHaveLength(1); // Unchanged
      expect(state.events[0].title).toBe('Therapy'); // Unchanged
    });

    it('should delete events without affecting cravings', () => {
      const store = useActivitiesStore.getState();

      const craving: Craving = {
        id: 1,
        date: new Date().toISOString(),
        intensity: 7,
        trigger: 'stress',
        outcome: 'overcome',
      };

      const event: CalendarEvent = {
        id: 1,
        date: '2024-06-01',
        title: 'Therapy',
      };

      store.addCraving(craving);
      store.addEvent(event);

      store.deleteEvent(1);

      const state = useActivitiesStore.getState();
      expect(state.events).toHaveLength(0);
      expect(state.cravings).toHaveLength(1); // Unchanged
      expect(state.cravings[0].intensity).toBe(7); // Unchanged
    });
  });
});
