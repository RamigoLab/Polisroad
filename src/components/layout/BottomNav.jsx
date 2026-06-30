import React, { useState, useEffect } from 'react';
import { LS } from '../../styles/layout';
import { C } from '../../styles/theme';
import { NAV_ITEMS_PRIMARY } from '../../config/navigation';
import { Icon } from '../ui/Icon';

export const BottomNav = ({ currentPage, onNavigate }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <div style={LS.navContainer} className="app-bottom-nav">
      {/* Status bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '4px 16px 0', gap: '5px',
        fontSize: '0.6rem', color: C.textLight, opacity: 0.7,
      }}>
        <div style={{
          width: '5px', height: '5px', borderRadius: '50%',
          backgroundColor: isOnline ? '#22c55e' : C.danger,
          boxShadow: `0 0 5px ${isOnline ? '#22c55e' : C.danger}`,
        }} />
        <span style={{ fontWeight: '600' }}>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      <nav style={LS.navScroll} role="navigation" aria-label="Navigazione principale">
        {NAV_ITEMS_PRIMARY.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              style={LS.navTab(isActive)}
              role="button"
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onNavigate(tab.id)}
            >
              <span style={LS.navTabIndicator(isActive)}>
                <Icon
                  name={tab.icon}
                  size={22}
                  color={isActive ? C.accent : C.textLight}
                  strokeWidth={isActive ? 2.25 : 1.75}
                />
              </span>
              <span style={LS.navTabLabel(isActive)}>{tab.label}</span>
            </div>
          );
        })}
      </nav>
    </div>
  );
};
