import React, { useState } from 'react';
import { S } from '../../styles/styles';
import { PS } from '../../styles/pages';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useNormativa } from '../../hooks/useNormativa';

export const AdminNormativa = () => {
  const { list, add, update, remove } = useNormativa();
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({});

  const handleEdit = (item) => { setEditingId(item.id); setFormData(item); };
  const handleNew = () => {
    setEditingId('new');
    setFormData({ articolo: '', comma: '', titolo: '', testo: '' });
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
          <h2 style={S.sectionTitle}>{editingId === 'new' ? 'Nuovo Articolo' : 'Modifica Articolo'}</h2>
          <button onClick={() => setEditingId(null)} style={S.btnCancel}>Annulla</button>
        </div>
        <div style={S.formCard}>
          <TextInput label="Articolo (Numero)" type="number" value={formData.articolo || ''} onChange={e => setFormData({ ...formData, articolo: parseInt(e.target.value) || '' })} />
          <TextInput label="Titolo (Rubrica)" value={formData.titolo || ''} onChange={e => setFormData({ ...formData, titolo: e.target.value })} />
          <TextArea label="Testo Completo" rows={10} value={formData.testo || ''} onChange={e => setFormData({ ...formData, testo: e.target.value })} />
          <button onClick={handleSave} style={S.btnPrimary}>Salva Articolo</button>
        </div>
      </div>
    );
  }

  const filtered = list.filter(i =>
    i.titolo.toLowerCase().includes(search.toLowerCase()) ||
    `Art. ${i.articolo}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione Normativa</h2>
        <button onClick={handleNew} style={S.btnPrimarySmall}>+ Nuovo</button>
      </div>
      <TextInput placeholder="Cerca articolo..." value={search} onChange={e => setSearch(e.target.value)} />
      <div style={{ ...S.list, marginTop: '16px' }}>
        {filtered.map(item => (
          <div key={item.id} style={S.card}>
            <span style={PS.adminItemRefSuccess}>ART. {item.articolo}</span>
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
