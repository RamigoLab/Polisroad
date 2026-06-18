import React, { useState, useEffect } from 'react';
import { APP_VERSION } from '../../config/constants';
import { NAV_ITEMS } from '../../config/navigation';
import { Icon } from '../ui/Icon';

export const Sidebar = ({ currentPage, onNavigate }) => {
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
    <aside className="app-sidebar">
      <div className="sidebar-logo-container" onClick={() => onNavigate('home')}>
        <img src="/icons/icon-192.png" alt="PolisRoad Logo" className="sidebar-logo" />
        <span className="sidebar-title">PolisRoad</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`sidebar-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-tab-icon"><Icon name={tab.icon} size={18} /></span>
              <span className="sidebar-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-status-dot" style={{ backgroundColor: isOnline ? '#2ecc71' : '#e74c3c' }} />
        <span className="sidebar-status-text">{isOnline ? 'Online' : 'Offline'} | v{APP_VERSION}</span>
      </div>
    </aside>
  );
};
