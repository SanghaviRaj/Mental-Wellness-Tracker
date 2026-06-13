import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
 
interface ErrorBoundaryProps {
  children: ReactNode
}
 
interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}
 
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }
 
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }
 
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, log to error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }
 
  private handleReset = () => {
    this.setState({ hasError: false, error: null })
  }
 
  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0e1a] text-white">
          <div className="card max-w-md w-full text-center space-y-4 border border-[rgba(251,113,133,0.3)] bg-[rgba(251,113,133,0.02)]">
            <span className="text-4xl block select-none">⚠️</span>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Outfit,sans-serif' }}>Something went wrong</h2>
            <p className="text-sm text-[#8892b0] leading-relaxed">
              An unexpected error occurred in this section. Don't worry, your data is safe in local storage.
            </p>
            {this.state.error && (
              <pre className="text-xs p-3 rounded-lg bg-[rgba(0,0,0,0.3)] text-[#fb7185] text-left overflow-auto max-h-40 font-mono">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="btn-primary w-full relative z-10"
              type="button"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }
 
    return this.props.children
  }
}
