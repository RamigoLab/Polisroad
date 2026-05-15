import React, { useState } from 'react';
import { C } from '../../styles/theme';
import { S } from '../../styles/styles';
import { PS } from '../../styles/pages';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useNews } from '../../hooks/useNews';

export const AdminNews = () => {
  const { list, add, update, remove } = useNews();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titolo: '', contenuto: '', fonte: '', url_fonte: '', categoria: '', pubblicato: false,
  });

  const handleEdit = (item) => { setEditingId(item.id); setFormData(item); };
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
        <div style={S.formHeader}>
          <h2 style={S.sectionTitle}>{editingId === 'new' ? 'Nuova News' : 'Modifica News'}</h2>
          <button onClick={() => setEditingId(null)} style={S.btnCancel}>Annulla</button>
        </div>
        <div style={S.formCard}>
          <TextInput label="Titolo" value={formData.titolo} onChange={e => setFormData({ ...formData, titolo: e.target.value })} />
          <TextArea label="Contenuto" value={formData.contenuto} onChange={e => setFormData({ ...formData, contenuto: e.target.value })} />
          <TextInput label="Fonte" value={formData.fonte} onChange={e => setFormData({ ...formData, fonte: e.target.value })} />
          <TextInput label="URL Fonte" value={formData.url_fonte} onChange={e => setFormData({ ...formData, url_fonte: e.target.value })} />
          <TextInput label="Categoria" value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} />
          <label style={S.checkboxLabel}>
            <input type="checkbox" checked={formData.pubblicato} onChange={e => setFormData({ ...formData, pubblicato: e.target.checked })} />
            <span>Pubblica immediatamente</span>
          </label>
          <button onClick={handleSave} style={S.btnPrimary}>Salva News</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={S.formHeader}>
        <h2 style={S.sectionTitle}>Gestione News</h2>
        <button onClick={handleNew} style={S.btnPrimarySmall}>+ Nuova</button>
      </div>
      <div style={S.list}>
        {list.map(item => (
          <div key={item.id} style={PS.adminListItem(item.pubblicato)}>
            <div style={PS.adminListItemHeader}>
              <span style={S.labelUppercase}>{item.categoria}</span>
              <span style={{ fontSize: '0.8rem', color: item.pubblicato ? C.success : C.textLight }}>
                {item.pubblicato ? 'Pubblicata' : 'Bozza'}
              </span>
            </div>
            <h3 style={PS.adminListItemTitle}>{item.titolo}</h3>
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
