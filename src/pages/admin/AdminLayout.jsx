import React from 'react';
import { C } from '../../styles/theme';
import { Icon } from '../../components/ui/Icon';
import { LS } from '../../styles/layout';

const ADMIN_TABS = [
  { id: 'dashboard', label: 'Dashboard', page: 'admin_dashboard' },
  { id: 'utenti', label: 'Utenti', page: 'admin_utenti', icon: 'user' },
  { id: 'notifiche', label: 'Notifiche', page: 'admin_notifiche', icon: 'bell' },
  { id: 'segnalazioni', label: 'Segnalazioni', page: 'admin_segnalazioni', icon: 'shield-alert' },
  { id: 'news', label: 'News', page: 'admin_news' },
  { id: 'prontuario', label: 'Prontuario', page: 'admin_prontuario' },
  { id: 'normativa', label: 'Normativa', page: 'admin_normativa' },
  { id: 'sinonimi', label: 'Sinonimi', page: 'admin_sinonimi', icon: 'zap' },
];

export const AdminLayout = ({ children, currentTab, onNavigate }) => {
  return (
    <div style={LS.adminContainer(C.text)}>
      <header style={LS.adminHeader}>
        <div style={LS.adminHeaderLeft}>
          <span><Icon name="settings" size={18}/></span>
          <h2 style={LS.adminHeaderTitle}>Area Amministrativa</h2>
        </div>
        <button onClick={() => onNavigate('home')} style={LS.adminCloseBtn()}>
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
            {tab.icon && <Icon name={tab.icon} size={15} />}
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
