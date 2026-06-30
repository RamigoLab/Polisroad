import React from 'react';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';

export class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('SectionErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          margin: '16px',
          padding: '20px',
          backgroundColor: '#fff1f2',
          border: '1px solid #fda4af',
          borderRadius: '16px',
          textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '44px', height: '44px',
            backgroundColor: '#fee2e2',
            borderRadius: '12px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="triangle-alert" size={20} color="#dc2626" strokeWidth={1.75} />
          </div>
          <p style={{ fontSize: '0.88rem', fontWeight: '600', color: '#be123c' }}>
            {this.props.section ? `Errore nel caricamento: ${this.props.section}` : 'Errore nel caricamento di questa sezione'}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onRetry?.();
            }}
            style={{
              padding: '8px 20px', borderRadius: '999px',
              backgroundColor: '#dc2626', color: '#fff',
              border: 'none', fontWeight: '700', fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            Riprova
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
