/**
 * Onboarding.jsx
 * Wizard di 4 schermate mostrato UNA SOLA VOLTA al primo accesso dopo la registrazione.
 * Flag in localStorage: 'polisroad_onboarding_done'.
 * Saltabile in qualsiasi momento. Supporta swipe orizzontale tra le schermate.
 */
import React, { useState, useRef } from 'react';
import { C } from '../styles/theme';

const ONBOARDING_KEY = 'polisroad_onboarding_done';

export function isOnboardingDone() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}

export function markOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

// ─── Contenuto schermate ─────────────────────────────────────────────────────
const SLIDES = [
  {
    icon: '🚔',
    title: 'Benvenuto in PolisRoad',
    body: 'Lo strumento digitale pensato per le Forze dell\'Ordine italiane. Accedi al Codice della Strada, al Prontuario delle sanzioni e alle ultime notizie normative — sempre con te, anche offline.',
    accent: '#1a3a5c',
  },
  {
    icon: '📋',
    title: 'Prontuario & Normativa',
    body: 'Cerca qualsiasi articolo del Codice della Strada o voce del Prontuario sanzioni. La ricerca intelligente tolera errori di battitura. Salva gli articoli che usi più spesso tra i ⭐ Preferiti.',
    accent: '#1e5a8a',
  },
  {
    icon: '🛡️',
    title: 'Modalità Operatore',
    body: 'Un\'interfaccia semplificata pensata per l\'uso sul campo: meno distrazioni, accesso rapido alle voci essenziali. Attivala dal menu principale quando sei in servizio.',
    accent: '#1a3a5c',
  },
  {
    icon: '🏆',
    title: 'Punti & Traguardi',
    body: 'Ogni articolo consultato, ogni contestazione registrata ti porta nuovi punti XP. Sali di livello, sblocca badge e mantieni la tua serie quotidiana. Imparare il Codice non è mai stato così coinvolgente.',
    accent: '#1e5a8a',
  },
];

export const Onboarding = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const touchStartX = useRef(null);

  const handleDone = () => {
    markOnboardingDone();
    onDone?.();
  };

  const next = () => step < SLIDES.length - 1 ? setStep(s => s + 1) : handleDone();
  const prev = () => step > 0 && setStep(s => s - 1);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (dx < -50) next();
    else if (dx > 50) prev();
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        backgroundColor: slide.accent,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '48px 28px 40px',
        transition: 'background-color 0.4s ease',
        color: '#fff',
      }}
    >
      {/* Tasto Salta */}
      <div style={{ alignSelf: 'flex-end' }}>
        <button
          onClick={handleDone}
          style={{
            background: 'rgba(255,255,255,0.15)', border: 'none',
            color: '#fff', padding: '8px 16px', borderRadius: '20px',
            fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer',
          }}
        >
          Salta
        </button>
      </div>

      {/* Contenuto centrale */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', maxWidth: '360px', textAlign: 'center' }}>
        <img
          src="/icons/icon-192.png"
          alt="PolisRoad"
          style={{ width: '80px', height: '80px', borderRadius: '20px', boxShadow: '0 4px 16px rgba(0,0,0,0.25)' }}
        />
        <div style={{ fontSize: '4rem', lineHeight: 1 }}>{slide.icon}</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '800', margin: 0, lineHeight: 1.3 }}>
          {slide.title}
        </h2>
        <p style={{ fontSize: '1rem', lineHeight: 1.6, margin: 0, opacity: 0.9 }}>
          {slide.body}
        </p>
      </div>

      {/* Footer: dots + bottone */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
        {/* Indicatori step */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              style={{
                width: i === step ? 24 : 8, height: 8,
                borderRadius: '4px',
                backgroundColor: i === step ? '#fff' : 'rgba(255,255,255,0.35)',
                transition: 'width 0.3s ease, background-color 0.3s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>

        {/* Bottone principale */}
        <button
          onClick={next}
          style={{
            width: '100%', maxWidth: '320px',
            padding: '16px', borderRadius: '14px',
            backgroundColor: '#fff',
            color: slide.accent,
            fontWeight: '800', fontSize: '1rem',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          }}
        >
          {isLast ? 'Inizia a usare PolisRoad →' : 'Continua'}
        </button>
      </div>
    </div>
  );
};
