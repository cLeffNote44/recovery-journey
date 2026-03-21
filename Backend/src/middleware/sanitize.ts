/**
 * Request Sanitization Middleware
 *
 * Automatically sanitizes incoming request bodies to prevent XSS
 * and other injection attacks on user-submitted content.
 *
 * Applied globally to all POST/PUT/PATCH requests.
 */

import type { FastifyRequest, FastifyReply } from 'fastify'
import { sanitizeObject } from '../lib/sanitize.js'

/**
 * Paths that should skip sanitization (e.g., file uploads, raw data)
 */
const SKIP_PATHS = new Set([
  '/api/v1/upload', // Future: file uploads
])

/**
 * Content types that should skip sanitization
 */
const SKIP_CONTENT_TYPES = new Set([
  'multipart/form-data', // File uploads
  'application/octet-stream', // Binary data
])

/**
 * Sanitize request body hook
 *
 * This is a preHandler hook that sanitizes the request body
 * before it reaches the route handler.
 */
export async function sanitizeRequestBody(
  request: FastifyRequest,
  _reply: FastifyReply
): Promise<void> {
  // Only sanitize requests with bodies
  if (!request.body) {
    return
  }

  // Skip certain paths
  const urlPath = request.url.split('?')[0]
  if (urlPath && SKIP_PATHS.has(urlPath)) {
    return
  }

  // Skip certain content types
  const contentType = request.headers['content-type']
  const mimeType = contentType ? contentType.split(';')[0] : ''
  if (mimeType && SKIP_CONTENT_TYPES.has(mimeType)) {
    return
  }

  // Sanitize the body
  try {
    request.body = sanitizeObject(request.body)
  } catch (error) {
    request.log.warn({ error }, 'Failed to sanitize request body')
    // Don't fail the request - just log and continue with original body
  }
}
