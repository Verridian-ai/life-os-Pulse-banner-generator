import React, { Component, ErrorInfo, ReactNode } from 'react';
import { BTN_PRIMARY, BTN_SECONDARY } from '../styles';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, showDetails: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-stone-950 p-6 font-sans"
          role="alert"
          aria-live="assertive"
        >
          <div className="bg-stone-900 border border-white/10 rounded-3xl p-8 md:p-12 max-w-lg w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] text-center space-y-6">

            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 mb-2">
              <span className="material-icons text-5xl text-orange-500">error_outline</span>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">
                Something unexpected happened
              </h1>
              <p className="text-stone-400 text-sm md:text-base leading-relaxed">
                We've logged this issue and are looking into it. Please try reloading the page.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
              <button
                onClick={() => window.location.reload()}
                className={`${BTN_PRIMARY} w-full py-4 flex items-center justify-center gap-2 touch-manipulation`}
              >
                <span className="material-icons text-sm">refresh</span>
                Try Again
              </button>

              <a
                href="/"
                className={`${BTN_SECONDARY} w-full py-4 flex items-center justify-center gap-2 touch-manipulation no-underline`}
              >
                <span className="material-icons text-sm">dashboard</span>
                Go to Dashboard
              </a>
            </div>

            {/* Debug Details */}
            <div className="pt-6 border-t border-white/5">
              <button
                onClick={() => this.setState(s => ({ showDetails: !s.showDetails }))}
                className="text-xs text-stone-500 hover:text-stone-300 transition-colors uppercase tracking-widest font-bold flex items-center justify-center gap-2 mx-auto"
              >
                {this.state.showDetails ? 'Hide' : 'Show'} Technical Details
                <span className="material-icons text-[10px]">
                  {this.state.showDetails ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {this.state.showDetails && (
                <div className="mt-4 text-left p-4 bg-black/50 rounded-xl overflow-auto max-h-60 border border-white/5">
                  <pre className="text-[10px] text-red-400 font-mono whitespace-pre-wrap">
                    {this.state.error && this.state.error.toString()}
                    <br />
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>

            {/* Support Link */}
            <div className="text-xs text-stone-600">
              Need help? <a href="mailto:support@nanobanna.com" className="text-orange-500 hover:text-orange-400 underline">Report Issue</a>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
