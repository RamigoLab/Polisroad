import React, { useState, useMemo } from 'react';
import { EmptyState } from '../../components/ui/EmptyState';
import { SearchBar } from '../../components/ui/SearchBar';
import { Badge } from '../../components/ui/Badge';
import { Icon } from '../../components/ui/Icon';
import { useToast } from '../../components/ui/ToastManager';
import { useSearchSynonyms } from '../../hooks/useSearchSynonyms';
import { C } from '../../styles/theme';
import { S } from '../../styles/styles';

const emptyForm = { termine: '', target_type: 'prontuario', target_ref: '', peso: 10, attivo: true };

export const AdminSinonimi = () => {
  const { list, loading, add, update, remove } = useSearchSynonyms();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let items = list;
    if (q) {
      items = items.filter(s =>
        (s.termine || '').toLowerCase().includes(q) ||
        (s.target_ref || '').toLowerCase().includes(q)
      );
    }
    return [...items].sort((a, b) => (b.peso || 0) - (a.peso || 0) || a.termine.localeCompare(b.termine));
  }, [list, search]);

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({ termine: item.termine, target_type: item.target_type, target_ref: item.target_ref, peso: item.peso, attivo: item.attivo });
    setShowAddForm(false);
  };

  const startAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowAddForm(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setShowAddForm(false);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.termine.trim() || !form.target_ref.trim()) {
      showToast('Termine e codice caso sono obbligatori', 'error');
      return;
    }
    setSaving(true);
    const payload = {
      termine: form.termine.trim().toLowerCase(),
      target_type: form.target_type,
      target_ref: form.target_ref.trim(),
      peso: Number(form.peso) || 10,
      attivo: form.attivo,
    };
    const { error } = editingId ? await update(editingId, payload) : await add(payload);
    setSaving(false);
    if (error) {
      showToast('Errore nel salvataggio', 'error');
      return;
    }
    showToast(editingId ? 'Sinonimo aggiornato' : 'Sinonimo aggiunto', 'success');
    cancelEdit();
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Eliminare il sinonimo "${item.termine}"?`)) return;
    const { error } = await remove(item.id);
    if (error) showToast('Errore durante l\'eliminazione', 'error');
    else showToast('Sinonimo eliminato', 'success');
  };

  const handleToggleAttivo = async (item) => {
    const { error } = await update(item.id, { attivo: !item.attivo });
    if (error) showToast('Errore nell\'aggiornamento', 'error');
  };

  const renderForm = () => (
    <div style={{ ...S.card, marginBottom: '16px', padding: '16px' }}>
      <h3 style={{ fontSize: '0.95rem', marginBottom: '12px', color: C.text }}>
        {editingId ? 'Modifica sinonimo' : 'Nuovo sinonimo'}
      </h3>

      <label style={labelStyle}>Frase / termine</label>
      <input
        style={inputStyle}
        value={form.termine}
        onChange={e => setForm(f => ({ ...f, termine: e.target.value }))}
        placeholder='es. "senza assicurazione"'
      />

      <label style={labelStyle}>Tipo target</label>
      <select
        style={inputStyle}
        value={form.target_type}
        onChange={e => setForm(f => ({ ...f, target_type: e.target.value }))}
      >
        <option value="prontuario">Prontuario</option>
        <option value="normativa">Normativa</option>
      </select>

      <label style={labelStyle}>
        {form.target_type === 'prontuario' ? 'Codice caso (es. 193-1)' : 'Riferimento articolo'}
      </label>
      <input
        style={inputStyle}
        value={form.target_ref}
        onChange={e => setForm(f => ({ ...f, target_ref: e.target.value }))}
        placeholder={form.target_type === 'prontuario' ? 'es. 193-1' : 'es. 142'}
      />

      <label style={labelStyle}>Peso (priorità, default 10)</label>
      <input
        type="number"
        style={inputStyle}
        value={form.peso}
        onChange={e => setForm(f => ({ ...f, peso: e.target.value }))}
      />

      <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={form.attivo}
          onChange={e => setForm(f => ({ ...f, attivo: e.target.checked }))}
        />
        Attivo
      </label>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button onClick={handleSave} disabled={saving} style={saveBtnStyle}>
          {saving ? 'Salvataggio...' : 'Salva'}
        </button>
        <button onClick={cancelEdit} style={cancelBtnStyle}>Annulla</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px' }}>
        <div style={{ flex: 1 }}>
          <SearchBar value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca sinonimo o codice caso..." />
        </div>
        <button onClick={startAdd} style={addBtnStyle}>
          <Icon name="plus" size={16} /> Nuovo
        </button>
      </div>

      <p style={{ fontSize: '0.78rem', color: C.textLight, marginBottom: '12px' }}>
        {list.length} sinonimi totali · usati dalla ricerca per suggerire il risultato giusto
        anche quando l'agente non usa il linguaggio giuridico esatto (es. "senza assicurazione" → Art. 193).
      </p>

      {showAddForm && renderForm()}

      {loading ? (
        <p style={{ color: C.textLight, textAlign: 'center', padding: '24px' }}>Caricamento...</p>
      ) : filtered.length === 0 ? (
        <EmptyState compact icon="search" title="Nessun sinonimo" subtitle="Aggiungine uno con il pulsante Nuovo." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(item => (
            <div key={item.id}>
              {editingId === item.id ? renderForm() : (
                <div style={{ ...S.card, padding: '12px 16px', opacity: item.attivo ? 1 : 0.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '700', color: C.text, fontSize: '0.9rem' }}>"{item.termine}"</div>
                      <div style={{ fontSize: '0.78rem', color: C.textLight, marginTop: '2px' }}>
                        → {item.target_type} · {item.target_ref}
                        {!item.attivo && <span style={{ marginLeft: '6px', color: C.danger }}>(disattivato)</span>}
                      </div>
                    </div>
                    <Badge type="secondary" style={{ fontSize: '0.65rem', flexShrink: 0 }}>peso {item.peso}</Badge>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button onClick={() => startEdit(item)} style={miniBtnStyle}>Modifica</button>
                    <button onClick={() => handleToggleAttivo(item)} style={miniBtnStyle}>
                      {item.attivo ? 'Disattiva' : 'Attiva'}
                    </button>
                    <button onClick={() => handleDelete(item)} style={{ ...miniBtnStyle, color: C.danger }}>Elimina</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: '0.75rem', color: C.textLight, fontWeight: '600', marginTop: '10px', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '8px 10px', borderRadius: '8px', border: `1px solid ${C.border}`, fontSize: '0.9rem', backgroundColor: C.background, color: C.text };
const saveBtnStyle = { flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: C.accent, color: '#fff', fontWeight: '700', cursor: 'pointer' };
const cancelBtnStyle = { padding: '10px 16px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.textLight, fontWeight: '600', cursor: 'pointer' };
const addBtnStyle = { display: 'flex', alignItems: 'center', gap: '4px', padding: '10px 14px', borderRadius: '8px', border: 'none', backgroundColor: C.accent, color: '#fff', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', flexShrink: 0 };
const miniBtnStyle = { padding: '6px 10px', borderRadius: '6px', border: `1px solid ${C.border}`, backgroundColor: 'transparent', color: C.text, fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer' };
