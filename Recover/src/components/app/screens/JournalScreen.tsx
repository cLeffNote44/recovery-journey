import { useState } from 'react';
import { useRecoveryStore } from '@/stores/useRecoveryStore';
import { useJournalStore } from '@/stores/useJournalStore';
import { useActivitiesStore } from '@/stores/useActivitiesStore';
import { useSettingsStore } from '@/stores/useSettingsStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { HALTCheck } from '@/components/HALTCheck';
import { EmptyState } from '@/components/EmptyState';
import { JournalScreenSkeleton } from '@/components/LoadingSkeletons';
import { AlertTriangle, TrendingUp, Target, Heart, Plus, Trash2, Users, Eye, EyeOff } from 'lucide-react';
import { TRIGGER_TYPES, MEDITATION_TYPES, RELAPSE_TRIGGERS, RELAPSE_EMOTIONS, SUPPORT_TYPES } from '@/types/app';
import type { HALTCheck as HALTCheckType, Relapse, CleanPeriod } from '@/types/app';
import {
  formatDate,
  calculateDaysSober,
  calculateDaysCleanBefore,
  createRelapseEntry,
  processRelapseImpact
} from '@/lib/utils';
import { toast } from 'sonner';

export function JournalScreen() {
  // Zustand stores
  const sobrietyDate = useRecoveryStore((state) => state.sobrietyDate);
  const setSobrietyDate = useRecoveryStore((state) => state.setSobrietyDate);
  const relapses = useRecoveryStore((state) => state.relapses);
  const setRelapses = useRecoveryStore((state) => state.setRelapses);
  const cleanPeriods = useRecoveryStore((state) => state.cleanPeriods);
  const setCleanPeriods = useRecoveryStore((state) => state.setCleanPeriods);

  const meetings = useJournalStore((state) => state.meetings);
  const setMeetings = useJournalStore((state) => state.setMeetings);
  const growthLogs = useJournalStore((state) => state.growthLogs);
  const setGrowthLogs = useJournalStore((state) => state.setGrowthLogs);
  const challenges = useJournalStore((state) => state.challenges);
  const setChallenges = useJournalStore((state) => state.setChallenges);
  const gratitude = useJournalStore((state) => state.gratitude);
  const setGratitude = useJournalStore((state) => state.setGratitude);
  const meditations = useJournalStore((state) => state.meditations);
  const setMeditations = useJournalStore((state) => state.setMeditations);

  const cravings = useActivitiesStore((state) => state.cravings);
  const setCravings = useActivitiesStore((state) => state.setCravings);

  const celebrationsEnabled = useSettingsStore((state) => state.celebrationsEnabled);

  // No loading state needed with Zustand
  const loading = false;

  const [activeTab, setActiveTab] = useState('cravings');

  // Craving state
  const [showAddCraving, setShowAddCraving] = useState(false);
  const [newCraving, setNewCraving] = useState({
    intensity: 5,
    trigger: 'Stress',
    triggerNotes: '',
    copingStrategy: '',
    overcame: false
  });
  const [showHALTInCraving, setShowHALTInCraving] = useState(false);
  const [cravingHaltData, setCravingHaltData] = useState<HALTCheckType | null>(null);

  // Meeting state
  const [showAddMeeting, setShowAddMeeting] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    type: 'AA',
    location: '',
    notes: ''
  });

  // Growth log state
  const [showAddGrowth, setShowAddGrowth] = useState(false);
  const [newGrowth, setNewGrowth] = useState({
    title: '',
    description: ''
  });

  // Challenge state
  const [showAddChallenge, setShowAddChallenge] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    situation: '',
    response: '',
    outcome: ''
  });

  // Gratitude state
  const [showAddGratitude, setShowAddGratitude] = useState(false);
  const [newGratitudeEntry, setNewGratitudeEntry] = useState('');

  // Meditation state
  const [showAddMeditation, setShowAddMeditation] = useState(false);
  const [newMeditation, setNewMeditation] = useState({
    duration: 10,
    type: 'Mindfulness',
    notes: ''
  });

  // Setback state
  const [showLogSetback, setShowLogSetback] = useState(false);
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

  const handleAddCraving = () => {
    setCravings([...cravings, {
      id: Date.now(),
      date: new Date().toISOString(),
      ...newCraving,
      halt: cravingHaltData || undefined
    }]);
    setShowAddCraving(false);
    setNewCraving({ intensity: 5, trigger: 'Stress', triggerNotes: '', copingStrategy: '', overcame: false });
    setShowHALTInCraving(false);
    setCravingHaltData(null);

    // Show success message
    if (newCraving.overcame) {
      toast.success('Great job overcoming that craving! 💪');
    } else {
      toast.success('Craving logged. You\'re tracking your journey!');
    }
  };

  const handleAddMeeting = () => {
    setMeetings([...meetings, {
      id: Date.now(),
      date: new Date().toISOString(),
      ...newMeeting
    }]);
    setShowAddMeeting(false);
    setNewMeeting({ type: 'AA', location: '', notes: '' });
    toast.success('Meeting logged! Keep showing up 👏');
  };

  const handleAddGrowth = () => {
    setGrowthLogs([...growthLogs, {
      id: Date.now(),
      date: new Date().toISOString(),
      ...newGrowth
    }]);
    setShowAddGrowth(false);
    setNewGrowth({ title: '', description: '' });
    toast.success('Growth logged! You\'re making progress 🌱');
  };

  const handleAddChallenge = () => {
    setChallenges([...challenges, {
      id: Date.now(),
      date: new Date().toISOString(),
      ...newChallenge
    }]);
    setShowAddChallenge(false);
    setNewChallenge({ situation: '', response: '', outcome: '' });
    toast.success('Challenge documented! Learning from experience 💪');
  };

  const handleAddGratitude = () => {
    setGratitude([...gratitude, {
      id: Date.now(),
      date: new Date().toISOString(),
      entry: newGratitudeEntry
    }]);
    setShowAddGratitude(false);
    setNewGratitudeEntry('');
    toast.success('Gratitude recorded! Staying positive ❤️');
  };

  const handleAddMeditation = () => {
    setMeditations([...meditations, {
      id: Date.now(),
      date: new Date().toISOString(),
      ...newMeditation
    }]);
    setShowAddMeditation(false);
    setNewMeditation({ duration: 10, type: 'Mindfulness', notes: '' });
    toast.success('Meditation logged! Taking care of yourself 🧘');
  };

  // Handle logging a setback
  const handleLogSetback = () => {
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
    setShowLogSetback(false);
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

    toast.success('Setback logged. Remember: Recovery is a journey, not a destination.');
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

  // Celebrate craving overcome with confetti
  const handleAddCravingWithCelebration = () => {
    handleAddCraving();
    if (celebrationsEnabled && newCraving.overcame) {
      setTimeout(() => {
        const { celebrate } = require('@/lib/celebrations');
        celebrate('cravingOvercome');
      }, 300);
    }
  };

  // Show loading skeleton while data is loading
  if (loading) {
    return <JournalScreenSkeleton />;
  }

  return (
    <div className="space-y-6 pb-20">
      <h2 className="text-2xl font-bold">Journal</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="cravings">Cravings</TabsTrigger>
          <TabsTrigger value="meetings">Meetings</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="setbacks">Setbacks</TabsTrigger>
        </TabsList>

        {/* Cravings Tab */}
        <TabsContent value="cravings" className="space-y-4">
          <Button onClick={() => setShowAddCraving(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Log Craving
          </Button>

          {cravings.slice().reverse().map(craving => (
            <Card key={craving.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-muted-foreground">{formatDate(craving.date)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setCravings(cravings.filter(c => c.id !== craving.id));
                      toast.success('Craving entry deleted');
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Intensity:</span>
                    <span className="text-sm">{craving.intensity}/10</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Trigger:</span>
                    <span className="text-sm">{craving.trigger}</span>
                  </div>
                  {craving.triggerNotes && (
                    <p className="text-sm text-muted-foreground">{craving.triggerNotes}</p>
                  )}
                  {craving.copingStrategy && (
                    <div>
                      <span className="text-sm font-medium">Coping:</span>
                      <p className="text-sm text-muted-foreground">{craving.copingStrategy}</p>
                    </div>
                  )}
                  {craving.overcame && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Target className="w-4 h-4" />
                      <span className="text-sm font-medium">Successfully overcame</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {cravings.length === 0 && (
            <EmptyState
              icon={AlertTriangle}
              title="No Cravings Logged"
              description="Track your cravings here to identify patterns and triggers. Understanding what causes cravings helps you develop better coping strategies."
              actionLabel="Log First Craving"
              onAction={() => setShowAddCraving(true)}
              iconColor="text-orange-500"
            />
          )}
        </TabsContent>

        {/* Meetings Tab */}
        <TabsContent value="meetings" className="space-y-4">
          <Button onClick={() => setShowAddMeeting(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Log Meeting
          </Button>

          {meetings.slice().reverse().map(meeting => (
            <Card key={meeting.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{formatDate(meeting.date)}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setMeetings(meetings.filter(m => m.id !== meeting.id));
                      toast.success('Meeting entry deleted');
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h4 className="font-semibold">{meeting.type}</h4>
                <p className="text-sm text-muted-foreground">{meeting.location}</p>
                {meeting.notes && (
                  <p className="text-sm mt-2">{meeting.notes}</p>
                )}
              </CardContent>
            </Card>
          ))}

          {meetings.length === 0 && (
            <EmptyState
              icon={Users}
              title="No Meetings Logged"
              description="Keep track of your AA, NA, or support group meetings. Regular meeting attendance is a cornerstone of successful recovery."
              actionLabel="Log First Meeting"
              onAction={() => setShowAddMeeting(true)}
              iconColor="text-blue-500"
            />
          )}
        </TabsContent>

        {/* Growth Tab */}
        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => setShowAddGrowth(true)} variant="outline">
              <TrendingUp className="w-4 h-4 mr-2" />
              Growth Log
            </Button>
            <Button onClick={() => setShowAddChallenge(true)} variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Challenge
            </Button>
            <Button onClick={() => setShowAddGratitude(true)} variant="outline">
              <Heart className="w-4 h-4 mr-2" />
              Gratitude
            </Button>
            <Button onClick={() => setShowAddMeditation(true)} variant="outline">
              Meditation
            </Button>
          </div>

          {[...growthLogs, ...challenges, ...gratitude, ...meditations].length === 0 && (
            <EmptyState
              icon={TrendingUp}
              title="Start Your Growth Journey"
              description="Document your recovery milestones, daily gratitudes, challenges overcome, and meditation practice. These entries help you reflect on your progress and stay motivated."
              iconColor="text-green-500"
            />
          )}

          <div className="space-y-3">
            {[...growthLogs, ...challenges, ...gratitude, ...meditations]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 20)
              .map(entry => {
                const isGrowth = 'title' in entry && 'description' in entry && !('situation' in entry);
                const isChallenge = 'situation' in entry;
                const isGratitude = 'entry' in entry;
                const isMeditation = 'duration' in entry;

                return (
                  <Card key={entry.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (isGrowth) {
                              setGrowthLogs(growthLogs.filter(g => g.id !== entry.id));
                              toast.success('Growth entry deleted');
                            } else if (isChallenge) {
                              setChallenges(challenges.filter(c => c.id !== entry.id));
                              toast.success('Challenge entry deleted');
                            } else if (isGratitude) {
                              setGratitude(gratitude.filter(g => g.id !== entry.id));
                              toast.success('Gratitude entry deleted');
                            } else if (isMeditation) {
                              setMeditations(meditations.filter(m => m.id !== entry.id));
                              toast.success('Meditation entry deleted');
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {isGrowth && (
                        <>
                          <h4 className="font-semibold">{(entry as any).title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{(entry as any).description}</p>
                        </>
                      )}
                      {isChallenge && (
                        <div className="space-y-1">
                          <p className="text-sm"><strong>Situation:</strong> {(entry as any).situation}</p>
                          <p className="text-sm"><strong>Response:</strong> {(entry as any).response}</p>
                          <p className="text-sm"><strong>Outcome:</strong> {(entry as any).outcome}</p>
                        </div>
                      )}
                      {isGratitude && (
                        <p className="text-sm">{(entry as any).entry}</p>
                      )}
                      {isMeditation && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{(entry as any).type}</span>
                          <span className="text-sm text-muted-foreground">{(entry as any).duration} min</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </TabsContent>

        {/* Setbacks Tab */}
        <TabsContent value="setbacks" className="space-y-4">
          <Button onClick={() => setShowLogSetback(true)} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Log Setback
          </Button>

          {relapses.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="No Setbacks Logged"
              description="Tracking setbacks with honesty helps identify patterns and strengthen your recovery. Remember: Recovery is about progress, not perfection."
              actionLabel="Log First Entry"
              onAction={() => setShowLogSetback(true)}
              iconColor="text-blue-500"
            />
          ) : (
            <div className="space-y-4">
              {relapses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map(relapse => (
                  <Card key={relapse.id} className="relative">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{formatDate(relapse.date)}</p>
                          <p className="text-sm text-muted-foreground">
                            After {relapse.daysCleanBefore} days clean
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
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
                            size="sm"
                            onClick={() => handleDeleteRelapse(relapse.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                      {!relapse.isPrivate && (
                        <div className="space-y-3">
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

                          <div className="text-xs text-gray-500 pt-2 border-t">
                            Severity: {relapse.severity}/10
                          </div>
                        </div>
                      )}

                      {relapse.isPrivate && (
                        <p className="text-sm text-gray-500 italic">
                          Details hidden for privacy
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Craving Modal */}
      {showAddCraving && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Log Craving</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Intensity: {newCraving.intensity}/10</label>
                <Slider
                  value={[newCraving.intensity]}
                  onValueChange={([value]) => setNewCraving({ ...newCraving, intensity: value })}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Trigger</label>
                <Select
                  value={newCraving.trigger}
                  onValueChange={(value) => setNewCraving({ ...newCraving, trigger: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGER_TYPES.map(trigger => (
                      <SelectItem key={trigger} value={trigger}>{trigger}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Trigger Notes</label>
                <Textarea
                  value={newCraving.triggerNotes}
                  onChange={(e) => setNewCraving({ ...newCraving, triggerNotes: e.target.value })}
                  placeholder="What triggered this craving?"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Coping Strategy</label>
                <Textarea
                  value={newCraving.copingStrategy}
                  onChange={(e) => setNewCraving({ ...newCraving, copingStrategy: e.target.value })}
                  placeholder="How did you cope?"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="overcame"
                  checked={newCraving.overcame}
                  onCheckedChange={(checked) => setNewCraving({ ...newCraving, overcame: !!checked })}
                />
                <label htmlFor="overcame" className="text-sm font-medium">
                  Successfully overcame this craving
                </label>
              </div>

              {/* HALT Assessment Toggle */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowHALTInCraving(!showHALTInCraving)}
                  className="w-full"
                >
                  {showHALTInCraving ? '✓ HALT Assessment Included' : '+ Add HALT Assessment (Recommended)'}
                </Button>
              </div>

              {/* HALT Component */}
              {showHALTInCraving && (
                <div className="border-t pt-4">
                  <HALTCheck
                    onComplete={(halt) => setCravingHaltData(halt)}
                    initialValues={cravingHaltData || undefined}
                    showSuggestions={true}
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddCraving(false);
                    setShowHALTInCraving(false);
                    setCravingHaltData(null);
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddCraving} className="flex-1">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Similar modals for other types would go here - keeping code concise */}
      {/* Add Meeting Modal */}
      {showAddMeeting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Log Meeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Meeting type (AA, NA, etc.)"
                value={newMeeting.type}
                onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value })}
              />
              <Input
                placeholder="Location"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
              />
              <Textarea
                placeholder="Notes"
                value={newMeeting.notes}
                onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                rows={3}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddMeeting(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddMeeting} disabled={!newMeeting.type} className="flex-1">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Growth Modal */}
      {showAddGrowth && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Growth Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Title"
                value={newGrowth.title}
                onChange={(e) => setNewGrowth({ ...newGrowth, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newGrowth.description}
                onChange={(e) => setNewGrowth({ ...newGrowth, description: e.target.value })}
                rows={4}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddGrowth(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddGrowth} disabled={!newGrowth.title} className="flex-1">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Gratitude Modal */}
      {showAddGratitude && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Gratitude Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="What are you grateful for today?"
                value={newGratitudeEntry}
                onChange={(e) => setNewGratitudeEntry(e.target.value)}
                rows={4}
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddGratitude(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddGratitude} disabled={!newGratitudeEntry} className="flex-1">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Challenge Modal */}
      {showAddChallenge && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Log Challenge</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Situation</label>
                <Textarea
                  placeholder="What was the challenging situation?"
                  value={newChallenge.situation}
                  onChange={(e) => setNewChallenge({ ...newChallenge, situation: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your Response</label>
                <Textarea
                  placeholder="How did you respond?"
                  value={newChallenge.response}
                  onChange={(e) => setNewChallenge({ ...newChallenge, response: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Outcome</label>
                <Textarea
                  placeholder="What was the outcome?"
                  value={newChallenge.outcome}
                  onChange={(e) => setNewChallenge({ ...newChallenge, outcome: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddChallenge(false)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handleAddChallenge}
                  disabled={!newChallenge.situation || !newChallenge.response || !newChallenge.outcome}
                  className="flex-1"
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Meditation Modal */}
      {showAddMeditation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Log Meditation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select
                  value={newMeditation.type}
                  onValueChange={(value) => setNewMeditation({ ...newMeditation, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDITATION_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Duration: {newMeditation.duration} minutes</label>
                <Slider
                  value={[newMeditation.duration]}
                  onValueChange={([value]) => setNewMeditation({ ...newMeditation, duration: value })}
                  min={1}
                  max={120}
                  step={1}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes (optional)</label>
                <Textarea
                  placeholder="How was your practice?"
                  value={newMeditation.notes}
                  onChange={(e) => setNewMeditation({ ...newMeditation, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowAddMeditation(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleAddMeditation} className="flex-1">
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log Setback Modal */}
      {showLogSetback && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-2xl my-8">
            <CardHeader>
              <CardTitle>Log a Setback</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recovery is about progress, not perfection. Use this to learn and grow stronger.
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
                <Button onClick={handleLogSetback} className="flex-1">
                  Log Setback
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLogSetback(false);
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

