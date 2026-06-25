import React from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import { C } from '../styles/theme';

// Contenuto puro — usato sia nella pagina che nel modal in Auth.jsx
export const TerminiContent = () => {
  const h3Style = {
    fontSize: '1.15rem', fontWeight: '700', color: C.primary,
    marginTop: '20px', marginBottom: '8px', fontFamily: 'var(--font-display, inherit)',
  };
  const pStyle = { fontSize: '0.92rem', color: C.text, marginBottom: '12px' };
  const ulStyle = { paddingLeft: '20px', marginBottom: '12px', fontSize: '0.92rem' };
  const liStyle = { marginBottom: '6px' };

  return (
    <div style={{ lineHeight: '1.6', color: C.text }}>
      <p style={pStyle}>Ultimo aggiornamento: Giugno 2026</p>
      <h3 style={h3Style}>1. Descrizione del servizio</h3>
      <p style={pStyle}>PolisRoad è un'applicazione mobile/web di supporto per operatori della sicurezza stradale e pubblica. L'App fornisce accesso rapido al Codice della Strada, al prontuario delle sanzioni, a guide pratiche e strumenti di calcolo a scopo informativo e di supporto operativo.</p>
      <h3 style={h3Style}>2. Accettazione dei termini</h3>
      <p style={pStyle}>L'utilizzo dell'App implica l'accettazione integrale dei presenti Termini di Servizio e della Privacy Policy. Chi non accetta le condizioni è invitato a non utilizzare il servizio.</p>
      <h3 style={h3Style}>3. Utilizzo consentito</h3>
      <p style={pStyle}>L'App è destinata a uso personale e professionale. È vietato utilizzare l'App per scopi illeciti, per danneggiare terzi o per violare diritti di proprietà intellettuale.</p>
      <h3 style={h3Style}>4. Contenuto normativo — Limitazione di responsabilità</h3>
      <ul style={ulStyle}>
        <li style={liStyle}>La normativa è tratta da Normattiva (fonte ufficiale) ma potrebbero verificarsi ritardi nell'aggiornamento.</li>
        <li style={liStyle}>Il Prontuario è una rielaborazione a scopo informativo e non costituisce fonte normativa ufficiale.</li>
        <li style={liStyle}>L'utente è l'unico responsabile dell'applicazione delle disposizioni normative nell'esercizio delle proprie funzioni.</li>
        <li style={liStyle}>Il Titolare non assume alcuna responsabilità per errori, omissioni o conseguenze derivanti dall'uso delle informazioni.</li>
      </ul>
      <h3 style={h3Style}>5. Account utente</h3>
      <p style={pStyle}>L'utente è responsabile della riservatezza delle proprie credenziali. Qualsiasi attività effettuata con le proprie credenziali è di responsabilità esclusiva dell'utente.</p>
      <h3 style={h3Style}>6. Sospensione e cancellazione</h3>
      <p style={pStyle}>Il Titolare si riserva il diritto di sospendere o cancellare account che violino i presenti Termini, a proprio insindacabile giudizio.</p>
      <h3 style={h3Style}>7. Modifiche al servizio</h3>
      <p style={pStyle}>Il Titolare si riserva il diritto di modificare, sospendere o interrompere il servizio in qualsiasi momento, con o senza preavviso.</p>
      <h3 style={h3Style}>8. Proprietà intellettuale</h3>
      <p style={pStyle}>L'App, il suo design, il codice sorgente e i contenuti originali (escluso il contenuto normativo di dominio pubblico) sono di proprietà del Titolare. È vietata la riproduzione non autorizzata.</p>
      <h3 style={h3Style}>9. Strumenti di analisi (Analytics)</h3>
      <p style={pStyle}>L'App utilizza <strong>PostHog</strong> (PostHog Inc., EU Cloud) per raccogliere metriche di utilizzo anonimizzate. Il tracciamento è attivo per impostazione predefinita e può essere disattivato dalla sezione Profilo.</p>
      <h3 style={h3Style}>10. Legge applicabile</h3>
      <p style={pStyle}>I presenti Termini sono regolati dalla legge italiana. In caso di controversia si applica la normativa vigente in materia di competenza territoriale, nel rispetto delle disposizioni inderogabili a tutela del consumatore (D.Lgs. 206/2005).</p>
    </div>
  );
};

export const TerminiServizio = ({ onNavigate }) => (
  <PageWrapper title="Termini di Servizio" subtitle="Condizioni d'uso dell'applicazione" onNavigate={onNavigate}>
    <div style={{ padding: '20px' }}>
      <TerminiContent />
    </div>
  </PageWrapper>
);
