import React, { useState, useRef, useEffect } from 'react';
import { C } from '../../styles/theme';

const TABS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'normativa', icon: '📖', label: 'CdS' },
  { id: 'prontuario', icon: '📋', label: 'Prontuario' },
  { id: 'preferiti', icon: '⭐', label: 'Preferiti' },
  { id: 'ricerca', icon: '🔍', label: 'Cerca' },
  { id: 'calcolatore', icon: '🧮', label: 'Calcolo' },
  { id: 'news', icon: '📰', label: 'News' },
  { id: 'links', icon: '🔗', label: 'Links' },
  { id: 'profilo', icon: '👤', label: 'Profilo' },
];

export const BottomNav = ({ currentPage, onNavigate }) => {
  const [showRightFade, setShowRightFade] = useState(true);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftFade(scrollLeft > 0);
    // Margine di tolleranza di 2px per l'arrotondamento
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    // Controllo iniziale per vedere se serve mostrare la freccia
    setTimeout(handleScroll, 100);
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  return (
    <div style={{ position: 'sticky', bottom: 0, zIndex: 100, width: '100%', backgroundColor: '#fff', borderTop: `1px solid ${C.border}`, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
      <style>
        {`
          @keyframes bounceRight {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(4px); }
          }
        `}
      </style>
      
      {/* Sfumatura e freccetta a sinistra */}
      {showLeftFade && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '24px', background: 'linear-gradient(to right, rgba(255,255,255,1), transparent)', pointerEvents: 'none', zIndex: 10 }} />
      )}

      {/* Sfumatura e freccetta a destra (indica che ci sono altri elementi) */}
      {showRightFade && (
        <div style={{ 
          position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px', 
          background: 'linear-gradient(to left, rgba(255,255,255,1) 30%, transparent)', 
          pointerEvents: 'none', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '4px' 
        }}>
          <span style={{ fontSize: '1.5rem', color: C.primary, animation: 'bounceRight 1.5s infinite', opacity: 0.8, marginTop: '-12px' }}>
            ›
          </span>
        </div>
      )}

      <nav 
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '8px 16px calc(env(safe-area-inset-bottom, 8px) + 8px) 16px',
          overflowX: 'auto',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none',  // IE and Edge
          WebkitOverflowScrolling: 'touch',
          gap: '16px',
          position: 'relative'
        }}
      >
        {/* Nasconde la scrollbar su Chrome/Safari */}
        <style>
          {`nav::-webkit-scrollbar { display: none; }`}
        </style>

        {TABS.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                padding: '4px',
                minWidth: '56px',
                flexShrink: 0,
                color: isActive ? C.primary : C.textLight,
                transition: 'color 0.2s ease',
              }}
            >
              <span style={{ fontSize: '1.4rem', marginBottom: '4px', filter: isActive ? 'none' : 'grayscale(100%) opacity(0.6)' }}>
                {tab.icon}
              </span>
              <span style={{ fontSize: '0.65rem', fontWeight: isActive ? '700' : '500' }}>
                {tab.label}
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
