import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/EmptyState';
import { Moon, Pill, Dumbbell, Apple, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import type { SleepEntry, Medication, MedicationLog, ExerciseEntry, NutritionEntry } from '@/types/app';

const SLEEP_DISTURBANCES = ['Nightmares', 'Insomnia', 'Woke frequently', 'Sleep apnea', 'Restless'] as const;
const EXERCISE_TYPES = ['Running', 'Walking', 'Yoga', 'Weightlifting', 'Swimming', 'Cycling', 'Sports', 'Other'] as const;
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const PORTION_SIZES = ['small', 'medium', 'large', 'extra-large'] as const;

export function WellnessScreen() {
  const {
    sleepEntries,
    setSleepEntries,
    medications,
    setMedications,
    medicationLogs,
    setMedicationLogs,
    exerciseEntries,
    setExerciseEntries,
    nutritionEntries,
    setNutritionEntries,
    loading
  } = useAppData();

  const [activeTab, setActiveTab] = useState('sleep');

  // Sleep state
  const [showAddSleep, setShowAddSleep] = useState(false);
  const [newSleep, setNewSleep] = useState({
    hoursSlept: 8,
    quality: 7,
    bedTime: '22:00',
    wakeTime: '06:00',
    notes: '',
    dreams: '',
    disturbances: [] as string[]
  });

  // Medication state
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: '',
    dosage: '',
    frequency: 'daily' as const,
    customFrequency: '',
    times: ['09:00'],
    prescribedBy: '',
    purpose: '',
    refillDate: '',
    refillReminder: true,
    notes: '',
    sideEffects: [] as string[]
  });

  // Medication log state
  const [showLogMedication, setShowLogMedication] = useState(false);
  const [selectedMedicationId, setSelectedMedicationId] = useState<number | null>(null);
  const [newMedicationLog, setNewMedicationLog] = useState({
    taken: true,
    skippedReason: '',
    sideEffects: [] as string[],
    notes: ''
  });

  // Exercise state
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExercise, setNewExercise] = useState({
    type: 'Walking',
    duration: 30,
    intensity: 5,
    caloriesBurned: 0,
    distance: 0,
    distanceUnit: 'miles' as const,
    heartRate: 0,
    notes: '',
    mood: 7
  });

  // Nutrition state
  const [showAddNutrition, setShowAddNutrition] = useState(false);
  const [newNutrition, setNewNutrition] = useState({
    mealType: 'breakfast' as const,
    time: new Date().toTimeString().slice(0, 5),
    description: '',
    calories: 0,
    waterIntake: 0,
    waterUnit: 'oz' as const,
    nutritionQuality: 7,
    portionSize: 'medium' as const,
    emotionalEating: false,
    notes: ''
  });

  // Sleep handlers
  const handleAddSleep = () => {
    if (newSleep.hoursSlept <= 0) {
      toast.error('Please enter valid sleep hours');
      return;
    }

    const sleepEntry: SleepEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      hoursSlept: newSleep.hoursSlept,
      quality: newSleep.quality,
      bedTime: newSleep.bedTime,
      wakeTime: newSleep.wakeTime,
      notes: newSleep.notes || undefined,
      dreams: newSleep.dreams || undefined,
      disturbances: newSleep.disturbances.length > 0 ? newSleep.disturbances : undefined
    };

    setSleepEntries([...sleepEntries, sleepEntry]);
    setShowAddSleep(false);
    setNewSleep({
      hoursSlept: 8,
      quality: 7,
      bedTime: '22:00',
      wakeTime: '06:00',
      notes: '',
      dreams: '',
      disturbances: []
    });
    toast.success('Sleep entry logged');
  };

  const handleDeleteSleep = (id: number) => {
    setSleepEntries(sleepEntries.filter(entry => entry.id !== id));
    toast.success('Sleep entry deleted');
  };

  // Medication handlers
  const handleAddMedication = () => {
    if (!newMedication.name.trim() || !newMedication.dosage.trim()) {
      toast.error('Please enter medication name and dosage');
      return;
    }

    const medication: Medication = {
      id: Date.now(),
      name: newMedication.name,
      dosage: newMedication.dosage,
      frequency: newMedication.frequency,
      customFrequency: newMedication.customFrequency || undefined,
      times: newMedication.times.length > 0 ? newMedication.times : undefined,
      startDate: new Date().toISOString().split('T')[0],
      prescribedBy: newMedication.prescribedBy || undefined,
      purpose: newMedication.purpose,
      refillDate: newMedication.refillDate || undefined,
      refillReminder: newMedication.refillReminder,
      isActive: true,
      notes: newMedication.notes || undefined,
      sideEffects: newMedication.sideEffects.length > 0 ? newMedication.sideEffects : undefined
    };

    setMedications([...medications, medication]);
    setShowAddMedication(false);
    setNewMedication({
      name: '',
      dosage: '',
      frequency: 'daily',
      customFrequency: '',
      times: ['09:00'],
      prescribedBy: '',
      purpose: '',
      refillDate: '',
      refillReminder: true,
      notes: '',
      sideEffects: []
    });
    toast.success('Medication added');
  };

  const handleLogMedicationDose = () => {
    if (selectedMedicationId === null) return;

    const log: MedicationLog = {
      id: Date.now(),
      medicationId: selectedMedicationId,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      taken: newMedicationLog.taken,
      skippedReason: newMedicationLog.skippedReason || undefined,
      sideEffects: newMedicationLog.sideEffects.length > 0 ? newMedicationLog.sideEffects : undefined,
      notes: newMedicationLog.notes || undefined
    };

    setMedicationLogs([...medicationLogs, log]);
    setShowLogMedication(false);
    setSelectedMedicationId(null);
    setNewMedicationLog({
      taken: true,
      skippedReason: '',
      sideEffects: [],
      notes: ''
    });
    toast.success('Medication dose logged');
  };

  const handleDeleteMedication = (id: number) => {
    setMedications(medications.filter(med => med.id !== id));
    toast.success('Medication removed');
  };

  const handleToggleMedicationActive = (id: number) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, isActive: !med.isActive } : med
    ));
  };

  // Exercise handlers
  const handleAddExercise = () => {
    if (!newExercise.type.trim() || newExercise.duration <= 0) {
      toast.error('Please enter exercise type and duration');
      return;
    }

    const exercise: ExerciseEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      type: newExercise.type,
      duration: newExercise.duration,
      intensity: newExercise.intensity,
      caloriesBurned: newExercise.caloriesBurned || undefined,
      distance: newExercise.distance || undefined,
      distanceUnit: newExercise.distanceUnit,
      heartRate: newExercise.heartRate || undefined,
      notes: newExercise.notes || undefined,
      mood: newExercise.mood || undefined
    };

    setExerciseEntries([...exerciseEntries, exercise]);
    setShowAddExercise(false);
    setNewExercise({
      type: 'Walking',
      duration: 30,
      intensity: 5,
      caloriesBurned: 0,
      distance: 0,
      distanceUnit: 'miles',
      heartRate: 0,
      notes: '',
      mood: 7
    });
    toast.success('Exercise logged');
  };

  const handleDeleteExercise = (id: number) => {
    setExerciseEntries(exerciseEntries.filter(entry => entry.id !== id));
    toast.success('Exercise entry deleted');
  };

  // Nutrition handlers
  const handleAddNutrition = () => {
    if (!newNutrition.description.trim()) {
      toast.error('Please describe what you ate');
      return;
    }

    const nutrition: NutritionEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      mealType: newNutrition.mealType,
      time: newNutrition.time || undefined,
      description: newNutrition.description,
      calories: newNutrition.calories || undefined,
      waterIntake: newNutrition.waterIntake || undefined,
      waterUnit: newNutrition.waterUnit,
      nutritionQuality: newNutrition.nutritionQuality,
      portionSize: newNutrition.portionSize || undefined,
      emotionalEating: newNutrition.emotionalEating,
      notes: newNutrition.notes || undefined
    };

    setNutritionEntries([...nutritionEntries, nutrition]);
    setShowAddNutrition(false);
    setNewNutrition({
      mealType: 'breakfast',
      time: new Date().toTimeString().slice(0, 5),
      description: '',
      calories: 0,
      waterIntake: 0,
      waterUnit: 'oz',
      nutritionQuality: 7,
      portionSize: 'medium',
      emotionalEating: false,
      notes: ''
    });
    toast.success('Meal logged');
  };

  const handleDeleteNutrition = (id: number) => {
    setNutritionEntries(nutritionEntries.filter(entry => entry.id !== id));
    toast.success('Meal entry deleted');
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p>Loading wellness data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Wellness Tracking</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sleep">
            <Moon className="w-4 h-4 mr-2" />
            Sleep
          </TabsTrigger>
          <TabsTrigger value="medication">
            <Pill className="w-4 h-4 mr-2" />
            Medication
          </TabsTrigger>
          <TabsTrigger value="exercise">
            <Dumbbell className="w-4 h-4 mr-2" />
            Exercise
          </TabsTrigger>
          <TabsTrigger value="nutrition">
            <Apple className="w-4 h-4 mr-2" />
            Nutrition
          </TabsTrigger>
        </TabsList>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Sleep Log</CardTitle>
              <Button onClick={() => setShowAddSleep(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Sleep
              </Button>
            </CardHeader>
            <CardContent>
              {sleepEntries.length === 0 ? (
                <EmptyState
                  icon={Moon}
                  title="No sleep entries yet"
                  description="Start tracking your sleep to see patterns and improve your rest."
                />
              ) : (
                <div className="space-y-4">
                  {sleepEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(entry => (
                      <Card key={entry.id} className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
                              <p className="text-lg font-semibold">{entry.hoursSlept} hours</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSleep(entry.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Quality:</span>
                              <span className="font-medium">{entry.quality}/10</span>
                            </div>
                            {entry.bedTime && entry.wakeTime && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Time:</span>
                                <span>{entry.bedTime} - {entry.wakeTime}</span>
                              </div>
                            )}
                            {entry.disturbances && entry.disturbances.length > 0 && (
                              <div>
                                <span className="text-muted-foreground">Disturbances:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {entry.disturbances.map((d, i) => (
                                    <span key={i} className="px-2 py-1 bg-red-500/20 text-red-400 dark:text-red-300 rounded text-xs">
                                      {d}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {entry.notes && (
                              <div>
                                <span className="text-muted-foreground">Notes:</span>
                                <p className="mt-1">{entry.notes}</p>
                              </div>
                            )}
                            {entry.dreams && (
                              <div>
                                <span className="text-muted-foreground">Dreams:</span>
                                <p className="mt-1">{entry.dreams}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Medication Tab */}
        <TabsContent value="medication" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Medications</CardTitle>
              <Button onClick={() => setShowAddMedication(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Medication
              </Button>
            </CardHeader>
            <CardContent>
              {medications.length === 0 ? (
                <EmptyState
                  icon={Pill}
                  title="No medications tracked"
                  description="Add your medications to track doses and get refill reminders."
                />
              ) : (
                <div className="space-y-4">
                  {medications.map(med => (
                    <Card key={med.id} className={med.isActive ? 'bg-muted/50' : 'bg-muted/30 opacity-60'}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-lg font-semibold">{med.name}</p>
                              {!med.isActive && (
                                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                                  Inactive
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{med.dosage} - {med.frequency}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleMedicationActive(med.id)}
                            >
                              {med.isActive ? 'Pause' : 'Resume'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteMedication(med.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-muted-foreground">Purpose:</span> {med.purpose}</p>
                          {med.prescribedBy && (
                            <p><span className="text-muted-foreground">Prescribed by:</span> {med.prescribedBy}</p>
                          )}
                          {med.refillDate && (
                            <p><span className="text-muted-foreground">Refill date:</span> {formatDate(med.refillDate)}</p>
                          )}
                          {med.times && med.times.length > 0 && (
                            <p><span className="text-muted-foreground">Times:</span> {med.times.join(', ')}</p>
                          )}
                          {med.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setSelectedMedicationId(med.id);
                                setShowLogMedication(true);
                              }}
                            >
                              <Clock className="w-4 h-4 mr-2" />
                              Log Dose
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent medication logs */}
          {medicationLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Doses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {medicationLogs
                    .sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime())
                    .slice(0, 10)
                    .map(log => {
                      const medication = medications.find(m => m.id === log.medicationId);
                      return (
                        <div key={log.id} className="flex justify-between items-center p-3 bg-muted/50 rounded">
                          <div>
                            <p className="font-medium">{medication?.name || 'Unknown'}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(log.date)} at {log.time}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${log.taken ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                            {log.taken ? 'Taken' : 'Skipped'}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Exercise Tab */}
        <TabsContent value="exercise" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Exercise Log</CardTitle>
              <Button onClick={() => setShowAddExercise(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Exercise
              </Button>
            </CardHeader>
            <CardContent>
              {exerciseEntries.length === 0 ? (
                <EmptyState
                  icon={Dumbbell}
                  title="No exercise logged yet"
                  description="Start tracking your workouts to build healthy habits."
                />
              ) : (
                <div className="space-y-4">
                  {exerciseEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(entry => (
                      <Card key={entry.id} className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">{formatDate(entry.date)}</p>
                              <p className="text-lg font-semibold">{entry.type}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteExercise(entry.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span>{entry.duration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Intensity:</span>
                              <span>{entry.intensity}/10</span>
                            </div>
                            {entry.distance && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Distance:</span>
                                <span>{entry.distance} {entry.distanceUnit}</span>
                              </div>
                            )}
                            {entry.caloriesBurned && entry.caloriesBurned > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Calories:</span>
                                <span>{entry.caloriesBurned} cal</span>
                              </div>
                            )}
                            {entry.heartRate && entry.heartRate > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Avg Heart Rate:</span>
                                <span>{entry.heartRate} BPM</span>
                              </div>
                            )}
                            {entry.mood && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Mood After:</span>
                                <span>{entry.mood}/10</span>
                              </div>
                            )}
                            {entry.notes && (
                              <div>
                                <span className="text-muted-foreground">Notes:</span>
                                <p className="mt-1">{entry.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle>Nutrition Log</CardTitle>
              <Button onClick={() => setShowAddNutrition(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Log Meal
              </Button>
            </CardHeader>
            <CardContent>
              {nutritionEntries.length === 0 ? (
                <EmptyState
                  icon={Apple}
                  title="No meals logged yet"
                  description="Track your nutrition to build healthier eating habits."
                />
              ) : (
                <div className="space-y-4">
                  {nutritionEntries
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(entry => (
                      <Card key={entry.id} className="bg-muted/50">
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-lg font-semibold capitalize">{entry.mealType}</p>
                                {entry.emotionalEating && (
                                  <span className="px-2 py-1 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded text-xs">
                                    Emotional
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(entry.date)}
                                {entry.time && ` at ${entry.time}`}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteNutrition(entry.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p>{entry.description}</p>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Quality:</span>
                              <span>{entry.nutritionQuality}/10</span>
                            </div>
                            {entry.portionSize && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Portion:</span>
                                <span className="capitalize">{entry.portionSize}</span>
                              </div>
                            )}
                            {entry.calories && entry.calories > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Calories:</span>
                                <span>{entry.calories} cal</span>
                              </div>
                            )}
                            {entry.waterIntake && entry.waterIntake > 0 && (
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Water:</span>
                                <span>{entry.waterIntake} {entry.waterUnit}</span>
                              </div>
                            )}
                            {entry.notes && (
                              <div>
                                <span className="text-muted-foreground">Notes:</span>
                                <p className="mt-1">{entry.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Sleep Modal */}
      {showAddSleep && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md my-8">
            <CardHeader>
              <CardTitle>Log Sleep</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Hours Slept: {newSleep.hoursSlept}</Label>
                <Slider
                  value={[newSleep.hoursSlept]}
                  onValueChange={([value]) => setNewSleep({ ...newSleep, hoursSlept: value })}
                  min={0}
                  max={16}
                  step={0.5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Sleep Quality: {newSleep.quality}/10</Label>
                <Slider
                  value={[newSleep.quality]}
                  onValueChange={([value]) => setNewSleep({ ...newSleep, quality: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bed Time</Label>
                  <Input
                    type="time"
                    value={newSleep.bedTime}
                    onChange={(e) => setNewSleep({ ...newSleep, bedTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Wake Time</Label>
                  <Input
                    type="time"
                    value={newSleep.wakeTime}
                    onChange={(e) => setNewSleep({ ...newSleep, wakeTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Disturbances</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {SLEEP_DISTURBANCES.map((disturbance) => (
                    <label key={disturbance} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={newSleep.disturbances.includes(disturbance)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setNewSleep({
                              ...newSleep,
                              disturbances: [...newSleep.disturbances, disturbance]
                            });
                          } else {
                            setNewSleep({
                              ...newSleep,
                              disturbances: newSleep.disturbances.filter(d => d !== disturbance)
                            });
                          }
                        }}
                      />
                      {disturbance}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <Label>Dreams</Label>
                <Textarea
                  value={newSleep.dreams}
                  onChange={(e) => setNewSleep({ ...newSleep, dreams: e.target.value })}
                  placeholder="Describe any dreams you remember..."
                  rows={2}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newSleep.notes}
                  onChange={(e) => setNewSleep({ ...newSleep, notes: e.target.value })}
                  placeholder="Any other notes about your sleep..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddSleep} className="flex-1">Log Sleep</Button>
                <Button variant="outline" onClick={() => setShowAddSleep(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedication && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md my-8">
            <CardHeader>
              <CardTitle>Add Medication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Medication Name *</Label>
                <Input
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  placeholder="e.g., Sertraline"
                />
              </div>
              <div>
                <Label>Dosage *</Label>
                <Input
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  placeholder="e.g., 50mg, 2 pills"
                />
              </div>
              <div>
                <Label>Frequency</Label>
                <Select
                  value={newMedication.frequency}
                  onValueChange={(value: any) => setNewMedication({ ...newMedication, frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="as-needed">As Needed</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="twice-daily">Twice Daily</SelectItem>
                    <SelectItem value="three-times-daily">Three Times Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Purpose</Label>
                <Input
                  value={newMedication.purpose}
                  onChange={(e) => setNewMedication({ ...newMedication, purpose: e.target.value })}
                  placeholder="e.g., Anxiety, Depression"
                />
              </div>
              <div>
                <Label>Prescribed By</Label>
                <Input
                  value={newMedication.prescribedBy}
                  onChange={(e) => setNewMedication({ ...newMedication, prescribedBy: e.target.value })}
                  placeholder="Doctor's name"
                />
              </div>
              <div>
                <Label>Refill Date</Label>
                <Input
                  type="date"
                  value={newMedication.refillDate}
                  onChange={(e) => setNewMedication({ ...newMedication, refillDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newMedication.notes}
                  onChange={(e) => setNewMedication({ ...newMedication, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddMedication} className="flex-1">Add Medication</Button>
                <Button variant="outline" onClick={() => setShowAddMedication(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Log Medication Dose Modal */}
      {showLogMedication && selectedMedicationId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Log Medication Dose</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="taken"
                  checked={newMedicationLog.taken}
                  onCheckedChange={(checked) =>
                    setNewMedicationLog({ ...newMedicationLog, taken: !!checked })
                  }
                />
                <Label htmlFor="taken">I took this medication</Label>
              </div>
              {!newMedicationLog.taken && (
                <div>
                  <Label>Reason for Skipping</Label>
                  <Textarea
                    value={newMedicationLog.skippedReason}
                    onChange={(e) =>
                      setNewMedicationLog({ ...newMedicationLog, skippedReason: e.target.value })
                    }
                    placeholder="Why did you skip this dose?"
                    rows={2}
                  />
                </div>
              )}
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newMedicationLog.notes}
                  onChange={(e) => setNewMedicationLog({ ...newMedicationLog, notes: e.target.value })}
                  placeholder="Any side effects or notes..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleLogMedicationDose} className="flex-1">Log Dose</Button>
                <Button variant="outline" onClick={() => setShowLogMedication(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Exercise Modal */}
      {showAddExercise && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md my-8">
            <CardHeader>
              <CardTitle>Log Exercise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Exercise Type</Label>
                <Select
                  value={newExercise.type}
                  onValueChange={(value) => setNewExercise({ ...newExercise, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXERCISE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Duration: {newExercise.duration} minutes</Label>
                <Slider
                  value={[newExercise.duration]}
                  onValueChange={([value]) => setNewExercise({ ...newExercise, duration: value })}
                  min={1}
                  max={180}
                  step={5}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Intensity: {newExercise.intensity}/10</Label>
                <Slider
                  value={[newExercise.intensity]}
                  onValueChange={([value]) => setNewExercise({ ...newExercise, intensity: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Distance (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    value={newExercise.distance || ''}
                    onChange={(e) =>
                      setNewExercise({ ...newExercise, distance: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.0"
                  />
                  <Select
                    value={newExercise.distanceUnit}
                    onValueChange={(value: 'miles' | 'km') =>
                      setNewExercise({ ...newExercise, distanceUnit: value })
                    }
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="miles">miles</SelectItem>
                      <SelectItem value="km">km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Calories Burned (optional)</Label>
                <Input
                  type="number"
                  value={newExercise.caloriesBurned || ''}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, caloriesBurned: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Avg Heart Rate (optional)</Label>
                <Input
                  type="number"
                  value={newExercise.heartRate || ''}
                  onChange={(e) =>
                    setNewExercise({ ...newExercise, heartRate: parseInt(e.target.value) || 0 })
                  }
                  placeholder="BPM"
                />
              </div>
              <div>
                <Label>Mood After: {newExercise.mood}/10</Label>
                <Slider
                  value={[newExercise.mood]}
                  onValueChange={([value]) => setNewExercise({ ...newExercise, mood: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newExercise.notes}
                  onChange={(e) => setNewExercise({ ...newExercise, notes: e.target.value })}
                  placeholder="How did it feel?"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddExercise} className="flex-1">Log Exercise</Button>
                <Button variant="outline" onClick={() => setShowAddExercise(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Nutrition Modal */}
      {showAddNutrition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <Card className="w-full max-w-md my-8">
            <CardHeader>
              <CardTitle>Log Meal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Meal Type</Label>
                <Select
                  value={newNutrition.mealType}
                  onValueChange={(value: any) => setNewNutrition({ ...newNutrition, mealType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAL_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={newNutrition.time}
                  onChange={(e) => setNewNutrition({ ...newNutrition, time: e.target.value })}
                />
              </div>
              <div>
                <Label>What did you eat? *</Label>
                <Textarea
                  value={newNutrition.description}
                  onChange={(e) => setNewNutrition({ ...newNutrition, description: e.target.value })}
                  placeholder="Describe your meal..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Nutrition Quality: {newNutrition.nutritionQuality}/10</Label>
                <Slider
                  value={[newNutrition.nutritionQuality]}
                  onValueChange={([value]) =>
                    setNewNutrition({ ...newNutrition, nutritionQuality: value })
                  }
                  min={1}
                  max={10}
                  step={1}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Portion Size</Label>
                <Select
                  value={newNutrition.portionSize}
                  onValueChange={(value: any) =>
                    setNewNutrition({ ...newNutrition, portionSize: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PORTION_SIZES.map((size) => (
                      <SelectItem key={size} value={size} className="capitalize">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Calories (optional)</Label>
                <Input
                  type="number"
                  value={newNutrition.calories || ''}
                  onChange={(e) =>
                    setNewNutrition({ ...newNutrition, calories: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <Label>Water Intake (optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newNutrition.waterIntake || ''}
                    onChange={(e) =>
                      setNewNutrition({ ...newNutrition, waterIntake: parseInt(e.target.value) || 0 })
                    }
                    placeholder="0"
                  />
                  <Select
                    value={newNutrition.waterUnit}
                    onValueChange={(value: 'oz' | 'ml') =>
                      setNewNutrition({ ...newNutrition, waterUnit: value })
                    }
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oz">oz</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="emotional-eating"
                  checked={newNutrition.emotionalEating}
                  onCheckedChange={(checked) =>
                    setNewNutrition({ ...newNutrition, emotionalEating: !!checked })
                  }
                />
                <Label htmlFor="emotional-eating">This was emotional eating</Label>
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={newNutrition.notes}
                  onChange={(e) => setNewNutrition({ ...newNutrition, notes: e.target.value })}
                  placeholder="How did you feel?"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddNutrition} className="flex-1">Log Meal</Button>
                <Button variant="outline" onClick={() => setShowAddNutrition(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
