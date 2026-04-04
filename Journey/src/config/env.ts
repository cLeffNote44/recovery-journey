/**
 * Environment configuration with validation
 *
 * This module validates all required environment variables at startup
 * and provides typed access to configuration values.
 */

interface EnvConfig {
  apiUrl: string
  isDevelopment: boolean
  isProduction: boolean
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'EnvironmentError'
  }
}

function validateEnv(): EnvConfig {
  const apiUrl = import.meta.env.VITE_API_URL

  // In development, we allow missing API URL with a warning
  // In production, it MUST be set
  const isDevelopment = import.meta.env.DEV
  const isProduction = import.meta.env.PROD

  if (!apiUrl) {
    if (isProduction) {
      throw new EnvironmentError(
        'VITE_API_URL environment variable is required in production. ' +
        'Please set it to your API server URL.'
      )
    }
    console.warn(
      '[ENV] VITE_API_URL is not set. Using fallback: http://localhost:3000/api/v1\n' +
      'This is only acceptable in development mode.'
    )
  }

  // Validate URL format if provided
  if (apiUrl) {
    try {
      new URL(apiUrl)
    } catch {
      throw new EnvironmentError(
        `VITE_API_URL is not a valid URL: ${apiUrl}`
      )
    }

    // Warn about HTTP in production
    if (isProduction && apiUrl.startsWith('http://')) {
      console.error(
        '[SECURITY WARNING] VITE_API_URL is using HTTP instead of HTTPS in production. ' +
        'This is a serious security risk for a healthcare application.'
      )
    }
  }

  const resolvedUrl = apiUrl || (isDevelopment ? 'http://localhost:8000/api/v1' : '')
  if (isProduction && !resolvedUrl) {
    throw new EnvironmentError('VITE_API_URL is required in production')
  }

  return {
    apiUrl: resolvedUrl,
    isDevelopment,
    isProduction,
  }
}

// Validate on module load
export const env = validateEnv()

// Export individual values for convenience
export const API_URL = env.apiUrl
export const IS_DEV = env.isDevelopment
export const IS_PROD = env.isProduction
