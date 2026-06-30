import React from 'react';
import { LS } from '../../styles/layout';

export const AppHeader = ({
  title, subtitle, meta,
  onNavigate, onTitleClick, children,
  leftAction, rightAction,
}) => {
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
          onKeyDown={(e) => {
            if (onTitleClick && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault(); onTitleClick();
            }
          }}
        >
          {subtitle && <p style={LS.appHeaderSubtitle}>{subtitle}</p>}
          {title   && <h2 style={LS.appHeaderTitle}>{title}</h2>}
          {meta    && <p style={LS.appHeaderMeta}>{meta}</p>}
          {!hasText && <h2 style={LS.appHeaderTitle}>PolisRoad</h2>}
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
