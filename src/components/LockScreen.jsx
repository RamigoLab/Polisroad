import React, { useState, useEffect, useRef } from 'react';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';
import { useAppLock } from '../context/AppLockContext';
import { useAuth } from '../hooks/useAuth';
import { APP_VERSION } from '../config/constants';

const PIN_LENGTH = 4;

export const LockScreen = () => {
  const {
    hasBiometric, unlockWithBiometric, unlockWithPin,
    attemptsRemaining, forceReauth, isPlatformAuthenticatorAvailable,
  } = useAppLock();
  const { profile, signOut } = useAuth();

  const [showPinPad, setShowPinPad] = useState(!hasBiometric);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [bioAvailable, setBioAvailable] = useState(false);
  const autoTriedRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    if (hasBiometric) {
      isPlatformAuthenticatorAvailable().then(ok => { if (mounted) setBioAvailable(ok); });
    }
    return () => { mounted = false; };
  }, [hasBiometric, isPlatformAuthenticatorAvailable]);

  // Troppi PIN sbagliati: nessuna via locale, serve il login vero da capo.
  useEffect(() => {
    if (forceReauth) signOut();
  }, [forceReauth, signOut]);

  const handleBiometric = async () => {
    setScanning(true);
    try {
      const ok = await unlockWithBiometric();
      if (!ok) setShowPinPad(true);
    } catch {
      setShowPinPad(true);
    } finally {
      setScanning(false);
    }
  };

  const pressDigit = async (d) => {
    if (pin.length >= PIN_LENGTH) return;
    const next = pin + d;
    setPin(next);
    if (next.length === PIN_LENGTH) {
      const ok = await unlockWithPin(next);
      if (!ok) {
        setError(true);
        setTimeout(() => { setError(false); setPin(''); }, 400);
      } else {
        setPin('');
      }
    }
  };
  const backspace = () => setPin(p => p.slice(0, -1));

  // Al risveglio dello schermo, se l'impronta/Face ID è disponibile deve
  // partire da sola (come un vero unlock nativo) invece di aspettare il tap
  // sull'icona. Un solo tentativo automatico per sessione di blocco: se
  // l'utente annulla o fallisce, resta libero di passare al PIN senza che
  // il sistema ritenti da solo in loop.
  useEffect(() => {
    if (!showPinPad && hasBiometric && bioAvailable && !scanning && !autoTriedRef.current) {
      autoTriedRef.current = true;
      handleBiometric();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPinPad, hasBiometric, bioAvailable]);

  // Su desktop il PIN va digitabile da tastiera fisica, non solo cliccando
  // i tasti a schermo.
  useEffect(() => {
    if (showPinPad === false) return undefined;
    const onKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        pressDigit(e.key);
      } else if (e.key === 'Backspace') {
        backspace();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [showPinPad, pin]);

  const officerName = profile ? `${profile.grado || ''} ${profile.nome || ''} ${profile.cognome || ''}`.trim() : '';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="App bloccata"
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 28px',
      }}
    >
      <div style={{
        width: '76px', height: '76px', borderRadius: '20px',
        background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '18px', boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
      }}>
        <Icon name="lock" size={34} color="#fff" strokeWidth={1.8} />
      </div>
      <h1 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: '800', letterSpacing: '-0.3px' }}>PolisRoad</h1>
      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem', fontWeight: '500', marginTop: '4px' }}>
        App bloccata
      </p>
      {officerName && (
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.95rem', fontWeight: '700', marginTop: '30px' }}>
          {officerName}
        </p>
      )}

      {!showPinPad && hasBiometric && bioAvailable ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '34px' }}>
          <button
            onClick={handleBiometric}
            disabled={scanning}
            aria-label="Sblocca con impronta o riconoscimento facciale"
            style={{
              width: '84px', height: '84px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.95)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            <Icon name="fingerprint" size={38} color={C.accent} strokeWidth={1.8} />
          </button>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem', fontWeight: '600', marginTop: '14px' }}>
            {scanning ? 'Verifica in corso…' : 'Tocca per sbloccare'}
          </p>
          <button
            onClick={() => setShowPinPad(true)}
            style={{ marginTop: '30px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer', padding: '8px' }}
          >
            Usa il PIN
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px', width: '100%' }}>
          <div style={{ display: 'flex', gap: '14px', margin: '10px 0 30px', animation: error ? 'shake 0.4s ease' : 'none' }}>
            {Array.from({ length: PIN_LENGTH }).map((_, i) => (
              <div key={i} style={{
                width: '14px', height: '14px', borderRadius: '50%',
                border: `1.5px solid ${error ? '#fca5a5' : 'rgba(255,255,255,0.6)'}`,
                background: (error || i < pin.length) ? (error ? '#fca5a5' : '#fff') : 'transparent',
                transition: 'background 0.15s ease',
              }} />
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', width: '100%', maxWidth: '260px' }}>
            {['1','2','3','4','5','6','7','8','9','','0','back'].map((k, i) => {
              if (k === '') return <div key={i} />;
              if (k === 'back') {
                return (
                  <button key={i} onClick={backspace} aria-label="Cancella cifra"
                    style={keyStyle}>
                    <Icon name="delete" size={20} color="#fff" strokeWidth={1.8} />
                  </button>
                );
              }
              return (
                <button key={i} onClick={() => pressDigit(k)} style={keyStyle}>{k}</button>
              );
            })}
          </div>
          <p style={{ color: '#fca5a5', fontSize: '0.78rem', fontWeight: '600', marginTop: '16px', height: '16px' }}>
            {attemptsRemaining < 5 ? `Tentativi rimasti: ${attemptsRemaining}` : ''}
          </p>
          {hasBiometric && bioAvailable && (
            <button
              onClick={() => setShowPinPad(false)}
              style={{ marginTop: '6px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', fontSize: '0.85rem', fontWeight: '600', textDecoration: 'underline', cursor: 'pointer', padding: '8px' }}
            >
              Usa l'impronta / Face ID
            </button>
          )}
        </div>
      )}

      <button
        onClick={signOut}
        style={{ position: 'absolute', bottom: '28px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: '600', cursor: 'pointer', padding: '8px' }}
      >
        Non sei tu? Esci e accedi di nuovo
      </button>
      <span style={{ position: 'absolute', bottom: '4px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>v{APP_VERSION}</span>

      <style>{`@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-6px)} 80%{transform:translateX(6px)} }`}</style>
    </div>
  );
};

const keyStyle = {
  aspectRatio: '1', borderRadius: '50%',
  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
  color: '#fff', fontSize: '1.3rem', fontWeight: '600',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
};
