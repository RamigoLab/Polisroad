import React, { useEffect, useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { Icon } from '../components/ui/Icon';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useProntuario } from '../hooks/useProntuario';
import { useNormativa } from '../hooks/useNormativa';
import { useSearch } from '../hooks/useSearch';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { useGamificationContext } from '../context/GamificationContext';
import posthog from 'posthog-js';

const getSnippet = (text, terms) => {
  if (!text) return '';
  const lowerText = text.toLowerCase();
  const firstTerm = terms[0] || '';
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

  // Stato locale per i gruppi espansi nella sezione "altri risultati"
  const [expandedProntuario, setExpandedProntuario] = useState(null);
  const [expandedNormativa, setExpandedNormativa] = useState(null);

  // Chiudi i gruppi espansi quando cambia la ricerca
  useEffect(() => {
    setExpandedProntuario(null);
    setExpandedNormativa(null);
  }, [search]);

  // Salva in cronologia dopo 1.5s di inattività
  useEffect(() => {
    if (search.trim().length >= 3) {
      const timer = setTimeout(async () => {
        await addSearch(search);
        await addXP(10, 'search');
        posthog.capture('search_executed', {
          query_length: search.length,
          query_has_digits: /\d/.test(search),
        });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [search, addSearch, addXP]);

  const hasSearch = search.trim().length > 0;
  const searchTerms = search.trim().toLowerCase().split(/\s+/).filter(Boolean);

  // ─── RENDER HELPERS ───────────────────────────────────────────────────────

  // Card articolo Prontuario (gruppo)
  const renderProntuarioGroup = (group, isExact = false) => {
    const isExpanded = expandedProntuario === group.articolo_numero;
    return (
      <div
        key={`pron_${group.articolo_numero}`}
        style={{
          ...S.card,
          backgroundColor: isExact ? C.accentLight : C.card,
          borderLeft: `4px solid ${isExact ? C.accent : C.border}`,
          padding: '12px 16px',
          cursor: 'pointer',
          marginBottom: 0,
        }}
        onClick={() => setExpandedProntuario(isExpanded ? null : group.articolo_numero)}
      >
        {/* Header gruppo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: '800', color: isExact ? C.accent : C.primary, fontSize: '1rem' }}>
              {group.label}
            </span>
            {group.titolo ? (
              <span style={{ fontSize: '0.82rem', color: C.text, marginLeft: '8px' }}>{group.titolo}</span>
            ) : null}
            <div style={{ fontSize: '0.75rem', color: C.textLight, marginTop: '2px' }}>
              {group.voci.length} {group.voci.length === 1 ? 'voce' : 'voci'}
              {isExact && <span style={{ marginLeft: '6px', color: C.accent, fontWeight: '700' }}>— corrispondenza esatta</span>}
            </div>
          </div>
          <span style={{ color: isExact ? C.accent : C.textLight, marginLeft: '8px' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>

        {/* Voci espanse */}
        {isExpanded && (
          <div onClick={e => e.stopPropagation()} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {group.voci.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigate('prontuario', { selectedId: item.id })}
                style={{ ...PS.ricercaResultItem, margin: 0 }}
              >
                <div style={PS.ricercaResultMeta}>
                  <Badge style={{ fontSize: '0.65rem' }}>{item.rif_normativo}</Badge>
                  <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: C.danger }}>€{item.pmr}</span>
                </div>
                <p style={PS.ricercaResultTitle}>{item.titolo}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Card articolo Normativa (gruppo commi)
  const renderNormativaGroup = (group, isExact = false) => {
    const isExpanded = expandedNormativa === group.articolo_num;
    return (
      <div
        key={`norm_${group.articolo_num}`}
        style={{
          ...S.card,
          backgroundColor: isExact ? `${C.success}18` : C.card,
          borderLeft: `4px solid ${isExact ? C.success : C.border}`,
          padding: '12px 16px',
          cursor: 'pointer',
          marginBottom: 0,
        }}
        onClick={() => setExpandedNormativa(isExpanded ? null : group.articolo_num)}
      >
        {/* Header gruppo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontWeight: '800', color: isExact ? C.success : C.primary, fontSize: '1rem' }}>
              {group.articolo || `Art. ${group.articolo_num}`}
            </span>
            {group.titolo_articolo ? (
              <span style={{ fontSize: '0.82rem', color: C.text, marginLeft: '8px' }}>{group.titolo_articolo}</span>
            ) : null}
            <div style={{ fontSize: '0.75rem', color: C.textLight, marginTop: '2px' }}>
              {group.commi.length} {group.commi.length === 1 ? 'comma' : 'commi'}
              {isExact && <span style={{ marginLeft: '6px', color: C.success, fontWeight: '700' }}>— corrispondenza esatta</span>}
            </div>
          </div>
          <span style={{ color: isExact ? C.success : C.textLight, marginLeft: '8px' }}>
            {isExpanded ? '▲' : '▼'}
          </span>
        </div>

        {/* Commi espansi */}
        {isExpanded && (
          <div onClick={e => e.stopPropagation()} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {group.commi.map(item => (
              <div
                key={item.id}
                onClick={() => onNavigate('normativa', { selectedId: item.id })}
                style={{ ...PS.ricercaResultItem, margin: 0 }}
              >
                <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Badge type="success" style={{ fontSize: '0.65rem' }}>{item.articolo}</Badge>
                  {item.comma && (
                    <span style={{ fontSize: '0.7rem', color: C.textLight, fontWeight: 'bold' }}>
                      Comma {item.comma.replace(/\.$/, '')}
                    </span>
                  )}
                </div>
                <p style={{ ...PS.ricercaResultTitle, marginBottom: '4px' }}>
                  {item.titolo_articolo || item.titolo || 'Articolo Codice della Strada'}
                </p>
                <p style={{ fontSize: '0.75rem', color: C.textLight, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                  "{getSnippet(item.testo, searchTerms)}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Conteggio totale per label sezione
  const pronTot = risultatiProntuario.exact.length + risultatiProntuario.other.length;
  const normTot = risultatiNormativa.exact.length + risultatiNormativa.other.length;

  return (
    <PageWrapper title="Ricerca Globale" subtitle="Cerca in tutta PolisRoad" onNavigate={onNavigate}>
      <div style={{ marginBottom: '20px' }}>
        <SearchBar
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca in tutto PolisRoad..."
        />
        {search.length > 0 && search.length <= 2 && (
          <p style={{ fontSize: '0.8rem', color: C.textLight, textAlign: 'center', marginTop: '8px' }}>
            Inserisci almeno 3 caratteri per cercare
          </p>
        )}
      </div>

      {/* Cronologia ricerche */}
      {!hasSearch && history.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: C.textLight, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Icon name="clock" size={15} /> Ricerche Recenti
            </span>
            <button onClick={clearHistory} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: C.danger }}>
              Cancella tutto
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {history.map((term, index) => (
              <div
                key={index}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  backgroundColor: C.card, border: `1px solid ${C.border}`,
                  borderRadius: '16px', padding: '6px 12px',
                  fontSize: '0.85rem', cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onClick={() => setSearch(term)}
              >
                <span style={{ color: C.text }}>{term}</span>
                <span
                  onClick={e => { e.stopPropagation(); removeSearch(term); }}
                  style={{ fontSize: '0.75rem', color: C.textLight, marginLeft: '4px', fontWeight: 'bold', padding: '2px' }}
                >
                  <Icon name="close" size={14} />
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasSearch && history.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: C.textLight }}>
          <div style={{ marginBottom: '12px' }}><Icon name="search" size={40} /></div>
          <p style={{ fontSize: '0.9rem' }}>Scrivi sopra per cercare simultaneamente nel Prontuario e nella Normativa.</p>
        </div>
      )}

      {/* Risultati */}
      {search.length > 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* ── PRONTUARIO ── */}
          <div>
            <h3 style={PS.ricercaGroupTitle(C.accent)}>
              Voci Prontuario ({pronTot})
            </h3>
            {pronTot === 0 ? (
              <p style={{ fontSize: '0.9rem', color: C.textLight }}>Nessun risultato nel prontuario.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Esatti prima */}
                {risultatiProntuario.exact.map(g => renderProntuarioGroup(g, true))}
                {/* Poi gli altri */}
                {risultatiProntuario.other.length > 0 && (
                  <>
                    {risultatiProntuario.exact.length > 0 && (
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 2px' }}>
                        Anche in altri articoli
                      </div>
                    )}
                    {risultatiProntuario.other.slice(0, 5).map(g => renderProntuarioGroup(g, false))}
                    {risultatiProntuario.other.length > 5 && (
                      <button onClick={() => onNavigate('prontuario')} style={{ color: C.accent, fontSize: '0.85rem', textAlign: 'center', padding: '8px' }}>
                        Vedi tutti ({risultatiProntuario.other.length}) in Prontuario →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* ── NORMATIVA ── */}
          <div>
            <h3 style={PS.ricercaGroupTitle(C.success)}>
              Articoli Normativa ({normTot})
            </h3>
            {normTot === 0 ? (
              <p style={{ fontSize: '0.9rem', color: C.textLight }}>Nessun risultato nella normativa.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Esatti prima */}
                {risultatiNormativa.exact.map(g => renderNormativaGroup(g, true))}
                {/* Poi gli altri */}
                {risultatiNormativa.other.length > 0 && (
                  <>
                    {risultatiNormativa.exact.length > 0 && (
                      <div style={{ fontSize: '0.72rem', fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 2px' }}>
                        Anche in altri articoli
                      </div>
                    )}
                    {risultatiNormativa.other.slice(0, 5).map(g => renderNormativaGroup(g, false))}
                    {risultatiNormativa.other.length > 5 && (
                      <button onClick={() => onNavigate('normativa')} style={{ color: C.success, fontSize: '0.85rem', textAlign: 'center', padding: '8px' }}>
                        Vedi tutti ({risultatiNormativa.other.length}) in Normativa →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

        </div>
      )}
    </PageWrapper>
  );
};
