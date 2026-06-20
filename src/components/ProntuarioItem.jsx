import React from 'react';
import { Badge } from './ui/Badge';
import { Icon } from './ui/Icon';
import { C } from '../styles/theme';
import { S } from '../styles/styles';
import { PS } from '../styles/pages';

/**
 * Optimised and Memoised List Item for Prontuario page.
 * Order: titolo → rif_normativo badge → sanzione
 */
export const ProntuarioItem = React.memo(({ item, onClick, isFavorite }) => {
  return (
    <div onClick={onClick} style={S.cardClickable}>
      {/* Titolo prima */}
      <h3 style={{ fontSize: '1rem', color: C.text, marginBottom: '8px', lineHeight: 1.3 }}>
        {item.titolo || item.articolo_nome || (item.descrizione ? (item.descrizione.substring(0, 80) + '...') : 'Nessun titolo')}
      </h3>

      {/* Badge rif_normativo sotto il titolo, con wrap per testi lunghi */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center', marginBottom: '8px' }}>
        <Badge style={{ whiteSpace: 'normal', wordBreak: 'break-word', maxWidth: '100%' }}>
          {item.rif_normativo}
        </Badge>
        {item.punti_patente > 0 && <Badge type="danger">-{item.punti_patente} pt</Badge>}
        {isFavorite && <Icon name="star" size={16} color="#f1c40f" />}
      </div>

      {/* Sanzione */}
      <div style={PS.prontuarioItemMeta}>
        <span style={S.valueDanger}>Sanzione: €{item.pmr}</span>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
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
