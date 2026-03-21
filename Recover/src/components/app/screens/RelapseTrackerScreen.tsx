import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/EmptyState';
import { TrendingUp, Heart, AlertCircle, Eye, EyeOff, Trash2, Plus, Shield, LineChart } from 'lucide-react';
import {
  formatDate,
  calculateDaysSober,
  calculateDaysCleanBefore,
  createRelapseEntry,
  processRelapseImpact
} from '@/lib/utils';
import { toast } from 'sonner';
import type { Relapse, CleanPeriod } from '@/types/app';
import { RELAPSE_TRIGGERS, RELAPSE_EMOTIONS, SUPPORT_TYPES } from '@/types/app';

export function RelapseTrackerScreen() {
  const {
    relapses,
    setRelapses,
    cleanPeriods,
    setCleanPeriods,
    sobrietyDate,
    setSobrietyDate,
    loading
  } = useAppData();

  const [activeTab, setActiveTab] = useState('progress');
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedRelapse, setSelectedRelapse] = useState<Relapse | null>(null);

  // Relapse form state
  const [newRelapse, setNewRelapse] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    substance: '',
    triggers: [] as string[],
    circumstances: '',
    emotions: [] as string[],
    thoughts: '',
    consequences: '',
    lessonsLearned: '',
    preventionPlan: '',
    supportUsed: [] as string[],
    severity: 5,
    isPrivate: false
  });

  // Note: calculateDaysCleanBefore is now imported from utils-app

  // Handle logging a relapse
  const handleLogRelapse = () => {
    if (!newRelapse.circumstances.trim()) {
      toast.error('Please describe what happened');
      return;
    }

    if (newRelapse.triggers.length === 0) {
      toast.error('Please select at least one trigger');
      return;
    }

    // Calculate days clean before relapse
    const daysCleanBefore = calculateDaysCleanBefore(newRelapse.date, cleanPeriods, sobrietyDate);

    // Create relapse entry
    const relapse = createRelapseEntry(newRelapse, daysCleanBefore);

    // Process impact on clean periods
    const updatedPeriods = processRelapseImpact(newRelapse.date, relapse.id, cleanPeriods);
    setCleanPeriods(updatedPeriods);

    // Update sobriety date to new start (day after relapse)
    const newPeriod = updatedPeriods[updatedPeriods.length - 1]!;
    setSobrietyDate(newPeriod.startDate);

    // Save relapse
    setRelapses([...relapses, relapse]);

    // Reset form
    setShowLogForm(false);
    setNewRelapse({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      substance: '',
      triggers: [],
      circumstances: '',
      emotions: [],
      thoughts: '',
      consequences: '',
      lessonsLearned: '',
      preventionPlan: '',
      supportUsed: [],
      severity: 5,
      isPrivate: false
    });

    toast.success('Relapse logged. Remember: Recovery is a journey, not a destination. You\'re showing courage by tracking this.');
    setActiveTab('progress');
  };

  const handleDeleteRelapse = (id: number) => {
    if (confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      setRelapses(relapses.filter(r => r.id !== id));
      toast.success('Entry deleted');
    }
  };

  const togglePrivacy = (id: number) => {
    setRelapses(relapses.map(r =>
      r.id === id ? { ...r, isPrivate: !r.isPrivate } : r
    ));
  };

  // Calculate pattern analysis
  const getPatternAnalysis = () => {
    if (relapses.length === 0) return null;

    // Most common triggers
    const triggerCounts = new Map<string, number>();
    relapses.forEach(r => {
      r.triggers.forEach(t => {
        triggerCounts.set(t, (triggerCounts.get(t) || 0) + 1);
      });
    });
    const topTriggers = Array.from(triggerCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Most common emotions
    const emotionCounts = new Map<string, number>();
    relapses.forEach(r => {
      r.emotions.forEach(e => {
        emotionCounts.set(e, (emotionCounts.get(e) || 0) + 1);
      });
    });
    const topEmotions = Array.from(emotionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Average severity
    const avgSeverity = relapses.reduce((sum, r) => sum + r.severity, 0) / relapses.length;

    // Support usage
    const supportCounts = new Map<string, number>();
    relapses.forEach(r => {
      r.supportUsed.forEach(s => {
        supportCounts.set(s, (supportCounts.get(s) || 0) + 1);
      });
    });

    return {
      topTriggers,
      topEmotions,
      avgSeverity,
      supportCounts,
      totalRelapses: relapses.length
    };
  };

  const patterns = getPatternAnalysis();

  // Calculate total recovery days (sum of all clean periods)
  const totalRecoveryDays = cleanPeriods.reduce((sum, period) => sum + period.daysClean, 0) +
    (cleanPeriods.find(p => !p.endDate)?.daysClean || calculateDaysSober(sobrietyDate));

  if (loading) {
    return (
      <div className="p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading recovery data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recovery Journey</h2>
          <p className="text-sm text-muted-foreground">
            Track your progress with compassion and honesty
          </p>
        </div>
        {activeTab === 'progress' && (
          <Button onClick={() => setShowLogForm(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Log Setback
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">
            <Heart className="w-4 h-4 mr-2" />
            Progress
          </TabsTrigger>
          <TabsTrigger value="patterns">
            <LineChart className="w-4 h-4 mr-2" />
            Patterns
          </TabsTrigger>
          <TabsTrigger value="history">
            <TrendingUp className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm opacity-90">Current Clean Period</p>
                  <p className="text-4xl font-bold">{calculateDaysSober(sobrietyDate)} Days</p>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <p className="text-sm opacity-90">Total Recovery Days</p>
                  <p className="text-2xl font-semibold">{totalRecoveryDays} Days</p>
                  <p className="text-xs opacity-75 mt-1">
                    Every day of sobriety counts toward your recovery
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {cleanPeriods.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Clean Periods Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cleanPeriods
                    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
                    .map(period => {
                      const days = period.endDate
                        ? Math.floor(
                            (new Date(period.endDate).getTime() - new Date(period.startDate).getTime()) /
                            (1000 * 60 * 60 * 24)
                          )
                        : calculateDaysSober(period.startDate);

                      return (
                        <div
                          key={period.id}
                          className={`p-4 rounded-lg border ${
                            period.endDate ? 'bg-gray-50' : 'bg-green-50 border-green-200'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">
                                {formatDate(period.startDate)}
                                {period.endDate && ` - ${formatDate(period.endDate)}`}
                                {!period.endDate && ' - Present'}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                <span className="font-medium">{days} days clean</span>
                                {!period.endDate && ' and counting!'}
                              </p>
                              {period.notes && (
                                <p className="text-sm text-gray-500 mt-2">{period.notes}</p>
                              )}
                            </div>
                            {!period.endDate && (
                              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
                                Active
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <p className="font-semibold text-blue-900">Remember</p>
                  <p className="text-sm text-blue-800 mt-1">
                    Recovery isn't about being perfect—it's about progress. Each clean day is a victory,
                    and setbacks are opportunities to learn and strengthen your recovery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patterns Tab */}
        <TabsContent value="patterns" className="space-y-4">
          {!patterns ? (
            <EmptyState
              icon={<LineChart className="w-12 h-12 text-gray-400" />}
              title="No pattern data yet"
              description="Log your journey to identify patterns and strengthen your recovery."
            />
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Pattern Insights</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Understanding your patterns helps prevent future setbacks
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="font-semibold mb-3">Most Common Triggers</p>
                    <div className="space-y-2">
                      {patterns.topTriggers.map(([trigger, count]) => (
                        <div key={trigger} className="flex justify-between items-center">
                          <span className="text-sm">{trigger}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full"
                                style={{
                                  width: `${(count / patterns.totalRelapses) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-8">{count}x</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <p className="font-semibold mb-3">Most Common Emotions</p>
                    <div className="space-y-2">
                      {patterns.topEmotions.map(([emotion, count]) => (
                        <div key={emotion} className="flex justify-between items-center">
                          <span className="text-sm">{emotion}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{
                                  width: `${(count / patterns.totalRelapses) * 100}%`
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-8">{count}x</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <p className="font-semibold mb-2">Average Severity</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-orange-500 h-3 rounded-full"
                          style={{ width: `${(patterns.avgSeverity / 10) * 100}%` }}
                        />
                      </div>
                      <span className="font-medium">{patterns.avgSeverity.toFixed(1)}/10</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-amber-50 border-amber-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
                    <div>
                      <p className="font-semibold text-amber-900">Action Plan</p>
                      <p className="text-sm text-amber-800 mt-1">
                        Based on your patterns, focus on managing your top triggers. Consider:
                      </p>
                      <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
                        <li>Creating specific coping strategies for identified triggers</li>
                        <li>Practicing emotional regulation techniques</li>
                        <li>Building a stronger support network</li>
                        <li>Discussing patterns with your sponsor or therapist</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {relapses.length === 0 ? (
            <EmptyState
              icon={<Heart className="w-12 h-12 text-gray-400" />}
              title="No entries yet"
              description="Your recovery journey data will appear here."
            />
          ) : (
            <div className="space-y-4">
              {relapses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(relapse => (
                  <Card key={relapse.id} className="relative">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{formatDate(relapse.date)}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">
                          After {relapse.daysCleanBefore} days clean
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePrivacy(relapse.id)}
                          title={relapse.isPrivate ? 'Show details' : 'Hide details'}
                        >
                          {relapse.isPrivate ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRelapse(relapse.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardHeader>
                    {!relapse.isPrivate && (
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Triggers</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {relapse.triggers.map((trigger, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                              >
                                {trigger}
                              </span>
                            ))}
                          </div>
                        </div>

                        {relapse.emotions.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">Emotions</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {relapse.emotions.map((emotion, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs"
                                >
                                  {emotion}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {relapse.circumstances && (
                          <div>
                            <p className="text-sm font-medium text-gray-600">What Happened</p>
                            <p className="text-sm mt-1">{relapse.circumstances}</p>
                          </div>
                        )}

                        {relapse.lessonsLearned && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-green-900">Lessons Learned</p>
                            <p className="text-sm text-green-800 mt-1">{relapse.lessonsLearned}</p>
                          </div>
                        )}

                        {relapse.preventionPlan && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm font-medium text-blue-900">Prevention Plan</p>
                            <p className="text-sm text-blue-800 mt-1">{relapse.preventionPlan}</p>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t">
                          <span>Severity: {relapse.severity}/10</span>
                          {relapse.time && <span>{relapse.time}</span>}
                        </div>
                      </CardContent>
                    )}
                    {relapse.isPrivate && (
                      <CardContent>
                        <p className="text-sm text-gray-500 italic">
                          Details hidden for privacy
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Log Relapse Modal */}
      {showLogForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>Log a Setback</CardTitle>
              <p className="text-sm text-muted-foreground">
                Remember: Recovery is about progress, not perfection. Use this to learn and grow stronger.
              </p>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={newRelapse.date}
                    onChange={(e) => setNewRelapse({ ...newRelapse, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label>Time (optional)</Label>
                  <Input
                    type="time"
                    value={newRelapse.time}
                    onChange={(e) => setNewRelapse({ ...newRelapse, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>What triggered this? (Select all that apply) *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {RELAPSE_TRIGGERS.map(trigger => (
                    <label key={trigger} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newRelapse.triggers.includes(trigger)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewRelapse({
                              ...newRelapse,
                              triggers: [...newRelapse.triggers, trigger]
                            });
                          } else {
                            setNewRelapse({
                              ...newRelapse,
                              triggers: newRelapse.triggers.filter(t => t !== trigger)
                            });
                          }
                        }}
                      />
                      {trigger}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>What happened? *</Label>
                <Textarea
                  value={newRelapse.circumstances}
                  onChange={(e) => setNewRelapse({ ...newRelapse, circumstances: e.target.value })}
                  placeholder="Describe the situation..."
                  rows={3}
                />
              </div>

              <div>
                <Label>How were you feeling? (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {RELAPSE_EMOTIONS.map(emotion => (
                    <label key={emotion} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newRelapse.emotions.includes(emotion)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewRelapse({
                              ...newRelapse,
                              emotions: [...newRelapse.emotions, emotion]
                            });
                          } else {
                            setNewRelapse({
                              ...newRelapse,
                              emotions: newRelapse.emotions.filter(e => e !== emotion)
                            });
                          }
                        }}
                      />
                      {emotion}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>What were you thinking before it happened?</Label>
                <Textarea
                  value={newRelapse.thoughts}
                  onChange={(e) => setNewRelapse({ ...newRelapse, thoughts: e.target.value })}
                  placeholder="Your thought patterns..."
                  rows={2}
                />
              </div>

              <div>
                <Label>What support did you try to use?</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {SUPPORT_TYPES.map(support => (
                    <label key={support} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newRelapse.supportUsed.includes(support)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewRelapse({
                              ...newRelapse,
                              supportUsed: [...newRelapse.supportUsed, support]
                            });
                          } else {
                            setNewRelapse({
                              ...newRelapse,
                              supportUsed: newRelapse.supportUsed.filter(s => s !== support)
                            });
                          }
                        }}
                      />
                      {support}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Severity: {newRelapse.severity}/10</Label>
                <Slider
                  value={[newRelapse.severity]}
                  onValueChange={([value]) => setNewRelapse({ ...newRelapse, severity: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>What did you learn from this?</Label>
                <Textarea
                  value={newRelapse.lessonsLearned}
                  onChange={(e) => setNewRelapse({ ...newRelapse, lessonsLearned: e.target.value })}
                  placeholder="Insights you gained..."
                  rows={3}
                />
              </div>

              <div>
                <Label>What will you do differently next time?</Label>
                <Textarea
                  value={newRelapse.preventionPlan}
                  onChange={(e) => setNewRelapse({ ...newRelapse, preventionPlan: e.target.value })}
                  placeholder="Your plan to prevent this in the future..."
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="private"
                  checked={newRelapse.isPrivate}
                  onCheckedChange={(checked) =>
                    setNewRelapse({ ...newRelapse, isPrivate: !!checked })
                  }
                />
                <Label htmlFor="private" className="cursor-pointer">
                  Keep details private (hide from exports/shares)
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleLogRelapse} className="flex-1">
                  Log Setback
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLogForm(false);
                    setNewRelapse({
                      date: new Date().toISOString().split('T')[0],
                      time: new Date().toTimeString().slice(0, 5),
                      substance: '',
                      triggers: [],
                      circumstances: '',
                      emotions: [],
                      thoughts: '',
                      consequences: '',
                      lessonsLearned: '',
                      preventionPlan: '',
                      supportUsed: [],
                      severity: 5,
                      isPrivate: false
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
