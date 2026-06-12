import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { C } from '../styles/theme';

export const Privacy = ({ onNavigate }) => {
  const containerStyle = {
    padding: '20px',
    lineHeight: '1.6',
    color: C.text,
  };

  const h3Style = {
    fontSize: '1.15rem',
    fontWeight: '700',
    color: C.primary,
    marginTop: '20px',
    marginBottom: '8px',
    fontFamily: 'var(--font-display, inherit)',
  };

  const pStyle = {
    fontSize: '0.92rem',
    color: C.text,
    marginBottom: '12px',
  };

  const ulStyle = {
    paddingLeft: '20px',
    marginBottom: '12px',
    fontSize: '0.92rem',
  };

  const liStyle = {
    marginBottom: '6px',
  };

  return (
    <PageWrapper title="Privacy Policy" subtitle="Informativa sul trattamento dati" onNavigate={onNavigate}>
      <div style={containerStyle}>
        <p style={{ ...pStyle, fontWeight: 'bold' }}>Titolare del trattamento</p>
        <p style={pStyle}>
          Giorgio Raimondi, contattabile all'indirizzo email: <a href="mailto:privacy@polisroad.it" style={{ color: C.accent }}>privacy@polisroad.it</a><br />
          Ultimo aggiornamento: Giugno 2026
        </p>

        <h3 style={h3Style}>1. Introduzione</h3>
        <p style={pStyle}>
          La presente informativa descrive come vengono raccolti, utilizzati e protetti i dati personali degli utenti che si registrano e utilizzano l'applicazione PolisRoad (di seguito "l'App"), ai sensi del Regolamento (UE) 2016/679 (GDPR).
        </p>

        <h3 style={h3Style}>2. Dati raccolti</h3>
        <p style={pStyle}>
          Al momento della registrazione vengono raccolti i seguenti dati personali:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Indirizzo email (necessario per l'autenticazione)</li>
          <li style={liStyle}>Nome e cognome (necessari per la personalizzazione del profilo)</li>
          <li style={liStyle}>Grado e forza/corpo di appartenenza (facoltativi, necessari per funzionalità operative)</li>
        </ul>

        <p style={pStyle}>
          L'App raccoglie inoltre i seguenti dati di utilizzo e personalizzazione:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Cronologia delle ricerche effettuate nell'App (memorizzata esclusivamente in locale sul dispositivo dell'utente, senza trasmissione a server esterni)</li>
          <li style={liStyle}>Articoli e voci salvati tra i preferiti (sincronizzati sul database Supabase situato in UE quando l'utente è autenticato)</li>
          <li style={liStyle}>Note personali associate agli articoli (sincronizzate sul database Supabase situato in UE quando l'utente è autenticato)</li>
        </ul>
        <p style={pStyle}>
          La cronologia delle ricerche rimane memorizzata esclusivamente in locale sul dispositivo, mentre le note e i preferiti vengono sincronizzati con il server quando l'utente effettua l'accesso per consentirne la fruizione su più dispositivi.
        </p>

        <h3 style={h3Style}>3. Finalità del trattamento</h3>
        <p style={pStyle}>
          I dati personali vengono trattati esclusivamente per:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Consentire l'accesso e l'utilizzo dell'App (autenticazione)</li>
          <li style={liStyle}>Personalizzare l'esperienza dell'utente (profilo, statistiche di utilizzo, sistema di gamification)</li>
          <li style={liStyle}>Garantire la sicurezza del servizio</li>
        </ul>

        <h3 style={h3Style}>4. Base giuridica</h3>
        <p style={pStyle}>
          Il trattamento si basa sul consenso espresso dell'utente al momento della registrazione (art. 6, par. 1, lett. a GDPR) e sull'esecuzione del contratto di servizio (art. 6, par. 1, lett. b GDPR).
        </p>

        <h3 style={h3Style}>5. Conservazione dei dati</h3>
        <p style={pStyle}>
          I dati personali vengono conservati per tutta la durata dell'account. In caso di cancellazione dell'account da parte dell'utente, i dati vengono eliminati entro 30 giorni dalla richiesta.
        </p>

        <h3 style={h3Style}>6. Responsabile del trattamento (sub-processor)</h3>
        <p style={pStyle}>
          I dati personali di autenticazione, profilo, note e preferiti sono ospitati su Supabase (Supabase Inc.), fornitore di servizi cloud con server ubicati nell'Unione Europea (Frankfurt, Germania).
        </p>
        <p style={pStyle}>
          Inoltre, per finalità di analisi del comportamento degli utenti e ottimizzazione dell'esperienza d'uso, l'App si avvale di PostHog (PostHog Inc.), con sede negli Stati Uniti. I trasferimenti di dati verso PostHog avvengono nel rispetto delle Clausole Contrattuali Standard (Standard Contractual Clauses - SCC). I dati trasmessi includono esclusivamente eventi comportamentali e metriche d'uso anonimizzate (ad esempio, la lunghezza e la presenza di numeri all'interno dei termini di ricerca, senza trasmettere mai il testo integrale della ricerca per proteggere dati personali di terzi come targhe o nominativi).
        </p>

        <h3 style={h3Style}>6.1. Cookie e tecnologie di tracciamento</h3>
        <p style={pStyle}>
          L'App utilizza PostHog per analizzare in modo pseudonimo l'utilizzo delle diverse funzionalità e migliorare l'interfaccia. PostHog può fare uso di tecnologie di memorizzazione locale (localStorage) o cookie tecnici per tracciare le sessioni.
        </p>
        <p style={pStyle}>
          È possibile inibire questo tracciamento disattivando i cookie dal proprio browser o bloccando le connessioni verso il dominio di PostHog (es. utilizzando estensioni ad-blocker).
        </p>

        <h3 style={h3Style}>7. Contenuto normativo</h3>
        <p style={pStyle}>
          Il contenuto normativo presente nell'App (Codice della Strada e relativi aggiornamenti) è tratto da fonti ufficiali (Normattiva). Il Titolare non è responsabile di eventuali imprecisioni o ritardi nell'aggiornamento dei contenuti. Il Prontuario delle sanzioni è una rielaborazione a scopo informativo e non costituisce fonte normativa ufficiale. L'utente è l'unico responsabile dell'applicazione delle disposizioni normative nell'esercizio delle proprie funzioni.
        </p>

        <h3 style={h3Style}>8. Diritti dell'utente</h3>
        <p style={pStyle}>
          L'utente ha il diritto di:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>Accedere ai propri dati personali (art. 15 GDPR)</li>
          <li style={liStyle}>Rettificare i propri dati personali (art. 16 GDPR)</li>
          <li style={liStyle}>Richiedere la cancellazione dei propri dati (art. 17 GDPR) — disponibile direttamente dalla pagina Profilo dell'App</li>
          <li style={liStyle}>Richiedere la limitazione del trattamento (art. 18 GDPR)</li>
          <li style={liStyle}>Ricevere i propri dati in formato portabile (art. 20 GDPR)</li>
          <li style={liStyle}>Opporsi al trattamento (art. 21 GDPR)</li>
        </ul>
        <p style={pStyle}>
          Per esercitare i propri diritti, l'utente può contattare il Titolare all'indirizzo: <a href="mailto:privacy@polisroad.it" style={{ color: C.accent }}>privacy@polisroad.it</a>
        </p>

        <h3 style={h3Style}>9. Reclami</h3>
        <p style={pStyle}>
          L'utente ha il diritto di proporre reclamo al Garante per la Protezione dei Dati Personali (www.garanteprivacy.it).
        </p>
      </div>
    </PageWrapper>
  );
};
