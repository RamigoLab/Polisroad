import React from 'react';
import { LS } from '../../styles/layout';
import { AppHeader } from './AppHeader';

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
}) => {
  const hasHeader = onNavigate && !hideLogo && !hideHeader && (title || subtitle || meta || headerChildren || headerLeftAction || headerRightAction);

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
        >
          {headerChildren}
        </AppHeader>
      )}
      <div style={hasHeader ? { ...LS.pageContent, ...contentStyle } : contentStyle}>
        {children}
      </div>
    </div>
  );
};
