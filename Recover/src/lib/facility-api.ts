/**
 * Facility API Client
 *
 * Handles all communication with the facility backend for:
 * - Patient registration/authentication using registration keys
 * - Syncing check-ins, cravings, and goals with the facility
 * - Messaging with counselors
 * - Fetching treatment plans
 */

import { useFacilityStore } from '@/stores/useFacilityStore';
import type {
  FacilityMessage,
  TreatmentPlan,
  FacilityConnection,
} from '@/stores/useFacilityStore';
import type { CheckIn, Craving, Goal, GoalProgress } from '@/types/app';
import {
  enqueue,
  dequeue,
  markFailed,
  getQueue,
  isReadyForRetry,
  type SyncItemType,
} from '@/lib/sync-queue';

// API Configuration - requires VITE_FACILITY_API_URL in production
const getApiUrl = (): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_FACILITY_API_URL) {
    return import.meta.env.VITE_FACILITY_API_URL;
  }
  if (import.meta.env?.PROD) {
    throw new Error(
      'VITE_FACILITY_API_URL environment variable is required in production. ' +
      'Set it to your backend API URL (e.g. https://api.recoveryjourney.app/api/v1).'
    );
  }
  console.warn('[Facility API] VITE_FACILITY_API_URL not set, using localhost fallback (dev only)');
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiUrl();

// Types for API responses
interface AuthResponse {
  success: boolean;
  accessToken: string;
  deviceToken: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    sobrietyDate: string;
    facilityName: string;
    counselorName: string | null;
  };
}

interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}

// Helper to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const store = useFacilityStore.getState();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (store.accessToken) {
    headers['Authorization'] = `Bearer ${store.accessToken}`;
  }

  return headers;
};

// Helper to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      error: 'Unknown error',
      message: response.statusText,
      statusCode: response.status,
    }));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  return response.json();
};

// Token refresh helper
const refreshTokenIfNeeded = async (): Promise<boolean> => {
  const store = useFacilityStore.getState();

  if (!store.isTokenExpired()) {
    return true;
  }

  if (!store.refreshToken) {
    return false;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/sync/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: store.refreshToken }),
    });

    if (!response.ok) {
      store.disconnect();
      return false;
    }

    const data = await response.json();
    store.updateTokens(data.accessToken, data.refreshToken, data.expiresIn);
    return true;
  } catch {
    store.disconnect();
    return false;
  }
};

// Authenticated fetch wrapper
const authFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Check and refresh token if needed
  const tokenValid = await refreshTokenIfNeeded();
  if (!tokenValid) {
    throw new Error('Session expired. Please reconnect to your facility.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  return handleResponse<T>(response);
};

// ============================================================================
// AUTHENTICATION
// ============================================================================

/**
 * Generate a unique device ID for this installation
 */
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('facility_device_id');
  if (!deviceId) {
    deviceId = `web_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('facility_device_id', deviceId);
  }
  return deviceId;
};

/**
 * Register/authenticate with a facility using a registration key
 */
export const validateRegistrationKey = async (
  registrationKey: string
): Promise<{
  success: boolean;
  connection?: FacilityConnection;
  error?: string;
}> => {
  try {
    const deviceId = getDeviceId();

    const response = await fetch(`${API_BASE_URL}/auth/patient/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        registrationKey,
        deviceId,
        deviceName: navigator.userAgent.substring(0, 50),
        platform: 'web',
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Invalid registration key' }));
      return { success: false, error: error.message };
    }

    const data: AuthResponse = await response.json();

    // Store device token for future auth
    localStorage.setItem('facility_device_token', data.deviceToken);

    // Create connection object
    const connection: FacilityConnection = {
      facilityId: '', // Not returned directly, but stored in JWT
      facilityName: data.patient.facilityName,
      patientId: data.patient.id,
      counselorId: undefined, // Would need to fetch separately
      counselorName: data.patient.counselorName || undefined,
      connectedAt: new Date().toISOString(),
    };

    // Store connection and tokens
    // Note: This API doesn't return refresh token, so we use deviceToken for re-auth
    const store = useFacilityStore.getState();
    store.connect(connection, data.accessToken, data.deviceToken, 3600); // 1 hour default

    return { success: true, connection };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
};

