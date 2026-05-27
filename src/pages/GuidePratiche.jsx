import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { S } from '../styles/styles';
import { C } from '../styles/theme';

export const GuidePratiche = ({ onNavigate }) => {
  return (
    <PageWrapper
      title="Guide Pratiche"
      subtitle="Approfondimenti operativi"
      onNavigate={onNavigate}
    >
      <div style={{
        backgroundColor: C.warningLight,
        padding: '24px',
        borderRadius: '16px',
        border: `1px solid ${C.warning}`,
        textAlign: 'center',
        marginTop: '20px'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🚧</div>
        <h3 style={{ color: C.warning, marginBottom: '8px' }}>Work in progress</h3>
        <p style={{ color: C.text, lineHeight: '1.5' }}>
          Stiamo lavorando a questa sezione. Presto troverai guide operative su:
        </p>
        <ul style={{ 
          textAlign: 'left', 
          maxWidth: '300px', 
          margin: '16px auto',
          color: C.textLight,
          lineHeight: '1.8'
        }}>
          <li>Leggi e contestazioni sui monopattini</li>
          <li>Controlli su trasporto merci</li>
          <li>Falsi documentali</li>
          <li>Guida in stato d'ebbrezza (Art. 186)</li>
        </ul>
      </div>
    </PageWrapper>
  );
};
