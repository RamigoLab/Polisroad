import React from 'react';
import { LS } from '../../styles/layout';

export const PageWrapper = ({ children, style = {}, onNavigate, hideLogo = false }) => {
  return (
    <div style={{ ...LS.wrapper, ...style }}>
      {onNavigate && !hideLogo && (
        <div onClick={() => onNavigate('home')} style={LS.logoWrapper}>
          <img src="/icons/icon-192.png" alt="PolisRoad Logo" style={LS.logoImg} />
        </div>
      )}
      {children}
    </div>
  );
};
