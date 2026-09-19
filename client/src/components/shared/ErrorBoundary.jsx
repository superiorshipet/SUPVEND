import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-2xl bg-danger-50 dark:bg-danger-900/30 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-danger-500" />
            </div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-surface-500 dark:text-surface-400 mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <Button
              onClick={() => window.location.reload()}
              icon={RefreshCw}
              variant="primary"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
