import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';

export const Preferiti = ({ onNavigate }) => {
  const { list, loading } = useProntuario();
  const { preferiti, toggle } = usePreferiti();
  const preferitiList = list.filter(item => preferiti.includes(item.id));

  const handleToggleFavorite = async (itemId) => {
    const isFav = preferiti.includes(itemId);
    await toggle(itemId);
    if (isFav) {
      // L'utente sta rimuovendo da preferiti: nessuna penalità XP.
    }
  };

  return (
    <PageWrapper title="Preferiti" subtitle="Le voci salvate" meta={`${preferiti.length} preferiti`} onNavigate={onNavigate}>
      {loading ? (
        <div style={S.emptyState}>Caricamento in corso...</div>
      ) : preferitiList.length === 0 ? (
        <div style={S.emptyStateBox}>
          <span style={S.emptyStateIcon}>⭐</span>
          <p>Nessun preferito salvato.</p>
          <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>
            Vai al Prontuario e clicca sulla stella per aggiungere le voci che usi di più.
          </p>
          <button
            onClick={() => onNavigate('prontuario')}
            style={{ ...S.btnPrimarySmall, marginTop: '16px' }}
          >
            Vai al Prontuario
          </button>
        </div>
      ) : (
        <div style={S.list}>
          {preferitiList.map(item => (
            <div key={item.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Badge>{item.rif_normativo}</Badge>
                <button onClick={() => handleToggleFavorite(item.id)} style={{ fontSize: '1.2rem' }}>⭐</button>
              </div>
              <h3 style={{ fontSize: '1rem', color: C.text, marginBottom: '8px', lineHeight: 1.3 }}>{item.titolo}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: C.textLight }}>
                <span>Cod: {item.codice_violazione}</span>
                <span style={S.valueDanger}>PMR: €{item.pmr}</span>
              </div>
              <button
                onClick={() => onNavigate('prontuario')}
                style={{ width: '100%', padding: '8px', marginTop: '12px', backgroundColor: C.accentLight, color: C.accent, borderRadius: '8px', fontWeight: 'bold' }}
              >
                Vedi Dettagli in Prontuario
              </button>
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
};
