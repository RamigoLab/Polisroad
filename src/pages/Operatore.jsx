import React, { useState, useEffect, useMemo } from 'react';
import { SearchBar } from '../components/ui/SearchBar';
import { PS } from '../styles/pages';
import { C } from '../styles/theme';
import { Icon } from '../components/ui/Icon';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';
import { useNote } from '../hooks/useNote';
import { useAuth } from '../hooks/useAuth';
import { useGamificationContext } from '../context/GamificationContext';
import { useToast } from '../components/ui/ToastManager';

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

  const { addXP } = useGamificationContext();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [expandedGroupId, setExpandedGroupId] = useState(null); // id gruppo articolo (es. "grp_6")
  const [expandedItemId, setExpandedItemId] = useState(null);   // id voce prontuario (numerico)
  const [registering, setRegistering] = useState(false);

  const handleRegistraContestazione = async (item) => {
    setRegistering(true);
    await addXP(20, 'contestazione');
    showToast(`Contestazione registrata: ${item.rif_normativo}`, 'success');
    setRegistering(false);
  };

  const displayList = useMemo(() => {
    if (search.trim().length === 0) {
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

    const s = search.trim().toLowerCase();
    const isNumeric = /^\d+$/.test(s);
    const exact = [], partial = [], text = [];

    list.forEach(item => {
      const artNum = (item.articolo_numero || '').toLowerCase();
      const rifNorm = (item.rif_normativo || '').toLowerCase();
      const titolo = (item.titolo || '').toLowerCase();

      if (isNumeric) {
        if (artNum === s) exact.push(item);
        else if (rifNorm.startsWith(`art. ${s}`) || rifNorm.startsWith(`art.${s}`)) partial.push(item);
        else if (titolo.includes(s) || rifNorm.includes(s)) text.push(item);
      } else {
        if (titolo.includes(s) || rifNorm.includes(s)) text.push(item);
      }
    });

    // Raggruppa i risultati esatti per articolo
    const sortFn = (a, b) => {
      const nA = parseInt((a.articolo_numero || '').replace(/[^0-9]/g, ''), 10) || 0;
      const nB = parseInt((b.articolo_numero || '').replace(/[^0-9]/g, ''), 10) || 0;
      return nA - nB;
    };

    const exactMap = new Map();
    exact.sort(sortFn).forEach(item => {
      const key = (item.articolo_numero || 'N.D.').trim();
      if (!exactMap.has(key)) exactMap.set(key, []);
      exactMap.get(key).push(item);
    });
    const exactGroups = Array.from(exactMap.entries()).map(([num, voci]) => ({
      articolo_numero: num,
      label: `Art. ${num}`,
      titolo: voci[0]?.articolo_nome || voci[0]?.titolo || '',
      count: voci.length,
      voci,
    }));

    return {
      mode: 'search',
      exactGroups,
      partial: partial.sort(sortFn),
      text: text.sort(sortFn),
    };
  }, [list, search, preferiti]);

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
        <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca violazione o n° articolo..." />

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
                  <div onClick={() => setExpandedItemId(isExpanded ? null : item.id)} style={PS.operatoreItemHeader}>
                    <div>
                      <span style={PS.operatoreItemRef}>{item.rif_normativo} (Sanzione: €{item.pmr})</span>
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

                      <button
                        onClick={() => handleRegistraContestazione(item)}
                        disabled={registering}
                        style={{
                          marginTop: '12px', width: '100%', padding: '12px',
                          backgroundColor: C.danger, color: '#fff', border: 'none',
                          borderRadius: '10px', fontWeight: 'bold', fontSize: '0.95rem',
                          cursor: registering ? 'not-allowed' : 'pointer',
                          opacity: registering ? 0.7 : 1,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          gap: '8px', boxShadow: `0 4px 12px ${C.danger}40`
                        }}
                      >
                        {registering ? 'Registrazione...' : <><Icon name="pen-line" size={16} /> Registra Contestazione</>}
                      </button>
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

            const renderGroupHeader = (group) => (
              <div
                key={`grp_${group.articolo_numero}`}
                onClick={() => {
                  const gid = `grp_${group.articolo_numero}`;
                  setExpandedGroupId(expandedGroupId === gid ? null : gid);
                  setExpandedItemId(null); // chiudi eventuale voce aperta quando si chiude il gruppo
                }}
                style={{ ...PS.operatoreItemCard, backgroundColor: C.accentLight, borderLeft: `4px solid ${C.accent}`, cursor: 'pointer' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
                  <div>
                    <span style={{ fontWeight: '800', color: C.accent, fontSize: '1rem' }}>{group.label}</span>
                    {group.titolo && <span style={{ fontSize: '0.82rem', color: C.text, marginLeft: '8px' }}>{group.titolo}</span>}
                    <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: '2px' }}>{group.count} {group.count === 1 ? 'voce' : 'voci'}</div>
                  </div>
                  <span style={{ color: C.accent }}>{expandedGroupId === `grp_${group.articolo_numero}` ? '▲' : '▼'}</span>
                </div>
                {expandedGroupId === `grp_${group.articolo_numero}` && (
                  <div style={{ padding: '0 8px 8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {group.voci.map(renderItem)}
                  </div>
                )}
              </div>
            );

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

            // Modalità ricerca
            const { exactGroups, partial, text } = displayList;
            const hasResults = exactGroups.length > 0 || partial.length > 0 || text.length > 0;
            if (!hasResults) {
              return <div style={{ textAlign: 'center', padding: '40px 16px', color: '#999' }}>Nessun risultato trovato.</div>;
            }

            return (
              <>
                {exactGroups.length > 0 && (
                  <>
                    {renderSectionLabel(`Art. ${search.trim()} — corrispondenza esatta`)}
                    {exactGroups.map(renderGroupHeader)}
                  </>
                )}
                {partial.length > 0 && (
                  <>
                    {renderSectionLabel('Voci correlate')}
                    {partial.map(renderItem)}
                  </>
                )}
                {text.length > 0 && (
                  <>
                    {renderSectionLabel('Altri risultati')}
                    {text.map(renderItem)}
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
