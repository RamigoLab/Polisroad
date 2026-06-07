import React from 'react';
import { Badge } from './ui/Badge';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';

/**
 * Optimised and Memoised List Item for Prontuario page.
 * Uses strict shallow equality check on props to prevent unnecessary re-renders
 * when other list items or global state changes.
 */
export const ProntuarioItem = React.memo(({ item, onClick, isFavorite }) => {
  return (
    <div onClick={onClick} style={S.cardClickable}>
      <div style={PS.prontuarioItemRow}>
        <Badge>{item.rif_normativo}</Badge>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {item.punti_patente > 0 && <Badge type="danger">-{item.punti_patente} pt</Badge>}
          {isFavorite && <span style={{ color: '#f1c40f' }}>⭐</span>}
        </div>
      </div>
      <h3 style={{ fontSize: '1rem', color: C.text, marginBottom: '8px', lineHeight: 1.3 }}>
        {item.titolo || item.articolo_nome || (item.descrizione ? (item.descrizione.substring(0, 80) + '...') : 'Nessun titolo')}
      </h3>
      <div style={PS.prontuarioItemMeta}>
        <span style={S.valueDanger}>Sanzione: €{item.pmr}</span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparator for maximum performance
  return (
    prevProps.isFavorite === nextProps.isFavorite &&
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.titolo === nextProps.item.titolo &&
    prevProps.item.rif_normativo === nextProps.item.rif_normativo &&
    prevProps.item.punti_patente === nextProps.item.punti_patente &&
    prevProps.item.codice_violazione === nextProps.item.codice_violazione &&
    prevProps.item.pmr === nextProps.item.pmr
  );
});
