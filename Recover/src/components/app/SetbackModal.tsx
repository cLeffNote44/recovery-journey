import { useState, useEffect } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, HelpCircle, X } from 'lucide-react';
import { TRIGGER_TYPES } from '@/types/app';
import type { Setback, SetbackType } from '@/types/app';
import { toast } from 'sonner';
import { setbackSchema, validateFormWithToast } from '@/lib/validation-schemas';

interface SetbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (setback: Setback) => void;
}

/**
 * Modal for recording slips or relapses in recovery.
 *
 * Distinction:
 * - Slip: Brief lapse, quick recovery (hours to 1-2 days)
 * - Relapse: Extended return to use (multiple days or longer)
 *
 * This component helps users reflect on setbacks and plan for continued recovery.
 */
export function SetbackModal({ isOpen, onClose, onSubmit }: SetbackModalProps) {
  const { setSobrietyDate, setbacks } = useAppData();

  const [type, setType] = useState<SetbackType>('slip');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [trigger, setTrigger] = useState('');
  const [customTrigger, setCustomTrigger] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [whatLearned, setWhatLearned] = useState('');
  const [copingStrategies, setCopingStrategies] = useState('');
  const [supportUsed, setSupportUsed] = useState('');
  const [continuingRecovery, setContinuingRecovery] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setType('slip');
      setDate(new Date().toISOString().split('T')[0]);
      setDuration('');
      setTrigger('');
      setCustomTrigger('');
      setWhatHappened('');
      setWhatLearned('');
      setCopingStrategies('');
      setSupportUsed('');
      setContinuingRecovery(true);
      setShowHelp(false);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    // Validate form data with Zod
    const formData = {
      type,
      date,
      duration: duration.trim() || undefined,
      trigger: trigger || undefined,
      customTrigger: customTrigger.trim() || undefined,
      whatHappened: whatHappened.trim(),
      whatLearned: whatLearned.trim() || undefined,
      copingStrategies: copingStrategies.trim() || undefined,
      supportUsed: supportUsed.trim() || undefined,
      continuingRecovery
    };

    const validatedData = validateFormWithToast(setbackSchema, formData, toast);
    if (!validatedData) {
      return;
    }

    const newSetback: Setback = {
      id: Date.now(),
      date: validatedData.date,
      type: validatedData.type,
      duration: validatedData.duration,
      trigger: validatedData.trigger === 'Other' ? validatedData.customTrigger : validatedData.trigger,
      whatHappened: validatedData.whatHappened,
      whatLearned: validatedData.whatLearned,
      copingStrategies: validatedData.copingStrategies,
      supportUsed: validatedData.supportUsed,
      continuingRecovery: validatedData.continuingRecovery
    };

    // Submit the setback
    onSubmit(newSetback);

    // If continuing recovery, reset sobriety date to today or day after setback
    if (continuingRecovery) {
      const resetDate = new Date(date);
      resetDate.setDate(resetDate.getDate() + 1);
      const newSobrietyDate = resetDate.toISOString().split('T')[0];
      setSobrietyDate(newSobrietyDate);

      toast.success(
        type === 'slip'
          ? 'Slip recorded. Your recovery journey continues! 💪'
          : 'Relapse recorded. You\'re back on track - keep going! 💪',
        { duration: 5000 }
      );
    } else {
      toast.info('Setback recorded. Reach out for support when you\'re ready to continue.');
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col bg-opacity-100 backdrop-blur-none">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              <CardTitle>Record a Setback</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(!showHelp)}
                className="text-muted-foreground"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {showHelp && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-sm space-y-2">
              <p className="font-semibold">Understanding Slips vs. Relapses:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li><strong>Slip:</strong> A brief lapse - you used once or for a short time (hours to 1-2 days) and quickly got back on track</li>
                <li><strong>Relapse:</strong> A return to regular use over multiple days or longer</li>
              </ul>
              <p className="text-muted-foreground mt-2">
                Either way, setbacks are part of recovery. What matters is learning from them and continuing forward.
              </p>
            </div>
          )}
        </CardHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                What happened? <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={type === 'slip' ? 'default' : 'outline'}
                  onClick={() => setType('slip')}
                  className="h-auto py-4 flex flex-col items-start"
                >
                  <span className="text-lg font-bold">Slip</span>
                  <span className="text-xs opacity-75 font-normal mt-1">
                    Brief lapse, quick recovery
                  </span>
                </Button>
                <Button
                  type="button"
                  variant={type === 'relapse' ? 'default' : 'outline'}
                  onClick={() => setType('relapse')}
                  className="h-auto py-4 flex flex-col items-start"
                >
                  <span className="text-lg font-bold">Relapse</span>
                  <span className="text-xs opacity-75 font-normal mt-1">
                    Extended return to use
                  </span>
                </Button>
              </div>
            </div>

            {/* Date */}
            <div>
              <Label htmlFor="date" className="text-sm font-medium mb-2 block">
                When did this happen?
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Duration */}
            <div>
              <Label htmlFor="duration" className="text-sm font-medium mb-2 block">
                How long? (optional)
              </Label>
              <Input
                id="duration"
                type="text"
                placeholder='e.g., "2 hours", "3 days"'
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              />
            </div>

            {/* Trigger */}
            <div>
              <Label htmlFor="trigger" className="text-sm font-medium mb-2 block">
                What triggered it? (optional)
              </Label>
              <select
                id="trigger"
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground"
              >
                <option value="">Select a trigger...</option>
                {TRIGGER_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {trigger === 'Other' && (
                <Input
                  type="text"
                  placeholder="Describe the trigger..."
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            {/* What Happened */}
            <div>
              <Label htmlFor="whatHappened" className="text-sm font-medium mb-2 block">
                What happened? <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="whatHappened"
                placeholder="Describe the situation... being honest helps with healing"
                value={whatHappened}
                onChange={(e) => setWhatHappened(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* What Learned */}
            <div>
              <Label htmlFor="whatLearned" className="text-sm font-medium mb-2 block">
                What did you learn? (optional)
              </Label>
              <Textarea
                id="whatLearned"
                placeholder="What insights or lessons came from this experience?"
                value={whatLearned}
                onChange={(e) => setWhatLearned(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Coping Strategies */}
            <div>
              <Label htmlFor="copingStrategies" className="text-sm font-medium mb-2 block">
                What will you do differently next time? (optional)
              </Label>
              <Textarea
                id="copingStrategies"
                placeholder="What strategies or actions will you use to handle similar situations?"
                value={copingStrategies}
                onChange={(e) => setCopingStrategies(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Support Used */}
            <div>
              <Label htmlFor="supportUsed" className="text-sm font-medium mb-2 block">
                Did you reach out for support? (optional)
              </Label>
              <Textarea
                id="supportUsed"
                placeholder="Who did you talk to? What resources did you use?"
                value={supportUsed}
                onChange={(e) => setSupportUsed(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Continuing Recovery */}
            <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
              <input
                id="continuingRecovery"
                type="checkbox"
                checked={continuingRecovery}
                onChange={(e) => setContinuingRecovery(e.target.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor="continuingRecovery" className="text-sm font-medium cursor-pointer">
                  I'm continuing my recovery journey
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {continuingRecovery
                    ? 'Your current streak will reset, but your total recovery days will continue counting. You\'ve got this! 💪'
                    : 'Your progress will be recorded, but your streak won\'t reset yet. Reach out for support when you\'re ready.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <CardContent className="flex-shrink-0 border-t pt-4 pb-6 bg-background">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-slate-600 to-gray-700"
              disabled={!whatHappened.trim()}
            >
              Record Setback
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
