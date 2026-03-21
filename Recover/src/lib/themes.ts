/**
 * Theme System for Recover
 *
 * Provides color theme presets and custom theme support.
 * Each theme defines a complete color palette that overrides CSS variables.
 */

export type ThemeMode = 'light' | 'dark';
export type ThemeColorScheme = 'default' | 'ocean' | 'forest' | 'sunset' | 'night' | 'cherry-blossom' | 'custom';

export interface ColorPalette {
  // Primary colors
  primary: string;
  primaryForeground: string;

  // Secondary colors (lighter version of primary)
  secondary: string;
  secondaryForeground: string;

  // Accent colors
  accent: string;
  accentForeground: string;

  // Muted colors (very subtle theme tint)
  muted: string;
  mutedForeground: string;

  // Card colors (with theme tint)
  card: string;
  cardForeground: string;

  // Border & input colors
  border: string;
  input: string;
  ring: string;

  // Chart colors
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface Theme {
  id: ThemeColorScheme;
  name: string;
  description: string;
  emoji: string;
  light: ColorPalette;
  dark: ColorPalette;
}

/**
 * Default theme (Blue) - Original recovery journey colors
 */
const defaultTheme: Theme = {
  id: 'default',
  name: 'Default Blue',
  description: 'Classic recovery journey blue theme',
  emoji: '💙',
  light: {
    primary: '217 91% 60%',
    primaryForeground: '210 40% 98%',
    secondary: '217 91% 92%',
    secondaryForeground: '217 91% 25%',
    accent: '217 80% 85%',
    accentForeground: '217 80% 25%',
    muted: '217 50% 93%',
    mutedForeground: '217 30% 35%',
    card: '217 70% 94%',
    cardForeground: '217 30% 12%',
    border: '217 60% 80%',
    input: '217 60% 82%',
    ring: '217 91% 60%',
    chart1: '217 91% 70%',
    chart2: '217 91% 60%',
    chart3: '217 91% 50%',
    chart4: '217 91% 40%',
    chart5: '217 91% 30%',
  },
  dark: {
    primary: '217 91% 60%',
    primaryForeground: '210 40% 98%',
    secondary: '217 60% 22%',
    secondaryForeground: '217 91% 88%',
    accent: '217 65% 28%',
    accentForeground: '217 91% 88%',
    muted: '217 50% 20%',
    mutedForeground: '217 30% 62%',
    card: '217 60% 16%',
    cardForeground: '217 30% 88%',
    border: '217 60% 32%',
    input: '217 60% 35%',
    ring: '217 91% 65%',
    chart1: '217 91% 70%',
    chart2: '217 91% 60%',
    chart3: '217 91% 50%',
    chart4: '217 91% 40%',
    chart5: '217 91% 30%',
  }
};

/**
 * Ocean theme - Calming blues and teals
 */
const oceanTheme: Theme = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Calming blues and teals like the ocean waves',
  emoji: '🌊',
  light: {
    primary: '199 89% 48%',
    primaryForeground: '185 57% 98%',
    secondary: '199 89% 92%',
    secondaryForeground: '199 89% 24%',
    accent: '183 75% 82%',
    accentForeground: '183 75% 24%',
    muted: '199 55% 92%',
    mutedForeground: '199 35% 33%',
    card: '199 70% 93%',
    cardForeground: '199 35% 12%',
    border: '199 60% 78%',
    input: '199 60% 80%',
    ring: '199 89% 48%',
    chart1: '199 89% 68%',
    chart2: '199 89% 58%',
    chart3: '199 89% 48%',
    chart4: '199 89% 38%',
    chart5: '183 84% 56%',
  },
  dark: {
    primary: '199 89% 52%',
    primaryForeground: '185 57% 98%',
    secondary: '199 65% 21%',
    secondaryForeground: '199 89% 86%',
    accent: '183 70% 26%',
    accentForeground: '183 84% 86%',
    muted: '199 55% 19%',
    mutedForeground: '199 35% 60%',
    card: '199 65% 15%',
    cardForeground: '199 35% 86%',
    border: '199 65% 30%',
    input: '199 65% 33%',
    ring: '199 89% 55%',
    chart1: '199 89% 68%',
    chart2: '199 89% 58%',
    chart3: '199 89% 48%',
    chart4: '199 89% 38%',
    chart5: '183 84% 56%',
  }
};

