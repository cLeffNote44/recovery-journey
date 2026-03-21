import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '../test/test-utils'
import {
  ApiErrorDisplay,
  FullPageApiError,
  getApiErrorType,
  ApiErrorType,
} from './ErrorBoundary'

describe('getApiErrorType', () => {
  describe('status code detection', () => {
    it('should return unauthorized for 401', () => {
      expect(getApiErrorType(new Error(), 401)).toBe('unauthorized')
    })

    it('should return forbidden for 403', () => {
      expect(getApiErrorType(new Error(), 403)).toBe('forbidden')
    })

    it('should return not_found for 404', () => {
      expect(getApiErrorType(new Error(), 404)).toBe('not_found')
    })

    it('should return timeout for 408', () => {
      expect(getApiErrorType(new Error(), 408)).toBe('timeout')
    })

    it('should return timeout for 504', () => {
      expect(getApiErrorType(new Error(), 504)).toBe('timeout')
    })

    it('should return server for 500', () => {
      expect(getApiErrorType(new Error(), 500)).toBe('server')
    })

    it('should return server for 503', () => {
      expect(getApiErrorType(new Error(), 503)).toBe('server')
    })
  })

  describe('error message detection', () => {
    it('should return network for network errors', () => {
      expect(getApiErrorType(new Error('Network request failed'))).toBe('network')
    })

    it('should return network for fetch errors', () => {
      expect(getApiErrorType(new Error('Failed to fetch'))).toBe('network')
    })

    it('should return network for ECONNREFUSED', () => {
      expect(getApiErrorType(new Error('ECONNREFUSED'))).toBe('network')
    })

    it('should return timeout for timeout messages', () => {
      expect(getApiErrorType(new Error('Request timed out'))).toBe('timeout')
    })

    it('should return unauthorized for 401 in message', () => {
      expect(getApiErrorType(new Error('Error 401: Unauthorized'))).toBe('unauthorized')
    })

    it('should return forbidden for forbidden messages', () => {
      expect(getApiErrorType(new Error('Access forbidden'))).toBe('forbidden')
    })

    it('should return not_found for not found messages', () => {
      expect(getApiErrorType(new Error('Resource not found'))).toBe('not_found')
    })

    it('should return server for server error messages', () => {
      expect(getApiErrorType(new Error('Internal server error'))).toBe('server')
    })

    it('should return unknown for unrecognized errors', () => {
      expect(getApiErrorType(new Error('Something happened'))).toBe('unknown')
    })

    it('should return unknown for non-Error objects', () => {
      expect(getApiErrorType('string error')).toBe('unknown')
    })
  })
})

describe('ApiErrorDisplay', () => {
  const errorTypes: ApiErrorType[] = ['network', 'timeout', 'unauthorized', 'forbidden', 'not_found', 'server', 'unknown']

  describe('renders for all error types', () => {
    errorTypes.forEach((type) => {
      it(`should render ${type} error`, () => {
        render(<ApiErrorDisplay type={type} />)
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })

  describe('error content', () => {
    it('should display network error title', () => {
      render(<ApiErrorDisplay type="network" />)
      expect(screen.getByText('Connection Lost')).toBeInTheDocument()
    })

    it('should display timeout error title', () => {
      render(<ApiErrorDisplay type="timeout" />)
      expect(screen.getByText('Request Timed Out')).toBeInTheDocument()
    })

    it('should display unauthorized error title', () => {
      render(<ApiErrorDisplay type="unauthorized" />)
      expect(screen.getByText('Session Expired')).toBeInTheDocument()
    })

    it('should display forbidden error title', () => {
      render(<ApiErrorDisplay type="forbidden" />)
      expect(screen.getByText('Access Denied')).toBeInTheDocument()
    })

    it('should display not_found error title', () => {
      render(<ApiErrorDisplay type="not_found" />)
      expect(screen.getByText('Not Found')).toBeInTheDocument()
    })

    it('should display server error title', () => {
      render(<ApiErrorDisplay type="server" />)
      expect(screen.getByText('Server Error')).toBeInTheDocument()
    })

    it('should display custom message when provided', () => {
      render(<ApiErrorDisplay type="network" message="Custom error message" />)
      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })
  })

  describe('retry button', () => {
    it('should show retry button when onRetry provided', () => {
      const onRetry = vi.fn()
      render(<ApiErrorDisplay type="network" onRetry={onRetry} />)
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('should call onRetry when clicked', () => {
      const onRetry = vi.fn()
      render(<ApiErrorDisplay type="network" onRetry={onRetry} />)
      fireEvent.click(screen.getByText('Try Again'))
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should not show retry button when onRetry not provided', () => {
      render(<ApiErrorDisplay type="network" />)
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument()
    })
  })

  describe('go back button', () => {
    it('should show go back button when onGoBack provided', () => {
      const onGoBack = vi.fn()
      render(<ApiErrorDisplay type="network" onGoBack={onGoBack} />)
      expect(screen.getByText('Go Back')).toBeInTheDocument()
    })

    it('should call onGoBack when clicked', () => {
      const onGoBack = vi.fn()
      render(<ApiErrorDisplay type="network" onGoBack={onGoBack} />)
      fireEvent.click(screen.getByText('Go Back'))
      expect(onGoBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('unauthorized special handling', () => {
    it('should show login button for unauthorized errors', () => {
      render(<ApiErrorDisplay type="unauthorized" />)
      expect(screen.getByText('Log In Again')).toBeInTheDocument()
    })
  })

  describe('compact mode', () => {
    it('should render in compact mode', () => {
      render(<ApiErrorDisplay type="network" compact />)
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Connection Lost')).toBeInTheDocument()
    })

    it('should show retry icon button in compact mode', () => {
      const onRetry = vi.fn()
      render(<ApiErrorDisplay type="network" compact onRetry={onRetry} />)
      const retryButton = screen.getByLabelText('Retry')
      expect(retryButton).toBeInTheDocument()
      fireEvent.click(retryButton)
      expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it('should show custom message in compact mode', () => {
      render(<ApiErrorDisplay type="network" compact message="Brief error" />)
      expect(screen.getByText('Brief error')).toBeInTheDocument()
    })
  })
})

describe('FullPageApiError', () => {
  it('should render full page error', () => {
    render(<FullPageApiError type="server" />)
    expect(screen.getByText('Server Error')).toBeInTheDocument()
  })

  it('should show retry button when provided', () => {
    const onRetry = vi.fn()
    render(<FullPageApiError type="network" onRetry={onRetry} />)
    expect(screen.getByText('Try Again')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Try Again'))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should always show Go Home button', () => {
    render(<FullPageApiError type="server" />)
    expect(screen.getByText('Go Home')).toBeInTheDocument()
  })

  it('should show login link for unauthorized errors', () => {
    render(<FullPageApiError type="unauthorized" />)
    expect(screen.getByText('Return to login')).toBeInTheDocument()
  })

  it('should display custom message', () => {
    render(<FullPageApiError type="server" message="Database connection failed" />)
    expect(screen.getByText('Database connection failed')).toBeInTheDocument()
  })
})
