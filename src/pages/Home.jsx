import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { C } from '../styles/theme';
import { PS } from '../styles/pages';
import { useAuth } from '../hooks/useAuth';
import { useNews } from '../hooks/useNews';

export const Home = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { list: newsList } = useNews();
  const isAdmin = profile?.ruolo === 'admin';
  const bannerNews = newsList.find(n => n.categoria.toLowerCase() === 'banner' && n.pubblicato);

  return (
    <PageWrapper style={{ padding: 0 }} hideLogo={true} onNavigate={onNavigate}>
      {/* Header */}
      <div style={PS.homeHeader}>
        <div style={PS.homeHeaderInner}>
          <div>
            <p style={PS.homeSubtitle}>Bentornato,</p>
            <h2 style={PS.homeName}>{profile?.grado} {profile?.nome} {profile?.cognome}</h2>
            <p style={PS.homeForza}>{profile?.forza}</p>
          </div>
          <div style={PS.homeLogoWrapper} onClick={() => onNavigate('home')}>
            <img src="/icons/icon-192.png" alt="PolisRoad" style={PS.homeLogo} />
          </div>
        </div>
        <div style={PS.homeQuickActions}>
          <button onClick={() => onNavigate('ricerca')} style={PS.homeSearchBtn}>
            <span>🔍</span> Ricerca Rapida
          </button>
        </div>
      </div>

      <div style={PS.homeBody}>
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
      </div>
    </PageWrapper>
  );
};

const NavCard = ({ icon, title, onClick }) => (
  <div onClick={onClick} style={PS.homeNavCard}>
    <span style={PS.homeNavCardIcon}>{icon}</span>
    <span style={PS.homeNavCardLabel}>{title}</span>
  </div>
);
