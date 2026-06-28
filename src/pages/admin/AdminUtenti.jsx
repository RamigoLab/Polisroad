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
  const [filterPending, setFilterPending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // id utente in attesa di conferma eliminazione
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      const localSession = localStorage.getItem('polisroad_demo_session');
      if (localSession) {
        setUsers([{
          id: 'demo-1',
          email: 'admin@polisroad.it',
          nome: 'Demo',
          cognome: 'User',
          grado: 'Operatore',
          forza: 'Test',
          telefono: '3331234567',
          ruolo: 'admin'
        }]);
      }
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nome, cognome, grado, forza, telefono, ruolo, approvato')
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

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user) => {
    setEditingId(user.id);
    setDeletingId(null);
    setFormData({
      nome: user.nome || '',
      cognome: user.cognome || '',
      grado: user.grado || '',
      forza: user.forza || '',
      telefono: user.telefono || '',
      ruolo: user.ruolo || 'operatore'
    });
  };

  const handleCancel = () => { setEditingId(null); };

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
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...formData } : u));
      }

      showToast('Profilo utente aggiornato correttamente!', 'success');
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

  // ── Eliminazione utente ────────────────────────────────────────────────────
  // Il flusso è in due step:
  // 1. Primo click su "Elimina" → setDeletingId(user.id) → appare il pannello di conferma
  // 2. Click su "Conferma eliminazione" → handleDeleteConfirm(user.id) → delete effettivo
  //
  // L'eliminazione cancella il profilo da `profiles`. Supabase propaga automaticamente
  // il DELETE a `auth.users` tramite la Edge Function `delete-user` (se configurata),
  // oppure tramite CASCADE se la FK è impostata. Le tabelle figlio (xp_history,
  // gamification, note, preferiti, segnalazioni, push_subscriptions) vengono
  // eliminate automaticamente dal CASCADE ON DELETE su user_id.
  //
  // NOTA: per eliminare l'utente da auth.users serve la Edge Function `delete-user`
  // oppure una chiamata all'Admin API Supabase con service_role key (mai lato client).
  // Qui eliminiamo il profilo da `profiles`: l'utente non potrà più accedere
  // anche se l'auth.users rimane (verrà rifiutato al loadProfile → profileError).
  // Per la pulizia completa da auth.users usa la Supabase Dashboard > Authentication.

  const handleDeleteClick = (userId) => {
    setDeletingId(userId);
    setEditingId(null);
  };

  const handleDeleteCancel = () => { setDeletingId(null); };

  const handleDeleteConfirm = async (userId) => {
    setDeleteLoading(true);
    try {
      if (!isSupabaseConfigured || !supabase) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        setDeletingId(null);
        showToast('Utente rimosso (modalità demo).', 'success');
        return;
      }

      // 1. Elimina tutte le tabelle figlio esplicitamente (nel caso il CASCADE non sia attivo)
      const tables = ['xp_history', 'gamification', 'note', 'preferiti', 'segnalazioni', 'push_subscriptions'];
      for (const table of tables) {
        const { error } = await supabase.from(table).delete().eq('user_id', userId);
        if (error) logger.warn(`Delete ${table} for user ${userId}:`, error.message);
      }

      // 2. Elimina il profilo
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) throw profileError;

      setUsers(prev => prev.filter(u => u.id !== userId));
      setDeletingId(null);
      showToast('Profilo utente eliminato correttamente.', 'success');
    } catch (err) {
      logger.error('Error deleting user:', err);
      showToast('Impossibile eliminare il profilo. Controlla i permessi RLS.', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const pendingCount = users.filter(u => !u.approvato).length;

  const filteredUsers = users.filter(user => {
    if (filterPending && user.approvato) return false;
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

      {/* Filtri rapidi */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setFilterPending(false)}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
            cursor: 'pointer', border: 'none',
            backgroundColor: !filterPending ? C.primary : C.card,
            color: !filterPending ? '#fff' : C.textLight,
          }}
        >
          Tutti ({users.length})
        </button>
        <button
          onClick={() => setFilterPending(true)}
          style={{
            padding: '6px 14px', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
            cursor: 'pointer', border: 'none',
            backgroundColor: filterPending ? (C.warning || '#e67e22') : C.card,
            color: filterPending ? '#fff' : C.textLight,
          }}
        >
          ⏳ In attesa{pendingCount > 0 ? ` (${pendingCount})` : ''}
        </button>
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
            const isDeleting = deletingId === user.id;
            return (
              <div
                key={user.id}
                style={{
                  ...S.card,
                  border: `1px solid ${isDeleting ? (C.danger || '#e74c3c') : isEditing ? C.accent : C.border}`,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {isEditing ? (
                  // ── Modulo di modifica ──────────────────────────────────
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
                          width: '100%', padding: '12px', borderRadius: '8px',
                          border: `1px solid ${C.border}`, backgroundColor: C.card,
                          color: C.text, fontSize: '1rem', fontFamily: 'inherit'
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

                ) : isDeleting ? (
                  // ── Pannello di conferma eliminazione ───────────────────
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      backgroundColor: `${C.danger || '#e74c3c'}12`,
                      border: `1px solid ${C.danger || '#e74c3c'}40`,
                      borderRadius: '8px', padding: '12px 16px',
                    }}>
                      <Icon name="triangle-alert" size={20} color={C.danger || '#e74c3c'} />
                      <div>
                        <div style={{ fontWeight: '700', color: C.danger || '#e74c3c', marginBottom: '2px' }}>
                          Elimina profilo utente
                        </div>
                        <div style={{ fontSize: '0.85rem', color: C.text }}>
                          Stai per eliminare <strong>{user.cognome} {user.nome}</strong> ({user.email}).
                          Verranno rimossi anche note, preferiti, XP e subscription push.
                          <br />
                          <span style={{ color: C.textLight, fontSize: '0.8rem' }}>
                            L'account di accesso (email/password) rimane su Supabase Auth — eliminalo manualmente dalla Dashboard se necessario.
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button onClick={handleDeleteCancel} style={{ ...S.btnOutline, padding: '8px 16px' }}>
                        Annulla
                      </button>
                      <button
                        onClick={() => handleDeleteConfirm(user.id)}
                        disabled={deleteLoading}
                        style={{
                          padding: '8px 18px', border: 'none', borderRadius: '8px',
                          backgroundColor: C.danger || '#e74c3c', color: '#fff',
                          fontWeight: '700', cursor: deleteLoading ? 'wait' : 'pointer',
                          opacity: deleteLoading ? 0.7 : 1,
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        <Icon name="trash-2" size={14} />
                        {deleteLoading ? 'Eliminazione...' : 'Conferma eliminazione'}
                      </button>
                    </div>
                  </div>

                ) : (
                  // ── Vista dettaglio utente ──────────────────────────────
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: C.text, lineHeight: 1 }}>
                          {user.cognome} {user.nome}
                        </span>
                        <span style={{
                          backgroundColor: user.ruolo === 'admin' ? `${C.danger}15` : `${C.accent}15`,
                          color: user.ruolo === 'admin' ? C.danger : C.accent,
                          fontSize: '0.75rem', fontWeight: 'bold',
                          padding: '3px 8px', borderRadius: '12px', textTransform: 'uppercase', lineHeight: 1
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {/* Badge stato approvazione */}
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        backgroundColor: user.approvato ? `${C.success || '#27ae60'}18` : `${C.warning || '#e67e22'}18`,
                        color: user.approvato ? (C.success || '#27ae60') : (C.warning || '#e67e22'),
                        fontSize: '0.9rem', fontWeight: '700',
                        padding: '4px 12px', borderRadius: '12px',
                      }}>
                        {user.approvato ? '✓ Approvato' : '⏳ In attesa'}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end', marginTop: '4px' }}>
                        {/* Toggle approvazione */}
                        <button
                          onClick={() => toggleApprovazione(user.id, user.approvato)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', fontSize: '0.85rem', fontWeight: '600',
                            borderRadius: '8px', cursor: 'pointer', border: 'none',
                            backgroundColor: user.approvato ? `${C.warning || '#e67e22'}15` : `${C.success || '#27ae60'}15`,
                            color: user.approvato ? (C.warning || '#e67e22') : (C.success || '#27ae60'),
                          }}
                        >
                          <Icon name={user.approvato ? 'ban' : 'check-circle'} size={14} />
                          {user.approvato ? 'Sospendi' : 'Approva'}
                        </button>
                        {/* Modifica dati */}
                        <button 
                          onClick={() => handleEdit(user)} 
                          style={{ 
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', fontSize: '0.85rem', fontWeight: '600',
                            borderRadius: '8px', cursor: 'pointer', border: 'none',
                            backgroundColor: `${C.accent}15`, color: C.accent
                          }}
                        >
                          <Icon name="pen-line" size={14} /> Modifica
                        </button>
                        {/* Elimina profilo */}
                        <button
                          onClick={() => handleDeleteClick(user.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', fontSize: '0.85rem', fontWeight: '600',
                            borderRadius: '8px', cursor: 'pointer', border: 'none',
                            backgroundColor: `${C.danger || '#e74c3c'}15`,
                            color: C.danger || '#e74c3c',
                          }}
                        >
                          <Icon name="trash-2" size={14} /> Elimina
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
