import React from 'react';
import { C } from '../../styles/theme';
import { LS } from '../../styles/layout';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', page: 'admin_dashboard' },
  { id: 'news', label: 'News', page: 'admin_news' },
  { id: 'prontuario', label: 'Prontuario', page: 'admin_prontuario' },
  { id: 'normativa', label: 'Normativa', page: 'admin_normativa' },
];

export const AdminLayout = ({ children, currentTab, onNavigate }) => {
  return (
    <div style={LS.adminContainer(C.text)}>
      <header style={LS.adminHeader}>
        <div style={LS.adminHeaderLeft}>
          <span>⚙️</span>
          <h2 style={LS.adminHeaderTitle}>Area Amministrativa</h2>
        </div>
        <button onClick={() => onNavigate('home')} style={LS.adminCloseBtn(C.accentLight)}>
          Chiudi
        </button>
      </header>

      <div style={LS.adminTabBar}>
        {ADMIN_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => onNavigate(tab.page)}
            style={LS.adminTab(currentTab === tab.id, C.accent)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <main style={LS.adminContent}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {children}
        </div>
      </main>
    </div>
  );
};
