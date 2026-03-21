import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

// =============================================================================
// PERFORMANCE MONITORING
// =============================================================================

interface QueryMetrics {
  queryKey: readonly unknown[]
  duration: number
  timestamp: number
  status: 'success' | 'error'
  fromCache: boolean
}

interface PerformanceStats {
  totalQueries: number
  avgDuration: number
  cacheHitRate: number
  errorRate: number
  slowQueries: QueryMetrics[]
}

// Store for performance metrics (development only)
const metricsStore: QueryMetrics[] = []
const MAX_METRICS = 100
const SLOW_QUERY_THRESHOLD = 1000 // 1 second

/**
 * Records a query metric for performance monitoring
 */
function recordMetric(metric: QueryMetrics) {
  if (process.env.NODE_ENV !== 'development') return

  metricsStore.push(metric)

  // Keep only the last MAX_METRICS entries
  if (metricsStore.length > MAX_METRICS) {
    metricsStore.shift()
  }

  // Log slow queries in development
  if (metric.duration > SLOW_QUERY_THRESHOLD) {
    console.warn(
      `[Query Performance] Slow query detected:`,
      {
        key: metric.queryKey,
        duration: `${metric.duration}ms`,
        fromCache: metric.fromCache,
      }
    )
  }
}

/**
 * Gets aggregated performance statistics
 */
export function getQueryPerformanceStats(): PerformanceStats {
  if (metricsStore.length === 0) {
    return {
      totalQueries: 0,
      avgDuration: 0,
      cacheHitRate: 0,
      errorRate: 0,
      slowQueries: [],
    }
  }

  const totalQueries = metricsStore.length
  const cacheHits = metricsStore.filter(m => m.fromCache)
  const errorQueries = metricsStore.filter(m => m.status === 'error')
  const slowQueries = metricsStore.filter(m => m.duration > SLOW_QUERY_THRESHOLD)

  const totalDuration = metricsStore.reduce((sum, m) => sum + m.duration, 0)

  return {
    totalQueries,
    avgDuration: Math.round(totalDuration / totalQueries),
    cacheHitRate: Math.round((cacheHits.length / totalQueries) * 100),
    errorRate: Math.round((errorQueries.length / totalQueries) * 100),
    slowQueries: slowQueries.slice(-5), // Last 5 slow queries
  }
}

/**
 * Logs current performance stats to console (development only)
 */
export function logQueryPerformance() {
  if (process.env.NODE_ENV !== 'development') return

  const stats = getQueryPerformanceStats()
  console.group('[React Query Performance]')
  console.log('Total queries:', stats.totalQueries)
  console.log('Average duration:', `${stats.avgDuration}ms`)
  console.log('Cache hit rate:', `${stats.cacheHitRate}%`)
  console.log('Error rate:', `${stats.errorRate}%`)
  if (stats.slowQueries.length > 0) {
    console.log('Recent slow queries:', stats.slowQueries)
  }
  console.groupEnd()
}

/**
 * Clears all recorded metrics
 */
export function clearQueryMetrics() {
  metricsStore.length = 0
}

// =============================================================================
// QUERY CLIENT CONFIGURATION
// =============================================================================

/**
 * Query cache with performance monitoring callbacks
 */
const queryCache = new QueryCache({
  onSuccess: (_data, query) => {
    // Record successful query metrics
    const fetchStatus = query.state.fetchStatus
    recordMetric({
      queryKey: query.queryKey,
      duration: query.state.dataUpdatedAt - (query.state.dataUpdatedAt - 100), // Approximate
      timestamp: Date.now(),
      status: 'success',
      fromCache: fetchStatus === 'idle',
    })
  },
  onError: (error, query) => {
    // Record failed query metrics
    recordMetric({
      queryKey: query.queryKey,
      duration: 0,
      timestamp: Date.now(),
      status: 'error',
      fromCache: false,
    })

    // Log errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[Query Error]', {
        key: query.queryKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },
})

/**
 * Mutation cache with logging
 */
const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('[Mutation Error]', {
        mutationKey: mutation.options.mutationKey,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  },
})

/**
 * Shared React Query client configuration
 *
 * Key settings:
 * - staleTime: 5 minutes - data is considered fresh for 5 minutes
 * - gcTime: 30 minutes - unused data is garbage collected after 30 minutes
 * - retry: 1 - only retry failed requests once
 * - refetchOnWindowFocus: false - don't refetch when window regains focus (reduces API calls)
 */
export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

/**
 * Query key factory for consistent key generation
 * This pattern ensures cache invalidation works correctly
 */
export const queryKeys = {
  // Patients
  patients: {
    all: ['patients'] as const,
    lists: () => [...queryKeys.patients.all, 'list'] as const,
    list: (filters: object) => [...queryKeys.patients.lists(), filters] as const,
    details: () => [...queryKeys.patients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.patients.details(), id] as const,
    dashboard: (id: string) => [...queryKeys.patients.all, 'dashboard', id] as const,
  },

  // Messages
  messages: {
    all: ['messages'] as const,
    lists: () => [...queryKeys.messages.all, 'list'] as const,
    conversations: () => [...queryKeys.messages.all, 'conversations'] as const,
    conversation: (patientId: string) => [...queryKeys.messages.conversations(), patientId] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    facility: (facilityId: string) => [...queryKeys.dashboard.all, 'facility', facilityId] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },

  // Facilities
  facilities: {
    all: ['facilities'] as const,
    lists: () => [...queryKeys.facilities.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.facilities.all, 'detail', id] as const,
  },

  // Admin
  admin: {
    all: ['admin'] as const,
    stats: () => [...queryKeys.admin.all, 'stats'] as const,
    facilities: () => [...queryKeys.admin.all, 'facilities'] as const,
    clinicians: () => [...queryKeys.admin.all, 'clinicians'] as const,
    patients: () => [...queryKeys.admin.all, 'patients'] as const,
    activity: () => [...queryKeys.admin.all, 'activity'] as const,
  },
}
