/**
 * Voice Error Diagnostics - Provides helpful error messages with actionable solutions
 * for voice agent connection failures
 *
 * Maps error messages to user-friendly diagnostics with specific actions users can take
 *
 * @module voiceErrorDiagnostics
 * @see {@link ./docs/VOICE_AGENT_GUIDE.md} for usage documentation
 *
 * @example Basic usage
 * ```tsx
 * import { diagnoseVoiceError, getErrorCode } from '@/utils/voiceErrorDiagnostics';
 *
 * const errorMessage = 'Unauthorized: Invalid API key';
 * const errorCode = getErrorCode(errorMessage); // '401'
 * const diagnostic = diagnoseVoiceError(errorMessage, errorCode);
 *
 * console.log(diagnostic.title); // "API Key Error"
 * console.log(diagnostic.description); // "Your OpenAI API key is missing or invalid."
 * console.log(diagnostic.solution); // "Please add a valid OpenAI API key in Settings..."
 * console.log(diagnostic.retryable); // false
 *
 * if (diagnostic.actionLink) {
 *   console.log(diagnostic.actionLink.text); // "Open Settings"
 *   console.log(diagnostic.actionLink.opensSettings); // true
 * }
 * ```
 */

export interface ErrorDiagnostic {
  /** User-friendly error title */
  title: string;
  /** Detailed description of what went wrong */
  description: string;
  /** Actionable solution(s) the user can take */
  solution: string;
  /** Optional link for the user to click */
  actionLink?: {
    text: string;
    url?: string;
    /** If true, opens settings modal instead of navigating */
    opensSettings?: boolean;
  };
  /** Error category for styling and icons */
  category: 'api_key' | 'microphone' | 'network' | 'rate_limit' | 'browser' | 'server' | 'unknown';
  /** Whether this error is recoverable with retry */
  retryable: boolean;
}

/**
 * Analyze an error message and return helpful diagnostic information
 *
 * Maps technical error messages to user-friendly diagnostics with actionable solutions.
 * Supports multiple error categories: API key, billing, rate limit, microphone,
 * network, server, browser, and unknown errors.
 *
 * @param errorMessage - Raw error message from exception or API response
 * @param errorCode - Optional HTTP status code or error code (e.g., "401", "429")
 * @returns {ErrorDiagnostic} User-friendly diagnostic with title, description, solution, and action links
 *
 * @example
 * ```tsx
 * const diagnostic = diagnoseVoiceError('Rate limit exceeded. Try again in 30 seconds.', '429');
 * console.log(diagnostic.title); // "Rate Limit Exceeded"
 * console.log(diagnostic.retryable); // true
 * console.log(diagnostic.actionLink.url); // "https://platform.openai.com/settings/organization/limits"
 * ```
 */
