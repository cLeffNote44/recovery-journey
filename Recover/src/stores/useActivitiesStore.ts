/**
 * Activities Store
 *
 * Manages cravings and calendar events
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Craving, CalendarEvent } from '@/types/app';
import { sanitizeText } from '@/lib/sanitize';
import { createEncryptedStorage } from '@/lib/encrypted-storage';

interface ActivitiesState {
  // State
  cravings: Craving[];
  events: CalendarEvent[];

  // Actions
  setCravings: (cravings: Craving[]) => void;
  setEvents: (events: CalendarEvent[]) => void;

  // Helpers - Add
  addCraving: (craving: Craving) => void;
  addEvent: (event: CalendarEvent) => void;

  // Helpers - Update
  updateCraving: (id: number, updates: Partial<Craving>) => void;
  updateEvent: (id: number, updates: Partial<CalendarEvent>) => void;

  // Helpers - Delete
  deleteCraving: (id: number) => void;
  deleteEvent: (id: number) => void;
}

export const useActivitiesStore = create<ActivitiesState>()(
  persist(
    (set) => ({
      // Initial state
      cravings: [],
      events: [],

      // Actions
      setCravings: (cravings) => set({ cravings }),
      setEvents: (events) => set({ events }),

      // Helper methods - Add
      addCraving: (craving) =>
        set((state) => ({
          cravings: [...state.cravings, {
            ...craving,
            notes: craving.notes ? sanitizeText(craving.notes) : craving.notes,
          }],
        })),
      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, {
            ...event,
            title: sanitizeText(event.title),
            description: event.description ? sanitizeText(event.description) : event.description,
          }],
        })),

      // Helper methods - Update
      updateCraving: (id, updates) =>
        set((state) => ({
          cravings: state.cravings.map((item) =>
            item.id === id ? {
              ...item,
              ...updates,
              notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : item.notes,
            } : item
          ),
        })),
      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((item) =>
            item.id === id ? {
              ...item,
              ...updates,
              title: updates.title !== undefined ? sanitizeText(updates.title) : item.title,
              description: updates.description !== undefined ? (updates.description ? sanitizeText(updates.description) : updates.description) : item.description,
            } : item
          ),
        })),

      // Helper methods - Delete
      deleteCraving: (id) =>
        set((state) => ({
          cravings: state.cravings.filter((item) => item.id !== id),
        })),
      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'activities-store',
      storage: createEncryptedStorage(),
    }
  )
);