/**
 * Forest theme - Earthy greens and nature tones
 */
const forestTheme: Theme = {
  id: 'forest',
  name: 'Forest',
  description: 'Earthy greens inspired by nature and growth',
  emoji: '🌲',
  light: {
    primary: '142 71% 45%',
    primaryForeground: '138 76% 97%',
    secondary: '142 71% 91%',
    secondaryForeground: '142 71% 24%',
    accent: '142 68% 83%',
    accentForeground: '142 68% 22%',
    muted: '142 50% 92%',
    mutedForeground: '142 35% 32%',
    card: '142 65% 93%',
    cardForeground: '142 35% 11%',
    border: '142 60% 77%',
    input: '142 60% 79%',
    ring: '142 71% 45%',
    chart1: '142 71% 65%',
    chart2: '142 71% 55%',
    chart3: '142 71% 45%',
    chart4: '142 71% 35%',
    chart5: '142 71% 25%',
  },
  dark: {
    primary: '142 71% 50%',
    primaryForeground: '138 76% 97%',
    secondary: '142 60% 20%',
    secondaryForeground: '142 71% 85%',
    accent: '142 65% 25%',
    accentForeground: '142 76% 85%',
    muted: '142 50% 18%',
    mutedForeground: '142 35% 58%',
    card: '142 60% 14%',
    cardForeground: '142 35% 85%',
    border: '142 60% 29%',
    input: '142 60% 32%',
    ring: '142 71% 55%',
    chart1: '142 71% 65%',
    chart2: '142 71% 55%',
    chart3: '142 71% 45%',
    chart4: '142 71% 35%',
    chart5: '142 71% 25%',
  }
};

/**
 * Sunset theme - Warm oranges and purples
 */
const sunsetTheme: Theme = {
  id: 'sunset',
  name: 'Sunset',
  description: 'Warm oranges and purples like a beautiful sunset',
  emoji: '🌅',
  light: {
    primary: '24 94% 50%',
    primaryForeground: '20 14% 98%',
    secondary: '24 94% 91%',
    secondaryForeground: '24 94% 24%',
    accent: '280 60% 85%',
    accentForeground: '280 60% 26%',
    muted: '24 55% 92%',
    mutedForeground: '24 40% 33%',
    card: '24 70% 93%',
    cardForeground: '24 40% 11%',
    border: '24 65% 78%',
    input: '24 65% 80%',
    ring: '24 94% 50%',
    chart1: '24 94% 70%',
    chart2: '24 94% 60%',
    chart3: '24 94% 50%',
    chart4: '24 94% 40%',
    chart5: '280 65% 60%',
  },
  dark: {
    primary: '24 94% 55%',
    primaryForeground: '20 14% 98%',
    secondary: '24 65% 20%',
    secondaryForeground: '24 94% 86%',
    accent: '280 60% 27%',
    accentForeground: '280 65% 86%',
    muted: '24 55% 18%',
    mutedForeground: '24 40% 58%',
    card: '24 65% 14%',
    cardForeground: '24 40% 86%',
    border: '24 65% 30%',
    input: '24 65% 33%',
    ring: '24 94% 58%',
    chart1: '24 94% 70%',
    chart2: '24 94% 60%',
    chart3: '24 94% 50%',
    chart4: '24 94% 40%',
    chart5: '280 65% 60%',
  }
};

/**
 * Night theme - Deep purples and blues for late-night use
 */
const nightTheme: Theme = {
  id: 'night',
  name: 'Night',
  description: 'Deep purples and blues perfect for nighttime',
  emoji: '🌙',
  light: {
    primary: '262 83% 58%',
    primaryForeground: '270 20% 98%',
    secondary: '262 83% 91%',
    secondaryForeground: '262 83% 26%',
    accent: '250 80% 84%',
    accentForeground: '250 80% 28%',
    muted: '262 55% 92%',
    mutedForeground: '262 40% 33%',
    card: '262 68% 93%',
    cardForeground: '262 40% 11%',
    border: '262 65% 78%',
    input: '262 65% 80%',
    ring: '262 83% 58%',
    chart1: '262 83% 78%',
    chart2: '262 83% 68%',
    chart3: '262 83% 58%',
    chart4: '262 83% 48%',
    chart5: '250 95% 68%',
  },
  dark: {
    primary: '262 83% 62%',
    primaryForeground: '270 20% 98%',
    secondary: '262 60% 21%',
    secondaryForeground: '262 83% 86%',
    accent: '250 65% 29%',
    accentForeground: '250 95% 86%',
    muted: '262 55% 18%',
    mutedForeground: '262 40% 60%',
    card: '262 65% 14%',
    cardForeground: '262 40% 86%',
    border: '262 65% 30%',
    input: '262 65% 33%',
    ring: '262 83% 65%',
    chart1: '262 83% 78%',
    chart2: '262 83% 68%',
    chart3: '262 83% 58%',
    chart4: '262 83% 48%',
    chart5: '250 95% 68%',
  }
};

