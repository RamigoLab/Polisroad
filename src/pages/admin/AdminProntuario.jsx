import React, { useState } from 'react';
import { C } from '../../styles/theme';
import { TextInput } from '../../components/ui/TextInput';
import { TextArea } from '../../components/ui/TextArea';
import { useProntuario } from '../../hooks/useProntuario';

export const AdminProntuario = () => {
  const { list, add, update, remove } = useProntuario();
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  
  const [formData, setFormData] = useState({});

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleNew = () => {
    setEditingId('new');
    setFormData({ 
      rif_normativo: '', articolo: '', comma: '', codice_violazione: '', titolo: '', 
      descrizione: '', edittale_min: '', edittale_max: '', pmr: '', 
      scontato_30: '', sanzione_notturna: false, 
      punti_patente: '', note_operative: ''
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
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h2 style={{ color: C.primary }}>{editingId === 'new' ? 'Nuova Voce Prontuario' : 'Modifica Voce Prontuario'}</h2>
          <button onClick={() => setEditingId(null)} style={{ color: C.textLight }}>Annulla</button>
        </div>
        
        <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <TextInput label="Riferimento Normativo (es. Art. 142 c. 8)" value={formData.rif_normativo || ''} onChange={e => setFormData({...formData, rif_normativo: e.target.value})} />
          <TextInput label="Titolo (Breve)" value={formData.titolo || ''} onChange={e => setFormData({...formData, titolo: e.target.value})} />
          <TextArea label="Descrizione Violazione" value={formData.descrizione || ''} onChange={e => setFormData({...formData, descrizione: e.target.value})} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <TextInput label="Minimo Edittale (€)" type="number" value={formData.edittale_min || ''} onChange={e => setFormData({...formData, edittale_min: e.target.value})} />
            <TextInput label="Massimo Edittale (€)" type="number" value={formData.edittale_max || ''} onChange={e => setFormData({...formData, edittale_max: e.target.value})} />
            <TextInput label="Sanzione PMR (€)" type="number" value={formData.pmr || ''} onChange={e => setFormData({...formData, pmr: e.target.value})} />
            <TextInput label="PMR Scontata 30% (€)" type="number" value={formData.scontato_30 || ''} onChange={e => setFormData({...formData, scontato_30: e.target.value})} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.85rem', color: C.textLight }}>Sanzione Notturna</label>
              <select style={{ padding: '12px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: '#f9f9f9', fontFamily: 'inherit' }} value={formData.sanzione_notturna ? 'true' : 'false'} onChange={e => setFormData({...formData, sanzione_notturna: e.target.value === 'true'})}>
                <option value="false">No</option>
                <option value="true">Sì</option>
              </select>
            </div>
            <TextInput label="Punti Decurtati" type="number" value={formData.punti_patente || ''} onChange={e => setFormData({...formData, punti_patente: e.target.value})} />
            <TextInput label="Codice Violazione" value={formData.codice_violazione || ''} onChange={e => setFormData({...formData, codice_violazione: e.target.value})} />
          </div>

          <TextArea label="Note Operative" value={formData.note_operative || ''} onChange={e => setFormData({...formData, note_operative: e.target.value})} />

          <button onClick={handleSave} style={{ width: '100%', padding: '12px', backgroundColor: C.primary, color: '#fff', borderRadius: '8px', fontWeight: 'bold', marginTop: '16px' }}>
            Salva Voce Prontuario
          </button>
        </div>
      </div>
    );
  }

  const filtered = list.filter(i => i.titolo.toLowerCase().includes(search.toLowerCase()) || i.rif_normativo.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2 style={{ color: C.primary }}>Gestione Prontuario</h2>
        <button onClick={handleNew} style={{ padding: '8px 16px', backgroundColor: C.primary, color: '#fff', borderRadius: '8px' }}>+ Nuova</button>
      </div>

      <TextInput placeholder="Cerca voce da modificare..." value={search} onChange={e => setSearch(e.target.value)} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
        {filtered.map(item => (
          <div key={item.id} style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: C.primary, fontWeight: 'bold' }}>{item.rif_normativo}</span>
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
