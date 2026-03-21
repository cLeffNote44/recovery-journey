import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { AxiosError, AxiosHeaders } from 'axios'
import {
  useApiError,
  parseApiError,
  isApiErrorType,
  hasFieldError,
  getFieldError,
  getAllFieldErrors,
} from './useApiError'

// Mock the toast
vi.mock('../components/Toast', () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

import { showToast } from '../components/Toast'

describe('parseApiError', () => {
  it('should parse network errors', () => {
    const error = new Error('Network Error')
    const result = parseApiError(error)

    expect(result.type).toBe('network')
    expect(result.message).toBe('Network Error')
  })

  it('should parse timeout errors', () => {
    const error = new Error('Request timed out')
    const result = parseApiError(error)

    expect(result.type).toBe('timeout')
  })

  it('should parse 401 unauthorized from Axios error', () => {
    const axiosError = new AxiosError(
      'Unauthorized',
      'ERR_UNAUTHORIZED',
      undefined,
      undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        data: { message: 'Token expired' },
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    )

    const result = parseApiError(axiosError)

    expect(result.type).toBe('unauthorized')
    expect(result.statusCode).toBe(401)
    expect(result.message).toBe('Token expired')
  })

  it('should parse 403 forbidden', () => {
    const axiosError = new AxiosError(
      'Forbidden',
      'ERR_FORBIDDEN',
      undefined,
      undefined,
      {
        status: 403,
        statusText: 'Forbidden',
        data: { error: 'Access denied' },
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    )

    const result = parseApiError(axiosError)

    expect(result.type).toBe('forbidden')
    expect(result.statusCode).toBe(403)
  })

  it('should parse 404 not found', () => {
    const axiosError = new AxiosError(
      'Not Found',
      'ERR_NOT_FOUND',
      undefined,
      undefined,
      {
        status: 404,
        statusText: 'Not Found',
        data: { detail: 'Resource not found' },
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    )

    const result = parseApiError(axiosError)

    expect(result.type).toBe('not_found')
    expect(result.message).toBe('Resource not found')
  })

  it('should parse 500 server error', () => {
    const axiosError = new AxiosError(
      'Server Error',
      'ERR_SERVER',
      undefined,
      undefined,
      {
        status: 500,
        statusText: 'Internal Server Error',
        data: {},
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    )

    const result = parseApiError(axiosError)

    expect(result.type).toBe('server')
    expect(result.statusCode).toBe(500)
  })

  it('should parse FastAPI validation errors', () => {
    const axiosError = new AxiosError(
      'Validation Error',
      'ERR_VALIDATION',
      undefined,
      undefined,
      {
        status: 422,
        statusText: 'Unprocessable Entity',
        data: {
          detail: [
            { loc: ['body', 'email'], msg: 'Invalid email format', type: 'value_error' },
            { loc: ['body', 'phone'], msg: 'Invalid phone number', type: 'value_error' },
          ],
        },
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    )

    const result = parseApiError(axiosError)

    expect(result.details).toEqual({
      email: ['Invalid email format'],
      phone: ['Invalid phone number'],
    })
  })

  it('should return unknown for unrecognized errors', () => {
    const error = new Error('Something weird happened')
    const result = parseApiError(error)

    expect(result.type).toBe('unknown')
  })

  it('should handle non-Error objects', () => {
    const result = parseApiError('string error')

    expect(result.type).toBe('unknown')
    expect(result.message).toBe('An unexpected error occurred. Please try again.')
  })
})

describe('useApiError', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should start with no error', () => {
    const { result } = renderHook(() => useApiError())

    expect(result.current.error).toBeNull()
    expect(result.current.isError).toBe(false)
    expect(result.current.errorType).toBeNull()
  })

  it('should set error when handleError is called', () => {
    const { result } = renderHook(() => useApiError())

    act(() => {
      result.current.handleError(new Error('Test error'))
    })

    expect(result.current.error).not.toBeNull()
    expect(result.current.isError).toBe(true)
  })

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => useApiError())

    act(() => {
      result.current.handleError(new Error('Test error'))
    })

    expect(result.current.error).not.toBeNull()

    act(() => {
      result.current.clearError()
    })

    expect(result.current.error).toBeNull()
    expect(result.current.isError).toBe(false)
  })

  it('should show toast by default on error', () => {
    const { result } = renderHook(() => useApiError())

    act(() => {
      result.current.handleError(new Error('Server error 500'))
    })

    expect(showToast.error).toHaveBeenCalled()
  })

  it('should not show toast when showToastOnError is false', () => {
    const { result } = renderHook(() =>
      useApiError({ showToastOnError: false })
    )

    act(() => {
      result.current.handleError(new Error('Server error'))
    })

    expect(showToast.error).not.toHaveBeenCalled()
    expect(showToast.warning).not.toHaveBeenCalled()
  })

  it('should use custom messages when provided', () => {
    const { result } = renderHook(() =>
      useApiError({
        customMessages: {
          network: 'Custom network error message',
        },
      })
    )

    act(() => {
      result.current.handleError(new Error('Network Error'))
    })

    expect(result.current.error?.message).toBe('Custom network error message')
  })

  it('should call onError callback', () => {
    const onError = vi.fn()
    const { result } = renderHook(() => useApiError({ onError }))

    act(() => {
      result.current.handleError(new Error('Test error'))
    })

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.any(String),
        message: expect.any(String),
      })
    )
  })

  it('should show warning toast for network errors', () => {
    const { result } = renderHook(() => useApiError())

    act(() => {
      result.current.handleError(new Error('Network Error'))
    })

    expect(showToast.warning).toHaveBeenCalled()
  })

  it('should show info toast for unauthorized errors', () => {
    const { result } = renderHook(() => useApiError())

    const axiosError = new AxiosError(
      'Unauthorized',
      'ERR_UNAUTHORIZED',
      undefined,
      undefined,
      {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      }
    )

    act(() => {
      result.current.handleError(axiosError)
    })

    expect(showToast.info).toHaveBeenCalled()
  })
})