/**
 * Cherry Blossom theme - Soft pinks and purples
 */
const cherryBlossomTheme: Theme = {
  id: 'cherry-blossom',
  name: 'Cherry Blossom',
  description: 'Soft pinks and purples like spring blossoms',
  emoji: '🌸',
  light: {
    primary: '330 81% 60%',
    primaryForeground: '340 75% 98%',
    secondary: '330 81% 91%',
    secondaryForeground: '330 81% 28%',
    accent: '310 55% 84%',
    accentForeground: '310 55% 26%',
    muted: '330 50% 92%',
    mutedForeground: '330 40% 32%',
    card: '330 68% 93%',
    cardForeground: '330 40% 11%',
    border: '330 62% 79%',
    input: '330 62% 81%',
    ring: '330 81% 60%',
    chart1: '330 81% 80%',
    chart2: '330 81% 70%',
    chart3: '330 81% 60%',
    chart4: '330 81% 50%',
    chart5: '310 60% 65%',
  },
  dark: {
    primary: '330 81% 65%',
    primaryForeground: '340 75% 98%',
    secondary: '330 62% 21%',
    secondaryForeground: '330 81% 86%',
    accent: '310 58% 27%',
    accentForeground: '310 60% 86%',
    muted: '330 50% 18%',
    mutedForeground: '330 40% 59%',
    card: '330 62% 14%',
    cardForeground: '330 40% 86%',
    border: '330 62% 30%',
    input: '330 62% 33%',
    ring: '330 81% 68%',
    chart1: '330 81% 80%',
    chart2: '330 81% 70%',
    chart3: '330 81% 60%',
    chart4: '330 81% 50%',
    chart5: '310 60% 65%',
  }
};

/**
 * All available themes
 */
export const themes: Theme[] = [
  defaultTheme,
  oceanTheme,
  forestTheme,
  sunsetTheme,
  nightTheme,
  cherryBlossomTheme,
];

/**
 * Get theme by ID
 */
export function getTheme(id: ThemeColorScheme): Theme {
  return themes.find(t => t.id === id) || defaultTheme;
}

/**
 * Apply theme colors to document root
 */
export function applyTheme(theme: Theme, mode: ThemeMode) {
  const root = document.documentElement;
  const palette = mode === 'dark' ? theme.dark : theme.light;

  // Apply all theme colors as HSL values (for Tailwind CSS compatibility)
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-foreground', palette.primaryForeground);
  root.style.setProperty('--secondary', palette.secondary);
  root.style.setProperty('--secondary-foreground', palette.secondaryForeground);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-foreground', palette.accentForeground);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--muted-foreground', palette.mutedForeground);
  root.style.setProperty('--card', palette.card);
  root.style.setProperty('--card-foreground', palette.cardForeground);
  root.style.setProperty('--border', palette.border);
  root.style.setProperty('--input', palette.input);
  root.style.setProperty('--ring', palette.ring);
  root.style.setProperty('--chart-1', palette.chart1);
  root.style.setProperty('--chart-2', palette.chart2);
  root.style.setProperty('--chart-3', palette.chart3);
  root.style.setProperty('--chart-4', palette.chart4);
  root.style.setProperty('--chart-5', palette.chart5);
}

/**
 * Remove custom theme styles (revert to default CSS)
 */
export function removeThemeStyles() {
  const root = document.documentElement;
  root.style.removeProperty('--primary');
  root.style.removeProperty('--primary-foreground');
  root.style.removeProperty('--accent');
  root.style.removeProperty('--accent-foreground');
  root.style.removeProperty('--chart-1');
  root.style.removeProperty('--chart-2');
  root.style.removeProperty('--chart-3');
  root.style.removeProperty('--chart-4');
  root.style.removeProperty('--chart-5');
}
