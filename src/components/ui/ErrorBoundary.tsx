import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showRetry?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      errorInfo,
    });

    // Log error to console
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Log to external service (in production)
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // reportError(error, errorInfo);
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    // Reset error boundary when resetKeys change
    if (
      this.state.hasError &&
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys?.[index])
    ) {
      this.resetErrorBoundary();
    }
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
  };

  handleRetry = () => {
    const maxRetries = 3;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
    } else {
      // Show different message after max retries
      this.setState({
        hasError: true,
        error: new Error('Maximum retry attempts reached'),
        errorInfo: null,
      });
    }
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="max-w-lg w-full mx-4">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-slate-600 mb-6">
                {this.state.retryCount < 3
                  ? 'An unexpected error occurred. Please try again.'
                  : 'We apologize, but something keeps going wrong. Please refresh the page or contact support.'}
              </p>

              {/* Retry Button */}
              {this.props.showRetry !== false && this.state.retryCount < 3 && (
                <button
                  onClick={this.handleRetry}
                  className="w-full px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors mb-3"
                >
                  Try Again
                </button>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={this.resetErrorBoundary}
                  className="flex-1 px-6 py-3 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Reset
                </button>
                <Link
                  to="/"
                  className="flex-1 px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors text-center"
                >
                  Go Home
                </Link>
              </div>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-slate-500 hover:text-slate-700">
                    Error Details
                  </summary>
                  <pre className="mt-2 p-4 bg-slate-100 rounded-lg text-xs overflow-auto text-red-600">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries
export function PageErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showRetry
      resetKeys={[window.location.pathname]}
      onError={(error, errorInfo) => {
        // Log page errors
        console.error('Page Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ 
  children, 
  fallback 
}: { 
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">
            This component failed to load. Please refresh the page.
          </p>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}

export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      showRetry
      resetKeys={[Date.now()]}
      onError={(error, errorInfo) => {
        // Log async errors
        console.error('Async Error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

// Hook for handling errors in functional components
export function useErrorHandler() {
  return (error: Error) => {
    // You can integrate with an error reporting service here
    console.error('Caught error:', error);
    
    // In development, throw the error to be caught by ErrorBoundary
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  };
}

// Higher-order component for error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
