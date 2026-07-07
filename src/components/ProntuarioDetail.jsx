import React, { useState } from 'react';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';
import { Badge } from './ui/Badge';
import { Icon } from './ui/Icon';
import { useSyncQueue } from '../hooks/useSyncQueue';

/**
 * Vista dettaglio di una singola voce del Prontuario.
 * Estratto da Prontuario.jsx per riutilizzo (es. Operatore).
 *
 * Layout:
 *  1. Card Titolo articolo (card bianca, grassetto)
 *  2. Card Note Comuni (se presenti — stesse per tutte le casistiche dell'articolo)
 *  3. Card Descrizione Violazione
 *  4. Card Sanzioni
 *  5. Note verbale / Note operative
 *  6. Memo personale
 *  7. Registra Contestazione
 */
/**
 * Estrae il numero articolo da stringhe tipo "Art. 186 c. 2" o "Art. 186".
 * Restituisce una stringa numerica o null.
 */
function extractArticoloNum(rifNormativo) {
  if (!rifNormativo) return null;
  const match = rifNormativo.match(/Art(?:icolo)?\.?\s*(\d+)/i);
  return match ? match[1] : null;
}

export const ProntuarioDetail = ({
  item,
  nota,
  onSaveNota,
  onContestazione,
  onNavigate,
}) => {
  const [editNote, setEditNote] = useState(false);
  const [tempNote, setTempNote] = useState(nota || '');
  const { addToQueue } = useSyncQueue();

  const handleSave = async () => {
    await onSaveNota(tempNote);
    setEditNote(false);
  };

  const handleContestazione = () => {
    if (!navigator.onLine) {
      addToQueue('SAVE_CONTESTAZIONE', { prontuarioId: item.id, xp: 20 });
    } else {
      onContestazione();
    }
  };

  const articoloNum = extractArticoloNum(item.rif_normativo || item.articolo_numero);

  return (
    <div style={PS.prontuarioDetailBody}>

      {/* 1. TITOLO ARTICOLO */}
      <div style={S.card}>
        <h4 style={{ color: C.primary, marginBottom: '4px' }}>
          {item.rif_normativo || `Art. ${item.articolo_numero}`}
        </h4>
        <p style={{ fontWeight: '700', fontSize: '1rem', color: C.text, lineHeight: 1.4, margin: 0 }}>
          {item.titolo || item.articolo_nome || 'Voce Prontuario'}
        </p>
        {onNavigate && articoloNum && (
          <button
            onClick={() => onNavigate('normativa', { searchArticolo: articoloNum })}
            style={{
              marginTop: '10px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem',
              fontWeight: '600',
              color: C.accent,
              background: C.accentLight,
              border: 'none',
              borderRadius: '8px',
              padding: '6px 12px',
              cursor: 'pointer',
            }}
          >
            <Icon name="book-open" size={14} />
            Leggi Art. {articoloNum} nel Codice della Strada
          </button>
        )}
      </div>

      {/* 2. NOTE COMUNI (stesse per tutte le casistiche dell'articolo) */}
      {item.note_comuni && (
        <div style={S.card}>
          <h4 style={{ color: C.primary, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="book-open" size={15} /> Norme Comuni dell'Articolo
          </h4>
          <p style={{ fontSize: '0.9rem', color: C.text, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {item.note_comuni}
          </p>
        </div>
      )}

      {/* 3. DESCRIZIONE VIOLAZIONE */}
      <div style={S.card}>
        <h4 style={{ color: C.primary, marginBottom: '8px' }}>Descrizione Violazione</h4>
        <p style={{ fontSize: '0.95rem', color: C.text, lineHeight: 1.5 }}>{item.descrizione}</p>
      </div>

      {/* 4. SANZIONI */}
      <div style={S.card}>
        <h4 style={{ color: C.primary, marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Sanzioni</span>
          {item.punti_patente > 0 && <Badge type="danger">-{item.punti_patente} Punti</Badge>}
        </h4>
        <div style={PS.prontuarioSanzioniGrid}>
          <div style={PS.prontuarioSanzioniCell}>
            <div style={PS.prontuarioSanzioniLabel}>PMR (Diurna)</div>
            <div style={S.valueDanger}>€{item.pmr ?? 'N.D.'}</div>
          </div>
          <div style={PS.prontuarioSanzioniCell}>
            <div style={PS.prontuarioSanzioniLabel}>Scontata 30%</div>
            <div style={S.valueSuccess}>{item.scontato_30 ? `€${item.scontato_30}` : 'N.A.'}</div>
          </div>
          <div style={PS.prontuarioSanzioniCell}>
            <div style={PS.prontuarioSanzioniLabel}>Sanzione Notturna</div>
            <div style={{ fontWeight: 'bold', color: item.sanzione_notturna ? C.danger : C.text }}>
              {item.sanzione_notturna_importo
                ? `€${item.sanzione_notturna_importo}`
                : item.sanzione_notturna
                  ? `€${(parseFloat(item.pmr) * 1.333333).toFixed(2)}`
                  : 'Non prevista'}
            </div>
          </div>
          <div style={PS.prontuarioSanzioniCell}>
            <div style={PS.prontuarioSanzioniLabel}>Not. Scontata</div>
            <div style={S.valueSuccess}>{item.sanzione_notturna_scontata ? `€${item.sanzione_notturna_scontata}` : 'N.A.'}</div>
          </div>
        </div>
        {item.sanzione_accessoria && item.sanzione_accessoria !== 'Nessuna' && (
          <div style={S.warningBox}>
            <strong style={{ fontSize: '0.85rem', color: C.warning }}>Sanzione Accessoria:</strong>
            <p style={{ fontSize: '0.9rem', marginTop: '4px' }}>{item.sanzione_accessoria}</p>
          </div>
        )}
      </div>

      {/* 5. NOTE VERBALE / OPERATIVE */}
      <div style={PS.prontuarioNoteBlock}>
        {item.note_verbale && (
          <div style={S.infoBox}>
            <h4 style={{ ...S.infoBoxTitle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="file-text" size={16} /> Note al Verbale
            </h4>
            <p style={{ fontSize: '0.9rem' }}>{item.note_verbale}</p>
          </div>
        )}
        {item.note_operative && (
          <div style={S.dangerBox}>
            <h4 style={{ ...S.dangerBoxTitle, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Icon name="shield-alert" size={16} /> Note Operative
            </h4>
            <p style={{ fontSize: '0.9rem' }}>{item.note_operative}</p>
          </div>
        )}
      </div>

      {/* 6. MEMO PERSONALE */}
      <div style={PS.prontuarioMemoBlock}>
        <h4 style={PS.prontuarioMemoHeader}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <Icon name="lightbulb" size={15} /> Memo Personale
          </span>
          {!editNote && (
            <button onClick={() => { setEditNote(true); setTempNote(nota || ''); }} style={{ fontSize: '0.8rem', color: C.accent }}>
              Modifica
            </button>
          )}
        </h4>
        {editNote ? (
          <div>
            <textarea
              value={tempNote}
              onChange={e => setTempNote(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${C.border}`, minHeight: '80px', marginBottom: '8px', fontFamily: 'inherit' }}
              placeholder="Aggiungi una nota personale..."
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditNote(false)} style={S.btnCancel}>Annulla</button>
              <button onClick={handleSave} style={S.btnPrimarySmall}>Salva</button>
            </div>
          </div>
        ) : (
          <p style={{ fontSize: '0.9rem', color: nota ? C.text : C.textLight, whiteSpace: 'pre-wrap' }}>
            {nota || 'Nessuna nota salvata. Clicca su Modifica per aggiungerne una.'}
          </p>
        )}
      </div>

      {/* 7. REGISTRA CONTESTAZIONE */}
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <button
          onClick={handleContestazione}
          style={{ ...S.btnPrimary, backgroundColor: C.danger, padding: '12px 24px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: `0 4px 12px ${C.danger}40` }}
        >
          <Icon name="pen-line" size={16} /> Registra Contestazione
        </button>
        <p style={{ fontSize: '0.8rem', color: C.textLight, marginTop: '8px' }}>
          Registra questa contestazione nel tuo profilo per sbloccare traguardi e statistiche.
        </p>
      </div>

    </div>
  );
};
