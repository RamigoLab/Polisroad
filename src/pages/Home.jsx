import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { C } from '../styles/theme';
import { useAuth } from '../hooks/useAuth';
import { useNews } from '../hooks/useNews';

export const Home = ({ onNavigate }) => {
  const { profile } = useAuth();
  const { list: newsList } = useNews();
  const isAdmin = profile?.ruolo === 'admin';
  
  // Cerchiamo una news con categoria "Banner" per mostrarla in home
  const bannerNews = newsList.find(n => n.categoria.toLowerCase() === 'banner' && n.pubblicato);

  return (
    <PageWrapper style={{ padding: 0 }}>
      {/* Header / Benvenuto */}
      <div style={{ backgroundColor: C.primary, color: '#fff', padding: '24px 16px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.9rem', color: C.accentLight, marginBottom: '4px' }}>Bentornato,</p>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '4px', lineHeight: 1.2 }}>
              {profile?.grado} {profile?.nome} {profile?.cognome}
            </h2>
            <p style={{ fontSize: '0.85rem', opacity: 0.8 }}>{profile?.forza}</p>
          </div>
          <div style={{ flexShrink: 0, marginLeft: '12px' }}>
            <img src="/icons/icon-192.png" alt="PolisRoad" style={{ width: '56px', height: '56px', borderRadius: '12px', backgroundColor: '#fff', padding: '2px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
          </div>
        </div>
        
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => onNavigate('ricerca')}
            style={{ flex: 1, backgroundColor: '#fff', color: C.primary, padding: '12px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>🔍</span> Ricerca Rapida
          </button>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {/* Modalità Operatore */}
        <button 
          onClick={() => onNavigate('operatore')}
          style={{ width: '100%', backgroundColor: C.danger, color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '24px', boxShadow: '0 4px 12px rgba(192,57,43,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.4rem' }}>🚨</span> ATTIVA MODALITÀ OPERATORE
        </button>

        {/* Grid Navigazione */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
          <NavCard icon="📋" title="Prontuario" onClick={() => onNavigate('prontuario')} />
          <NavCard icon="📖" title="Normativa" onClick={() => onNavigate('normativa')} />
          <NavCard icon="🧮" title="Calcolatore" onClick={() => onNavigate('calcolatore')} />
          <NavCard icon="⭐" title="Preferiti" onClick={() => onNavigate('preferiti')} />
          <NavCard icon="📰" title="News" onClick={() => onNavigate('news')} />
          <NavCard icon="🔗" title="Links Utili" onClick={() => onNavigate('links')} />
        </div>

        {/* Banner Dinamico */}
        {bannerNews && (
          <div style={{ backgroundColor: C.accentLight, padding: '16px', borderRadius: '12px', border: `1px solid ${C.accent}`, marginBottom: '24px' }}>
            <h4 style={{ color: C.primary, marginBottom: '4px' }}>{bannerNews.titolo}</h4>
            <p style={{ fontSize: '0.85rem', color: C.text }}>{bannerNews.contenuto}</p>
          </div>
        )}

        {/* Pannello Admin */}
        {isAdmin && (
          <button 
            onClick={() => onNavigate('admin_dashboard')}
            style={{ width: '100%', backgroundColor: C.text, color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span>⚙️</span> Pannello Admin
          </button>
        )}
      </div>
    </PageWrapper>
  );
};

const NavCard = ({ icon, title, onClick }) => (
  <div 
    onClick={onClick}
    style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
  >
    <span style={{ fontSize: '2rem' }}>{icon}</span>
    <span style={{ fontWeight: '600', color: C.text, fontSize: '0.9rem' }}>{title}</span>
  </div>
);
