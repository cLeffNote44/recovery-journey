import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Trophy, CheckCircle2, Circle, Trash2, Edit, TrendingUp, Calendar as CalendarIcon, Repeat, X } from 'lucide-react';
import type { Goal, CalendarEvent } from '@/types/app';
import { toast } from 'sonner';
import { celebrate } from '@/lib/celebrations';
import { goalSchema, validateFormWithToast } from '@/lib/validation-schemas';

const CATEGORY_ICONS = {
  recovery: '🎯',
  wellness: '💪',
  personal: '⭐',
  social: '👥'
};

const CATEGORY_COLORS = {
  recovery: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30',
  wellness: 'from-slate-500/20 to-gray-500/20 border-green-500/30',
  personal: 'from-slate-500/20 to-gray-500/20 border-blue-500/30',
  social: 'from-orange-500/20 to-blue-500/20 border-orange-500/30'
};

export function GoalsScreen() {
  const { goals, setGoals, goalProgress, setGoalProgress, events, setEvents, celebrationsEnabled } = useAppData();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const activeGoals = goals.filter(g => g.isActive && !g.isCompleted);
  const completedGoals = goals.filter(g => g.isCompleted);

  const filteredGoals = filter === 'all'
    ? goals
    : filter === 'active'
      ? activeGoals
      : completedGoals;

  const calculateProgress = (goal: Goal): number => {
    if (goal.targetType === 'yes-no') {
      return goal.isCompleted ? 100 : 0;
    }
    if (goal.targetType === 'numerical' && goal.targetValue) {
      return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
    }
    if (goal.targetType === 'streak' && goal.targetValue) {
      return Math.min(((goal.streak || 0) / goal.targetValue) * 100, 100);
    }
    return 0;
  };

  const handleDeleteGoal = (goalId: number) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      const goal = goals.find(g => g.id === goalId);

      // Delete linked calendar event if it exists
      if (goal?.linkedCalendarEventId) {
        setEvents(events.filter(e => e.id !== goal.linkedCalendarEventId));
      }

      setGoals(goals.filter(g => g.id !== goalId));
      setGoalProgress(goalProgress.filter(gp => gp.goalId !== goalId));
      toast.success('Goal deleted');
    }
  };

  const handleToggleComplete = (goal: Goal) => {
    const newIsCompleted = !goal.isCompleted;
    const updatedGoals = goals.map(g =>
      g.id === goal.id
        ? {
            ...g,
            isCompleted: newIsCompleted,
            completedDate: newIsCompleted ? new Date().toISOString() : undefined
          }
        : g
    );
    setGoals(updatedGoals);

    if (newIsCompleted) {
      if (celebrationsEnabled) {
        setTimeout(() => celebrate('achievement'), 300);
      }
      toast.success(`Goal "${goal.title}" completed! 🎉`);
    } else {
      toast.success('Goal marked as incomplete');
    }
  };

  const handleUpdateProgress = (goal: Goal, increment: number) => {
    const newValue = goal.currentValue + increment;
    const updatedGoals = goals.map(g =>
      g.id === goal.id
        ? { ...g, currentValue: Math.max(0, newValue), lastUpdated: new Date().toISOString() }
        : g
    );
    setGoals(updatedGoals);

    // Add progress entry
    const progressEntry = {
      goalId: goal.id,
      date: new Date().toISOString(),
      value: increment,
      notes: undefined
    };
    setGoalProgress([...goalProgress, progressEntry]);

    // Check if goal is now complete
    if (goal.targetValue && newValue >= goal.targetValue) {
      handleToggleComplete(goal);
    } else {
      toast.success('Progress updated!');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Target className="w-6 h-6" />
            Goals & Habits
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track your progress and build positive habits
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Goal
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{activeGoals.length}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{completedGoals.length}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{goals.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'active' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('active')}
        >
          Active
        </Button>
        <Button
          variant={filter === 'completed' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('completed')}
        >
          Completed
        </Button>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
      </div>

      {/* Goals List */}
      <div className="space-y-3">
        {filteredGoals.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first goal to start tracking your progress
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredGoals.map(goal => {
            const progress = calculateProgress(goal);
            return (
              <Card key={goal.id} className={`border-2 bg-gradient-to-br ${CATEGORY_COLORS[goal.category]}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-2xl mt-1">{CATEGORY_ICONS[goal.category]}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{goal.title}</h3>
                          {goal.isCompleted && (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground flex-wrap">
                          <span className="capitalize">{goal.category}</span>
                          <span>•</span>
                          <span className="capitalize">{goal.frequency}</span>
                          {goal.targetValue && (
                            <>
                              <span>•</span>
                              <span>Target: {goal.targetValue}</span>
                            </>
                          )}
                          {goal.addToCalendar && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-blue-500">
                                <CalendarIcon className="w-3 h-3" />
                                On Calendar
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleComplete(goal)}
                        title={goal.isCompleted ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {goal.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteGoal(goal.id)}
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {goal.targetType !== 'yes-no' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {goal.targetType === 'numerical'
                            ? `${goal.currentValue} / ${goal.targetValue}`
                            : goal.targetType === 'streak'
                              ? `${goal.streak || 0} day streak`
                              : `${progress.toFixed(0)}%`
                          }
                        </span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Quick Actions for Active Goals */}
                  {!goal.isCompleted && goal.targetType === 'numerical' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateProgress(goal, 1)}
                        className="flex-1"
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        +1
                      </Button>
                      {goal.currentValue > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateProgress(goal, -1)}
                        >
                          -1
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Goal Modal */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          goals={goals}
          setGoals={setGoals}
          events={events}
          setEvents={setEvents}
        />
      )}
    </div>
  );
}

// Create Goal Modal Component
function CreateGoalModal({
  onClose,
  goals,
  setGoals,
  events,
  setEvents
}: {
  onClose: () => void;
  goals: Goal[];
  setGoals: (goals: Goal[]) => void;
  events: CalendarEvent[];
  setEvents: (events: CalendarEvent[]) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'recovery' as Goal['category'],
    targetType: 'numerical' as Goal['targetType'],
    targetValue: 10,
    frequency: 'daily' as Goal['frequency'],
    recurringTime: '09:00',
    recurringDays: [] as number[],
    reminderEnabled: false,
    addToCalendar: false
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleDay = (day: number) => {
    setFormData({
      ...formData,
      recurringDays: formData.recurringDays.includes(day)
        ? formData.recurringDays.filter(d => d !== day)
        : [...formData.recurringDays, day]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data with Zod
    const validatedData = validateFormWithToast(goalSchema, formData, toast);
    if (!validatedData) {
      return;
    }

    const newGoal: Goal = {
      id: Date.now(),
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      targetType: validatedData.targetType,
      targetValue: validatedData.targetType !== 'yes-no' ? validatedData.targetValue : undefined,
      currentValue: 0,
      frequency: validatedData.frequency,
      recurringDays: validatedData.frequency === 'weekly' ? validatedData.recurringDays : undefined,
      recurringTime: validatedData.frequency !== 'one-time' ? validatedData.recurringTime : undefined,
      startDate: new Date().toISOString(),
      isActive: true,
      isCompleted: false,
      streak: 0,
      reminderEnabled: validatedData.reminderEnabled,
      addToCalendar: validatedData.addToCalendar
    };

    // Create calendar event if requested
    if (formData.addToCalendar && formData.frequency !== 'one-time') {
      const calendarEvent: CalendarEvent = {
        id: Date.now() + 1,
        title: `Goal: ${formData.title}`,
        description: formData.description,
        date: new Date().toISOString().split('T')[0],
        time: formData.recurringTime,
        type: 'reminder',
        reminders: [{ minutes: 15 }],
        recurring: {
          frequency: formData.frequency === 'hourly' ? 'daily' : formData.frequency as any,
          interval: 1,
          daysOfWeek: formData.frequency === 'weekly' ? formData.recurringDays : undefined,
        }
      };

      newGoal.linkedCalendarEventId = calendarEvent.id;
      setEvents([...events, calendarEvent]);
      toast.success('Goal created and added to calendar!');
    } else {
      toast.success('Goal created!');
    }

    setGoals([...goals, newGoal]);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-lg my-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create New Goal</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Attend 3 meetings per week"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Why is this goal important to you?"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Goal['category'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recovery">🎯 Recovery</SelectItem>
                  <SelectItem value="wellness">💪 Wellness</SelectItem>
                  <SelectItem value="personal">⭐ Personal</SelectItem>
                  <SelectItem value="social">👥 Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetType">Goal Type</Label>
              <Select
                value={formData.targetType}
                onValueChange={(value) => setFormData({ ...formData, targetType: value as Goal['targetType'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="numerical">Numerical (count to target)</SelectItem>
                  <SelectItem value="yes-no">Yes/No (complete or not)</SelectItem>
                  <SelectItem value="streak">Streak (consecutive days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.targetType !== 'yes-no' && (
              <div>
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  min="1"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: parseInt(e.target.value) || 10 })}
                />
              </div>
            )}

            <div>
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={formData.frequency}
                onValueChange={(value) => setFormData({ ...formData, frequency: value as Goal['frequency'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recurring Time */}
            {formData.frequency !== 'one-time' && (
              <div>
                <Label htmlFor="recurringTime">Reminder Time</Label>
                <Input
                  id="recurringTime"
                  type="time"
                  value={formData.recurringTime}
                  onChange={(e) => setFormData({ ...formData, recurringTime: e.target.value })}
                />
              </div>
            )}

            {/* Weekly Days Selection */}
            {formData.frequency === 'weekly' && (
              <div>
                <Label>Repeat On</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {dayLabels.map((day, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant={formData.recurringDays.includes(idx) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleDay(idx)}
                      className="w-12"
                    >
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Calendar Checkbox */}
            {formData.frequency !== 'one-time' && (
              <div className="flex items-center gap-2 pt-3 border-t">
                <Checkbox
                  id="addToCalendar"
                  checked={formData.addToCalendar}
                  onCheckedChange={(checked) => setFormData({ ...formData, addToCalendar: checked === true })}
                />
                <label htmlFor="addToCalendar" className="text-sm flex items-center gap-2 cursor-pointer">
                  <CalendarIcon className="w-4 h-4" />
                  Add recurring reminders to calendar
                </label>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                <Trophy className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
