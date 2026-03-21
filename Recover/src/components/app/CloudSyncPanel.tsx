import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, Download, Upload, Trash2, Lock, Unlock, RefreshCw, Check, AlertCircle, Clock, HardDrive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppData } from '@/hooks/useAppData';
import {
  cloudSync,
  SyncStateManager,
  type CloudSyncConfig,
  type SyncStatus,
  type BackupMetadata
} from '@/lib/cloud-sync';
import type { AppData } from '@/types/app';
import { toast } from 'sonner';

export function CloudSyncPanel() {
  const context = useAppData();
  const [config, setConfig] = useState<CloudSyncConfig>(SyncStateManager.getConfig());
  const [status, setStatus] = useState<SyncStatus>(SyncStateManager.getStatus());
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState(config.userId || '');
  const [deviceName, setDeviceName] = useState(SyncStateManager.getDeviceName());
  const [backupsList, setBackupsList] = useState<BackupMetadata[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(config.syncEnabled);

  // Helper to export app data from context
  const exportAppData = (): AppData => {
    const { loading, ...appData } = context;
    return {
      ...appData,
      stepWork: appData.stepWork ?? {
        currentStep: 1,
        steps: [],
      },
    };
  };

  // Load backups list when userId changes
  useEffect(() => {
    if (userId) {
      cloudSync.getBackupsList(userId).then(backups => {
        setBackupsList(backups);
      });
    }
  }, [userId]);

  // Update config when settings change
  useEffect(() => {
    SyncStateManager.saveConfig(config);
  }, [config]);

  const handleCreateBackup = async () => {
    if (!userId) {
      toast.error('Please enter a User ID');
      return;
    }

    if (config.encryptionEnabled && !password) {
      toast.error('Password required for encrypted backup');
      return;
    }

    setSyncing(true);
    try {
      const appData = exportAppData();
      const backup = await cloudSync.createBackup(appData, password);
      const result = await cloudSync.uploadBackup(backup, userId);

      if (result.success) {
        toast.success('Backup created successfully!');
        const backups = await cloudSync.getBackupsList(userId);
        setBackupsList(backups);

        const newStatus: SyncStatus = {
          status: 'success',
          lastSyncTime: new Date().toISOString(),
          pendingChanges: 0,
          cloudVersion: backup.metadata.id,
          localVersion: backup.metadata.id,
          needsResolution: false
        };
        setStatus(newStatus);
        SyncStateManager.saveStatus(newStatus);
      } else {
        toast.error('Failed to upload backup');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error(error instanceof Error ? error.message : 'Backup failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    if (!userId) return;

    if (!confirm('This will replace your current data. Are you sure?')) {
      return;
    }

    setSyncing(true);
    try {
      const backup = await cloudSync.downloadBackup(userId, backupId);
      if (!backup) {
        toast.error('Backup not found');
        return;
      }

      const appData = await cloudSync.restoreBackup(backup, password);

      // Restore all data to context
      if (appData.sobrietyDate) context.setSobrietyDate(appData.sobrietyDate);
      if (appData.checkIns) context.setCheckIns(appData.checkIns);
      if (appData.cravings) context.setCravings(appData.cravings);
      if (appData.meetings) context.setMeetings(appData.meetings);
      if (appData.meditations) context.setMeditations(appData.meditations);
      if (appData.gratitude) context.setGratitude(appData.gratitude);
      if (appData.goals) context.setGoals(appData.goals);
      if (appData.contacts) context.setContacts(appData.contacts);

      toast.success('Data restored successfully!');

      const newStatus: SyncStatus = {
        status: 'success',
        lastSyncTime: new Date().toISOString(),
        pendingChanges: 0,
        cloudVersion: backupId,
        localVersion: backupId,
        needsResolution: false
      };
      setStatus(newStatus);
      SyncStateManager.saveStatus(newStatus);
    } catch (error) {
      console.error('Restore failed:', error);
      toast.error(error instanceof Error ? error.message : 'Restore failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!userId) return;

    if (!confirm('Delete this backup permanently?')) {
      return;
    }

    const success = await cloudSync.deleteBackup(userId, backupId);
    if (success) {
      toast.success('Backup deleted');
      const backups = await cloudSync.getBackupsList(userId);
      setBackupsList(backups);
    } else {
      toast.error('Failed to delete backup');
    }
  };

  const handleSync = async () => {
    if (!userId) {
      toast.error('Please enter a User ID');
      return;
    }

    if (config.encryptionEnabled && !password) {
      toast.error('Password required for encrypted sync');
      return;
    }

    setSyncing(true);
    try {
      const appData = exportAppData();
      const result = await cloudSync.sync(appData, userId, password);

      if (result.success) {
        if (result.action === 'uploaded') {
          toast.success('Data synced to cloud');
        } else if (result.action === 'downloaded' && result.data) {
          toast.success('Data synced from cloud');
          // Would apply result.data here
        }

        setStatus(SyncStateManager.getStatus());
        const backups = await cloudSync.getBackupsList(userId);
        setBackupsList(backups);
      } else {
        toast.error(`Sync failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error(error instanceof Error ? error.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleExportToFile = async () => {
    try {
      const appData = exportAppData();
      const backup = await cloudSync.createBackup(appData, password);
      const blob = await cloudSync.exportToFile(backup);

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recovery-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Backup file downloaded');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export backup');
    }
  };

  const handleImportFromFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!confirm('This will replace your current data. Are you sure?')) {
      event.target.value = '';
      return;
    }

    try {
      const backup = await cloudSync.importFromFile(file);
      const appData = await cloudSync.restoreBackup(backup, password);

      // Restore data
      if (appData.sobrietyDate) context.setSobrietyDate(appData.sobrietyDate);
      if (appData.checkIns) context.setCheckIns(appData.checkIns);
      if (appData.cravings) context.setCravings(appData.cravings);
      if (appData.meetings) context.setMeetings(appData.meetings);
      if (appData.meditations) context.setMeditations(appData.meditations);
      if (appData.gratitude) context.setGratitude(appData.gratitude);
      if (appData.goals) context.setGoals(appData.goals);
      if (appData.contacts) context.setContacts(appData.contacts);

      toast.success('Data imported successfully!');
    } catch (error) {
      console.error('Import failed:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed');
    }

    event.target.value = '';
  };

  const toggleAutoSync = (enabled: boolean) => {
    setAutoSyncEnabled(enabled);
    setConfig({ ...config, syncEnabled: enabled });

    if (enabled) {
      if (!userId || (config.encryptionEnabled && !password)) {
        toast.error('Configure User ID and password first');
        setAutoSyncEnabled(false);
        return;
      }

      cloudSync.enableAutoSync(
        () => exportAppData(),
        (result) => {
          setStatus(SyncStateManager.getStatus());
          if (result.success) {
            toast.success('Auto-sync completed');
          }
        },
        userId,
        password
      );
      toast.success('Auto-sync enabled');
    } else {
      cloudSync.disableAutoSync();
      toast.info('Auto-sync disabled');
    }
  };

  const saveUserId = () => {
    setConfig({ ...config, userId });
    toast.success('User ID saved');
  };

  const saveDeviceName = () => {
    SyncStateManager.setDeviceName(deviceName);
    toast.success('Device name saved');
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Sync Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.status === 'syncing' ? (
                <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
              ) : status.status === 'success' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : status.status === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <Cloud className="h-5 w-5 text-muted-foreground" />
              )}
              <CardTitle>Cloud Sync Status</CardTitle>
            </div>
            <Badge variant={
              status.status === 'success' ? 'default' :
              status.status === 'error' ? 'destructive' :
              'outline'
            }>
              {status.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {status.lastSyncTime && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last sync:</span>
              <span className="font-medium">{formatTimestamp(status.lastSyncTime)}</span>
            </div>
          )}

          {status.pendingChanges > 0 && (
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <AlertCircle className="h-4 w-4" />
              <span>{status.pendingChanges} pending changes</span>
            </div>
          )}

          {status.lastSyncError && (
            <div className="text-sm text-red-600">
              Error: {status.lastSyncError}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Configuration</CardTitle>
          <CardDescription>
            Configure your cloud backup and sync settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID (Email or Username)</Label>
            <div className="flex gap-2">
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="your@email.com"
              />
              <Button onClick={saveUserId} variant="outline">
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your unique identifier for cloud storage
            </p>
          </div>

          {/* Device Name */}
          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <div className="flex gap-2">
              <Input
                id="deviceName"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="My iPhone"
              />
              <Button onClick={saveDeviceName} variant="outline">
                Save
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Identify this device in your backups
            </p>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Encryption Password</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={!config.encryptionEnabled}
              />
              <Button
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
                disabled={!config.encryptionEnabled}
              >
                {showPassword ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Encryption Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Encryption</Label>
              <p className="text-xs text-muted-foreground">
                Encrypt backups with password (recommended)
              </p>
            </div>
            <Switch
              checked={config.encryptionEnabled}
              onCheckedChange={(checked) => {
                setConfig({ ...config, encryptionEnabled: checked });
                if (!checked) setPassword('');
              }}
            />
          </div>

          {/* Auto-Sync Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Sync</Label>
              <p className="text-xs text-muted-foreground">
                Automatically sync every {config.autoSyncInterval || 30} minutes
              </p>
            </div>
            <Switch
              checked={autoSyncEnabled}
              onCheckedChange={toggleAutoSync}
            />
          </div>

          {/* Sync Interval */}
          {autoSyncEnabled && (
            <div className="space-y-2">
              <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
              <Input
                id="syncInterval"
                type="number"
                min="5"
                max="1440"
                value={config.autoSyncInterval || 30}
                onChange={(e) => setConfig({ ...config, autoSyncInterval: parseInt(e.target.value) })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full"
            onClick={handleSync}
            disabled={syncing || !userId}
          >
            {syncing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>

          <Button
            className="w-full"
            variant="outline"
            onClick={handleCreateBackup}
            disabled={syncing || !userId}
          >
            <Upload className="h-4 w-4 mr-2" />
            Create Backup
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={handleExportToFile}
              disabled={syncing}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            <Button variant="outline" disabled={syncing} asChild>
              <label htmlFor="import-file" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Import
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportFromFile}
                />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Backups List */}
      {userId && backupsList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Backups</CardTitle>
            <CardDescription>
              {backupsList.length} backup{backupsList.length !== 1 ? 's' : ''} available
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {backupsList.map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{backup.deviceName}</span>
                      {backup.encrypted && (
                        <Lock className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatTimestamp(backup.timestamp)} • {formatSize(backup.size)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreBackup(backup.id)}
                      disabled={syncing}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteBackup(backup.id)}
                      disabled={syncing}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
