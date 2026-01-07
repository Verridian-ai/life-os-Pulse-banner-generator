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
      originalError: error,
    };
  }

  // CORS errors
  if (message.includes('cors') || errorString.includes('cors')) {
    return {
      name: 'CORSError',
      message: 'Cross-origin request blocked. The API may not allow requests from this domain.',
      type: 'cors',
      retryable: false,
      originalError: error,
    };
  }

  // Timeout errors
  if (
    message.includes('timeout') ||
    message.includes('aborted') ||
    errorObj.name === 'AbortError'
  ) {
    return {
      name: 'TimeoutError',
      message: 'Request timed out. Server took too long to respond.',
      type: 'timeout',
      retryable: true,
      originalError: error,
    };
  }

  // Network connectivity errors
  if (
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('offline')
  ) {
    return {
      name: 'NetworkError',
      message: 'No internet connection. Please check your network.',
      type: 'network',
      retryable: true,
      originalError: error,
    };
  }

  // API-specific errors (rate limit, auth, etc.)
  if (message.includes('401') || message.includes('unauthorized') || message.includes('api key')) {
    return {
      name: 'APIError',
      message: 'Invalid API key or authentication failed.',
      type: 'api',
      retryable: false,
      originalError: error,
    };
  }

  if (message.includes('403') || message.includes('forbidden')) {
    return {
      name: 'PermissionError',
      message: 'Access forbidden. Your API key may not have the required permissions or billing may not be enabled.',
      type: 'api',
      retryable: false,
      originalError: error,
    };
  }

  if (message.includes('429') || message.includes('rate limit') || message.includes('quota')) {
    return {
      name: 'RateLimitError',
      message: 'Rate limit exceeded. Please wait and try again.',
      type: 'api',
      retryable: true, // Can retry after delay
      originalError: error,
    };
  }

  if (message.includes('404') || message.includes('not found')) {
    return {
      name: 'NotFoundError',
      message: 'Resource not found. The API endpoint may be incorrect.',
      type: 'api',
      retryable: false,
      originalError: error,
    };
  }

  // Unknown error
  return {
    name: 'UnknownError',
    message: errorObj?.message || 'An unexpected error occurred',
    type: 'unknown',
    retryable: false,
    originalError: error,
  };
};

export interface ErrorMetric {
  timestamp: number;
  type: string;
  message: string;
  context?: string;
}

/**
 * Tracks an error in localStorage for analytics
 */
export const trackError = (error: unknown, context?: string) => {
  try {
    const classified = classifyError(error);
    const metrics: ErrorMetric[] = JSON.parse(localStorage.getItem('error_metrics') || '[]');
    
    metrics.push({
      timestamp: Date.now(),
      type: classified.type,
      message: classified.message,
      context,
    });

    // Keep only last 100 errors to prevent storage bloat
    localStorage.setItem('error_metrics', JSON.stringify(metrics.slice(-100)));
    
    // Dispatch event for hooks to listen to
    window.dispatchEvent(new CustomEvent('error-tracked', { detail: classified }));
  } catch (e) {
    console.error('Failed to track error:', e);
  }
};

/**
 * Retry configuration options
 */
// ... (RetryOptions unchanged)

/**
 * User-friendly error messages for UI display
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  const classified = classifyError(error);
  return classified.message;
};

/**
 * Generic error handler that logs and returns a user-friendly message
 */
export const handleError = (error: unknown, context?: string): string => {
  if (context) {
    console.error(`[${context}] Error:`, error);
  } else {
    console.error('Error:', error);
  }
  
  // Track error for analytics
  trackError(error, context);
  
  return getUserFriendlyMessage(error);
};
