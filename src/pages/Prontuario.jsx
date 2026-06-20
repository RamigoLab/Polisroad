import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { Icon } from '../components/ui/Icon';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';
import { useNote } from '../hooks/useNote';
import { useToast } from '../components/ui/ToastManager';
import { useGamificationContext } from '../context/GamificationContext';
import { ProntuarioItem } from '../components/ProntuarioItem';
import posthog from 'posthog-js';
import { useDebounce } from '../hooks/useDebounce';

// Estrae il numero base dell'articolo (es. "142bis" → 142, "186" → 186)
const parseArticoloNum = (str) => parseInt((str || '').replace(/[^0-9]/g, ''), 10) || 0;

// Ordina articoli: prima per numero, poi bis < ter < quater < quinquies < altro
const sortSuffix = (str) => {
  const s = (str || '').replace(/[0-9]/g, '').toLowerCase();
  const order = { '': 0, 'bis': 1, 'ter': 2, 'quater': 3, 'quinquies': 4 };
  return order[s] ?? 99;
};

const sortItems = (items) =>
  [...items].sort((a, b) => {
    const nA = parseArticoloNum(a.articolo_numero);
    const nB = parseArticoloNum(b.articolo_numero);
    if (nA !== nB) return nA - nB;
    const sA = sortSuffix(a.articolo_numero);
    const sB = sortSuffix(b.articolo_numero);
    if (sA !== sB) return sA - sB;
    return (a.codice_caso || '').localeCompare(b.codice_caso || '', undefined, { numeric: true });
  });

// Raggruppa per articolo_numero (es. "142", "142bis")
const groupByArticolo = (items) => {
  const map = new Map();
  sortItems(items).forEach(item => {
    const key = (item.articolo_numero || 'N.D.').trim();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  });
  return Array.from(map.entries()).map(([articolo_numero, voci]) => ({
    articolo_numero,
    label: `Art. ${articolo_numero}`,
    titolo: voci[0]?.articolo_nome || voci[0]?.titolo || '',
    count: voci.length,
    voci,
  }));
};

// Ricerca intelligente:
// 1. Corrispondenza esatta su articolo_numero → priorità massima
// 2. rif_normativo che INIZIA con "art. <query>" → priorità alta
// 3. Testo libero → priorità bassa
const smartSearch = (list, raw) => {
  const s = raw.trim().toLowerCase();
  if (s.length < 2) return { exact: [], partial: [], text: [] };

  const isNumeric = /^\d+$/.test(s);

  const exact = [];
  const partial = [];
  const text = [];

  list.forEach(item => {
    const artNum = (item.articolo_numero || '').toLowerCase();
    const rifNorm = (item.rif_normativo || '').toLowerCase();
    const titolo = (item.titolo || '').toLowerCase();
    const codice = (item.codice_violazione || '').toLowerCase();

    if (isNumeric) {
      // Corrispondenza esatta sul numero articolo (es. "142" === "142")
      if (artNum === s) {
        exact.push(item);
      // rif_normativo che inizia con "art. 142"
      } else if (rifNorm.startsWith(`art. ${s}`) || rifNorm.startsWith(`art.${s}`)) {
        partial.push(item);
      } else if (titolo.includes(s) || rifNorm.includes(s) || codice.includes(s)) {
        text.push(item);
      }
    } else {
      // Ricerca testuale normale
      if (titolo.includes(s) || rifNorm.includes(s) || codice.includes(s)) {
        text.push(item);
      }
    }
  });

  return { exact, partial, text };
};

