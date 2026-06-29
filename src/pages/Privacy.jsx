import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { C } from '../styles/theme';

// Contenuto puro — usato sia nella pagina che nel modal in Auth.jsx
export const PrivacyContent = () => {
  const h3Style = {
    fontSize: '1.15rem', fontWeight: '700', color: C.primary,
    marginTop: '20px', marginBottom: '8px', fontFamily: 'var(--font-display, inherit)',
  };
  const pStyle = { fontSize: '0.92rem', color: C.text, marginBottom: '12px' };
  const ulStyle = { paddingLeft: '20px', marginBottom: '12px', fontSize: '0.92rem' };
  const liStyle = { marginBottom: '6px' };

  return (
    <div style={{ lineHeight: '1.6', color: C.text }}>
      <p style={{ ...pStyle, fontWeight: 'bold' }}>Titolare del trattamento</p>
      <p style={pStyle}>
        Giorgio Raimondi, contattabile all'indirizzo email: <a href="mailto:privacy@polisroad.it" style={{ color: C.accent }}>privacy@polisroad.it</a><br />
        Ultimo aggiornamento: Giugno 2026
      </p>
      <h3 style={h3Style}>1. Introduzione</h3>
      <p style={pStyle}>La presente informativa descrive come vengono raccolti, utilizzati e protetti i dati personali degli utenti che si registrano e utilizzano l'applicazione PolisRoad (di seguito "l'App"), ai sensi del Regolamento (UE) 2016/679 (GDPR).</p>
      <h3 style={h3Style}>2. Dati raccolti</h3>
      <p style={pStyle}>Al momento della registrazione vengono raccolti i seguenti dati personali:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Indirizzo email (necessario per l'autenticazione)</li>
        <li style={liStyle}>Nome e cognome (necessari per la personalizzazione del profilo)</li>
        <li style={liStyle}>Grado e forza/corpo di appartenenza (facoltativi, necessari per funzionalità operative)</li>
      </ul>
      <p style={pStyle}>L'App raccoglie inoltre i seguenti dati di utilizzo e personalizzazione:</p>
      <ul style={ulStyle}>
        <li style={liStyle}>Cronologia delle ricerche effettuate nell'App (memorizzata esclusivamente in locale sul dispositivo dell'utente, senza trasmissione a server esterni)</li>
        <li style={liStyle}>Articoli e voci salvati tra i preferiti (sincronizzati sul database Supabase situato in UE quando l'utente è autenticato)</li>
        <li style={liStyle}>Note personali associate agli articoli (sincronizzate sul database Supabase situato in UE quando l'utente è autenticato)</li>
      </ul>
      <h3 style={h3Style}>3. Finalità del trattamento</h3>
      <ul style={ulStyle}>
        <li style={liStyle}>Consentire l'accesso e l'utilizzo dell'App (autenticazione)</li>
        <li style={liStyle}>Personalizzare l'esperienza dell'utente (profilo, statistiche di utilizzo)</li>
        <li style={liStyle}>Garantire la sicurezza del servizio</li>
      </ul>
      <h3 style={h3Style}>4. Base giuridica</h3>
      <p style={pStyle}>Il trattamento si basa sul consenso espresso dell'utente al momento della registrazione (art. 6, par. 1, lett. a GDPR) e sull'esecuzione del contratto di servizio (art. 6, par. 1, lett. b GDPR).</p>
      <h3 style={h3Style}>5. Conservazione dei dati</h3>
      <p style={pStyle}>I dati personali vengono conservati per tutta la durata dell'account. In caso di cancellazione, i dati vengono eliminati entro 30 giorni dalla richiesta.</p>
      <h3 style={h3Style}>6. Responsabili del trattamento (sub-processor)</h3>
      <p style={pStyle}>I dati sono ospitati su <strong>Supabase</strong> (Supabase Inc.), con server nell'Unione Europea (Frankfurt, Germania). Per le analisi di utilizzo, l'App può avvalersi di <strong>PostHog</strong> (EU Cloud) con dati anonimizzati.</p>
      <h3 style={h3Style}>7. Consenso analytics e opt-out</h3>
      <p style={pStyle}>Il tracciamento tramite PostHog è <strong>attivo per impostazione predefinita</strong>. L'utente può disattivarlo in qualsiasi momento da <strong>Profilo → Analytics (PostHog)</strong>.</p>
      <h3 style={h3Style}>8. Contenuto normativo</h3>
      <p style={pStyle}>Il contenuto normativo è tratto da fonti ufficiali (Normattiva). Il Titolare non è responsabile di eventuali imprecisioni. Il Prontuario è una rielaborazione informativa e non costituisce fonte normativa ufficiale.</p>
      <h3 style={h3Style}>9. Diritti dell'utente</h3>
      <ul style={ulStyle}>
        <li style={liStyle}>Accesso ai propri dati (art. 15 GDPR)</li>
        <li style={liStyle}>Rettifica (art. 16 GDPR)</li>
        <li style={liStyle}>Cancellazione (art. 17 GDPR) — disponibile dal Profilo</li>
        <li style={liStyle}>Limitazione del trattamento (art. 18 GDPR)</li>
        <li style={liStyle}>Portabilità dei dati (art. 20 GDPR)</li>
        <li style={liStyle}>Opposizione al trattamento (art. 21 GDPR)</li>
      </ul>
      <p style={pStyle}>Contatto: <a href="mailto:privacy@polisroad.it" style={{ color: C.accent }}>privacy@polisroad.it</a></p>
      <h3 style={h3Style}>10. Reclami</h3>
      <p style={pStyle}>L'utente ha il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).</p>
    </div>
  );
};

export const Privacy = ({ onNavigate }) => (
  <PageWrapper title="Privacy Policy" subtitle="Informativa sul trattamento dati" onNavigate={onNavigate}>
    <div style={{ padding: '20px' }}>
      <PrivacyContent />
    </div>
  </PageWrapper>
);
