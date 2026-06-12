# Architettura di Sicurezza: PolisRoad

## RLS-First Security

La sicurezza dell'applicazione e l'accesso ai dati sensibili o amministrativi seguono un approccio **RLS-first** (Row Level Security prima di tutto).

> [!IMPORTANT]
> La protezione dell'area amministrativa è applicata a livello di database tramite Row Level Security (RLS) su Supabase; la `ProtectedRoute` nel codice React serve solo a fini di User Experience (UX) per evitare il rendering superfluo di elementi dell'interfaccia.

### Dettagli delle Protezioni

1. **Tabella `news`**:
   - Lettura pubblica abilitata per tutti (`USING (true)`).
   - Inserimento, modifica e cancellazione vincolate alla funzione di database `public.is_admin()`.

2. **Tabella `segnalazioni`**:
   - Inserimento consentito a tutti gli utenti autenticati.
   - Lettura consentita solo agli amministratori o all'operatore che ha effettuato la segnalazione (tramite confronto email nel JWT).
   - Aggiornamento e cancellazione consentite esclusivamente agli amministratori.

3. **Tabelle `gamification`, `profiles` e `xp_history`**:
   - Protette in scrittura e lettura in modo che ciascun utente possa operare solo sui propri record (`user_id = auth.uid()`).
