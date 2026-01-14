/**
 * Logger Utility - Production-safe logging with log levels
 *
 * Replaces raw console.log statements with environment-aware logging.
 * In production, debug logs are suppressed to improve performance and security.
 *
 * Usage:
 *   import { logger } from '@/utils/logger';
 *   logger.debug('[ServiceName]', 'Debug message', { data });
 *   logger.info('[ServiceName]', 'Info message');
 *   logger.warn('[ServiceName]', 'Warning message');
 *   logger.error('[ServiceName]', 'Error message', error);
 *
 * Or use createLogger for consistent tagging:
 *   const log = createLogger('ServiceName');
 *   log.debug('Debug message');
 *   log.info('Info message');
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  /** Minimum log level to output. Logs below this level are suppressed. */
  minLevel: LogLevel;
  /** Whether logging is enabled at all */
  enabled: boolean;
  /** Whether to include timestamps in logs */
  includeTimestamp: boolean;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

const defaultConfig: LoggerConfig = {
  // In production, only show warnings and errors
  // In development, show all logs
  minLevel: isProduction ? 'warn' : 'debug',
  enabled: true,
  includeTimestamp: isDevelopment,
};

let currentConfig: LoggerConfig = { ...defaultConfig };

/**
 * Configure the logger settings
 */
export function configureLogger(config: Partial<LoggerConfig>): void {
  currentConfig = { ...currentConfig, ...config };
}

/**
 * Reset logger to default configuration
 */
export function resetLoggerConfig(): void {
  currentConfig = { ...defaultConfig };
}

/**
 * Check if a log level should be output based on current config
 */
function shouldLog(level: LogLevel): boolean {
  if (!currentConfig.enabled) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[currentConfig.minLevel];
}

/**
 * Format the log prefix with optional timestamp
 */
function formatPrefix(level: LogLevel): string {
  if (currentConfig.includeTimestamp) {
    const timestamp = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm
    return `[${timestamp}] [${level.toUpperCase()}]`;
  }
  return `[${level.toUpperCase()}]`;
}

/**
 * Core logging function
 */
function log(level: LogLevel, ...args: unknown[]): void {
  if (!shouldLog(level)) return;

  const prefix = formatPrefix(level);
  const consoleFn = level === 'debug' ? console.log : console[level];

  consoleFn(prefix, ...args);
}

/**
 * Main logger object with level-specific methods
 */
export const logger = {
  /**
   * Debug level - Development only, suppressed in production
   * Use for detailed debugging information
   */
  debug: (...args: unknown[]): void => log('debug', ...args),

  /**
   * Info level - General information about application flow
   * Suppressed in production by default
   */
  info: (...args: unknown[]): void => log('info', ...args),

  /**
   * Warn level - Warning conditions that should be addressed
   * Always shown in production
   */
  warn: (...args: unknown[]): void => log('warn', ...args),

  /**
   * Error level - Error conditions that need attention
   * Always shown in production
   */
  error: (...args: unknown[]): void => log('error', ...args),

  /**
   * Log with explicit level
   */
  log: (level: LogLevel, ...args: unknown[]): void => log(level, ...args),

  /**
   * Check if a level would be logged (useful for expensive log message construction)
   */
  isLevelEnabled: (level: LogLevel): boolean => shouldLog(level),

  /**
   * Get current configuration
   */
  getConfig: (): LoggerConfig => ({ ...currentConfig }),
};

/**
 * Tagged logger interface
 */
export interface TaggedLogger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  /** Log with explicit level */
  log: (level: LogLevel, ...args: unknown[]) => void;
}

/**
 * Create a logger instance with a consistent tag/prefix
 *
 * @param tag - The tag to prefix all log messages with (e.g., 'AuthService', 'Canvas')
 * @returns A logger object with the tag automatically prepended
 *
 * @example
 * const log = createLogger('AuthService');
 * log.debug('User login attempt', { userId }); // Output: [DEBUG] [AuthService] User login attempt { userId: '...' }
 * log.error('Login failed', error); // Output: [ERROR] [AuthService] Login failed Error: ...
 */
export function createLogger(tag: string): TaggedLogger {
  const prefix = `[${tag}]`;

  return {
    debug: (...args: unknown[]) => logger.debug(prefix, ...args),
    info: (...args: unknown[]) => logger.info(prefix, ...args),
    warn: (...args: unknown[]) => logger.warn(prefix, ...args),
    error: (...args: unknown[]) => logger.error(prefix, ...args),
    log: (level: LogLevel, ...args: unknown[]) => logger.log(level, prefix, ...args),
  };
}

/**
 * Performance logging helper - logs execution time of a function
 *
 * @example
 * const result = await logPerformance('fetchUserData', async () => {
 *   return await api.getUser(userId);
 * });
 */
export async function logPerformance<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!shouldLog('debug')) {
    return fn();
  }

  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.debug(`[Perf] ${label} completed in ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`[Perf] ${label} failed after ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}

/**
 * Group related logs together (development only)
 *
 * @example
 * logGroup('API Request', () => {
 *   logger.debug('URL:', url);
 *   logger.debug('Headers:', headers);
 *   logger.debug('Body:', body);
 * });
 */
export function logGroup(label: string, fn: () => void): void {
  if (!shouldLog('debug')) {
    fn();
    return;
  }

  console.group(label);
  try {
    fn();
  } finally {
    console.groupEnd();
  }
}

export default logger;
