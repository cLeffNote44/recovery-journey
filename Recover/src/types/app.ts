// Core data types for Recover app

export interface HALTCheck {
  hungry: number;    // 1-10
  angry: number;     // 1-10
  lonely: number;    // 1-10
  tired: number;     // 1-10
}

export interface CheckIn {
  id: number;
  date: string;
  mood?: number;
  notes?: string;
  halt?: HALTCheck;  // Optional HALT assessment
}

export interface Meeting {
  id: number;
  date: string;
  type: string;
  location: string;
  notes?: string;
}

export interface GrowthLog {
  id: number;
  date: string;
  title: string;
  description: string;
}

export interface Challenge {
  id: number;
  date: string;
  situation: string;
  response: string;
  outcome: string;
}

export interface Gratitude {
  id: number;
  date: string;
  entry: string;
}

export interface Contact {
  id: number;
  name: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
}

export interface CalendarEvent {
  id: number;
  date: string;
  time?: string; // Format: "HH:mm" (24-hour)
  title: string;
  description?: string;
  type: 'meeting' | 'appointment' | 'reminder' | 'other';
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // e.g., every 2 weeks = interval: 2, frequency: 'weekly'
    endDate?: string; // Optional end date for recurrence
    daysOfWeek?: number[]; // For weekly recurring (0 = Sunday, 6 = Saturday)
    dayOfMonth?: number; // For monthly recurring (1-31)
    monthOfYear?: number; // For yearly recurring (1-12)
    excludedDates?: string[]; // Dates to skip (e.g., ["2025-01-15", "2025-01-22"])
  };
  reminders?: {
    minutes: number; // Minutes before event to remind (e.g., 15, 30, 60)
  }[];
  parentEventId?: number; // For recurring event instances, reference to original
  isRecurringInstance?: boolean; // Whether this is an instance of a recurring event
}

export interface Craving {
  id: number;
  date: string;
  intensity: number;
  trigger: string;
  triggerNotes?: string;
  copingStrategy?: string;
  overcame: boolean;
  halt?: HALTCheck;  // Optional HALT assessment before craving
}

export interface Meditation {
  id: number;
  date: string;
  duration: number;
  type: string;
  notes?: string;
}

export interface RelapsePlan {
  warningSigns: string[];
  highRiskSituations: string[];
  greenActions: string[];
  yellowActions: string[];
  redActions: string[];
}

export interface ReasonForSobriety {
  id: number;
  date: string;
  text: string;
}

export interface Quote {
  id: string;
  text: string;
  author?: string;
  category?: string;
  isFavorite?: boolean;
  isCustom?: boolean;
  createdAt?: string;
}

export interface QuoteSettings {
  refreshFrequency: 'hourly' | 'daily' | 'on-open';
  lastRefresh: string;
  disabledQuoteIds: string[]; // IDs of preloaded quotes to hide
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type?: 'checkins' | 'meditations' | 'cravings' | 'meetings' | 'gratitude' | 'streak' | 'growth-logs' | 'challenges';
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category?: 'recovery' | 'engagement' | 'wellness' | 'growth' | 'crisis' | 'special';
  secret?: boolean;
  earnedDate?: string;
}

export interface NotificationSettings {
  enabled: boolean;
  dailyReminderTime: string; // Format: "HH:mm" (24-hour)
  streakReminders: boolean;
  meetingReminders: boolean;
  milestoneNotifications: boolean;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  category: 'recovery' | 'wellness' | 'personal' | 'social';
  targetType: 'numerical' | 'yes-no' | 'streak';
  targetValue?: number;  // For numerical goals
  currentValue: number;  // Current progress
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'one-time';
  recurringDays?: number[]; // For weekly recurring (0 = Sunday, 6 = Saturday)
  recurringTime?: string; // Time for recurring goals (HH:mm format)
  startDate: string;
  endDate?: string;  // Optional end date
  completedDate?: string;  // When goal was completed
  isActive: boolean;  // Active goals show up in tracking
  isCompleted: boolean;
  streak?: number;  // For habit streak tracking
  lastUpdated?: string;  // Last time progress was updated
  reminderEnabled: boolean;
  addToCalendar: boolean; // Sync goal to calendar
  linkedCalendarEventId?: number; // ID of the calendar event created for this goal
  notes?: string;
}

