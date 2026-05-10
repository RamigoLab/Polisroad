import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { useProntuario } from '../hooks/useProntuario';
import { useNormativa } from '../hooks/useNormativa';

export const Ricerca = ({ onNavigate }) => {
  const [search, setSearch] = useState('');
  const { list: prontuarioList } = useProntuario();
  const { list: normativaList } = useNormativa();

  const risultatiProntuario = search.length > 2 ? prontuarioList.filter(item => 
    item.titolo.toLowerCase().includes(search.toLowerCase()) || 
    item.descrizione.toLowerCase().includes(search.toLowerCase()) ||
    item.rif_normativo.toLowerCase().includes(search.toLowerCase())
  ) : [];

  const risultatiNormativa = search.length > 2 ? normativaList.filter(item => 
    item.titolo.toLowerCase().includes(search.toLowerCase()) || 
    item.testo.toLowerCase().includes(search.toLowerCase()) ||
    `Art. ${item.articolo}`.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <PageWrapper>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ color: C.primary, marginBottom: '16px' }}>Ricerca Globale</h2>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca in tutto il CdS..." />
        {search.length > 0 && search.length <= 2 && (
          <p style={{ fontSize: '0.8rem', color: C.textLight, textAlign: 'center' }}>Inserisci almeno 3 caratteri per cercare</p>
        )}
      </div>

      {search.length > 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Risultati Prontuario */}
          <div>
            <h3 style={{ color: C.accent, marginBottom: '12px', fontSize: '1.1rem', borderBottom: `2px solid ${C.accentLight}`, paddingBottom: '4px' }}>
              Voci Prontuario ({risultatiProntuario.length})
            </h3>
            {risultatiProntuario.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: C.textLight }}>Nessun risultato nel prontuario.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {risultatiProntuario.slice(0, 5).map(item => (
                  <div key={item.id} onClick={() => onNavigate('prontuario')} style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <Badge style={{ fontSize: '0.65rem' }}>{item.rif_normativo}</Badge>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: C.danger }}>€{item.pmr}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: C.text, fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.titolo}</p>
                  </div>
                ))}
                {risultatiProntuario.length > 5 && (
                  <button onClick={() => onNavigate('prontuario')} style={{ color: C.primary, fontSize: '0.85rem', textAlign: 'center', padding: '8px' }}>Vedi tutti in Prontuario</button>
                )}
              </div>
            )}
          </div>

          {/* Risultati Normativa */}
          <div>
            <h3 style={{ color: C.success, marginBottom: '12px', fontSize: '1.1rem', borderBottom: `2px solid ${C.successLight}`, paddingBottom: '4px' }}>
              Articoli Normativa ({risultatiNormativa.length})
            </h3>
            {risultatiNormativa.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: C.textLight }}>Nessun risultato nella normativa.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {risultatiNormativa.slice(0, 5).map(item => (
                  <div key={item.id} onClick={() => onNavigate('normativa')} style={{ backgroundColor: '#fff', padding: '12px', borderRadius: '8px', cursor: 'pointer' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <Badge type="success" style={{ fontSize: '0.65rem' }}>Art. {item.articolo}</Badge>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: C.text, fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.titolo}</p>
                  </div>
                ))}
                {risultatiNormativa.length > 5 && (
                  <button onClick={() => onNavigate('normativa')} style={{ color: C.success, fontSize: '0.85rem', textAlign: 'center', padding: '8px' }}>Vedi tutti in Normativa</button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
