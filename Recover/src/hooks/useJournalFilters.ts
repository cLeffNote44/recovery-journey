/**
 * Journal Filters Hook
 *
 * Provides filtering and sorting logic for journal entries
 */

import { useMemo, useState } from 'react';
import type { Craving, Meeting, GrowthLog, Challenge, Gratitude, Meditation } from '@/types/app';
import type { JournalFilters } from '@/components/JournalFilters';

type JournalEntry = Craving | Meeting | GrowthLog | Challenge | Gratitude | Meditation;

interface UseJournalFiltersOptions<T extends JournalEntry> {
  entries: T[];
  searchFields: (keyof T)[];
  defaultFilters?: Partial<JournalFilters>;
}

interface UseJournalFiltersReturn<T extends JournalEntry> {
  filteredEntries: T[];
  filters: JournalFilters;
  setFilters: (filters: JournalFilters) => void;
  resultCount: number;
}

export function useJournalFilters<T extends JournalEntry>({
  entries,
  searchFields,
  defaultFilters = {},
}: UseJournalFiltersOptions<T>): UseJournalFiltersReturn<T> {
  const [filters, setFilters] = useState<JournalFilters>({
    search: '',
    dateRange: 'all',
    sortBy: 'newest',
    ...defaultFilters,
  });

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((entry) => {
        const entryDate = new Date(entry.date);
        return entryDate >= cutoffDate;
      });
    }

    // Apply search filter
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((entry) => {
        return searchFields.some((field) => {
          const value = entry[field];
          if (typeof value === 'string') {
            return value.toLowerCase().includes(searchLower);
          }
          if (typeof value === 'number') {
            return value.toString().includes(searchLower);
          }
          return false;
        });
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();

      switch (filters.sortBy) {
        case 'oldest':
          return dateA - dateB;
        case 'newest':
          return dateB - dateA;
        case 'intensity':
          // For cravings with intensity field
          if ('intensity' in a && 'intensity' in b) {
            return (b.intensity as number) - (a.intensity as number);
          }
          return dateB - dateA;
        default:
          return dateB - dateA;
      }
    });

    return filtered;
  }, [entries, filters, searchFields]);

  return {
    filteredEntries,
    filters,
    setFilters,
    resultCount: filteredEntries.length,
  };
}