export interface GoalProgress {
  goalId: number;
  date: string;
  value: number;  // Progress value for that day
  notes?: string;
}

export interface CopingSkillUsage {
  id: number;
  date: string;
  skillId: string;
  situation: string;
  effectiveness: number; // 1-10
  notes?: string;
}

export interface TriggerExerciseEntry {
  id: number;
  date: string;
  trigger: string;
  triggerIntensity: number; // 1-10
  thoughts: string;
  feelings: string;
  physicalSensations: string;
  urgeLevel: number; // 1-10
  copingStrategy: string;
  outcome: string;
  lessonsLearned?: string;
}

export interface MindfulnessChallenge {
  currentDay: number; // 0 = not started, 1-30 = current day
  startDate?: string;
  completedDays: number[]; // Array of completed day numbers
  lastCompletedDate?: string;
  notes: { [day: number]: string }; // Notes for each day
}

export interface ConnectionPromptEntry {
  id: number;
  date: string;
  promptId: string;
  response: string;
}

export interface ValuesClarificationEntry {
  id: number;
  date: string;
  value: string;
  importance: number; // 1-10
  alignment: number; // 1-10 - how well current life aligns
  notes?: string;
}

export interface SelfCompassionEntry {
  id: number;
  date: string;
  exerciseId: string;
  reflection: string;
}

export interface SkillBuilding {
  mindfulnessChallenge: MindfulnessChallenge;
  copingSkillUsage: CopingSkillUsage[];
  triggerExercises: TriggerExerciseEntry[];
  connectionPrompts: ConnectionPromptEntry[];
  valuesClarification: ValuesClarificationEntry[];
  selfCompassion: SelfCompassionEntry[];
}

export interface SleepEntry {
  id: number;
  date: string;
  hoursSlept: number; // Decimal value (e.g., 7.5)
  quality: number; // 1-10 rating
  bedTime?: string; // HH:mm format
  wakeTime?: string; // HH:mm format
  notes?: string;
  dreams?: string;
  disturbances?: string[]; // e.g., ['nightmares', 'woke up frequently', 'insomnia']
}

export interface Medication {
  id: number;
  name: string;
  dosage: string; // e.g., "10mg", "2 pills"
  frequency: 'as-needed' | 'daily' | 'twice-daily' | 'three-times-daily' | 'weekly' | 'custom';
  customFrequency?: string; // For custom schedules
  times?: string[]; // Specific times to take (HH:mm format)
  startDate: string;
  endDate?: string;
  prescribedBy?: string; // Doctor name
  purpose: string; // e.g., "anxiety", "sleep", "blood pressure"
  refillDate?: string;
  refillReminder: boolean;
  isActive: boolean;
  notes?: string;
  sideEffects?: string[];
}

export interface MedicationLog {
  id: number;
  medicationId: number;
  date: string;
  time: string; // HH:mm format
  taken: boolean;
  skippedReason?: string;
  sideEffects?: string[];
  notes?: string;
}

export interface ExerciseEntry {
  id: number;
  date: string;
  type: string; // e.g., 'running', 'yoga', 'weightlifting', 'walking'
  duration: number; // minutes
  intensity: number; // 1-10
  caloriesBurned?: number;
  distance?: number; // miles or km
  distanceUnit?: 'miles' | 'km';
  heartRate?: number; // average BPM
  notes?: string;
  mood?: number; // 1-10 - how they felt after
}

