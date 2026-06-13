/**
 * Meeting finder.
 *
 * The app deliberately does not call an external meeting API from inside the
 * WebView (network policy aside, no single API covers every fellowship). It
 * instead opens the established, official locators in the device browser and
 * builds a maps search for "near me" discovery. This keeps meeting discovery
 * working everywhere without a backend, an API key, or a native geolocation
 * dependency — the patient types a ZIP/city (or leaves it blank for a generic
 * search).
 */

export interface MeetingDirectory {
  id: string;
  name: string;
  description: string;
  /** Official directory / search URL, opened in the device browser. */
  url: string;
  /** Always-available online/virtual meetings. */
  online?: boolean;
}

/** Fellowships offered for the location-based "near me" search. */
export const FELLOWSHIPS = [
  { id: 'AA', label: 'AA', query: 'AA Alcoholics Anonymous' },
  { id: 'NA', label: 'NA', query: 'NA Narcotics Anonymous' },
  { id: 'SMART', label: 'SMART', query: 'SMART Recovery' },
] as const;

export type FellowshipId = (typeof FELLOWSHIPS)[number]['id'];

/** Official, in-person-capable meeting directories. */
export const MEETING_DIRECTORIES: MeetingDirectory[] = [
  {
    id: 'aa',
    name: 'Alcoholics Anonymous',
    description: 'Find local AA meetings and your nearest intergroup.',
    url: 'https://www.aa.org/find-aa',
  },
  {
    id: 'na',
    name: 'Narcotics Anonymous',
    description: 'Search NA meetings worldwide.',
    url: 'https://www.na.org/meetingsearch/',
  },
  {
    id: 'smart',
    name: 'SMART Recovery',
    description: 'Science-based, in-person and online meetings.',
    url: 'https://meetings.smartrecovery.org/',
  },
  {
    id: 'samhsa',
    name: 'SAMHSA Treatment Locator',
    description: 'Find treatment and support services near you.',
    url: 'https://findtreatment.gov/',
  },
];

/** Always-available online / virtual meetings. */
export const ONLINE_MEETINGS: MeetingDirectory[] = [
  {
    id: 'itr',
    name: 'In The Rooms',
    description: 'Live online meetings around the clock, many fellowships.',
    url: 'https://www.intherooms.com/home/',
    online: true,
  },
  {
    id: 'aa-online',
    name: 'AA Online Intergroup',
    description: 'Online AA meetings at every hour.',
    url: 'https://aa-intergroup.org/meetings/',
    online: true,
  },
  {
    id: 'na-virtual',
    name: 'NA Virtual Meetings',
    description: 'Online NA meetings worldwide.',
    url: 'https://virtual-na.org/meetings/',
    online: true,
  },
];

/**
 * Build a maps search URL for meetings of a fellowship near a location.
 * Uses Google Maps' documented universal URL scheme, which opens the Maps app
 * on a device and the web map elsewhere. A blank location yields a generic
 * "near me" search the map resolves from the device's own location.
 */
export function buildNearbySearchUrl(fellowship: FellowshipId, location: string): string {
  const f = FELLOWSHIPS.find((x) => x.id === fellowship);
  const base = f ? f.query : String(fellowship);
  const trimmed = location.trim();
  const query = trimmed ? `${base} meetings near ${trimmed}` : `${base} meetings near me`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
