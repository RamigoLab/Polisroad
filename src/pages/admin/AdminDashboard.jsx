import React from 'react';
import { C } from '../../styles/theme';
import { S } from '../../styles/styles';
import { PS } from '../../styles/pages';
import { useNews } from '../../hooks/useNews';
import { useProntuario } from '../../hooks/useProntuario';
import { useNormativa } from '../../hooks/useNormativa';
import { useAuth } from '../../hooks/useAuth';
import { DB_VERSION_CDS, SYSTEM_STATUS } from '../../config/constants';

export const AdminDashboard = () => {
  const { list: newsList } = useNews();
  const { list: prontuarioList } = useProntuario();
  const { list: normativaList } = useNormativa();
  const { userCount } = useAuth();

  return (
    <div>
      <h2 style={S.sectionTitle}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <StatCard title="Operatori Iscritti" count={userCount} color={C.accent} icon="👮" />
        <StatCard title="Voci Prontuario" count={prontuarioList.length} color={C.primary} icon="📋" />
        <StatCard title="Articoli Normativa" count={normativaList.length} color={C.success} icon="📖" />
        <StatCard title="News Pubblicate" count={newsList.filter(n => n.pubblicato).length} color={C.warning} icon="📢" />
      </div>

      <div style={{ marginTop: '32px', ...S.card, border: `1px solid ${C.border}` }}>
        <h4 style={{ color: C.text, marginBottom: '12px', borderBottom: `1px solid ${C.border}`, paddingBottom: '8px' }}>
          Informazioni Sistema
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={S.infoRow}>
            <span style={{ color: C.textLight }}>Versione DB CdS:</span>
            <span style={S.valuePrimary}>{DB_VERSION_CDS}</span>
          </div>
          <div style={S.infoRow}>
            <span style={{ color: C.textLight }}>Stato Server:</span>
            <span style={S.valueSuccess}>{SYSTEM_STATUS}</span>
          </div>
          <div style={S.infoRow}>
            <span style={{ color: C.textLight }}>Ultimo Backup:</span>
            <span style={S.valueText}>Oggi, 03:00 AM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, count, color, icon }) => (
  <div style={{ ...S.card, borderLeft: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={S.labelUppercase}>{title}</span>
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: C.text }}>{count}</div>
  </div>
);
