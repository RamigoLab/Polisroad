import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '24px',
            backgroundColor: '#0d1117',
            color: '#c9d1d9',
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '4rem',
              marginBottom: '16px',
              animation: 'bounce 2s infinite',
            }}
          >
            🚨
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: '#e74c3c',
            }}
          >
            Si è verificato un errore
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#8b949e',
              maxWidth: '320px',
              lineHeight: '1.5',
              marginBottom: '24px',
            }}
          >
            L'applicazione ha riscontrato un problema inatteso. Puoi provare a ricaricare la pagina.
          </p>
          
          {this.state.error && (
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '8px',
                padding: '12px',
                width: '100%',
                maxWidth: '360px',
                fontSize: '0.8rem',
                color: '#f0f6fc',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                overflowX: 'auto',
                fontFamily: 'monospace',
                marginBottom: '24px',
                maxHeight: '120px',
              }}
            >
              {this.state.error.toString()}
            </div>
          )}

          <button
            onClick={this.handleReload}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1f6feb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(31, 111, 235, 0.3)',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#388bfd')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#1f6feb')}
          >
            🔄 Ricarica PolisRoad
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
