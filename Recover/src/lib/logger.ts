/**
 * Structured Logging Utility
 *
 * Provides consistent logging with context, levels, and error tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private isDevelopment: boolean;
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Log a debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      this.log('debug', message, context);
    }
  }

  /**
   * Log an informational message
   */
  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log a warning
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    this.log('warn', message, context, error);
  }

  /**
   * Log an error
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log('error', message, context, error);
  }

  /**
   * Internal logging method
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };

    // Store in memory (circular buffer)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output with appropriate method
    const consoleMethod = level === 'debug' ? console.debug : console[level];
    const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
    const errorStr = error ? ` | Error: ${error.message}` : '';

    consoleMethod(`[${level.toUpperCase()}] ${message}${contextStr}${errorStr}`, error);

    // In production, could send to external service
    if (!this.isDevelopment && level === 'error') {
      this.sendToMonitoring(entry);
    }
  }

  /**
   * Get recent logs
   */
  getLogs(filter?: { level?: LogLevel; component?: string }): LogEntry[] {
    let filtered = [...this.logs];

    if (filter?.level) {
      filtered = filtered.filter(log => log.level === filter.level);
    }

    if (filter?.component) {
      filtered = filtered.filter(log => log.context?.component === filter.component);
    }

    return filtered;
  }

  /**
   * Clear all stored logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Send error to monitoring service (Sentry, LogRocket, etc.)
   */
  private sendToMonitoring(entry: LogEntry): void {
    try {
      // Dynamic import to avoid loading monitoring until needed
      import('./monitoring').then(({ captureException, captureMessage }) => {
        if (entry.error) {
          captureException(entry.error, {
            message: entry.message,
            ...entry.context,
          });
        } else {
          captureMessage(entry.message, 'error');
        }
      });
    } catch {
      // Monitoring not available — fall back to console
      if (entry.error) {
        console.error('[MONITORING]', entry.message, entry.error);
      }
    }
  }

  /**
   * Create a child logger with default context
   */
  createChild(defaultContext: LogContext): Logger {
    const child = new Logger();

    // Override log method to include default context
    const originalLog = child.log.bind(child);
    child.log = (level: LogLevel, message: string, context?: LogContext, error?: Error) => {
      const mergedContext = { ...defaultContext, ...context };
      originalLog(level, message, mergedContext, error);
    };

    return child;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  debug: (message: string, context?: LogContext) => logger.debug(message, context),
  info: (message: string, context?: LogContext) => logger.info(message, context),
  warn: (message: string, context?: LogContext, error?: Error) => logger.warn(message, context, error),
  error: (message: string, context?: LogContext, error?: Error) => logger.error(message, context, error),
  getLogs: (filter?: { level?: LogLevel; component?: string }) => logger.getLogs(filter),
  clearLogs: () => logger.clearLogs(),
  createChild: (defaultContext: LogContext) => logger.createChild(defaultContext),
};

// Export type-safe logger creators for common components
export const createComponentLogger = (componentName: string) => {
  return {
    debug: (message: string, context?: Omit<LogContext, 'component'>) =>
      logger.debug(message, { component: componentName, ...context }),
    info: (message: string, context?: Omit<LogContext, 'component'>) =>
      logger.info(message, { component: componentName, ...context }),
    warn: (message: string, context?: Omit<LogContext, 'component'>, error?: Error) =>
      logger.warn(message, { component: componentName, ...context }, error),
    error: (message: string, context?: Omit<LogContext, 'component'>, error?: Error) =>
      logger.error(message, { component: componentName, ...context }, error),
  };
};
