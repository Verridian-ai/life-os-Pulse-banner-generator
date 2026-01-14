import { useRef, useEffect } from 'react';
import { ChatMessage } from '@/types';
import type { UseAutoScrollReturn } from '../types';

/**
 * Custom hook for auto-scrolling to bottom of chat
 * Scrolls smoothly when messages change or loading state changes
 *
 * @param messages - Array of chat messages to monitor
 * @param loading - Loading state to monitor
 * @returns Object containing bottomRef to attach to scroll target element
 */
export function useAutoScroll(messages: ChatMessage[], loading: boolean): UseAutoScrollReturn {
  const bottomRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when messages or loading state changes
   * Triggered on both new messages and loading state changes
   * Uses smooth scrolling behavior for better UX
   */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return {
    bottomRef,
  };
}
