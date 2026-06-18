import React, { useState, useEffect } from 'react';
import { LS } from '../../styles/layout';
import { C } from '../../styles/theme';
import { APP_VERSION } from '../../config/constants';
import { NAV_ITEMS_PRIMARY } from '../../config/navigation';
import { Icon } from '../ui/Icon';

export const BottomNav = ({ currentPage, onNavigate }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div style={LS.navContainer} className="app-bottom-nav">
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

      <nav style={LS.navScroll}>
        {NAV_ITEMS_PRIMARY.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <div key={tab.id} onClick={() => onNavigate(tab.id)} style={LS.navTab(isActive)}>
              <span style={LS.navTabIndicator(isActive)}>
                <Icon name={tab.icon} size={20} color={isActive ? C.primary : C.textLight} />
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
