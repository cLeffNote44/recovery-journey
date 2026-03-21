/**
 * Journal Filters Component
 *
 * Provides search and filter capabilities for journal entries
 */

import { memo, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, X, Filter, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export interface JournalFilters {
  search: string;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'newest' | 'oldest' | 'intensity';
}

interface JournalFiltersProps {
  filters: JournalFilters;
  onFiltersChange: (filters: JournalFilters) => void;
  showIntensitySort?: boolean;
}

export const JournalFiltersComponent = memo(function JournalFiltersComponent({
  filters,
  onFiltersChange,
  showIntensitySort = false,
}: JournalFiltersProps) {
  const hasActiveFilters = useMemo(
    () => filters.search !== '' || filters.dateRange !== 'all' || filters.sortBy !== 'newest',
    [filters]
  );

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleDateRangeChange = (value: string) => {
    onFiltersChange({ ...filters, dateRange: value as JournalFilters['dateRange'] });
  };

  const handleSortChange = (value: string) => {
    onFiltersChange({ ...filters, sortBy: value as JournalFilters['sortBy'] });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      dateRange: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <Card className="mb-4">
      <CardContent className="pt-4 space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search entries..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search journal entries"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => handleSearchChange('')}
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-2 gap-3">
          {/* Date Range Filter */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Time Period
            </label>
            <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 Days</SelectItem>
                <SelectItem value="month">Last 30 Days</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground flex items-center gap-1">
              <Filter className="w-3 h-3" />
              Sort By
            </label>
            <Select value={filters.sortBy} onValueChange={handleSortChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                {showIntensitySort && <SelectItem value="intensity">Intensity</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
