import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

// Custom API error class
export class ApiError extends Error {
  statusCode: number
  code: string

  constructor(statusCode: number, message: string, code: string = 'ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.name = 'ApiError'
  }

  static badRequest(message: string, code?: string) {
    return new ApiError(400, message, code ?? 'BAD_REQUEST')
  }

  static unauthorized(message: string = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED')
  }

  static forbidden(message: string = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN')
  }

  static notFound(message: string = 'Resource not found') {
    return new ApiError(404, message, 'NOT_FOUND')
  }

  static conflict(message: string) {
    return new ApiError(409, message, 'CONFLICT')
  }

  static internal(message: string = 'Internal server error') {
    return new ApiError(500, message, 'INTERNAL_ERROR')
  }
}

// Global error handler
export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error)

  // Handle API errors
  if (error instanceof ApiError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: error.message,
      code: error.code
    })
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    return reply.status(400).send({
      success: false,
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: error.flatten().fieldErrors
    })
  }

  // Handle Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002': // Unique constraint violation
        return reply.status(409).send({
          success: false,
          error: 'A record with this value already exists',
          code: 'DUPLICATE_ENTRY'
        })
      case 'P2025': // Record not found
        return reply.status(404).send({
          success: false,
          error: 'Record not found',
          code: 'NOT_FOUND'
        })
      default:
        return reply.status(400).send({
          success: false,
          error: 'Database error',
          code: 'DATABASE_ERROR'
        })
    }
  }

  // Handle JWT errors
  if (error.code === 'FST_JWT_NO_AUTHORIZATION_IN_HEADER') {
    return reply.status(401).send({
      success: false,
      error: 'No authorization token provided',
      code: 'NO_TOKEN'
    })
  }

  if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_EXPIRED') {
    return reply.status(401).send({
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    })
  }

  if (error.code === 'FST_JWT_AUTHORIZATION_TOKEN_INVALID') {
    return reply.status(401).send({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    })
  }

  // Default error response
  const statusCode = error.statusCode ?? 500
  return reply.status(statusCode).send({
    success: false,
    error: statusCode >= 500 ? 'Internal server error' : error.message,
    code: 'ERROR'
  })
}
