import React, { useState } from 'react';
import { C } from '../../styles/theme';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useNormativa } from '../../hooks/useNormativa';

export const AdminNormativa = () => {
  const { list, add, update, remove } = useNormativa();
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({});

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: C.primary }}>{editingId === 'new' ? 'Nuovo Articolo' : 'Modifica Articolo'}</h2>
          <button onClick={() => setEditingId(null)} style={{ color: C.textLight }}>Annulla</button>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px' }}>
          <TextInput label="Articolo (Numero)" type="number" value={formData.articolo || ''} onChange={e => setFormData({...formData, articolo: parseInt(e.target.value) || ''})} />
          <TextInput label="Titolo (Rubrica)" value={formData.titolo || ''} onChange={e => setFormData({...formData, titolo: e.target.value})} />
          <TextArea label="Testo Completo" rows={10} value={formData.testo || ''} onChange={e => setFormData({...formData, testo: e.target.value})} />

          <button onClick={handleSave} style={{ width: '100%', padding: '12px', backgroundColor: C.primary, color: '#fff', borderRadius: '8px', fontWeight: 'bold', marginTop: '16px' }}>
            Salva Articolo
          </button>
        </div>
      </div>
    );
  }

  const filtered = list.filter(i => i.titolo.toLowerCase().includes(search.toLowerCase()) || `Art. ${i.articolo}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2 style={{ color: C.primary }}>Gestione Normativa</h2>
        <button onClick={handleNew} style={{ padding: '8px 16px', backgroundColor: C.primary, color: '#fff', borderRadius: '8px' }}>+ Nuovo</button>
      </div>

      <TextInput placeholder="Cerca articolo..." value={search} onChange={e => setSearch(e.target.value)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {filtered.map(item => (
          <div key={item.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: C.success, fontWeight: 'bold' }}>ART. {item.articolo}</span>
            <h3 style={{ fontSize: '1rem', color: C.text, margin: '4px 0 12px 0' }}>{item.titolo}</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', backgroundColor: C.accentLight, color: C.accent, borderRadius: '6px', fontSize: '0.85rem' }}>Modifica</button>
              <button onClick={() => remove(item.id)} style={{ padding: '6px 12px', backgroundColor: C.dangerLight, color: C.danger, borderRadius: '6px', fontSize: '0.85rem' }}>Elimina</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
