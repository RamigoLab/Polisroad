import React, { useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useProntuario } from '../hooks/useProntuario';
import { useNormativa } from '../hooks/useNormativa';
import { useSearch } from '../hooks/useSearch';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useGamificationContext } from '../context/GamificationContext';
import posthog from 'posthog-js';

const getSnippet = (text, searchTerms) => {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  const firstTerm = searchTerms[0] || '';
  if (!firstTerm) return text.substring(0, 100) + '...';
  
  const idx = lowerText.indexOf(firstTerm);
  if (idx === -1) return text.substring(0, 100) + '...';
  
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + 80);
  return (start > 0 ? '...' : '') + text.substring(start, end) + '...';
};

export const Ricerca = ({ onNavigate }) => {
  const { list: prontuarioList } = useProntuario();
  const { list: normativaList } = useNormativa();
  const { search, setSearch, risultatiProntuario, risultatiNormativa } = useSearch(prontuarioList, normativaList, 3);
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { addXP } = useGamificationContext();

  // Automatically save queries to search history after a delay
  useEffect(() => {
    if (search.trim().length >= 3) {
      const timer = setTimeout(async () => {
        await addSearch(search);
        await addXP(10, 'search');
        posthog.capture('search_executed', { query: search });
      }, 1500); // 1.5 seconds after user stops typing
      return () => clearTimeout(timer);
    }
  }, [search, addSearch, addXP]);

  const hasSearch = search.trim().length > 0;

  return (
    <PageWrapper title="Ricerca Globale" subtitle="Cerca in tutta PolisRoad" onNavigate={onNavigate}>
      <div style={{ marginBottom: '20px' }}>
        <SearchBar 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Cerca in tutto PolisRoad..." 
        />
        {search.length > 0 && search.length <= 2 && (
          <p style={{ fontSize: '0.8rem', color: C.textLight, textAlign: 'center', marginTop: '8px' }}>
            Inserisci almeno 3 caratteri per cercare
          </p>
        )}
      </div>

      {/* Recent Searches / History Section */}
      {!hasSearch && history.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-text-light)' }}>
              🕒 Ricerche Recenti
            </span>
            <button 
              onClick={clearHistory}
              style={{ fontSize: '0.75rem', fontWeight: 'bold', color: C.danger || '#c0392b' }}
            >
              Cancella tutto
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {history.map((term, index) => (
              <div 
                key={index} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--bg-card)',
                  border: `1px solid var(--color-border)`,
                  borderRadius: '16px',
                  padding: '6px 12px',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'background-color 0.2s',
                }}
                onClick={() => setSearch(term)}
              >
                <span style={{ color: 'var(--color-text)' }}>{term}</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation(); // Avoid triggering search
                    removeSearch(term);
                  }}
                  style={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--color-text-light)', 
                    marginLeft: '4px',
                    fontWeight: 'bold',
                    padding: '2px',
                  }}
                >
                  ✕
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State message when history is empty and no search is entered */}
      {!hasSearch && history.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--color-text-light)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontSize: '0.9rem' }}>Scrivi sopra per cercare simultaneamente nel Prontuario e nella Normativa.</p>
        </div>
      )}

      {search.length > 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Risultati Prontuario */}
          <div>
            <h3 style={PS.ricercaGroupTitle(C.accent)}>
              Voci Prontuario ({risultatiProntuario.length})
            </h3>
            {risultatiProntuario.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: C.textLight }}>Nessun risultato nel prontuario.</p>
            ) : (
              <div style={S.list}>
                {risultatiProntuario.slice(0, 5).map(item => (
                  <div key={item.id} onClick={() => onNavigate('prontuario', { selectedId: item.id })} style={PS.ricercaResultItem}>
                    <div style={PS.ricercaResultMeta}>
                      <Badge style={{ fontSize: '0.65rem' }}>{item.rif_normativo}</Badge>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: C.danger }}>€{item.pmr}</span>
                    </div>
                    <p style={PS.ricercaResultTitle}>{item.titolo}</p>
                  </div>
                ))}
                {risultatiProntuario.length > 5 && (
                  <button onClick={() => onNavigate('prontuario')} style={{ color: C.primary, fontSize: '0.85rem', textAlign: 'center', padding: '8px' }}>
                    Vedi tutti in Prontuario
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Risultati Normativa */}
          <div>
            <h3 style={PS.ricercaGroupTitle(C.success)}>
              Articoli Normativa ({risultatiNormativa.length})
            </h3>
            {risultatiNormativa.length === 0 ? (
              <p style={{ fontSize: '0.9rem', color: C.textLight }}>Nessun risultato nella normativa.</p>
            ) : (
              <div style={S.list}>
                {risultatiNormativa.slice(0, 5).map(item => (
                  <div key={item.id} onClick={() => onNavigate('normativa', { selectedId: item.id })} style={PS.ricercaResultItem}>
                    <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Badge type="success" style={{ fontSize: '0.65rem' }}>{item.articolo}</Badge>
                      {item.comma && <span style={{ fontSize: '0.7rem', color: C.textLight, fontWeight: 'bold' }}>Comma {item.comma.replace(/\.$/, '')}</span>}
                    </div>
                    <p style={PS.ricercaResultTitle}>{item.titolo_articolo || item.titolo || 'Articolo Codice della Strada'}</p>
                    <p style={{ fontSize: '0.75rem', color: C.textLight, marginTop: '6px', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                      "...{getSnippet(item.testo, search.toLowerCase().split(/\s+/).filter(Boolean))}..."
                    </p>
                  </div>
                ))}
                {risultatiNormativa.length > 5 && (
                  <button onClick={() => onNavigate('normativa')} style={{ color: C.success, fontSize: '0.85rem', textAlign: 'center', padding: '8px' }}>
                    Vedi tutti in Normativa
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
};
