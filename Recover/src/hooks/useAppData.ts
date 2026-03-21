/**
 * useAppData Hook
 *
 * Convenience hook that aggregates all Zustand stores
 * This makes migration easier - just replace useAppContext with useAppData
 */

import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { useMemo } from 'react';
import { getQuoteOfTheDay } from '@/lib/quotes';

export function useAppData() {
  // Recovery Store
  const sobrietyDate = useRecoveryStore((state) => state.sobrietyDate);
  const setSobrietyDate = useRecoveryStore((state) => state.setSobrietyDate);
  const relapses = useRecoveryStore((state) => state.relapses);
  const setRelapses = useRecoveryStore((state) => state.setRelapses);
  const cleanPeriods = useRecoveryStore((state) => state.cleanPeriods);
  const setCleanPeriods = useRecoveryStore((state) => state.setCleanPeriods);
  const stepWork = useRecoveryStore((state) => state.stepWork);
  const setStepWork = useRecoveryStore((state) => state.setStepWork);
  const reasonsForSobriety = useRecoveryStore((state) => state.reasonsForSobriety);
  const setReasonsForSobriety = useRecoveryStore((state) => state.setReasonsForSobriety);
  const unlockedBadges = useRecoveryStore((state) => state.unlockedBadges);
  const setUnlockedBadges = useRecoveryStore((state) => state.setUnlockedBadges);
  const costPerDay = useRecoveryStore((state) => state.costPerDay);
  const setCostPerDay = useRecoveryStore((state) => state.setCostPerDay);
  const savingsGoal = useRecoveryStore((state) => state.savingsGoal);
  const setSavingsGoal = useRecoveryStore((state) => state.setSavingsGoal);
  const savingsGoalAmount = useRecoveryStore((state) => state.savingsGoalAmount);
  const setSavingsGoalAmount = useRecoveryStore((state) => state.setSavingsGoalAmount);

  // Journal Store
  const checkIns = useJournalStore((state) => state.checkIns);
  const setCheckIns = useJournalStore((state) => state.setCheckIns);
  const gratitude = useJournalStore((state) => state.gratitude);
  const setGratitude = useJournalStore((state) => state.setGratitude);
  const growthLogs = useJournalStore((state) => state.growthLogs);
  const setGrowthLogs = useJournalStore((state) => state.setGrowthLogs);
  const meetings = useJournalStore((state) => state.meetings);
  const setMeetings = useJournalStore((state) => state.setMeetings);
  const meditations = useJournalStore((state) => state.meditations);
  const setMeditations = useJournalStore((state) => state.setMeditations);
  const challenges = useJournalStore((state) => state.challenges);
  const setChallenges = useJournalStore((state) => state.setChallenges);

  // Activities Store
  const cravings = useActivitiesStore((state) => state.cravings);
  const setCravings = useActivitiesStore((state) => state.setCravings);
  const events = useActivitiesStore((state) => state.events);
  const setEvents = useActivitiesStore((state) => state.setEvents);

  // Settings Store
  const userProfile = useSettingsStore((state) => state.userProfile);
  const setUserProfile = useSettingsStore((state) => state.setUserProfile);
  const darkMode = useSettingsStore((state) => state.darkMode);
  const setDarkMode = useSettingsStore((state) => state.setDarkMode);
  const notificationSettings = useSettingsStore((state) => state.notificationSettings);
  const setNotificationSettings = useSettingsStore((state) => state.setNotificationSettings);
  const onboardingCompleted = useSettingsStore((state) => state.onboardingCompleted);
  const setOnboardingCompleted = useSettingsStore((state) => state.setOnboardingCompleted);
  const celebrationsEnabled = useSettingsStore((state) => state.celebrationsEnabled);
  const setCelebrationsEnabled = useSettingsStore((state) => state.setCelebrationsEnabled);
  const goals = useSettingsStore((state) => state.goals);
  const setGoals = useSettingsStore((state) => state.setGoals);
  const goalProgress = useSettingsStore((state) => state.goalProgress);
  const setGoalProgress = useSettingsStore((state) => state.setGoalProgress);
  const contacts = useSettingsStore((state) => state.contacts);
  const setContacts = useSettingsStore((state) => state.setContacts);
  const relapsePlan = useSettingsStore((state) => state.relapsePlan);
  const setRelapsePlan = useSettingsStore((state) => state.setRelapsePlan);
  const skillBuilding = useSettingsStore((state) => state.skillBuilding);
  const setSkillBuilding = useSettingsStore((state) => state.setSkillBuilding);
  const sleepEntries = useSettingsStore((state) => state.sleepEntries);
  const setSleepEntries = useSettingsStore((state) => state.setSleepEntries);
  const medications = useSettingsStore((state) => state.medications);
  const setMedications = useSettingsStore((state) => state.setMedications);
  const medicationLogs = useSettingsStore((state) => state.medicationLogs);
  const setMedicationLogs = useSettingsStore((state) => state.setMedicationLogs);
  const exerciseEntries = useSettingsStore((state) => state.exerciseEntries);
  const setExerciseEntries = useSettingsStore((state) => state.setExerciseEntries);
  const nutritionEntries = useSettingsStore((state) => state.nutritionEntries);
  const setNutritionEntries = useSettingsStore((state) => state.setNutritionEntries);
  const customQuotes = useSettingsStore((state) => state.customQuotes);
  const setCustomQuotes = useSettingsStore((state) => state.setCustomQuotes);
  const favoriteQuoteIds = useSettingsStore((state) => state.favoriteQuoteIds);
  const setFavoriteQuoteIds = useSettingsStore((state) => state.setFavoriteQuoteIds);
  const quoteSettings = useSettingsStore((state) => state.quoteSettings);
  const setQuoteSettings = useSettingsStore((state) => state.setQuoteSettings);

  // Quote helpers (temporary compatibility)
  const currentQuote = useMemo(() => getQuoteOfTheDay(), []);
  const refreshQuote = () => {
    // To be implemented with proper quote rotation
  };

  // Helper functions
  const addCustomQuote = (text: string, author?: string) => {
    const newQuote = {
      id: `custom-${Date.now()}`,
      text,
      author: author || 'You',
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
    useSettingsStore.getState().addCustomQuote(newQuote);
  };

  const removeQuote = (quoteId: string) => {
    useSettingsStore.getState().removeQuote(quoteId);
  };

  const toggleFavoriteQuote = (quoteId: string) => {
    useSettingsStore.getState().toggleFavoriteQuote(quoteId);
  };

  const getAvailableQuotes = () => {
    // Return all quotes (custom + default) minus disabled ones
    return [];
  };

  // Data refresh (no-op with Zustand - data is always fresh)
  const refreshData = async () => {
    // No-op - Zustand data is always current
  };

  // No loading state with Zustand
  const loading = false;

  return {
    // Recovery
    sobrietyDate,
    setSobrietyDate,
    relapses,
    setRelapses,
    cleanPeriods,
    setCleanPeriods,
    stepWork,
    setStepWork,
    reasonsForSobriety,
    setReasonsForSobriety,
    unlockedBadges,
    setUnlockedBadges,
    costPerDay,
    setCostPerDay,
    savingsGoal,
    setSavingsGoal,
    savingsGoalAmount,
    setSavingsGoalAmount,

    // Journal
    checkIns,
    setCheckIns,
    gratitude,
    setGratitude,
    growthLogs,
    setGrowthLogs,
    meetings,
    setMeetings,
    meditations,
    setMeditations,
    challenges,
    setChallenges,

    // Activities
    cravings,
    setCravings,
    events,
    setEvents,

    // Settings
    userProfile,
    setUserProfile,
    darkMode,
    setDarkMode,
    notificationSettings,
    setNotificationSettings,
    onboardingCompleted,
    setOnboardingCompleted,
    celebrationsEnabled,
    setCelebrationsEnabled,
    goals,
    setGoals,
    goalProgress,
    setGoalProgress,
    contacts,
    setContacts,
    relapsePlan,
    setRelapsePlan,
    skillBuilding,
    setSkillBuilding,
    sleepEntries,
    setSleepEntries,
    medications,
    setMedications,
    medicationLogs,
    setMedicationLogs,
    exerciseEntries,
    setExerciseEntries,
    nutritionEntries,
    setNutritionEntries,
    customQuotes,
    setCustomQuotes,
    favoriteQuoteIds,
    setFavoriteQuoteIds,
    quoteSettings,
    setQuoteSettings,

    // Helpers
    currentQuote,
    refreshQuote,
    addCustomQuote,
    removeQuote,
    toggleFavoriteQuote,
    getAvailableQuotes,
    refreshData,
    loading,
  };
}