export interface NutritionEntry {
  id: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time?: string; // HH:mm format
  description: string;
  calories?: number;
  waterIntake?: number; // oz or ml
  waterUnit?: 'oz' | 'ml';
  nutritionQuality: number; // 1-10 self-rating
  portionSize?: 'small' | 'medium' | 'large' | 'extra-large';
  emotionalEating?: boolean;
  notes?: string;
}

export interface Relapse {
  id: number;
  date: string;
  time?: string; // HH:mm format
  substance?: string; // What substance (optional - user may want privacy)
  triggers: string[]; // What led to it
  circumstances: string; // Detailed description of what happened
  emotions: string[]; // How they were feeling
  thoughts: string; // Thought patterns before relapse
  consequences: string; // What happened after
  lessonsLearned: string; // What they learned from this
  preventionPlan: string; // What they'll do differently next time
  supportUsed: string[]; // What support they tried (or didn't)
  severity: number; // 1-10 self-rating
  daysCleanBefore: number; // How many days clean before this
  isPrivate: boolean; // Whether to hide details in exports/shares
}

export interface CleanPeriod {
  id: number;
  startDate: string;
  endDate?: string; // null if current period
  daysClean: number;
  relapseId?: number; // ID of relapse that ended this period
  notes?: string;
}

export interface UserProfile {
  name: string;
  dateOfBirth: string;
  sobrietyDate: string;
  createdAt: string;
}

