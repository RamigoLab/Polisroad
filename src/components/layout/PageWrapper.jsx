import React, { useRef } from 'react';
import { LS } from '../../styles/layout';
import { AppHeader } from './AppHeader';
import { useSwipeBack } from '../../hooks/useSwipeBack';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import { C } from '../../styles/theme';
import { Icon } from '../ui/Icon';

/**
 * PageWrapper — contenitore di pagina con:
 * - Header opzionale (AppHeader)
 * - Swipe back gesture (→ onBack se fornita, altrimenti onNavigate con history.back)
 * - Pull-to-refresh (→ onRefresh se fornita)
 */
export const PageWrapper = ({
  children,
  style = {},
  contentStyle = {},
  onNavigate,
  hideLogo = false,
  hideHeader = false,
  title,
  subtitle,
  meta,
  headerChildren,
  headerLeftAction,
  headerRightAction,
  onHeaderTitleClick,
  showBadge = false,
  // Swipe back: se non fornita usa window.history.back()
  onBack,
  enableSwipeBack = true,
  // Pull-to-refresh
  onRefresh,
  enablePullToRefresh = false,
}) => {
  const hasHeader = onNavigate && !hideLogo && !hideHeader &&
    (title || subtitle || meta || headerChildren || headerLeftAction || headerRightAction);

  const scrollRef = useRef(null);

  // Swipe back — torna alla pagina precedente
  const swipeBackFn = onBack ?? (onNavigate ? () => window.history.back() : null);
  useSwipeBack(swipeBackFn, enableSwipeBack && !!swipeBackFn);

  // Pull-to-refresh
  const { isPulling, isRefreshing, pullProgress } = usePullToRefresh(
    onRefresh,
    scrollRef,
    enablePullToRefresh && !!onRefresh
  );

  const showPullIndicator = (isPulling || isRefreshing) && enablePullToRefresh && onRefresh;

  return (
    <div style={{ ...LS.wrapper, padding: hasHeader ? 0 : LS.wrapper.padding, ...style }}>
      {hasHeader && (
        <AppHeader
          title={title}
          subtitle={subtitle}
          meta={meta}
          onNavigate={onNavigate}
          onTitleClick={onHeaderTitleClick}
          leftAction={headerLeftAction}
          rightAction={headerRightAction}
          showBadge={showBadge}
        >
          {headerChildren}
        </AppHeader>
      )}

      {/* Indicatore Pull-to-refresh */}
      {showPullIndicator && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: `${Math.round(pullProgress * 48)}px`,
          overflow: 'hidden',
          transition: isRefreshing ? 'none' : 'height 0.1s',
          backgroundColor: C.surfaceContainer,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            opacity: isRefreshing ? 1 : pullProgress,
            animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none',
          }}>
            <Icon
              name="refresh-cw"
              size={18}
              color={C.accent}
              style={{ animation: isRefreshing ? 'spin 0.8s linear infinite' : 'none' }}
            />
            <span style={{ fontSize: '0.8rem', color: C.textLight, fontWeight: '600' }}>
              {isRefreshing ? 'Aggiornamento...' : 'Rilascia per aggiornare'}
            </span>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        style={hasHeader ? { ...LS.pageContent, ...contentStyle } : contentStyle}
      >
        {children}
      </div>
    </div>
  );
};