describe('isApiErrorType', () => {
  it('should return true for matching error type', () => {
    const error = parseApiError(new Error('Network Error'))
    expect(isApiErrorType(error, 'network')).toBe(true)
  })

  it('should return false for non-matching error type', () => {
    const error = parseApiError(new Error('Network Error'))
    expect(isApiErrorType(error, 'timeout')).toBe(false)
  })

  it('should return false for null error', () => {
    expect(isApiErrorType(null, 'network')).toBe(false)
  })
})

describe('hasFieldError', () => {
  it('should return true when field has errors', () => {
    const error = {
      type: 'unknown' as const,
      message: 'Validation error',
      details: {
        email: ['Invalid email'],
      },
    }

    expect(hasFieldError(error, 'email')).toBe(true)
  })

  it('should return false when field has no errors', () => {
    const error = {
      type: 'unknown' as const,
      message: 'Validation error',
      details: {
        email: ['Invalid email'],
      },
    }

    expect(hasFieldError(error, 'phone')).toBe(false)
  })

  it('should return false for null error', () => {
    expect(hasFieldError(null, 'email')).toBe(false)
  })
})

describe('getFieldError', () => {
  it('should return first error for field', () => {
    const error = {
      type: 'unknown' as const,
      message: 'Validation error',
      details: {
        email: ['Invalid email', 'Email already exists'],
      },
    }

    expect(getFieldError(error, 'email')).toBe('Invalid email')
  })

  it('should return undefined for field without errors', () => {
    const error = {
      type: 'unknown' as const,
      message: 'Validation error',
      details: {
        email: ['Invalid email'],
      },
    }

    expect(getFieldError(error, 'phone')).toBeUndefined()
  })
})

describe('getAllFieldErrors', () => {
  it('should return all errors as flat array', () => {
    const error = {
      type: 'unknown' as const,
      message: 'Validation error',
      details: {
        email: ['Invalid email'],
        phone: ['Invalid phone', 'Phone required'],
      },
    }

    const errors = getAllFieldErrors(error)
    expect(errors).toHaveLength(3)
    expect(errors).toContain('Invalid email')
    expect(errors).toContain('Invalid phone')
    expect(errors).toContain('Phone required')
  })

  it('should return empty array for null error', () => {
    expect(getAllFieldErrors(null)).toEqual([])
  })

  it('should return empty array for error without details', () => {
    const error = {
      type: 'unknown' as const,
      message: 'Some error',
    }

    expect(getAllFieldErrors(error)).toEqual([])
  })
})
