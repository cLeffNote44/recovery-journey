import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastContainer } from './components/Toast'
import { queryClient } from './lib/queryClient'
import { initMonitoring } from './services/monitoring'
import './index.css'

// Validate environment variables early
import './config/env'

// Initialize monitoring (Sentry, LogRocket, etc.) before rendering
initMonitoring()

// Register Service Worker for offline support
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[SW] Service Worker registered:', registration.scope)

        // Check for updates periodically (every 30 minutes)
        setInterval(() => {
          registration.update()
        }, 30 * 60 * 1000)
      })
      .catch((error) => {
        console.warn('[SW] Service Worker registration failed:', error)
      })
  })
}

// Initialize dark mode from localStorage before render to prevent flash
const storedTheme = localStorage.getItem('theme-storage')
if (storedTheme) {
  try {
    const parsed = JSON.parse(storedTheme)
    if (parsed.state?.isDarkMode) {
      document.documentElement.classList.add('dark')
    }
  } catch (e) {
    // Ignore parse errors
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <App />
          <ToastContainer />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
