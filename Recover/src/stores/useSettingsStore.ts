/**
 * Settings Store
 *
 * Manages app settings, notifications, goals, contacts, relapse plan, wellness, and user profile
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  NotificationSettings,
  Goal,
  GoalProgress,
  Contact,
  RelapsePlan,
  SkillBuilding,
  UserProfile,
  SleepEntry,
  Medication,
  MedicationLog,
  ExerciseEntry,
  NutritionEntry,
  Quote,
  QuoteSettings
} from '@/types/app';
import { sanitizeText } from '@/lib/sanitize';

const defaultRelapsePlan: RelapsePlan = {
  warningSigns: [],
  highRiskSituations: [],
  greenActions: [],
  yellowActions: [],
  redActions: [],
};

const defaultNotificationSettings: NotificationSettings = {
  enabled: false,
  dailyReminderTime: '09:00',
  streakReminders: true,
  meetingReminders: true,
  milestoneNotifications: true,
};

const defaultSkillBuilding: SkillBuilding = {
  mindfulnessChallenge: {
    currentDay: 0,
    completedDays: [],
    notes: {},
  },
  copingSkillUsage: [],
  triggerExercises: [],
  connectionPrompts: [],
  valuesClarification: [],
  selfCompassion: [],
};

const defaultQuoteSettings: QuoteSettings = {
  refreshFrequency: 'daily',
  lastRefresh: new Date().toISOString(),
  disabledQuoteIds: [],
};

interface SettingsState {
  // State
  userProfile: UserProfile | null;
  darkMode: boolean;
  notificationSettings: NotificationSettings;
  onboardingCompleted: boolean;
  celebrationsEnabled: boolean;
  goals: Goal[];
  goalProgress: GoalProgress[];
  contacts: Contact[];
  relapsePlan: RelapsePlan;
  skillBuilding: SkillBuilding;

  // Wellness
  sleepEntries: SleepEntry[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  exerciseEntries: ExerciseEntry[];
  nutritionEntries: NutritionEntry[];

  // Quotes
  customQuotes: Quote[];
  favoriteQuoteIds: string[];
  quoteSettings: QuoteSettings;

  // Actions
  setUserProfile: (profile: UserProfile | null) => void;
  setDarkMode: (mode: boolean) => void;
  setNotificationSettings: (settings: NotificationSettings) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setCelebrationsEnabled: (enabled: boolean) => void;
  setGoals: (goals: Goal[]) => void;
  setGoalProgress: (progress: GoalProgress[]) => void;
  setContacts: (contacts: Contact[]) => void;
  setRelapsePlan: (plan: RelapsePlan) => void;
  setSkillBuilding: (skillBuilding: SkillBuilding) => void;

  // Wellness Actions
  setSleepEntries: (entries: SleepEntry[]) => void;
  setMedications: (medications: Medication[]) => void;
  setMedicationLogs: (logs: MedicationLog[]) => void;
  setExerciseEntries: (entries: ExerciseEntry[]) => void;
  setNutritionEntries: (entries: NutritionEntry[]) => void;

  // Quotes Actions
  setCustomQuotes: (quotes: Quote[]) => void;
  setFavoriteQuoteIds: (ids: string[]) => void;
  setQuoteSettings: (settings: QuoteSettings) => void;

  // Helpers - Goals
  addGoal: (goal: Goal) => void;
  updateGoal: (id: number, updates: Partial<Goal>) => void;
  deleteGoal: (id: number) => void;

  // Helpers - Contacts
  addContact: (contact: Contact) => void;
  updateContact: (id: number, updates: Partial<Contact>) => void;
  deleteContact: (id: number) => void;

  // Helpers - Wellness
  addSleepEntry: (entry: SleepEntry) => void;
  addMedication: (medication: Medication) => void;
  addMedicationLog: (log: MedicationLog) => void;
  addExerciseEntry: (entry: ExerciseEntry) => void;
  addNutritionEntry: (entry: NutritionEntry) => void;

  updateSleepEntry: (id: number, updates: Partial<SleepEntry>) => void;
  updateMedication: (id: number, updates: Partial<Medication>) => void;
  updateExerciseEntry: (id: number, updates: Partial<ExerciseEntry>) => void;
  updateNutritionEntry: (id: number, updates: Partial<NutritionEntry>) => void;

  deleteSleepEntry: (id: number) => void;
  deleteMedication: (id: number) => void;
  deleteMedicationLog: (id: number) => void;
  deleteExerciseEntry: (id: number) => void;
  deleteNutritionEntry: (id: number) => void;

  // Helpers - Quotes
  addCustomQuote: (quote: Quote) => void;
  removeQuote: (quoteId: string) => void;
  toggleFavoriteQuote: (quoteId: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Initial state
      userProfile: null,
      darkMode: false,
      notificationSettings: defaultNotificationSettings,
      onboardingCompleted: false,
      celebrationsEnabled: true,
      goals: [],
      goalProgress: [],
      contacts: [],
      relapsePlan: defaultRelapsePlan,
      skillBuilding: defaultSkillBuilding,
      sleepEntries: [],
      medications: [],
      medicationLogs: [],
      exerciseEntries: [],
      nutritionEntries: [],
      customQuotes: [],
      favoriteQuoteIds: [],
      quoteSettings: defaultQuoteSettings,

      // Actions
      setUserProfile: (profile) => set({ userProfile: profile }),
      setDarkMode: (mode) => set({ darkMode: mode }),
      setNotificationSettings: (settings) => set({ notificationSettings: settings }),
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
      setCelebrationsEnabled: (enabled) => set({ celebrationsEnabled: enabled }),
      setGoals: (goals) => set({ goals }),
      setGoalProgress: (progress) => set({ goalProgress: progress }),
      setContacts: (contacts) => set({ contacts }),
      setRelapsePlan: (plan) => set({ relapsePlan: plan }),
      setSkillBuilding: (skillBuilding) => set({ skillBuilding }),
      setSleepEntries: (entries) => set({ sleepEntries: entries }),
      setMedications: (medications) => set({ medications }),
      setMedicationLogs: (logs) => set({ medicationLogs: logs }),
      setExerciseEntries: (entries) => set({ exerciseEntries: entries }),
      setNutritionEntries: (entries) => set({ nutritionEntries: entries }),
      setCustomQuotes: (quotes) => set({ customQuotes: quotes }),
      setFavoriteQuoteIds: (ids) => set({ favoriteQuoteIds: ids }),
      setQuoteSettings: (settings) => set({ quoteSettings: settings }),

      // Helper methods - Goals
      addGoal: (goal) => set((state) => ({
        goals: [...state.goals, {
          ...goal,
          title: sanitizeText(goal.title),
          description: goal.description ? sanitizeText(goal.description) : goal.description,
        }]
      })),
      updateGoal: (id, updates) =>
        set((state) => ({
          goals: state.goals.map((goal) => (goal.id === id ? {
            ...goal,
            ...updates,
            title: updates.title !== undefined ? sanitizeText(updates.title) : goal.title,
            description: updates.description !== undefined ? (updates.description ? sanitizeText(updates.description) : updates.description) : goal.description,
          } : goal)),
        })),
      deleteGoal: (id) => set((state) => ({ goals: state.goals.filter((goal) => goal.id !== id) })),

      // Helper methods - Contacts
      addContact: (contact) => set((state) => ({
        contacts: [...state.contacts, {
          ...contact,
          name: sanitizeText(contact.name),
          phone: contact.phone ? sanitizeText(contact.phone) : contact.phone,
          email: contact.email ? sanitizeText(contact.email) : contact.email,
          notes: contact.notes ? sanitizeText(contact.notes) : contact.notes,
        }]
      })),
      updateContact: (id, updates) =>
        set((state) => ({
          contacts: state.contacts.map((c) => (c.id === id ? {
            ...c,
            ...updates,
            name: updates.name !== undefined ? sanitizeText(updates.name) : c.name,
            phone: updates.phone !== undefined ? (updates.phone ? sanitizeText(updates.phone) : updates.phone) : c.phone,
            email: updates.email !== undefined ? (updates.email ? sanitizeText(updates.email) : updates.email) : c.email,
            notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : c.notes,
          } : c)),
        })),
      deleteContact: (id) => set((state) => ({ contacts: state.contacts.filter((c) => c.id !== id) })),

      // Helper methods - Wellness (Add)
      addSleepEntry: (entry) => set((state) => ({
        sleepEntries: [...state.sleepEntries, {
          ...entry,
          notes: entry.notes ? sanitizeText(entry.notes) : entry.notes,
        }]
      })),
      addMedication: (medication) => set((state) => ({
        medications: [...state.medications, {
          ...medication,
          name: sanitizeText(medication.name),
          dosage: medication.dosage ? sanitizeText(medication.dosage) : medication.dosage,
          notes: medication.notes ? sanitizeText(medication.notes) : medication.notes,
        }]
      })),
      addMedicationLog: (log) => set((state) => ({
        medicationLogs: [...state.medicationLogs, {
          ...log,
          notes: log.notes ? sanitizeText(log.notes) : log.notes,
        }]
      })),
      addExerciseEntry: (entry) => set((state) => ({
        exerciseEntries: [...state.exerciseEntries, {
          ...entry,
          type: sanitizeText(entry.type),
          notes: entry.notes ? sanitizeText(entry.notes) : entry.notes,
        }]
      })),
      addNutritionEntry: (entry) => set((state) => ({
        nutritionEntries: [...state.nutritionEntries, {
          ...entry,
          notes: entry.notes ? sanitizeText(entry.notes) : entry.notes,
        }]
      })),

      // Helper methods - Wellness (Update)
      updateSleepEntry: (id, updates) =>
        set((state) => ({
          sleepEntries: state.sleepEntries.map((e) => (e.id === id ? {
            ...e,
            ...updates,
            notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : e.notes,
          } : e)),
        })),
      updateMedication: (id, updates) =>
        set((state) => ({
          medications: state.medications.map((m) => (m.id === id ? {
            ...m,
            ...updates,
            name: updates.name !== undefined ? sanitizeText(updates.name) : m.name,
            dosage: updates.dosage !== undefined ? (updates.dosage ? sanitizeText(updates.dosage) : updates.dosage) : m.dosage,
            notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : m.notes,
          } : m)),
        })),
      updateExerciseEntry: (id, updates) =>
        set((state) => ({
          exerciseEntries: state.exerciseEntries.map((e) => (e.id === id ? {
            ...e,
            ...updates,
            type: updates.type !== undefined ? sanitizeText(updates.type) : e.type,
            notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : e.notes,
          } : e)),
        })),
      updateNutritionEntry: (id, updates) =>
        set((state) => ({
          nutritionEntries: state.nutritionEntries.map((e) => (e.id === id ? {
            ...e,
            ...updates,
            notes: updates.notes !== undefined ? (updates.notes ? sanitizeText(updates.notes) : updates.notes) : e.notes,
          } : e)),
        })),

      // Helper methods - Wellness (Delete)
      deleteSleepEntry: (id) => set((state) => ({ sleepEntries: state.sleepEntries.filter((e) => e.id !== id) })),
      deleteMedication: (id) => set((state) => ({ medications: state.medications.filter((m) => m.id !== id) })),
      deleteMedicationLog: (id) => set((state) => ({ medicationLogs: state.medicationLogs.filter((l) => l.id !== id) })),
      deleteExerciseEntry: (id) => set((state) => ({ exerciseEntries: state.exerciseEntries.filter((e) => e.id !== id) })),
      deleteNutritionEntry: (id) => set((state) => ({ nutritionEntries: state.nutritionEntries.filter((e) => e.id !== id) })),

      // Helper methods - Quotes
      addCustomQuote: (quote) => set((state) => ({
        customQuotes: [...state.customQuotes, {
          ...quote,
          text: sanitizeText(quote.text),
          author: quote.author ? sanitizeText(quote.author) : quote.author,
        }]
      })),
      removeQuote: (quoteId) =>
        set((state) => ({ customQuotes: state.customQuotes.filter((q) => q.id !== quoteId) })),
      toggleFavoriteQuote: (quoteId) =>
        set((state) => ({
          favoriteQuoteIds: state.favoriteQuoteIds.includes(quoteId)
            ? state.favoriteQuoteIds.filter((id) => id !== quoteId)
            : [...state.favoriteQuoteIds, quoteId],
        })),
    }),
    {
      name: 'settings-store',
    }
  )
);
