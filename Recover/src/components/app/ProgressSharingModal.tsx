/**
 * Progress Sharing Modal
 *
 * Interface for generating and sharing progress reports with sponsors,
 * therapists, or support network members.
 */

import { useState, useMemo } from 'react';
import { X, Mail, Download, Copy, Check, Share2, Calendar, User, Shield, FileText } from 'lucide-react';
import { useAppData } from '@/hooks/useAppData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  generateProgressReport,
  formatReportAsText,
  formatReportAsHTML,
  shareViaEmail,
  downloadReportAsText,
  copyReportToClipboard,
  type ProgressReport,
  type ShareOptions
} from '@/lib/progress-sharing';
import type { Contact } from '@/types/app';

interface ProgressSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProgressSharingModal({ isOpen, onClose }: ProgressSharingModalProps) {
  const context = useAppData();
  const [period, setPeriod] = useState<'week' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [copied, setCopied] = useState(false);

  // Privacy options
  const [options, setOptions] = useState<Partial<ShareOptions>>({
    includePersonalDetails: true,
    includeCravingDetails: true,
    includeJournalEntries: false,
    includeMoodData: true,
    includeGoals: true,
    format: 'text'
  });

  // Helper to export app data from context
  const exportAppData = () => {
    const { loading, ...appData } = context;
    return appData;
  };

  // Generate report
  const report = useMemo<ProgressReport | null>(() => {
    try {
      const appData = exportAppData();
      return generateProgressReport(
        appData,
        period,
        customStartDate || undefined,
        customEndDate || undefined,
        options
      );
    } catch (error) {
      console.error('Error generating report:', error);
      return null;
    }
  }, [context, period, customStartDate, customEndDate, options]);

  // Support contacts (sponsors, therapists, etc.)
  const supportContacts = context.contacts.filter(c =>
    c.role === 'Sponsor' ||
    c.role === 'Therapist' ||
    c.role === 'Counselor'
  );

  const handleShareEmail = () => {
    if (!report || !selectedContact || !selectedContact.email) {
      return;
    }
    shareViaEmail(report, selectedContact);
  };

  const handleDownload = () => {
    if (!report) return;
    downloadReportAsText(report);
  };

  const handleCopyToClipboard = async () => {
    if (!report) return;
    const success = await copyReportToClipboard(report);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const updateOption = (key: keyof ShareOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background bg-opacity-100 backdrop-blur-none rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-primary" />
            <div>
              <h2 className="text-2xl font-bold">Share Progress Report</h2>
              <p className="text-sm text-muted-foreground">Generate and share your recovery progress</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Configuration Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Time Period */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">Time Period</CardTitle>
                </div>
                <CardDescription>Select the reporting period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Period</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={period === 'week' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setPeriod('week')}
                    >
                      Last Week
                    </Button>
                    <Button
                      variant={period === 'month' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setPeriod('month')}
                    >
                      Last Month
                    </Button>
                    <Button
                      variant={period === 'custom' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setPeriod('custom')}
                    >
                      Custom
                    </Button>
                  </div>
                </div>

                {period === 'custom' && (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="space-y-1">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Privacy Options */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-500" />
                  <CardTitle className="text-lg">Privacy Settings</CardTitle>
                </div>
                <CardDescription>Control what information to include</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="personal-details"
                    checked={options.includePersonalDetails}
                    onCheckedChange={(checked) => updateOption('includePersonalDetails', checked)}
                  />
                  <Label htmlFor="personal-details" className="text-sm font-normal cursor-pointer">
                    Include personal details and metrics
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="mood-data"
                    checked={options.includeMoodData}
                    onCheckedChange={(checked) => updateOption('includeMoodData', checked)}
                  />
                  <Label htmlFor="mood-data" className="text-sm font-normal cursor-pointer">
                    Include mood tracking data
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="craving-details"
                    checked={options.includeCravingDetails}
                    onCheckedChange={(checked) => updateOption('includeCravingDetails', checked)}
                  />
                  <Label htmlFor="craving-details" className="text-sm font-normal cursor-pointer">
                    Include craving details and triggers
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="journal-entries"
                    checked={options.includeJournalEntries}
                    onCheckedChange={(checked) => updateOption('includeJournalEntries', checked)}
                  />
                  <Label htmlFor="journal-entries" className="text-sm font-normal cursor-pointer">
                    Include journal entries
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="goals"
                    checked={options.includeGoals}
                    onCheckedChange={(checked) => updateOption('includeGoals', checked)}
                  />
                  <Label htmlFor="goals" className="text-sm font-normal cursor-pointer">
                    Include goals and progress
                  </Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recipient Selection */}
          {supportContacts.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <CardTitle className="text-lg">Select Recipient</CardTitle>
                </div>
                <CardDescription>Choose who to share with (optional)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {supportContacts.map(contact => (
                    <Button
                      key={contact.id}
                      variant={selectedContact?.id === contact.id ? 'default' : 'outline'}
                      className="justify-start"
                      onClick={() => setSelectedContact(contact)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      <div className="text-left overflow-hidden">
                        <div className="font-medium truncate">{contact.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">{contact.role}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Preview */}
          {report && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <CardTitle className="text-lg">Report Preview</CardTitle>
                </div>
                <CardDescription>Preview your progress report</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                  <pre className="text-xs sm:text-sm font-mono whitespace-pre-wrap break-words">
                    {formatReportAsText(report)}
                  </pre>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold text-primary">{report.summary.totalDaysSober}</div>
                    <div className="text-xs text-muted-foreground">Days Sober</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{Math.round(report.summary.checkInRate)}%</div>
                    <div className="text-xs text-muted-foreground">Check-in Rate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{report.summary.averageMood.toFixed(1)}/5</div>
                    <div className="text-xs text-muted-foreground">Avg Mood</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">{Math.round(report.summary.successRate)}%</div>
                    <div className="text-xs text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Share Actions */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleShareEmail}
              disabled={!report || !selectedContact || !selectedContact.email}
              className="flex-1 sm:flex-none"
            >
              <Mail className="w-4 h-4 mr-2" />
              Share via Email
            </Button>

            <Button
              onClick={handleDownload}
              disabled={!report}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Download className="w-4 h-4 mr-2" />
              Download as Text
            </Button>

            <Button
              onClick={handleCopyToClipboard}
              disabled={!report}
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </>
              )}
            </Button>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-500/10 border border-gray-300 rounded-lg p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400">
              <strong>Privacy Notice:</strong> Reports are generated locally on your device.
              When sharing via email, your default email client will open with the report pre-filled.
              You can review and edit the content before sending.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
