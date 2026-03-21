import { useState, useRef, lazy, Suspense } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/LoadingSkeletons';
import { Bell, Download, Upload, Trash2, AlertCircle, Sparkles, FileCheck, X, Quote, Plus, Star, BarChart3, Cloud, Share2, Smartphone, Clock, Archive, FileSpreadsheet, ChevronDown, ChevronUp } from 'lucide-react';
import { exportData, type ExportDataType } from '@/lib/csv-export';
import { CloudSyncPanel } from '@/components/app/CloudSyncPanel';
import { ProgressSharingModal } from '@/components/app/ProgressSharingModal';
import { WidgetConfigPanel } from '@/components/app/WidgetConfigPanel';
import { TrashBin } from '@/components/app/TrashBin';
import { type TrashItemType } from '@/lib/trash-system';

// Lazy load AnalyticsScreen
const AnalyticsScreen = lazy(() => import('./AnalyticsScreen').then(m => ({ default: m.AnalyticsScreen })));
import { requestNotificationPermission, checkNotificationPermission, isNative } from '@/lib/notifications';
import { exportBackupData, importBackupData, getBackupStats, getAutoBackups, restoreAutoBackup, deleteAutoBackup, getDaysSinceLastBackup, createAutoBackup } from '@/lib/data-backup';
import type { BackupData } from '@/lib/data-backup';
import { toast } from 'sonner';

