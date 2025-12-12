import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';

interface AnnouncerContextType {
    announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnouncerContext = createContext<AnnouncerContextType | undefined>(undefined);

/**
 * Hook to access the screen reader announcer
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAnnouncer = () => {
    const context = useContext(AnnouncerContext);
    if (!context) {
        throw new Error('useAnnouncer must be used within ScreenReaderAnnouncerProvider');
    }
    return context;
};

interface ScreenReaderAnnouncerProviderProps {
    children: React.ReactNode;
}

/**
 * Provider component that manages ARIA live regions for screen reader announcements
 */
export const ScreenReaderAnnouncerProvider: React.FC<ScreenReaderAnnouncerProviderProps> = ({ children }) => {
    const [politeMessage, setPoliteMessage] = useState('');
    const [assertiveMessage, setAssertiveMessage] = useState('');
    const politeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const assertiveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    /**
     * Announce a message to screen readers
     * @param message - The message to announce
     * @param priority - 'polite' (default) or 'assertive' for urgent announcements
     */
    const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
        console.log(`[ScreenReader] ${priority.toUpperCase()}: ${message}`);

        if (priority === 'assertive') {
            // Clear existing timeout
            if (assertiveTimeoutRef.current) {
                clearTimeout(assertiveTimeoutRef.current);
            }

            // Set the message
            setAssertiveMessage(message);

            // Clear after 5 seconds to allow new announcements
            assertiveTimeoutRef.current = setTimeout(() => {
                setAssertiveMessage('');
            }, 5000);
        } else {
            // Clear existing timeout
            if (politeTimeoutRef.current) {
                clearTimeout(politeTimeoutRef.current);
            }

            // Set the message
            setPoliteMessage(message);

            // Clear after 5 seconds to allow new announcements
            politeTimeoutRef.current = setTimeout(() => {
                setPoliteMessage('');
            }, 5000);
        }
    }, []);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (politeTimeoutRef.current) {
                clearTimeout(politeTimeoutRef.current);
            }
            if (assertiveTimeoutRef.current) {
                clearTimeout(assertiveTimeoutRef.current);
            }
        };
    }, []);

    return (
        <AnnouncerContext.Provider value={{ announce }}>
            {children}

            {/* ARIA Live Regions - Hidden from visual users but read by screen readers */}
            <div className="sr-only">
                {/* Polite announcements - Don't interrupt user */}
                <div
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                >
                    {politeMessage}
                </div>

                {/* Assertive announcements - Interrupt user for important messages */}
                <div
                    role="alert"
                    aria-live="assertive"
                    aria-atomic="true"
                    className="sr-only"
                >
                    {assertiveMessage}
                </div>
            </div>
        </AnnouncerContext.Provider>
    );
};

/**
 * Screen-reader only CSS utility
 * Add this to your global CSS or Tailwind config:
 *
 * .sr-only {
 *   position: absolute;
 *   width: 1px;
 *   height: 1px;
 *   padding: 0;
 *   margin: -1px;
 *   overflow: hidden;
 *   clip: rect(0, 0, 0, 0);
 *   white-space: nowrap;
 *   border-width: 0;
 * }
 */
