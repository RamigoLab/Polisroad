/**
 * styles.js – PolisRoad
 * Stili condivisi riutilizzabili in tutta l'applicazione.
 * Importare con: import { S } from '../styles/styles';
 */
import { C } from './theme';

export const S = {

  // ─────────────────────────────────────────────
  // LAYOUT
  // ─────────────────────────────────────────────
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  pageTitle: {
    color: C.primary,
    fontSize: '1.4rem',
    fontWeight: '700',
    margin: 0,
  },
  sectionTitle: {
    color: C.primary,
    marginBottom: '16px',
    fontSize: '1.2rem',
    fontWeight: '700',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },

  // ─────────────────────────────────────────────
  // CARD
  // ─────────────────────────────────────────────
  card: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  cardElevated: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  cardClickable: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    cursor: 'pointer',
  },

  // ─────────────────────────────────────────────
  // FORM
  // ─────────────────────────────────────────────
  formCard: {
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  formHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    alignItems: 'center',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
    marginBottom: '24px',
  },

  // ─────────────────────────────────────────────
  // BOTTONI
  // ─────────────────────────────────────────────
  btnPrimary: {
    width: '100%',
    padding: '12px',
    backgroundColor: C.primary,
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  btnPrimarySmall: {
    padding: '8px 16px',
    backgroundColor: C.primary,
    color: '#fff',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  btnSecondary: {
    flex: 1,
    padding: '12px',
    backgroundColor: C.surface,
    color: C.text,
    borderRadius: '8px',
    fontWeight: 'bold',
  },
  btnAccent: {
    padding: '6px 12px',
    backgroundColor: C.accentLight,
    color: C.accent,
    borderRadius: '6px',
    fontSize: '0.85rem',
  },
  btnDanger: {
    padding: '6px 12px',
    backgroundColor: C.dangerLight,
    color: C.danger,
    borderRadius: '6px',
    fontSize: '0.85rem',
  },
  btnOutline: {
    width: '100%',
    padding: '12px',
    backgroundColor: C.surface,
    color: C.primary,
    borderRadius: '8px',
    fontWeight: 'bold',
    marginTop: '20px',
    border: `1px solid ${C.primary}33`,
  },
  btnCancel: {
    color: C.textLight,
    padding: '4px',
  },

  // ─────────────────────────────────────────────
  // BOX INFORMATIVI
  // ─────────────────────────────────────────────
  infoBox: {
    backgroundColor: C.accentLight,
    padding: '16px',
    borderRadius: '12px',
    borderLeft: `4px solid ${C.accent}`,
  },
  infoBoxTitle: {
    color: C.accent,
    marginBottom: '4px',
    fontSize: '0.95rem',
    fontWeight: '700',
  },
  warningBox: {
    padding: '12px',
    backgroundColor: C.warningLight,
    borderRadius: '8px',
    borderLeft: `4px solid ${C.warning}`,
  },
  dangerBox: {
    backgroundColor: C.dangerLight,
    padding: '16px',
    borderRadius: '12px',
    borderLeft: `4px solid ${C.danger}`,
  },
  dangerBoxTitle: {
    color: C.danger,
    marginBottom: '4px',
    fontSize: '0.95rem',
    fontWeight: '700',
  },
  successBox: {
    backgroundColor: C.successLight,
    padding: '16px',
    borderRadius: '12px',
    borderLeft: `4px solid ${C.success}`,
  },

  // ─────────────────────────────────────────────
  // PROFILO / DATA ROW
  // ─────────────────────────────────────────────
  dataRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: `1px solid ${C.border}`,
  },
  dataRowIcon: {
    fontSize: '1.2rem',
    marginRight: '12px',
    width: '24px',
    textAlign: 'center',
  },
  dataRowLabel: {
    fontSize: '0.75rem',
    color: C.textLight,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  dataRowValue: {
    fontSize: '1rem',
    color: C.text,
    fontWeight: '500',
  },

  // ─────────────────────────────────────────────
  // TESTO / BADGE
  // ─────────────────────────────────────────────
  labelSmall: {
    fontSize: '0.75rem',
    color: C.textLight,
  },
  labelUppercase: {
    fontSize: '0.8rem',
    color: C.textLight,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  valueText: {
    fontWeight: 'bold',
    color: C.text,
  },
  valuePrimary: {
    fontWeight: 'bold',
    color: C.primary,
  },
  valueDanger: {
    fontWeight: 'bold',
    color: C.danger,
  },
  valueSuccess: {
    fontWeight: 'bold',
    color: C.success,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },

  // ─────────────────────────────────────────────
  // EMPTY STATE
  // ─────────────────────────────────────────────
  emptyState: {
    textAlign: 'center',
    padding: '40px',
    color: C.textLight,
  },
  emptyStateBox: {
    textAlign: 'center',
    padding: '40px',
    color: C.textLight,
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: `2px dashed ${C.border}`,
  },
  emptyStateIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '16px',
  },
};
