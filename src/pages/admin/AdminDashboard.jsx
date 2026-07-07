import React, { useState, useEffect } from 'react';
import { C } from '../../styles/theme';
import { Icon } from '../../components/ui/Icon';
import { S } from '../../styles/styles';
import { useNews } from '../../hooks/useNews';

import { useProntuario } from '../../hooks/useProntuario';
import { useNormativa } from '../../hooks/useNormativa';
import { useAuth } from '../../hooks/useAuth';
import { DB_VERSION_CDS } from '../../config/constants';
import { supabase, isSupabaseConfigured } from '../../config/supabase';

export const AdminDashboard = ({ onNavigate }) => {
  const { list: newsList } = useNews();
  const { list: prontuarioList } = useProntuario();
  const { list: normativaList } = useNormativa();
  const { userCount } = useAuth();
  const [segnalazioniCount, setSegnalazioniCount] = useState(0);
  const [supabaseStatus, setSupabaseStatus] = useState('Verifica...');

  useEffect(() => {
    const fetchCount = async () => {
      let count = 0;
      let errorOccurred = false;

      if (isSupabaseConfigured && supabase) {
        try {
          const { count: dbCount, error } = await supabase
            .from('segnalazioni')
            .select('*', { count: 'exact', head: true });
          if (!error && dbCount !== null) {
            count = dbCount;
          } else {
            errorOccurred = true;
          }
        } catch {
          errorOccurred = true;
        }
      } else {
        errorOccurred = true;
      }

      if (errorOccurred) {
        try {
          const local = localStorage.getItem('polisroad_local_segnalazioni');
          const list = local ? JSON.parse(local) : [];
          count = list.length;
        } catch {
          count = 0;
        }
      }
      setSegnalazioniCount(count);
    };
    fetchCount();
  }, []);

  // Ping Supabase per stato reale
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setSupabaseStatus('Non configurato');
      return;
    }
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .then(({ error }) => {
        setSupabaseStatus(error ? 'Degradato ⚠️' : 'Operativo ✓');
      })
      .catch(() => setSupabaseStatus('Non raggiungibile ✗'));
  }, []);

  return (
    <div>
      <h2 style={S.sectionTitle}>Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        <StatCard title="Operatori Iscritti" count={userCount} color={C.accent} icon="user" onClick={() => onNavigate('admin_utenti')} />
        <StatCard title="Segnalazioni Attive" count={segnalazioniCount} color={C.danger} icon="shield-alert" onClick={() => onNavigate('admin_segnalazioni')} />
        <StatCard title="Voci Prontuario" count={prontuarioList.length} color={C.primary} icon="clipboard-list" onClick={() => onNavigate('admin_prontuario')} />
        <StatCard title="Articoli Normativa" count={normativaList.length} color={C.success} icon="book-open" onClick={() => onNavigate('admin_normativa')} />
        <StatCard title="News Pubblicate" count={newsList.filter(n => n.pubblicato).length} color={C.warning} icon="megaphone" onClick={() => onNavigate('admin_news')} />
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
            <span style={{ color: supabaseStatus.includes('Operativo') ? C.success : C.warning }}>{supabaseStatus}</span>
          </div>
          <div style={S.infoRow}>
            <span style={{ color: C.textLight }}>Stato Backup:</span>
            <span style={S.valueText}>
              {isSupabaseConfigured && supabase ? 'Gestito da Supabase (Giornaliero automatico)' : 'Non disponibile (Database locale / Demo)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, count, color, icon, onClick }) => (
  <div
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
    style={{ ...S.card, borderLeft: `4px solid ${color}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s ease', ':hover': { transform: 'translateY(-2px)' } }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={S.labelUppercase}>{title}</span>
      <span style={{ color }}><Icon name={icon} size={22} /></span>
    </div>
    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: C.text }}>{count}</div>
  </div>
);
