import React, { Component, type ReactNode } from 'react';
import { logger } from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global Error Boundary — catches unhandled React errors
 * and renders a recovery UI instead of a blank screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught:', error.message, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-black flex items-center justify-center font-mono text-center px-6">
          <div className="max-w-md space-y-6">
            <div className="text-red-500 text-6xl font-bold">ERR</div>
            <h1 className="text-white text-xl tracking-widest uppercase">System Fault Detected</h1>
            <p className="text-zinc-500 text-sm">
              {import.meta.env.DEV
                ? this.state.error?.message
                : 'An unexpected error occurred. Please try again.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-2 border border-cyan-500 text-cyan-500 text-xs uppercase tracking-widest hover:bg-cyan-500/10 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="px-6 py-2 border border-zinc-700 text-zinc-400 text-xs uppercase tracking-widest hover:bg-zinc-800 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
