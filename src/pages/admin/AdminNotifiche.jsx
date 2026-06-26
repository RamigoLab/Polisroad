/**
 * AdminNotifiche.jsx
 * Pannello admin per l'invio di notifiche push agli utenti iscritti.
 *
 * Funzionalità:
 * - Invia notifica a tutti gli iscritti (broadcast)
 * - Invio singolo utente (selezionabile da lista)
 * - Anteprima del payload prima dell'invio
 * - Contatore subscriber attivi
 */
import React, { useState, useEffect } from 'react';
import { C } from '../../styles/theme';
import { Icon } from '../../components/ui/Icon';
import { S } from '../../styles/styles';
import { supabase, isSupabaseConfigured } from '../../config/supabase';
import { useAuth } from '../../hooks/useAuth';
import { logger } from '../../utils/logger';

const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const AdminNotifiche = () => {
  const { session } = useAuth();

  const [title,   setTitle]   = useState('');
  const [body,    setBody]    = useState('');
  const [url,     setUrl]     = useState('/');
  const [target,  setTarget]  = useState('all'); // 'all' | userId

  const [subscribers,       setSubscribers]       = useState([]);
  const [subscribersLoading, setSubscribersLoading] = useState(true);
  const [subscribersError,   setSubscribersError]   = useState(null);
  const [sending,  setSending]  = useState(false);
  const [result,   setResult]   = useState(null); // { sent, failed } | { error }

  // ─── Carica subscriber ────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!isSupabaseConfigured || !supabase) { setSubscribersLoading(false); return; }
      setSubscribersLoading(true);
      setSubscribersError(null);
      try {
        const { data, error } = await supabase
          .from('push_subscriptions')
          .select('user_id, updated_at, profiles(nome, cognome, email)')
          .order('updated_at', { ascending: false });
        if (error) throw error;
        setSubscribers(data || []);
      } catch (err) {
        logger.error('AdminNotifiche: caricamento subscriber', err);
        setSubscribersError(err.message || 'Errore durante il caricamento dei destinatari');
      } finally {
        setSubscribersLoading(false);
      }
    };
    load();
  }, []);

  // ─── Invio ────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!title.trim() || !body.trim()) return;
    if (!session?.access_token) return;

    setSending(true);
    setResult(null);

    try {
      const payload = {
        title: title.trim(),
        body:  body.trim(),
        url:   url.trim() || '/',
        ...(target !== 'all' ? { userIds: [target] } : {}),
      };

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-push`, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await resp.json();

      if (!resp.ok) {
        setResult({ error: json.error || `Errore HTTP ${resp.status}` });
      } else {
        setResult(json); // { sent, failed, expired }
        // Reset form
        setTitle('');
        setBody('');
        setUrl('/');
        setTarget('all');
      }
    } catch (err) {
      logger.error('AdminNotifiche: invio', err);
      setResult({ error: 'Errore di rete. Controlla la connessione.' });
    } finally {
      setSending(false);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const card = {
    backgroundColor: C.card,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '16px',
    border: `1px solid ${C.border}`,
  };

  const label = {
    display: 'block',
    fontSize: '0.8rem',
    color: C.textLight,
    marginBottom: '6px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  };

  const input = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: `1px solid ${C.border}`,
    backgroundColor: C.bg,
    color: C.text,
    fontSize: '0.95rem',
    marginBottom: '14px',
    boxSizing: 'border-box',
  };

  const textarea = {
    ...input,
    minHeight: '80px',
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  const select = {
    ...input,
    marginBottom: '0',
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div>
      <h3 style={{ color: C.text, marginBottom: '4px', fontSize: '1.15rem' }}>
        <Icon name="bell" size={18} /> Notifiche Push
      </h3>
      <p style={{ color: C.textLight, fontSize: '0.85rem', marginBottom: '20px' }}>
        Invia una notifica push agli utenti con le notifiche attive.
      </p>

      {/* Stats subscriber */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: '14px' }}>
        <span style={{ fontSize: '2rem' }}>📲</span>
        <div>
          {subscribersLoading
            ? <span style={{ color: C.textLight }}>Caricamento…</span>
            : <>
                <span style={{ fontSize: '1.4rem', fontWeight: '700', color: C.accent }}>
                  {subscribers.length}
                </span>
                <span style={{ color: C.textLight, marginLeft: '6px', fontSize: '0.9rem' }}>
                  {subscribers.length === 1 ? 'utente iscritto' : 'utenti iscritti'}
                </span>
              </>
          }
        </div>
      </div>

      {/* Form */}
      <div style={card}>
        <h4 style={{ color: C.text, marginBottom: '16px', fontSize: '0.95rem' }}>
          Componi la notifica
        </h4>

        <label style={label}>Titolo *</label>
        <input
          style={input}
          placeholder="es. Aggiornamento normativa"
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={80}
        />

        <label style={label}>Testo *</label>
        <textarea
          style={textarea}
          placeholder="es. Sono disponibili nuove disposizioni sul limite di velocità in autostrada."
          value={body}
          onChange={e => setBody(e.target.value)}
          maxLength={200}
        />

        <label style={label}>URL di apertura (opzionale)</label>
        <input
          style={input}
          placeholder="/ oppure /normativa"
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        <label style={label}>Destinatari</label>
        <select
          style={select}
          value={target}
          onChange={e => setTarget(e.target.value)}
        >
          <option value="all">Tutti gli iscritti ({subscribers.length})</option>
          {subscribers.map(s => {
            const p = s.profiles;
            const name = p ? `${p.nome || ''} ${p.cognome || ''}`.trim() || p.email : s.user_id;
            return (
              <option key={s.user_id} value={s.user_id}>{name}</option>
            );
          })}
        </select>

        <button
          onClick={handleSend}
          disabled={sending || !title.trim() || !body.trim() || subscribers.length === 0}
          style={{
            ...S.btnPrimary,
            marginTop: '18px',
            width: '100%',
            backgroundColor: C.accent,
            opacity: (sending || !title.trim() || !body.trim()) ? 0.6 : 1,
            cursor: (sending || !title.trim() || !body.trim()) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {sending
            ? 'Invio in corso…'
            : <><Icon name="send" size={16} /> Invia notifica</>}
        </button>
      </div>

      {/* Risultato */}
      {result && (
        <div style={{
          ...card,
          borderLeft: `4px solid ${result.error ? C.danger : C.success}`,
        }}>
          {result.error
            ? <p style={{ color: C.danger, margin: 0 }}>❌ {result.error}</p>
            : <>
                <p style={{ color: C.success, fontWeight: '700', margin: '0 0 4px' }}>
                  ✅ Notifica inviata con successo
                </p>
                <p style={{ color: C.textLight, fontSize: '0.85rem', margin: 0 }}>
                  Consegnata: <strong>{result.sent}</strong>
                  {result.failed > 0 && <> · Fallite: <strong>{result.failed}</strong></>}
                  {result.expired > 0 && <> · Subscription scadute rimosse: <strong>{result.expired}</strong></>}
                </p>
              </>
          }
        </div>
      )}

      {/* Lista iscritti */}
      {!subscribersLoading && subscribers.length > 0 && (
        <div style={card}>
          <h4 style={{ color: C.text, marginBottom: '12px', fontSize: '0.9rem' }}>
            Utenti con notifiche attive
          </h4>
          {subscribers.map(s => {
            const p = s.profiles;
            const name = p ? `${p.nome || ''} ${p.cognome || ''}`.trim() || p.email : '—';
            const email = p?.email || s.user_id;
            const since = new Date(s.updated_at).toLocaleDateString('it-IT');
            return (
              <div key={s.user_id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 0',
                borderBottom: `1px solid ${C.border}`,
                fontSize: '0.85rem',
              }}>
                <div>
                  <span style={{ color: C.text, fontWeight: '500' }}>{name}</span>
                  <span style={{ color: C.textLight, marginLeft: '8px' }}>{email}</span>
                </div>
                <span style={{ color: C.textLight, fontSize: '0.75rem' }}>iscritto {since}</span>
              </div>
            );
          })}
        </div>
      )}

      {!subscribersLoading && subscribers.length === 0 && (
        <div style={{ ...card, textAlign: 'center', color: C.textLight }}>
          <p>Nessun utente ha ancora attivato le notifiche push.</p>
          <p style={{ fontSize: '0.8rem' }}>Gli utenti possono attivarle dal proprio Profilo.</p>
        </div>
      )}
    </div>
  );
};
