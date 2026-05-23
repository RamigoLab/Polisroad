# PolisRoad 1.4.1 - Header unificato

Obiettivo: avere lo stesso stile di intestazione su tutte le pagine dell'app. La home oggi usa una barra blu con saluto operatore, mentre le altre pagine mostrano il titolo e il logo in alto a destra. La versione 1.4.1 deve portare questo comportamento in un componente condiviso, mantenendo la home riconoscibile ma rendendo coerente tutta la navigazione.

## Risultato atteso

- Tutte le pagine principali hanno una barra blu superiore coerente.
- Il logo PolisRoad resta a destra e continua a riportare alla home.
- La home mostra "Bentornato" con grado, nome, cognome e forza dell'operatore.
- Le pagine interne mostrano il titolo pagina nello stesso contenitore blu.
- Le pagine dettaglio di Prontuario e Normativa mantengono il pulsante indietro, ma adottano la stessa logica visiva dell'header.
- Il contenuto sotto l'header mantiene spaziature uniformi e non viene coperto da logo o navigazione.

## File da creare

### `src/components/layout/AppHeader.jsx`

Creare un componente condiviso con queste props consigliate:

```jsx
export const AppHeader = ({
  title,
  subtitle,
  meta,
  onNavigate,
  onTitleClick,
  children,
  leftAction,
}) => { ... };
```

Uso previsto:

- `title`: testo principale. In home puo' essere il nome completo dell'operatore.
- `subtitle`: testo sopra il titolo, ad esempio "Bentornato," oppure nome sezione.
- `meta`: testo piccolo sotto il titolo, ad esempio forza dell'operatore.
- `onNavigate`: usato dal logo per tornare a `home`.
- `onTitleClick`: opzionale, per rendere cliccabile il blocco utente in home e andare al profilo.
- `children`: area opzionale sotto il titolo, utile per la ricerca rapida in home.
- `leftAction`: opzionale per dettagli Prontuario/Normativa, ad esempio freccia indietro.

## File da modificare

### `src/components/layout/PageWrapper.jsx`

Sostituire la gestione del logo assoluto con supporto all'header condiviso.

- importare `AppHeader`;
- aggiungere props `title`, `subtitle`, `meta`, `headerChildren`, `headerLeftAction`, `onHeaderTitleClick`, `hideHeader`;
- rimuovere o deprecare `hideLogo`;
- calcolare il padding in modo semplice: niente `paddingTop: 64px`, perche' l'header sara' nel normale flusso della pagina.

Esempio di uso finale:

```jsx
<PageWrapper
  title="Prontuario"
  subtitle="Archivio operativo"
  onNavigate={onNavigate}
>
  ...
</PageWrapper>
```

### `src/styles/layout.js`

Aggiungere stili condivisi per l'header:

- `appHeader`
- `appHeaderInner`
- `appHeaderText`
- `appHeaderSubtitle`
- `appHeaderTitle`
- `appHeaderMeta`
- `appHeaderLogoWrapper`
- `appHeaderLogo`
- `appHeaderActions`
- `appHeaderLeftAction`

Gli stili possono partire da quelli attuali in `PS.homeHeader`, `PS.homeHeaderInner`, `PS.homeSubtitle`, `PS.homeName`, `PS.homeForza`, `PS.homeLogo` e `PS.homeLogoWrapper`.

### `src/styles/pages.js`

Dopo aver spostato gli stili comuni in `layout.js`, rimuovere o lasciare temporaneamente inutilizzati gli stili home duplicati:

- `homeHeader`
- `homeHeaderInner`
- `homeSubtitle`
- `homeName`
- `homeForza`
- `homeLogo`
- `homeLogoWrapper`

Mantenere gli stili specifici della home:

- `homeQuickActions`
- `homeSearchBtn`
- `homeBody`
- `homeOperatoreBtn`
- `homeGrid`
- card e banner.

### `src/pages/Home.jsx`

Usare `PageWrapper` con header condiviso.

- `subtitle="Bentornato,"`
- `title={`${profile?.grado} ${profile?.nome} ${profile?.cognome}`}`
- `meta={profile?.forza}`
- `onHeaderTitleClick={() => onNavigate('profilo')}`
- `headerChildren` con il pulsante "Ricerca Rapida".

Il blocco blu non deve piu' essere scritto direttamente nella pagina.

### Pagine elenco principali

Aggiornare le pagine che oggi renderizzano un titolo manuale:

- `src/pages/Prontuario.jsx`
- `src/pages/Normativa.jsx`
- `src/pages/Ricerca.jsx`
- `src/pages/Calcolatore.jsx`
- `src/pages/News.jsx`
- `src/pages/Links.jsx`
- `src/pages/Preferiti.jsx`
- `src/pages/Profilo.jsx`

Esempi:

```jsx
<PageWrapper title="Ricerca Globale" subtitle="Cerca in tutta PolisRoad" onNavigate={onNavigate}>
```

```jsx
<PageWrapper title="Profilo Operatore" subtitle="Account e progressi" onNavigate={onNavigate}>
```

Rimuovere gli `<h2>` duplicati quando il titolo e' gia' nell'header.

### Dettaglio Prontuario e Normativa

Le viste dettaglio oggi usano `hideLogo={true}` e header dedicati:

- `src/pages/Prontuario.jsx`
- `src/pages/Normativa.jsx`

Opzione consigliata per 1.4.1:

- usare `PageWrapper` con `title` dinamico;
- passare un `headerLeftAction` con pulsante indietro;
- mantenere badge e preferito nel corpo subito sotto l'header, oppure in `headerChildren` se serve.

Questo evita di avere tre stili di header diversi: home, elenco, dettaglio.

### `src/pages/Operatore.jsx`

La modalita' operatore puo' restare diversa perche' e' una modalita' speciale scura/rossa. Annotare nel changelog che e' esclusa intenzionalmente dall'header blu standard.

### `src/pages/admin/AdminLayout.jsx`

L'area admin puo' mantenere il suo header dedicato. Non e' necessario uniformarla nella 1.4.1, a meno di scelta esplicita.

## Versione 1.4.1

Aggiornare:

- `package.json`: `"version": "1.4.1"`
- `package-lock.json`: versione root a `1.4.1`
- `src/config/constants.js`: `APP_VERSION = '1.4.1'`
- `README.md`: indicare versione corrente `1.4.1`
- `CHANGELOG.md`: aggiungere sezione `[1.4.1]`

Nota: lo script `scripts/update-version.js` sincronizza `src/config/constants.js` da `package.json` durante `npm run dev` e `npm run build`.

## Test manuale prima del deploy

1. Avviare `npm run dev`.
2. Verificare home: barra blu, saluto operatore, logo cliccabile, ricerca rapida.
3. Verificare pagine elenco: Prontuario, Normativa, Ricerca, Calcolatore, News, Links, Preferiti, Profilo.
4. Verificare dettagli Prontuario e Normativa: freccia indietro, titolo leggibile, logo home coerente.
5. Verificare mobile stretto: nessun testo sovrapposto al logo.
6. Eseguire `npm run lint`.
7. Eseguire `npm run build`.

## Nota deploy

Dopo il commit su GitHub Desktop, Vercel usera' la versione aggiornata dal repository e continuera' a leggere Supabase dalle variabili ambiente configurate sul progetto Vercel.
