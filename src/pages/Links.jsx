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
    logo: '/logos/carabinieri.svg',
    fallback: 'CC'
  },
  {
    title: 'Guardia di Finanza',
    subtitle: 'Sito istituzionale',
    url: 'https://www.gdf.gov.it',
    domain: 'gdf.gov.it',
    logo: '/logos/gdf.svg',
    fallback: 'GdF'
  },
  {
    title: 'Polizia Penitenziaria',
    subtitle: 'Sito istituzionale',
    url: 'https://www.poliziapenitenziaria.gov.it',
    domain: 'poliziapenitenziaria.gov.it',
    logo: '/logos/penitenziaria.png',
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
    logo: '/logos/interno.svg',
    fallback: 'MI'
  },
  {
    title: 'Ministero delle Infrastrutture e dei Trasporti',
    subtitle: 'Mobilita e trasporti',
    url: 'https://www.mit.gov.it',
    domain: 'mit.gov.it',
    logo: '/logos/mit.png',
    fallback: 'MIT'
  },
  {
    title: 'Gazzetta Ufficiale',
    subtitle: 'Normativa pubblicata',
    url: 'https://www.gazzettaufficiale.it',
    domain: 'gazzettaufficiale.it',
    logo: '/logos/gazzetta.png',
    fallback: 'GU'
  },
  {
    title: 'Normattiva',
    subtitle: 'Il portale della legge vigente',
    url: 'https://www.normattiva.it',
    domain: 'normattiva.it',
    logo: '/logos/normattiva.svg',
    fallback: 'NA'
  },
  {
    title: 'Controlla Assicurazione',
    subtitle: 'Verifica copertura RCA',
    url: 'https://www.ilportaledellautomobilista.it/web/portale-automobilista/verifica-copertura-rc',
    domain: 'ilportaledellautomobilista.it',
    fallback: 'RCA'
  },
  {
    title: 'Controlla Revisione',
    subtitle: 'Verifica ultima revisione',
    url: 'https://www.ilportaledellautomobilista.it/web/portale-automobilista/verifica-ultima-revisione',
    domain: 'ilportaledellautomobilista.it',
    fallback: 'REV'
  },
  {
    title: 'Veicoli Rubati',
    subtitle: 'Banca Dati Interforze',
    url: 'https://www.crimnet.dcpc.interno.gov.it/interforze/pubblico/ricerca',
    domain: 'crimnet.dcpc.interno.gov.it',
    fallback: 'RUB'
  },
  {
    title: 'Classe Ambientale',
    subtitle: 'Verifica classe Euro',
    url: 'https://www.ilportaledellautomobilista.it/web/portale-automobilista/verifica-classe-ambientale-veicolo',
    domain: 'ilportaledellautomobilista.it',
    fallback: 'AMB'
  },
  {
    title: 'Limiti Neopatentati',
    subtitle: 'Verifica guida veicoli',
    url: 'https://www.ilportaledellautomobilista.it/web/portale-automobilista/limiti-guida-neopatentati',
    domain: 'ilportaledellautomobilista.it',
    fallback: 'NEO'
  },
  {
    title: 'Massa Supplementare',
    subtitle: 'Verifica veicoli PTT',
    url: 'https://www.ilportaledellautomobilista.it/web/portale-automobilista/',
    domain: 'ilportaledellautomobilista.it',
    fallback: 'MAS'
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
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  color: C.text,
  gap: '12px',
  textAlign: 'center'
};

const logoWrapStyle = {
  width: '46px',
  height: '46px',
  borderRadius: '10px',
  border: `1px solid ${C.border}`,
  backgroundColor: C.card,
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

  const src = link.logo || faviconUrl(link.domain);

  return (
    <div style={logoWrapStyle}>
      <img
        src={src}
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
          <div style={{ textAlign: 'center' }}>
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
