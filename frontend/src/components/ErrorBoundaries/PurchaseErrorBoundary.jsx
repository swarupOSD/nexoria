import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class PurchaseErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('PurchaseErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4 my-4">
          <div className="bg-red-500/20 p-3 rounded-full">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h3 className="text-red-400 font-bold text-lg mb-1">Purchase Interface Error</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              We encountered an unexpected error while loading the purchase options. 
              Our team has been notified.
            </p>
          </div>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-sm font-medium border border-slate-700"
          >
            <RefreshCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PurchaseErrorBoundary;
