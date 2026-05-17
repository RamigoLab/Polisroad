import React from 'react';
import { C } from '../../styles/theme';

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

export const Sidebar = ({ currentPage, onNavigate }) => {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-logo-container" onClick={() => onNavigate('home')}>
        <img src="/icons/icon-192.png" alt="PolisRoad Logo" className="sidebar-logo" />
        <div className="sidebar-logo-text">
          <span className="sidebar-title">PolisRoad</span>
          <span className="sidebar-tagline">Smart Enforcement</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {TABS.map((tab) => {
          const isActive = currentPage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`sidebar-tab-btn ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-tab-icon">{tab.icon}</span>
              <span className="sidebar-tab-label">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <span className="sidebar-status-dot" />
        <span className="sidebar-status-text">Operativo | v1.0.2</span>
      </div>
    </aside>
  );
};
