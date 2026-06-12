/**
 * Facility Store
 *
 * Manages facility connection state for patients linked to a recovery facility.
 * This store handles authentication with the facility backend, syncing progress data,
 * and managing communication with counselors.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createEncryptedStorage } from '@/lib/encrypted-storage';

export interface FacilityConnection {
  facilityId: string;
  facilityName: string;
  patientId: string;
  counselorId?: string;
  counselorName?: string;
  connectedAt: string;
}

export interface FacilityMessage {
  id: string;
  senderId: string;
  senderType: 'staff' | 'patient';
  senderName: string;
  content: string;
  messageType: 'general' | 'check_in' | 'alert' | 'appointment';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
}

export interface TreatmentPlanPhase {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  targetEndDate?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  goals: TreatmentGoal[];
}

export interface TreatmentGoal {
  id: string;
  description: string;
  targetDate?: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress?: number;
  notes?: string;
}

export interface TreatmentPlan {
  id: string;
  title: string;
  description?: string;
  status: 'draft' | 'active' | 'completed' | 'on_hold';
  startDate: string;
  targetEndDate?: string;
  phases: TreatmentPlanPhase[];
  updatedAt: string;
}

export interface SyncStatus {
  lastSyncAt?: string;
  syncInProgress: boolean;
  lastSyncError?: string;
  pendingCheckIns: number;
  pendingCravings: number;
}

interface FacilityState {
  // Connection state
  isConnected: boolean;
  connection: FacilityConnection | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: string | null;

  // Data
  messages: FacilityMessage[];
  treatmentPlan: TreatmentPlan | null;
  unreadMessageCount: number;

  // Sync state
  syncStatus: SyncStatus;

  // Actions - Connection
  connect: (connection: FacilityConnection, accessToken: string, refreshToken: string, expiresIn: number) => void;
  disconnect: () => void;
  updateTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  isTokenExpired: () => boolean;

  // Actions - Messages
  setMessages: (messages: FacilityMessage[]) => void;
  addMessage: (message: FacilityMessage) => void;
  markMessageRead: (messageId: string) => void;
  updateUnreadCount: () => void;

  // Actions - Treatment Plan
  setTreatmentPlan: (plan: TreatmentPlan | null) => void;

  // Actions - Sync
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  incrementPendingCheckIns: () => void;
  incrementPendingCravings: () => void;
  clearPendingSync: () => void;
}

export const useFacilityStore = create<FacilityState>()(
  persist(
    (set, get) => ({
      // Initial state
      isConnected: false,
      connection: null,
      accessToken: null,
      refreshToken: null,
      tokenExpiresAt: null,
      messages: [],
      treatmentPlan: null,
      unreadMessageCount: 0,
      syncStatus: {
        syncInProgress: false,
        pendingCheckIns: 0,
        pendingCravings: 0,
      },

      // Connection actions
      connect: (connection, accessToken, refreshToken, expiresIn) => {
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        set({
          isConnected: true,
          connection,
          accessToken,
          refreshToken,
          tokenExpiresAt: expiresAt,
        });
      },

      disconnect: () => {
        set({
          isConnected: false,
          connection: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiresAt: null,
          messages: [],
          treatmentPlan: null,
          unreadMessageCount: 0,
          syncStatus: {
            syncInProgress: false,
            pendingCheckIns: 0,
            pendingCravings: 0,
          },
        });
      },

      updateTokens: (accessToken, refreshToken, expiresIn) => {
        const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();
        set({
          accessToken,
          refreshToken,
          tokenExpiresAt: expiresAt,
        });
      },

      isTokenExpired: () => {
        const { tokenExpiresAt } = get();
        if (!tokenExpiresAt) return true;
        // Consider expired if less than 5 minutes remain
        return new Date(tokenExpiresAt).getTime() - Date.now() < 5 * 60 * 1000;
      },

      // Message actions
      setMessages: (messages) => {
        set({ messages });
        get().updateUnreadCount();
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [message, ...state.messages],
        }));
        get().updateUnreadCount();
      },

      markMessageRead: (messageId) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId ? { ...msg, isRead: true } : msg
          ),
        }));
        get().updateUnreadCount();
      },

      updateUnreadCount: () => {
        const { messages } = get();
        const unreadCount = messages.filter((msg) => !msg.isRead).length;
        set({ unreadMessageCount: unreadCount });
      },

      // Treatment plan actions
      setTreatmentPlan: (plan) => set({ treatmentPlan: plan }),

      // Sync actions
      setSyncStatus: (status) => {
        set((state) => ({
          syncStatus: { ...state.syncStatus, ...status },
        }));
      },

      incrementPendingCheckIns: () => {
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            pendingCheckIns: state.syncStatus.pendingCheckIns + 1,
          },
        }));
      },

      incrementPendingCravings: () => {
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            pendingCravings: state.syncStatus.pendingCravings + 1,
          },
        }));
      },

      clearPendingSync: () => {
        set((state) => ({
          syncStatus: {
            ...state.syncStatus,
            pendingCheckIns: 0,
            pendingCravings: 0,
            lastSyncAt: new Date().toISOString(),
            lastSyncError: undefined,
          },
        }));
      },
    }),
    {
      name: 'facility-store',
      storage: createEncryptedStorage(),
      // Tokens are kept in memory only (excluded via partialize); the
      // persisted messages/treatment plan are PHI and encrypted at rest.
      partialize: (state) => ({
        isConnected: state.isConnected,
        connection: state.connection,
        messages: state.messages,
        treatmentPlan: state.treatmentPlan,
        unreadMessageCount: state.unreadMessageCount,
        syncStatus: state.syncStatus,
      }),
    }
  )
);
