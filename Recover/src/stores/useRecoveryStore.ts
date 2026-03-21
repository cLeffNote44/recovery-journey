/**
 * Recovery Store
 *
 * Manages sobriety tracking, relapses, clean periods, step work, and recovery milestones
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Relapse, CleanPeriod, StepWorkProgress, ReasonForSobriety } from '@/types/app';
import { sanitizeText } from '@/lib/sanitize';

interface RecoveryState {
  // State
  sobrietyDate: string;
  relapses: Relapse[];
  cleanPeriods: CleanPeriod[];
  stepWork: StepWorkProgress | null;
  reasonsForSobriety: ReasonForSobriety[];
  unlockedBadges: string[];
  costPerDay: number;
  savingsGoal: string;
  savingsGoalAmount: number;

  // Actions
  setSobrietyDate: (date: string) => void;
  setRelapses: (relapses: Relapse[]) => void;
  setCleanPeriods: (periods: CleanPeriod[]) => void;
  setStepWork: (stepWork: StepWorkProgress | null) => void;
  setReasonsForSobriety: (reasons: ReasonForSobriety[]) => void;
  setUnlockedBadges: (badges: string[]) => void;
  setCostPerDay: (cost: number) => void;
  setSavingsGoal: (goal: string) => void;
  setSavingsGoalAmount: (amount: number) => void;

  // Helpers - Relapses
  addRelapse: (relapse: Relapse) => void;
  updateRelapse: (id: number, updates: Partial<Relapse>) => void;
  deleteRelapse: (id: number) => void;

  // Helpers - Clean Periods
  addCleanPeriod: (period: CleanPeriod) => void;
  updateCleanPeriod: (id: number, updates: Partial<CleanPeriod>) => void;
  deleteCleanPeriod: (id: number) => void;

  // Helpers - Reasons
  addReasonForSobriety: (reason: ReasonForSobriety) => void;
  updateReasonForSobriety: (id: number, updates: Partial<ReasonForSobriety>) => void;
  deleteReasonForSobriety: (id: number) => void;

  // Helpers - Badges
  unlockBadge: (badge: string) => void;
}

export const useRecoveryStore = create<RecoveryState>()(
  persist(
    (set) => ({
      // Initial state
      sobrietyDate: new Date().toISOString().split('T')[0],
      relapses: [],
      cleanPeriods: [],
      stepWork: null,
      reasonsForSobriety: [],
      unlockedBadges: [],
      costPerDay: 0,
      savingsGoal: '',
      savingsGoalAmount: 0,

      // Actions
      setSobrietyDate: (date) => set({ sobrietyDate: date }),
      setRelapses: (relapses) => set({ relapses }),
      setCleanPeriods: (periods) => set({ cleanPeriods: periods }),
      setStepWork: (stepWork) => set({ stepWork }),
      setReasonsForSobriety: (reasons) => set({ reasonsForSobriety: reasons }),
      setUnlockedBadges: (badges) => set({ unlockedBadges: badges }),
      setCostPerDay: (cost) => set({ costPerDay: cost }),
      setSavingsGoal: (goal) => set({ savingsGoal: goal }),
      setSavingsGoalAmount: (amount) => set({ savingsGoalAmount: amount }),

      // Helper methods - Relapses
      addRelapse: (relapse) =>
        set((state) => ({
          relapses: [...state.relapses, {
            ...relapse,
            notes: relapse.notes ? sanitizeText(relapse.notes) : relapse.notes,
          }],
        })),
      updateRelapse: (id, updates) =>
        set((state) => ({
          relapses: state.relapses.map((r) => (r.id === id ? {
            ...r,
            ...updates,
            notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : r.notes,
          } : r)),
        })),
      deleteRelapse: (id) =>
        set((state) => ({
          relapses: state.relapses.filter((r) => r.id !== id),
        })),

      // Helper methods - Clean Periods
      addCleanPeriod: (period) =>
        set((state) => ({
          cleanPeriods: [...state.cleanPeriods, period],
        })),
      updateCleanPeriod: (id, updates) =>
        set((state) => ({
          cleanPeriods: state.cleanPeriods.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteCleanPeriod: (id) =>
        set((state) => ({
          cleanPeriods: state.cleanPeriods.filter((p) => p.id !== id),
        })),

      // Helper methods - Reasons
      addReasonForSobriety: (reason) =>
        set((state) => ({
          reasonsForSobriety: [...state.reasonsForSobriety, {
            ...reason,
            reason: sanitizeText(reason.reason),
            description: sanitizeText(reason.description),
          }],
        })),
      updateReasonForSobriety: (id, updates) =>
        set((state) => ({
          reasonsForSobriety: state.reasonsForSobriety.map((r) => (r.id === id ? {
            ...r,
            ...updates,
            reason: updates.reason !== undefined ? sanitizeText(updates.reason) : r.reason,
            description: updates.description !== undefined ? sanitizeText(updates.description) : r.description,
          } : r)),
        })),
      deleteReasonForSobriety: (id) =>
        set((state) => ({
          reasonsForSobriety: state.reasonsForSobriety.filter((r) => r.id !== id),
        })),

      // Helper methods - Badges
      unlockBadge: (badge) =>
        set((state) => ({
          unlockedBadges: state.unlockedBadges.includes(badge)
            ? state.unlockedBadges
            : [...state.unlockedBadges, badge],
        })),
    }),
    {
      name: 'recovery-store',
    }
  )
);
