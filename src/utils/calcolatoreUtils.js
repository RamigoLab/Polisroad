/**
 * calcolatoreUtils.js
 * Logica business completa per il calcolo delle sanzioni CdS.
 *
 * Riferimenti normativi:
 * - Art. 195 c. 2 CdS — raddoppio per recidiva nel biennio
 * - Art. 202 c. 1 CdS — riduzione 30% se pagamento entro 5 giorni
 * - Art. 208 c. 1 CdS — maggiorazione 1/3 per violazioni notturne (22:00–07:00)
 */

/** Arrotonda a 2 decimali e restituisce float */
const r2 = (n) => Math.round(n * 100) / 100;

/**
 * Calcola tutti gli importi a partire dai dati inseriti dall'utente.
 *
 * @param {object} params
 * @param {number|string} params.pmr        — Pagamento in misura ridotta (base)
 * @param {number|string} params.edittaleMax — Edittale massimo (opzionale)
 * @param {boolean} params.recidiva         — Applicare raddoppio recidiva (art. 195 c. 2)
 * @param {boolean} params.notturna         — Applicare maggiorazione notturna (art. 208 c. 1)
 * @param {boolean} params.riduzioneFiveDay — Applicare riduzione 5 giorni (art. 202 c. 1)
 * @returns {object} Tutti gli importi calcolati
 */
export function calcolaSanzione({ pmr, edittaleMax, recidiva, notturna, riduzioneFiveDay }) {
  const base = parseFloat(pmr) || 0;
  if (base <= 0) return null;

  const max = parseFloat(edittaleMax) || null;

  // 1. Recidiva: raddoppio della base (art. 195 c. 2)
  const baseEffettiva = recidiva ? r2(base * 2) : base;
  const maxEffettivo  = (recidiva && max) ? r2(max * 2) : max;

  // 2. Maggiorazione notturna +1/3 (art. 208 c. 1)
  const COEFF_NOTTE = 1 + (1 / 3);
  const baseNotte   = r2(baseEffettiva * COEFF_NOTTE);
  const maxNotte    = maxEffettivo ? r2(maxEffettivo * COEFF_NOTTE) : null;

  // 3. Riduzione 30% per pagamento entro 5 giorni (art. 202 c. 1)
  const COEFF_SCONTO = 0.70;
  const baseScontata      = r2(baseEffettiva * COEFF_SCONTO);
  const baseNotteScontata = r2(baseNotte * COEFF_SCONTO);

  return {
    // Valori base (con eventuale recidiva applicata)
    base: baseEffettiva,
    max: maxEffettivo,

    // Sconto 5 giorni sulla base diurna
    baseScontata,
    mostraScontata: riduzioneFiveDay,

    // Notturna
    baseNotte,
    maxNotte,
    baseNotteScontata,
    mostraNotturna: notturna,

    // Flag attivi
    recidiva,
    notturna,
    riduzioneFiveDay,
  };
}

/**
 * Genera il testo riepilogativo del calcolo, copiabile dall'utente.
 */
export function generaTestoCalcolo({ risultato, punti, nomeViolazione }) {
  if (!risultato) return '';

  const lines = [];
  if (nomeViolazione) lines.push(`Violazione: ${nomeViolazione}`);
  lines.push('');
  lines.push('── IMPORTI ──');
  lines.push(`PMR (misura ridotta):  € ${risultato.base.toFixed(2)}`);
  if (risultato.max) lines.push(`Edittale massimo:      € ${risultato.max.toFixed(2)}`);
  if (risultato.mostraScontata)
    lines.push(`Scontata 30% (≤5 gg):  € ${risultato.baseScontata.toFixed(2)}  [art. 202 c.1]`);
  if (risultato.mostraNotturna) {
    lines.push('');
    lines.push('── NOTTURNA (22:00–07:00) ──');
    lines.push(`PMR notturna:          € ${risultato.baseNotte.toFixed(2)}  [art. 208 c.1]`);
    if (risultato.mostraScontata)
      lines.push(`Scontata 30% (≤5 gg):  € ${risultato.baseNotteScontata.toFixed(2)}`);
  }
  if (risultato.recidiva) {
    lines.push('');
    lines.push('⚠ Recidiva applicata (importi raddoppiati — art. 195 c.2)');
  }
  if (punti) lines.push(`\nPunti patente: ${punti}`);
  lines.push('\nCalcolato con PolisRoad');

  return lines.join('\n');
}
