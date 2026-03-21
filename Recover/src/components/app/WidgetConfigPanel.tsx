/**
 * Widget Configuration Panel
 *
 * Configure home screen widgets for iOS and Android
 */

import { useState, useEffect } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Smartphone, RefreshCw, Settings, Sun, Moon, Laptop } from 'lucide-react';
import {
  areWidgetsSupported,
  getWidgetConfig,
  saveWidgetConfig,
  updateWidgetData,
  openWidgetConfiguration,
  scheduleWidgetUpdates,
  stopWidgetUpdates,
  generateWidgetPreview,
  generateWidgetData,
  type WidgetConfig
} from '@/lib/widgets';
import { toast } from 'sonner';

export function WidgetConfigPanel() {
  const context = useAppData();
  const [config, setConfig] = useState<WidgetConfig>(getWidgetConfig());
  const [isUpdating, setIsUpdating] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const supported = areWidgetsSupported();

  // Helper to export app data from context
  const exportAppData = () => {
    const { loading, ...appData } = context;
    return appData;
  };

  useEffect(() => {
    // Start automatic updates if enabled
    if (config.enabled && config.autoUpdate) {
      const appData = exportAppData();
      scheduleWidgetUpdates(appData);
    } else {
      stopWidgetUpdates();
    }

    return () => {
      stopWidgetUpdates();
    };
  }, [config.enabled, config.autoUpdate, config.updateInterval]);

  const handleConfigChange = (key: keyof WidgetConfig, value: any) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    saveWidgetConfig({ [key]: value });
  };

  const handleUpdateNow = async () => {
    setIsUpdating(true);
    try {
      const appData = exportAppData();
      const success = await updateWidgetData(appData);
      if (success) {
        toast.success('Widget updated successfully');
      } else {
        toast.error('Failed to update widget');
      }
    } catch (error) {
      console.error('Error updating widget:', error);
      toast.error('Error updating widget');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOpenConfig = async () => {
    try {
      await openWidgetConfiguration();
    } catch (error) {
      console.error('Error opening widget config:', error);
      toast.error('Could not open widget configuration');
    }
  };

  // Generate preview data
  const appData = exportAppData();
  const widgetData = generateWidgetData(appData);

  if (!supported) {
    return (
      <div className="space-y-4">
        <div className="bg-orange-500/10 border border-gray-300 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-1">
                Widgets Not Available
              </h4>
              <p className="text-sm text-orange-600/80 dark:text-orange-400/80">
                Home screen widgets are only available on native iOS and Android apps.
                Install the app from the App Store or Google Play to use widgets.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-sm">Widget Preview</h4>
          <div className="flex gap-3 mb-4">
            <Button
              variant={previewTheme === 'light' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewTheme('light')}
            >
              <Sun className="w-4 h-4 mr-2" />
              Light
            </Button>
            <Button
              variant={previewTheme === 'dark' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPreviewTheme('dark')}
            >
              <Moon className="w-4 h-4 mr-2" />
              Dark
            </Button>
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <div className="text-xs text-muted-foreground mb-2">Small</div>
              <div dangerouslySetInnerHTML={{
                __html: generateWidgetPreview('small', widgetData, previewTheme)
              }} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-2">Medium</div>
              <div dangerouslySetInnerHTML={{
                __html: generateWidgetPreview('medium', widgetData, previewTheme)
              }} />
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-2">Large</div>
            <div dangerouslySetInnerHTML={{
              __html: generateWidgetPreview('large', widgetData, previewTheme)
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="widget-enabled" className="text-base">Enable Widgets</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Show your progress on your home screen
          </p>
        </div>
        <Switch
          id="widget-enabled"
          checked={config.enabled}
          onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
        />
      </div>

      {config.enabled && (
        <>
          {/* Auto Update */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-update" className="text-base">Auto Update</Label>
              <p className="text-sm text-muted-foreground mt-1">
                Automatically update widget data
              </p>
            </div>
            <Switch
              id="auto-update"
              checked={config.autoUpdate}
              onCheckedChange={(checked) => handleConfigChange('autoUpdate', checked)}
            />
          </div>

          {/* Update Interval */}
          {config.autoUpdate && (
            <div className="space-y-2">
              <Label>Update Interval</Label>
              <div className="flex gap-2">
                {[15, 30, 60, 120, 240].map((minutes) => (
                  <Button
                    key={minutes}
                    variant={config.updateInterval === minutes ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleConfigChange('updateInterval', minutes)}
                  >
                    {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Widget Content Options */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h4 className="font-medium text-sm">Widget Content</h4>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-quote" className="font-normal">Show Quote</Label>
              <Switch
                id="show-quote"
                checked={config.showQuote}
                onCheckedChange={(checked) => handleConfigChange('showQuote', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-streak" className="font-normal">Show Streak</Label>
              <Switch
                id="show-streak"
                checked={config.showStreak}
                onCheckedChange={(checked) => handleConfigChange('showStreak', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="show-milestone" className="font-normal">Show Next Milestone</Label>
              <Switch
                id="show-milestone"
                checked={config.showMilestone}
                onCheckedChange={(checked) => handleConfigChange('showMilestone', checked)}
              />
            </div>
          </div>

          {/* Widget Theme */}
          <div className="space-y-2">
            <Label>Widget Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={config.theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleConfigChange('theme', 'light')}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={config.theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleConfigChange('theme', 'dark')}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
              <Button
                variant={config.theme === 'auto' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleConfigChange('theme', 'auto')}
              >
                <Laptop className="w-4 h-4 mr-2" />
                Auto
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-border">
            <Button
              onClick={handleUpdateNow}
              disabled={isUpdating}
              variant="default"
              className="flex-1"
            >
              {isUpdating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update Now
                </>
              )}
            </Button>

            <Button
              onClick={handleOpenConfig}
              variant="outline"
              className="flex-1"
            >
              <Settings className="w-4 h-4 mr-2" />
              Add Widget
            </Button>
          </div>

          {/* Widget Previews */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h4 className="font-medium text-sm">Widget Preview</h4>
            <div className="flex gap-3 mb-4">
              <Button
                variant={previewTheme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewTheme('light')}
              >
                <Sun className="w-4 h-4 mr-2" />
                Light
              </Button>
              <Button
                variant={previewTheme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewTheme('dark')}
              >
                <Moon className="w-4 h-4 mr-2" />
                Dark
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-2">Small Widget</div>
                <div dangerouslySetInnerHTML={{
                  __html: generateWidgetPreview('small', widgetData, previewTheme)
                }} />
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-2">Medium Widget</div>
                <div dangerouslySetInnerHTML={{
                  __html: generateWidgetPreview('medium', widgetData, previewTheme)
                }} />
              </div>

              <div>
                <div className="text-xs text-muted-foreground mb-2">Large Widget</div>
                <div dangerouslySetInnerHTML={{
                  __html: generateWidgetPreview('large', widgetData, previewTheme)
                }} />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-500/10 border border-gray-300 rounded-lg p-4">
            <h4 className="font-medium text-blue-600 dark:text-blue-400 mb-2">
              How to Add Widget
            </h4>
            <ol className="text-sm text-blue-600/80 dark:text-blue-400/80 space-y-1 list-decimal list-inside">
              <li>Long press on your home screen</li>
              <li>Tap the + icon (iOS) or "Widgets" (Android)</li>
              <li>Find "Recover"</li>
              <li>Choose your preferred widget size</li>
              <li>Tap "Add Widget" or drag to home screen</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
