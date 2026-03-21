import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/authStore'
import { authAPI, healthCheck } from '../services/api'
import { Eye, EyeOff, LogIn, WifiOff } from 'lucide-react'
import { AxiosError } from 'axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  const { login } = useAuthStore()

  // Check server status on mount
  useEffect(() => {
    let isMounted = true

    healthCheck().then((result) => {
      if (isMounted) {
        setServerStatus(result.status === 'healthy' ? 'online' : 'offline')
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authAPI.staffLogin(email, password)

      if (response.success) {
        login(response.user, response.accessToken, response.refreshToken)
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ error?: string }>

      // Handle network errors
      if (axiosError.code === 'ERR_NETWORK' || serverStatus === 'offline') {
        setError('Unable to connect to server. Please check your internet connection and try again.')
        setServerStatus('offline')
      } else if (axiosError.response?.status === 401) {
        setError('Invalid email or password. Please try again.')
      } else if (axiosError.response?.status === 429) {
        setError('Too many login attempts. Please wait a few minutes before trying again.')
      } else if (axiosError.response?.data?.error) {
        setError(axiosError.response.data.error)
      } else if (err instanceof Error) {
        setError(err.message || 'Login failed. Please try again.')
      } else {
        setError('An unexpected error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 text-white p-12 flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold">Recover</h1>
          <p className="text-primary-300 mt-1">Clinician Portal</p>
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Empowering recovery,<br />
            one patient at a time.
          </h2>
          <p className="text-primary-200 text-lg max-w-md">
            Access your facility dashboard, manage patients, and track recovery progress all in one place.
          </p>
        </div>

        <div className="text-primary-400 text-sm">
          © 2025 Recover System. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-primary-900">Recover</h1>
            <p className="text-gray-500">Clinician Portal</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-gray-500 mb-6">Sign in to your account</p>

            {/* Server Status */}
            {serverStatus === 'offline' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                <WifiOff className="w-4 h-4" />
                <span>Server unavailable. Please contact your administrator if this persists.</span>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign In
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
