import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, RefreshCw, Plus } from 'lucide-react';
import {
  SELF_COMPASSION_PRACTICES,
  RECOVERY_AFFIRMATIONS,
  getRandomAffirmation
} from '@/lib/values-and-compassion';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import type { SelfCompassionEntry } from '@/types/app';
import { selfCompassionSchema, validateFormWithToast } from '@/lib/validation-schemas';

export function SelfCompassionSection() {
  const { skillBuilding, setSkillBuilding } = useAppData();
  const [selectedPractice, setSelectedPractice] = useState<typeof SELF_COMPASSION_PRACTICES[0] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(getRandomAffirmation());
  const [formData, setFormData] = useState({
    situation: '',
    selfCriticismThoughts: '',
    compassionateResponse: ''
  });

  const entries = skillBuilding.selfCompassionEntries.sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleSubmit = () => {
    if (!selectedPractice) return;

    // Validate form data with Zod
    const validatedData = validateFormWithToast(selfCompassionSchema, formData, toast);
    if (!validatedData) {
      return;
    }

    const newEntry: SelfCompassionEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0]!,
      practiceType: selectedPractice.type,
      ...validatedData
    };

    setSkillBuilding({
      ...skillBuilding,
      selfCompassionEntries: [newEntry, ...skillBuilding.selfCompassionEntries]
    });

    setFormData({ situation: '', selfCriticismThoughts: '', compassionateResponse: '' });
    setShowAdd(false);
    setSelectedPractice(null);
    toast.success('Self-compassion practice saved! 💖');
  };

  if (showAdd && selectedPractice) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => {setShowAdd(false); setSelectedPractice(null);}}>
          ← Cancel
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{selectedPractice.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">What situation triggered self-criticism?</label>
              <Textarea
                placeholder="Describe what happened..."
                value={formData.situation}
                onChange={(e) => setFormData({ ...formData, situation: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">What did your inner critic say?</label>
              <Textarea
                placeholder="What negative thoughts came up?"
                value={formData.selfCriticismThoughts}
                onChange={(e) => setFormData({ ...formData, selfCriticismThoughts: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Your compassionate response</label>
              <p className="text-xs text-muted-foreground mb-2 italic">
                What would you say to a dear friend in this situation?
              </p>
              <Textarea
                placeholder="Speak to yourself with kindness..."
                value={formData.compassionateResponse}
                onChange={(e) => setFormData({ ...formData, compassionateResponse: e.target.value })}
                rows={4}
              />
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full"
            >
              Save Practice
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedPractice) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setSelectedPractice(null)}>
          ← Back
        </Button>

        <Card className="bg-gradient-to-br from-blue-500 to-rose-500 text-white border-0">
          <CardContent className="p-6">
            <h3 className="text-2xl font-bold mb-2">{selectedPractice.name}</h3>
            <p className="text-sm opacity-90">{selectedPractice.description}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Practice Instructions ({selectedPractice.duration} min)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2">
              {selectedPractice.instructions.map((instruction, idx) => (
                <li key={idx} className="text-sm">{instruction}</li>
              ))}
            </ol>

            <div>
              <h4 className="font-semibold mb-2 text-sm">When to Use</h4>
              <div className="flex flex-wrap gap-2">
                {selectedPractice.whenToUse.map((use, idx) => (
                  <Badge key={idx} variant="outline">{use}</Badge>
                ))}
              </div>
            </div>

            <Button onClick={() => setShowAdd(true)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Journal This Practice
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Self-Compassion</h3>
        <p className="text-sm text-muted-foreground">Practice self-kindness and overcome shame</p>
      </div>

      {/* Daily Affirmation */}
      <Card className="bg-gradient-to-br from-blue-500 to-rose-500 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <div className="text-xs opacity-75 mb-2">Today's Affirmation</div>
              <p className="text-lg font-semibold">{currentAffirmation}</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={() => setCurrentAffirmation(getRandomAffirmation())}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs opacity-75">Repeat this affirmation throughout your day</p>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{entries.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Practices Completed</div>
          </CardContent>
        </Card>
      )}

      {/* Practices */}
      <div className="space-y-3">
        <h4 className="font-semibold">Compassion Practices</h4>
        {SELF_COMPASSION_PRACTICES.map(practice => (
          <Card
            key={practice.type}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => setSelectedPractice(practice)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-pink-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold mb-1">{practice.name}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{practice.description}</p>
                  <div className="text-xs text-muted-foreground">{practice.duration} minutes</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold">Recent Practices</h4>
          {entries.slice(0, 3).map(entry => (
            <Card key={entry.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {SELF_COMPASSION_PRACTICES.find(p => p.type === entry.practiceType)?.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground italic">"{entry.compassionateResponse}"</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
