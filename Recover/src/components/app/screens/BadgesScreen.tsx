/**
 * Badges Screen
 * Display earned, in-progress, and locked badges with filtering
 */

import { useState, useMemo } from 'react';
import { useAppData } from '@/hooks/useAppData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge as BadgeUI } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Lock, Target, Star, Filter } from 'lucide-react';
import {
  calculateBadgeProgress,
  getEarnedBadges,
  getInProgressBadges,
  getLockedBadges,
  getBadgeTierColor,
  getBadgeCategoryColor
} from '@/lib/badges';
import type { BadgeProgress } from '@/lib/badges';

type CategoryFilter = 'all' | 'recovery' | 'engagement' | 'wellness' | 'growth' | 'crisis' | 'special';

export function BadgesScreen() {
  const {
    sobrietyDate,
    checkIns,
    meditations,
    meetings,
    cravings,
    gratitude,
    growthLogs,
    challenges,
    unlockedBadges
  } = useAppData();

  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  // Calculate all badge progress
  const badgeProgress = useMemo(() => calculateBadgeProgress({
    sobrietyDate,
    checkIns,
    meditations,
    meetings,
    cravings,
    gratitude,
    growthLogs,
    challenges,
    unlockedBadges
  }), [sobrietyDate, checkIns, meditations, meetings, cravings, gratitude, growthLogs, challenges, unlockedBadges]);

  // Get categorized badges
  const earnedBadges = useMemo(() => getEarnedBadges(badgeProgress), [badgeProgress]);
  const inProgressBadges = useMemo(() => getInProgressBadges(badgeProgress), [badgeProgress]);
  const lockedBadges = useMemo(() => getLockedBadges(badgeProgress), [badgeProgress]);

  // Filter by category
  const filterByCategory = (badges: BadgeProgress[]) => {
    if (categoryFilter === 'all') return badges;
    return badges.filter(bp => bp.badge.category === categoryFilter);
  };

  const filteredEarned = useMemo(() => filterByCategory(earnedBadges), [earnedBadges, categoryFilter]);
  const filteredInProgress = useMemo(() => filterByCategory(inProgressBadges), [inProgressBadges, categoryFilter]);
  const filteredLocked = useMemo(() => filterByCategory(lockedBadges), [lockedBadges, categoryFilter]);

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <Card className="bg-gradient-to-br from-slate-700 via-slate-800 to-gray-900 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Achievements</h1>
              <p className="text-sm opacity-90">
                {earnedBadges.length} of {badgeProgress.length} badges earned
              </p>
            </div>
            <div className="text-5xl">
              <Trophy className="w-12 h-12" />
            </div>
          </div>
          <div className="mt-4">
            <Progress
              value={(earnedBadges.length / badgeProgress.length) * 100}
              className="h-2 bg-white/20"
            />
          </div>
        </CardContent>
      </Card>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Filter className="w-4 h-4" />
            Filter by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(['all', 'recovery', 'engagement', 'wellness', 'growth', 'crisis', 'special'] as CategoryFilter[]).map(cat => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="earned" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="earned">
            <Trophy className="w-4 h-4 mr-2" />
            Earned ({filteredEarned.length})
          </TabsTrigger>
          <TabsTrigger value="progress">
            <Target className="w-4 h-4 mr-2" />
            In Progress ({filteredInProgress.length})
          </TabsTrigger>
          <TabsTrigger value="locked">
            <Lock className="w-4 h-4 mr-2" />
            Locked ({filteredLocked.length})
          </TabsTrigger>
        </TabsList>

        {/* Earned Badges Tab */}
        <TabsContent value="earned" className="space-y-3 mt-4">
          {filteredEarned.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No badges earned yet{categoryFilter !== 'all' && ` in ${categoryFilter} category`}.
                  Keep going!
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEarned.map(({ badge }) => (
              <Card key={badge.id} className="border-green-200 dark:border-green-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{badge.name}</h3>
                        {badge.tier && (
                          <BadgeUI variant="outline" className={getBadgeTierColor(badge.tier)}>
                            {badge.tier}
                          </BadgeUI>
                        )}
                        {badge.secret && (
                          <BadgeUI variant="secondary">
                            <Star className="w-3 h-3 mr-1" />
                            Secret
                          </BadgeUI>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      {badge.category && (
                        <BadgeUI className={getBadgeCategoryColor(badge.category)}>
                          {badge.category}
                        </BadgeUI>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* In Progress Badges Tab */}
        <TabsContent value="progress" className="space-y-3 mt-4">
          {filteredInProgress.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No badges in progress{categoryFilter !== 'all' && ` in ${categoryFilter} category`}.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInProgress.map(({ badge, progress, progressText }) => (
              <Card key={badge.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl opacity-70">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{badge.name}</h3>
                        {badge.tier && (
                          <BadgeUI variant="outline" className={getBadgeTierColor(badge.tier)}>
                            {badge.tier}
                          </BadgeUI>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Progress</span>
                          <span className="font-medium">{progressText}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      {badge.category && (
                        <BadgeUI className={`mt-2 ${getBadgeCategoryColor(badge.category)}`}>
                          {badge.category}
                        </BadgeUI>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Locked Badges Tab */}
        <TabsContent value="locked" className="space-y-3 mt-4">
          {filteredLocked.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Lock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No locked badges{categoryFilter !== 'all' && ` in ${categoryFilter} category`}.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredLocked.map(({ badge }) => (
              <Card key={badge.id} className="opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl grayscale">{badge.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-muted-foreground">{badge.name}</h3>
                        {badge.tier && (
                          <BadgeUI variant="outline" className="text-muted-foreground">
                            {badge.tier}
                          </BadgeUI>
                        )}
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Requirement: {badge.requirement} {badge.type || 'days'}
                        </span>
                        {badge.category && (
                          <BadgeUI className={getBadgeCategoryColor(badge.category)}>
                            {badge.category}
                          </BadgeUI>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
