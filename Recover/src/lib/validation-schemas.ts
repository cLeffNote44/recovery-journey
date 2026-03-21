/**
 * Centralized Zod Validation Schemas
 *
 * Provides type-safe form validation for all app forms
 */

import { z } from 'zod';

/**
 * Setback/Relapse Form Schema
 */
export const setbackSchema = z.object({
  type: z.enum(['slip', 'relapse']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  duration: z.string().optional(),
  trigger: z.string().optional(),
  customTrigger: z.string().optional(),
  whatHappened: z.string().min(1, 'Please describe what happened'),
  whatLearned: z.string().optional(),
  copingStrategies: z.string().optional(),
  supportUsed: z.string().optional(),
  continuingRecovery: z.boolean().default(true)
});

export type SetbackFormData = z.infer<typeof setbackSchema>;

/**
 * Relapse Entry Schema (for Journal/Relapse Tracker)
 */
export const relapseEntrySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().optional(),
  substance: z.string().optional(),
  triggers: z.string().min(1, 'Please enter triggers'),
  circumstances: z.string().min(1, 'Please describe circumstances'),
  emotions: z.string().min(1, 'Please describe emotions'),
  thoughts: z.string().min(1, 'Please describe thoughts'),
  consequences: z.string().optional(),
  lessonsLearned: z.string().min(1, 'Please enter lessons learned'),
  preventionPlan: z.string().min(1, 'Please enter prevention plan'),
  supportUsed: z.string().optional(),
  severity: z.enum(['minor', 'moderate', 'severe']),
  isPrivate: z.boolean().default(false)
});

export type RelapseEntryFormData = z.infer<typeof relapseEntrySchema>;

/**
 * Goal Form Schema
 */
export const goalSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  description: z.string().default(''),
  category: z.enum(['recovery', 'wellness', 'personal', 'social']),
  targetType: z.enum(['numerical', 'yes-no', 'streak']),
  targetValue: z.number().min(1).optional(),
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'one-time']),
  recurringDays: z.array(z.number().min(0).max(6)).optional(),
  recurringTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format').optional(),
  reminderEnabled: z.boolean().default(false),
  addToCalendar: z.boolean().default(false)
}).refine(
  (data) => {
    // If targetType is numerical or streak, targetValue is required
    if ((data.targetType === 'numerical' || data.targetType === 'streak') && !data.targetValue) {
      return false;
    }
    return true;
  },
  {
    message: 'Target value is required for numerical and streak goals',
    path: ['targetValue']
  }
).refine(
  (data) => {
    // If frequency is weekly and addToCalendar is true, recurringDays must have at least one day
    if (data.frequency === 'weekly' && data.addToCalendar && (!data.recurringDays || data.recurringDays.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: 'Please select at least one day for weekly recurring goals',
    path: ['recurringDays']
  }
);

export type GoalFormData = z.infer<typeof goalSchema>;

/**
 * Check-in Form Schema
 */
export const checkInSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  mood: z.number().min(1).max(10),
  cravingLevel: z.number().min(0).max(10),
  sleepHours: z.number().min(0).max(24).optional(),
  exerciseMinutes: z.number().min(0).optional(),
  meditationMinutes: z.number().min(0).optional(),
  socialConnection: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
  grateful: z.string().optional(),
  triggers: z.array(z.string()).optional(),
  copingStrategies: z.array(z.string()).optional()
});

export type CheckInFormData = z.infer<typeof checkInSchema>;

/**
 * PIN Validation Schema
 */
export const pinSchema = z.object({
  pin: z.string()
    .length(4, 'PIN must be exactly 4 digits')
    .regex(/^\d{4}$/, 'PIN must contain only numbers'),
  confirmPin: z.string().optional()
}).refine(
  (data) => !data.confirmPin || data.pin === data.confirmPin,
  {
    message: 'PINs do not match',
    path: ['confirmPin']
  }
);

export type PinFormData = z.infer<typeof pinSchema>;

/**
 * HALT Check Form Schema
 */
export const haltCheckSchema = z.object({
  hungry: z.number().min(0).max(10),
  angry: z.number().min(0).max(10),
  lonely: z.number().min(0).max(10),
  tired: z.number().min(0).max(10),
  notes: z.string().optional(),
  actionsTaken: z.array(z.string()).optional()
});

