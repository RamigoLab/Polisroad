import React from 'react';
import posthog from 'posthog-js';
import { PageWrapper } from '../components/layout/PageWrapper';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonList } from '../components/ui/Skeleton';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';
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
    posthog.capture(isFav ? 'preferito_removed' : 'preferito_added', { prontuario_id: itemId });
  };

  return (
    <PageWrapper title="Preferiti" subtitle="Le voci salvate" meta={`${preferiti.length} preferiti`} onNavigate={onNavigate}>
      {loading ? (
        <SkeletonList count={3} />
      ) : preferitiList.length === 0 ? (
        <EmptyState
          icon="star"
          title="Nessun preferito ancora"
          subtitle="Vai al Prontuario e tocca la stella su un articolo per aggiungerlo qui."
          action={{ label: 'Vai al Prontuario', onClick: () => onNavigate('prontuario') }}
        />
      ) : (
        <div style={S.list}>
          {preferitiList.map(item => (
            <div key={item.id} style={S.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Badge>{item.rif_normativo}</Badge>
                {/* UX-02: usa Icon invece di emoji ⭐ */}
                <button
                  onClick={() => handleToggleFavorite(item.id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f0c040', padding: '4px' }}
                  aria-label="Rimuovi dai preferiti"
                  title="Rimuovi dai preferiti"
                >
                  <Icon name="star" size={22} color="#f0c040" />
                </button>
              </div>
              <h3 style={{ fontSize: '1rem', color: C.text, marginBottom: '8px', lineHeight: 1.3 }}>{item.titolo}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: C.textLight }}>
                <span>Cod: {item.codice_violazione}</span>
                <span style={S.valueDanger}>PMR: €{item.pmr}</span>
              </div>
              {/* UX-01: passa selectedId per aprire direttamente la voce */}
              <button
                onClick={() => onNavigate('prontuario', { selectedId: item.id })}
                style={{ width: '100%', padding: '8px', marginTop: '12px', backgroundColor: C.accentLight, color: C.accent, borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
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