/**
 * Disconnect from facility
 */
export const disconnectFromFacility = async (): Promise<void> => {
  const store = useFacilityStore.getState();

  // Try to logout on server (best effort)
  if (store.accessToken) {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ refreshToken: store.refreshToken }),
      });
    } catch {
      // Ignore logout errors
    }
  }

  store.disconnect();
};

// ============================================================================
// SYNC OPERATIONS
// ============================================================================

/**
 * Sync check-ins with facility. Queues for retry on failure.
 */
export const syncCheckIns = async (
  checkIns: CheckIn[]
): Promise<{ success: boolean; syncedCount: number; error?: string }> => {
  if (checkIns.length === 0) return { success: true, syncedCount: 0 };
  try {
    const response = await authFetch<{ syncedCount: number }>('/sync/check-ins', {
      method: 'POST',
      body: JSON.stringify({ checkIns }),
    });

    return { success: true, syncedCount: response.syncedCount };
  } catch (error) {
    enqueue('check-ins', { checkIns });
    return {
      success: false,
      syncedCount: 0,
      error: error instanceof Error ? error.message : 'Sync failed',
    };
  }
};

/**
 * Sync cravings with facility. Queues for retry on failure.
 */
export const syncCravings = async (
  cravings: Craving[]
): Promise<{ success: boolean; syncedCount: number; error?: string }> => {
  if (cravings.length === 0) return { success: true, syncedCount: 0 };
  try {
    const response = await authFetch<{ syncedCount: number }>('/sync/cravings', {
      method: 'POST',
      body: JSON.stringify({ cravings }),
    });

    return { success: true, syncedCount: response.syncedCount };
  } catch (error) {
    enqueue('cravings', { cravings });
    return {
      success: false,
      syncedCount: 0,
      error: error instanceof Error ? error.message : 'Sync failed',
    };
  }
};

/**
 * Sync goals with facility. Queues for retry on failure.
 */
export const syncGoals = async (
  goals: Goal[],
  progress: GoalProgress[]
): Promise<{ success: boolean; syncedCount: number; error?: string }> => {
  if (goals.length === 0) return { success: true, syncedCount: 0 };
  try {
    const response = await authFetch<{ syncedCount: number }>('/sync/goals', {
      method: 'POST',
      body: JSON.stringify({ goals, progress }),
    });

    return { success: true, syncedCount: response.syncedCount };
  } catch (error) {
    enqueue('goals', { goals, progress });
    return {
      success: false,
      syncedCount: 0,
      error: error instanceof Error ? error.message : 'Sync failed',
    };
  }
};

/**
 * Full sync - sends all recent data to facility
 */
export const performFullSync = async (data: {
  checkIns: CheckIn[];
  cravings: Craving[];
  goals: Goal[];
  goalProgress: GoalProgress[];
}): Promise<{ success: boolean; error?: string }> => {
  const store = useFacilityStore.getState();

  store.setSyncStatus({ syncInProgress: true, lastSyncError: undefined });

  try {
    // Sync all data types in parallel
    const [checkInsResult, cravingsResult, goalsResult] = await Promise.all([
      syncCheckIns(data.checkIns),
      syncCravings(data.cravings),
      syncGoals(data.goals, data.goalProgress),
    ]);

    // Check for any failures
    const errors = [
      !checkInsResult.success && checkInsResult.error,
      !cravingsResult.success && cravingsResult.error,
      !goalsResult.success && goalsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      store.setSyncStatus({
        syncInProgress: false,
        lastSyncError: errors.join('; '),
      });
      return { success: false, error: errors.join('; ') };
    }

    store.clearPendingSync();
    store.setSyncStatus({ syncInProgress: false });
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Sync failed';
    store.setSyncStatus({
      syncInProgress: false,
      lastSyncError: errorMessage,
    });
    return { success: false, error: errorMessage };
  }
};

// ============================================================================
// MESSAGES
// ============================================================================

