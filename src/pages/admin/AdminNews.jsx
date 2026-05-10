import React, { useState } from 'react';
import { C } from '../../styles/theme';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useNews } from '../../hooks/useNews';

export const AdminNews = () => {
  const { list, add, update, remove } = useNews();
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    titolo: '', contenuto: '', fonte: '', url_fonte: '', categoria: '', pubblicato: false
  });

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleNew = () => {
    setEditingId('new');
    setFormData({ titolo: '', contenuto: '', fonte: '', url_fonte: '', categoria: '', pubblicato: false });
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
          <h2 style={{ color: C.primary }}>{editingId === 'new' ? 'Nuova News' : 'Modifica News'}</h2>
          <button onClick={() => setEditingId(null)} style={{ color: C.textLight }}>Annulla</button>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px' }}>
          <TextInput label="Titolo" value={formData.titolo} onChange={e => setFormData({...formData, titolo: e.target.value})} />
          <TextArea label="Contenuto" value={formData.contenuto} onChange={e => setFormData({...formData, contenuto: e.target.value})} />
          <TextInput label="Fonte" value={formData.fonte} onChange={e => setFormData({...formData, fonte: e.target.value})} />
          <TextInput label="URL Fonte" value={formData.url_fonte} onChange={e => setFormData({...formData, url_fonte: e.target.value})} />
          <TextInput label="Categoria" value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})} />
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', marginBottom: '24px' }}>
            <input type="checkbox" checked={formData.pubblicato} onChange={e => setFormData({...formData, pubblicato: e.target.checked})} />
            <span>Pubblica immediatamente</span>
          </label>

          <button onClick={handleSave} style={{ width: '100%', padding: '12px', backgroundColor: C.primary, color: '#fff', borderRadius: '8px', fontWeight: 'bold' }}>
            Salva News
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2 style={{ color: C.primary }}>Gestione News</h2>
        <button onClick={handleNew} style={{ padding: '8px 16px', backgroundColor: C.primary, color: '#fff', borderRadius: '8px' }}>+ Nuova</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {list.map(item => (
          <div key={item.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', borderLeft: `4px solid ${item.pubblicato ? C.success : C.textLight}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: C.textLight, fontWeight: 'bold' }}>{item.categoria}</span>
              <span style={{ fontSize: '0.8rem', color: item.pubblicato ? C.success : C.textLight }}>{item.pubblicato ? 'Pubblicata' : 'Bozza'}</span>
            </div>
            <h3 style={{ fontSize: '1rem', color: C.text, marginBottom: '12px' }}>{item.titolo}</h3>
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
