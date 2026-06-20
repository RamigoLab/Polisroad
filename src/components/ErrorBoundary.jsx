import React from 'react';

import { logger } from '../utils/logger';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';
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
    logger.error("ErrorBoundary caught an error", error, errorInfo);
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
            backgroundColor: C.background,
            color: C.text,
            textAlign: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          }}
        >
          <div
            style={{
              marginBottom: '16px',
              color: C.danger,
              animation: 'bounce 2s infinite',
            }}
          >
            <Icon name="octagon-alert" size={56} />
          </div>
          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              marginBottom: '12px',
              color: C.danger,
            }}
          >
            Si è verificato un errore
          </h1>
          <p
            style={{
              fontSize: '0.95rem',
              color: C.textLight,
              maxWidth: '320px',
              lineHeight: '1.5',
              marginBottom: '24px',
            }}
          >
            L'applicazione ha riscontrato un problema inatteso. Puoi provare a ricaricare la pagina.
          </p>
          
          {this.state.error && import.meta.env.DEV && (
            <div
              style={{
                backgroundColor: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: C.radiusSm,
                padding: '12px',
                width: '100%',
                maxWidth: '360px',
                fontSize: '0.8rem',
                color: C.text,
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
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              backgroundColor: C.accent,
              color: '#fff',
              border: 'none',
              borderRadius: C.radiusPill,
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-md)',
              transition: 'filter 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseOut={(e) => (e.currentTarget.style.filter = 'none')}
          >
            <Icon name="rotate-cw" size={18} /> Ricarica PolisRoad
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
