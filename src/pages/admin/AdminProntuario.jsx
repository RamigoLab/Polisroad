import React, { useState } from 'react';
import { S } from '../../styles/styles';
import { PS } from '../../styles/pages';

import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useProntuario } from '../../hooks/useProntuario';

export const AdminProntuario = () => {
  const { list, add, update, remove } = useProntuario();
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({});

  const handleEdit = (item) => { setEditingId(item.id); setFormData(item); };
  const handleNew = () => {
    setEditingId('new');
    setFormData({
      rif_normativo: '', articolo_numero: '', codice_caso: '', codice_violazione: '',
      titolo: '', descrizione: '', pmr: '', scontato_30: '',
      sanzione_notturna_importo: '', sanzione_notturna_scontata: '',
      punti_patente: '', sanzione_accessoria: '', note_verbale: '', note_operative: '',
      sanzione_penale: '', aggiornamento: '',
    });
  };
  const handleSave = async () => {
    if (editingId === 'new') await add(formData);
    else await update(editingId, formData);
    setEditingId(null);
  };

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
            <TextInput label="N° Articolo" type="number" value={formData.articolo_numero || ''} onChange={e => setFormData({ ...formData, articolo_numero: e.target.value })} />
          </div>

          <TextInput label="Sanzione Accessoria" value={formData.sanzione_accessoria || ''} onChange={e => setFormData({ ...formData, sanzione_accessoria: e.target.value })} />
          <TextArea label="Note al Verbale" value={formData.note_verbale || ''} onChange={e => setFormData({ ...formData, note_verbale: e.target.value })} />
          <TextArea label="Note Operative" value={formData.note_operative || ''} onChange={e => setFormData({ ...formData, note_operative: e.target.value })} />
          <TextInput label="Aggiornamento Legislativo" value={formData.aggiornamento || ''} onChange={e => setFormData({ ...formData, aggiornamento: e.target.value })} />
          <button onClick={handleSave} style={S.btnPrimary}>Salva Voce Prontuario</button>
        </div>
      </div>
    );
  }

  const filtered = list.filter(i =>
    (i.titolo || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.rif_normativo || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.codice_caso || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.codice_violazione || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione Prontuario ({list.length} voci)</h2>
        <button onClick={handleNew} style={S.btnPrimarySmall}>+ Nuova</button>
      </div>
      <TextInput placeholder="Cerca voce da modificare..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ ...S.list, marginTop: '16px' }}>
        {filtered.map(item => (
          <div key={item.id} style={S.card}>
            <span style={PS.adminItemRef}>{item.rif_normativo} {item.codice_caso ? `[${item.codice_caso}]` : ''}</span>
            <h3 style={PS.adminItemTitle}>{item.titolo || '(senza titolo)'}</h3>
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>
              PMR: €{item.pmr ?? 'N.D.'} | Punti: {item.punti_patente ?? 0}
            </div>
            <div style={PS.adminListItemActions}>
              <button onClick={() => handleEdit(item)} style={S.btnAccent}>Modifica</button>
              <button onClick={() => remove(item.id)} style={S.btnDanger}>Elimina</button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: '#888', padding: '20px' }}>
            {search ? 'Nessuna voce trovata.' : 'Il prontuario è vuoto. Importa il CSV da Supabase.'}
          </div>
        )}
      </div>
    </div>
  );
};