export function diagnoseVoiceError(errorMessage: string, errorCode?: string): ErrorDiagnostic {
  const msg = errorMessage.toLowerCase();
  const code = errorCode?.toLowerCase() || '';

  // API Key Errors
  if (
    msg.includes('api key') ||
    msg.includes('unauthorized') ||
    msg.includes('401') ||
    msg.includes('authentication') ||
    code === '401' ||
    code === 'unauthorized'
  ) {
    return {
      title: 'API Key Error',
      description: 'Your OpenAI API key is missing or invalid.',
      solution: 'Please add a valid OpenAI API key in Settings. You can create one at platform.openai.com.',
      actionLink: {
        text: 'Open Settings',
        opensSettings: true,
      },
      category: 'api_key',
      retryable: false,
    };
  }

  // Billing / Permission Errors
  if (
    msg.includes('403') ||
    msg.includes('forbidden') ||
    msg.includes('insufficient_quota') ||
    msg.includes('billing') ||
    code === '403' ||
    code === 'forbidden'
  ) {
    return {
      title: 'Billing Required',
      description: 'Your OpenAI account does not have billing enabled or has insufficient credits.',
      solution: 'Please add a payment method and ensure you have credits in your OpenAI account.',
      actionLink: {
        text: 'Manage Billing',
        url: 'https://platform.openai.com/settings/organization/billing',
      },
      category: 'api_key',
      retryable: false,
    };
  }

  // Rate Limit Errors
  if (
    msg.includes('rate limit') ||
    msg.includes('429') ||
    msg.includes('too many requests') ||
    msg.includes('quota') ||
    code === '429' ||
    code === 'rate_limit_exceeded'
  ) {
    // Try to extract wait time from error message
    const waitMatch = msg.match(/(\d+)\s*(second|minute|hour)/);
    const waitTime = waitMatch ? `${waitMatch[1]} ${waitMatch[2]}${waitMatch[1] !== '1' ? 's' : ''}` : 'a moment';

    return {
      title: 'Rate Limit Exceeded',
      description: `You've made too many requests to OpenAI. Please wait ${waitTime} before trying again.`,
      solution: 'Rate limits are set by OpenAI to prevent abuse. Retry in a few moments or upgrade your OpenAI plan for higher limits.',
      actionLink: {
        text: 'View Rate Limits',
        url: 'https://platform.openai.com/settings/organization/limits',
      },
      category: 'rate_limit',
      retryable: true,
    };
  }

  // Microphone Permission Errors
  if (
    msg.includes('microphone') ||
    msg.includes('permission') ||
    msg.includes('denied') ||
    msg.includes('notallowederror') ||
    msg.includes('media')
  ) {
    // Detect browser
    const isChrome = navigator.userAgent.includes('Chrome');
    const isFirefox = navigator.userAgent.includes('Firefox');
    const isSafari = navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
    const isEdge = navigator.userAgent.includes('Edg');

    let instructions = 'Click the lock icon in your browser\'s address bar and enable microphone access.';
    if (isChrome || isEdge) {
      instructions = 'Click the camera/microphone icon in the address bar (or the lock icon) and allow microphone access.';
    } else if (isFirefox) {
      instructions = 'Click the microphone icon with a line through it in the address bar and select "Allow".';
    } else if (isSafari) {
      instructions = 'Go to Safari > Settings > Websites > Microphone and allow access for this site.';
    }

    return {
      title: 'Microphone Access Denied',
      description: 'Benno needs microphone access to hear you, but permission was denied.',
      solution: instructions,
      category: 'microphone',
      retryable: true,
    };
  }

  // Network / Connection Errors
  if (
    msg.includes('network') ||
    msg.includes('connection') ||
    msg.includes('offline') ||
    msg.includes('failed to fetch') ||
    msg.includes('websocket') ||
    msg.includes('timeout') ||
    msg.includes('econnrefused')
  ) {
    return {
      title: 'Connection Failed',
      description: 'Unable to connect to OpenAI\'s voice service. This may be a network issue.',
      solution: 'Check your internet connection and try again. If the problem persists, OpenAI\'s servers may be experiencing issues.',
      actionLink: {
        text: 'Check OpenAI Status',
        url: 'https://status.openai.com/',
      },
      category: 'network',
      retryable: true,
    };
  }

  // CORS Errors
  if (msg.includes('cors') || msg.includes('cross-origin')) {
    return {
      title: 'Browser Security Block',
      description: 'Your browser blocked the connection due to security restrictions.',
      solution: 'Try using Chrome, Edge, or Firefox. Safari and some privacy extensions may block voice connections.',
      category: 'browser',
      retryable: false,
    };
  }

  // Browser Compatibility
  if (
    msg.includes('not supported') ||
    msg.includes('unavailable') ||
    msg.includes('browser')
  ) {
    return {
      title: 'Browser Not Supported',
      description: 'Your browser may not support the voice features required by Benno.',
      solution: 'Please use a modern browser like Chrome, Edge, or Firefox for the best experience.',
      category: 'browser',
      retryable: false,
    };
  }

  // Server Errors
  if (
    msg.includes('500') ||
    msg.includes('502') ||
    msg.includes('503') ||
    msg.includes('504') ||
    msg.includes('internal server') ||
    msg.includes('bad gateway') ||
    msg.includes('service unavailable') ||
    code === '500' ||
    code === '502' ||
    code === '503'
  ) {
    return {
      title: 'Server Error',
      description: 'OpenAI\'s servers are experiencing issues or are temporarily unavailable.',
      solution: 'This is usually temporary. Wait a few moments and try again. Check OpenAI\'s status page for updates.',
      actionLink: {
        text: 'Check OpenAI Status',
        url: 'https://status.openai.com/',
      },
      category: 'server',
      retryable: true,
    };
  }

  // Generic/Unknown Errors
  return {
    title: 'Connection Error',
    description: errorMessage || 'An unexpected error occurred while connecting to the voice agent.',
    solution: 'Try disconnecting and reconnecting. If the problem persists, check your API key and internet connection.',
    actionLink: {
      text: 'Open Settings',
      opensSettings: true,
    },
    category: 'unknown',
    retryable: true,
  };
}

/**
 * Get a short, user-friendly error code from an error message
 *
 * Extracts HTTP status codes or named error codes from error messages.
 * Useful for displaying error codes in UI and passing to diagnoseVoiceError().
 *
 * @param errorMessage - Raw error message
 * @returns {string | undefined} Extracted error code (e.g., "401", "429") or undefined
 *
 * @example
 * ```tsx
 * getErrorCode('401 Unauthorized'); // "401"
 * getErrorCode('Rate limit exceeded'); // "429"
 * getErrorCode('Connection failed'); // undefined
 * ```
 */
export function getErrorCode(errorMessage: string): string | undefined {
  const msg = errorMessage.toLowerCase();

  // HTTP status codes
  const statusMatch = msg.match(/\b(40[0-9]|50[0-9])\b/);
  if (statusMatch) {
    return statusMatch[1];
  }

  // Named error codes
  if (msg.includes('rate_limit_exceeded') || msg.includes('rate limit')) {
    return '429';
  }
  if (msg.includes('unauthorized') || msg.includes('api key')) {
    return '401';
  }
  if (msg.includes('forbidden') || msg.includes('billing')) {
    return '403';
  }
  if (msg.includes('not found')) {
    return '404';
  }

  return undefined;
}
