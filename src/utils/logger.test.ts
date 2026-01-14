import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, createLogger, configureLogger, resetLoggerConfig, logPerformance } from './logger';

describe('logger', () => {
  const consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetLoggerConfig();
    // Enable all log levels for testing
    configureLogger({ minLevel: 'debug', includeTimestamp: false });
  });

  afterEach(() => {
    resetLoggerConfig();
  });

  describe('basic logging', () => {
    it('logs debug messages', () => {
      logger.debug('test message');
      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG]', 'test message');
    });

    it('logs info messages', () => {
      logger.info('info message');
      expect(consoleSpy.info).toHaveBeenCalledWith('[INFO]', 'info message');
    });

    it('logs warn messages', () => {
      logger.warn('warning message');
      expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN]', 'warning message');
    });

    it('logs error messages', () => {
      logger.error('error message');
      expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR]', 'error message');
    });

    it('logs multiple arguments', () => {
      const obj = { key: 'value' };
      logger.debug('message', obj, 123);
      expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG]', 'message', obj, 123);
    });
  });

  describe('log level filtering', () => {
    it('suppresses debug logs when minLevel is info', () => {
      configureLogger({ minLevel: 'info' });
      logger.debug('should not appear');
      logger.info('should appear');
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).toHaveBeenCalled();
    });

    it('suppresses debug and info logs when minLevel is warn', () => {
      configureLogger({ minLevel: 'warn' });
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalled();
    });

    it('only shows error logs when minLevel is error', () => {
      configureLogger({ minLevel: 'error' });
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).toHaveBeenCalled();
    });
  });

  describe('logger disabled', () => {
    it('suppresses all logs when disabled', () => {
      configureLogger({ enabled: false });
      logger.debug('debug');
      logger.info('info');
      logger.warn('warn');
      logger.error('error');
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.info).not.toHaveBeenCalled();
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.error).not.toHaveBeenCalled();
    });
  });

  describe('isLevelEnabled', () => {
    it('returns true for enabled levels', () => {
      configureLogger({ minLevel: 'warn' });
      expect(logger.isLevelEnabled('debug')).toBe(false);
      expect(logger.isLevelEnabled('info')).toBe(false);
      expect(logger.isLevelEnabled('warn')).toBe(true);
      expect(logger.isLevelEnabled('error')).toBe(true);
    });
  });
});

describe('createLogger', () => {
  const consoleSpy = {
    log: vi.spyOn(console, 'log').mockImplementation(() => {}),
    info: vi.spyOn(console, 'info').mockImplementation(() => {}),
    warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    resetLoggerConfig();
    configureLogger({ minLevel: 'debug', includeTimestamp: false });
  });

  it('creates a tagged logger with consistent prefix', () => {
    const log = createLogger('TestService');
    log.debug('message');
    expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG]', '[TestService]', 'message');
  });

  it('applies tag to all log levels', () => {
    const log = createLogger('MyModule');
    log.debug('debug');
    log.info('info');
    log.warn('warn');
    log.error('error');

    expect(consoleSpy.log).toHaveBeenCalledWith('[DEBUG]', '[MyModule]', 'debug');
    expect(consoleSpy.info).toHaveBeenCalledWith('[INFO]', '[MyModule]', 'info');
    expect(consoleSpy.warn).toHaveBeenCalledWith('[WARN]', '[MyModule]', 'warn');
    expect(consoleSpy.error).toHaveBeenCalledWith('[ERROR]', '[MyModule]', 'error');
  });
});

describe('logPerformance', () => {
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  beforeEach(() => {
    vi.clearAllMocks();
    resetLoggerConfig();
    configureLogger({ minLevel: 'debug', includeTimestamp: false });
  });

  it('logs execution time for successful operations', async () => {
    const result = await logPerformance('testOp', async () => {
      return 'success';
    });

    expect(result).toBe('success');
    expect(consoleSpy).toHaveBeenCalledWith(
      '[DEBUG]',
      expect.stringMatching(/\[Perf\] testOp completed in \d+\.\d+ms/),
    );
  });

  it('logs execution time for failed operations', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const testError = new Error('test error');

    await expect(
      logPerformance('failingOp', async () => {
        throw testError;
      }),
    ).rejects.toThrow('test error');

    expect(errorSpy).toHaveBeenCalledWith(
      '[ERROR]',
      expect.stringMatching(/\[Perf\] failingOp failed after \d+\.\d+ms/),
      testError,
    );
  });
});
