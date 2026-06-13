import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Globe, ExternalLink, Users, BookOpen } from 'lucide-react';
import {
  FELLOWSHIPS,
  MEETING_DIRECTORIES,
  ONLINE_MEETINGS,
  buildNearbySearchUrl,
  type FellowshipId,
  type MeetingDirectory,
} from '@/lib/meeting-finder';

interface MeetingFinderScreenProps {
  /** Navigate to another screen (used to jump to the meeting log in Journal). */
  onNavigate?: (tab: string) => void;
}

function openExternal(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function MeetingFinderScreen({ onNavigate }: MeetingFinderScreenProps = {}) {
  const [location, setLocation] = useState('');

  const searchNearby = (fellowship: FellowshipId) => {
    openExternal(buildNearbySearchUrl(fellowship, location));
  };

  const renderDirectory = (dir: MeetingDirectory) => (
    <button
      key={dir.id}
      onClick={() => openExternal(dir.url)}
      className="w-full flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
      aria-label={`Open ${dir.name} (opens in your browser)`}
    >
      <div>
        <div className="font-semibold text-sm">{dir.name}</div>
        <div className="text-xs text-muted-foreground">{dir.description}</div>
      </div>
      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
    </button>
  );

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Find a Meeting</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Search nearby meetings or browse official directories. Links open in your browser.
        </p>
      </div>

      {/* Near me */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="w-5 h-5" aria-hidden="true" />
            Search near you
          </CardTitle>
          <CardDescription>
            Enter a ZIP code or city, then pick a fellowship. Leave it blank to search from your
            current location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="meeting-location">ZIP code or city</Label>
            <Input
              id="meeting-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. 90210 or Portland, OR"
              autoComplete="postal-code"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {FELLOWSHIPS.map((f) => (
              <Button
                key={f.id}
                variant="outline"
                onClick={() => searchNearby(f.id)}
                aria-label={`Search ${f.label} meetings near ${location.trim() || 'me'}`}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Official directories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5" aria-hidden="true" />
            Official directories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {MEETING_DIRECTORIES.map(renderDirectory)}
        </CardContent>
      </Card>

      {/* Online / 24-7 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="w-5 h-5" aria-hidden="true" />
            Online meetings (anytime)
          </CardTitle>
          <CardDescription>Can&apos;t get to one in person? These run around the clock.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {ONLINE_MEETINGS.map(renderDirectory)}
        </CardContent>
      </Card>

      {/* Log a meeting */}
      {onNavigate && (
        <button
          onClick={() => onNavigate('journal')}
          className="w-full flex items-center justify-between rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent"
          aria-label="Log a meeting you attended"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-primary" aria-hidden="true" />
            <span className="text-sm font-medium">Attended a meeting? Log it in your Journal</span>
          </div>
        </button>
      )}
    </div>
  );
}
