import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { TranscriptEntry, ToolCall } from '../../services/liveClient';
import { ActionResult } from '../../services/actionExecutor';
import { ConnectionState, ConnectionQuality } from '../../types';

interface LiveActionPanelProps {
  isConnected: boolean;
  connectionState: ConnectionState;
  connectionQuality: ConnectionQuality | null;
  errorMessage: string | null;
  connectionStartTime: number | null;
  lastActivityTime: number | null;
  transcript: TranscriptEntry[];
  pendingAction: {
    toolCall: ToolCall;
    result: ActionResult;
  } | null;
  onApproveAction: () => void;
  onRejectAction: () => void;
  onRetry?: () => void;
  executingAction: boolean;
}

const LiveActionPanel: React.FC<LiveActionPanelProps> = ({
  isConnected,
  connectionState,
  connectionQuality,
  errorMessage,
  connectionStartTime,
  lastActivityTime,
  transcript,
  pendingAction,
  onApproveAction,
  onRejectAction,
  onRetry,
  executingAction,
}) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = React.useState(() => Date.now());

  // Auto-scroll transcript to bottom
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Update current time every second for duration display
  useEffect(() => {
    if (connectionState !== 'connected') return;

    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [connectionState]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get tool icon (memoized with useCallback since these are pure functions)
  const getToolIcon = useCallback((toolName: string) => {
    switch (toolName) {
      case 'generate_background': return 'auto_awesome';
      case 'magic_edit': return 'edit';
      case 'remove_background': return 'layers_clear';
      case 'upscale_image': return 'hd';
      case 'restore_image': return 'restore';
      case 'enhance_face': return 'face_retouching_natural';
      default: return 'build';
    }
  }, []);

  // Get tool display name (memoized with useCallback since these are pure functions)
  const getToolDisplayName = useCallback((toolName: string) => {
    switch (toolName) {
      case 'generate_background': return 'Generate Background';
      case 'magic_edit': return 'Magic Edit';
      case 'remove_background': return 'Remove Background';
      case 'upscale_image': return 'Upscale Image';
      case 'restore_image': return 'Restore Image';
      case 'enhance_face': return 'Enhance Face';
      default: return toolName;
    }
  }, []);

  // Memoize status bar styling
  const statusBarStyle = useMemo(() => {
    switch (connectionState) {
      case 'connecting':
        return {
          border: 'border-yellow-500/30',
          bg: 'bg-yellow-950/20',
          dot: 'bg-yellow-500 animate-pulse',
          icon: 'sync',
          iconClass: 'animate-spin text-yellow-500',
          text: 'Connecting to Benno...',
        };
      case 'connected':
        return {
          border: 'border-green-500/30',
          bg: 'bg-green-950/20',
          dot: 'bg-green-500 animate-pulse',
          icon: null,
          iconClass: '',
          text: 'Live Session Active',
        };
      case 'disconnecting':
        return {
          border: 'border-gray-500/30',
          bg: 'bg-gray-950/20',
          dot: 'bg-gray-500 animate-pulse opacity-50',
          icon: null,
          iconClass: '',
          text: 'Disconnecting...',
        };
      case 'error':
        return {
          border: 'border-red-500/30',
          bg: 'bg-red-950/20',
          dot: 'bg-red-500',
          icon: 'error_outline',
          iconClass: 'text-red-500',
          text: errorMessage || 'Connection Failed',
        };
      case 'disconnected':
      default:
        return {
          border: 'border-zinc-700/30',
          bg: 'bg-zinc-950/20',
          dot: 'bg-zinc-600',
          icon: null,
          iconClass: '',
          text: 'Not Connected',
        };
    }
  }, [connectionState, errorMessage]);

  // Memoize timing info
  const timingInfo = useMemo(() => {
    if (!connectionStartTime || connectionState !== 'connected') {
      return null;
    }

    const connectionDuration = currentTime - connectionStartTime;
    const idleDuration = lastActivityTime ? currentTime - lastActivityTime : 0;
    const isIdle = idleDuration > 120000; // 2 minutes = 120000ms

    const formatDuration = (durationMs: number): string => {
      const totalSeconds = Math.floor(durationMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatTime = (timestamp: number) => {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    };

    return {
      duration: formatDuration(connectionDuration),
      idleDuration: formatDuration(idleDuration),
      isIdle,
      lastActivity: lastActivityTime ? formatTime(lastActivityTime) : null,
    };
  }, [connectionStartTime, lastActivityTime, connectionState, currentTime]);

  // Memoize quality indicator
  const qualityIndicator = useMemo(() => {
    if (!connectionQuality || connectionState !== 'connected') {
      return null;
    }

    const qualityConfig = {
      good: {
        color: 'bg-green-500',
        label: 'Good Connection',
        tooltip: 'Low latency (<200ms), stable audio',
        bars: 3,
      },
      fair: {
        color: 'bg-yellow-500',
        label: 'Fair Connection',
        tooltip: 'Medium latency (200-500ms), minor issues',
        bars: 2,
      },
      poor: {
        color: 'bg-red-500',
        label: 'Poor Connection',
        tooltip: 'High latency (>500ms) or frequent audio issues',
        bars: 1,
      },
    };

    return qualityConfig[connectionQuality];
  }, [connectionQuality, connectionState]);

  return (
    <div className='fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-xl border-t border-white/10 safe-area-bottom'>
      {/* Connection Status Bar */}
      <div
        className={`px-6 py-2 flex items-center justify-between border-b ${statusBarStyle.border} ${statusBarStyle.bg} transition-all duration-300`}
      >
        <div className='flex items-center gap-3'>
          <div className={`w-3 h-3 rounded-full ${statusBarStyle.dot} transition-all duration-300`} />
          {statusBarStyle.icon && (
            <span className={`material-icons text-sm ${statusBarStyle.iconClass}`}>
              {statusBarStyle.icon}
            </span>
          )}
          <span className='text-xs font-bold uppercase tracking-wider text-white'>
            {statusBarStyle.text}
          </span>
          {/* Connection Quality Indicator */}
          {qualityIndicator && (
            <div className='flex items-center gap-1.5 ml-2' title={qualityIndicator.tooltip}>
              <div className='flex items-end gap-0.5 h-4'>
                {/* Bar 1 (always shown) */}
                <div
                  className={`w-1 h-1/3 transition-all duration-300 ${qualityIndicator.bars >= 1 ? qualityIndicator.color : 'bg-zinc-700'
                    }`}
                />
                {/* Bar 2 */}
                <div
                  className={`w-1 h-2/3 transition-all duration-300 ${qualityIndicator.bars >= 2 ? qualityIndicator.color : 'bg-zinc-700'
                    }`}
                />
                {/* Bar 3 */}
                <div
                  className={`w-1 h-full transition-all duration-300 ${qualityIndicator.bars >= 3 ? qualityIndicator.color : 'bg-zinc-700'
                    }`}
                />
              </div>
              <span className='text-[9px] font-bold uppercase tracking-wider text-zinc-400'>
                {qualityIndicator.label}
              </span>
            </div>
          )}
        </div>
        <div className='flex items-center gap-3'>
          {/* Connection timing indicators */}
          {timingInfo && (
            <div className='flex items-center gap-3'>
              {/* Connection duration */}
              <div className='flex items-center gap-1.5' title='Connection duration'>
                <span className='material-icons text-xs text-zinc-400'>schedule</span>
                <span className='text-[9px] font-bold uppercase tracking-wider text-zinc-400'>
                  {timingInfo.duration}
                </span>
              </div>

              {/* Last activity / Idle warning */}
              {timingInfo.isIdle ? (
                <div
                  className='flex items-center gap-1.5 px-2 py-0.5 bg-yellow-950/30 border border-yellow-600/30 rounded'
                  title={`No activity since ${timingInfo.lastActivity}`}
                >
                  <span className='material-icons text-xs text-yellow-500 animate-pulse'>warning</span>
                  <span className='text-[9px] font-bold uppercase tracking-wider text-yellow-500'>
                    Idle {timingInfo.idleDuration}
                  </span>
                </div>
              ) : (
                timingInfo.lastActivity && (
                  <div className='flex items-center gap-1.5' title='Last activity'>
                    <span className='material-icons text-xs text-zinc-500'>update</span>
                    <span className='text-[9px] font-bold uppercase tracking-wider text-zinc-500'>
                      {timingInfo.lastActivity}
                    </span>
                  </div>
                )
              )}
            </div>
          )}

          {connectionState === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className='px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1 min-h-[32px]'
              aria-label='Retry connection'
            >
              <span className='material-icons text-xs'>refresh</span>
              Retry
            </button>
          )}
          {transcript.length > 0 && (
            <span className='text-[9px] text-zinc-500 font-bold uppercase tracking-widest'>
              {transcript.length} Messages
            </span>
          )}
        </div>
      </div>

      {/* Main Panel Content */}
      <div className='flex flex-col md:flex-row max-h-[300px]'>
        {/* Transcript Panel */}
        <div className='flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[300px]'>
          {transcript.length === 0 ? (
            <div className='flex items-center justify-center h-full'>
              <p className='text-zinc-600 text-xs font-bold uppercase tracking-wider'>
                {isConnected ? 'Start speaking to begin...' : 'Connect to start live session'}
              </p>
            </div>
          ) : (
            <>
              {transcript.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${entry.role === 'user' ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'
                      }`}
                  >
                    <span className='material-icons text-sm'>
                      {entry.role === 'user' ? 'person' : 'smart_toy'}
                    </span>
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${entry.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div
                      className={`inline-block max-w-[80%] rounded-lg px-3 py-2 ${entry.role === 'user'
                          ? 'bg-blue-600/20 border border-blue-500/30 text-blue-100'
                          : 'bg-purple-600/20 border border-purple-500/30 text-purple-100'
                        }`}
                    >
                      <p className='text-xs font-medium'>{entry.text}</p>

                      {/* Tool Calls */}
                      {entry.toolCalls && entry.toolCalls.length > 0 && (
                        <div className='mt-2 space-y-1'>
                          {entry.toolCalls.map((tool, toolIdx) => (
                            <div
                              key={toolIdx}
                              className='flex items-center gap-2 bg-black/30 rounded px-2 py-1'
                            >
                              <span className='material-icons text-xs text-yellow-400'>
                                {getToolIcon(tool.name)}
                              </span>
                              <span className='text-[9px] font-bold uppercase text-yellow-400'>
                                {getToolDisplayName(tool.name)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className='text-[8px] text-zinc-600 font-bold uppercase tracking-widest mt-1'>
                      {formatTime(entry.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={transcriptEndRef} />
            </>
          )}
        </div>

        {/* Action Preview Panel */}
        {pendingAction && (
          <div className='w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 p-4 bg-zinc-950/50'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='material-icons text-sm text-yellow-400'>
                {getToolIcon(pendingAction.toolCall.name)}
              </span>
              <h3 className='text-xs font-black uppercase tracking-wider text-white'>
                Action Preview
              </h3>
            </div>

            {/* Tool Info */}
            <div className='mb-3 p-2 bg-white/5 rounded border border-white/10'>
              <p className='text-[10px] font-bold uppercase text-zinc-400 mb-1'>
                {getToolDisplayName(pendingAction.toolCall.name)}
              </p>
              {(pendingAction.toolCall.args.prompt as string) && (
                <p className='text-[9px] text-zinc-500 line-clamp-2'>
                  {pendingAction.toolCall.args.prompt as string}
                </p>
              )}
            </div>

            {/* Image Preview */}
            {pendingAction.result.preview && (
              <div className='mb-3 rounded-lg overflow-hidden border border-white/10'>
                <img
                  src={pendingAction.result.preview}
                  alt='Preview'
                  className='w-full h-32 object-cover'
                />
              </div>
            )}

            {/* Error Message */}
            {!pendingAction.result.success && (
              <div className='mb-3 p-2 bg-red-950/50 border border-red-500/30 rounded'>
                <p className='text-[9px] sm:text-[10px] md:text-xs text-red-400 font-medium'>{pendingAction.result.error}</p>
              </div>
            )}

            {/* Action Buttons */}
            {pendingAction.result.success && (
              <div className='flex gap-2'>
                <button
                  onClick={onApproveAction}
                  disabled={executingAction}
                  className='flex-1 min-h-[44px] h-11 bg-green-600 hover:bg-green-500 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-1.5 font-black uppercase text-[9px] sm:text-[10px] md:text-xs tracking-wider transition-colors touch-manipulation active:scale-[0.98]'
                >
                  {executingAction ? (
                    <>
                      <div className='w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin' />
                      Applying...
                    </>
                  ) : (
                    <>
                      <span className='material-icons text-sm'>check</span>
                      Apply
                    </>
                  )}
                </button>
                <button
                  onClick={onRejectAction}
                  disabled={executingAction}
                  className='flex-1 min-h-[44px] h-11 bg-red-600 hover:bg-red-500 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center gap-1.5 font-black uppercase text-[9px] sm:text-[10px] md:text-xs tracking-wider transition-colors touch-manipulation active:scale-[0.98]'
                >
                  <span className='material-icons text-sm'>close</span>
                  Reject
                </button>
              </div>
            )}

            {/* Retry Button for Failed Actions */}
            {!pendingAction.result.success && (
              <button
                onClick={onRejectAction}
                className='w-full min-h-[44px] h-11 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg flex items-center justify-center gap-1.5 font-black uppercase text-[9px] sm:text-[10px] md:text-xs tracking-wider transition-colors touch-manipulation active:scale-[0.98]'
              >
                <span className='material-icons text-sm'>close</span>
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveActionPanel;