export type HaltCheckFormData = z.infer<typeof haltCheckSchema>;

/**
 * Trigger Exercise Schema
 */
export const triggerExerciseSchema = z.object({
  trigger: z.string().min(1, 'Trigger description is required'),
  triggerIntensity: z.number().min(1).max(10),
  thoughts: z.string().min(1, 'Thoughts are required'),
  feelings: z.string().min(1, 'Feelings are required'),
  physicalSensations: z.string().default(''),
  urgeLevel: z.number().min(1).max(10),
  copingStrategy: z.string().min(1, 'Coping strategy is required'),
  outcome: z.string().min(1, 'Outcome is required'),
  lessonsLearned: z.string().optional()
});

export type TriggerExerciseFormData = z.infer<typeof triggerExerciseSchema>;

/**
 * Self-Compassion Entry Schema
 */
export const selfCompassionSchema = z.object({
  situation: z.string().min(1, 'Situation is required'),
  selfCriticismThoughts: z.string().default(''),
  compassionateResponse: z.string().min(1, 'Compassionate response is required')
});

export type SelfCompassionFormData = z.infer<typeof selfCompassionSchema>;

/**
 * Connection Building Schema
 */
export const connectionBuildingSchema = z.object({
  promptText: z.string().min(1, 'Prompt text is required'),
  response: z.string().min(1, 'Response is required'),
  personInvolved: z.string().default(''),
  reflections: z.string().default('')
});

export type ConnectionBuildingFormData = z.infer<typeof connectionBuildingSchema>;

/**
 * Contact Form Schema
 */
export const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  notes: z.string().optional(),
  isEmergency: z.boolean().default(false),
  isSponsor: z.boolean().default(false)
});

export type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Gratitude Entry Schema
 */
export const gratitudeSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  entry: z.string().min(1, 'Gratitude entry is required'),
  category: z.enum(['people', 'experiences', 'progress', 'health', 'other']).optional()
});

export type GratitudeFormData = z.infer<typeof gratitudeSchema>;

/**
 * Growth Log Schema
 */
export const growthLogSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.enum(['insight', 'achievement', 'challenge', 'lesson', 'other']),
  emotionalImpact: z.number().min(1).max(10).optional()
});

export type GrowthLogFormData = z.infer<typeof growthLogSchema>;

/**
 * Meeting Log Schema
 */
export const meetingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().optional(),
  type: z.string().min(1, 'Meeting type is required'),
  location: z.string().optional(),
  duration: z.number().min(1, 'Duration is required (in minutes)'),
  notes: z.string().optional(),
  keyTakeaways: z.string().optional(),
  speakerHighlights: z.string().optional()
});

export type MeetingFormData = z.infer<typeof meetingSchema>;

/**
 * Meditation Log Schema
 */
export const meditationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  duration: z.number().min(1, 'Duration is required (in minutes)'),
  type: z.string().min(1, 'Meditation type is required'),
  mood: z.number().min(1).max(10),
  notes: z.string().optional()
});

export type MeditationFormData = z.infer<typeof meditationSchema>;

/**
 * Craving Log Schema
 */
export const cravingSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  time: z.string().optional(),
  intensity: z.number().min(1).max(10),
  trigger: z.string().min(1, 'Trigger is required'),
  copingStrategy: z.string().optional(),
  outcome: z.enum(['resisted', 'gave-in', 'in-progress']),
  notes: z.string().optional()
});

export type CravingFormData = z.infer<typeof cravingSchema>;

/**
 * Helper function to safely validate form data
 */
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Convert Zod errors to field-based error object
  const errors: Record<string, string> = {};
  result.error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path] = err.message;
  });

  return { success: false, errors };
}

/**
 * Helper function to validate and show toast errors
 */
export function validateFormWithToast<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  toast: { error: (message: string) => void }
): T | null {
  const result = validateForm(schema, data);

  if (!result.success) {
    // Show first error
    const firstError = Object.values(result.errors)[0];
    if (firstError) {
      toast.error(firstError);
    }
    return null;
  }

  return result.data;
}
