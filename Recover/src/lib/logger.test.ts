/**
 * Logger Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { logger, log, createComponentLogger, LogLevel } from './logger';

describe('Logger', () => {
  beforeEach(() => {
    logger.clearLogs();
    vi.clearAllMocks();
  });

  describe('Basic Logging', () => {
    it('should log info messages', () => {
      const consoleSpy = vi.spyOn(console, 'info');
      logger.info('Test info message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Test info message'),
        undefined
      );
    });

    it('should log error messages', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      logger.error('Test error message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Test error message'),
        undefined
      );
    });

    it('should log warnings', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      logger.warn('Test warning message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Test warning message'),
        undefined
      );
    });

    it('should include context in log messages', () => {
      const consoleSpy = vi.spyOn(console, 'info');
      const context = { component: 'TestComponent', action: 'test' };
      logger.info('Test with context', context);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Context:'),
        undefined
      );
    });

    it('should include error details', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      const error = new Error('Test error');
      logger.error('Error occurred', undefined, error);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error: Test error'),
        error
      );
    });
  });

  describe('Log Storage', () => {
    it('should store logs in memory', () => {
      logger.info('Message 1');
      logger.warn('Message 2');
      logger.error('Message 3');

      const logs = logger.getLogs();
      expect(logs).toHaveLength(3);
      expect(logs[0].message).toBe('Message 1');
      expect(logs[1].message).toBe('Message 2');
      expect(logs[2].message).toBe('Message 3');
    });

    it('should filter logs by level', () => {
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      const errors = logger.getLogs({ level: 'error' });
      expect(errors).toHaveLength(1);
      expect(errors[0].level).toBe('error');
    });

    it('should filter logs by component', () => {
      logger.info('Message 1', { component: 'ComponentA' });
      logger.info('Message 2', { component: 'ComponentB' });
      logger.info('Message 3', { component: 'ComponentA' });

      const componentALogs = logger.getLogs({ component: 'ComponentA' });
      expect(componentALogs).toHaveLength(2);
    });

    it('should maintain circular buffer (max 100 logs)', () => {
      // Add 150 logs
      for (let i = 0; i < 150; i++) {
        logger.info(`Message ${i}`);
      }

      const logs = logger.getLogs();
      expect(logs.length).toBeLessThanOrEqual(100);
      // Should keep the most recent 100
      expect(logs[0].message).toBe('Message 50');
    });

    it('should clear logs', () => {
      logger.info('Message 1');
      logger.info('Message 2');

      expect(logger.getLogs()).toHaveLength(2);

      logger.clearLogs();

      expect(logger.getLogs()).toHaveLength(0);
    });
  });

  describe('Convenience Functions', () => {
    it('should work with log.info', () => {
      const consoleSpy = vi.spyOn(console, 'info');
      log.info('Test message');

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should work with log.error', () => {
      const consoleSpy = vi.spyOn(console, 'error');
      log.error('Error message');

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should work with log.warn', () => {
      const consoleSpy = vi.spyOn(console, 'warn');
      log.warn('Warning message');

      expect(consoleSpy).toHaveBeenCalled();
    });

    it('should get logs using convenience function', () => {
      log.info('Message 1');
      const logs = log.getLogs();

      expect(logs).toHaveLength(1);
    });

    it('should clear logs using convenience function', () => {
      log.info('Message 1');
      log.clearLogs();

      expect(log.getLogs()).toHaveLength(0);
    });
  });

  describe('Component Logger', () => {
    it('should create component-specific logger', () => {
      const consoleSpy = vi.spyOn(console, 'info');
      const componentLogger = createComponentLogger('TestComponent');

      componentLogger.info('Test message');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestComponent'),
        undefined
      );
    });

    it('should include component in stored logs', () => {
      const componentLogger = createComponentLogger('TestComponent');

      componentLogger.info('Test message');

      const logs = logger.getLogs({ component: 'TestComponent' });
      expect(logs).toHaveLength(1);
      expect(logs[0].context?.component).toBe('TestComponent');
    });

    it('should allow additional context', () => {
      const consoleSpy = vi.spyOn(console, 'info');
      const componentLogger = createComponentLogger('TestComponent');

      componentLogger.info('Test message', { action: 'test-action' });

      const logs = logger.getLogs();
      expect(logs[0].context?.component).toBe('TestComponent');
      expect(logs[0].context?.action).toBe('test-action');
    });

    it('should log errors with component context', () => {
      const componentLogger = createComponentLogger('TestComponent');
      const error = new Error('Component error');

      componentLogger.error('Error occurred', { action: 'test' }, error);

      const logs = logger.getLogs({ level: 'error' });
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toBe(error);
      expect(logs[0].context?.component).toBe('TestComponent');
    });
  });

  describe('Log Entry Structure', () => {
    it('should include timestamp', () => {
      logger.info('Test message');

      const logs = logger.getLogs();
      expect(logs[0].timestamp).toBeDefined();
      expect(new Date(logs[0].timestamp).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should include level', () => {
      logger.info('Info message');
      logger.error('Error message');

      const logs = logger.getLogs();
      expect(logs[0].level).toBe('info');
      expect(logs[1].level).toBe('error');
    });

    it('should include message', () => {
      logger.info('Test message');

      const logs = logger.getLogs();
      expect(logs[0].message).toBe('Test message');
    });

    it('should include context when provided', () => {
      const context = { component: 'Test', action: 'test' };
      logger.info('Test message', context);

      const logs = logger.getLogs();
      expect(logs[0].context).toEqual(context);
    });

    it('should include error when provided', () => {
      const error = new Error('Test error');
      logger.error('Error message', undefined, error);

      const logs = logger.getLogs();
      expect(logs[0].error).toBe(error);
    });
  });
});
