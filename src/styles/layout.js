import { C } from './theme';

export const LS = {

  // ── PAGE WRAPPER ──────────────────────────────
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    position: 'relative',
    animation: 'fadeInUp 0.2s ease',
  },
  pageContent: {
    padding: '16px 16px 90px 16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    gap: '0px',
  },

  // ── APP HEADER ────────────────────────────────
  appHeader: {
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    color: '#fff',
    padding: '20px 16px 20px 16px',
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
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.65)',
    marginBottom: '4px',
    fontWeight: '500',
    letterSpacing: '0.02em',
  },
  appHeaderTitle: {
    fontSize: '1.35rem',
    marginBottom: '4px',
    lineHeight: 1.25,
    fontWeight: '700',
    overflowWrap: 'anywhere',
    color: '#fff',
  },
  appHeaderMeta: {
    fontSize: '0.82rem',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
  appHeaderLeftAction: {
    flexShrink: 0,
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
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    padding: '2px',
    display: 'block',
    objectFit: 'contain',
  },
  appHeaderActions: {
    marginTop: '14px',
  },

  // ── BOTTOM NAV ────────────────────────────────
  navContainer: {
    backgroundColor: C.card,
    borderTop: `1px solid ${C.border}`,
    boxShadow: '0 -4px 16px rgba(0,0,0,0.06)',
  },
  navScroll: {
    display: 'flex',
    justifyContent: 'space-around',
    padding: '8px 0 10px',
    alignItems: 'center',
  },
  navTab: (isActive) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '4px 12px',
    cursor: 'pointer',
    borderRadius: '10px',
    transition: 'opacity 0.15s ease',
    minWidth: '52px',
    // L'opacity qui era applicata anche all'etichetta di testo: un audit
    // Lighthouse reale ha misurato un contrasto di 2.87:1 sui tab inattivi
    // (sotto il minimo 4.5:1 WCAG) proprio a causa di questa riduzione al
    // 60%. Il colore del testo (navTabLabel, sotto) da solo distingue già
    // attivo/inattivo con contrasto pieno — l'opacity ridotta ora si applica
    // solo all'icona (vedi BottomNav.jsx), non più al testo.
  }),
  navTabIndicator: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  navTabLabel: (isActive) => ({
    fontSize: '0.62rem',
    fontWeight: isActive ? '700' : '500',
    color: isActive ? C.accent : C.textLight,
    letterSpacing: '0.01em',
    marginTop: '1px',
  }),

  // ── SPLASH ────────────────────────────────────
  splashContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  splashLogo: {
    width: '96px',
    height: '96px',
    borderRadius: '22px',
    marginBottom: '20px',
    display: 'block',
  },
  splashTitle: {
    color: '#fff',
    fontSize: '2.2rem',
    fontWeight: '800',
    letterSpacing: '-0.5px',
  },
  splashSubtitle: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '1rem',
    fontWeight: '500',
    marginTop: '4px',
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
    height: '3px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginBottom: '8px',
  },
  splashProgressBar: {
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.8)',
    animation: 'progress 3s ease-in-out forwards',
  },
  splashVersion: {
    fontSize: '0.75rem',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: '1px',
    fontWeight: '600',
  },

  // ── ADMIN LAYOUT ──────────────────────────────
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
    borderBottom: '1px solid rgba(255,255,255,0.12)',
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
    fontWeight: '700',
  },
  adminCloseBtn: () => ({
    color: '#fff',
    backgroundColor: 'rgba(255,255,255,0.12)',
    padding: '6px 14px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.25)',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
  }),
  adminTabBar: {
    display: 'flex',
    overflowX: 'auto',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    gap: '8px',
    scrollbarWidth: 'none',
  },
  adminTab: (isActive, accent) => ({
    padding: '7px 14px',
    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
    color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
    borderRadius: '20px',
    border: `1px solid ${isActive ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)'}`,
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    fontWeight: isActive ? '700' : '500',
    fontSize: '0.85rem',
    cursor: 'pointer',
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
