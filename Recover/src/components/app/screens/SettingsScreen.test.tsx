/**
 * SettingsScreen Component Tests
 *
 * Tests the settings/preferences screen including:
 * - Notification settings
 * - Data backup/restore
 * - Cloud sync
 * - Celebration preferences
 * - Quote management
 * - Backup/restore functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsScreen } from './SettingsScreen';
import { Router } from 'wouter';
import { toast } from 'sonner';

// Mock notifications library
vi.mock('@/lib/notifications', () => ({
  requestNotificationPermission: vi.fn(() => Promise.resolve(true)),
  checkNotificationPermission: vi.fn(() => Promise.resolve(false)),
  isNative: vi.fn(() => false),
}));

// Mock data backup functions
vi.mock('@/lib/data-backup', () => ({
  exportBackupData: vi.fn(),
  importBackupData: vi.fn(),
  getBackupStats: vi.fn(() => ({
    totalRecords: 0,
    exportDate: '',
    version: '1.0.0',
  })),
  getAutoBackups: vi.fn(() => Promise.resolve([])),
  restoreAutoBackup: vi.fn(() => Promise.resolve({ success: true })),
  deleteAutoBackup: vi.fn(),
  getDaysSinceLastBackup: vi.fn(() => 0),
  createAutoBackup: vi.fn(() => Promise.resolve()),
}));

// Mock CSV export
vi.mock('@/lib/csv-export', () => ({
  exportData: vi.fn(),
}));

// Mock cloud sync
vi.mock('@/components/app/CloudSyncPanel', () => ({
  CloudSyncPanel: () => <div data-testid="cloud-sync-panel">Cloud Sync Panel</div>,
}));

// Mock Progress Sharing Modal
vi.mock('@/components/app/ProgressSharingModal', () => ({
  ProgressSharingModal: ({ isOpen }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="progress-sharing-modal">Progress Sharing Modal</div> : null,
}));

// Mock Widget Config Panel
vi.mock('@/components/app/WidgetConfigPanel', () => ({
  WidgetConfigPanel: () => <div data-testid="widget-config-panel">Widget Config Panel</div>,
}));

// Mock Trash Bin
vi.mock('@/components/app/TrashBin', () => ({
  TrashBin: () => <div data-testid="trash-bin">Trash Bin</div>,
}));

// Mock AnalyticsScreen (lazy-loaded)
vi.mock('./AnalyticsScreen', () => ({
  AnalyticsScreen: () => <div data-testid="analytics-screen">Analytics Screen</div>,
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock useAppData hook with all required properties
const mockSetNotificationSettings = vi.fn();
const mockSetCelebrationsEnabled = vi.fn();
const mockSetQuoteSettings = vi.fn();
const mockAddCustomQuote = vi.fn();

vi.mock('@/hooks/useAppData', () => ({
  useAppData: () => ({
    loading: false,
    notificationSettings: {
      enabled: false,
      dailyReminderTime: '09:00',
      streakReminders: true,
      meetingReminders: true,
      milestoneNotifications: true,
    },
    setNotificationSettings: mockSetNotificationSettings,
    onboardingCompleted: true,
    setOnboardingCompleted: vi.fn(),
    celebrationsEnabled: true,
    setCelebrationsEnabled: mockSetCelebrationsEnabled,
    quoteSettings: {
      refreshFrequency: 'daily',
      lastRefresh: new Date().toISOString(),
      disabledQuoteIds: [],
    },
    setQuoteSettings: mockSetQuoteSettings,
    addCustomQuote: mockAddCustomQuote,
    removeQuote: vi.fn(),
    toggleFavoriteQuote: vi.fn(),
    getAvailableQuotes: vi.fn(() => []),
    favoriteQuoteIds: [],
    // Data arrays the component accesses via context spread
    checkIns: [],
    cravings: [],
    meetings: [],
    meditations: [],
    growthLogs: [],
    goals: [],
    contacts: [],
    challenges: [],
    gratitude: [],
    sleepEntries: [],
    exerciseEntries: [],
    nutritionEntries: [],
    relapses: [],
    reasonsForSobriety: [],
    // Setters for data arrays (used by TrashBin restore)
    setCheckIns: vi.fn(),
    setCravings: vi.fn(),
    setMeetings: vi.fn(),
    setMeditations: vi.fn(),
    setGrowthLogs: vi.fn(),
    setGoals: vi.fn(),
    setContacts: vi.fn(),
    setChallenges: vi.fn(),
    setGratitude: vi.fn(),
    setSleepEntries: vi.fn(),
    setExerciseEntries: vi.fn(),
    setNutritionEntries: vi.fn(),
    setRelapses: vi.fn(),
    setReasonsForSobriety: vi.fn(),
  }),
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <Router>
      {component}
    </Router>
  );
};

describe('SettingsScreen', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render settings screen', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should display notification settings section', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should display data management section', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText('Data Management')).toBeInTheDocument();
    });

    it('should display app preferences section', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText('App Preferences')).toBeInTheDocument();
    });
  });

  describe('Notification Settings', () => {
    it('should display notification toggle', () => {
      renderWithRouter(<SettingsScreen />);

      const toggle = screen.getByRole('switch', { name: /Enable Notifications/i });
      expect(toggle).toBeInTheDocument();
    });

    it('should toggle notifications on/off', async () => {
      // isNative must return true so the Switch is not disabled
      const { isNative } = await import('@/lib/notifications');
      vi.mocked(isNative).mockReturnValue(true);

      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const toggle = screen.getByRole('switch', { name: /Enable Notifications/i });
      await user.click(toggle);

      // Should show success toast
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
      });
    });
  });

  describe('Data Backup', () => {
    it('should have create backup button', () => {
      renderWithRouter(<SettingsScreen />);

      const backupButton = screen.getByRole('button', { name: /Create Backup/i });
      expect(backupButton).toBeInTheDocument();
    });

    it('should call export when create backup is clicked', async () => {
      const user = userEvent.setup();
      const mockExportBackupData = await import('@/lib/data-backup').then(m => m.exportBackupData);

      renderWithRouter(<SettingsScreen />);

      const backupButton = screen.getByRole('button', { name: /Create Backup/i });
      await user.click(backupButton);

      // Export function should be called
      await waitFor(() => {
        expect(mockExportBackupData).toHaveBeenCalled();
      });
    });
  });

  describe('Data Restore', () => {
    it('should have restore from backup button', () => {
      renderWithRouter(<SettingsScreen />);

      const restoreButton = screen.getByRole('button', { name: /Restore from Backup/i });
      expect(restoreButton).toBeInTheDocument();
    });

    it('should have a hidden file input for restore', () => {
      renderWithRouter(<SettingsScreen />);

      const fileInput = document.querySelector('input[type="file"]');
      expect(fileInput).toBeInTheDocument();
    });
  });

  describe('Cloud Sync', () => {
    it('should have manage cloud sync button', () => {
      renderWithRouter(<SettingsScreen />);

      const cloudSyncButton = screen.getByRole('button', { name: /Manage Cloud Sync/i });
      expect(cloudSyncButton).toBeInTheDocument();
    });

    it('should open cloud sync panel when clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const cloudSyncButton = screen.getByRole('button', { name: /Manage Cloud Sync/i });
      await user.click(cloudSyncButton);

      await waitFor(() => {
        expect(screen.getByTestId('cloud-sync-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Celebration Settings', () => {
    it('should display celebration animations toggle', () => {
      renderWithRouter(<SettingsScreen />);

      const celebrationsToggle = screen.getByRole('switch', { name: /Celebration Animations/i });
      expect(celebrationsToggle).toBeInTheDocument();
    });

    it('should toggle celebrations on/off', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const celebrationsToggle = screen.getByRole('switch', { name: /Celebration Animations/i });
      await user.click(celebrationsToggle);

      expect(mockSetCelebrationsEnabled).toHaveBeenCalledWith(false);
    });
  });

  describe('Quote Management', () => {
    it('should display quote management section', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText('Quote Management')).toBeInTheDocument();
    });

    it('should display quote refresh frequency selector', () => {
      renderWithRouter(<SettingsScreen />);

      const frequencyLabel = screen.getByText('Quote Refresh Frequency');
      expect(frequencyLabel).toBeInTheDocument();
    });

    it('should display add quote form fields', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByLabelText('Quote Text')).toBeInTheDocument();
      expect(screen.getByLabelText(/Author/i)).toBeInTheDocument();
    });

    it('should have add quote button', () => {
      renderWithRouter(<SettingsScreen />);

      const addQuoteButton = screen.getByRole('button', { name: /Add Quote/i });
      expect(addQuoteButton).toBeInTheDocument();
    });
  });

  describe('Backup Management', () => {
    it('should display auto backups section', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByText('Auto Backups')).toBeInTheDocument();
    });

    it('should have create auto backup button', () => {
      renderWithRouter(<SettingsScreen />);

      const autoBackupButton = screen.getByRole('button', { name: /Create Auto Backup Now/i });
      expect(autoBackupButton).toBeInTheDocument();
    });

    it('should show clear all data button', () => {
      renderWithRouter(<SettingsScreen />);

      const clearDataButton = screen.getByRole('button', { name: /Clear All Data/i });
      expect(clearDataButton).toBeInTheDocument();
    });
  });

  describe('Widget Configuration', () => {
    it('should have configure widgets button', () => {
      renderWithRouter(<SettingsScreen />);

      const widgetButton = screen.getByRole('button', { name: /Configure Widgets/i });
      expect(widgetButton).toBeInTheDocument();
    });

    it('should open widget config panel', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const widgetButton = screen.getByRole('button', { name: /Configure Widgets/i });
      await user.click(widgetButton);

      await waitFor(() => {
        expect(screen.getByTestId('widget-config-panel')).toBeInTheDocument();
      });
    });
  });

  describe('Progress Sharing', () => {
    it('should have create progress report button', () => {
      renderWithRouter(<SettingsScreen />);

      const shareButton = screen.getByRole('button', { name: /Create Progress Report/i });
      expect(shareButton).toBeInTheDocument();
    });

    it('should open progress sharing modal', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const shareButton = screen.getByRole('button', { name: /Create Progress Report/i });
      await user.click(shareButton);

      await waitFor(() => {
        expect(screen.getByTestId('progress-sharing-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Trash Bin', () => {
    it('should render trash bin component', () => {
      renderWithRouter(<SettingsScreen />);

      expect(screen.getByTestId('trash-bin')).toBeInTheDocument();
    });
  });

  describe('Analytics', () => {
    it('should have view analytics button', () => {
      renderWithRouter(<SettingsScreen />);

      const analyticsButton = screen.getByRole('button', { name: /View Analytics/i });
      expect(analyticsButton).toBeInTheDocument();
    });

    it('should open analytics view', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      const analyticsButton = screen.getByRole('button', { name: /View Analytics/i });
      await user.click(analyticsButton);

      // Analytics screen should load (lazy-loaded)
      await waitFor(() => {
        expect(screen.getByTestId('analytics-screen')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithRouter(<SettingsScreen />);

      const notificationToggle = screen.getByRole('switch', { name: /Enable Notifications/i });
      expect(notificationToggle).toHaveAccessibleName();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithRouter(<SettingsScreen />);

      await user.tab();

      const focusedElement = document.activeElement;
      expect(focusedElement?.tagName).toBe('BUTTON');
    });
  });

  describe('Error Handling', () => {
    it('should handle export errors gracefully', async () => {
      const user = userEvent.setup();
      const mockExportBackupData = await import('@/lib/data-backup').then(m => m.exportBackupData);
      vi.mocked(mockExportBackupData).mockImplementationOnce(() => { throw new Error('Export failed'); });

      renderWithRouter(<SettingsScreen />);

      const backupButton = screen.getByRole('button', { name: /Create Backup/i });
      await user.click(backupButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Failed to export'));
      });
    });

    it('should have restore button available for import flow', () => {
      renderWithRouter(<SettingsScreen />);

      const restoreButton = screen.getByRole('button', { name: /Restore from Backup/i });
      expect(restoreButton).toBeInTheDocument();
    });
  });
});
