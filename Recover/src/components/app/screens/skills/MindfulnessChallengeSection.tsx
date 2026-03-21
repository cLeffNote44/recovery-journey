import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Brain, Check, Play, Calendar, Trophy } from 'lucide-react';
import { MINDFULNESS_CHALLENGE, getMindfulnessDay } from '@/lib/mindfulness-challenge';
import { toast } from 'sonner';

export function MindfulnessChallengeSection() {
  const { skillBuilding, setSkillBuilding } = useAppData();
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [dayNote, setDayNote] = useState('');

  const { mindfulnessChallenge } = skillBuilding;
  const currentDay = mindfulnessChallenge.currentDay;
  const completedDays = mindfulnessChallenge.completedDays;
  const progressPercent = (completedDays.length / 30) * 100;

  const handleStartChallenge = () => {
    setSkillBuilding({
      ...skillBuilding,
      mindfulnessChallenge: {
        ...mindfulnessChallenge,
        currentDay: 1,
        startDate: new Date().toISOString().split('T')[0]
      }
    });
    setSelectedDay(1);
    toast.success('30-Day Mindfulness Challenge started! 🧘');
  };

  const handleCompleteDay = (day: number) => {
    if (completedDays.includes(day)) {
      toast.info('You\'ve already completed this day!');
      return;
    }

    setSkillBuilding({
      ...skillBuilding,
      mindfulnessChallenge: {
        ...mindfulnessChallenge,
        completedDays: [...completedDays, day].sort((a, b) => a - b),
        currentDay: day < 30 ? day + 1 : 30,
        lastCompletedDate: new Date().toISOString().split('T')[0],
        notes: {
          ...mindfulnessChallenge.notes,
          [day]: dayNote
        }
      }
    });

    setDayNote('');
    toast.success(`Day ${day} completed! 🌟`);

    // Check for milestone completions
    const newCompletedCount = completedDays.length + 1;
    if (newCompletedCount === 7) {
      toast.success('🎉 One week milestone! Keep going!');
    } else if (newCompletedCount === 14) {
      toast.success('🎉 Two weeks! You\'re halfway there!');
    } else if (newCompletedCount === 21) {
      toast.success('🎉 Three weeks! Amazing consistency!');
    } else if (newCompletedCount === 30) {
      toast.success('🎉🎊 Challenge Complete! You did it!');
    }
  };

  const handleSaveNote = (day: number) => {
    setSkillBuilding({
      ...skillBuilding,
      mindfulnessChallenge: {
        ...mindfulnessChallenge,
        notes: {
          ...mindfulnessChallenge.notes,
          [day]: dayNote
        }
      }
    });
    toast.success('Note saved!');
  };

  const dayContent = selectedDay ? getMindfulnessDay(selectedDay) : null;

  if (currentDay === 0) {
    // Challenge not started
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white border-0">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🧘</div>
              <h3 className="text-2xl font-bold mb-3">30-Day Mindfulness Challenge</h3>
              <p className="text-sm opacity-90 mb-6">
                Build a daily mindfulness practice with progressive exercises designed to strengthen your recovery.
              </p>
              <Button
                onClick={handleStartChallenge}
                size="lg"
                className="bg-white text-blue-600 hover:bg-gray-100"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Challenge
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h4 className="font-semibold mb-1">Foundation (Days 1-7)</h4>
                <p className="text-sm text-muted-foreground">Basic breath awareness, body scan, and mindful observation</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">🧠</div>
              <div>
                <h4 className="font-semibold mb-1">Integration (Days 8-14)</h4>
                <p className="text-sm text-muted-foreground">Concentration practices and daily life mindfulness</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">💖</div>
              <div>
                <h4 className="font-semibold mb-1">Compassion (Days 15-21)</h4>
                <p className="text-sm text-muted-foreground">Loving-kindness, forgiveness, and healing practices</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="text-2xl">✨</div>
              <div>
                <h4 className="font-semibold mb-1">Advanced (Days 22-30)</h4>
                <p className="text-sm text-muted-foreground">Values, acceptance, and integration practices</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedDay && dayContent) {
    // Viewing a specific day
    const isCompleted = completedDays.includes(selectedDay);
    const existingNote = mindfulnessChallenge.notes[selectedDay] || '';

    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setSelectedDay(null)}>
          ← Back to Overview
        </Button>

        <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm opacity-90">Day {dayContent.day} • {dayContent.theme}</div>
                <h3 className="text-xl font-bold">{dayContent.title}</h3>
              </div>
            </div>
            <p className="text-sm opacity-90">{dayContent.exercise} • {dayContent.duration} minutes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2">
              {dayContent.instructions.map((instruction, idx) => (
                <li key={idx} className="text-sm">{instruction}</li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reflection</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm font-medium">{dayContent.reflection}</p>
            <Textarea
              placeholder="Your reflection..."
              value={existingNote || dayNote}
              onChange={(e) => setDayNote(e.target.value)}
              rows={4}
              disabled={isCompleted && !!existingNote}
            />
            {!isCompleted ? (
              <div className="flex gap-2">
                <Button onClick={() => handleSaveNote(selectedDay)} variant="outline" className="flex-1">
                  Save Note
                </Button>
                <Button onClick={() => handleCompleteDay(selectedDay)} className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  Complete Day
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check className="w-5 h-5" />
                <span className="font-medium">Completed!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Overview of all days
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Your Progress</h3>
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">{completedDays.length}/30</span>
            </div>
          </div>
          <Progress value={progressPercent} className="mb-2" />
          <p className="text-xs text-muted-foreground">{Math.round(progressPercent)}% complete</p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {MINDFULNESS_CHALLENGE.map((day) => {
          const isCompleted = completedDays.includes(day.day);
          const isCurrent = day.day === currentDay;
          const isLocked = day.day > currentDay && !isCompleted;

          return (
            <Card
              key={day.day}
              className={`cursor-pointer transition-colors ${
                isLocked ? 'opacity-50' : 'hover:border-primary'
              } ${isCurrent ? 'border-primary' : ''}`}
              onClick={() => !isLocked && setSelectedDay(day.day)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isCurrent
                        ? 'bg-blue-500 text-white'
                        : 'bg-secondary'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="font-bold">{day.day}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{day.title}</h4>
                      {isCurrent && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded">Current</span>}
                    </div>
                    <p className="text-sm text-muted-foreground">{day.theme} • {day.duration} min</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
