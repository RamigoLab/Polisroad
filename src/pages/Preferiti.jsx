import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';

export const Preferiti = ({ onNavigate }) => {
  const { list, loading } = useProntuario();
  const { preferiti, toggle } = usePreferiti();
  
  const preferitiList = list.filter(item => preferiti.includes(item.id));

  return (
    <PageWrapper>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: C.primary }}>Preferiti</h2>
        <Badge type="warning">⭐ {preferiti.length}</Badge>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: C.textLight }}>Caricamento in corso...</div>
      ) : preferitiList.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: C.textLight, backgroundColor: '#fff', borderRadius: '12px', border: `2px dashed ${C.border}` }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>⭐</span>
          <p>Nessun preferito salvato.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Vai al Prontuario e clicca sulla stella per aggiungere le voci che usi di più.</p>
          <button 
            onClick={() => onNavigate('prontuario')}
            style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: C.primary, color: '#fff', borderRadius: '8px' }}>
            Vai al Prontuario
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {preferitiList.map(item => (
            <div 
              key={item.id} 
              style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Badge>{item.rif_normativo}</Badge>
                <button onClick={() => toggle(item.id)} style={{ fontSize: '1.2rem' }}>⭐</button>
              </div>
              <h3 style={{ fontSize: '1rem', color: C.text, marginBottom: '8px', lineHeight: 1.3 }}>{item.titolo}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: C.textLight }}>
                <span>Cod: {item.codice_violazione}</span>
                <span style={{ fontWeight: 'bold', color: C.danger }}>PMR: €{item.pmr}</span>
              </div>
              {/* Bottone per vedere dettagli reindirizzando a prontuario, semplificato per ora */}
              <button 
                onClick={() => onNavigate('prontuario')} 
                style={{ width: '100%', padding: '8px', marginTop: '12px', backgroundColor: C.accentLight, color: C.accent, borderRadius: '8px', fontWeight: 'bold' }}>
                Vedi Dettagli in Prontuario
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};
