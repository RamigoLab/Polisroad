import React, { useState, useEffect } from 'react';
import { C } from '../../styles/theme';
import { Icon } from '../../components/ui/Icon';
import { S } from '../../styles/styles';
import { TextInput } from '../../components/ui/TextInput';
import { useToast } from '../../components/ui/ToastManager';
import { logger } from '../../utils/logger';
import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL || '';

export const AdminUtenti = () => {
  const { showToast } = useToast();
  const { session } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPending, setFilterPending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', cognome: '', grado: '', forza: '', telefono: '', ruolo: 'operatore',
  });

  const fetchUsers = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUsers([{
        id: 'demo-1', email: 'admin@polisroad.it', nome: 'Demo', cognome: 'User',
        grado: 'Operatore', forza: 'Test', telefono: '3331234567', ruolo: 'admin',
        approvato: true, created_at: new Date().toISOString(),
      }]);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nome, cognome, grado, forza, telefono, ruolo, approvato, created_at')
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

  useEffect(() => { fetchUsers(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEdit = (user) => {
    setEditingId(user.id);
    setDeletingId(null);
    setFormData({
      nome: user.nome || '', cognome: user.cognome || '',
      grado: user.grado || '', forza: user.forza || '',
      telefono: user.telefono || '', ruolo: user.ruolo || 'operatore',
    });
  };

  const handleSave = async (userId) => {
    if (!formData.nome.trim() || !formData.cognome.trim()) {
      showToast('Nome e Cognome sono obbligatori.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome.trim(), cognome: formData.cognome.trim(),
          grado: formData.grado.trim(), forza: formData.forza.trim(),
          telefono: formData.telefono.trim(), ruolo: formData.ruolo,
        })
        .eq('id', userId);
      if (error) throw error;
      showToast('Profilo aggiornato.', 'success');
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      logger.error('Error updating user:', err);
      showToast("Impossibile aggiornare i dati dell'utente.", 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleApprovazione = async (userId, currentValue) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ approvato: !currentValue })
        .eq('id', userId);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, approvato: !currentValue } : u));
      showToast(!currentValue ? 'Account approvato.' : 'Account sospeso.', !currentValue ? 'success' : 'warning');
    } catch (err) {
      logger.error('Errore approvazione:', err);
      showToast('Impossibile aggiornare lo stato.', 'error');
    }
  };

  const handleDeleteConfirm = async (userId) => {
    setDeleteLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setDeletingId(null);
        showToast('Utente rimosso (modalità demo).', 'success');
        return;
      }

      // 1. Chiama Edge Function delete-user: elimina auth.users (ora con check admin)
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/delete-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ uid: userId }),
      });
      const json = await resp.json();
      if (!resp.ok) throw new Error(json.error || `Errore HTTP ${resp.status}`);

      // 2. Cleanup esplicito tabelle figlio (fallback se CASCADE non attivo)
      const tables = ['note', 'preferiti', 'push_subscriptions'];
      for (const table of tables) {
        await supabase.from(table).delete().eq('user_id', userId).catch(() => {});
      }

      // 3. Elimina il profilo (se non già rimosso dal CASCADE)
      await supabase.rpc('delete_user_by_admin', { user_id: userId }).catch(() => {});

      setUsers(prev => prev.filter(u => u.id !== userId));
      setDeletingId(null);
      showToast('Utente eliminato definitivamente.', 'success');
    } catch (err) {
      logger.error('Error deleting user:', err);
      showToast('Impossibile eliminare: ' + err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  // FIX: pendingCount usa !== true per catturare sia false che null
  const pendingCount = users.filter(u => u.approvato !== true && u.ruolo !== 'admin').length;

  const filteredUsers = users.filter(user => {
    if (filterPending && (user.approvato === true || user.ruolo === 'admin')) return false;
    const q = search.toLowerCase();
    return (
      (user.nome || '').toLowerCase().includes(q) ||
      (user.cognome || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q) ||
      (user.grado || '').toLowerCase().includes(q) ||
      (user.forza || '').toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch { return '—'; }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={S.sectionTitle}>Gestione Utenti</h2>
        <button onClick={fetchUsers} disabled={loading} style={{ ...S.btnOutline, display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px' }}>
          <Icon name="rotate-cw" size={14} /> Aggiorna
        </button>
      </div>

      <div style={{ marginBottom: '16px', position: 'relative' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cerca per nome, cognome, email, forza..."
          style={{
            width: '100%', padding: '12px 16px 12px 40px',
            borderRadius: '8px', border: `1px solid ${C.border}`,
            backgroundColor: C.card, color: C.text, fontSize: '1rem',
            boxSizing: 'border-box',
          }}
        />
        <span style={{ position: 'absolute', left: '14px', top: '14px', color: C.textLight }}>
          <Icon name="search" size={16} />
        </span>
      </div>

      {/* Filtri rapidi */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterPending(false)}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem',
            fontWeight: '600', cursor: 'pointer', border: 'none',
            backgroundColor: !filterPending ? C.primary : C.card,
            color: !filterPending ? '#fff' : C.textLight,
          }}
        >
          Tutti ({users.length})
        </button>
        <button
          onClick={() => setFilterPending(true)}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem',
            fontWeight: '600', cursor: 'pointer', border: 'none',
            backgroundColor: filterPending ? C.warning : C.card,
            color: filterPending ? '#fff' : C.textLight,
            position: 'relative',
          }}
        >
          ⏳ In attesa{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </button>
      </div>

      {loading && users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: C.textLight }}>Caricamento utenti...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: C.textLight, backgroundColor: C.card, borderRadius: '8px', border: `1px solid ${C.border}` }}>
          Nessun utente corrisponde alla ricerca.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredUsers.map(user => {
            const isEditing = editingId === user.id;
            const isDeleting = deletingId === user.id;
            const isApproved = user.approvato === true;

            return (
              <div
                key={user.id}
                style={{
                  ...S.card,
                  border: `1px solid ${isDeleting ? C.danger : isEditing ? C.accent : C.border}`,
                  padding: '16px',
                }}
              >
                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ fontSize: '0.85rem', color: C.textLight, paddingBottom: '8px', borderBottom: `1px solid ${C.border}` }}>
                      Modifica: <strong>{user.email}</strong>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 180px' }}><TextInput label="Nome" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} /></div>
                      <div style={{ flex: '1 1 180px' }}><TextInput label="Cognome" value={formData.cognome} onChange={e => setFormData({ ...formData, cognome: e.target.value })} /></div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ flex: '1 1 150px' }}><TextInput label="Grado" value={formData.grado} onChange={e => setFormData({ ...formData, grado: e.target.value })} /></div>
                      <div style={{ flex: '1 1 150px' }}><TextInput label="Forza" value={formData.forza} onChange={e => setFormData({ ...formData, forza: e.target.value })} /></div>
                      <div style={{ flex: '1 1 130px' }}><TextInput label="Telefono" value={formData.telefono} onChange={e => setFormData({ ...formData, telefono: e.target.value })} /></div>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: C.textLight, marginBottom: '6px', textTransform: 'uppercase' }}>Ruolo</label>
                      <select
                        value={formData.ruolo}
                        onChange={e => setFormData({ ...formData, ruolo: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1px solid ${C.border}`, backgroundColor: C.card, color: C.text, fontSize: '0.95rem' }}
                      >
                        <option value="operatore">Operatore</option>
                        <option value="admin">Amministratore</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingId(null)} style={{ ...S.btnOutline, padding: '8px 16px' }}>Annulla</button>
                      <button onClick={() => handleSave(user.id)} disabled={loading} style={{ ...S.btnPrimary, padding: '8px 16px', margin: 0, width: 'auto' }}>
                        {loading ? 'Salvataggio...' : 'Salva'}
                      </button>
                    </div>
                  </div>

                ) : isDeleting ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: '10px',
                      backgroundColor: `${C.danger}12`, border: `1px solid ${C.danger}40`,
                      borderRadius: '8px', padding: '12px 16px',
                    }}>
                      <Icon name="triangle-alert" size={20} color={C.danger} />
                      <div>
                        <div style={{ fontWeight: '700', color: C.danger, marginBottom: '4px' }}>Elimina account</div>
                        <div style={{ fontSize: '0.85rem', color: C.text, lineHeight: 1.5 }}>
                          Stai per eliminare <strong>{user.cognome} {user.nome}</strong> ({user.email}).
                          L'operazione è <strong>irreversibile</strong>: profilo, note, preferiti e accesso saranno rimossi definitivamente.
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setDeletingId(null)} style={{ ...S.btnOutline, padding: '8px 16px' }}>Annulla</button>
                      <button
                        onClick={() => handleDeleteConfirm(user.id)}
                        disabled={deleteLoading}
                        style={{
                          padding: '8px 18px', border: 'none', borderRadius: '8px',
                          backgroundColor: C.danger, color: '#fff', fontWeight: '700',
                          cursor: deleteLoading ? 'wait' : 'pointer', opacity: deleteLoading ? 0.7 : 1,
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <Icon name="trash-2" size={14} />
                        {deleteLoading ? 'Eliminazione...' : 'Conferma eliminazione'}
                      </button>
                    </div>
                  </div>

                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.05rem', color: C.text }}>
                          {user.cognome} {user.nome}
                        </span>
                        <span style={{
                          backgroundColor: user.ruolo === 'admin' ? `${C.danger}15` : `${C.accent}15`,
                          color: user.ruolo === 'admin' ? C.danger : C.accent,
                          fontSize: '0.7rem', fontWeight: 'bold',
                          padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase',
                        }}>
                          {user.ruolo}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.83rem', color: C.textLight, display: 'flex', flexDirection: 'column', gap: '2px', lineHeight: 1.5 }}>
                        <span>{user.email}</span>
                        {(user.grado || user.forza) && (
                          <span>{user.grado || '—'} · {user.forza || '—'}</span>
                        )}
                        {/* Data di registrazione */}
                        <span style={{ fontSize: '0.75rem', color: C.textLight, marginTop: '2px' }}>
                          Registrato il {formatDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        backgroundColor: isApproved ? `${C.success}18` : `${C.warning}18`,
                        color: isApproved ? C.success : C.warning,
                        fontSize: '0.85rem', fontWeight: '700',
                        padding: '4px 12px', borderRadius: '12px',
                      }}>
                        {isApproved ? '✓ Approvato' : '⏳ In attesa'}
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => toggleApprovazione(user.id, user.approvato)}
                          style={{
                            padding: '6px 12px', fontSize: '0.82rem', fontWeight: '600',
                            borderRadius: '8px', cursor: 'pointer', border: 'none',
                            backgroundColor: isApproved ? `${C.warning}15` : `${C.success}15`,
                            color: isApproved ? C.warning : C.success,
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}
                        >
                          <Icon name={isApproved ? 'ban' : 'check-circle'} size={13} />
                          {isApproved ? 'Sospendi' : 'Approva'}
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            padding: '6px 12px', fontSize: '0.82rem', fontWeight: '600',
                            borderRadius: '8px', cursor: 'pointer', border: 'none',
                            backgroundColor: `${C.accent}15`, color: C.accent,
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}
                        >
                          <Icon name="pen-line" size={13} /> Modifica
                        </button>
                        <button
                          onClick={() => { setDeletingId(user.id); setEditingId(null); }}
                          style={{
                            padding: '6px 12px', fontSize: '0.82rem', fontWeight: '600',
                            borderRadius: '8px', cursor: 'pointer', border: 'none',
                            backgroundColor: `${C.danger}15`, color: C.danger,
                            display: 'flex', alignItems: 'center', gap: '4px',
                          }}
                        >
                          <Icon name="trash-2" size={13} /> Elimina
                        </button>
                      </div>
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
