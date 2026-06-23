import { C } from '../theme';

export const prontuario = {
  prontuarioDetailHeader: {
    backgroundColor: C.card,
    padding: '16px',
    borderBottom: `1px solid ${C.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  prontuarioDetailHeaderMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4px',
  },
  prontuarioDetailBody: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  prontuarioSanzioniGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '12px',
  },
  prontuarioSanzioniCell: {
    backgroundColor: C.surface,
    padding: '8px',
    borderRadius: '8px',
    textAlign: 'center',
  },
  prontuarioSanzioniLabel: { fontSize: '0.75rem', color: C.textLight },
  prontuarioItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  prontuarioItemMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: C.textLight,
  },
  prontuarioNoteBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  prontuarioMemoBlock: {
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
  },
  prontuarioMemoHeader: {
    color: C.primary,
    marginBottom: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
};
