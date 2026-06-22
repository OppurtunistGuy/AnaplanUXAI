import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Game crashed:', error, errorInfo);
    // TODO: Send to backend in Phase 2
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center max-w-sm">
            <h2 className="text-2xl font-black text-[#1A0B2E] mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-[#4B3B60] mb-4">
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#6C3BFF] text-white rounded-full font-bold"
            >
              Recover Session
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}