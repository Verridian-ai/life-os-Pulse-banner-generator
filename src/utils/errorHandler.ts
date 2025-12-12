// Error Handler Utility - Classifies and retries network errors

export interface NetworkError extends Error {
  type: 'network' | 'cors' | 'timeout' | 'fetch' | 'api' | 'unknown';
  retryable: boolean;
  originalError?: unknown;
}

/**
 * Classifies an error into specific types for better error handling
 */
export const classifyError = (error: unknown): NetworkError => {
  const errorObj = error as { message?: string; name?: string };
  const message = errorObj?.message?.toLowerCase() || '';
  const errorString = String(error).toLowerCase();

  // Failed to fetch - generic network error
  if (message.includes('fetch') || message.includes('failed to fetch')) {
    return {
      name: 'NetworkError',
      message: 'Network connection failed. Please check your internet connection.',
      type: 'fetch',
      retryable: true,
      originalError: error
    };
  }

  // CORS errors
  if (message.includes('cors') || errorString.includes('cors')) {
    return {
      name: 'CORSError',
      message: 'Cross-origin request blocked. The API may not allow requests from this domain.',
      type: 'cors',
      retryable: false,
      originalError: error
    };
  }

  // Timeout errors
  if (message.includes('timeout') || message.includes('aborted') || errorObj.name === 'AbortError') {
    return {
      name: 'TimeoutError',
      message: 'Request timed out. Server took too long to respond.',
      type: 'timeout',
      retryable: true,
      originalError: error
    };
  }

  // Network connectivity errors
  if (message.includes('network') || message.includes('connection') || message.includes('offline')) {
    return {
      name: 'NetworkError',
      message: 'No internet connection. Please check your network.',
      type: 'network',
      retryable: true,
      originalError: error
    };
  }

  // API-specific errors (rate limit, auth, etc.)
  if (message.includes('401') || message.includes('unauthorized') || message.includes('api key')) {
    return {
      name: 'APIError',
      message: 'Invalid API key or authentication failed.',
      type: 'api',
      retryable: false,
      originalError: error
    };
  }

  if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
    return {
      name: 'RateLimitError',
      message: 'Rate limit exceeded. Please wait and try again.',
      type: 'api',
      retryable: true, // Can retry after delay
      originalError: error
    };
  }

  if (message.includes('404') || message.includes('not found')) {
    return {
      name: 'NotFoundError',
      message: 'Resource not found. The API endpoint may be incorrect.',
      type: 'api',
      retryable: false,
      originalError: error
    };
  }

  // Unknown error
  return {
    name: 'UnknownError',
    message: errorObj?.message || 'An unexpected error occurred',
    type: 'unknown',
    retryable: false,
    originalError: error
  };
};

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number, error: NetworkError) => void;
  shouldRetry?: (error: NetworkError) => boolean;
}

/**
 * Retries a function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry,
    shouldRetry
  } = options;

  let lastError: NetworkError | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = classifyError(error);

      console.log(`[Retry] Attempt ${attempt}/${maxAttempts} failed:`, lastError.message);

      // Check if we should retry
      const canRetry = shouldRetry ? shouldRetry(lastError) : lastError.retryable;

      if (!canRetry || attempt === maxAttempts) {
        console.error(`[Retry] Giving up after ${attempt} attempts`);
        throw lastError;
      }

      // Calculate delay (exponential backoff if enabled)
      const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;

      console.log(`[Retry] Waiting ${waitTime}ms before retry...`);

      // Notify callback
      if (onRetry) {
        onRetry(attempt, lastError);
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error('Retry failed');
};

/**
 * Wraps a fetch call with timeout
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout = 30000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - Server took too long to respond');
    }
    throw error;
  }
};

/**
 * User-friendly error messages for UI display
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  const classified = classifyError(error);

  switch (classified.type) {
    case 'fetch':
    case 'network':
      return 'Connection failed. Please check your internet and try again.';

    case 'cors':
      return 'This request is blocked by the browser. Try using a different image model.';

    case 'timeout':
      return 'The request took too long. The server may be busy, please try again.';

    case 'api':
      if (classified.message.includes('rate limit') || classified.message.includes('quota')) {
        return 'Rate limit reached. Please wait a moment before trying again.';
      }
      if (classified.message.includes('API key') || classified.message.includes('authentication')) {
        return 'Invalid API key. Please check your settings.';
      }
      return classified.message;

    default:
      return classified.message || 'An error occurred. Please try again.';
  }
};
