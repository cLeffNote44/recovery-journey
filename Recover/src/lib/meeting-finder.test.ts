import { describe, it, expect } from 'vitest';
import {
  buildNearbySearchUrl,
  MEETING_DIRECTORIES,
  ONLINE_MEETINGS,
  FELLOWSHIPS,
} from './meeting-finder';

const queryOf = (url: string) => decodeURIComponent(url.split('query=')[1]);

describe('meeting-finder', () => {
  it('builds a maps search URL from fellowship + location', () => {
    const url = buildNearbySearchUrl('AA', '90210');
    expect(url).toContain('https://www.google.com/maps/search/?api=1&query=');
    expect(queryOf(url)).toBe('AA Alcoholics Anonymous meetings near 90210');
  });

  it('falls back to "near me" when the location is blank', () => {
    expect(queryOf(buildNearbySearchUrl('NA', '   '))).toBe(
      'NA Narcotics Anonymous meetings near me'
    );
  });

  it('URL-encodes the query so the link has no raw spaces or commas', () => {
    const url = buildNearbySearchUrl('SMART', 'Portland, OR');
    expect(url).not.toContain(' ');
    expect(url).toContain('Portland%2C%20OR');
  });

  it('offers exactly the three fellowships for nearby search', () => {
    expect(FELLOWSHIPS.map((f) => f.id)).toEqual(['AA', 'NA', 'SMART']);
  });

  it('every directory has an id, name, and an https url', () => {
    for (const d of [...MEETING_DIRECTORIES, ...ONLINE_MEETINGS]) {
      expect(d.id).toBeTruthy();
      expect(d.name).toBeTruthy();
      expect(d.url).toMatch(/^https:\/\//);
    }
  });

  it('flags the online meetings as online', () => {
    expect(ONLINE_MEETINGS.every((m) => m.online)).toBe(true);
  });
});
