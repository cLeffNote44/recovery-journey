import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeetingFinderScreen } from './MeetingFinderScreen';

describe('MeetingFinderScreen', () => {
  beforeEach(() => {
    vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  it('opens a location-scoped maps search for the chosen fellowship', () => {
    render(<MeetingFinderScreen />);
    fireEvent.change(screen.getByLabelText('ZIP code or city'), {
      target: { value: '90210' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Search AA meetings near 90210/i }));

    expect(window.open).toHaveBeenCalledTimes(1);
    const url = (window.open as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0] as string;
    expect(decodeURIComponent(url)).toContain('AA Alcoholics Anonymous meetings near 90210');
  });

  it('opens an official directory in the browser', () => {
    render(<MeetingFinderScreen />);
    fireEvent.click(screen.getByLabelText(/Open Alcoholics Anonymous/i));
    expect(window.open).toHaveBeenCalledWith(
      'https://www.aa.org/find-aa',
      '_blank',
      'noopener,noreferrer'
    );
  });

  it('routes to the Journal to log an attended meeting', () => {
    const onNavigate = vi.fn();
    render(<MeetingFinderScreen onNavigate={onNavigate} />);
    fireEvent.click(screen.getByLabelText('Log a meeting you attended'));
    expect(onNavigate).toHaveBeenCalledWith('journal');
  });
});
