import React, { useState, useEffect, useMemo } from 'react';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { PS } from '../styles/pages';
import { C } from '../styles/theme';
import { Icon } from '../components/ui/Icon';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';
import { useNote } from '../hooks/useNote';
import { useAuth } from '../hooks/useAuth';
import { useDebounce } from '../hooks/useDebounce';
import { useData } from '../context/DataContext';
import { createProntuarioSearchIndex, MIN_SEARCH_CHARS } from '../utils/searchEngine';

// Componente orologio isolato: si aggiorna ogni secondo senza
// causare re-render dell'intera pagina Operatore.
const Clock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <span>{time.toLocaleTimeString('it-IT')} | {time.toLocaleDateString('it-IT')}</span>
  );
};

export const Operatore = ({ onNavigate }) => {
  const { list } = useProntuario();
  const { preferiti } = usePreferiti();
  const { note } = useNote();
  const { profile } = useAuth();
  const { searchSynonyms = [] } = useData();

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [expandedGroupId, setExpandedGroupId] = useState(null); // id gruppo articolo (es. "grp_6")
  const [expandedItemId, setExpandedItemId] = useState(null);   // id voce prontuario (numerico)

  const isPending = search.trim().length >= MIN_SEARCH_CHARS && search !== debouncedSearch;

  const searchIndex = useMemo(
    () => createProntuarioSearchIndex(list, searchSynonyms),
    [list, searchSynonyms]
  );

  const displayList = useMemo(() => {
    if (debouncedSearch.trim().length === 0) {
      // Senza ricerca: mostra solo i preferiti ordinati
      return {
        mode: 'preferiti',
        items: [...list.filter(item => preferiti.includes(item.id))].sort((a, b) => {
          const nA = parseInt((a.articolo_numero || '').replace(/[^0-9]/g, ''), 10) || 0;
          const nB = parseInt((b.articolo_numero || '').replace(/[^0-9]/g, ''), 10) || 0;
          return nA - nB;
        }),
      };
    }

    if (debouncedSearch.trim().length < MIN_SEARCH_CHARS) {
      return { mode: 'sotto_soglia' };
    }

    const { exact, suggested, other } = searchIndex.search(debouncedSearch, MIN_SEARCH_CHARS);
    return { mode: 'search', exactGroups: exact, suggestedGroups: suggested, otherGroups: other };
  }, [list, debouncedSearch, preferiti, searchIndex]);

  return (
    <div style={PS.operatoreContainer}>
      {/* Header */}
      <div style={PS.operatoreHeader}>
        <div style={PS.operatoreHeaderTop}>
          <span style={{...PS.operatoreHeaderTitle, display:'inline-flex', alignItems:'center', gap:'8px'}}><Icon name="shield-alert" size={18}/> MODALITÀ OPERATORE</span>
          <button onClick={() => onNavigate('home')} style={PS.operatoreExitBtn}>ESCI</button>
        </div>
        <div style={PS.operatoreHeaderMeta}>
          <span>{profile?.grado} {profile?.nome} {profile?.cognome}</span>
          <Clock />
        </div>
      </div>

      <div style={PS.operatoreBody}>
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca violazione o n° articolo..." loading={isPending} />

        {displayList.mode === 'preferiti' && (
          <p style={PS.operatoreFavLabel}>⭐ I TUOI PREFERITI</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Render item card riutilizzabile */}
          {(() => {
            const renderItem = (item) => {
              const isExpanded = expandedItemId === item.id;
              const itemNote = note[item.id];
              return (
                <div key={item.id} style={PS.operatoreItemCard} onClick={(e) => e.stopPropagation()}>
                  <div
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isExpanded}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedItemId(isExpanded ? null : item.id);
                      }
                    }}
                    style={PS.operatoreItemHeader}
                  >
                    <div>
                      <span style={PS.operatoreItemRef}>
                        {item.rif_normativo} (Sanzione: €{item.pmr})
                        {itemNote && <Icon name="file-text" size={13} color={C.accent} style={{ marginLeft: '6px', verticalAlign: 'middle' }} aria-label="Nota presente" />}
                      </span>
                      <span style={PS.operatoreItemTitle}>{item.titolo || item.articolo_nome || (item.descrizione ? (item.descrizione.substring(0, 80) + '...') : 'Voce prontuario')}</span>
                    </div>
                    <span>{isExpanded ? '▲' : '▼'}</span>
                  </div>

                  {isExpanded && (
                    <div style={PS.operatoreDetailPanel}>
                      <div style={PS.operatoreGrid}>
                        <div style={PS.operatoreCell}>
                          <div style={PS.operatoreCellLabel}>Diurna</div>
                          <div style={PS.operatoreCellValue}>€{item.pmr}</div>
                        </div>
                        <div style={PS.operatoreCell}>
                          <div style={PS.operatoreCellLabel}>Scontata</div>
                          <div style={PS.operatoreCellValueGreen}>{item.scontato_30 ? `€${item.scontato_30}` : 'N.A.'}</div>
                        </div>
                        <div style={PS.operatoreCellWide}>
                          <div style={PS.operatoreCellLabel}>Notturna (+33.3%)</div>
                          <div style={{ ...PS.operatoreCellValue, color: item.sanzione_notturna ? '#e74c3c' : '#aaa' }}>
                            {item.sanzione_notturna ? `€${(parseFloat(item.pmr) * 1.333333).toFixed(2)}` : 'Non prevista'}
                          </div>
                        </div>
                      </div>

                      {item.note_comuni && (
                        <div style={PS.operatoreNoteOpBlock}>
                          <span style={PS.operatoreNoteOpLabel}>NORME COMUNI ARTICOLO</span>
                          <span style={PS.operatoreTextSm}>{item.note_comuni}</span>
                        </div>
                      )}

                      <div style={PS.operatoreDescBlock}>
                        <span style={PS.operatoreDescLabel}>DESCRIZIONE VIOLAZIONE</span>
                        <p style={PS.operatoreDescText}>{item.descrizione}</p>
                      </div>

                      <div style={PS.operatoreTagsRow}>
                        {item.punti_patente > 0 && (
                          <div style={PS.operatorePointsBadge}>-{item.punti_patente} PT</div>
                        )}
                        <div style={PS.operatoreAccessoriaTag}>Acc: {item.sanzione_accessoria || 'Nessuna'}</div>
                      </div>

                      {item.note_operative && (
                        <div style={PS.operatoreNoteOpBlock}>
                          <span style={PS.operatoreNoteOpLabel}>NOTE OPERATIVE</span>
                          <span style={PS.operatoreTextSm}>{item.note_operative}</span>
                        </div>
                      )}

                      {itemNote && (
                        <div style={PS.operatoreMemoBlock}>
                          <span style={PS.operatoreMemoLabel}>MEMO</span>
                          <span style={PS.operatoreTextSm}>{itemNote}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            };

            const renderSectionLabel = (label) => (
              <div key={`lbl_${label}`} style={{ padding: '8px 4px 2px', fontSize: '0.72rem', fontWeight: '700', color: '#999', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {label}
              </div>
            );

            const renderGroupHeader = (group) => {
              const isSuggested = !!group.isSuggested;
              const gid = `grp_${group.articolo_numero}_${isSuggested ? 'sug' : 'std'}`;
              return (
                <div
                  key={gid}
                  onClick={() => {
                    setExpandedGroupId(expandedGroupId === gid ? null : gid);
                    setExpandedItemId(null); // chiudi eventuale voce aperta quando si chiude il gruppo
                  }}
                  style={{
                    ...PS.operatoreItemCard,
                    backgroundColor: isSuggested ? `${C.warning}18` : C.accentLight,
                    borderLeft: `4px solid ${isSuggested ? C.warning : C.accent}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                    <div>
                      {isSuggested && (
                        <div style={{ marginBottom: '4px' }}>
                          <Badge type="warning" style={{ fontSize: '0.62rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Icon name="zap" size={11} strokeWidth={2.5} /> Risultato suggerito
                          </Badge>
                        </div>
                      )}
                      <span style={{ fontWeight: '800', color: isSuggested ? C.warning : C.accent, fontSize: '1rem' }}>{group.label}</span>
                      {group.titolo && <span style={{ fontSize: '0.82rem', color: C.text, marginLeft: '8px' }}>{group.titolo}</span>}
                      <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {group.count} {group.count === 1 ? 'voce' : 'voci'}
                        {group.voci.some(v => note[v.id]) && <Icon name="file-text" size={12} color={C.accent} aria-label="Nota presente" />}
                      </div>
                    </div>
                    <span style={{ color: isSuggested ? C.warning : C.accent }}>{expandedGroupId === gid ? '▲' : '▼'}</span>
                  </div>
                  {expandedGroupId === gid && (
                    <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {group.voci.map(renderItem)}
                    </div>
                  )}
                </div>
              );
            };

            if (displayList.mode === 'preferiti') {
              if (displayList.items.length === 0) {
                return (
                  <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>
                    <p>Nessun preferito salvato.</p>
                    <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Vai al Prontuario e aggiungi le voci che usi di più.</p>
                  </div>
                );
              }
              return displayList.items.map(renderItem);
            }

            if (displayList.mode === 'sotto_soglia') {
              return (
                <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>
                  Digita almeno {MIN_SEARCH_CHARS} caratteri per cercare.
                </div>
              );
            }

            // Modalità ricerca
            const { exactGroups, suggestedGroups, otherGroups } = displayList;
            const hasResults = exactGroups.length > 0 || suggestedGroups.length > 0 || otherGroups.length > 0;
            if (!hasResults) {
              return <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>Nessun risultato trovato.</div>;
            }

            return (
              <>
                {suggestedGroups.length > 0 && (
                  <>
                    {renderSectionLabel('Risultato suggerito')}
                    {suggestedGroups.map(renderGroupHeader)}
                  </>
                )}
                {exactGroups.length > 0 && (
                  <>
                    {renderSectionLabel(`Art. ${search.trim()} — corrispondenza esatta`)}
                    {exactGroups.map(renderGroupHeader)}
                  </>
                )}
                {otherGroups.length > 0 && (
                  <>
                    {renderSectionLabel((suggestedGroups.length > 0 || exactGroups.length > 0) ? 'Altri risultati' : 'Risultati')}
                    {otherGroups.map(renderGroupHeader)}
                  </>
                )}
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
