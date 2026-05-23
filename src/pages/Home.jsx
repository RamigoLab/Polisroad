import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PS } from '../styles/pages';
import { useAuth } from '../hooks/useAuth';
import { useNews } from '../hooks/useNews';

export const Home = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { list: newsList } = useNews();
  const isAdmin = profile?.ruolo === 'admin';
  const bannerNews = newsList.find(n => n.categoria.toLowerCase() === 'banner' && n.pubblicato);
  const operatorName = `${profile?.grado || ''} ${profile?.nome || ''} ${profile?.cognome || ''}`.trim() || 'Operatore';

  return (
    <PageWrapper
      style={{ padding: 0 }}
      contentStyle={PS.homeBody}
      onNavigate={onNavigate}
      subtitle="Bentornato,"
      title={operatorName}
      meta={profile?.forza}
      onHeaderTitleClick={() => onNavigate('profilo')}
      headerChildren={
        <div style={PS.homeQuickActions}>
          <button onClick={() => onNavigate('ricerca')} style={PS.homeSearchBtn}>
            <span>🔍</span> Ricerca Rapida
          </button>
        </div>
      }
    >
      <button onClick={() => onNavigate('operatore')} style={PS.homeOperatoreBtn}>
        <span style={{ fontSize: '1.4rem' }}>🚨</span> ATTIVA MODALITÀ OPERATORE
      </button>

      <div style={PS.homeGrid}>
        <NavCard icon="📋" title="Prontuario" onClick={() => onNavigate('prontuario')} />
        <NavCard icon="📖" title="Normativa" onClick={() => onNavigate('normativa')} />
        <NavCard icon="🧮" title="Calcolatore" onClick={() => onNavigate('calcolatore')} />
        <NavCard icon="⭐" title="Preferiti" onClick={() => onNavigate('preferiti')} />
        <NavCard icon="📰" title="News" onClick={() => onNavigate('news')} />
        <NavCard icon="🔗" title="Links Utili" onClick={() => onNavigate('links')} />
        <NavCard icon="👤" title="Profilo" onClick={() => onNavigate('profilo')} />
      </div>

      {bannerNews && (
        <div style={PS.homeBannerBox}>
          <h4 style={PS.homeBannerTitle}>{bannerNews.titolo}</h4>
          <p style={PS.homeBannerText}>{bannerNews.contenuto}</p>
        </div>
      )}

      {isAdmin && (
        <button onClick={() => onNavigate('admin_dashboard')} style={PS.homeAdminBtn}>
          <span>⚙️</span> Pannello Admin
        </button>
      )}
    </PageWrapper>
  );
};

const NavCard = ({ icon, title, onClick }) => (
  <div onClick={onClick} style={PS.homeNavCard}>
    <span style={PS.homeNavCardIcon}>{icon}</span>
    <span style={PS.homeNavCardLabel}>{title}</span>
  </div>
);
