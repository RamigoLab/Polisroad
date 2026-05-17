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
import { ProntuarioItem } from '../components/ProntuarioItem';
import posthog from 'posthog-js';

export const Prontuario = ({ onNavigate, navigationParams }) => {
  const { list, loading } = useProntuario();
  const { preferiti, toggle } = usePreferiti();
  const { note, save } = useNote();
  const { showToast } = useToast();

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


  const filteredList = list.filter(item =>
    item.titolo.toLowerCase().includes(search.toLowerCase()) ||
    item.rif_normativo.toLowerCase().includes(search.toLowerCase()) ||
    item.codice_violazione.toLowerCase().includes(search.toLowerCase())
  );

  const handleNoteSave = async (id) => {
    try {
      await save(id, tempNote);
      showToast('Nota salvata!', 'success');
      posthog.capture('prontuario_note_saved', { prontuario_id: id });
    } catch (err) {
      showToast('Errore nel salvataggio della nota', 'error');
    }
    setEditNoteId(null);
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    posthog.capture('prontuario_item_selected', { prontuario_id: item.id, titolo: item.titolo });
  };

  if (selectedItem) {
    const isFav = preferiti.includes(selectedItem.id);
    const itemNote = note[selectedItem.id] || '';

    return (
      <PageWrapper style={{ padding: 0 }} hideLogo={true} onNavigate={onNavigate}>
        {/* Header Dettaglio */}
        <div style={PS.prontuarioDetailHeader}>
          <button onClick={() => setSelectedItem(null)} style={{ fontSize: '1.2rem', padding: '4px' }}>⬅️</button>
          <div style={{ flex: 1 }}>
            <div style={PS.prontuarioDetailHeaderMeta}>
              <Badge type="primary">{selectedItem.rif_normativo}</Badge>
              <button onClick={() => toggle(selectedItem.id)} style={{ fontSize: '1.4rem' }}>
                {isFav ? '⭐' : '☆'}
              </button>
            </div>
            <h2 style={{ fontSize: '1.1rem', color: C.text, lineHeight: 1.3 }}>{selectedItem.titolo}</h2>
          </div>
        </div>

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
                <div style={PS.prontuarioSanzioniLabel}>Min / Max</div>
                <div style={S.valueText}>€{selectedItem.edittale_min} / €{selectedItem.edittale_max}</div>
              </div>
              <div style={PS.prontuarioSanzioniCell}>
                <div style={PS.prontuarioSanzioniLabel}>PMR (Diurna)</div>
                <div style={S.valueDanger}>€{selectedItem.pmr}</div>
              </div>
              <div style={PS.prontuarioSanzioniCell}>
                <div style={PS.prontuarioSanzioniLabel}>Scontata 30%</div>
                <div style={S.valueSuccess}>{selectedItem.scontato_30 ? `€${selectedItem.scontato_30}` : 'N.A.'}</div>
              </div>
              <div style={PS.prontuarioSanzioniCell}>
                <div style={PS.prontuarioSanzioniLabel}>Sanzione Notturna</div>
                <div style={{ fontWeight: 'bold', color: selectedItem.sanzione_notturna ? C.danger : C.text }}>
                  {selectedItem.sanzione_notturna
                    ? `€${(parseFloat(selectedItem.pmr) * 1.333333).toFixed(2)}`
                    : 'Non prevista'}
                </div>
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
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper onNavigate={onNavigate}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={S.sectionTitle}>Prontuario</h2>
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