/**
 * Fetch messages from facility
 */
export const fetchMessages = async (): Promise<{
  success: boolean;
  messages?: FacilityMessage[];
  error?: string;
}> => {
  try {
    const response = await authFetch<{ messages: any[] }>('/messages/patient/inbox');

    // Transform to our message format
    const messages: FacilityMessage[] = response.messages.map((msg) => ({
      id: msg.id,
      senderId: msg.staffId || msg.patientId,
      senderType: msg.staffId ? 'staff' : 'patient',
      senderName: msg.staff
        ? `${msg.staff.firstName} ${msg.staff.lastName}`
        : 'You',
      content: msg.content,
      messageType: msg.messageType?.toLowerCase() || 'general',
      priority: msg.priority?.toLowerCase() || 'normal',
      isRead: msg.isRead || false,
      createdAt: msg.createdAt,
    }));

    useFacilityStore.getState().setMessages(messages);

    return { success: true, messages };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch messages',
    };
  }
};

/**
 * Send a message to counselor
 */
export const sendMessage = async (
  content: string,
  messageType: 'general' | 'check_in' | 'alert' = 'general',
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<{ success: boolean; message?: FacilityMessage; error?: string }> => {
  const store = useFacilityStore.getState();

  try {
    // The patient/send endpoint automatically sends to assigned counselor.
    // The backend treats an URGENT priority as a crisis escalation and raises
    // it as a patient.alert on the clinician side.
    const response = await authFetch<{ message: any }>('/messages/patient/send', {
      method: 'POST',
      body: JSON.stringify({ content, priority: priority.toUpperCase() }),
    });

    const message: FacilityMessage = {
      id: response.message.id,
      senderId: store.connection?.patientId || '',
      senderType: 'patient',
      senderName: 'You',
      content: response.message.content,
      messageType,
      priority,
      isRead: true,
      createdAt: response.message.createdAt,
    };

    store.addMessage(message);

    return { success: true, message };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message',
    };
  }
};

/**
 * Send an urgent crisis escalation ("I need help now") to the patient's
 * counselor. Distinct from a normal message: the backend raises it as a
 * critical patient.alert in the clinician dashboard's alert triage, not just
 * the chat thread. The phone-based crisis lines (988, etc.) remain the
 * offline-safe primary path; this notifies the patient's own care team.
 */
export const sendCounselorAlert = async (
  note?: string
): Promise<{ success: boolean; message?: FacilityMessage; error?: string }> => {
  const trimmed = note?.trim();
  const content = trimmed ? `I need help now. ${trimmed}` : 'I need help now.';
  return sendMessage(content, 'alert', 'urgent');
};

/**
 * Mark a message as read
 * Note: Messages are automatically marked as read when fetching inbox
 */
export const markMessageAsRead = async (
  messageId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Just update local state - server marks messages read on fetch
    useFacilityStore.getState().markMessageRead(messageId);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark message as read',
    };
  }
};

// ============================================================================
// TREATMENT PLAN
// ============================================================================

/**
 * Fetch treatment plan from facility
 */
export const fetchTreatmentPlan = async (): Promise<{
  success: boolean;
  plan?: TreatmentPlan;
  error?: string;
}> => {
  try {
    const response = await authFetch<{ plan: any }>('/sync/treatment-plan');

    if (!response.plan) {
      return { success: true, plan: undefined };
    }

    const plan: TreatmentPlan = {
      id: response.plan.id,
      title: response.plan.title,
      description: response.plan.description,
      status: response.plan.status?.toLowerCase() || 'active',
      startDate: response.plan.startDate,
      targetEndDate: response.plan.targetEndDate,
      phases: (response.plan.phases || []).map((phase: any) => ({
        id: phase.id,
        name: phase.name,
        description: phase.description,
        startDate: phase.startDate,
        targetEndDate: phase.targetEndDate,
        status: phase.status?.toLowerCase() || 'not_started',
        goals: (phase.goals || []).map((goal: any) => ({
          id: goal.id,
          description: goal.description,
          targetDate: goal.targetDate,
          status: goal.status?.toLowerCase() || 'pending',
          progress: goal.progress,
          notes: goal.notes,
        })),
      })),
      updatedAt: response.plan.updatedAt,
    };

    useFacilityStore.getState().setTreatmentPlan(plan);

    return { success: true, plan };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch treatment plan',
    };
  }
};

