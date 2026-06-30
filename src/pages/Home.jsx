import React, { useState, useEffect, useMemo } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { PS } from '../styles/pages';
import { C } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { useNews } from '../hooks/useNews';
import { APP_VERSION } from '../config/constants';
import { Icon } from '../components/ui/Icon';
import { getItem, setItem } from '../utils/storage';

const NAV_CARDS = [
  { id: 'prontuario',  icon: 'clipboard-list', label: 'Prontuario',     ...C.iconProntuario },
  { id: 'normativa',   icon: 'book-open',       label: 'Normativa',      ...C.iconNormativa  },
  { id: 'calcolatore', icon: 'calculator',      label: 'Calcolatore',    ...C.iconCalcola    },
  { id: 'preferiti',   icon: 'star',            label: 'Preferiti',      ...C.iconPreferiti  },
  { id: 'guide',       icon: 'graduation-cap',  label: 'Guide Pratiche', ...C.iconGuide      },
  { id: 'news',        icon: 'newspaper',       label: 'News',           ...C.iconNews       },
  { id: 'links',       icon: 'link',            label: 'Links Utili',    ...C.iconLinks      },
  { id: 'profilo',     icon: 'user',            label: 'Profilo',        ...C.iconProfilo    },
];

export const Home = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { list: newsList } = useNews();
  const isAdmin = profile?.ruolo === 'admin';

  const bannerNews  = useMemo(() => newsList.find(n => n.categoria?.toLowerCase() === 'banner'   && n.pubblicato), [newsList]);
  const popupNewsList = useMemo(() => newsList.filter(n => n.categoria?.toLowerCase() === 'popup'    && n.pubblicato), [newsList]);
  const notificaList  = useMemo(() => newsList.filter(n => n.categoria?.toLowerCase() === 'notifica' && n.pubblicato), [newsList]);

  const [showPopup, setShowPopup] = useState(false);
  const [currentPopup, setCurrentPopup] = useState(null);

  useEffect(() => {
    if (popupNewsList.length > 0) {
      const latest = popupNewsList[0];
      if (!getItem(`polisroad_dismissed_popup_${latest.id}`)) {
        setCurrentPopup(latest);
        setShowPopup(true);
      }
    }
  }, [popupNewsList]);

  const handleDismissPopup = () => {
    if (currentPopup) setItem(`polisroad_dismissed_popup_${currentPopup.id}`, 'true');
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
            <Icon name="search" size={17} color="rgba(255,255,255,0.85)" />
            <span>Ricerca rapida...</span>
          </button>
        </div>
      }
    >
      {/* Pulsante operatore */}
      <button onClick={() => onNavigate('operatore')} style={PS.homeOperatoreBtn}>
        <Icon name="shield-alert" size={20} color="#fff" />
        ATTIVA MODALITÀ OPERATORE
      </button>

      {/* Griglia navigazione */}
      <div style={PS.homeGrid}>
        {NAV_CARDS.map(card => (
          <NavCard
            key={card.id}
            icon={card.icon}
            label={card.label}
            bg={card.bg}
            color={card.color}
            onClick={() => onNavigate(card.id)}
          />
        ))}
      </div>

      {/* Banner news */}
      {bannerNews && (
        <div style={{ ...PS.homeBannerBox, marginBottom: '16px' }}>
          <div style={PS.homeBannerTitle}>{bannerNews.titolo}</div>
          <div style={PS.homeBannerText}>{bannerNews.contenuto}</div>
        </div>
      )}

      {/* Comunicazioni notifica */}
      {notificaList.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '0.72rem', color: C.textLight, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
            Comunicazioni
          </div>
          {notificaList.slice(0, 3).map(n => (
            <div key={n.id} style={{
              backgroundColor: C.card, borderRadius: C.radiusMd,
              padding: '12px 14px', marginBottom: '8px',
              borderLeft: `3px solid ${C.accent}`,
              border: `1px solid ${C.border}`,
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: C.text, marginBottom: '3px' }}>{n.titolo}</div>
              <div style={{ fontSize: '0.82rem', color: C.textLight, lineHeight: '1.4' }}>{n.contenuto}</div>
            </div>
          ))}
          {notificaList.length > 3 && (
            <button onClick={() => onNavigate('news')} style={{ color: C.accent, fontSize: '0.82rem', fontWeight: '600', padding: '4px 0' }}>
              Vedi tutte ({notificaList.length}) →
            </button>
          )}
        </div>
      )}

      {/* Admin button */}
      {isAdmin && (
        <button onClick={() => onNavigate('admin_dashboard')} style={{ ...PS.homeAdminBtn, marginBottom: '20px' }}>
          <Icon name="settings" size={18} color="#fff" />
          Pannello Amministratore
        </button>
      )}

      {/* Footer unificato */}
      <div style={{
        marginTop: '24px', paddingTop: '20px',
        paddingBottom: '32px',
        borderTop: `1px solid ${C.border}`,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.72rem', color: C.textLight, lineHeight: '1.7' }}>
          <p style={{ fontWeight: '700', color: C.textLight, marginBottom: '4px' }}>
            PolisRoad v{APP_VERSION} · {new Date().getFullYear()} Giorgio Raimondi
          </p>
          <p style={{ marginBottom: '12px' }}>
            Sistema informativo di supporto alle attività di controllo in materia di circolazione stradale.
            I dati normativi sono tratti da fonti ufficiali (Normattiva) e hanno finalità esclusivamente informativa.
          </p>
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '16px',
            paddingBottom: '80px',
          }}>
            <button onClick={() => onNavigate('privacy')} style={{ color: C.accent, fontSize: '0.8rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px' }}>
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('termini')} style={{ color: C.accent, fontSize: '0.8rem', fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 4px' }}>
              Termini di Servizio
            </button>
          </div>
        </div>
      </div>

      {/* Modale popup */}
      {showPopup && currentPopup && (
        <div
          onClick={handleDismissPopup}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          role="dialog" aria-modal="true" aria-labelledby="popup-title"
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: C.card, borderRadius: '20px', padding: '24px',
              maxWidth: '380px', width: '100%',
              boxShadow: 'var(--shadow-lg)',
              border: `1px solid ${C.border}`,
            }}
          >
            <h3 id="popup-title" style={{ margin: '0 0 10px 0', color: C.text, fontSize: '1.15rem', fontWeight: '700' }}>
              {currentPopup.titolo}
            </h3>
            <div style={{ color: C.textLight, fontSize: '0.92rem', lineHeight: '1.55', marginBottom: '20px', whiteSpace: 'pre-wrap' }}>
              {currentPopup.contenuto}
            </div>
            <button
              onClick={handleDismissPopup}
              autoFocus
              style={{
                width: '100%', padding: '13px',
                background: `linear-gradient(135deg, ${C.primary} 0%, ${C.accent} 100%)`,
                color: '#fff', borderRadius: C.radiusPill,
                fontWeight: '700', fontSize: '0.95rem',
                border: 'none', cursor: 'pointer',
              }}
            >
              Ho capito
            </button>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

const NavCard = ({ icon, label, bg, color, onClick }) => {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        ...PS.homeNavCard,
        transform: pressed ? 'scale(0.93)' : 'scale(1)',
        transition: 'transform 0.12s ease, box-shadow 0.12s ease',
        boxShadow: pressed ? 'none' : 'var(--shadow-sm)',
      }}
    >
      <span style={{ ...PS.homeNavCardIcon, backgroundColor: bg, color }}>
        <Icon name={icon} size={24} color={color} strokeWidth={1.75} />
      </span>
      <span style={{ ...PS.homeNavCardLabel, color: C.text }}>{label}</span>
    </div>
  );
};
