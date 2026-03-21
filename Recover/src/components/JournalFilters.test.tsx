/**
 * JournalFilters Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JournalFiltersComponent } from './JournalFilters';
import type { JournalFilters } from './JournalFilters';

describe('JournalFiltersComponent', () => {
  const defaultFilters: JournalFilters = {
    search: '',
    dateRange: 'all',
    sortBy: 'newest',
  };

  it('should render search input', () => {
    const onFiltersChange = vi.fn();
    render(
      <JournalFiltersComponent
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
      />
    );

    expect(screen.getByPlaceholderText('Search entries...')).toBeInTheDocument();
  });

  it('should call onFiltersChange when search input changes', () => {
    const onFiltersChange = vi.fn();
    render(
      <JournalFiltersComponent
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search entries...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...defaultFilters,
      search: 'test search',
    });
  });

  it('should render date range selector', () => {
    const onFiltersChange = vi.fn();
    render(
      <JournalFiltersComponent
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
      />
    );

    expect(screen.getByText('All Time')).toBeInTheDocument();
  });

  it('should render intensity sort when provided', () => {
    const onFiltersChange = vi.fn();
    render(
      <JournalFiltersComponent
        filters={defaultFilters}
        onFiltersChange={onFiltersChange}
        showIntensitySort={true}
      />
    );

    // Click to open select to show intensity option
    const sortSelects = screen.getAllByRole('combobox');
    fireEvent.click(sortSelects[1]);

    // Should have intensity option
    expect(screen.getByText('Intensity')).toBeInTheDocument();
  });

  it('should display active filters count', () => {
    const onFiltersChange = vi.fn();
    const filtersWithSearch: JournalFilters = {
      ...defaultFilters,
      search: 'test',
      dateRange: 'week',
    };

    render(
      <JournalFiltersComponent
        filters={filtersWithSearch}
        onFiltersChange={onFiltersChange}
      />
    );

    // Should show that filters are active
    expect(screen.getByPlaceholderText('Search entries...')).toHaveValue('test');
  });

  it('should handle clear search button', () => {
    const onFiltersChange = vi.fn();
    const filtersWithSearch: JournalFilters = {
      ...defaultFilters,
      search: 'test search',
    };

    render(
      <JournalFiltersComponent
        filters={filtersWithSearch}
        onFiltersChange={onFiltersChange}
      />
    );

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(onFiltersChange).toHaveBeenCalledWith({
      ...filtersWithSearch,
      search: '',
    });
  });

  it('should show clear filters button when filters are active', () => {
    const onFiltersChange = vi.fn();
    const activeFilters: JournalFilters = {
      search: 'test',
      dateRange: 'week',
      sortBy: 'oldest',
    };

    render(
      <JournalFiltersComponent
        filters={activeFilters}
        onFiltersChange={onFiltersChange}
      />
    );

    expect(screen.getByText('Clear Filters')).toBeInTheDocument();
  });

  it('should clear all filters when clear button is clicked', () => {
    const onFiltersChange = vi.fn();
    const activeFilters: JournalFilters = {
      search: 'test',
      dateRange: 'week',
      sortBy: 'oldest',
    };

    render(
      <JournalFiltersComponent
        filters={activeFilters}
        onFiltersChange={onFiltersChange}
      />
    );

    const clearButton = screen.getByText('Clear Filters');
    fireEvent.click(clearButton);

    expect(onFiltersChange).toHaveBeenCalledWith({
      search: '',
      dateRange: 'all',
      sortBy: 'newest',
    });
  });
});