// ============================================================================
// PROFILE
// ============================================================================

/**
 * Fetch patient profile from facility
 */
export const fetchProfile = async (): Promise<{
  success: boolean;
  profile?: {
    firstName: string;
    lastName: string;
    sobrietyDate?: string;
    admissionDate?: string;
    counselorName?: string;
    facilityName: string;
  };
  error?: string;
}> => {
  try {
    const response = await authFetch<{ patient: any; facility: any; counselor: any }>(
      '/sync/profile'
    );

    return {
      success: true,
      profile: {
        firstName: response.patient.firstName,
        lastName: response.patient.lastName,
        sobrietyDate: response.patient.sobrietyDate,
        admissionDate: response.patient.admissionDate,
        counselorName: response.counselor
          ? `${response.counselor.firstName} ${response.counselor.lastName}`
          : undefined,
        facilityName: response.facility.name,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch profile',
    };
  }
};

// ============================================================================
// CONNECTION CHECK
// ============================================================================

/**
 * Check if facility connection is healthy
 */
export const checkConnection = async (): Promise<boolean> => {
  const store = useFacilityStore.getState();

  if (!store.isConnected || !store.accessToken) {
    return false;
  }

  try {
    const tokenValid = await refreshTokenIfNeeded();
    return tokenValid;
  } catch {
    return false;
  }
};

/**
 * Get facility API base URL (useful for WebSocket connections)
 */
export const getFacilityApiUrl = (): string => API_BASE_URL;

// ============================================================================
// OFFLINE SYNC QUEUE
// ============================================================================

const syncEndpoints: Record<SyncItemType, string> = {
  'check-ins': '/sync/check-ins',
  'cravings': '/sync/cravings',
  'goals': '/sync/goals',
};

/**
 * Process the offline sync queue — retries failed items with exponential backoff.
 * Call this when the app regains connectivity or on a periodic timer.
 * Returns the number of items successfully synced.
 */
export const processSyncQueue = async (): Promise<{
  processed: number;
  remaining: number;
  errors: string[];
}> => {
  const store = useFacilityStore.getState();
  if (!store.isConnected || !store.accessToken) {
    return { processed: 0, remaining: getQueue().length, errors: [] };
  }

  const queue = getQueue();
  const readyItems = queue.filter(isReadyForRetry);

  if (readyItems.length === 0) {
    return { processed: 0, remaining: queue.length, errors: [] };
  }

  let processed = 0;
  const errors: string[] = [];

  for (const item of readyItems) {
    const endpoint = syncEndpoints[item.type];
    try {
      await authFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(item.payload),
      });
      dequeue(item.id);
      processed++;
    } catch (error) {
      markFailed(item.id);
      errors.push(
        `${item.type}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  const remaining = getQueue().length;

  if (processed > 0 && remaining === 0) {
    store.clearPendingSync();
  }

  return { processed, remaining, errors };
};

/**
 * Get the number of items waiting in the sync queue.
 */
export { getPendingCount as getSyncQueueSize } from '@/lib/sync-queue';

// ─── Auto-retry on reconnect ────────────────────────────────────────────────

let retryInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Start periodic queue processing (call on app mount or reconnect).
 * Processes every 30 seconds while there are queued items.
 */
export const startSyncQueueProcessor = (): void => {
  if (retryInterval) return; // Already running

  retryInterval = setInterval(async () => {
    const { remaining } = await processSyncQueue();
    if (remaining === 0 && retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
  }, 30_000);
};

/**
 * Stop the queue processor (call on disconnect or app unmount).
 */
export const stopSyncQueueProcessor = (): void => {
  if (retryInterval) {
    clearInterval(retryInterval);
    retryInterval = null;
  }
};
