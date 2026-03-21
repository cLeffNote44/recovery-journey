import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  X,
  AlertTriangle,
  Users,
  Target,
  Heart,
  TrendingUp,
  Moon,
  Pill,
  Dumbbell,
  Apple,
  BookOpen,
  Calendar
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

interface SearchResult {
  id: number;
  type: string;
  title: string;
  subtitle: string;
  date: string;
  tab: string;
  icon: React.ReactNode;
}

export function SearchModal({ isOpen, onClose, onNavigate }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const {
    cravings,
    meetings,
    growthLogs,
    challenges,
    gratitude,
    meditations,
    contacts,
    goals,
    sleepEntries,
    medications,
    exerciseEntries,
    nutritionEntries,
    relapses
  } = useAppData();

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const searchTerm = query.toLowerCase();
    const matches: SearchResult[] = [];

    // Search cravings
    cravings.forEach(item => {
      const searchable = `${item.trigger} ${item.triggerNotes || ''} ${item.copingStrategy || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Craving',
          title: `Craving - ${item.trigger}`,
          subtitle: item.copingStrategy || `Intensity: ${item.intensity}/10`,
          date: item.date,
          tab: 'journal',
          icon: <AlertTriangle className="w-4 h-4 text-orange-500" />
        });
      }
    });

    // Search meetings
    meetings.forEach(item => {
      const searchable = `${item.type} ${item.location} ${item.notes || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Meeting',
          title: item.type,
          subtitle: item.location,
          date: item.date,
          tab: 'journal',
          icon: <Users className="w-4 h-4 text-blue-500" />
        });
      }
    });

    // Search growth logs
    growthLogs.forEach(item => {
      const searchable = `${item.title} ${item.description}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Growth',
          title: item.title,
          subtitle: item.description.substring(0, 50) + (item.description.length > 50 ? '...' : ''),
          date: item.date,
          tab: 'journal',
          icon: <TrendingUp className="w-4 h-4 text-green-500" />
        });
      }
    });

    // Search challenges
    challenges.forEach(item => {
      const searchable = `${item.situation} ${item.response} ${item.outcome}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Challenge',
          title: 'Challenge',
          subtitle: item.situation.substring(0, 50) + (item.situation.length > 50 ? '...' : ''),
          date: item.date,
          tab: 'journal',
          icon: <Target className="w-4 h-4 text-blue-500" />
        });
      }
    });

    // Search gratitude
    gratitude.forEach(item => {
      if (item.entry.toLowerCase().includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Gratitude',
          title: 'Gratitude',
          subtitle: item.entry.substring(0, 50) + (item.entry.length > 50 ? '...' : ''),
          date: item.date,
          tab: 'journal',
          icon: <Heart className="w-4 h-4 text-red-500" />
        });
      }
    });

    // Search meditations
    meditations.forEach(item => {
      const searchable = `${item.type} ${item.notes || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Meditation',
          title: `${item.type} Meditation`,
          subtitle: `${item.duration} minutes`,
          date: item.date,
          tab: 'journal',
          icon: <BookOpen className="w-4 h-4 text-indigo-500" />
        });
      }
    });

    // Search contacts
    contacts.forEach(item => {
      const searchable = `${item.name} ${item.relationship} ${item.phone || ''} ${item.email || ''} ${item.notes || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Contact',
          title: item.name,
          subtitle: item.relationship,
          date: '',
          tab: 'contacts',
          icon: <Users className="w-4 h-4 text-cyan-500" />
        });
      }
    });

    // Search goals
    goals.forEach(item => {
      const searchable = `${item.title} ${item.description || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Goal',
          title: item.title,
          subtitle: `${item.progress}% complete`,
          date: item.targetDate || '',
          tab: 'home',
          icon: <Target className="w-4 h-4 text-amber-500" />
        });
      }
    });

    // Search sleep entries
    sleepEntries.forEach(item => {
      const searchable = `${item.notes || ''} sleep`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Sleep',
          title: 'Sleep Entry',
          subtitle: `${item.duration} hours - Quality: ${item.quality}/10`,
          date: item.date,
          tab: 'wellness',
          icon: <Moon className="w-4 h-4 text-indigo-500" />
        });
      }
    });

    // Search medications
    medications.forEach(item => {
      const searchable = `${item.name} ${item.dosage} ${item.notes || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Medication',
          title: item.name,
          subtitle: `${item.dosage} - ${item.frequency}`,
          date: '',
          tab: 'wellness',
          icon: <Pill className="w-4 h-4 text-blue-500" />
        });
      }
    });

    // Search exercise entries
    exerciseEntries.forEach(item => {
      const searchable = `${item.type} ${item.notes || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Exercise',
          title: item.type,
          subtitle: `${item.duration} min - Intensity: ${item.intensity}/10`,
          date: item.date,
          tab: 'wellness',
          icon: <Dumbbell className="w-4 h-4 text-green-500" />
        });
      }
    });

    // Search nutrition entries
    nutritionEntries.forEach(item => {
      const searchable = `${item.meals.join(' ')} ${item.notes || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Nutrition',
          title: 'Nutrition Entry',
          subtitle: `${item.meals.length} meals - ${item.waterIntake} glasses water`,
          date: item.date,
          tab: 'wellness',
          icon: <Apple className="w-4 h-4 text-red-500" />
        });
      }
    });

    // Search setbacks/relapses
    relapses.forEach(item => {
      const searchable = `${item.triggers.join(' ')} ${item.circumstances} ${item.lessonsLearned || ''} ${item.preventionPlan || ''}`.toLowerCase();
      if (searchable.includes(searchTerm)) {
        matches.push({
          id: item.id,
          type: 'Setback',
          title: 'Setback Entry',
          subtitle: item.triggers.slice(0, 2).join(', '),
          date: item.date,
          tab: 'journal',
          icon: <Heart className="w-4 h-4 text-blue-500" />
        });
      }
    });

    // Sort by date (most recent first)
    return matches.sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [query, cravings, meetings, growthLogs, challenges, gratitude, meditations, contacts, goals, sleepEntries, medications, exerciseEntries, nutritionEntries, relapses]);

  const handleResultClick = (result: SearchResult) => {
    onNavigate(result.tab);
    onClose();
    setQuery('');
  };

  const handleClose = () => {
    onClose();
    setQuery('');
  };

  if (!isOpen) return null;

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-16">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search everything..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 border-0 focus-visible:ring-0 text-lg"
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <CardContent className="p-0 overflow-y-auto max-h-[60vh]">
          {query.trim() === '' ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search across all your data</p>
              <p className="text-sm mt-2">
                Search journal entries, contacts, goals, wellness data, and more
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No results found for "{query}"</p>
              <p className="text-sm mt-2">Try different keywords</p>
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <div className="px-4 py-2 bg-muted/50 text-sm font-medium text-muted-foreground">
                    {type} ({items.length})
                  </div>
                  {items.slice(0, 5).map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <div className="mt-0.5">{result.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{result.title}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {result.subtitle}
                        </p>
                        {result.date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(result.date)}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                  {items.length > 5 && (
                    <div className="px-4 py-2 text-sm text-muted-foreground text-center">
                      +{items.length - 5} more results
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {results.length > 0 && (
          <div className="p-3 border-t text-center text-sm text-muted-foreground">
            {results.length} result{results.length !== 1 ? 's' : ''} found
          </div>
        )}
      </Card>
    </div>
  );
}
