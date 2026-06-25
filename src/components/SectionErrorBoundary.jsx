/**
 * SectionErrorBoundary.jsx
 * Error boundary granulare per sezione (Prontuario, Normativa, News…).
 * Se una sezione crasha, le altre restano funzionanti.
 * Il bottone "Riprova" invalida la cache React Query di quella sezione
 * tramite la callback onRetry passata dall'esterno.
 */
import React from 'react';
import { logger } from '../utils/logger';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';

export class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleRetry = this.handleRetry.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    logger.error(`[SectionErrorBoundary:${this.props.section}]`, error, info);
  }

  handleRetry() {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { section = 'questa sezione', label = 'Riprova' } = this.props;

    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
        gap: '12px',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          backgroundColor: `${C.danger}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: '4px',
        }}>
          <Icon name="octagon-alert" size={32} color={C.danger} />
        </div>
        <p style={{ fontWeight: '700', fontSize: '1rem', color: C.text, margin: 0 }}>
          {section} non disponibile
        </p>
        <p style={{ fontSize: '0.85rem', color: C.textLight, margin: 0, maxWidth: '260px', lineHeight: 1.5 }}>
          Si è verificato un errore inatteso. Le altre sezioni dell'app funzionano normalmente.
        </p>
        {import.meta.env.DEV && this.state.error && (
          <pre style={{
            fontSize: '0.7rem', color: C.textLight, background: C.surfaceContainer,
            padding: '8px', borderRadius: '8px', maxWidth: '300px',
            overflowX: 'auto', textAlign: 'left', marginTop: '4px',
          }}>
            {this.state.error.toString()}
          </pre>
        )}
        <button
          onClick={this.handleRetry}
          style={{
            marginTop: '8px', padding: '10px 20px',
            backgroundColor: C.accent, color: '#fff',
            border: 'none', borderRadius: '10px',
            fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          <Icon name="rotate-cw" size={15} color="#fff" />
          {label}
        </button>
      </div>
    );
  }
}
