/**
 * BottomNav Component Tests
 *
 * Locks in the consolidated 5-tab information architecture: Settings moved to
 * the header and Calendar folded into Home, leaving five primary destinations.
 */

import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BottomNav } from './BottomNav';

beforeAll(() => {
  // jsdom doesn't implement Element.scrollTo, which the active-tab auto-scroll uses.
  Element.prototype.scrollTo = vi.fn();
});

describe('BottomNav', () => {
  it('renders exactly the five primary destinations', () => {
    render(<BottomNav activeTab="home" onTabChange={() => {}} />);
    expect(screen.getAllByRole('tab')).toHaveLength(5);
    for (const label of ['Home', 'Journal', 'Prevention', 'Wellness', 'Facility']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('no longer shows Calendar or Settings as tabs', () => {
    render(<BottomNav activeTab="home" onTabChange={() => {}} />);
    expect(screen.queryByText('Calendar')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('invokes onTabChange with the tab id when a tab is clicked', () => {
    const onTabChange = vi.fn();
    render(<BottomNav activeTab="home" onTabChange={onTabChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /Wellness/i }));
    expect(onTabChange).toHaveBeenCalledWith('wellness');
  });
});
