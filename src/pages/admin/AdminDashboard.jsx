import React from 'react';
import { C } from '../../styles/theme';
import { useNews } from '../../hooks/useNews';
import { useProntuario } from '../../hooks/useProntuario';
import { useNormativa } from '../../hooks/useNormativa';

export const AdminDashboard = () => {
  const { list: newsList } = useNews();
  const { list: prontuarioList } = useProntuario();
  const { list: normativaList } = useNormativa();

  return (
    <div>
      <h2 style={{ color: C.primary, marginBottom: '24px' }}>Dashboard</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <StatCard title="Voci Prontuario" count={prontuarioList.length} color={C.primary} icon="📋" />
        <StatCard title="Articoli Normativa" count={normativaList.length} color={C.success} icon="📖" />
        <StatCard title="News Totali" count={newsList.length} color={C.accent} icon="📰" />
        <StatCard title="News Pubblicate" count={newsList.filter(n => n.pubblicato).length} color={C.warning} icon="📢" />
      </div>

      <div style={{ marginTop: '32px', backgroundColor: '#fff', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
        <h4 style={{ color: C.text, marginBottom: '8px' }}>Informazioni Sistema</h4>
        <p style={{ fontSize: '0.9rem', color: C.textLight, marginBottom: '4px' }}>Versione DB: 1.0.0</p>
        <p style={{ fontSize: '0.9rem', color: C.textLight, marginBottom: '4px' }}>Ultimo Backup: Oggi, 03:00 AM</p>
        <p style={{ fontSize: '0.9rem', color: C.textLight }}>Stato Server: Online</p>
      </div>
    </div>
  );
};

const StatCard = ({ title, count, color, icon }) => (
  <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', borderLeft: `4px solid ${color}` }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '0.8rem', color: C.textLight, fontWeight: 'bold', textTransform: 'uppercase' }}>{title}</span>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: C.text }}>{count}</div>
  </div>
);