export interface AppData {
  userProfile: UserProfile | null;
  sobrietyDate: string;
  checkIns: CheckIn[];
  meetings: Meeting[];
  growthLogs: GrowthLog[];
  challenges: Challenge[];
  gratitude: Gratitude[];
  contacts: Contact[];
  events: CalendarEvent[];
  cravings: Craving[];
  meditations: Meditation[];
  relapsePlan: RelapsePlan;
  darkMode: boolean;
  costPerDay: number;
  savingsGoal: string;
  savingsGoalAmount: number;
  reasonsForSobriety: ReasonForSobriety[];
  unlockedBadges: string[];
  notificationSettings: NotificationSettings;
  onboardingCompleted: boolean;
  celebrationsEnabled: boolean;
  goals: Goal[];
  goalProgress: GoalProgress[];
  customQuotes: Quote[];
  favoriteQuoteIds: string[];
  quoteSettings: QuoteSettings;
  skillBuilding: SkillBuilding;
  sleepEntries: SleepEntry[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  exerciseEntries: ExerciseEntry[];
  nutritionEntries: NutritionEntry[];
  relapses: Relapse[];
  cleanPeriods: CleanPeriod[];
  stepWork: StepWorkProgress;
}

export const MEDITATION_TYPES = [
  'Mindfulness',
  'Guided Meditation',
  'Breathing Exercise',
  'Body Scan',
  'Loving-Kindness',
  'Visualization',
  'Walking Meditation',
  'Mantra',
  'Other'
] as const;

export const TRIGGER_TYPES = [
  'Stress',
  'Boredom',
  'Social Situation',
  'Loneliness',
  'Anger',
  'Celebration',
  'Sadness',
  'Physical Pain',
  'Seeing Substance',
  'Old Habits',
  'Other'
] as const;

export const EVENT_TYPES = [
  'meeting',
  'appointment',
  'reminder',
  'other'
] as const;

export const RELAPSE_TRIGGERS = [
  'Stress',
  'Anxiety',
  'Depression',
  'Loneliness',
  'Boredom',
  'Social Pressure',
  'Celebration',
  'Anger',
  'Relationship Issues',
  'Work Stress',
  'Financial Problems',
  'Physical Pain',
  'Seeing Substance',
  'Old Habits/Routine',
  'Overconfidence',
  'Complacency',
  'Other'
] as const;

export const RELAPSE_EMOTIONS = [
  'Shame',
  'Guilt',
  'Sadness',
  'Anger',
  'Frustration',
  'Hopelessness',
  'Anxiety',
  'Fear',
  'Loneliness',
  'Emptiness',
  'Overwhelmed',
  'Numb',
  'Relief',
  'Regret',
  'Other'
] as const;

export const SUPPORT_TYPES = [
  'Called sponsor',
  'Attended meeting',
  'Talked to friend/family',
  'Used coping skills',
  'Practiced mindfulness',
  'Exercise',
  'Journaling',
  'Reached out for help',
  'None - isolated',
  'Other'
] as const;

export type MeditationType = typeof MEDITATION_TYPES[number];
export type TriggerType = typeof TRIGGER_TYPES[number];
export type EventType = typeof EVENT_TYPES[number];
export type RelapseTrigger = typeof RELAPSE_TRIGGERS[number];
export type RelapseEmotion = typeof RELAPSE_EMOTIONS[number];
export type SupportType = typeof SUPPORT_TYPES[number];

// Step Work Tracking
export interface StepWorkEntry {
  stepNumber: number; // 1-12
  status: 'not-started' | 'in-progress' | 'completed';
  startDate?: string;
  completedDate?: string;
  notes: string;
  reflections: StepReflection[];
  exercises: StepExercise[];
}

export interface StepReflection {
  id: number;
  date: string;
  content: string;
  promptId?: string; // Reference to specific step prompt
}

export interface StepExercise {
  id: number;
  date: string;
  exerciseType: string; // e.g., "inventory", "amends-list", "meditation"
  description: string;
  completed: boolean;
  completedDate?: string;
  notes?: string;
}

export interface StepWorkProgress {
  currentStep: number; // 1-12
  steps: StepWorkEntry[];
  sponsorNotes?: string;
  lastReviewDate?: string;
}

export const TWELVE_STEPS = [
  {
    number: 1,
    title: "Powerlessness",
    text: "We admitted we were powerless over our addiction—that our lives had become unmanageable.",
    shortText: "Admitted powerlessness"
  },
  {
    number: 2,
    title: "Hope",
    text: "Came to believe that a Power greater than ourselves could restore us to sanity.",
    shortText: "Came to believe"
  },
  {
    number: 3,
    title: "Surrender",
    text: "Made a decision to turn our will and our lives over to the care of God as we understood Him.",
    shortText: "Made a decision"
  },
  {
    number: 4,
    title: "Inventory",
    text: "Made a searching and fearless moral inventory of ourselves.",
    shortText: "Moral inventory"
  },
  {
    number: 5,
    title: "Confession",
    text: "Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.",
    shortText: "Admitted wrongs"
  },
  {
    number: 6,
    title: "Willingness",
    text: "Were entirely ready to have God remove all these defects of character.",
    shortText: "Ready for change"
  },
  {
    number: 7,
    title: "Humility",
    text: "Humbly asked Him to remove our shortcomings.",
    shortText: "Asked for removal"
  },
  {
    number: 8,
    title: "Amends List",
    text: "Made a list of all persons we had harmed, and became willing to make amends to them all.",
    shortText: "Made a list"
  },
  {
    number: 9,
    title: "Making Amends",
    text: "Made direct amends to such people wherever possible, except when to do so would injure them or others.",
    shortText: "Made amends"
  },
  {
    number: 10,
    title: "Continued Inventory",
    text: "Continued to take personal inventory and when we were wrong promptly admitted it.",
    shortText: "Personal inventory"
  },
  {
    number: 11,
    title: "Prayer & Meditation",
    text: "Sought through prayer and meditation to improve our conscious contact with God as we understood Him, praying only for knowledge of His will for us and the power to carry that out.",
    shortText: "Prayer & meditation"
  },
  {
    number: 12,
    title: "Service",
    text: "Having had a spiritual awakening as the result of these steps, we tried to carry this message to addicts, and to practice these principles in all our affairs.",
    shortText: "Carry the message"
  }
] as const;

