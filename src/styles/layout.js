/**
 * layout.js – PolisRoad
 * Stili per i componenti di layout (PageWrapper, BottomNav, Splash, AdminLayout).
 * Importare con: import { LS } from '../styles/layout';
 */
import { C } from './theme';

export const LS = {

  // ─────────────────────────────────────────────
  // PAGE WRAPPER
  // ─────────────────────────────────────────────
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 16px 80px 16px',
    overflowY: 'auto',
    position: 'relative',
  },
  pageContent: {
    padding: '16px 16px 80px 16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  appHeader: {
    backgroundColor: C.primary,
    color: '#fff',
    padding: '20px 16px 28px 16px',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
    flexShrink: 0,
  },
  appHeaderInner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '12px',
  },
  appHeaderText: (isClickable) => ({
    flex: 1,
    minWidth: 0,
    cursor: isClickable ? 'pointer' : 'default',
  }),
  appHeaderSubtitle: {
    fontSize: '0.95rem',
    color: C.accentLight,
    marginBottom: '8px',
    fontWeight: '500',
  },
  appHeaderTitle: {
    fontSize: '1.45rem',
    marginBottom: '6px',
    lineHeight: 1.3,
    fontWeight: '700',
    overflowWrap: 'anywhere',
  },
  appHeaderMeta: {
    fontSize: '0.9rem',
    opacity: 0.85,
    fontWeight: '500',
  },
  appHeaderLogoWrapper: {
    flexShrink: 0,
    marginLeft: 'auto',
    cursor: 'pointer',
    padding: 0,
    border: 'none',
    background: 'transparent',
  },
  appHeaderLogo: {
    width: '56px',
    height: '56px',
    borderRadius: '12px',
    backgroundColor: C.card,
    padding: '2px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    display: 'block',
  },
  appHeaderActions: {
    marginTop: '16px',
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  appHeaderLeftAction: {
    flexShrink: 0,
    paddingTop: '2px',
  },
  logoWrapper: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    zIndex: 50,
    cursor: 'pointer',
  },
  logoImg: {
    width: '44px',
    height: '44px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255,255,255,0.8)',
    backdropFilter: 'blur(4px)',
    padding: '2px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    border: 'solid 1px rgba(0,0,0,0.05)',
  },

  // ─────────────────────────────────────────────
  // BOTTOM NAV
  // ─────────────────────────────────────────────
  navContainer: {
    position: 'sticky',
    bottom: 0,
    zIndex: 100,
    width: '100%',
    backgroundColor: C.card,
    borderTop: `1px solid ${C.border}`,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
  },
  navScroll: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: '8px 8px calc(env(safe-area-inset-bottom, 8px) + 8px) 8px',
    gap: '4px',
  },
  navTab: (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
    padding: '2px',
    color: isActive ? C.primary : C.textLight,
    transition: 'color 0.2s ease',
  }),
  navTabIndicator: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px 14px',
    borderRadius: C.radiusPill,
    backgroundColor: isActive ? C.surfaceContainerHigh : 'transparent',
    marginBottom: '4px',
    transition: 'background-color 0.2s ease',
  }),
  navTabLabel: (isActive) => ({
    fontSize: '0.7rem',
    fontWeight: isActive ? '700' : '500',
  }),

  // ─────────────────────────────────────────────
  // SPLASH
  // ─────────────────────────────────────────────
  splashContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: C.primary,
    color: '#fff',
    animation: 'fadeIn 0.5s ease-in',
  },
  splashLogoWrapper: {
    width: '120px',
    height: '120px',
    backgroundColor: C.card,
    borderRadius: '24px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
    animation: 'pulse 2s infinite',
    overflow: 'hidden',
  },
  splashLogoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  splashTitle: {
    fontSize: '2.5rem',
    marginBottom: '8px',
    fontWeight: '800',
    letterSpacing: '1px',
  },
  splashSubtitle: {
    color: C.accentLight,
    fontSize: '1.1rem',
    fontWeight: '500',
  },
  splashProgressWrapper: {
    position: 'absolute',
    bottom: '80px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '60%',
    maxWidth: '250px',
  },
  splashProgressTrack: {
    width: '100%',
    height: '4px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  splashProgressBar: {
    height: '100%',
    backgroundColor: C.card,
    animation: 'progress 3s ease-in-out forwards',
  },
  splashVersion: {
    fontSize: '0.8rem',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: '1px',
    fontWeight: 'bold',
  },

  // ─────────────────────────────────────────────
  // ADMIN LAYOUT
  // ─────────────────────────────────────────────
  adminContainer: (textColor) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: textColor,
    color: '#fff',
    minHeight: '100vh',
  }),
  adminHeader: {
    padding: '16px',
    borderBottom: '1px solid #444',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  adminHeaderTitle: {
    fontSize: '1.2rem',
    margin: 0,
  },
  adminCloseBtn: (accentLight) => ({
    color: '#fff',
    backgroundColor: accentLight,
    padding: '4px 8px',
    borderRadius: '4px',
    border: `1px solid ${C.border}`,
  }),
  adminTabBar: {
    display: 'flex',
    overflowX: 'auto',
    padding: '12px 16px',
    borderBottom: '1px solid #444',
    gap: '12px',
    scrollbarWidth: 'none',
  },
  adminTab: (isActive, accent) => ({
    padding: '8px 16px',
    backgroundColor: isActive ? accent : 'transparent',
    color: isActive ? '#fff' : '#aaa',
    borderRadius: '20px',
    border: `1px solid ${isActive ? accent : '#666'}`,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
  }),
  adminContent: {
    flex: 1,
    backgroundColor: C.surface,
    color: C.text,
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    marginTop: '16px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
};
