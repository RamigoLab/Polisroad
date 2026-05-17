import React, { useState, useRef, useEffect } from 'react';
import { LS } from '../../styles/layout';


const TABS = [
  { id: 'home', icon: '🏠', label: 'Home' },
  { id: 'normativa', icon: '📖', label: 'Normativa' },
  { id: 'prontuario', icon: '📋', label: 'Prontuario' },
  { id: 'preferiti', icon: '⭐', label: 'Preferiti' },
  { id: 'ricerca', icon: '🔍', label: 'Cerca' },
  { id: 'calcolatore', icon: '🧮', label: 'Calcolatore' },
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

    return () => {
      window.removeEventListener('resize', handleScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  return (
    <div style={LS.navContainer}>
      <style>
        {`
          @keyframes bounceRight {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(4px); }
          }
          nav::-webkit-scrollbar { display: none; }
        `}
      </style>
      
      {showLeftFade && <div style={LS.navFadeLeft} />}

      {showRightFade && (
        <div style={LS.navFadeRight}>
          <span style={{ ...LS.navArrow, animation: 'bounceRight 1.5s infinite' }}>
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
