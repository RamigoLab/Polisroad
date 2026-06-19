import React, { useState, useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PS } from '../styles/pages';
import { S } from '../styles/styles';
import { C } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { useNews } from '../hooks/useNews';
import { APP_VERSION } from '../config/constants';
import { Icon } from '../components/ui/Icon';

export const Home = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { list: newsList } = useNews();
  const isAdmin = profile?.ruolo === 'admin';
  const bannerNews = newsList.find(n => n.categoria.toLowerCase() === 'banner' && n.pubblicato);
  const popupNewsList = newsList.filter(n => n.categoria.toLowerCase() === 'popup' && n.pubblicato);
  const notificaNewsList = newsList.filter(n => n.categoria.toLowerCase() === 'notifica' && n.pubblicato);
  
  const [showPopup, setShowPopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);

  useEffect(() => {
    if (popupNewsList.length > 0) {
      // Show the latest popup if not already dismissed
      const latestPopup = popupNewsList[0];
      const dismissed = localStorage.getItem(`polisroad_dismissed_popup_${latestPopup.id}`);
      if (!dismissed) {
        setCurrentPopup(latestPopup);
        setShowPopup(true);
      }
    }
  }, [popupNewsList]);

  const handleDismissPopup = () => {
    if (currentPopup) {
      localStorage.setItem(`polisroad_dismissed_popup_${currentPopup.id}`, 'true');
    }
    setShowPopup(false);
  };

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
            <Icon name="search" size={18} /> Ricerca Rapida
          </button>
        </div>
      }
    >
      <button onClick={() => onNavigate('operatore')} style={PS.homeOperatoreBtn}>
        <Icon name="shield-alert" size={22} /> ATTIVA MODALITÀ OPERATORE
      </button>

      <div style={PS.homeGrid}>
        <NavCard icon="clipboard-list" title="Prontuario"    color="#1976d2" bg="#e3f0fb" onClick={() => onNavigate('prontuario')} />
        <NavCard icon="book-open"      title="Normativa"     color="#1a7a4a" bg="#e6f4ed" onClick={() => onNavigate('normativa')} />
        <NavCard icon="calculator"     title="Calcolatore"   color="#b45309" bg="#fdf3e0" onClick={() => onNavigate('calcolatore')} />
        <NavCard icon="star"           title="Preferiti"     color="#c0392b" bg="#fbeaea" onClick={() => onNavigate('preferiti')} />
        <NavCard icon="graduation-cap" title="Guide Pratiche" color="#7b2d8b" bg="#f3e8f9" onClick={() => onNavigate('guide')} />
        <NavCard icon="newspaper"      title="News"          color="#1a3a5c" bg="#e8eef6" onClick={() => onNavigate('news')} />
        <NavCard icon="link"           title="Links Utili"   color="#0d7377" bg="#e0f5f5" onClick={() => onNavigate('links')} />
        <NavCard icon="user"           title="Profilo"       color="#555"    bg="#f0f0f0" onClick={() => onNavigate('profilo')} />
      </div>

      {bannerNews && (
        <div style={PS.homeBannerBox}>
          <h4 style={PS.homeBannerTitle}>{bannerNews.titolo}</h4>
          <p style={PS.homeBannerText}>{bannerNews.contenuto}</p>
        </div>
      )}

      {notificaNewsList.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ color: C.textLight, fontSize: '0.9rem', marginBottom: '8px', paddingLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="bell" size={16} /> Comunicazioni
          </h4>
          {notificaNewsList.slice(0, 3).map(notifica => (
            <div key={notifica.id} style={{ 
              backgroundColor: C.card, 
              borderRadius: '12px', 
              padding: '12px', 
              marginBottom: '8px', 
              borderLeft: `4px solid ${C.primary}`,
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}>
              <h5 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: C.text }}>{notifica.titolo}</h5>
              <p style={{ margin: 0, fontSize: '0.85rem', color: C.textLight }}>{notifica.contenuto}</p>
            </div>
          ))}
        </div>
      )}

      {isAdmin && (
        <button onClick={() => onNavigate('admin_dashboard')} style={PS.homeAdminBtn}>
          <Icon name="settings" size={18} /> Pannello Admin
        </button>
      )}

      {/* Footer / Credits */}
      <div style={{
        marginTop: '32px',
        padding: '24px 16px',
        textAlign: 'center',
        borderTop: `1px solid ${C.border}`,
        fontSize: '0.75rem',
        color: C.textLight,
        lineHeight: '1.6'
      }}>
        <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          2026 Polisroad – Applicazione sviluppata da Giorgio Raimondi
        </p>
        <p style={{ marginBottom: '4px' }}>
          Sistema informativo di supporto alle attività di controllo in materia di circolazione stradale.
        </p>
        <p style={{ marginBottom: '4px' }}>
          I dati normativi sono tratti da fonti ufficiali (es. Normattiva) e hanno finalità informativa.
        </p>
        <p style={{ marginBottom: '4px' }}>
          Le verifiche e le eventuali contestazioni restano di esclusiva responsabilità degli organi accertatori.
        </p>
        <p>
          Non è garantita la completezza o l’aggiornamento dei dati provenienti da servizi di terze parti.
        </p>
      </div>

      {/* Popup Modale */}
      {showPopup && currentPopup && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: C.card,
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '400px',
            width: '100%',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: C.text, fontSize: '1.2rem' }}>{currentPopup.titolo}</h3>
            <div style={{ color: C.textLight, fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {currentPopup.contenuto}
            </div>
            <button 
              onClick={handleDismissPopup}
              style={{ ...S.btnPrimary, width: '100%' }}
            >
              Ho capito
            </button>
          </div>
        </div>
      )}

      {/* Legal Info Card */}
      <div style={PS.homeLegalCard}>
        <span style={PS.homeLegalVersion}>PolisRoad v{APP_VERSION} · Contenuto a scopo informativo</span>
        <div style={PS.homeLegalRow}>
          <button onClick={() => onNavigate('privacy')} style={PS.homeLegalLink}>
            Privacy Policy
          </button>
          <button onClick={() => onNavigate('termini')} style={PS.homeLegalLink}>
            Termini di Servizio
          </button>
        </div>
      </div>
    </PageWrapper>
  );
};

const NavCard = ({ icon, title, color, bg, onClick }) => (
  <div onClick={onClick} style={PS.homeNavCard}>
    <span style={{ ...PS.homeNavCardIcon, backgroundColor: bg, color }}>
      <Icon name={icon} size={26} />
    </span>
    <span style={{ ...PS.homeNavCardLabel, color: '#333' }}>{title}</span>
  </div>
);
