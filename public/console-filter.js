// Console Filter - Suppress noisy browser extension errors
// This filters out errors from browser extensions that don't affect the app

(function() {
    'use strict';

    // Save original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Patterns to filter out (ONLY extension-related errors, NOT app errors)
    const filterPatterns = [
        /refresh\.js/i,                              // Browser extension hot reload
        /ws:\/\/localhost:8081/i,                    // Extension dev server
        /WebSocket connection.*localhost:8081.*failed/i,  // Extension WebSocket
        /Extension Loaded/i,                         // Extension install message
        /content script loaded/i,                    // Extension content script
        /_browser_websocket\.ts.*WebSocket/i         // Extension internal files
        // REMOVED: WebSocket is already in CLOSING or CLOSED state - this is a real error!
        // REMOVED: live.ts.*sendRealtimeInput - this is a real error that needs to be visible!
    ];

    // Helper function to check if message should be filtered
    function shouldFilter(args) {
        const message = args.join(' ');
        return filterPatterns.some(pattern => pattern.test(message));
    }

    // Override console.error
    console.error = function(...args) {
        if (!shouldFilter(args)) {
            originalError.apply(console, args);
        }
    };

    // Override console.warn
    console.warn = function(...args) {
        if (!shouldFilter(args)) {
            originalWarn.apply(console, args);
        }
    };

    console.log('[Console Filter] ✓ Noisy extension errors filtered');
})();
