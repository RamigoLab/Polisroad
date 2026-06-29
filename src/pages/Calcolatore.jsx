import React, { useState, useEffect } from 'react';
import posthog from 'posthog-js';
import { PageWrapper } from '../components/layout/PageWrapper';
import { TextInput } from '../components/ui/TextInput';
import { SelectInput } from '../components/ui/SelectInput';
import { Icon } from '../components/ui/Icon';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { useProntuario } from '../hooks/useProntuario';
import { calcolaSanzione, generaTestoCalcolo } from '../utils/calcolatoreUtils';

// Chiave sessionStorage per persistere l'ultimo calcolo nella sessione
const SESSION_KEY = 'polisroad_calcolatore_state';

function loadSessionState() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSessionState(state) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  } catch {
    // sessionStorage non disponibile, ignora
  }
}

// ─── Componente card risultato ────────────────────────────────────────────────
const RisultatoCard = ({ style, label, valore, sub, note }) => (
  <div style={{ ...style, padding: '14px 16px', borderRadius: '12px' }}>
    <div style={PS.calcResultLabel}>{label}</div>
    <div style={{ fontSize: '1.65rem', fontWeight: '800', marginTop: '2px' }}>
      € {typeof valore === 'number' ? valore.toFixed(2) : valore}
    </div>
    {sub && <div style={{ ...PS.calcResultSub, marginTop: '6px' }}>{sub}</div>}
    {note && (
      <div style={{ fontSize: '0.72rem', color: C.textLight, marginTop: '4px', fontStyle: 'italic' }}>
        {note}
      </div>
    )}
  </div>
);

// ─── Toggle switch ────────────────────────────────────────────────────────────
const Toggle = ({ label, sublabel, checked, onChange, icon }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
      backgroundColor: checked ? `${C.accent}12` : C.surfaceContainer,
      border: `1.5px solid ${checked ? C.accent : C.border}`,
      transition: 'all 0.2s',
    }}
  >
    <div style={{
      width: 40, height: 22, borderRadius: '11px',
      backgroundColor: checked ? C.accent : C.border,
      position: 'relative', transition: 'background-color 0.2s', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: checked ? 21 : 3,
        width: 16, height: 16, borderRadius: '50%',
        backgroundColor: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '0.88rem', fontWeight: '600', color: C.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon && <Icon name={icon} size={14} color={checked ? C.accent : C.textLight} />}
        {label}
      </div>
      {sublabel && <div style={{ fontSize: '0.75rem', color: C.textLight, marginTop: '2px' }}>{sublabel}</div>}
    </div>
  </div>
);

