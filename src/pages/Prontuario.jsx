import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
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

export const Prontuario = ({ onNavigate, navigationParams }) => {
  const { list, loading } = useProntuario();
  const { preferiti, toggle } = usePreferiti();
  const { note, save } = useNote();
  const { showToast } = useToast();
  const { addXP } = useGamificationContext();

  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
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

  const filteredList = useMemo(() => {
    const s = debouncedSearch.trim().toLowerCase();
    let result = list;
    if (s.length >= 2) {
      result = list.filter(item =>
        (item.titolo || '').toLowerCase().includes(s) ||
        (item.rif_normativo || '').toLowerCase().includes(s) ||
        (item.codice_violazione || '').toLowerCase().includes(s)
      );
    }
    // Ordina prima per articolo_numero (numerico) e poi per codice_caso/rif_normativo
    return [...result].sort((a, b) => {
      const numA = parseInt(a.articolo_numero, 10) || 0;
      const numB = parseInt(b.articolo_numero, 10) || 0;
      if (numA !== numB) return numA - numB;
      
      const casoA = a.codice_caso || '';
      const casoB = b.codice_caso || '';
      return casoA.localeCompare(casoB, undefined, { numeric: true, sensitivity: 'base' });
    });
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
    if (!isFav) {
      await addXP(15, 'favorite');
    }
  };

  const handleSelectItem = async (item) => {
    setSelectedItem(item);
    await addXP(5, 'article');
    posthog.capture('prontuario_item_selected', { prontuario_id: item.id, titolo: item.titolo });
  };

  const handleRegistraContestazione = async () => {
    await addXP(20, 'contestazione');
    showToast('Contestazione registrata con successo!', 'success');
    posthog.capture('prontuario_contestazione', { prontuario_id: selectedItem?.id });
  };

  if (selectedItem) {
    const isFav = preferiti.includes(selectedItem.id);
    const itemNote = note[selectedItem.id] || '';

    return (
      <PageWrapper
        style={{ padding: 0 }}
        title={selectedItem.titolo || selectedItem.articolo_nome || (selectedItem.descrizione ? (selectedItem.descrizione.substring(0, 80) + '...') : 'Prontuario')}
        subtitle={selectedItem.rif_normativo}
        onNavigate={onNavigate}
        headerLeftAction={<button onClick={() => setSelectedItem(null)} style={{ fontSize: '0.85rem', padding: '6px 8px', color: '#fff' }}>Indietro</button>}
        headerChildren={
          <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
            <button onClick={() => handleToggleFavorite(selectedItem.id)} style={{ fontSize: '1rem', color: '#fff', fontWeight: 'bold' }}>
              {isFav ? 'Preferito' : 'Aggiungi preferito'}
            </button>
          </div>
        }
      >
        <div style={PS.prontuarioDetailBody}>
          {/* Descrizione */}
          <div style={S.card}>
            <h4 style={{ color: C.primary, marginBottom: '8px' }}>Descrizione Violazione</h4>
            <p style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.5 }}>{selectedItem.descrizione}</p>
          </div>

          {/* Sanzioni */}
          <div style={S.card}>
            <h4 style={{ color: C.primary, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Sanzioni</span>
              {selectedItem.punti_patente > 0 && (
                <Badge type="danger">-{selectedItem.punti_patente} Punti</Badge>
              )}
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

          {/* Note Operative e Verbale */}
          <div style={PS.prontuarioNoteBlock}>
            {selectedItem.note_verbale && (
              <div style={S.infoBox}>
                <h4 style={S.infoBoxTitle}>📝 Note al Verbale</h4>
                <p style={{ fontSize: '0.9rem' }}>{selectedItem.note_verbale}</p>
              </div>
            )}
            {selectedItem.note_operative && (
              <div style={S.dangerBox}>
                <h4 style={S.dangerBoxTitle}>🚨 Note Operative</h4>
                <p style={{ fontSize: '0.9rem' }}>{selectedItem.note_operative}</p>
              </div>
            )}
          </div>

          {/* Memo Personale */}
          <div style={PS.prontuarioMemoBlock}>
            <h4 style={PS.prontuarioMemoHeader}>
              <span>💡 Memo Personale</span>
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
          
          {/* Contestazione */}
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <button 
              onClick={handleRegistraContestazione}
              style={{
                ...S.btnPrimary,
                backgroundColor: C.danger,
                padding: '12px 24px',
                fontSize: '1.1rem',
                borderRadius: '12px',
                boxShadow: `0 4px 12px ${C.danger}40`
              }}
            >
              ✍️ Registra Contestazione
            </button>
            <p style={{ fontSize: '0.8rem', color: C.textLight, marginTop: '8px' }}>
              Registra questa contestazione nel tuo profilo per sbloccare traguardi e statistiche.
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Prontuario" subtitle="Archivio operativo" onNavigate={onNavigate}>
      <div style={{ marginBottom: '16px' }}>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca articolo, titolo o codice..." />
      </div>

      {loading ? (
        <div style={S.emptyState}>Caricamento in corso...</div>
      ) : (
        <div style={S.list}>
          {filteredList.map(item => (
            <ProntuarioItem
              key={item.id}
              item={item}
              isFavorite={preferiti.includes(item.id)}
              onClick={() => handleSelectItem(item)}
            />
          ))}
          {filteredList.length === 0 && (
            <div style={S.emptyState}>Nessun risultato trovato.</div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};

