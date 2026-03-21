/**
 * Application Metrics and Monitoring
 *
 * Provides observability for the application:
 * - Request metrics (latency, throughput, errors)
 * - Business metrics (active users, patients, etc.)
 * - System metrics (memory, CPU, connections)
 * - Custom event tracking
 *
 * Compatible with Prometheus/Grafana stack
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from './prisma.js'

// Metric types
interface Counter {
  name: string
  help: string
  labels: string[]
  values: Map<string, number>
}

interface Gauge {
  name: string
  help: string
  labels: string[]
  values: Map<string, number>
}

interface Histogram {
  name: string
  help: string
  labels: string[]
  buckets: number[]
  values: Map<string, { sum: number; count: number; buckets: number[] }>
}

// Metrics storage
const counters = new Map<string, Counter>()
const gauges = new Map<string, Gauge>()
const histograms = new Map<string, Histogram>()

// Default histogram buckets (in milliseconds for latency)
const DEFAULT_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000]

/**
 * Create a counter metric
 */
function createCounter(name: string, help: string, labels: string[] = []): Counter {
  const counter: Counter = { name, help, labels, values: new Map() }
  counters.set(name, counter)
  return counter
}

/**
 * Create a gauge metric
 */
function createGauge(name: string, help: string, labels: string[] = []): Gauge {
  const gauge: Gauge = { name, help, labels, values: new Map() }
  gauges.set(name, gauge)
  return gauge
}

/**
 * Create a histogram metric
 */
function createHistogram(
  name: string,
  help: string,
  labels: string[] = [],
  buckets: number[] = DEFAULT_BUCKETS
): Histogram {
  const histogram: Histogram = { name, help, labels, buckets, values: new Map() }
  histograms.set(name, histogram)
  return histogram
}

/**
 * Get label key for metric storage
 */
function getLabelKey(labelValues: Record<string, string>): string {
  return Object.entries(labelValues)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}="${v}"`)
    .join(',')
}

// Define application metrics
const metrics = {
  // HTTP metrics
  httpRequestsTotal: createCounter(
    'http_requests_total',
    'Total number of HTTP requests',
    ['method', 'path', 'status']
  ),

  httpRequestDuration: createHistogram(
    'http_request_duration_ms',
    'HTTP request duration in milliseconds',
    ['method', 'path', 'status']
  ),

  httpRequestsInFlight: createGauge(
    'http_requests_in_flight',
    'Number of HTTP requests currently being processed',
    ['method']
  ),

  // Authentication metrics
  authAttemptsTotal: createCounter(
    'auth_attempts_total',
    'Total number of authentication attempts',
    ['type', 'status']
  ),

  activeSessionsTotal: createGauge(
    'active_sessions_total',
    'Number of active user sessions',
    ['role']
  ),

  // Business metrics
  patientsTotal: createGauge(
    'patients_total',
    'Total number of patients',
    ['facility', 'status']
  ),

  checkInsTotal: createCounter(
    'check_ins_total',
    'Total number of patient check-ins',
    ['facility', 'type']
  ),

  messagesTotal: createCounter(
    'messages_total',
    'Total number of messages sent',
    ['direction', 'type']
  ),

  // Database metrics
  dbConnectionsActive: createGauge(
    'db_connections_active',
    'Number of active database connections',
    []
  ),

  dbQueryDuration: createHistogram(
    'db_query_duration_ms',
    'Database query duration in milliseconds',
    ['operation']
  ),

  // System metrics
  processMemoryBytes: createGauge(
    'process_memory_bytes',
    'Process memory usage in bytes',
    ['type']
  ),

  processUptimeSeconds: createGauge(
    'process_uptime_seconds',
    'Process uptime in seconds',
    []
  ),

  // Error metrics
  errorsTotal: createCounter(
    'errors_total',
    'Total number of errors',
    ['type', 'code']
  )
}

/**
 * Increment a counter
 */
export function incrementCounter(
  name: keyof typeof metrics,
  labelValues: Record<string, string> = {},
  value = 1
): void {
  const counter = counters.get(metrics[name].name)
  if (!counter) return

  const key = getLabelKey(labelValues)
  const current = counter.values.get(key) || 0
  counter.values.set(key, current + value)
}

/**
 * Set a gauge value
 */
export function setGauge(
  name: keyof typeof metrics,
  value: number,
  labelValues: Record<string, string> = {}
): void {
  const gauge = gauges.get(metrics[name].name)
  if (!gauge) return

  const key = getLabelKey(labelValues)
  gauge.values.set(key, value)
}

/**
 * Increment a gauge
 */
export function incrementGauge(
  name: keyof typeof metrics,
  labelValues: Record<string, string> = {},
  value = 1
): void {
  const gauge = gauges.get(metrics[name].name)
  if (!gauge) return

  const key = getLabelKey(labelValues)
  const current = gauge.values.get(key) || 0
  gauge.values.set(key, current + value)
}

/**
 * Decrement a gauge
 */
export function decrementGauge(
  name: keyof typeof metrics,
  labelValues: Record<string, string> = {},
  value = 1
): void {
  incrementGauge(name, labelValues, -value)
}

/**
 * Observe a histogram value
 */
export function observeHistogram(
  name: keyof typeof metrics,
  value: number,
  labelValues: Record<string, string> = {}
): void {
  const histogram = histograms.get(metrics[name].name)
  if (!histogram) return

  const key = getLabelKey(labelValues)
  let entry = histogram.values.get(key)

  if (!entry) {
    entry = { sum: 0, count: 0, buckets: new Array(histogram.buckets.length).fill(0) }
    histogram.values.set(key, entry)
  }

  entry.sum += value
  entry.count++

  // Update bucket counts
  for (let i = 0; i < histogram.buckets.length; i++) {
    const bucket = histogram.buckets[i]
    if (bucket !== undefined && value <= bucket && entry.buckets[i] !== undefined) {
      entry.buckets[i] = (entry.buckets[i] as number) + 1
    }
  }
}

/**
 * Timer helper for measuring durations
 */
export function startTimer(): () => number {
  const start = process.hrtime.bigint()
  return () => {
    const end = process.hrtime.bigint()
    return Number(end - start) / 1_000_000 // Convert to milliseconds
  }
}

/**
 * Format metrics in Prometheus exposition format
 */
export function formatPrometheusMetrics(): string {
  const lines: string[] = []

  // Format counters
  for (const counter of counters.values()) {
    lines.push(`# HELP ${counter.name} ${counter.help}`)
    lines.push(`# TYPE ${counter.name} counter`)

    for (const [labels, value] of counter.values) {
      const labelStr = labels ? `{${labels}}` : ''
      lines.push(`${counter.name}${labelStr} ${value}`)
    }
  }

  // Format gauges
  for (const gauge of gauges.values()) {
    lines.push(`# HELP ${gauge.name} ${gauge.help}`)
    lines.push(`# TYPE ${gauge.name} gauge`)

    for (const [labels, value] of gauge.values) {
      const labelStr = labels ? `{${labels}}` : ''
      lines.push(`${gauge.name}${labelStr} ${value}`)
    }
  }

  // Format histograms
  for (const histogram of histograms.values()) {
    lines.push(`# HELP ${histogram.name} ${histogram.help}`)
    lines.push(`# TYPE ${histogram.name} histogram`)

    for (const [labels, entry] of histogram.values) {
      const baseLabels = labels ? `${labels},` : ''

      // Bucket values
      for (let i = 0; i < histogram.buckets.length; i++) {
        const le = histogram.buckets[i]
        lines.push(`${histogram.name}_bucket{${baseLabels}le="${le}"} ${entry.buckets[i]}`)
      }
      lines.push(`${histogram.name}_bucket{${baseLabels}le="+Inf"} ${entry.count}`)

      // Sum and count
      const sumLabels = labels ? `{${labels}}` : ''
      lines.push(`${histogram.name}_sum${sumLabels} ${entry.sum}`)
      lines.push(`${histogram.name}_count${sumLabels} ${entry.count}`)
    }
  }

  return lines.join('\n')
}

