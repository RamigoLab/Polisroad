import React, { useState, useRef } from 'react';
import { C } from '../styles/theme';
import { Icon } from './ui/Icon';

const ONBOARDING_KEY = 'polisroad_onboarding_done';

export function isOnboardingDone() {
  return localStorage.getItem(ONBOARDING_KEY) === 'true';
}
export function markOnboardingDone() {
  localStorage.setItem(ONBOARDING_KEY, 'true');
}

const SLIDES = [
  {
    iconName: 'shield-check',
    iconBg: '#dbeafe', iconColor: '#1e40af',
    title: 'Benvenuto in PolisRoad',
    body: 'Lo strumento digitale pensato per le Forze dell\'Ordine italiane. Accedi al Codice della Strada, al Prontuario delle sanzioni e alle ultime notizie normative — sempre con te, anche offline.',
  },
  {
    iconName: 'clipboard-list',
    iconBg: '#dcfce7', iconColor: '#15803d',
    title: 'Prontuario & Normativa',
    body: 'Cerca qualsiasi articolo del Codice della Strada o voce del Prontuario sanzioni. La ricerca globale trova in simultanea su entrambi gli archivi. Salva le voci che usi di più tra i ⭐ Preferiti.',
  },
  {
    iconName: 'shield-alert',
    iconBg: '#fee2e2', iconColor: '#dc2626',
    title: 'Modalità Operatore',
    body: 'Un\'interfaccia semplificata pensata per l\'uso sul campo: meno distrazioni, accesso rapido alle voci essenziali. Attivala dalla schermata principale quando sei in servizio.',
  },
  {
    iconName: 'wifi-off',
    iconBg: '#fef3c7', iconColor: '#d97706',
    title: 'Funziona anche offline',
    body: 'Prontuario e Normativa sono disponibili senza connessione dopo il primo caricamento. Le modifiche (preferiti, note) vengono sincronizzate automaticamente al rientro online.',
  },
];

export const Onboarding = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const touchStartX = useRef(null);

  const handleDone = () => {
    markOnboardingDone();
    onDone?.();
  };

  const goNext = () => step < SLIDES.length - 1 ? setStep(s => s + 1) : handleDone();
  const goPrev = () => step > 0 && setStep(s => s - 1);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (!touchStartX.current) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (dx < -50) goNext();
    if (dx > 50) goPrev();
    touchStartX.current = null;
  };

  const slide = SLIDES[step];
  const isLast = step === SLIDES.length - 1;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, var(--color-primary) 0%, var(--color-accent) 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
        userSelect: 'none',
      }}
    >
      {/* Indicatori step */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '48px' }}>
        {SLIDES.map((_, i) => (
          <div
            key={i}
            onClick={() => setStep(i)}
            style={{
              width: i === step ? '24px' : '8px',
              height: '8px',
              borderRadius: '4px',
              backgroundColor: i === step ? '#fff' : 'rgba(255,255,255,0.35)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* Icona centrale */}
      <div style={{
        width: '96px', height: '96px',
        backgroundColor: slide.iconBg,
        borderRadius: '28px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '32px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
      }}>
        <Icon name={slide.iconName} size={44} color={slide.iconColor} strokeWidth={1.5} />
      </div>

      {/* Testo */}
      <h2 style={{
        color: '#fff', fontSize: '1.6rem', fontWeight: '800',
        textAlign: 'center', marginBottom: '16px', lineHeight: '1.25',
        letterSpacing: '-0.3px',
      }}>
        {slide.title}
      </h2>
      <p style={{
        color: 'rgba(255,255,255,0.75)', fontSize: '1rem',
        textAlign: 'center', lineHeight: '1.65', maxWidth: '320px',
        marginBottom: '64px',
      }}>
        {slide.body}
      </p>

      {/* Pulsanti */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', maxWidth: '320px' }}>
        <button
          onClick={goNext}
          style={{
            padding: '15px', borderRadius: '999px',
            backgroundColor: '#fff', color: 'var(--color-primary)',
            fontWeight: '800', fontSize: '1rem',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          }}
        >
          {isLast ? 'Inizia a usare PolisRoad →' : 'Continua →'}
        </button>
        <button
          onClick={handleDone}
          style={{
            padding: '12px',
            backgroundColor: 'transparent',
            color: 'rgba(255,255,255,0.6)',
            fontWeight: '600', fontSize: '0.88rem',
            border: 'none', cursor: 'pointer',
          }}
        >
          Salta introduzione
        </button>
      </div>
    </div>
  );
};
