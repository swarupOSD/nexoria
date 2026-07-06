import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    
    // Check if it's a chunk loading error from Vite/Vercel
    const errorStr = error?.toString() || '';
    if (
      errorStr.includes('Failed to fetch dynamically imported module') ||
      errorStr.includes('ChunkLoadError') ||
      errorStr.includes('Importing a module script failed') ||
      errorStr.includes('Load failed') ||
      errorStr.includes('Unexpected token')
    ) {
      console.log('Chunk load error detected, forcing reload to get latest assets...');
      window.location.reload(true);
      return;
    }

    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: 'red', backgroundColor: '#0f0f0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#ff4444' }}>Oops! App Update Detected</h2>
          <p style={{ color: '#ccc', marginBottom: '2rem', maxWidth: '500px' }}>
            We just pushed a new update to Nexoria! Please tap the button below to load the latest version.
          </p>
          <button 
            onClick={() => window.location.reload(true)}
            style={{ padding: '1rem 2rem', fontSize: '1.2rem', fontWeight: 'bold', color: 'white', backgroundColor: '#8b5cf6', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)' }}
          >
            Refresh App
          </button>
          <details style={{ marginTop: '3rem', whiteSpace: 'pre-wrap', textAlign: 'left', color: '#666', fontSize: '0.8rem', maxWidth: '800px', overflowX: 'auto' }}>
            <summary style={{ cursor: 'pointer', marginBottom: '1rem' }}>Technical Details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
