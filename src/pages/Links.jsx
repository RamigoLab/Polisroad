import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { C } from '../styles/theme';

const faviconUrl = (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

const LINKS = [
  {
    title: 'Polizia di Stato',
    subtitle: 'Sito istituzionale',
    url: 'https://www.poliziadistato.it',
    domain: 'poliziadistato.it',
    fallback: 'PS'
  },
  {
    title: 'Arma dei Carabinieri',
    subtitle: 'Sito istituzionale',
    url: 'https://www.carabinieri.it',
    domain: 'carabinieri.it',
    fallback: 'CC'
  },
  {
    title: 'Guardia di Finanza',
    subtitle: 'Sito istituzionale',
    url: 'https://www.gdf.gov.it',
    domain: 'gdf.gov.it',
    fallback: 'GdF'
  },
  {
    title: 'Polizia Penitenziaria',
    subtitle: 'Sito istituzionale',
    url: 'https://www.poliziapenitenziaria.gov.it',
    domain: 'poliziapenitenziaria.gov.it',
    fallback: 'PP'
  },
  {
    title: "Portale dell'Automobilista",
    subtitle: 'Patente, veicoli e pratiche',
    url: 'https://www.ilportaledellautomobilista.it',
    domain: 'ilportaledellautomobilista.it',
    fallback: 'PA'
  },
  {
    title: "Ministero dell'Interno",
    subtitle: 'Norme, comunicati e servizi',
    url: 'https://www.interno.gov.it',
    domain: 'interno.gov.it',
    fallback: 'MI'
  },
  {
    title: 'Ministero delle Infrastrutture e dei Trasporti',
    subtitle: 'Mobilita e trasporti',
    url: 'https://www.mit.gov.it',
    domain: 'mit.gov.it',
    fallback: 'MIT'
  },
  {
    title: 'Gazzetta Ufficiale',
    subtitle: 'Normativa pubblicata',
    url: 'https://www.gazzettaufficiale.it',
    domain: 'gazzettaufficiale.it',
    fallback: 'GU'
  }
];

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '12px'
};

const linkCardStyle = {
  minHeight: '132px',
  backgroundColor: 'var(--color-card, #fff)',
  padding: '16px',
  borderRadius: '12px',
  border: `1px solid ${C.border}`,
  textDecoration: 'none',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  color: C.text,
  gap: '12px'
};

const logoWrapStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '10px',
  border: `1px solid ${C.border}`,
  backgroundColor: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  flexShrink: 0
};

const logoStyle = {
  width: '32px',
  height: '32px',
  objectFit: 'contain'
};

const fallbackLogoStyle = {
  ...logoWrapStyle,
  color: C.primary,
  fontSize: '0.8rem',
  fontWeight: '800'
};

const LinkLogo = ({ link }) => {
  const [failed, setFailed] = React.useState(false);

  if (failed) {
    return <div style={fallbackLogoStyle}>{link.fallback}</div>;
  }

  return (
    <div style={logoWrapStyle}>
      <img
        src={faviconUrl(link.domain)}
        alt={`Logo ${link.title}`}
        style={logoStyle}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
};

export const Links = ({ onNavigate }) => (
  <PageWrapper title="Link Istituzionali" subtitle="Risorse ufficiali" onNavigate={onNavigate}>
    <div style={gridStyle}>
      {LINKS.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noreferrer" style={linkCardStyle}>
          <LinkLogo link={link} />
          <div>
            <h3 style={{ fontSize: '0.95rem', lineHeight: 1.25, color: C.text, marginBottom: '6px' }}>
              {link.title}
            </h3>
            <p style={{ fontSize: '0.78rem', lineHeight: 1.35, color: C.textLight }}>
              {link.subtitle}
            </p>
          </div>
        </a>
      ))}
    </div>
  </PageWrapper>
);