// ─── Pagina principale ────────────────────────────────────────────────────────
export const Calcolatore = ({ onNavigate }) => {
  const { list } = useProntuario();

  // Inizializza da sessionStorage se disponibile
  const _saved = loadSessionState();

  const [selectedId, setSelectedId]   = useState(_saved?.selectedId   ?? '');
  const [pmr, setPmr]                 = useState(_saved?.pmr          ?? '');
  const [edittaleMax, setEdittaleMax] = useState(_saved?.edittaleMax  ?? '');
  const [punti, setPunti]             = useState(_saved?.punti        ?? '');
  const [nomeViolazione, setNomeViolazione] = useState(_saved?.nomeViolazione ?? '');
  const [recidiva, setRecidiva]             = useState(_saved?.recidiva       ?? false);
  const [notturna, setNotturna]             = useState(_saved?.notturna       ?? false);
  const [riduzioneFiveDay, setRiduzione]    = useState(_saved?.riduzioneFiveDay ?? true);
  const [copied, setCopied] = useState(false);

  // Persisti stato in sessionStorage ad ogni modifica
  useEffect(() => {
    saveSessionState({ selectedId, pmr, edittaleMax, punti, nomeViolazione, recidiva, notturna, riduzioneFiveDay });
  }, [selectedId, pmr, edittaleMax, punti, nomeViolazione, recidiva, notturna, riduzioneFiveDay]);

  const handleSelect = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    const item = list.find(p => p.id === id);
    if (item) {
      posthog.capture('calcolatore_used', { prontuario_id: id });
      setPmr(item.pmr ? item.pmr.toString() : '');
      setEdittaleMax(item.edittale_max ? item.edittale_max.toString() : '');
      setPunti(item.punti_patente ? item.punti_patente.toString() : '');
      setNomeViolazione(`${item.rif_normativo} – ${item.titolo}`);
    }
  };

  const handleReset = () => {
    setSelectedId(''); setPmr(''); setEdittaleMax('');
    setPunti(''); setNomeViolazione('');
    setRecidiva(false); setNotturna(false); setRiduzione(true);
    setCopied(false);
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* noop */ }
  };

  const risultato = calcolaSanzione({ pmr, edittaleMax, recidiva, notturna, riduzioneFiveDay });

  const handleCopy = () => {
    const testo = generaTestoCalcolo({ risultato, punti, nomeViolazione });
    navigator.clipboard.writeText(testo).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <PageWrapper title="Calcolatore Sanzioni" subtitle="Importi, sconti e maggiorazioni" onNavigate={onNavigate}>

      {/* ── SELEZIONE VIOLAZIONE ── */}
      <div style={{ ...S.formCard, marginBottom: '16px' }}>
        <SelectInput
          label="Pre-compila da violazione (Opzionale)"
          value={selectedId}
          onChange={handleSelect}
          options={list
            .filter(item => item.titolo && item.rif_normativo)
            .map(item => ({ value: item.id, label: `${item.rif_normativo} – ${item.titolo.substring(0, 40)}` }))}
        />
        <TextInput
          label="PMR / Sanzione Base (€)"
          type="number"
          value={pmr}
          onChange={e => { if (e.target.value === '' || parseFloat(e.target.value) >= 0) setPmr(e.target.value); }}
          placeholder="es. 87.00"
        />
        <TextInput
          label="Edittale Massimo (€) — opzionale"
          type="number"
          value={edittaleMax}
          onChange={e => { if (e.target.value === '' || parseFloat(e.target.value) >= 0) setEdittaleMax(e.target.value); }}
          placeholder="es. 345.00"
        />
        <TextInput
          label="Punti Patente"
          type="number"
          value={punti}
          onChange={e => { if (e.target.value === '' || parseInt(e.target.value, 10) >= 0) setPunti(e.target.value); }}
          placeholder="es. 10"
        />
      </div>

      {/* ── OPZIONI CALCOLO ── */}
      <div style={{ ...S.formCard, marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: '700', color: C.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          Opzioni calcolo
        </p>
        <Toggle
          label="Riduzione 30% (≤ 5 giorni)"
          sublabel="Art. 202 c. 1 CdS — pagamento entro 5 giorni dalla contestazione"
          checked={riduzioneFiveDay}
          onChange={setRiduzione}
          icon="percent"
        />
        <Toggle
          label="Violazione notturna"
          sublabel="Art. 208 c. 1 CdS — maggiorazione +1/3 tra le 22:00 e le 07:00"
          checked={notturna}
          onChange={setNotturna}
          icon="moon"
        />
        <Toggle
          label="Recidiva (biennio)"
          sublabel="Art. 195 c. 2 CdS — stessa violazione già commessa negli ultimi 2 anni"
          checked={recidiva}
          onChange={setRecidiva}
          icon="repeat"
        />
      </div>

      {/* ── RISULTATI ── */}
      {risultato ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>

          {recidiva && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', borderRadius: '10px',
              backgroundColor: `${C.warning}18`, border: `1px solid ${C.warning}`,
            }}>
              <Icon name="triangle-alert" size={16} color={C.warning} />
              <span style={{ fontSize: '0.82rem', color: C.warning, fontWeight: '600' }}>
                Recidiva attiva — importi raddoppiati (art. 195 c. 2)
              </span>
            </div>
          )}

          <RisultatoCard
            style={{ ...PS.calcResultPrimary, color: C.primary }}
            label="PMR — Pagamento in Misura Ridotta"
            valore={risultato.base}
            sub={risultato.max ? `Edittale massimo: € ${risultato.max.toFixed(2)}` : null}
          />

          {riduzioneFiveDay && (
            <RisultatoCard
              style={PS.calcResultSuccess}
              label="Scontata 30% — Pagamento entro 5 giorni"
              valore={risultato.baseScontata}
              note="Art. 202 c. 1 CdS"
            />
          )}

          {notturna && (
            <>
              <RisultatoCard
                style={PS.calcResultDanger}
                label="Sanzione Notturna — Maggiorazione +1/3"
                valore={risultato.baseNotte}
                sub={risultato.maxNotte ? `Edittale massimo notturno: € ${risultato.maxNotte.toFixed(2)}` : null}
                note="Art. 208 c. 1 CdS — orario 22:00–07:00"
              />
              {riduzioneFiveDay && (
                <RisultatoCard
                  style={{ ...PS.calcResultDanger, borderLeftColor: C.textLight }}
                  label="Notturna scontata 30% (≤ 5 giorni)"
                  valore={risultato.baseNotteScontata}
                  note="Art. 202 c. 1 + Art. 208 c. 1 CdS"
                />
              )}
            </>
          )}

          {punti > 0 && (
            <div style={{
              ...PS.calcResultPrimary,
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '10px',
            }}>
              <Icon name="credit-card" size={20} color={C.primary} />
              <div>
                <div style={PS.calcResultLabel}>Decurtazione Punti Patente</div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: C.primary }}>
                  {punti} punt{parseInt(punti) === 1 ? 'o' : 'i'}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button
              onClick={handleCopy}
              style={{
                flex: 1, padding: '13px', borderRadius: '12px',
                backgroundColor: copied ? C.success : C.accent,
                color: '#fff', fontWeight: '700', fontSize: '0.9rem',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'background-color 0.2s',
              }}
            >
              <Icon name={copied ? 'circle-check' : 'copy'} size={16} color="#fff" />
              {copied ? 'Copiato!' : 'Copia riepilogo'}
            </button>
            <button
              onClick={handleReset}
              style={{
                padding: '13px 16px', borderRadius: '12px',
                backgroundColor: C.surfaceContainer, color: C.textLight,
                fontWeight: '600', fontSize: '0.9rem',
                border: `1px solid ${C.border}`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
            >
              <Icon name="rotate-cw" size={15} color={C.textLight} />
              Reset
            </button>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: C.textLight }}>
          <Icon name="calculator" size={40} color={C.border} />
          <p style={{ fontSize: '0.95rem', marginTop: '12px' }}>
            Inserisci un importo PMR per calcolare le sanzioni.
          </p>
        </div>
      )}
    </PageWrapper>
  );
};
