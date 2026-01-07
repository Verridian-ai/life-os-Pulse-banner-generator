import { useState, useEffect, useCallback } from 'react';
import { NetworkError } from '../utils/errorHandler'; // Imported from existing errorHandler

export interface RecoveryAction {
    label: string;
    action: () => void;
    primary?: boolean;
}

export interface ErrorRecoveryState {
    hasError: boolean;
    error: NetworkError | null;
    message: string;
    suggestions: RecoveryAction[];
    isRecovering: boolean;
}

/**
 * Hook to provide actionable recovery suggestions based on error type
 */
export const useErrorRecovery = (contextId?: string) => {
    const [state, setState] = useState<ErrorRecoveryState>({
        hasError: false,
        error: null,
        message: '',
        suggestions: [],
        isRecovering: false,
    });

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, hasError: false, error: null, message: '', suggestions: [] }));
    }, []);

    // Listen for global error events
    useEffect(() => {
        const handleErrorEvent = (event: Event) => {
            const customEvent = event as CustomEvent<NetworkError>;
            // If contextId is provided, we could filter errors relevant to specific components
            // For now, we capture all errors but you could enhance this

            const error = customEvent.detail;
            const suggestions = getRecoverySuggestions(error, clearError);

            setState({
                hasError: true,
                error,
                message: error.message,
                suggestions,
                isRecovering: false,
            });
        };

        window.addEventListener('error-tracked', handleErrorEvent);
        return () => window.removeEventListener('error-tracked', handleErrorEvent);
    }, [contextId, clearError]);

    return {
        ...state,
        clearError,
    };
};

/**
 * Helper to generate recovery suggestions based on error type
 */
const getRecoverySuggestions = (error: NetworkError, clearError: () => void): RecoveryAction[] => {
    const actions: RecoveryAction[] = [];

    // Common action: Dismiss
    const dismissAction: RecoveryAction = {
        label: 'Dismiss',
        action: clearError,
        primary: false
    };

    switch (error.type) {
        case 'network':
        case 'fetch':
        case 'timeout':
            actions.push({
                label: 'Retry',
                action: () => {
                    // Trigger a retry if possible (requires hook integration with data fetching)
                    // Visual placeholder
                    console.log('Retry triggered');
                    // In a real implementation this would trigger a retry function passed via context
                },
                primary: true
            });
            actions.push({
                label: 'Check Connection',
                action: () => window.open('https://www.google.com', '_blank'),
                primary: false
            });
            break;

        case 'api':
            if (error.message.toLowerCase().includes('api key')) {
                actions.push({
                    label: 'Update API Key',
                    action: () => {
                        window.dispatchEvent(new Event('open-settings-modal'));
                        clearError();
                    },
                    primary: true
                });
            } else if (error.message.toLowerCase().includes('rate limit')) {
                actions.push({
                    label: 'Wait 30s',
                    action: () => {
                        clearError();
                    },
                    primary: true
                });
            }
            break;

        case 'cors':
            actions.push({
                label: 'Check CORS Settings',
                action: () => {
                    window.open('https://cors-anywhere.herokuapp.com/corsdemo', '_blank');
                },
                primary: false
            });
            break;
    }

    actions.push(dismissAction);
    return actions;
};