export const Prontuario = ({ onNavigate, navigationParams }) => {
  const { list, loading } = useProntuario();
  const { preferiti, toggle } = usePreferiti();
  const { note, save } = useNote();
  const { showToast } = useToast();
  const { addXP } = useGamificationContext();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null); // gruppo articolo espanso
  const [editNoteId, setEditNoteId] = useState(null);
  const [tempNote, setTempNote] = useState('');

  useEffect(() => {
    if (navigationParams?.selectedId && list.length > 0) {
      const item = list.find(i => i.id === navigationParams.selectedId);
      if (item) {
        setSelectedItem(item);
        onNavigate('prontuario', null);
      }
    }
  }, [navigationParams, list, onNavigate]);

  const debouncedSearch = useDebounce(search, 300);

  // Gruppi per vista senza ricerca
  const groups = useMemo(() => groupByArticolo(list), [list]);

  // Vista con ricerca attiva: risultati ordinati per priorità
  const searchResults = useMemo(() => {
    if (debouncedSearch.trim().length < 2) return null;
    const { exact, partial, text } = smartSearch(list, debouncedSearch);
    // Raggruppa i risultati esatti per articolo (mostrati come gruppi cliccabili)
    const exactGroups = groupByArticolo(exact);
    return { exactGroups, partial: sortItems(partial), text: sortItems(text) };
  }, [list, debouncedSearch]);

  const handleNoteSave = async (id) => {
    try {
      await save(id, tempNote);
      showToast('Nota salvata!', 'success');
      posthog.capture('prontuario_note_saved', { prontuario_id: id });
    } catch {
      showToast('Errore nel salvataggio della nota', 'error');
    }
    setEditNoteId(null);
  };

  const handleToggleFavorite = async (itemId) => {
    const isFav = preferiti.includes(itemId);
    await toggle(itemId);
    if (!isFav) await addXP(15, 'favorite');
  };

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    await addXP(5, 'article');
    posthog.capture('prontuario_item_selected', { prontuario_id: item.id });
  };

  const handleRegistraContestazione = async () => {
    await addXP(20, 'contestazione');
    showToast('Contestazione registrata con successo!', 'success');
    posthog.capture('prontuario_contestazione', { prontuario_id: selectedItem?.id });
  };

  const backBtnStyle = {
    fontSize: '0.85rem', padding: '6px 12px', color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)', border: 'none',
    borderRadius: '8px', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold',
  };

  // ── VISTA DETTAGLIO VOCE ──────────────────────────────────────────────────
  if (selectedItem) {
    const isFav = preferiti.includes(selectedItem.id);
    const itemNote = note[selectedItem.id] || '';

    return (
      <PageWrapper
        style={{ padding: 0 }}
        title={selectedItem.titolo || selectedItem.articolo_nome || 'Prontuario'}
        subtitle={selectedItem.rif_normativo}
        onNavigate={onNavigate}
        headerLeftAction={
          <button onClick={() => setSelectedItem(null)} style={backBtnStyle}>← Indietro</button>
        }
        headerChildren={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button onClick={() => handleToggleFavorite(selectedItem.id)} style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold' }}>
              {isFav ? 'Preferito' : 'Aggiungi preferito'}
            </button>
          </div>
        }
      >
        <div style={PS.prontuarioDetailBody}>
          <div style={S.card}>
            <h4 style={{ color: C.primary, marginBottom: '8px' }}>Descrizione Violazione</h4>
            <p style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.5 }}>{selectedItem.descrizione}</p>
          </div>

          <div style={S.card}>
            <h4 style={{ color: C.primary, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Sanzioni</span>
              {selectedItem.punti_patente > 0 && <Badge type="danger">-{selectedItem.punti_patente} Punti</Badge>}
            </h4>
            <div style={PS.prontuarioSanzioniGrid}>
              <div style={PS.prontuarioSanzioniCell}>
                <div style={PS.prontuarioSanzioniLabel}>PMR (Diurna)</div>
                <div style={S.valueDanger}>€{selectedItem.pmr ?? 'N.D.'}</div>
              </div>
              <div style={PS.prontuarioSanzioniCell}>
                <div style={PS.prontuarioSanzioniLabel}>Scontata 30%</div>
                <div style={S.valueSuccess}>{selectedItem.scontato_30 ? `€${selectedItem.scontato_30}` : 'N.A.'}</div>
              </div>
              <div style={PS.prontuarioSanzioniCell}>
                <div style={PS.prontuarioSanzioniLabel}>Sanzione Notturna</div>
                <div style={{ fontWeight: 'bold', color: selectedItem.sanzione_notturna ? C.danger : C.text }}>
                  {selectedItem.sanzione_notturna_importo
                    ? `€${selectedItem.sanzione_notturna_importo}`
                    : selectedItem.sanzione_notturna
                      ? `€${(parseFloat(selectedItem.pmr) * 1.333333).toFixed(2)}`
                      : 'Non prevista'}
                </div>
              </div>
              <div style={PS.prontuarioSanzioniCell}>
                <div style={PS.prontuarioSanzioniLabel}>Not. Scontata</div>
                <div style={S.valueSuccess}>{selectedItem.sanzione_notturna_scontata ? `€${selectedItem.sanzione_notturna_scontata}` : 'N.A.'}</div>
              </div>
            </div>
            {selectedItem.sanzione_accessoria && selectedItem.sanzione_accessoria !== 'Nessuna' && (
              <div style={S.warningBox}>
                <strong style={{ fontSize: '0.85rem', color: C.warning }}>Sanzione Accessoria:</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>{selectedItem.sanzione_accessoria}</p>
              </div>
            )}
          </div>

          <div style={PS.prontuarioNoteBlock}>
            {selectedItem.note_verbale && (
              <div style={S.infoBox}>
                <h4 style={{ ...S.infoBoxTitle, display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="file-text" size={16} /> Note al Verbale</h4>
                <p style={{ fontSize: '0.9rem' }}>{selectedItem.note_verbale}</p>
              </div>
            )}
            {selectedItem.note_operative && (
              <div style={S.dangerBox}>
                <h4 style={{ ...S.dangerBoxTitle, display: 'flex', alignItems: 'center', gap: '6px' }}><Icon name="shield-alert" size={16} /> Note Operative</h4>
                <p style={{ fontSize: '0.9rem' }}>{selectedItem.note_operative}</p>
              </div>
            )}
          </div>

          <div style={PS.prontuarioMemoBlock}>
            <h4 style={PS.prontuarioMemoHeader}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Icon name="lightbulb" size={15} /> Memo Personale</span>
              {editNoteId !== selectedItem.id && (
                <button onClick={() => { setEditNoteId(selectedItem.id); setTempNote(itemNote); }} style={{ fontSize: '0.8rem', color: C.accent }}>Modifica</button>
              )}
            </h4>
            {editNoteId === selectedItem.id ? (
              <div>
                <textarea
                  value={tempNote}
                  onChange={(e) => setTempNote(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${C.border}`, minHeight: '80px', marginBottom: '8px', fontFamily: 'inherit' }}
                  placeholder="Aggiungi una nota personale..."
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditNoteId(null)} style={S.btnCancel}>Annulla</button>
                  <button onClick={() => handleNoteSave(selectedItem.id)} style={S.btnPrimarySmall}>Salva</button>
                </div>
              </div>
            ) : (
              <p style={{ fontSize: '0.9rem', color: itemNote ? C.text : C.textLight, whiteSpace: 'pre-wrap' }}>
                {itemNote || 'Nessuna nota salvata. Clicca su Modifica per aggiungerne una.'}
              </p>
            )}
          </div>

          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button
              onClick={handleRegistraContestazione}
              style={{ ...S.btnPrimary, backgroundColor: C.danger, padding: '12px 24px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: `0 4px 12px ${C.danger}40` }}
            >
              <Icon name="pen-line" size={16} /> Registra Contestazione
            </button>
            <p style={{ fontSize: '0.8rem', color: C.textLight, marginTop: '8px' }}>
              Registra questa contestazione nel tuo profilo per sbloccare traguardi e statistiche.
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // ── VISTA GRUPPO (voci di un articolo) ───────────────────────────────────
  if (selectedGroup) {
    return (
      <PageWrapper
        title={selectedGroup.label}
        subtitle={selectedGroup.titolo}
        onNavigate={onNavigate}
        headerLeftAction={<button onClick={() => setSelectedGroup(null)} style={backBtnStyle}>← Indietro</button>}
      >
        <div style={S.list}>
          {selectedGroup.voci.map(item => (
            <ProntuarioItem
              key={item.id}
              item={item}
              isFavorite={preferiti.includes(item.id)}
              onClick={() => handleSelectItem(item)}
            />
          ))}
        </div>
      </PageWrapper>
    );
  }

  // ── VISTA PRINCIPALE (lista gruppi o risultati ricerca) ──────────────────
  const renderGroupRow = (group) => (
    <div key={group.articolo_numero} onClick={() => setSelectedGroup(group)} style={{ ...S.cardClickable, display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        minWidth: '56px', height: '56px', borderRadius: '12px',
        backgroundColor: C.accentLight, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '0.6rem', color: C.accent, fontWeight: '700', textTransform: 'uppercase' }}>Art.</span>
        <span style={{ fontSize: '1rem', color: C.accent, fontWeight: '800', lineHeight: 1 }}>{group.articolo_numero}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.3, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {group.titolo || `Articolo ${group.articolo_numero}`}
        </h3>
        <span style={{ fontSize: '0.8rem', color: C.textLight }}>{group.count} {group.count === 1 ? 'voce' : 'voci'}</span>
      </div>
      <span style={{ color: C.textLight }}>›</span>
    </div>
  );

  const renderSectionHeader = (label) => (
    <div style={{ padding: '8px 4px 4px', fontSize: '0.75rem', fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
      {label}
    </div>
  );

  let content;
  if (loading) {
    content = <div style={S.emptyState}>Caricamento in corso...</div>;
  } else if (searchResults) {
    const { exactGroups, partial, text } = searchResults;
    const hasResults = exactGroups.length > 0 || partial.length > 0 || text.length > 0;

    if (!hasResults) {
      content = <div style={S.emptyState}>Nessun risultato trovato.</div>;
    } else {
      content = (
        <div style={S.list}>
          {exactGroups.length > 0 && (
            <>
              {renderSectionHeader(`Articolo ${debouncedSearch.trim()} (corrispondenza esatta)`)}
              {exactGroups.map(renderGroupRow)}
            </>
          )}
          {partial.length > 0 && (
            <>
              {renderSectionHeader('Voci correlate')}
              {partial.map(item => (
                <ProntuarioItem key={item.id} item={item} isFavorite={preferiti.includes(item.id)} onClick={() => handleSelectItem(item)} />
              ))}
            </>
          )}
          {text.length > 0 && (
            <>
              {renderSectionHeader('Altri risultati')}
              {text.map(item => (
                <ProntuarioItem key={item.id} item={item} isFavorite={preferiti.includes(item.id)} onClick={() => handleSelectItem(item)} />
              ))}
            </>
          )}
        </div>
      );
    }
  } else {
    content = (
      <div style={S.list}>
        {groups.map(renderGroupRow)}
      </div>
    );
  }

  return (
    <PageWrapper title="Prontuario" subtitle="Archivio operativo" onNavigate={onNavigate}>
      <div style={{ marginBottom: '16px' }}>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca articolo, titolo o codice..." />
      </div>
      {content}
    </PageWrapper>
  );
};
