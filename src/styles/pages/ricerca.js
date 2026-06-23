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
  ricercaResultMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '4px',
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
