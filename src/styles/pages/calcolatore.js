import { C } from '../theme';

export const calcolatore = {
  calcResultPrimary: {
    backgroundColor: C.surface,
    padding: '16px',
    borderRadius: '12px',
    borderLeft: `4px solid ${C.primary}`,
  },
  calcResultSuccess: {
    backgroundColor: C.successLight,
    padding: '16px',
    borderRadius: '12px',
    borderLeft: `4px solid ${C.success}`,
  },
  calcResultDanger: {
    backgroundColor: C.dangerLight,
    padding: '16px',
    borderRadius: '12px',
    borderLeft: `4px solid ${C.danger}`,
  },
  calcResultLabel: { fontSize: '0.85rem', color: C.textLight, marginBottom: '4px' },
  calcResultValueLg: { fontSize: '1.6rem', fontWeight: 'bold' },
  calcResultValueMd: { fontSize: '1.4rem', fontWeight: 'bold' },
  calcResultSub: { fontSize: '0.85rem', marginTop: '8px' },
};
