import { useState } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { EmptyState } from '@/components/EmptyState';
import { BookOpen, Search, Check, Star } from 'lucide-react';
import { COPING_SKILLS, getSkillsByCategory, getSkillById } from '@/lib/coping-skills-library';
import type { CopingSkill } from '@/types/app';
import { toast } from 'sonner';

export function CopingSkillsSection() {
  const { skillBuilding, setSkillBuilding } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<CopingSkill['category'] | 'all'>('all');
  const [selectedSkill, setSelectedSkill] = useState<CopingSkill | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showLogUsage, setShowLogUsage] = useState(false);
  const [usageData, setUsageData] = useState({
    situation: '',
    effectiveness: 5,
    notes: ''
  });

  const categories: (CopingSkill['category'] | 'all')[] = [
    'all',
    'grounding',
    'distraction',
    'self-soothing',
    'mindfulness',
    'social',
    'physical',
    'cognitive'
  ];

  const categoryLabels = {
    all: 'All Skills',
    grounding: 'Grounding',
    distraction: 'Distraction',
    'self-soothing': 'Self-Soothing',
    mindfulness: 'Mindfulness',
    social: 'Social',
    physical: 'Physical',
    cognitive: 'Cognitive'
  };

  const filteredSkills = COPING_SKILLS.filter(skill => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleLogUsage = () => {
    if (!selectedSkill) return;

    const newUsage = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      skillId: selectedSkill.id,
      situation: usageData.situation,
      effectiveness: usageData.effectiveness,
      notes: usageData.notes || undefined
    };

    setSkillBuilding({
      ...skillBuilding,
      copingSkillUsage: [...skillBuilding.copingSkillUsage, newUsage]
    });

    setUsageData({ situation: '', effectiveness: 5, notes: '' });
    setShowLogUsage(false);
    toast.success(`${selectedSkill.name} usage logged!`);
  };

  const getSkillUsageCount = (skillId: string) => {
    return skillBuilding.copingSkillUsage.filter(u => u.skillId === skillId).length;
  };

  const getAverageEffectiveness = (skillId: string) => {
    const uses = skillBuilding.copingSkillUsage.filter(u => u.skillId === skillId);
    if (uses.length === 0) return null;
    const avg = uses.reduce((sum, u) => sum + u.effectiveness, 0) / uses.length;
    return Math.round(avg * 10) / 10;
  };

  if (selectedSkill && !showLogUsage) {
    const usageCount = getSkillUsageCount(selectedSkill.id);
    const avgEffectiveness = getAverageEffectiveness(selectedSkill.id);

    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setSelectedSkill(null)}>
          ← Back to Library
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <CardTitle>{selectedSkill.name}</CardTitle>
                  <Badge variant="secondary">{categoryLabels[selectedSkill.category]}</Badge>
                  <Badge variant="outline">{selectedSkill.difficulty}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedSkill.description}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Usage Stats */}
            {usageCount > 0 && (
              <div className="flex gap-4 p-4 bg-secondary rounded-lg">
                <div className="flex-1 text-center">
                  <div className="text-2xl font-bold text-primary">{usageCount}</div>
                  <div className="text-xs text-muted-foreground">Times Used</div>
                </div>
                {avgEffectiveness && (
                  <div className="flex-1 text-center">
                    <div className="text-2xl font-bold text-primary">{avgEffectiveness}/10</div>
                    <div className="text-xs text-muted-foreground">Avg Effectiveness</div>
                  </div>
                )}
              </div>
            )}

            {/* Instructions */}
            <div>
              <h4 className="font-semibold mb-3">How to Use</h4>
              <ol className="list-decimal list-inside space-y-2">
                {selectedSkill.instructions.map((instruction, idx) => (
                  <li key={idx} className="text-sm">{instruction}</li>
                ))}
              </ol>
            </div>

            {/* When to Use */}
            <div>
              <h4 className="font-semibold mb-3">Best Used For</h4>
              <div className="flex flex-wrap gap-2">
                {selectedSkill.whenToUse.map((situation, idx) => (
                  <Badge key={idx} variant="outline">{situation}</Badge>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <Button onClick={() => setShowLogUsage(true)} className="w-full">
              <Check className="w-4 h-4 mr-2" />
              Log Usage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showLogUsage && selectedSkill) {
    return (
      <div className="space-y-6">
        <Button variant="outline" size="sm" onClick={() => setShowLogUsage(false)}>
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Log Usage: {selectedSkill.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">What situation were you facing?</label>
              <Textarea
                placeholder="Describe the situation..."
                value={usageData.situation}
                onChange={(e) => setUsageData({ ...usageData, situation: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-3 block">
                How effective was it? ({usageData.effectiveness}/10)
              </label>
              <Slider
                value={[usageData.effectiveness]}
                onValueChange={(value) => setUsageData({ ...usageData, effectiveness: value[0] })}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Not Effective</span>
                <span>Very Effective</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Additional Notes (optional)</label>
              <Textarea
                placeholder="Any insights or reflections..."
                value={usageData.notes}
                onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button
              onClick={handleLogUsage}
              className="w-full"
              disabled={!usageData.situation}
            >
              Save Usage Log
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold">Coping Skills Library</h3>
              <p className="text-sm text-muted-foreground">20+ evidence-based techniques</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search skills..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="whitespace-nowrap"
          >
            {categoryLabels[category]}
          </Button>
        ))}
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        {filteredSkills.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No skills found"
            description="Try adjusting your search or filter"
          />
        ) : (
          filteredSkills.map(skill => {
            const usageCount = getSkillUsageCount(skill.id);
            const avgEffectiveness = getAverageEffectiveness(skill.id);

            return (
              <Card
                key={skill.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setSelectedSkill(skill)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{skill.name}</h4>
                        <Badge variant="secondary" className="text-xs">{skill.difficulty}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{skill.description}</p>
                      {usageCount > 0 && (
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Used {usageCount}x</span>
                          {avgEffectiveness && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                              {avgEffectiveness}/10
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
