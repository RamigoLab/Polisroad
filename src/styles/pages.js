/**
 * pages.js – PolisRoad
 * Stili specifici per componenti e pagine.
 * Importare con: import { PS } from '../styles/pages';
 */
import { C } from './theme';

export const PS = {

  // ─────────────────────────────────────────────
  // HOME
  // ─────────────────────────────────────────────
  homeHeader: {
    backgroundColor: C.primary,
    color: '#fff',
    padding: '20px 16px 28px 16px',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
  },
  homeHeaderInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  homeSubtitle: {
    fontSize: '0.95rem',
    color: C.accentLight,
    marginBottom: '8px',
    fontWeight: '500',
    letterSpacing: '0.3px',
  },
  homeName: {
    fontSize: '1.6rem',
    marginBottom: '6px',
    lineHeight: 1.3,
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  homeForza: {
    fontSize: '0.9rem',
    opacity: 0.85,
    fontWeight: '500',
    letterSpacing: '0.2px',
  },
  homeLogo: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: C.card,
    padding: '2px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    flexShrink: 0,
  },
  homeLogoWrapper: {
    flexShrink: 0,
    marginLeft: 'auto',
    cursor: 'pointer',
  },
  homeQuickActions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    flex: 1,
  },
  homeSearchBtn: {
    flex: 1,
    width: '100%',
    backgroundColor: C.card,
    color: C.primary,
    padding: '12px 16px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  homeBody: {
    padding: '16px',
  },
  homeOperatoreBtn: {
    width: '100%',
    backgroundColor: C.danger,
    color: '#fff',
    padding: '16px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '1.1rem',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(192,57,43,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    animation: 'operatorePulse 2.5s infinite',
  },
  homeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '24px',
  },
  homeNavCard: {
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  homeNavCardIcon: {
    fontSize: '2rem',
  },
  homeNavCardLabel: {
    fontWeight: '600',
    color: C.text,
    fontSize: '0.9rem',
  },
  homeBannerBox: {
    backgroundColor: C.warningLight,
    padding: '16px',
    borderRadius: '12px',
    border: `1px solid ${C.warning}`,
    marginBottom: '24px',
  },
  homeBannerTitle: {
    color: C.warning,
    marginBottom: '4px',
    fontWeight: 'bold',
  },
  homeBannerText: {
    fontSize: '0.85rem',
    color: C.text,
  },
  homeAdminBtn: {
    width: '100%',
    backgroundColor: C.text,
    color: '#fff',
    padding: '16px',
    borderRadius: '12px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  homeLegalCard: {
    marginTop: '24px',
    padding: '16px',
    borderTop: `1px solid ${C.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  homeLegalRow: {
    display: 'flex',
    gap: '16px',
  },
  homeLegalLink: {
    fontSize: '0.8rem',
    color: C.accent,
    textDecoration: 'underline',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: 'inherit',
  },
  homeLegalVersion: {
    fontSize: '0.75rem',
    color: C.textLight,
  },

  // ─────────────────────────────────────────────
  // PRONTUARIO
  // ─────────────────────────────────────────────
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
  prontuarioSanzioniLabel: {
    fontSize: '0.75rem',
    color: C.textLight,
  },
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

  // ─────────────────────────────────────────────
  // NORMATIVA
  // ─────────────────────────────────────────────
  normativaDetailHeader: {
    backgroundColor: C.card,
    padding: '16px',
    borderBottom: `1px solid ${C.border}`,
    position: 'sticky',
    top: 0,
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  normativaDetailBadges: {
    display: 'flex',
    gap: '8px',
    marginBottom: '4px',
  },
  normativaDetailBody: {
    padding: '20px',
    backgroundColor: C.card,
    flex: 1,
  },
  normativaDetailText: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: C.text,
    whiteSpace: 'pre-wrap',
    textAlign: 'justify',
  },
  normativaItemRow: {
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    display: 'flex',
    gap: '16px',
    alignItems: 'center',
  },
  normativaItemNum: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '70px',
    borderRight: `1px solid ${C.border}`,
    paddingRight: '16px',
  },
  normativaItemNumPrefix: {
    fontSize: '0.7rem',
    color: C.textLight,
    fontWeight: 'bold',
  },
  normativaItemNumValue: {
    fontSize: '1.2rem',
    color: C.primary,
    fontWeight: 'bold',
  },
  normativaItemComma: {
    fontSize: '0.7rem',
    color: C.accent,
    fontWeight: '500',
  },
  normativaItemTitle: {
    fontSize: '0.95rem',
    color: C.text,
    lineHeight: 1.3,
    marginBottom: '4px',
  },
  normativaItemPreview: {
    fontSize: '0.8rem',
    color: C.textLight,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '200px',
  },

  // ─────────────────────────────────────────────
  // RICERCA
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // CALCOLATORE
  // ─────────────────────────────────────────────
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
  calcResultLabel: {
    fontSize: '0.85rem',
    color: C.textLight,
    marginBottom: '4px',
  },
  calcResultValueLg: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
  },
  calcResultValueMd: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
  },
  calcResultSub: {
    fontSize: '0.85rem',
    marginTop: '8px',
  },

  // ─────────────────────────────────────────────
  // NEWS
  // ─────────────────────────────────────────────
  newsItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  newsItemDate: {
    fontSize: '0.8rem',
    color: C.textLight,
  },
  newsItemTitle: {
    fontSize: '1.1rem',
    color: C.text,
    marginBottom: '8px',
    lineHeight: 1.3,
  },
  newsItemContent: {
    fontSize: '0.9rem',
    color: C.text,
    lineHeight: 1.5,
    marginBottom: '12px',
  },
  newsItemFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  newsItemSource: {
    fontSize: '0.8rem',
    color: C.textLight,
  },
  newsItemLink: {
    fontSize: '0.85rem',
    color: C.primary,
    fontWeight: 'bold',
    textDecoration: 'none',
  },

  // ─────────────────────────────────────────────
  // PROFILO
  // ─────────────────────────────────────────────
  profileHeaderBg: {
    backgroundColor: C.primary,
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  profileAvatar: {
    width: '60px',
    height: '60px',
    backgroundColor: C.card,
    borderRadius: '30px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    position: 'relative',
  },
  profileHeaderName: {
    color: '#fff',
    margin: 0,
    fontSize: '1.2rem',
  },
  profileHeaderGrado: {
    color: '#fff',
    margin: 0,
    fontSize: '0.85rem',
    opacity: 0.9,
  },
  profileSysBox: {
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    border: `1px solid ${C.border}`,
    marginBottom: '16px',
    flexShrink: 0,
  },
  profileSysTitle: {
    color: C.text,
    marginBottom: '12px',
    fontSize: '0.95rem',
    borderBottom: `1px solid ${C.border}`,
    paddingBottom: '8px',
  },
  profileSupportBox: {
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'center',
    border: `1px solid ${C.border}`,
    flexShrink: 0,
  },
  profileDonateBtn: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#0070ba',
    color: '#fff',
    borderRadius: '24px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '0.9rem',
  },
  profileExitBtn: {
    padding: '6px 12px',
    backgroundColor: C.dangerLight,
    color: C.danger,
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
  },

  // ─────────────────────────────────────────────
  // OPERATORE (dark mode)
  // ─────────────────────────────────────────────
  operatoreContainer: {
    flex: 1,
    backgroundColor: '#121212',
    color: '#e0e0e0',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    overflowY: 'auto',
  },
  operatoreHeader: {
    backgroundColor: '#c0392b',
    padding: '16px',
    color: '#fff',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  operatoreHeaderTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  operatoreHeaderTitle: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
  },
operatoreExitBtn: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: '0.8rem',
    padding: '6px 12px',
    borderRadius: '4px',
    fontWeight: 'bold',
  },
  operatoreHeaderMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  operatoreBody: {
    padding: '16px',
    flex: 1,
  },
  operatoreFavLabel: {
    color: '#f39c12',
    fontSize: '0.85rem',
    marginTop: '16px',
    marginBottom: '12px',
    fontWeight: 'bold',
  },
  operatoreItemCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '1px solid #333',
  },
  operatoreItemHeader: {
    padding: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  operatoreItemRef: {
    color: '#f39c12',
    fontWeight: 'bold',
    fontSize: '0.8rem',
    marginRight: '8px',
  },
  operatoreItemTitle: {
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  operatoreDetailPanel: {
    padding: '12px',
    borderTop: '1px solid #333',
    backgroundColor: '#252525',
  },
  operatoreGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '4px',
    marginBottom: '12px',
    textAlign: 'center',
  },
  operatoreCell: {
    backgroundColor: '#333',
    padding: '6px',
    borderRadius: '4px',
  },
  operatoreCellWide: {
    backgroundColor: '#333',
    padding: '6px',
    borderRadius: '4px',
    gridColumn: 'span 2',
  },
  operatoreCellLabel: {
    fontSize: '0.65rem',
    color: '#aaa',
  },
  operatoreCellValue: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  operatoreCellValueGreen: {
    fontSize: '0.9rem',
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  operatoreDescBlock: {
    marginBottom: '12px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '8px',
    borderRadius: '4px',
  },
  operatoreDescLabel: {
    fontSize: '0.75rem',
    color: '#aaa',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '4px',
  },
  operatoreDescText: {
    fontSize: '0.85rem',
    lineHeight: 1.4,
  },
  operatoreTagsRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '12px',
  },
  operatorePointsBadge: {
    backgroundColor: '#c0392b',
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
  },
  operatoreAccessoriaTag: {
    flex: 1,
    backgroundColor: '#333',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    color: '#ddd',
  },
  operatoreNoteOpBlock: {
    backgroundColor: 'rgba(192, 57, 43, 0.2)',
    padding: '8px',
    borderRadius: '4px',
    borderLeft: '3px solid #e74c3c',
    marginBottom: '8px',
  },
  operatoreNoteOpLabel: {
    fontSize: '0.75rem',
    color: '#e74c3c',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '2px',
  },
  operatoreMemoBlock: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    padding: '8px',
    borderRadius: '4px',
    borderLeft: '3px solid #f39c12',
  },
  operatoreMemoLabel: {
    fontSize: '0.75rem',
    color: '#f39c12',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '2px',
  },
  operatoreTextSm: {
    fontSize: '0.85rem',
  },

  // ─────────────────────────────────────────────
  // ADMIN COMUNE
  // ─────────────────────────────────────────────
  adminListItem: (isPublished) => ({
    backgroundColor: C.card,
    padding: '16px',
    borderRadius: '12px',
    borderLeft: `4px solid ${isPublished ? C.success : C.textLight}`,
  }),
  adminListItemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  adminListItemTitle: {
    fontSize: '1rem',
    color: C.text,
    marginBottom: '12px',
  },
  adminListItemActions: {
    display: 'flex',
    gap: '8px',
  },
  adminItemRef: {
    fontSize: '0.8rem',
    color: C.primary,
    fontWeight: 'bold',
  },
  adminItemRefSuccess: {
    fontSize: '0.8rem',
    color: C.success,
    fontWeight: 'bold',
  },
  adminItemTitle: {
    fontSize: '1rem',
    color: C.text,
    margin: '4px 0 12px 0',
  },
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
