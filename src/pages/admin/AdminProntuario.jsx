import React, { useState, useMemo } from 'react';
import { C } from '../../styles/theme';
import { S } from '../../styles/styles';
import { PS } from '../../styles/pages';
import { Icon } from '../../components/ui/Icon';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useProntuario } from '../../hooks/useProntuario';

// Estrae il numero base dell'articolo (es. "142bis" → 142)
const parseArticoloNum = (str) => parseInt((str || '').replace(/[^0-9]/g, ''), 10) || 0;

// Ordina gli articoli: numero base e poi suffissi
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

// Raggruppa per articolo
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

export const AdminProntuario = () => {
  const { list, add, update, remove } = useProntuario();
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({});
  const [expandedGroupId, setExpandedGroupId] = useState(null); // ID del gruppo articolo espanso (es. "186")

  const handleEdit = (item, e) => {
    if (e) e.stopPropagation();
    setEditingId(item.id);
    setFormData(item);
  };

  const handleNew = () => {
    setEditingId('new');
    setFormData({
      rif_normativo: '', articolo_numero: '', codice_caso: '', codice_violazione: '',
      titolo: '', descrizione: '', pmr: '', scontato_30: '',
      sanzione_notturna_importo: '', sanzione_notturna_scontata: '',
      punti_patente: '', sanzione_accessoria: '', note_verbale: '', note_operative: '', note_comuni: '',
      sanzione_penale: '', aggiornamento: '',
    });
  };

  const handleSave = async () => {
    if (editingId === 'new') await add(formData);
    else await update(editingId, formData);
    setEditingId(null);
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm("Sei sicuro di voler eliminare questa voce dal prontuario?")) {
      await remove(id);
    }
  };

  // Se siamo in modalità compilazione/modifica modulo
  if (editingId) {
    return (
      <div>
        <div style={S.formHeader}>
          <h2 style={S.sectionTitle}>{editingId === 'new' ? 'Nuova Voce Prontuario' : 'Modifica Voce'}</h2>
          <button onClick={() => setEditingId(null)} style={S.btnCancel}>Annulla</button>
        </div>
        <div style={S.formCard}>
          <TextInput label="Riferimento Normativo (es. art. 6, comma 1)" value={formData.rif_normativo || ''} onChange={e => setFormData({ ...formData, rif_normativo: e.target.value })} />
          <TextInput label="Titolo (Breve)" value={formData.titolo || ''} onChange={e => setFormData({ ...formData, titolo: e.target.value })} />
          <TextArea label="Descrizione Violazione (testo verbale)" value={formData.descrizione || ''} onChange={e => setFormData({ ...formData, descrizione: e.target.value })} />

          <div style={PS.adminSanzioniGrid}>
            <TextInput label="PMR Diurna (€)" type="number" value={formData.pmr || ''} onChange={e => setFormData({ ...formData, pmr: e.target.value })} />
            <TextInput label="Scontata 30% (€)" type="number" value={formData.scontato_30 || ''} onChange={e => setFormData({ ...formData, scontato_30: e.target.value })} />
            <TextInput label="PMR Notturna (€)" type="number" value={formData.sanzione_notturna_importo || ''} onChange={e => setFormData({ ...formData, sanzione_notturna_importo: e.target.value })} />
            <TextInput label="Not. Scontata (€)" type="number" value={formData.sanzione_notturna_scontata || ''} onChange={e => setFormData({ ...formData, sanzione_notturna_scontata: e.target.value })} />
            <TextInput label="Punti Patente" type="number" value={formData.punti_patente || ''} onChange={e => setFormData({ ...formData, punti_patente: e.target.value })} />
            <TextInput label="Codice Caso" value={formData.codice_caso || ''} onChange={e => setFormData({ ...formData, codice_caso: e.target.value })} />
            <TextInput label="Codice Violazione" value={formData.codice_violazione || ''} onChange={e => setFormData({ ...formData, codice_violazione: e.target.value })} />
            <TextInput label="N° Articolo" type="text" value={formData.articolo_numero || ''} onChange={e => setFormData({ ...formData, articolo_numero: e.target.value })} />
          </div>

          <TextInput label="Sanzione Accessoria" value={formData.sanzione_accessoria || ''} onChange={e => setFormData({ ...formData, sanzione_accessoria: e.target.value })} />
          <TextArea label="Note Comuni (stesse per tutte le casistiche dell'articolo)" value={formData.note_comuni || ''} onChange={e => setFormData({ ...formData, note_comuni: e.target.value })} />
          <TextArea label="Note al Verbale" value={formData.note_verbale || ''} onChange={e => setFormData({ ...formData, note_verbale: e.target.value })} />
          <TextArea label="Note Operative" value={formData.note_operative || ''} onChange={e => setFormData({ ...formData, note_operative: e.target.value })} />
          <TextInput label="Aggiornamento Legislativo" value={formData.aggiornamento || ''} onChange={e => setFormData({ ...formData, aggiornamento: e.target.value })} />
          <button onClick={handleSave} style={S.btnPrimary}>Salva Voce Prontuario</button>
        </div>
      </div>
    );
  }

  // Filtra la lista grezza prima di raggrupparla
  const filteredRawList = list.filter(i =>
    (i.titolo || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.rif_normativo || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.codice_caso || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.codice_violazione || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.articolo_numero || '').toString().toLowerCase().includes(search.toLowerCase())
  );

  const grouped = groupByArticolo(filteredRawList);

  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione Prontuario ({list.length} voci)</h2>
        <button onClick={handleNew} style={S.btnPrimarySmall}>+ Nuova</button>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <TextInput placeholder="Cerca per n° articolo o parole chiave..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {grouped.map(group => {
          const isExpanded = expandedGroupId === group.articolo_numero;
          return (
            <div
              key={`grp_${group.articolo_numero}`}
              onClick={() => setExpandedGroupId(isExpanded ? null : group.articolo_numero)}
              style={{
                ...S.card,
                backgroundColor: C.accentLight,
                borderLeft: `4px solid ${C.accent}`,
                cursor: 'pointer',
                padding: '12px 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: '800', color: C.accent, fontSize: '1rem' }}>{group.label}</span>
                  {group.titolo && <span style={{ fontSize: '0.82rem', color: C.text, marginLeft: '8px' }}>{group.titolo}</span>}
                  <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: '2px' }}>{group.count} {group.count === 1 ? 'voce' : 'voci'}</div>
                </div>
                <span style={{ color: C.accent }}>{isExpanded ? '▲' : '▼'}</span>
              </div>

              {isExpanded && (
                <div 
                  onClick={(e) => e.stopPropagation()} 
                  style={{ 
                    marginTop: '12px', 
                    padding: '8px 0 0', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px' 
                  }}
                >
                  {group.voci[0]?.note_comuni && (
                    <div style={{ padding: '8px 10px', backgroundColor: C.background, borderRadius: '8px', borderLeft: `3px solid ${C.accent}` }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: '700', color: C.accent, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Note Comuni Articolo</span>
                      <p style={{ fontSize: '0.82rem', color: C.text, marginTop: '4px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{group.voci[0].note_comuni}</p>
                    </div>
                  )}
                  {group.voci.map(item => (
                    <div 
                      key={item.id} 
                      style={{ 
                        ...S.card, 
                        backgroundColor: C.card, 
                        border: `1px solid ${C.border}`,
                        padding: '12px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <span style={{ ...PS.adminItemRef, color: C.primary, fontSize: '0.85rem' }}>
                            {item.rif_normativo} {item.codice_caso ? `[Caso: ${item.codice_caso}]` : ''}
                          </span>
                          <h4 style={{ ...PS.adminItemTitle, fontSize: '0.95rem', marginTop: '2px', marginBottom: '4px' }}>
                            {item.titolo || '(Senza titolo)'}
                          </h4>
                          <span style={{ fontSize: '0.8rem', color: C.textLight }}>
                            PMR: €{item.pmr || 'N.D.'} | Scontato: €{item.scontato_30 || 'N.D.'} | Punti: {item.punti_patente || 0}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={(e) => handleEdit(item, e)} 
                            style={{ ...S.btnAccent, padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Modifica
                          </button>
                          <button 
                            onClick={(e) => handleDelete(item.id, e)} 
                            style={{ ...S.btnDanger, padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {grouped.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            Nessuna voce trovata.
          </div>
        )}
      </div>
    </div>
  );
};
