# Voice Agent Connection Management Guide

> **Comprehensive guide for developers working with the voice agent connection system**

This document covers the voice agent connection state management, error handling flow, and usage examples for the improved connection feedback system introduced in Task 015.

---

## Table of Contents

1. [Overview](#overview)
2. [Connection States](#connection-states)
3. [Error Handling Flow](#error-handling-flow)
4. [Component Architecture](#component-architecture)
5. [Usage Examples](#usage-examples)
6. [Testing & Debugging](#testing--debugging)

---

## Overview

The voice agent connection system manages WebSocket-based real-time voice interactions with OpenAI's Realtime API. The system provides:

- **5 connection states** with visual feedback
- **Automatic retry** with exponential backoff
- **Error diagnostics** with actionable solutions
- **Haptic feedback** on mobile devices
- **Connection quality** monitoring
- **Timing indicators** (duration, last activity)

### Key Components

| Component | Purpose | File |
|-----------|---------|------|
| `VoiceAgentContext` | State management & connection logic | `src/context/VoiceAgentContext.tsx` |
| `Header` | Voice toggle button with state UI | `src/components/layout/Header.tsx` |
| `LiveActionPanel` | Status display & connection details | `src/components/features/LiveActionPanel.tsx` |
| `ConnectionErrorToast` | Error notification with diagnostics | `src/components/features/ConnectionErrorToast.tsx` |
| `haptics` | Haptic feedback utilities | `src/utils/haptics.ts` |
| `voiceErrorDiagnostics` | Error message mapping | `src/utils/voiceErrorDiagnostics.ts` |

---

## Connection States

The voice agent uses a state machine with 5 distinct states:

### ConnectionState Enum

```typescript
export type ConnectionState =
  | 'disconnected'   // Not connected, initial state
  | 'connecting'     // Connection attempt in progress
  | 'connected'      // Successfully connected and ready
  | 'disconnecting'  // Disconnection in progress
  | 'error';         // Connection failed or error occurred
```

### State Transitions

```
[disconnected]
    ↓ (user clicks connect)
[connecting]
    ↓ (success)         ↓ (failure)
[connected]           [error]
    ↓                    ↓ (retry)
[disconnecting]       [connecting]
    ↓
[disconnected]
```

### Visual Feedback by State

| State | Button Color | Icon | Animation | Haptic |
|-------|-------------|------|-----------|--------|
| `disconnected` | Gray | `mic_off` | None | None |
| `connecting` | Amber/Yellow | Spinner | Pulse | None |
| `connected` | Green | `mic` | Pulse | 50ms |
| `disconnecting` | Gray | `mic_off` | Fade | None |
| `error` | Red | `error_outline` | None | 50-100-50ms |

### Connection Quality

When connected, the system monitors connection quality based on WebSocket latency and audio buffer health:

```typescript
export type ConnectionQuality = 'good' | 'fair' | 'poor';

// Thresholds:
// - good:  <200ms latency, <5 audio underruns
// - fair:  200-500ms latency OR 5-15 underruns
// - poor:  >500ms latency OR >15 underruns
```

---

## Error Handling Flow

The system provides comprehensive error handling with automatic recovery:

### Error Categories

| Category | Retryable | Auto-Retry | Examples |
|----------|-----------|-----------|----------|
| `api_key` | ❌ No | ❌ No | Missing/invalid API key, unauthorized |
| `billing` | ❌ No | ❌ No | Insufficient quota, payment required |
| `microphone` | ✅ Yes | ❌ No | Permission denied, device not found |
| `network` | ✅ Yes | ✅ Yes | Connection timeout, offline, WebSocket error |
| `rate_limit` | ✅ Yes | ✅ Yes | 429 Too Many Requests |
| `server` | ✅ Yes | ✅ Yes | 500, 502, 503, 504 errors |
| `browser` | ❌ No | ❌ No | CORS, unsupported browser |
| `unknown` | ✅ Yes | ❌ No | Unexpected errors |

### Automatic Retry Mechanism

For retryable errors, the system automatically retries with exponential backoff:

```typescript
// Configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // 1s, 2s, 4s

// Retry flow
connectionState === 'error' && retryCount < MAX_RETRIES
  → Wait delay (exponential backoff)
  → Increment retryCount
  → Attempt connect()
  → On success: Reset retryCount, set 'connected'
  → On failure: Set 'error', schedule next retry
```

### Manual Retry

Users can manually retry from two locations:

1. **Voice Toggle Button** - Click the red error button
2. **ConnectionErrorToast** - Click the "Retry" button

Manual retry:
- Cancels any pending auto-retry
- Resets retry count to 0
- Immediately attempts reconnection
- Dismisses error toast on success

### Error Diagnostic System

The `voiceErrorDiagnostics` utility maps errors to user-friendly messages:

```typescript
interface ErrorDiagnostic {
  title: string;           // "API Key Error"
  description: string;     // What went wrong
  solution: string;        // Actionable steps
  actionLink?: {           // Optional link
    text: string;
    url?: string;
    opensSettings?: boolean;
  };
  category: string;        // Error category
  retryable: boolean;      // Can it be retried?
}

// Usage
const diagnostic = diagnoseVoiceError(errorMessage, errorCode);
```

---

## Component Architecture

### VoiceAgentContext

**Central state management** for voice agent interactions.

**Key State:**
```typescript
const {
  connectionState,      // Current connection state
  connectionQuality,    // 'good' | 'fair' | 'poor' | null
  errorMessage,         // Error message text
  retryCount,           // Current retry attempt (0-3)
  maxRetries,           // Maximum retry attempts (3)
  connectionStartTime,  // Timestamp when connected
  lastActivityTime,     // Timestamp of last transcript/action
  connect,              // Connect to voice service
  disconnect,           // Disconnect from service
  retry,                // Manually retry connection
} = useVoiceAgent();
```

**Connect Flow:**
1. Set `connectingRef.current = true` (prevent race condition)
2. Set state to `'connecting'`
3. Get OpenAI API key from storage
4. Create `OpenAIRealtimeClient` instance
5. Create `ActionExecutor` in preview mode
6. Call `client.connect()` with callbacks
7. On success:
   - Set state to `'connected'`
   - Reset retry count
   - Start connection timing
   - Trigger haptic feedback
8. On error:
   - Set state to `'error'`
   - Set error message
   - Cleanup clients
   - Throw error (triggers auto-retry)

**Disconnect Flow:**
1. Set state to `'disconnecting'`
2. Clear retry timeout
3. Reset retry count
4. Disconnect client
5. Clear all state
6. Set state to `'disconnected'`

### Header Component

**Voice toggle button** with state-based UI.

**State Rendering:**
```typescript
// Disconnected
<button disabled={false} className="bg-gradient-to-br from-zinc-700 to-zinc-600">
  <span className="material-icons">mic_off</span>
</button>

// Connecting
<button disabled={true} className="bg-gradient-to-br from-amber-600 to-yellow-600 animate-pulse">
  <span className="material-icons animate-spin">autorenew</span>
</button>

// Connected
<button disabled={false} className="bg-gradient-to-br from-emerald-600 to-green-600 animate-pulse">
  <span className="material-icons">mic</span>
</button>

// Error
<button disabled={false} className="bg-gradient-to-br from-red-600 to-rose-600">
  <span className="material-icons">error_outline</span>
</button>

// Disconnecting
<button disabled={true} className="bg-gradient-to-br from-zinc-700 to-zinc-600 opacity-50">
  <span className="material-icons">mic_off</span>
</button>
```

**Haptic Feedback:**
```typescript
useEffect(() => {
  if (voiceConnectionState === 'connected') {
    hapticConnected(); // 50ms vibration
  } else if (voiceConnectionState === 'error') {
    hapticError(); // 50-100-50ms pattern
  } else if (voiceConnectionState === 'disconnected') {
    hapticDisconnected(); // 30ms vibration
  }
}, [voiceConnectionState]);
```

### LiveActionPanel

**Status display** with connection details.

**Features:**
- Connection state indicator with colors
- Error message display
- Retry button (on error)
- Connection quality bars (good/fair/poor)
- Connection duration (MM:SS)
- Last activity timestamp
- Idle warning (>2 minutes)

**State-Based Styling:**
```typescript
const statusBarStyle = useMemo(() => {
  switch (connectionState) {
    case 'connecting':
      return 'border-amber-500/50 bg-amber-950/20';
    case 'connected':
      return 'border-emerald-500/50 bg-emerald-950/20';
    case 'error':
      return 'border-red-500/50 bg-red-950/20';
    case 'disconnecting':
      return 'border-zinc-600/50 bg-zinc-900/20 opacity-50';
    default:
      return 'border-zinc-700/50 bg-zinc-900/20';
  }
}, [connectionState]);
```

### ConnectionErrorToast

**Error notification** with diagnostics.

**Features:**
- Auto-dismisses after 10 seconds
- Countdown timer with progress bar
- Manual dismiss button
- Retry button (for retryable errors)
- Action links (Settings, OpenAI Status, etc.)
- Browser-specific instructions
- Respects `prefers-reduced-motion`

**Integration:**
```typescript
// In App.tsx
const [showVoiceErrorToast, setShowVoiceErrorToast] = useState(false);

useEffect(() => {
  if (voiceAgent.connectionState === 'error' && voiceAgent.errorMessage) {
    setShowVoiceErrorToast(true);
  } else if (voiceAgent.connectionState === 'connected') {
    setShowVoiceErrorToast(false); // Auto-dismiss on success
  }
}, [voiceAgent.connectionState, voiceAgent.errorMessage]);

<ConnectionErrorToast
  isVisible={showVoiceErrorToast}
  errorMessage={voiceAgent.errorMessage || ''}
  onRetry={() => voiceAgent.retry()}
  onDismiss={() => setShowVoiceErrorToast(false)}
  onOpenSettings={() => setIsSettingsOpen(true)}
/>
```

---

## Usage Examples

### Example 1: Basic Connection Management

```typescript
import { useVoiceAgent } from '@/context/VoiceAgentContext';

function MyComponent() {
  const voiceAgent = useVoiceAgent();

  const handleConnect = async () => {
    try {
      await voiceAgent.connect();
      console.log('Connected successfully!');
    } catch (error) {
      console.error('Connection failed:', error);
      // Error state is automatically set, retry will be triggered
    }
  };

  const handleDisconnect = async () => {
    await voiceAgent.disconnect();
    console.log('Disconnected');
  };

  return (
    <div>
      <p>Status: {voiceAgent.connectionState}</p>
      {voiceAgent.connectionState === 'disconnected' && (
        <button onClick={handleConnect}>Connect</button>
      )}
      {voiceAgent.connectionState === 'connected' && (
        <button onClick={handleDisconnect}>Disconnect</button>
      )}
      {voiceAgent.connectionState === 'error' && (
        <div>
          <p>Error: {voiceAgent.errorMessage}</p>
          <button onClick={() => voiceAgent.retry()}>Retry</button>
        </div>
      )}
    </div>
  );
}
```

### Example 2: Monitoring Connection Quality

```typescript
import { useVoiceAgent } from '@/context/VoiceAgentContext';

function ConnectionMonitor() {
  const { connectionState, connectionQuality } = useVoiceAgent();

  if (connectionState !== 'connected') {
    return <p>Not connected</p>;
  }

  return (
    <div>
      <p>Connection Quality: {connectionQuality || 'unknown'}</p>
      {connectionQuality === 'poor' && (
        <p className="text-red-500">
          Poor connection detected. Consider reconnecting.
        </p>
      )}
    </div>
  );
}
```

### Example 3: Custom Error Handling

```typescript
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { diagnoseVoiceError } from '@/utils/voiceErrorDiagnostics';

function CustomErrorHandler() {
  const { connectionState, errorMessage } = useVoiceAgent();

  if (connectionState !== 'error' || !errorMessage) {
    return null;
  }

  const diagnostic = diagnoseVoiceError(errorMessage);

  return (
    <div className="error-panel">
      <h3>{diagnostic.title}</h3>
      <p>{diagnostic.description}</p>
      <p><strong>Solution:</strong> {diagnostic.solution}</p>
      {diagnostic.actionLink && (
        <a href={diagnostic.actionLink.url}>
          {diagnostic.actionLink.text}
        </a>
      )}
      {diagnostic.retryable && (
        <button onClick={() => voiceAgent.retry()}>
          Try Again
        </button>
      )}
    </div>
  );
}
```

### Example 4: Connection Timing Display

```typescript
import { useVoiceAgent } from '@/context/VoiceAgentContext';
import { useEffect, useState } from 'react';

function ConnectionTimer() {
  const { connectionState, connectionStartTime, lastActivityTime } = useVoiceAgent();
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Update every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (connectionState !== 'connected' || !connectionStartTime) {
    return null;
  }

  const duration = Math.floor((currentTime - connectionStartTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const timeSinceActivity = lastActivityTime
    ? Math.floor((currentTime - lastActivityTime) / 1000)
    : 0;

  const isIdle = timeSinceActivity > 120; // 2 minutes

  return (
    <div>
      <p>Connected for: {minutes}:{seconds.toString().padStart(2, '0')}</p>
      {isIdle && (
        <p className="text-amber-500">
          ⚠️ No activity for {Math.floor(timeSinceActivity / 60)} minutes
        </p>
      )}
    </div>
  );
}
```

### Example 5: Haptic Feedback Integration

```typescript
import { triggerHaptic, HAPTIC_PATTERNS } from '@/utils/haptics';

function MyButton() {
  const handleSuccess = () => {
    // Trigger success haptic
    triggerHaptic(HAPTIC_PATTERNS.CONNECTED);
    console.log('Action successful!');
  };

  const handleError = () => {
    // Trigger error haptic
    triggerHaptic(HAPTIC_PATTERNS.ERROR);
    console.log('Action failed!');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Success Action</button>
      <button onClick={handleError}>Error Action</button>
    </div>
  );
}
```

---

## Testing & Debugging

### Manual Testing Checklist

See comprehensive testing documentation:
- **[MANUAL_TEST_RESULTS.md](../.auto-claude/specs/015-improve-voice-agent-connection-feedback/MANUAL_TEST_RESULTS.md)** - Connection state transitions
- **[ACCESSIBILITY_TEST_RESULTS.md](../.auto-claude/specs/015-improve-voice-agent-connection-feedback/ACCESSIBILITY_TEST_RESULTS.md)** - WCAG 2.1 AA compliance
- **[MOBILE_TEST_RESULTS.md](../.auto-claude/specs/015-improve-voice-agent-connection-feedback/MOBILE_TEST_RESULTS.md)** - Mobile & haptic feedback
- **[ERROR_SIMULATION_TEST_RESULTS.md](../.auto-claude/specs/015-improve-voice-agent-connection-feedback/ERROR_SIMULATION_TEST_RESULTS.md)** - Error scenarios

### Debug Logging

All logs are tagged with `[VoiceAgentContext]` for easy filtering:

```typescript
// Enable verbose logging in console
// All connection state changes are logged
console.log('[VoiceAgentContext] Starting connection...');
console.log('[VoiceAgentContext] Connected successfully');
console.log('[VoiceAgentContext] Connection failed:', error);
console.log('[VoiceAgentContext] Scheduling auto-retry 1/3 in 1000ms');
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| "Already connecting" message | Double-click on connect button | Fixed with `connectingRef` race condition prevention |
| Auto-retry not working | Error is non-retryable | Check error category with `diagnoseVoiceError()` |
| Haptic not triggering | `prefers-reduced-motion` enabled | Haptics respect user preference |
| Quality always "poor" | High network latency | Check network connection, try different location |
| Toast not dismissing | State not updating | Ensure `connectionState === 'connected'` clears error |

### Performance Monitoring

The system is optimized for 60fps performance:

1. **React.memo** on Header component (only re-renders on state change)
2. **useMemo** for expensive calculations (status bar style, timing info)
3. **useCallback** for stable function references
4. **CSS animations** (not JavaScript) for smooth 60fps
5. **Debounced updates** (1 second intervals for timers)
6. **Cached media queries** (haptics `prefers-reduced-motion`)

See [PERFORMANCE_VERIFICATION.md](../.auto-claude/specs/015-improve-voice-agent-connection-feedback/PERFORMANCE_VERIFICATION.md) for detailed analysis.

---

## Best Practices

### Do's ✅

- Always use `useVoiceAgent()` hook to access context
- Check `connectionState` before calling methods
- Handle connection errors in try/catch blocks
- Use provided diagnostic utilities for error messages
- Test on multiple browsers and devices
- Respect `prefers-reduced-motion` for animations
- Use haptic feedback for tactile confirmation

### Don'ts ❌

- Don't call `connect()` when already connecting (use `connectingRef` check)
- Don't manually set `connectionState` (use provided methods)
- Don't ignore error states (always provide retry mechanism)
- Don't assume Vibration API is available (use feature detection)
- Don't show generic error messages (use diagnostic system)
- Don't block UI during connection (show loading state)
- Don't forget to cleanup on unmount (context handles this)

---

## Future Enhancements

Potential improvements for future iterations:

1. **WebSocket reconnection** - Automatic reconnect on temporary network loss
2. **Connection statistics** - Track success rate, average latency
3. **Offline mode** - Queue actions when offline
4. **Custom retry policies** - Per-error-type retry configuration
5. **Connection prewarming** - Establish connection in advance
6. **Multi-session support** - Multiple concurrent voice sessions
7. **Enhanced diagnostics** - Network speed test, latency visualization
8. **A/B testing** - Different retry strategies

---

## References

- [OpenAI Realtime API Documentation](https://platform.openai.com/docs/guides/realtime)
- [MDN Web APIs - Vibration API](https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Context Best Practices](https://react.dev/learn/scaling-up-with-reducer-and-context)

---

**Last Updated:** 2026-01-07
**Task:** 015 - Improve Voice Agent Connection Feedback
**Version:** 1.0.0
