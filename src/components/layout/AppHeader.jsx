import React from 'react';
import { LS } from '../../styles/layout';
import { useGamificationContext } from '../../context/GamificationContext';
import { BADGES } from '../../config/badges';

export const AppHeader = ({
  title,
  subtitle,
  meta,
  onNavigate,
  onTitleClick,
  children,
  leftAction,
  rightAction,
}) => {
  const { featuredBadge: featuredBadgeId } = useGamificationContext();
  // featuredBadge nel context è un ID stringa (es. 'novice'); lo risolviamo nell'oggetto badge completo
  const featuredBadge = featuredBadgeId
    ? Object.values(BADGES).find(b => b.id === featuredBadgeId) || null
    : null;

  const hasText = subtitle || title || meta;

  return (
    <header style={LS.appHeader}>
      <div style={LS.appHeaderInner}>
        {leftAction && <div style={LS.appHeaderLeftAction}>{leftAction}</div>}
        <div
          style={LS.appHeaderText(onTitleClick)}
          onClick={onTitleClick}
          role={onTitleClick ? 'button' : undefined}
          tabIndex={onTitleClick ? 0 : undefined}
          onKeyDown={(event) => {
            if (onTitleClick && (event.key === 'Enter' || event.key === ' ')) {
              event.preventDefault();
              onTitleClick();
            }
          }}
        >
          {subtitle && <p style={LS.appHeaderSubtitle}>{subtitle}</p>}
          {title && (
            <h2 style={LS.appHeaderTitle}>
              {title}
              {featuredBadge && title !== "Profilo Operatore" && (
                <span style={{ marginLeft: '8px', fontSize: '1.2rem', verticalAlign: 'middle' }}>{featuredBadge.icon}</span>
              )}
            </h2>
          )}
          {meta && <p style={LS.appHeaderMeta}>{meta}</p>}
          {!hasText && (
            <h2 style={LS.appHeaderTitle}>
              PolisRoad
              {featuredBadge && <span style={{ marginLeft: '8px', fontSize: '1.2rem', verticalAlign: 'middle' }}>{featuredBadge.icon}</span>}
            </h2>
          )}
        </div>
        {rightAction}
        <button
          type="button"
          onClick={() => onNavigate?.('home')}
          style={LS.appHeaderLogoWrapper}
          aria-label="Torna alla home"
        >
          <img src="/icons/icon-192.png" alt="PolisRoad" style={LS.appHeaderLogo} />
        </button>
      </div>
      {children && <div style={LS.appHeaderActions}>{children}</div>}
    </header>
  );
};