/**
 * Collect system metrics
 */
async function collectSystemMetrics(): Promise<void> {
  const memUsage = process.memoryUsage()

  setGauge('processMemoryBytes', memUsage.heapUsed, { type: 'heap_used' })
  setGauge('processMemoryBytes', memUsage.heapTotal, { type: 'heap_total' })
  setGauge('processMemoryBytes', memUsage.rss, { type: 'rss' })
  setGauge('processMemoryBytes', memUsage.external, { type: 'external' })

  setGauge('processUptimeSeconds', process.uptime())
}

/**
 * Collect business metrics from database
 */
async function collectBusinessMetrics(): Promise<void> {
  try {
    // Count patients by status
    const patientCounts = await prisma.patient.groupBy({
      by: ['status'],
      _count: true
    })

    for (const group of patientCounts) {
      setGauge('patientsTotal', group._count, {
        facility: 'all',
        status: group.status
      })
    }
  } catch {
    // Database might not be ready, ignore
  }
}

/**
 * Request timing middleware
 */
export async function metricsMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const timer = startTimer()
  const method = request.method

  // Track in-flight requests
  incrementGauge('httpRequestsInFlight', { method })

  // When response is sent
  reply.raw.on('finish', () => {
    const duration = timer()
    const path = request.routeOptions?.url || request.url
    const status = String(reply.statusCode)

    // Record request
    incrementCounter('httpRequestsTotal', { method, path, status })
    observeHistogram('httpRequestDuration', duration, { method, path, status })

    // Decrement in-flight
    decrementGauge('httpRequestsInFlight', { method })

    // Track errors
    if (reply.statusCode >= 400) {
      incrementCounter('errorsTotal', {
        type: reply.statusCode >= 500 ? 'server' : 'client',
        code: status
      })
    }
  })
}

/**
 * Register metrics endpoint
 */
export async function registerMetricsEndpoint(fastify: FastifyInstance): Promise<void> {
  fastify.get('/metrics', async (_request, reply) => {
    // Collect current metrics
    await collectSystemMetrics()
    await collectBusinessMetrics()

    reply.header('Content-Type', 'text/plain; version=0.0.4')
    return formatPrometheusMetrics()
  })
}

// Collect system metrics periodically
setInterval(() => {
  void collectSystemMetrics()
}, 15000)

// Collect business metrics less frequently
setInterval(() => {
  void collectBusinessMetrics()
}, 60000)
