import React, { useState } from 'react';

type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'listening' | 'processing';

interface VoiceAgentButtonProps {
  onCommand?: (command: string) => void;
}

export function VoiceAgentButton({ onCommand }: VoiceAgentButtonProps) {
  const [state, setState] = useState<ConnectionState>('disconnected');

  const handleClick = () => {
    if (state === 'disconnected') {
      setState('connecting');
      // Simulate connection
      setTimeout(() => setState('connected'), 1500);
    } else if (state === 'connected') {
      setState('listening');
    } else if (state === 'listening') {
      setState('processing');
      // Simulate processing
      setTimeout(() => {
        setState('connected');
        onCommand?.('Generate a professional LinkedIn banner');
      }, 2000);
    }
  };

  const getStateStyles = () => {
    switch (state) {
      case 'connecting':
        return 'bg-gradient-to-r from-yellow-400 to-yellow-500 animate-pulse shadow-[0_0_30px_rgba(250,204,21,0.4)]';
      case 'connected':
        return 'bg-gradient-to-r from-sky-500 via-teal-500 to-cyan-400 shadow-[0_0_40px_rgba(20,184,166,0.3)] hover:shadow-[0_0_50px_rgba(20,184,166,0.5)]';
      case 'listening':
        return 'bg-gradient-to-r from-red-500 to-rose-500 animate-pulse ring-4 ring-red-500/30 shadow-[0_0_40px_rgba(239,68,68,0.4)]';
      case 'processing':
        return 'bg-gradient-to-r from-purple-500 to-violet-500 animate-pulse shadow-[0_0_40px_rgba(139,92,246,0.4)]';
      default:
        return 'bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] hover:bg-white/10';
    }
  };

  const getStateIcon = () => {
    switch (state) {
      case 'connecting':
        return (
          <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        );
      case 'listening':
        return (
          <div className="flex items-center gap-0.5">
            <div className="w-1 h-4 bg-white rounded-full animate-bounce delay-0" />
            <div className="w-1 h-6 bg-white rounded-full animate-bounce delay-150" />
            <div className="w-1 h-4 bg-white rounded-full animate-bounce delay-300" />
          </div>
        );
      case 'processing':
        return (
          <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
    }
  };

  const getStateLabel = () => {
    switch (state) {
      case 'connecting':
        return 'Connecting...';
      case 'connected':
        return 'Tap to speak';
      case 'listening':
        return 'Listening...';
      case 'processing':
        return 'Processing...';
      default:
        return 'Voice Agent';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Status Pill - Glass Card */}
      {state !== 'disconnected' && (
        <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),4px_4px_8px_rgba(0,0,0,0.4),-4px_-4px_8px_rgba(255,255,255,0.05)] rounded-xl">
          <p className="text-sm text-zinc-300">{getStateLabel()}</p>
        </div>
      )}

      {/* Main Button - Neumorphic with Gradient */}
      <button
        onClick={handleClick}
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white transition-all duration-300 ${getStateStyles()}`}
      >
        {getStateIcon()}
      </button>

      {/* Disconnect Button - Glass Card */}
      {state !== 'disconnected' && (
        <button
          onClick={() => setState('disconnected')}
          className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export default VoiceAgentButton;
