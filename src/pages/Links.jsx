import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { C } from '../styles/theme';

const LINKS = [
  { title: 'Polizia di Stato', url: 'https://www.poliziadistato.it', icon: '🚓' },
  { title: 'Carabinieri', url: 'https://www.carabinieri.it', icon: '🚔' },
  { title: 'Ministero Int.', url: 'https://www.interno.gov.it', icon: '🏛️' },
  { title: 'M.I.T.', url: 'https://www.mit.gov.it', icon: '🛣️' },
  { title: 'Gazzetta Ufficiale', url: 'https://www.gazzettaufficiale.it', icon: '📜' },
  { title: 'Portale Automob.', url: 'https://www.ilportaledellautomobilista.it', icon: '🚗' },
];

export const Links = () => {
  return (
    <PageWrapper>
      <h2 style={{ color: C.primary, marginBottom: '16px' }}>Link Istituzionali</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {LINKS.map((link, idx) => (
          <a 
            key={idx}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            style={{
              backgroundColor: '#fff',
              padding: '20px 12px',
              borderRadius: '12px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              color: C.text,
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '2rem' }}>{link.icon}</span>
            <span style={{ fontWeight: '600', fontSize: '0.9rem', textAlign: 'center' }}>{link.title}</span>
          </a>
        ))}
      </div>
    </PageWrapper>
  );
};
