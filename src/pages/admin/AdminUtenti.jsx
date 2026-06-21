import React, { useState, useEffect } from 'react';
import { C } from '../../styles/theme';
import { Icon } from '../../components/ui/Icon';
import { S } from '../../styles/styles';
import { TextInput } from '../../components/ui/TextInput';
import { useToast } from '../../components/ui/ToastManager';
import { logger } from '../../utils/logger';
import { supabase, isSupabaseConfigured } from '../../config/supabase';

export const AdminUtenti = () => {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    grado: '',
    forza: '',
    telefono: '',
    ruolo: 'operatore'
  });

  const fetchUsers = async () => {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback per la modalità demo locale
      const localSession = localStorage.getItem('polisroad_demo_session');
      if (localSession) {
        setUsers([
          {
            id: 'demo-1',
            email: 'admin@polisroad.it',
            nome: 'Demo',
            cognome: 'User',
            grado: 'Operatore',
            forza: 'Test',
            telefono: '3331234567',
            ruolo: 'admin'
          }
        ]);
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nome, cognome, grado, forza, telefono, ruolo')
        .order('cognome', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      logger.error('Error fetching users:', err);
      showToast('Impossibile caricare la lista utenti.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditingId(user.id);
    setFormData({
      nome: user.nome || '',
      cognome: user.cognome || '',
      grado: user.grado || '',
      forza: user.forza || '',
      telefono: user.telefono || '',
      ruolo: user.ruolo || 'operatore'
    });
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = async (userId) => {
    if (!formData.nome.trim() || !formData.cognome.trim()) {
      showToast('Nome e Cognome sono obbligatori.', 'warning');
      return;
    }

    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({
            nome: formData.nome.trim(),
            cognome: formData.cognome.trim(),
            grado: formData.grado.trim(),
            forza: formData.forza.trim(),
            telefono: formData.telefono.trim(),
            ruolo: formData.ruolo
          })
          .eq('id', userId);

        if (error) throw error;
      } else {
        // Fallback demo locale
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...formData } : u));
      }

      showToast('Profilo utente aggiornato correttamente!', 'success');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      logger.error('Error updating user:', err);
      showToast('Impossibile aggiornare i dati dell\'utente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = search.toLowerCase();
    return (
      (user.nome || '').toLowerCase().includes(searchLower) ||
      (user.cognome || '').toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower) ||
      (user.grado || '').toLowerCase().includes(searchLower) ||
      (user.forza || '').toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={S.sectionTitle}>Gestione Utenti</h2>
        <button onClick={fetchUsers} disabled={loading} style={{ ...S.btnOutline, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
          <Icon name="rotate-cw" size={14} className={loading ? 'spin' : ''} /> Aggiorna
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca utente per nome, cognome, email, forza..."
            style={{
              width: '100%',
              padding: '12px 16px 12px 40px',
              borderRadius: '8px',
              border: `1px solid ${C.border}`,
              backgroundColor: C.card,
              color: C.text,
              fontSize: '1rem'
            }}
          />
          <span style={{ position: 'absolute', left: '14px', top: '14px', color: C.textLight }}>
            <Icon name="search" size={16} />
          </span>
        </div>
      </div>

      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Caricamento utenti in corso...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: C.textLight, backgroundColor: C.card, borderRadius: '8px', border: `1px solid ${C.border}` }}>
          Nessun utente corrisponde alla ricerca.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredUsers.map(user => {
            const isEditing = editingId === user.id;
            return (
              <div key={user.id} style={{ ...S.card, border: `1px solid ${isEditing ? C.accent : C.border}`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {isEditing ? (
                  // Modulo di modifica
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: C.textLight, paddingBottom: '8px', borderBottom: `1px solid ${C.border}` }}>
                      Modifica dati per: <strong>{user.email}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 200px' }}>
                        <TextInput label="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} />
                      </div>
                      <div style={{ flex: '1 1 200px' }}>
                        <TextInput label="Cognome" value={formData.cognome} onChange={e => setFormData({ ...formData, cognome: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 150px' }}>
                        <TextInput label="Grado" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })} />
                      </div>
                      <div style={{ flex: '1 1 150px' }}>
                        <TextInput label="Forza di Polizia" value={formData.forza} onChange={e => setFormData({ ...formData, forza: e.target.value })} />
                      </div>
                      <div style={{ flex: '1 1 150px' }}>
                        <TextInput label="Telefono" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} />
                      </div>
                    </div>
                    <div style={{ marginBottom: '8px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: C.textLight, marginBottom: '6px' }}>Ruolo Sistema</label>
                      <select
                        value={formData.ruolo}
                        onChange={e => setFormData({ ...formData, ruolo: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: `1px solid ${C.border}`,
                          backgroundColor: C.card,
                          color: C.text,
                          fontSize: '1rem',
                          fontFamily: 'inherit'
                        }}
                      >
                        <option value="operatore">Operatore</option>
                        <option value="admin">Amministratore</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px', justifyContent: 'flex-end' }}>
                      <button onClick={handleCancel} style={{ ...S.btnOutline, padding: '8px 16px' }}>
                        Annulla
                      </button>
                      <button onClick={() => handleSave(user.id)} disabled={loading} style={{ ...S.btnPrimary, padding: '8px 16px', margin: 0, width: 'auto' }}>
                        {loading ? 'Salvataggio...' : 'Salva Modifiche'}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Vista dettaglio
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: C.text }}>
                          {user.cognome} {user.nome}
                        </span>
                        <span style={{
                          backgroundColor: user.ruolo === 'admin' ? `${C.danger}15` : `${C.accent}15`,
                          color: user.ruolo === 'admin' ? C.danger : C.accent,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          textTransform: 'uppercase'
                        }}>
                          {user.ruolo}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.88rem', color: C.textLight, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span>Email: {user.email}</span>
                        {(user.grado || user.forza) && (
                          <span>Grado/Forza: {user.grado || '-'} ({user.forza || '-'})</span>
                        )}
                        {user.telefono && <span>Tel: {user.telefono}</span>}
                      </div>
                    </div>
                    <div>
                      <button onClick={() => handleEdit(user)} style={{ ...S.btnOutline, display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.85rem' }}>
                        <Icon name="pen-line" size={13} /> Modifica
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
