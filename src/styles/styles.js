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
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    flexShrink: 0,
  },
  cardElevated: {
    backgroundColor: C.card,
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    overflow: 'hidden',
    flexShrink: 0,
  },
  cardClickable: {
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    flexShrink: 0,
  },

  // ─────────────────────────────────────────────
  // FORM
  // ─────────────────────────────────────────────
  formCard: {
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flexShrink: 0,
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
    padding: '13px',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    color: '#fff',
    borderRadius: 'var(--radius-pill)',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    border: 'none',
    letterSpacing: '0.01em',
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
    padding: '12px',
    backgroundColor: 'var(--bg-surface-container)',
    color: 'var(--color-text)',
    borderRadius: 'var(--radius-pill)',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: '1px solid var(--color-border)',
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
    padding: '10px 16px',
    backgroundColor: 'transparent',
    color: 'var(--color-accent)',
    borderRadius: 'var(--radius-pill)',
    fontWeight: '600',
    fontSize: '0.88rem',
    cursor: 'pointer',
    border: '1.5px solid var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }33`,
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
    backgroundColor: C.card,
    borderRadius: '12px',
    border: `2px dashed ${C.border}`,
  },
  emptyStateIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '16px',
  },
};
