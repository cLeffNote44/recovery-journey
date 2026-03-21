/**
 * Export Data Modal
 *
 * Allows users to export their recovery data in CSV format
 * with options for data type selection and date range filtering
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, X, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  exportData,
  exportAllDataCSV,
  downloadMultipleCSVs,
  type ExportDataType,
  type CSVExportOptions
} from '@/lib/csv-export';
import type { CheckIn, Craving, Meeting, Meditation, GrowthLog, Goal, Contact } from '@/types/app';

interface ExportDataModalProps {
  onClose: () => void;
  checkIns: CheckIn[];
  cravings: Craving[];
  meetings: Meeting[];
  meditations: Meditation[];
  growthLogs: GrowthLog[];
  goals: Goal[];
  contacts: Contact[];
  analyticsSummary?: any;
}

export function ExportDataModal({
  onClose,
  checkIns,
  cravings,
  meetings,
  meditations,
  growthLogs,
  goals,
  contacts,
  analyticsSummary
}: ExportDataModalProps) {
  const [selectedTypes, setSelectedTypes] = useState<ExportDataType[]>(['all']);
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | undefined>();
  const [useDateRange, setUseDateRange] = useState(false);
  const [separator, setSeparator] = useState<',' | ';' | '\t'>(',');

  const dataTypeOptions = [
    { value: 'all', label: 'All Data (Multiple Files)', count: -1 },
    { value: 'checkins', label: 'Check-Ins', count: checkIns.length },
    { value: 'cravings', label: 'Cravings', count: cravings.length },
    { value: 'meetings', label: 'Meetings', count: meetings.length },
    { value: 'meditations', label: 'Meditations', count: meditations.length },
    { value: 'growthLogs', label: 'Growth Logs', count: growthLogs.length },
    { value: 'goals', label: 'Goals', count: goals.length },
    { value: 'contacts', label: 'Contacts', count: contacts.length },
    { value: 'analytics', label: 'Analytics Summary', count: analyticsSummary ? 1 : 0 }
  ];

  const toggleDataType = (type: ExportDataType) => {
    if (type === 'all') {
      setSelectedTypes(['all']);
    } else {
      const newTypes = selectedTypes.includes(type)
        ? selectedTypes.filter(t => t !== type && t !== 'all')
        : [...selectedTypes.filter(t => t !== 'all'), type];

      setSelectedTypes(newTypes.length === 0 ? ['all'] : newTypes);
    }
  };

  const handleExport = () => {
    const options: Partial<CSVExportOptions> = {
      separator,
      dateRange: useDateRange && dateRange?.start && dateRange?.end ? dateRange : undefined
    };

    const allData = {
      checkIns,
      cravings,
      meetings,
      meditations,
      growthLogs,
      goals,
      contacts,
      analyticsSummary
    };

    try {
      if (selectedTypes.includes('all')) {
        // Export all data as multiple CSV files
        const files = exportAllDataCSV(allData, options);
        const timestamp = new Date().toISOString().split('T')[0];
        downloadMultipleCSVs(files, `recovery-journey-${timestamp}`);
        toast.success(`Exported ${files.size} CSV files successfully!`);
      } else {
        // Export selected types
        selectedTypes.forEach(type => {
          exportData(type, allData, options);
        });
        toast.success(`Exported ${selectedTypes.length} file(s) successfully!`);
      }

      onClose();
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    }
  };

  const isAllSelected = selectedTypes.includes('all');
  const selectedCount = isAllSelected
    ? dataTypeOptions.slice(1).filter(opt => opt.count > 0).length
    : selectedTypes.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-opacity-100 backdrop-blur-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Recovery Data
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Data Type Selection */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Select Data to Export</Label>
            <p className="text-sm text-muted-foreground">
              Choose which types of data you want to export. Each type will be saved as a separate CSV file.
            </p>

            <div className="grid gap-2">
              {dataTypeOptions.map((option) => {
                const isSelected = isAllSelected || selectedTypes.includes(option.value as ExportDataType);
                const isDisabled = option.count === 0 && option.value !== 'all';

                return (
                  <div
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-900'
                    } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    onClick={() => !isDisabled && toggleDataType(option.value as ExportDataType)}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => toggleDataType(option.value as ExportDataType)}
                    />
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      {option.count !== -1 && (
                        <div className="text-xs text-muted-foreground">
                          {option.count} record{option.count !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="use-date-range"
                checked={useDateRange}
                onCheckedChange={(checked) => setUseDateRange(checked as boolean)}
              />
              <Label htmlFor="use-date-range" className="cursor-pointer">
                Filter by Date Range (optional)
              </Label>
            </div>

            {useDateRange && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={dateRange?.start || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value, end: prev?.end || '' }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={dateRange?.end || ''}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: prev?.start || '', end: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          {/* CSV Separator */}
          <div className="space-y-2">
            <Label htmlFor="separator">CSV Separator</Label>
            <Select value={separator} onValueChange={(value) => setSeparator(value as ',' | ';' | '\t')}>
              <SelectTrigger id="separator">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value=",">Comma (,) - Standard</SelectItem>
                <SelectItem value=";">Semicolon (;) - European</SelectItem>
                <SelectItem value="\t">Tab (\t) - Tab-separated</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the separator that works best with your spreadsheet software.
            </p>
          </div>

          {/* Export Summary */}
          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Export Summary</h4>
            <ul className="text-sm space-y-1">
              <li>
                <strong>{selectedCount}</strong> data type{selectedCount !== 1 ? 's' : ''} selected
              </li>
              {useDateRange && dateRange?.start && dateRange?.end && (
                <li>
                  Date range: <strong>{new Date(dateRange.start).toLocaleDateString()}</strong> to{' '}
                  <strong>{new Date(dateRange.end).toLocaleDateString()}</strong>
                </li>
              )}
              <li>
                Format: <strong>CSV</strong> (Excel & Google Sheets compatible)
              </li>
              <li className="text-xs text-muted-foreground mt-2">
                Files will be downloaded to your default downloads folder
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleExport} className="flex-1" disabled={selectedCount === 0}>
              <Download className="w-4 h-4 mr-2" />
              Export {selectedCount > 0 ? `(${selectedCount} file${selectedCount !== 1 ? 's' : ''})` : ''}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
