/**
 * useJournalFilters Hook Tests
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useJournalFilters } from './useJournalFilters';
import type { CheckIn } from '@/types/app';

describe('useJournalFilters', () => {
  const mockCheckIns: CheckIn[] = [
    {
      id: '1',
      date: new Date().toISOString(),
      mood: 8,
      notes: 'Feeling great today',
      triggers: [],
      copingStrategies: [],
    },
    {
      id: '2',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      mood: 6,
      notes: 'Had some challenges',
      triggers: ['stress'],
      copingStrategies: ['meditation'],
    },
    {
      id: '3',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      mood: 9,
      notes: 'Amazing progress',
      triggers: [],
      copingStrategies: [],
    },
  ];

  it('should return all entries by default', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    expect(result.current.filteredEntries).toHaveLength(3);
  });

  it('should filter by search term', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: 'great',
      });
    });

    expect(result.current.filteredEntries).toHaveLength(1);
    expect(result.current.filteredEntries[0].id).toBe('1');
  });

  it('should filter by date range (week)', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        dateRange: 'week',
      });
    });

    // Should only include entries from last 7 days (ids 1 and 2)
    expect(result.current.filteredEntries).toHaveLength(2);
    expect(result.current.filteredEntries.find(e => e.id === '3')).toBeUndefined();
  });

  it('should filter by date range (month)', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        dateRange: 'month',
      });
    });

    // All entries are within last month
    expect(result.current.filteredEntries).toHaveLength(3);
  });

  it('should sort by date descending (newest)', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    // Default sort is newest
    expect(result.current.filteredEntries[0].id).toBe('1'); // Most recent
    expect(result.current.filteredEntries[2].id).toBe('3'); // Oldest
  });

  it('should sort by date ascending (oldest)', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        sortBy: 'oldest',
      });
    });

    expect(result.current.filteredEntries[0].id).toBe('3'); // Oldest
    expect(result.current.filteredEntries[2].id).toBe('1'); // Most recent
  });

  it('should combine multiple filters', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: 'challenges',
        dateRange: 'week',
      });
    });

    expect(result.current.filteredEntries).toHaveLength(1);
    expect(result.current.filteredEntries[0].id).toBe('2');
  });

  it('should search across multiple fields', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes', 'mood'],
      })
    );

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: '6',
      });
    });

    // Should find entry with mood 6
    expect(result.current.filteredEntries).toHaveLength(1);
    expect(result.current.filteredEntries[0].id).toBe('2');
  });

  it('should handle case-insensitive search', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: 'GREAT',
      });
    });

    expect(result.current.filteredEntries).toHaveLength(1);
    expect(result.current.filteredEntries[0].id).toBe('1');
  });

  it('should return result count', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: mockCheckIns,
        searchFields: ['notes'],
      })
    );

    expect(result.current.resultCount).toBe(3);

    act(() => {
      result.current.setFilters({
        ...result.current.filters,
        search: 'great',
      });
    });

    expect(result.current.resultCount).toBe(1);
  });

  it('should handle empty entries', () => {
    const { result } = renderHook(() =>
      useJournalFilters({
        entries: [],
        searchFields: ['notes'],
      })
    );

    expect(result.current.filteredEntries).toHaveLength(0);
    expect(result.current.resultCount).toBe(0);
  });
});
