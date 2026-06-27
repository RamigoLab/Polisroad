import { C } from '../theme';

export const ricerca = {
  ricercaGroupTitle: (color) => ({
    color,
    marginBottom: '12px',
    fontSize: '1.1rem',
    borderBottom: `2px solid ${color}22`,
    paddingBottom: '4px',
  }),
  ricercaResultItem: {
    backgroundColor: C.card,
    padding: '12px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  // Contenitore colonna: badge rif_normativo sopra, euro sotto a destra
  ricercaResultMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '6px',
  },
  // Riga interna: badge a sinistra, euro a destra
  ricercaResultMetaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    flexWrap: 'wrap',
  },
  ricercaResultTitle: {
    fontSize: '0.85rem',
    color: C.text,
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};
