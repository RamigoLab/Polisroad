import React from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { C } from '../../styles/theme';

export const AdminLayout = ({ children, currentTab, onNavigate }) => {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: C.text, color: '#fff', minHeight: '100vh' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid #444', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>⚙️</span>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Pannello Admin</h2>
        </div>
        <button onClick={() => onNavigate('home')} style={{ color: C.accentLight, padding: '4px' }}>Chiudi</button>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto', padding: '12px 16px', borderBottom: '1px solid #444', gap: '12px', scrollbarWidth: 'none' }}>
        {['dashboard', 'news', 'prontuario', 'normativa'].map(tab => (
          <button 
            key={tab}
            onClick={() => onNavigate(`admin_${tab}`)}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: currentTab === tab ? C.accent : 'transparent',
              color: currentTab === tab ? '#fff' : '#aaa',
              borderRadius: '20px',
              border: `1px solid ${currentTab === tab ? C.accent : '#666'}`,
              textTransform: 'capitalize',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, backgroundColor: C.surface, color: C.text, borderTopLeftRadius: '24px', borderTopRightRadius: '24px', marginTop: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <PageWrapper style={{ padding: '24px 16px' }}>
          {children}
        </PageWrapper>
      </div>
    </div>
  );
};
