import React, { useState } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { SearchBar } from '../components/ui/SearchBar';
import { Badge } from '../components/ui/Badge';
import { C } from '../styles/theme';
import { useProntuario } from '../hooks/useProntuario';
import { usePreferiti } from '../hooks/usePreferiti';
import { useNote } from '../hooks/useNote';

export const Prontuario = () => {
  const { list, loading } = useProntuario();
  const { preferiti, toggle } = usePreferiti();
  const { note, save } = useNote();
  
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editNoteId, setEditNoteId] = useState(null);
  const [tempNote, setTempNote] = useState('');

  const filteredList = list.filter(item => 
    item.titolo.toLowerCase().includes(search.toLowerCase()) || 
    item.rif_normativo.toLowerCase().includes(search.toLowerCase()) ||
    item.codice_violazione.toLowerCase().includes(search.toLowerCase())
  );

  const handleNoteSave = (id) => {
    save(id, tempNote);
    setEditNoteId(null);
  };

  if (selectedItem) {
    const isFav = preferiti.includes(selectedItem.id);
    const itemNote = note[selectedItem.id] || '';

    return (
      <PageWrapper style={{ padding: 0 }}>
        {/* Header Dettaglio */}
        <div style={{ backgroundColor: '#fff', padding: '16px', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <button onClick={() => setSelectedItem(null)} style={{ fontSize: '1.2rem', padding: '4px' }}>⬅️</button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <Badge type="primary">{selectedItem.rif_normativo}</Badge>
              <button onClick={() => toggle(selectedItem.id)} style={{ fontSize: '1.4rem' }}>
                {isFav ? '⭐' : '☆'}
              </button>
            </div>
            <h2 style={{ fontSize: '1.1rem', color: C.text, lineHeight: 1.3 }}>{selectedItem.titolo}</h2>
          </div>
        </div>

        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Descrizione */}
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ color: C.primary, marginBottom: '8px' }}>Descrizione Violazione</h4>
            <p style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.5 }}>{selectedItem.descrizione}</p>
          </div>

          {/* Sanzioni */}
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ color: C.primary, marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
              <span>Sanzioni</span>
              {selectedItem.punti_patente > 0 && (
                <Badge type="danger">-{selectedItem.punti_patente} Punti</Badge>
              )}
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
              <div style={{ backgroundColor: C.surface, padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: C.textLight }}>Min / Max</div>
                <div style={{ fontWeight: 'bold' }}>€{selectedItem.edittale_min} / €{selectedItem.edittale_max}</div>
              </div>
              <div style={{ backgroundColor: C.surface, padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: C.textLight }}>PMR (Diurna)</div>
                <div style={{ fontWeight: 'bold', color: C.danger }}>€{selectedItem.pmr}</div>
              </div>
              <div style={{ backgroundColor: C.surface, padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: C.textLight }}>Scontata 30%</div>
                <div style={{ fontWeight: 'bold', color: C.success }}>{selectedItem.scontato_30 ? `€${selectedItem.scontato_30}` : 'N.A.'}</div>
              </div>
              <div style={{ backgroundColor: C.surface, padding: '8px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: C.textLight }}>Maggioraz. Notturna</div>
                <div style={{ fontWeight: 'bold' }}>{selectedItem.sanzione_notturna ? 'Sì (+33%)' : 'No'}</div>
              </div>
            </div>
            
            {selectedItem.sanzione_accessoria && selectedItem.sanzione_accessoria !== 'Nessuna' && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: C.warningLight, borderRadius: '8px', borderLeft: `4px solid ${C.warning}` }}>
                <strong style={{ fontSize: '0.85rem', color: C.warning }}>Sanzione Accessoria:</strong>
                <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>{selectedItem.sanzione_accessoria}</p>
              </div>
            )}
          </div>

          {/* Note Operative e Verbale */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {selectedItem.note_verbale && (
              <div style={{ backgroundColor: C.accentLight, padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${C.accent}` }}>
                <h4 style={{ color: C.accent, marginBottom: '4px' }}>📝 Note al Verbale</h4>
                <p style={{ fontSize: '0.9rem' }}>{selectedItem.note_verbale}</p>
              </div>
            )}
            
            {selectedItem.note_operative && (
              <div style={{ backgroundColor: C.dangerLight, padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${C.danger}` }}>
                <h4 style={{ color: C.danger, marginBottom: '4px' }}>🚨 Note Operative</h4>
                <p style={{ fontSize: '0.9rem' }}>{selectedItem.note_operative}</p>
              </div>
            )}
          </div>

          {/* Memo Personale */}
          <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px' }}>
            <h4 style={{ color: C.primary, marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                  placeholder="Aggiungi una nota personale per questa violazione..."
                />
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button onClick={() => setEditNoteId(null)} style={{ padding: '6px 12px', color: C.textLight }}>Annulla</button>
                  <button onClick={() => handleNoteSave(selectedItem.id)} style={{ padding: '6px 12px', backgroundColor: C.primary, color: '#fff', borderRadius: '6px' }}>Salva</button>
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
    <PageWrapper>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ color: C.primary, marginBottom: '16px' }}>Prontuario</h2>
        <SearchBar value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cerca articolo, titolo o codice..." />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: C.textLight }}>Caricamento in corso...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredList.map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedItem(item)}
              style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Badge>{item.rif_normativo}</Badge>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {item.punti_patente > 0 && <Badge type="danger">-{item.punti_patente} pt</Badge>}
                  {preferiti.includes(item.id) && <span style={{ color: '#f1c40f' }}>⭐</span>}
                </div>
              </div>
              <h3 style={{ fontSize: '1rem', color: C.text, marginBottom: '8px', lineHeight: 1.3 }}>{item.titolo}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: C.textLight }}>
                <span>Cod: {item.codice_violazione}</span>
                <span style={{ fontWeight: 'bold', color: C.danger }}>PMR: €{item.pmr}</span>
              </div>
            </div>
          ))}
          {filteredList.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: C.textLight }}>Nessun risultato trovato.</div>
          )}
        </div>
      )}
    </PageWrapper>
  );
};
