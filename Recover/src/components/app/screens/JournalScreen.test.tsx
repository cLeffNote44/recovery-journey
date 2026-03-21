/**
 * JournalScreen Component Tests
 *
 * Tests the journaling screen including:
 * - Craving management
 * - Meeting tracking
 * - Growth logs (growth, challenges, gratitude, meditation combined)
 * - Tab navigation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JournalScreen } from './JournalScreen';
import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { toast } from 'sonner';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock HALTCheck component
vi.mock('@/components/HALTCheck', () => ({
  HALTCheck: ({ onComplete, initialValues, showSuggestions }: any) => (
    <div data-testid="halt-check">
      <button onClick={() => onComplete?.({ hungry: 1, angry: 1, lonely: 1, tired: 1 })}>
        Complete HALT
      </button>
    </div>
  ),
}));

// Mock EmptyState component
vi.mock('@/components/EmptyState', () => ({
  EmptyState: ({ title, description, actionLabel, onAction }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction && (
        <button onClick={onAction}>{actionLabel}</button>
      )}
    </div>
  ),
}));

// Mock LoadingSkeletons
vi.mock('@/components/LoadingSkeletons', () => ({
  JournalScreenSkeleton: () => <div data-testid="loading-skeleton">Loading...</div>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <span data-testid="icon-alert-triangle" />,
  TrendingUp: () => <span data-testid="icon-trending-up" />,
  Target: () => <span data-testid="icon-target" />,
  Heart: () => <span data-testid="icon-heart" />,
  Plus: () => <span data-testid="icon-plus" />,
  Trash2: () => <span data-testid="icon-trash" />,
  Users: () => <span data-testid="icon-users" />,
  Eye: () => <span data-testid="icon-eye" />,
  EyeOff: () => <span data-testid="icon-eye-off" />,
  ChevronDownIcon: () => <span data-testid="icon-chevron-down" />,
  ChevronUpIcon: () => <span data-testid="icon-chevron-up" />,
  CheckIcon: () => <span data-testid="icon-check" />,
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  formatDate: (date: string) => date,
  calculateDaysSober: () => 0,
  calculateDaysCleanBefore: () => 0,
  createRelapseEntry: vi.fn(),
  processRelapseImpact: vi.fn(() => []),
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

// Mock @/lib/celebrations
vi.mock('@/lib/celebrations', () => ({
  celebrate: vi.fn(),
}));

// Mock types/app constants
vi.mock('@/types/app', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    TRIGGER_TYPES: actual.TRIGGER_TYPES || ['Stress', 'Social', 'Emotional', 'Environmental', 'Physical'],
    MEDITATION_TYPES: actual.MEDITATION_TYPES || ['Mindfulness', 'Breathing', 'Body Scan', 'Guided'],
    RELAPSE_TRIGGERS: actual.RELAPSE_TRIGGERS || ['Stress', 'Social Pressure', 'Emotional Pain'],
    RELAPSE_EMOTIONS: actual.RELAPSE_EMOTIONS || ['Sadness', 'Anger', 'Anxiety'],
    SUPPORT_TYPES: actual.SUPPORT_TYPES || ['Sponsor', 'Therapist', 'Support Group'],
  };
});

describe('JournalScreen', () => {
  beforeEach(() => {
    // Reset all stores
    const recoveryStore = useRecoveryStore.getState();
    const journalStore = useJournalStore.getState();
    const activitiesStore = useActivitiesStore.getState();
    const settingsStore = useSettingsStore.getState();

    // Set up initial state
    const today = new Date().toISOString().split('T')[0];
    recoveryStore.setSobrietyDate(today);
    recoveryStore.setRelapses([]);
    recoveryStore.setCleanPeriods([]);

    journalStore.setMeetings([]);
    journalStore.setGrowthLogs([]);
    journalStore.setChallenges([]);
    journalStore.setGratitude([]);
    journalStore.setMeditations([]);

    activitiesStore.setCravings([]);

    settingsStore.setCelebrationsEnabled(true);

    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('should render journal screen', () => {
      render(<JournalScreen />);

      expect(screen.getByText('Journal')).toBeInTheDocument();
    });

    it('should display tab navigation', () => {
      render(<JournalScreen />);

      // Component has 4 tabs: Cravings, Meetings, Growth, Setbacks
      expect(screen.getByText('Cravings')).toBeInTheDocument();
      expect(screen.getByText('Meetings')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
      expect(screen.getByText('Setbacks')).toBeInTheDocument();
    });

    it('should show cravings tab by default', () => {
      render(<JournalScreen />);

      // The cravings tab content should be visible (the "Log Craving" button)
      expect(screen.getByText('Log Craving')).toBeInTheDocument();
    });
  });

  describe('Cravings Tab', () => {
    it('should show log craving button', () => {
      render(<JournalScreen />);

      expect(screen.getByText('Log Craving')).toBeInTheDocument();
    });

    it('should open add craving form', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const addButton = screen.getByText('Log Craving');
      await user.click(addButton);

      await waitFor(() => {
        // The modal title
        expect(screen.getByText('Log Craving', { selector: '[data-slot="card-title"]' }) || screen.getAllByText('Log Craving').length).toBeTruthy();
        // Intensity label
        expect(screen.getByText(/Intensity/)).toBeInTheDocument();
        // Trigger label
        expect(screen.getByText('Trigger')).toBeInTheDocument();
      });
    });

    it('should allow adding a craving', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const addButton = screen.getByText('Log Craving');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Intensity/)).toBeInTheDocument();
      });

      // Fill trigger notes
      const triggerNotesInput = screen.getByPlaceholderText('What triggered this craving?');
      await user.type(triggerNotesInput, 'Feeling stressed from work');

      // Fill coping strategy
      const copingInput = screen.getByPlaceholderText('How did you cope?');
      await user.type(copingInput, 'Deep breathing exercises');

      // Check overcame checkbox
      const overcameCheckbox = screen.getByRole('checkbox');
      await user.click(overcameCheckbox);

      // Save craving
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      // Check that craving was added
      const cravings = useActivitiesStore.getState().cravings;
      expect(cravings.length).toBe(1);
      expect(cravings[0].overcame).toBe(true);
    });

    it('should show HALT assessment option when adding craving', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const addButton = screen.getByText('Log Craving');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/HALT Assessment/)).toBeInTheDocument();
      });
    });

    it('should integrate HALT check with craving', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const addButton = screen.getByText('Log Craving');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/HALT Assessment/)).toBeInTheDocument();
      });

      const haltButton = screen.getByText(/HALT Assessment/);
      await user.click(haltButton);

      expect(screen.getByTestId('halt-check')).toBeInTheDocument();
    });

    it('should display list of cravings', () => {
      // Add some cravings
      useActivitiesStore.getState().setCravings([
        {
          id: 1,
          date: new Date().toISOString(),
          intensity: 8,
          trigger: 'Stress',
          triggerNotes: 'Work deadline',
          copingStrategy: 'Exercise',
          overcame: true,
        },
        {
          id: 2,
          date: new Date().toISOString(),
          intensity: 5,
          trigger: 'Social',
          triggerNotes: 'Party invitation',
          copingStrategy: 'Called sponsor',
          overcame: false,
        },
      ]);

      render(<JournalScreen />);

      expect(screen.getByText('Work deadline')).toBeInTheDocument();
      expect(screen.getByText('Party invitation')).toBeInTheDocument();
    });

    it('should allow deleting a craving', async () => {
      const user = userEvent.setup();

      useActivitiesStore.getState().setCravings([
        {
          id: 1,
          date: new Date().toISOString(),
          intensity: 8,
          trigger: 'Stress',
          overcame: true,
        },
      ]);

      render(<JournalScreen />);

      // Delete button is a ghost button with Trash2 icon
      const deleteButtons = screen.getAllByTestId('icon-trash');
      const deleteButton = deleteButtons[0].closest('button')!;
      await user.click(deleteButton);

      // Craving should be removed
      const cravings = useActivitiesStore.getState().cravings;
      expect(cravings.length).toBe(0);
    });

    it('should show empty state when no cravings', () => {
      render(<JournalScreen />);

      expect(screen.getByText('No Cravings Logged')).toBeInTheDocument();
    });
  });

  describe('Meetings Tab', () => {
    it('should switch to meetings tab', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const meetingsTab = screen.getByText('Meetings');
      await user.click(meetingsTab);

      // Meetings tab content should be visible
      expect(screen.getByText('Log Meeting')).toBeInTheDocument();
    });

    it('should show log meeting button', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const meetingsTab = screen.getByText('Meetings');
      await user.click(meetingsTab);

      expect(screen.getByText('Log Meeting')).toBeInTheDocument();
    });

    it('should allow adding a meeting', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const meetingsTab = screen.getByText('Meetings');
      await user.click(meetingsTab);

      const addButton = screen.getByText('Log Meeting');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Meeting type (AA, NA, etc.)')).toBeInTheDocument();
      });

      // Type is pre-filled with 'AA', clear and set it
      const typeInput = screen.getByPlaceholderText('Meeting type (AA, NA, etc.)');
      await user.clear(typeInput);
      await user.type(typeInput, 'AA');

      // Add location
      const locationInput = screen.getByPlaceholderText('Location');
      await user.type(locationInput, 'Community Center');

      // Add notes
      const notesInput = screen.getByPlaceholderText('Notes');
      await user.type(notesInput, 'Great meeting, felt supported');

      // Save meeting
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      const meetings = useJournalStore.getState().meetings;
      expect(meetings.length).toBe(1);
      expect(meetings[0].type).toBe('AA');
      expect(meetings[0].location).toBe('Community Center');
    });

    it('should display list of meetings', async () => {
      const user = userEvent.setup();

      useJournalStore.getState().setMeetings([
        {
          id: 1,
          date: new Date().toISOString(),
          type: 'AA',
          location: 'Downtown Hall',
          notes: 'Inspiring stories',
        },
      ]);

      render(<JournalScreen />);

      const meetingsTab = screen.getByText('Meetings');
      await user.click(meetingsTab);

      expect(screen.getByText('Downtown Hall')).toBeInTheDocument();
    });
  });

  describe('Growth Tab', () => {
    it('should switch to growth tab', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      // Growth tab shows sub-buttons for different entry types
      expect(screen.getByText('Growth Log')).toBeInTheDocument();
    });

    it('should allow adding a growth log', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      const addButton = screen.getByText('Growth Log');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Title')).toBeInTheDocument();
      });

      // Add title
      const titleInput = screen.getByPlaceholderText('Title');
      await user.type(titleInput, 'Learned to set boundaries');

      // Add description
      const descInput = screen.getByPlaceholderText('Description');
      await user.type(descInput, 'Practiced saying no to unhealthy situations');

      // Save
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      const growthLogs = useJournalStore.getState().growthLogs;
      expect(growthLogs.length).toBe(1);
      expect(growthLogs[0].title).toContain('boundaries');
    });

    it('should display list of growth logs', async () => {
      const user = userEvent.setup();

      useJournalStore.getState().setGrowthLogs([
        {
          id: 1,
          date: new Date().toISOString(),
          title: 'First week sober',
          description: 'Feeling proud and hopeful',
        },
      ]);

      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      expect(screen.getByText('First week sober')).toBeInTheDocument();
    });
  });

  describe('Challenges (in Growth Tab)', () => {
    it('should show challenge button in growth tab', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      expect(screen.getByText('Challenge')).toBeInTheDocument();
    });

    it('should allow adding a challenge', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      const addButton = screen.getByText('Challenge');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('What was the challenging situation?')).toBeInTheDocument();
      });

      // Add situation
      const situationInput = screen.getByPlaceholderText('What was the challenging situation?');
      await user.type(situationInput, 'Tempted at social event');

      // Add response
      const responseInput = screen.getByPlaceholderText('How did you respond?');
      await user.type(responseInput, 'Left early and called sponsor');

      // Add outcome
      const outcomeInput = screen.getByPlaceholderText('What was the outcome?');
      await user.type(outcomeInput, 'Felt proud of myself');

      // Save
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      const challenges = useJournalStore.getState().challenges;
      expect(challenges.length).toBe(1);
      expect(challenges[0].situation).toContain('social event');
    });
  });

  describe('Gratitude (in Growth Tab)', () => {
    it('should show gratitude button in growth tab', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      expect(screen.getByText('Gratitude')).toBeInTheDocument();
    });

    it('should allow adding gratitude entry', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      const addButton = screen.getByText('Gratitude');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('What are you grateful for today?')).toBeInTheDocument();
      });

      const entryInput = screen.getByPlaceholderText('What are you grateful for today?');
      await user.type(entryInput, 'Grateful for my supportive family');

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      const gratitude = useJournalStore.getState().gratitude;
      expect(gratitude.length).toBe(1);
      expect(gratitude[0].entry).toContain('supportive family');
    });

    it('should display list of gratitude entries', async () => {
      const user = userEvent.setup();

      useJournalStore.getState().setGratitude([
        {
          id: 1,
          date: new Date().toISOString(),
          entry: 'Grateful for my health',
        },
        {
          id: 2,
          date: new Date().toISOString(),
          entry: 'Grateful for second chances',
        },
      ]);

      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      expect(screen.getByText('Grateful for my health')).toBeInTheDocument();
      expect(screen.getByText('Grateful for second chances')).toBeInTheDocument();
    });
  });

  describe('Meditation (in Growth Tab)', () => {
    it('should show meditation button in growth tab', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      expect(screen.getByText('Meditation')).toBeInTheDocument();
    });

    it('should allow adding meditation session', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      const addButton = screen.getByText('Meditation');
      await user.click(addButton);

      await waitFor(() => {
        // Modal should show with Type and Duration
        expect(screen.getByText('Log Meditation')).toBeInTheDocument();
      });

      // Save (default values: duration 10, type Mindfulness)
      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      const meditations = useJournalStore.getState().meditations;
      expect(meditations.length).toBe(1);
      expect(meditations[0].duration).toBe(10);
      expect(meditations[0].type).toBe('Mindfulness');
    });

    it('should display meditation entries in growth tab', async () => {
      const user = userEvent.setup();

      useJournalStore.getState().setMeditations([
        {
          id: 1,
          date: new Date().toISOString(),
          duration: 15,
          type: 'Breathing',
        },
        {
          id: 2,
          date: new Date().toISOString(),
          duration: 20,
          type: 'Mindfulness',
        },
      ]);

      render(<JournalScreen />);

      const growthTab = screen.getByText('Growth');
      await user.click(growthTab);

      // Meditation entries show type and duration in the growth tab
      expect(screen.getByText('Breathing')).toBeInTheDocument();
      expect(screen.getByText('Mindfulness')).toBeInTheDocument();
      expect(screen.getByText('15 min')).toBeInTheDocument();
      expect(screen.getByText('20 min')).toBeInTheDocument();
    });
  });

  describe('Toast Notifications', () => {
    it('should show success toast when adding craving entry', async () => {
      const user = userEvent.setup();
      render(<JournalScreen />);

      const addButton = screen.getByText('Log Craving');
      await user.click(addButton);

      await waitFor(() => {
        expect(screen.getByText(/Intensity/)).toBeInTheDocument();
      });

      const saveButton = screen.getByText('Save');
      await user.click(saveButton);

      expect(toast.success).toHaveBeenCalled();
    });

    it('should show success toast when deleting craving entry', async () => {
      const user = userEvent.setup();

      useActivitiesStore.getState().setCravings([
        {
          id: 1,
          date: new Date().toISOString(),
          intensity: 5,
          trigger: 'Stress',
          overcame: true,
        },
      ]);

      render(<JournalScreen />);

      // Delete button is the trash icon button
      const deleteButtons = screen.getAllByTestId('icon-trash');
      const deleteButton = deleteButtons[0].closest('button')!;
      await user.click(deleteButton);

      expect(toast.success).toHaveBeenCalledWith('Craving entry deleted');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading for journal screen', () => {
      render(<JournalScreen />);

      const heading = screen.getByText('Journal');
      expect(heading.tagName).toBe('H2');
    });

    it('should have tab buttons for navigation', () => {
      render(<JournalScreen />);

      // Verify the 4 tabs are present and clickable
      expect(screen.getByText('Cravings')).toBeInTheDocument();
      expect(screen.getByText('Meetings')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
      expect(screen.getByText('Setbacks')).toBeInTheDocument();
    });
  });
});
