/**
 * Skeleton.jsx — Placeholder animato (shimmer) per il caricamento.
 * Sostituisce gli spinner nelle sezioni principali per una UX più fluida.
 */
import React from 'react';
import { C } from '../../styles/theme';

// Keyframe shimmer iniettato una sola volta nel <head>
const STYLE_ID = 'polisroad-skeleton-style';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes pr-shimmer {
      0%   { background-position: -400px 0; }
      100% { background-position: 400px 0; }
    }
    .pr-skeleton {
      background: linear-gradient(90deg,
        var(--bg-surface-container) 25%,
        var(--bg-surface-container-high) 50%,
        var(--bg-surface-container) 75%
      );
      background-size: 800px 100%;
      animation: pr-shimmer 1.4s ease-in-out infinite;
      border-radius: 8px;
    }
  `;
  document.head.appendChild(style);
}

/** Blocco singolo di skeleton */
export const SkeletonBlock = ({ width = '100%', height = 16, style = {} }) => (
  <div
    className="pr-skeleton"
    style={{ width, height, borderRadius: 8, ...style }}
  />
);

/** Card skeleton — simula una card prontuario/normativa */
export const SkeletonCard = ({ lines = 3 }) => (
  <div style={{
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }}>
    <SkeletonBlock width="40%" height={12} />
    <SkeletonBlock width="80%" height={18} />
    {lines >= 3 && <SkeletonBlock width="65%" height={12} />}
    {lines >= 4 && <SkeletonBlock width="50%" height={12} />}
  </div>
);

/** Lista di N skeleton card */
export const SkeletonList = ({ count = 4, lines = 3 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} lines={lines} />
    ))}
  </div>
);

/** Skeleton per news card (con blocco immagine opzionale) */
export const SkeletonNewsCard = () => (
  <div style={{
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }}>
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      <SkeletonBlock width={40} height={40} style={{ borderRadius: '8px', flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <SkeletonBlock width="60%" height={11} />
        <SkeletonBlock width="90%" height={16} />
      </div>
    </div>
    <SkeletonBlock width="100%" height={12} />
    <SkeletonBlock width="75%" height={12} />
  </div>
);
