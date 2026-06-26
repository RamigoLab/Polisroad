/**
 * PendingApprovalScreen.jsx
 *
 * Schermata mostrata agli utenti il cui account è stato registrato ma non
 * ancora approvato dall'amministratore.
 *
 * Funzionamento:
 * - Polling ogni 10 secondi su `refreshProfile` (ricarica il profilo da Supabase).
 * - Quando l'admin approva → `isApproved` diventa true in useAuth → App.jsx
 *   smonta questa schermata e mostra l'app normalmente, senza che l'utente
 *   debba fare nulla.
 * - Feedback visivo: pulsante "Verifica ora" per un controllo manuale immediato,
 *   con spinner durante il refresh.
 * - In caso di errore profilo (RLS/rete) mostra un messaggio dedicato con
 *   pulsante "Riprova".
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '../utils/logger';

const POLL_INTERVAL_MS = 10_000; // 10 secondi

export default function PendingApprovalScreen({ email, profileError, profile, refreshProfile, signOut }) {
  const [checking, setChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const checkingRef = useRef(false); // ref per evitare stale closure nel setInterval

  const doRefresh = useCallback(async () => {
    if (checkingRef.current) return;
    checkingRef.current = true;
    setChecking(true);
    try {
      await refreshProfile();
      setLastChecked(new Date());
    } catch (err) {
      logger.warn('PendingApprovalScreen: refresh profilo fallito', err);
    } finally {
      checkingRef.current = false;
      setChecking(false);
    }
  }, [refreshProfile]); // checking rimosso dalle dipendenze: usiamo il ref

  // Avvia il polling automatico al mount, lo ferma all'unmount.
  // doRefresh è stabile (dipende solo da refreshProfile) quindi l'interval
  // non viene mai ricreato inutilmente.
  useEffect(() => {
    const id = setInterval(doRefresh, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [doRefresh]);

  const base = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 24px',
    textAlign: 'center',
    backgroundColor: 'var(--bg-global)',
  };

  const btnPrimary = {
    padding: '12px 24px',
    backgroundColor: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
    opacity: checking ? 0.7 : 1,
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  };

  const btnSecondary = {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: 'var(--color-text-light)',
    border: '1px solid var(--color-border)',
    borderRadius: '10px',
    fontWeight: '600',
    cursor: 'pointer',
  };

  // --- Schermata errore profilo (RLS / rete) ---
  if (profileError || !profile) {
    return (
      <div style={base}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
        <h2 style={{ color: 'var(--color-primary)', marginBottom: '12px', fontSize: '1.3rem' }}>
          Errore caricamento profilo
        </h2>
        <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '340px', marginBottom: '24px' }}>
          Impossibile caricare i dati del tuo account. Verifica la connessione e riprova,
          oppure contatta l'amministratore.
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '24px' }}>
          Account: <strong>{email}</strong>
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            style={btnPrimary}
            disabled={checking}
            onClick={doRefresh}
          >
            {checking ? <Spinner /> : null}
            Riprova
          </button>
          <button style={btnSecondary} onClick={signOut}>Esci</button>
        </div>
      </div>
    );
  }

  // --- Schermata attesa approvazione ---
  return (
    <div style={base}>
      <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⏳</div>
      <h2 style={{ color: 'var(--color-primary)', marginBottom: '12px', fontSize: '1.3rem' }}>
        Account in attesa di approvazione
      </h2>
      <p style={{ color: 'var(--color-text-light)', fontSize: '0.95rem', lineHeight: 1.6, maxWidth: '320px', marginBottom: '8px' }}>
        La tua registrazione è stata ricevuta. Un amministratore verificherà le tue
        credenziali e attiverà l'account a breve.
      </p>
      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', marginBottom: '8px' }}>
        Registrato come: <strong>{email}</strong>
      </p>

      {/* Feedback polling */}
      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginBottom: '28px', minHeight: '18px' }}>
        {checking
          ? 'Verifica in corso…'
          : lastChecked
            ? `Ultimo controllo: ${lastChecked.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
            : 'Controllo automatico ogni 10 secondi'}
      </p>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          style={btnPrimary}
          disabled={checking}
          onClick={doRefresh}
          title="Controlla subito se l'account è stato approvato"
        >
          {checking ? <Spinner /> : '🔄'}
          Verifica ora
        </button>
        <button style={btnSecondary} onClick={signOut}>Esci</button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '14px',
        height: '14px',
        border: '2px solid rgba(255,255,255,0.4)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}