export function SettingsScreen() {
  const context = useAppData();
  const {
    notificationSettings,
    setNotificationSettings,
    onboardingCompleted,
    setOnboardingCompleted,
    celebrationsEnabled,
    setCelebrationsEnabled,
  } = context;

  // Quote management - with safe defaults
  const quoteSettings = context.quoteSettings || { refreshFrequency: 'daily' as const, lastRefresh: new Date().toISOString(), disabledQuoteIds: [] };
  const setQuoteSettings = context.setQuoteSettings || (() => {});
  const addCustomQuote = context.addCustomQuote || (() => {});
  const removeQuote = context.removeQuote || (() => {});
  const toggleFavoriteQuote = context.toggleFavoriteQuote || (() => {});
  const getAvailableQuotes = context.getAvailableQuotes || (() => []);
  const favoriteQuoteIds = context.favoriteQuoteIds || [];

  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importPreview, setImportPreview] = useState<BackupData | null>(null);
  const [newQuoteText, setNewQuoteText] = useState('');
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showProgressSharing, setShowProgressSharing] = useState(false);
  const [showCloudSync, setShowCloudSync] = useState(false);
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);
  const [showAutoBackups, setShowAutoBackups] = useState(false);
  const [autoBackups, setAutoBackups] = useState(getAutoBackups());
  const [daysSinceBackup, setDaysSinceBackup] = useState(getDaysSinceLastBackup());
  const [showCSVExport, setShowCSVExport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check notification permission on mount
  useState(() => {
    if (isNative()) {
      checkNotificationPermission().then(setHasNotificationPermission);
    }
  });

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled && isNative() && !hasNotificationPermission) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        toast.error('Notification permission denied');
        return;
      }
      setHasNotificationPermission(true);
    }

    setNotificationSettings({
      ...notificationSettings,
      enabled,
    });

    toast.success(enabled ? 'Notifications enabled' : 'Notifications disabled');
  };

  const handleTimeChange = (time: string) => {
    setNotificationSettings({
      ...notificationSettings,
      dailyReminderTime: time,
    });
    toast.success('Reminder time updated');
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Get all app data from context
      const { loading, ...appData } = context;

      // Simulate slight delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Export using our backup utility
      exportBackupData(appData);

      // Update backup timestamp
      setDaysSinceBackup(0);

      toast.success('Backup exported successfully! 📦');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCreateAutoBackup = () => {
    try {
      // Get all app data from context
      const { loading, ...appData } = context;

      // Create auto backup
      createAutoBackup(appData);

      // Refresh auto backups list
      setAutoBackups(getAutoBackups());
      setDaysSinceBackup(0);

      toast.success('Auto backup created successfully! 💾');
    } catch (error) {
      console.error('Auto backup error:', error);
      toast.error('Failed to create auto backup');
    }
  };

  const handleRestoreAutoBackup = (key: string) => {
    if (!confirm('This will replace all your current data with the backup. Continue?')) {
      return;
    }

    const result = restoreAutoBackup(key);

    if (result.success && result.data) {
      localStorage.setItem('recovery_journey_data', JSON.stringify(result.data));
      toast.success('Data restored successfully! Refreshing... 🔄');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      toast.error(result.errors?.join(', ') || 'Failed to restore backup');
    }
  };

  const handleDeleteAutoBackup = (key: string) => {
    if (!confirm('Delete this auto backup?')) {
      return;
    }

    deleteAutoBackup(key);
    setAutoBackups(getAutoBackups());
    toast.success('Auto backup deleted');
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      // Import and validate the backup file
      const result = await importBackupData(file);

      if (!result.success || !result.data) {
        // Show validation errors
        const errors = result.errors || ['Unknown error'];
        toast.error(
          <div>
            <div className="font-semibold">Invalid backup file</div>
            <ul className="list-disc list-inside text-xs mt-1">
              {errors.slice(0, 3).map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>,
          { duration: 5000 }
        );
        setIsImporting(false);
        return;
      }

      // Show confirmation dialog with backup preview
      setImportPreview(result.data as BackupData);
      setShowImportConfirm(true);
      setIsImporting(false);
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to read backup file');
      setIsImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview) return;

    setIsImporting(true);

    // Save the imported data to localStorage
    const { version, exportDate, appVersion, ...appData } = importPreview;
    localStorage.setItem('recovery_journey_data', JSON.stringify(appData));

    toast.success('Data restored successfully! Refreshing... 🔄');
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleCancelImport = () => {
    setShowImportConfirm(false);
    setImportPreview(null);
  };

  const handleClearData = async () => {
    if (
      confirm(
        'Are you sure you want to delete all your data? This action cannot be undone. Consider exporting your data first.'
      )
    ) {
      setIsClearing(true);
      // Simulate slight delay for UX
      await new Promise(resolve => setTimeout(resolve, 300));
      localStorage.removeItem('recovery_journey_data');
      toast.success('All data cleared. Refreshing...');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleResetOnboarding = () => {
    if (confirm('Reset onboarding? You\'ll be taken through the setup again.')) {
      setOnboardingCompleted(false);
      toast.success('Onboarding reset');
    }
  };

  const handleCSVExport = (dataType: ExportDataType) => {
    try {
      const { loading, ...appData } = context;

      exportData(dataType, {
        checkIns: appData.checkIns || [],
        cravings: appData.cravings || [],
        meetings: appData.meetings || [],
        meditations: appData.meditations || [],
        growthLogs: appData.growthLogs || [],
        goals: appData.goals || [],
        contacts: appData.contacts || [],
      });

      toast.success(`${dataType === 'all' ? 'All data' : dataType} exported as CSV!`);
    } catch (error) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleTrashRestore = (type: TrashItemType, data: any) => {
    // Restore item based on type
    const typeToSetter: Record<TrashItemType, () => void> = {
      checkIn: () => context.setCheckIns?.([...context.checkIns, data]),
      craving: () => context.setCravings?.([...context.cravings, data]),
      meeting: () => context.setMeetings?.([...context.meetings, data]),
      meditation: () => context.setMeditations?.([...context.meditations, data]),
      growthLog: () => context.setGrowthLogs?.([...context.growthLogs, data]),
      challenge: () => context.setChallenges?.([...context.challenges, data]),
      gratitude: () => context.setGratitude?.([...context.gratitude, data]),
      contact: () => context.setContacts?.([...context.contacts, data]),
      goal: () => context.setGoals?.([...context.goals, data]),
      sleepEntry: () => context.setSleepEntries?.([...context.sleepEntries, data]),
      exerciseEntry: () => context.setExerciseEntries?.([...context.exerciseEntries, data]),
      nutritionEntry: () => context.setNutritionEntries?.([...context.nutritionEntries, data]),
      relapse: () => context.setRelapses?.([...context.relapses, data]),
      reason: () => context.setReasonsForSobriety?.([...context.reasonsForSobriety, data])
    };

    const setter = typeToSetter[type];
    if (setter) {
      setter();
    }
  };

  const handleAddCustomQuote = () => {
    if (!newQuoteText.trim()) {
      toast.error('Please enter a quote');
      return;
    }

    addCustomQuote(newQuoteText.trim(), newQuoteAuthor.trim() || undefined);
    setNewQuoteText('');
    setNewQuoteAuthor('');
    toast.success('Custom quote added! 💭');
  };

  const handleRemoveQuote = (quoteId: string) => {
    if (confirm('Are you sure you want to remove this quote?')) {
      removeQuote(quoteId);
      toast.success('Quote removed');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold">Settings</h2>

      {/* Notifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage your notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isNative() && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-200">
                Notifications are only available on iOS and Android devices. Install
                the app from your device's app store to enable notifications.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications-enabled" className="text-base">
                Enable Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive daily reminders and milestone alerts
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationSettings.enabled}
              onCheckedChange={handleNotificationToggle}
              disabled={!isNative()}
            />
          </div>

          {notificationSettings.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="reminder-time">Daily Reminder Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={notificationSettings.dailyReminderTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="streak-reminders" className="text-base">
                    Streak Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified if you haven't checked in today
                  </p>
                </div>
                <Switch
                  id="streak-reminders"
                  checked={notificationSettings.streakReminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      streakReminders: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="meeting-reminders" className="text-base">
                    Meeting Reminders
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders for upcoming meetings
                  </p>
                </div>
                <Switch
                  id="meeting-reminders"
                  checked={notificationSettings.meetingReminders}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      meetingReminders: checked,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="milestone-notifications" className="text-base">
                    Milestone Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Celebrate your achievements
                  </p>
                </div>
                <Switch
                  id="milestone-notifications"
                  checked={notificationSettings.milestoneNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      milestoneNotifications: checked,
                    })
                  }
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* App Preferences Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            App Preferences
          </CardTitle>
          <CardDescription>
            Customize your app experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="celebrations-enabled" className="text-base">
                Celebration Animations
              </Label>
              <p className="text-sm text-muted-foreground">
                Show confetti when achieving milestones and unlocking badges
              </p>
            </div>
            <Switch
              id="celebrations-enabled"
              checked={celebrationsEnabled}
              onCheckedChange={(checked) => {
                setCelebrationsEnabled(checked);
                toast.success(checked ? 'Celebrations enabled 🎉' : 'Celebrations disabled');
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Quote Management Card */}
      {quoteSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Quote className="w-5 h-5" />
              Quote Management
            </CardTitle>
            <CardDescription>
              Customize your motivational quotes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Refresh Frequency */}
            <div className="space-y-2">
              <Label htmlFor="quote-frequency">Quote Refresh Frequency</Label>
              <Select
                value={quoteSettings?.refreshFrequency || 'daily'}
                onValueChange={(value: 'hourly' | 'daily' | 'on-open') =>
                  setQuoteSettings({ ...quoteSettings, refreshFrequency: value })
                }
              >
                <SelectTrigger id="quote-frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="on-open">Every Time App Opens</SelectItem>
                </SelectContent>
              </Select>
            </div>

          {/* Add Custom Quote */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm">Add Custom Quote</h4>
            <div className="space-y-2">
              <Label htmlFor="quote-text">Quote Text</Label>
              <Textarea
                id="quote-text"
                placeholder="Enter an inspiring quote..."
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quote-author">Author (Optional)</Label>
              <Input
                id="quote-author"
                placeholder="e.g., Anonymous"
                value={newQuoteAuthor}
                onChange={(e) => setNewQuoteAuthor(e.target.value)}
              />
            </div>
            <Button
              onClick={handleAddCustomQuote}
              className="w-full"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Quote
            </Button>
          </div>

          {/* Quote List */}
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm">
              All Quotes ({getAvailableQuotes().length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {getAvailableQuotes().map((quote) => (
                <div
                  key={quote.id}
                  className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm italic">"{quote.text}"</p>
                    {quote.author && (
                      <p className="text-xs text-muted-foreground mt-1">
                        — {quote.author}
                      </p>
                    )}
                    {quote.isCustom && (
                      <span className="inline-block mt-1 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleFavoriteQuote(quote.id)}
                      title={favoriteQuoteIds.includes(quote.id) ? 'Unfavorite' : 'Favorite'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          favoriteQuoteIds.includes(quote.id)
                            ? 'fill-yellow-500 text-yellow-500'
                            : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleRemoveQuote(quote.id)}
                      title="Remove quote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {getAvailableQuotes().length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No quotes available. Add a custom quote to get started.
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Data Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Backup, restore, or clear your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Backup Status */}
          {daysSinceBackup !== null && daysSinceBackup >= 7 && (
            <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-2 mb-3">
              <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-200">
                  Backup Reminder
                </p>
                <p className="text-xs text-yellow-200/80 mt-1">
                  It's been {daysSinceBackup} days since your last backup. Consider creating a backup to protect your data.
                </p>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleExportData}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating Backup...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Create Backup
              </>
            )}
          </Button>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              id="import-file"
              accept=".json"
              className="hidden"
              onChange={handleFileSelect}
            />
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
            >
              {isImporting ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Validating...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Restore from Backup
                </>
              )}
            </Button>
          </div>

          {/* Auto Backup Section */}
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-sm">Auto Backups</h4>
                <p className="text-xs text-muted-foreground">
                  Automatic backups stored locally
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAutoBackups(!showAutoBackups)}
              >
                {showAutoBackups ? 'Hide' : `View ${autoBackups.length}`}
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleCreateAutoBackup}
            >
              <Archive className="w-4 h-4 mr-2" />
              Create Auto Backup Now
            </Button>

            {showAutoBackups && autoBackups.length > 0 && (
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {autoBackups.map((backup) => (
                  <div
                    key={backup.key}
                    className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {new Date(backup.date).toLocaleDateString()} at{' '}
                        {new Date(backup.date).toLocaleTimeString()}
                      </p>
                      {backup.stats && (
                        <p className="text-xs text-muted-foreground">
                          {backup.stats.totalRecords} records
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRestoreAutoBackup(backup.key)}
                        title="Restore backup"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                        onClick={() => handleDeleteAutoBackup(backup.key)}
                        title="Delete backup"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showAutoBackups && autoBackups.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No auto backups yet. Create one to get started.
              </p>
            )}
          </div>

          {/* CSV Export Section */}
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV Export
                </h4>
                <p className="text-xs text-muted-foreground">
                  Export data for spreadsheet analysis
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCSVExport(!showCSVExport)}
              >
                {showCSVExport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>

            {showCSVExport && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleCSVExport('all')}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export All Data
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCSVExport('checkins')}
                    disabled={(context.checkIns?.length || 0) === 0}
                  >
                    Check-ins ({context.checkIns?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCSVExport('cravings')}
                    disabled={(context.cravings?.length || 0) === 0}
                  >
                    Cravings ({context.cravings?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCSVExport('meetings')}
                    disabled={(context.meetings?.length || 0) === 0}
                  >
                    Meetings ({context.meetings?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCSVExport('meditations')}
                    disabled={(context.meditations?.length || 0) === 0}
                  >
                    Meditations ({context.meditations?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCSVExport('growthLogs')}
                    disabled={(context.growthLogs?.length || 0) === 0}
                  >
                    Growth ({context.growthLogs?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCSVExport('goals')}
                    disabled={(context.goals?.length || 0) === 0}
                  >
                    Goals ({context.goals?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCSVExport('contacts')}
                    disabled={(context.contacts?.length || 0) === 0}
                  >
                    Contacts ({context.contacts?.length || 0})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCSVExport('analytics')}
                  >
                    Analytics
                  </Button>
                </div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 mt-3 border-t pt-3"
            onClick={handleClearData}
            disabled={isClearing}
          >
            {isClearing ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Data
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Trash Bin */}
      <TrashBin onRestore={handleTrashRestore} />

      {/* Cloud Sync Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Cloud Sync
          </CardTitle>
          <CardDescription>
            Sync your data across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowCloudSync(true)}
          >
            <Cloud className="w-4 h-4 mr-2" />
            Manage Cloud Sync
          </Button>
        </CardContent>
      </Card>

      {/* Progress Sharing Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Progress Sharing
          </CardTitle>
          <CardDescription>
            Share your progress with sponsors and support network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowProgressSharing(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Create Progress Report
          </Button>
        </CardContent>
      </Card>

      {/* Widget Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-5 h-5" />
            Home Screen Widgets
          </CardTitle>
          <CardDescription>
            Configure widgets for your home screen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowWidgetConfig(true)}
          >
            <Smartphone className="w-4 h-4 mr-2" />
            Configure Widgets
          </Button>
        </CardContent>
      </Card>

      {/* Other Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Other</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowAnalytics(true)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleResetOnboarding}
          >
            Reset Onboarding
          </Button>

          <div className="pt-4 border-t border-gray-700">
            <p className="text-sm text-muted-foreground text-center">
              Recover v1.0.0
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              Made with ❤️ for the recovery community
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Import Confirmation Modal */}
      {showImportConfirm && importPreview && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-modal-title"
        >
          <Card className="w-full max-w-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-6 h-6 text-green-500" />
                  <CardTitle id="import-modal-title">Restore Backup?</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCancelImport}
                  aria-label="Cancel import"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Backup Info */}
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Backup Date</span>
                  <span className="text-sm font-medium">
                    {importPreview.exportDate
                      ? new Date(importPreview.exportDate).toLocaleString()
                      : 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">App Version</span>
                  <span className="text-sm font-medium">
                    {importPreview.appVersion || importPreview.version || 'Unknown'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Records</span>
                  <span className="text-sm font-medium">
                    {getBackupStats(importPreview).totalRecords}
                  </span>
                </div>
              </div>

              {/* Backup Contents Preview */}
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Backup Contains:</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {importPreview.checkIns?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Check-ins:</span>
                      <span className="font-medium">{importPreview.checkIns.length}</span>
                    </div>
                  )}
                  {importPreview.cravings?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cravings:</span>
                      <span className="font-medium">{importPreview.cravings.length}</span>
                    </div>
                  )}
                  {importPreview.meetings?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meetings:</span>
                      <span className="font-medium">{importPreview.meetings.length}</span>
                    </div>
                  )}
                  {importPreview.meditations?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meditations:</span>
                      <span className="font-medium">{importPreview.meditations.length}</span>
                    </div>
                  )}
                  {importPreview.gratitude?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gratitude:</span>
                      <span className="font-medium">{importPreview.gratitude.length}</span>
                    </div>
                  )}
                  {importPreview.growthLogs?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Growth Logs:</span>
                      <span className="font-medium">{importPreview.growthLogs.length}</span>
                    </div>
                  )}
                  {importPreview.contacts?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contacts:</span>
                      <span className="font-medium">{importPreview.contacts.length}</span>
                    </div>
                  )}
                  {importPreview.reasonsForSobriety?.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reasons:</span>
                      <span className="font-medium">{importPreview.reasonsForSobriety.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  This will replace all your current data with the backup. This action cannot be undone.
                  Consider exporting your current data first.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleCancelImport}
                  className="flex-1"
                  disabled={isImporting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmImport}
                  className="flex-1 bg-gradient-to-r from-slate-600 to-gray-700"
                  disabled={isImporting}
                >
                  {isImporting ? (
                    <>
                      <Spinner className="mr-2" />
                      Restoring...
                    </>
                  ) : (
                    'Restore Backup'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="analytics-modal-title"
        >
          <div className="w-full max-w-4xl max-h-[90vh] bg-background rounded-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6" />
                <h2 id="analytics-modal-title" className="text-xl font-bold">Analytics</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAnalytics(false)}
                aria-label="Close analytics"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto">
              <Suspense fallback={
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading analytics...</p>
                  </div>
                </div>
              }>
                <AnalyticsScreen />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Cloud Sync Modal */}
      {showCloudSync && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cloud-sync-modal-title"
        >
          <div className="w-full max-w-4xl max-h-[90vh] bg-background rounded-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Cloud className="w-6 h-6" />
                <h2 id="cloud-sync-modal-title" className="text-xl font-bold">Cloud Sync</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCloudSync(false)}
                aria-label="Close cloud sync"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <CloudSyncPanel />
            </div>
          </div>
        </div>
      )}

      {/* Progress Sharing Modal */}
      <ProgressSharingModal
        isOpen={showProgressSharing}
        onClose={() => setShowProgressSharing(false)}
      />

      {/* Widget Config Modal */}
      {showWidgetConfig && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="widget-config-modal-title"
        >
          <div className="w-full max-w-4xl max-h-[90vh] bg-background rounded-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Smartphone className="w-6 h-6" />
                <h2 id="widget-config-modal-title" className="text-xl font-bold">Widget Configuration</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowWidgetConfig(false)}
                aria-label="Close widget config"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <WidgetConfigPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
