import { C } from '../theme';

export const admin = {
  adminListItem: (isPublished) => ({
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    borderLeft: `4px solid ${isPublished ? C.success : C.textLight}`,
  }),
  adminListItemHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  adminListItemTitle: { fontSize: '1rem', color: C.text, marginBottom: '12px' },
  adminListItemActions: { display: 'flex', gap: '8px' },
  adminItemRef: { fontSize: '0.8rem', color: C.primary, fontWeight: 'bold' },
  adminItemRefSuccess: { fontSize: '0.8rem', color: C.success, fontWeight: 'bold' },
  adminItemTitle: { fontSize: '1rem', color: C.text, margin: '4px 0 12px 0' },
  adminSanzioniGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
  },
  adminSelect: {
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${C.border}`,
    backgroundColor: C.surface,
    fontSize: '0.9rem',
    width: '100%',
  },
};
