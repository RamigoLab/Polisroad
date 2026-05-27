import React, { useState, useRef, useEffect } from 'react';
import { LS } from '../../styles/layout';
import { APP_VERSION } from '../../config/constants';


const TABS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'normativa', icon: '📖', label: 'Normativa' },
  { id: 'prontuario', icon: '📋', label: 'Prontuario' },
  { id: 'preferiti', icon: '⭐', label: 'Preferiti' },
  { id: 'ricerca', icon: '🔍', label: 'Cerca' },
  { id: 'calcolatore', icon: '🧮', label: 'Calcolatore' },
  { id: 'guide', icon: '📚', label: 'Guide Pratiche' },
  { id: 'news', icon: '📰', label: 'News' },
  { id: 'links', icon: '🔗', label: 'Links' },
  { id: 'profilo', icon: '👤', label: 'Profilo' },
];

export const BottomNav = ({ currentPage, onNavigate }) => {
  const [showRightFade, setShowRightFade] = useState(true);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const scrollRef = useRef(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeftFade(scrollLeft > 0);
    setShowRightFade(scrollLeft < scrollWidth - clientWidth - 2);
  };

  useEffect(() => {
    setTimeout(handleScroll, 100);
    window.addEventListener('resize', handleScroll);
    
    const scrollContainer = scrollRef.current;
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };
    
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('resize', handleScroll);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div style={LS.navContainer} className="app-bottom-nav">
      <style>
        {`
          @keyframes bounceRight {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(4px); }
          }
          nav::-webkit-scrollbar { display: none; }
        `}
      </style>
      
      {/* Network Status Header above tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '6px 16px 2px 16px',
        gap: '6px',
        fontSize: '0.65rem',
        color: 'var(--color-text-light)',
        borderBottom: '1px solid rgba(0,0,0,0.02)'
      }}>
        <div style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isOnline ? '#2ecc71' : '#e74c3c',
          boxShadow: `0 0 6px ${isOnline ? '#2ecc71' : '#e74c3c'}`
        }} />
        <span style={{ fontWeight: 'bold' }}>{isOnline ? 'Online' : 'Offline'} | v{APP_VERSION}</span>
      </div>

      {showLeftFade && <div style={LS.navFadeLeft} />}

      {showRightFade && (
        <div style={LS.navFadeRight}>
          <span style={{ ...LS.navArrow, animation: 'bounceRight 1.5s infinite', color: 'var(--color-primary)' }}>
            ›
          </span>
        </div>
      )}

      <nav ref={scrollRef} onScroll={handleScroll} style={LS.navScroll}>
        {TABS.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <div key={tab.id} onClick={() => onNavigate(tab.id)} style={LS.navTab(isActive)}>
              <span style={LS.navTabIcon(isActive)}>
                {tab.icon}
              </span>
              <span style={LS.navTabLabel(isActive)}>
                {tab.label}
              </span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
