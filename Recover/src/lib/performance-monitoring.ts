/**
 * Performance Monitoring
 *
 * Tracks Web Vitals and custom performance metrics
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';
// Note: FID has been replaced by INP in web-vitals v4

export interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

export interface PerformanceReport {
  metrics: PerformanceMetric[];
  summary: {
    goodCount: number;
    needsImprovementCount: number;
    poorCount: number;
  };
  timestamp: number;
}

// Store metrics locally
const metrics: PerformanceMetric[] = [];

/**
 * Get rating for a metric based on thresholds
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds = {
    CLS: { good: 0.1, poor: 0.25 },
    FID: { good: 100, poor: 300 },
    FCP: { good: 1800, poor: 3000 },
    LCP: { good: 2500, poor: 4000 },
    TTFB: { good: 800, poor: 1800 },
    INP: { good: 200, poor: 500 },
  };

  const threshold = thresholds[name as keyof typeof thresholds];
  if (!threshold) return 'good';

  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Handle metric callback
 */
function handleMetric(metric: Metric) {
  const perfMetric: PerformanceMetric = {
    name: metric.name,
    value: metric.value,
    rating: getRating(metric.name, metric.value),
    timestamp: Date.now(),
  };

  metrics.push(perfMetric);

  // Log to console in development
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${metric.name}:`, {
      value: metric.value,
      rating: perfMetric.rating,
      id: metric.id,
    });
  }

  // Send to analytics (if configured)
  if (window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring(): void {
  // Track Core Web Vitals
  onCLS(handleMetric);
  onFCP(handleMetric);
  onLCP(handleMetric);
  onTTFB(handleMetric);
  onINP(handleMetric); // Replaces FID in web-vitals v4

  // Log initialization
  if (import.meta.env.DEV) {
    console.log('[Performance] Monitoring initialized');
  }
}

/**
 * Get all collected metrics
 */
export function getPerformanceMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Get performance report
 */
export function getPerformanceReport(): PerformanceReport {
  const summary = metrics.reduce(
    (acc, metric) => {
      if (metric.rating === 'good') acc.goodCount++;
      else if (metric.rating === 'needs-improvement') acc.needsImprovementCount++;
      else acc.poorCount++;
      return acc;
    },
    { goodCount: 0, needsImprovementCount: 0, poorCount: 0 }
  );

  return {
    metrics: [...metrics],
    summary,
    timestamp: Date.now(),
  };
}

/**
 * Clear collected metrics
 */
export function clearPerformanceMetrics(): void {
  metrics.length = 0;
}

/**
 * Track custom performance metric
 */
export function trackCustomMetric(name: string, value: number, rating?: 'good' | 'needs-improvement' | 'poor'): void {
  const metric: PerformanceMetric = {
    name,
    value,
    rating: rating || getRating(name, value),
    timestamp: Date.now(),
  };

  metrics.push(metric);

  if (import.meta.env.DEV) {
    console.log(`[Performance] Custom metric ${name}:`, value, rating);
  }
}

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): Promise<T> {
  const start = performance.now();

  try {
    const result = await fn();
    const duration = performance.now() - start;

    trackCustomMetric(name, duration);

    return result;
  } catch (error) {
    const duration = performance.now() - start;
    trackCustomMetric(`${name}_error`, duration);
    throw error;
  }
}

/**
 * Get navigation timing metrics
 */
export function getNavigationMetrics() {
  if (!window.performance || !window.performance.getEntriesByType) {
    return null;
  }

  const [navigation] = window.performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];

  if (!navigation) return null;

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    request: navigation.responseStart - navigation.requestStart,
    response: navigation.responseEnd - navigation.responseStart,
    dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
    load: navigation.loadEventEnd - navigation.loadEventStart,
    total: navigation.loadEventEnd - navigation.fetchStart,
  };
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, params: Record<string, any>) => void;
  }
}
