/**
 * Health Check Routes
 *
 * Provides health check endpoints for container orchestration,
 * load balancers, and monitoring systems.
 *
 * Endpoints:
 *   GET /health       - Basic liveness check
 *   GET /health/live  - Kubernetes liveness probe
 *   GET /health/ready - Kubernetes readiness probe (checks DB)
 */

import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  version?: string
  uptime?: number
  checks?: {
    database?: {
      status: 'ok' | 'error'
      latency?: number
      error?: string
    }
  }
}

// Track server start time for uptime calculation
const startTime = Date.now()

/**
 * Basic health check - always returns ok if server is running
 */
async function basicHealthCheck(): Promise<HealthResponse> {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
}

/**
 * Detailed health check - includes database connectivity
 */
async function detailedHealthCheck(): Promise<HealthResponse> {
  const response: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '1.0.0',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks: {},
  }

  // Check database connectivity
  try {
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbLatency = Date.now() - dbStart

    response.checks!.database = {
      status: 'ok',
      latency: dbLatency,
    }
  } catch (error) {
    response.status = 'error'
    response.checks!.database = {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown database error',
    }
  }

  return response
}

/**
 * Health routes plugin
 */
export async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  // Basic liveness check (for Docker HEALTHCHECK and basic monitoring)
  fastify.get('/health', async (_request, reply) => {
    const health = await basicHealthCheck()
    return reply.send(health)
  })

  // Kubernetes liveness probe
  // Returns 200 if the server is running (doesn't check dependencies)
  fastify.get('/health/live', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  })

  // Kubernetes readiness probe
  // Returns 200 only if the server can handle requests (checks DB)
  fastify.get('/health/ready', async (_request, reply) => {
    const health = await detailedHealthCheck()

    if (health.status === 'error') {
      return reply.status(503).send(health)
    }

    return reply.send(health)
  })

  // Detailed health check (for monitoring dashboards)
  fastify.get('/health/detailed', async (_request, reply) => {
    const health = await detailedHealthCheck()

    const statusCode = health.status === 'ok' ? 200 : 503
    return reply.status(statusCode).send(health)
  })
}
