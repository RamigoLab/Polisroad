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
      rif_normativo: '', articolo: '', comma: '', codice_violazione: '', titolo: '',
      descrizione: '', edittale_min: '', edittale_max: '', pmr: '',
      scontato_30: '', sanzione_notturna: false, punti_patente: '', note_operative: '',
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
          <TextInput label="Riferimento Normativo" value={formData.rif_normativo || ''} onChange={e => setFormData({ ...formData, rif_normativo: e.target.value })} />
          <TextInput label="Titolo (Breve)" value={formData.titolo || ''} onChange={e => setFormData({ ...formData, titolo: e.target.value })} />
          <TextArea label="Descrizione Violazione" value={formData.descrizione || ''} onChange={e => setFormData({ ...formData, descrizione: e.target.value })} />

          <div style={PS.adminSanzioniGrid}>
            <TextInput label="Minimo (€)" type="number" value={formData.edittale_min || ''} onChange={e => setFormData({ ...formData, edittale_min: e.target.value })} />
            <TextInput label="Massimo (€)" type="number" value={formData.edittale_max || ''} onChange={e => setFormData({ ...formData, edittale_max: e.target.value })} />
            <TextInput label="PMR (€)" type="number" value={formData.pmr || ''} onChange={e => setFormData({ ...formData, pmr: e.target.value })} />
            <TextInput label="Scontata (€)" type="number" value={formData.scontato_30 || ''} onChange={e => setFormData({ ...formData, scontato_30: e.target.value })} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={S.labelSmall}>Notturna</label>
              <select style={PS.adminSelect} value={formData.sanzione_notturna ? 'true' : 'false'} onChange={e => setFormData({ ...formData, sanzione_notturna: e.target.value === 'true' })}>
                <option value="false">No</option>
                <option value="true">Sì</option>
              </select>
            </div>
            <TextInput label="Punti" type="number" value={formData.punti_patente || ''} onChange={e => setFormData({ ...formData, punti_patente: e.target.value })} />
            <TextInput label="Codice" value={formData.codice_violazione || ''} onChange={e => setFormData({ ...formData, codice_violazione: e.target.value })} />
          </div>

          <TextArea label="Note Operative" value={formData.note_operative || ''} onChange={e => setFormData({ ...formData, note_operative: e.target.value })} />
          <button onClick={handleSave} style={S.btnPrimary}>Salva Voce Prontuario</button>
        </div>
      </div>
    );
  }

  const filtered = list.filter(i =>
    i.titolo.toLowerCase().includes(search.toLowerCase()) ||
    i.rif_normativo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione Prontuario</h2>
        <button onClick={handleNew} style={S.btnPrimarySmall}>+ Nuova</button>
      </div>
      <TextInput placeholder="Cerca voce da modificare..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ ...S.list, marginTop: '16px' }}>
        {filtered.map(item => (
          <div key={item.id} style={S.card}>
            <span style={PS.adminItemRef}>{item.rif_normativo}</span>
            <h3 style={PS.adminItemTitle}>{item.titolo}</h3>
            <div style={PS.adminListItemActions}>
              <button onClick={() => handleEdit(item)} style={S.btnAccent}>Modifica</button>
              <button onClick={() => remove(item.id)} style={S.btnDanger}>Elimina</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
