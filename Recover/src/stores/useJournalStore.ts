/**
 * Journal Store
 *
 * Manages check-ins, gratitude entries, growth logs, meetings, meditations, and challenges
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CheckIn, Gratitude, GrowthLog, Meeting, Meditation, Challenge } from '@/types/app';
import { sanitizeText } from '@/lib/sanitize';

interface JournalState {
  // State
  checkIns: CheckIn[];
  gratitude: Gratitude[];
  growthLogs: GrowthLog[];
  meetings: Meeting[];
  meditations: Meditation[];
  challenges: Challenge[];

  // Actions
  setCheckIns: (checkIns: CheckIn[]) => void;
  setGratitude: (gratitude: Gratitude[]) => void;
  setGrowthLogs: (logs: GrowthLog[]) => void;
  setMeetings: (meetings: Meeting[]) => void;
  setMeditations: (meditations: Meditation[]) => void;
  setChallenges: (challenges: Challenge[]) => void;

  // Helpers
  addCheckIn: (checkIn: CheckIn) => void;
  addGratitude: (item: Gratitude) => void;
  addGrowthLog: (log: GrowthLog) => void;
  addMeeting: (meeting: Meeting) => void;
  addMeditation: (meditation: Meditation) => void;
  addChallenge: (challenge: Challenge) => void;

  updateCheckIn: (id: number, updates: Partial<CheckIn>) => void;
  updateMeeting: (id: number, updates: Partial<Meeting>) => void;
  updateMeditation: (id: number, updates: Partial<Meditation>) => void;
  updateGrowthLog: (id: number, updates: Partial<GrowthLog>) => void;
  updateChallenge: (id: number, updates: Partial<Challenge>) => void;
  updateGratitude: (id: number, updates: Partial<Gratitude>) => void;

  deleteCheckIn: (id: number) => void;
  deleteMeeting: (id: number) => void;
  deleteMeditation: (id: number) => void;
  deleteGrowthLog: (id: number) => void;
  deleteChallenge: (id: number) => void;
  deleteGratitude: (id: number) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set) => ({
      // Initial state
      checkIns: [],
      gratitude: [],
      growthLogs: [],
      meetings: [],
      meditations: [],
      challenges: [],

      // Actions
      setCheckIns: (checkIns) => set({ checkIns }),
      setGratitude: (gratitude) => set({ gratitude }),
      setGrowthLogs: (logs) => set({ growthLogs: logs }),
      setMeetings: (meetings) => set({ meetings }),
      setMeditations: (meditations) => set({ meditations }),
      setChallenges: (challenges) => set({ challenges }),

      // Helper methods - Add
      addCheckIn: (checkIn) =>
        set((state) => ({
          checkIns: [...state.checkIns, {
            ...checkIn,
            notes: checkIn.notes ? sanitizeText(checkIn.notes) : checkIn.notes,
          }],
        })),
      addGratitude: (item) =>
        set((state) => ({
          gratitude: [...state.gratitude, {
            ...item,
            entry: sanitizeText(item.entry),
          }],
        })),
      addGrowthLog: (log) =>
        set((state) => ({
          growthLogs: [...state.growthLogs, {
            ...log,
            title: sanitizeText(log.title),
            description: sanitizeText(log.description),
          }],
        })),
      addMeeting: (meeting) =>
        set((state) => ({
          meetings: [...state.meetings, {
            ...meeting,
            title: sanitizeText(meeting.title),
            location: meeting.location ? sanitizeText(meeting.location) : meeting.location,
            notes: meeting.notes ? sanitizeText(meeting.notes) : meeting.notes,
          }],
        })),
      addMeditation: (meditation) =>
        set((state) => ({
          meditations: [...state.meditations, {
            ...meditation,
            notes: meditation.notes ? sanitizeText(meditation.notes) : meditation.notes,
          }],
        })),
      addChallenge: (challenge) =>
        set((state) => ({
          challenges: [...state.challenges, {
            ...challenge,
            title: sanitizeText(challenge.title),
            description: challenge.description ? sanitizeText(challenge.description) : challenge.description,
          }],
        })),

      // Helper methods - Update
      updateCheckIn: (id, updates) =>
        set((state) => ({
          checkIns: state.checkIns.map((item) =>
            item.id === id ? {
              ...item,
              ...updates,
              notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : item.notes,
            } : item
          ),
        })),
      updateMeeting: (id, updates) =>
        set((state) => ({
          meetings: state.meetings.map((item) =>
            item.id === id ? {
              ...item,
              ...updates,
              title: updates.title !== undefined ? sanitizeText(updates.title) : item.title,
              location: updates.location !== undefined ? (updates.location ? sanitizeText(updates.location) : updates.location) : item.location,
              notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : item.notes,
            } : item
          ),
        })),
      updateMeditation: (id, updates) =>
        set((state) => ({
          meditations: state.meditations.map((item) =>
            item.id === id ? {
              ...item,
              ...updates,
              notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : item.notes,
            } : item
          ),
        })),
      updateGrowthLog: (id, updates) =>
        set((state) => ({
          growthLogs: state.growthLogs.map((item) =>
            item.id === id ? {
              ...item,
              ...updates,
              title: updates.title !== undefined ? sanitizeText(updates.title) : item.title,
              description: updates.description !== undefined ? sanitizeText(updates.description) : item.description,
            } : item
          ),
        })),
      updateChallenge: (id, updates) =>
        set((state) => ({
          challenges: state.challenges.map((item) =>
            item.id === id ? {
              ...item,
              ...updates,
              title: updates.title !== undefined ? sanitizeText(updates.title) : item.title,
              description: updates.description !== undefined ? (updates.description ? sanitizeText(updates.description) : updates.description) : item.description,
            } : item
          ),
        })),
      updateGratitude: (id, updates) =>
        set((state) => ({
          gratitude: state.gratitude.map((item) =>
            item.id === id ? {
              ...item,
              ...updates,
              entry: updates.entry !== undefined ? sanitizeText(updates.entry) : item.entry,
            } : item
          ),
        })),

      // Helper methods - Delete
      deleteCheckIn: (id) =>
        set((state) => ({
          checkIns: state.checkIns.filter((item) => item.id !== id),
        })),
      deleteMeeting: (id) =>
        set((state) => ({
          meetings: state.meetings.filter((item) => item.id !== id),
        })),
      deleteMeditation: (id) =>
        set((state) => ({
          meditations: state.meditations.filter((item) => item.id !== id),
        })),
      deleteGrowthLog: (id) =>
        set((state) => ({
          growthLogs: state.growthLogs.filter((item) => item.id !== id),
        })),
      deleteChallenge: (id) =>
        set((state) => ({
          challenges: state.challenges.filter((item) => item.id !== id),
        })),
      deleteGratitude: (id) =>
        set((state) => ({
          gratitude: state.gratitude.filter((item) => item.id !== id),
        })),
    }),
    {
      name: 'journal-store',
    }
  )
);
