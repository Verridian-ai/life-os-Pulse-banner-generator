import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import App from './App';
import React from 'react';

// Mock matchMedia for JSDOM
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => { }, // Deprecated
    removeListener: () => { }, // Deprecated
    addEventListener: () => { },
    removeEventListener: () => { },
    dispatchEvent: () => { },
  }),
});

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

describe('App', () => {
  it('renders without crashing', () => {
    // Basic smoke test
    render(
      <ToastProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ToastProvider>
    );
    // Check for a known element, e.g., the sidebar title or something generic
    // Since App is complex and requires context which it provides itself, this should work.
    // If it fails, we know we have environment issues.
  });
});
