import React from 'react';
import { LS } from '../../styles/layout';
import { APP_VERSION } from '../../config/constants';

export const Splash = () => (
  <div style={LS.splashContainer}>
    <img src="/icons/icon-192.png" alt="PolisRoad" style={LS.splashLogo} />
    <h1 style={LS.splashTitle}>PolisRoad</h1>
    <p style={LS.splashSubtitle}>Controllo del Territorio</p>
    <div style={LS.splashProgressWrapper}>
      <div style={LS.splashProgressTrack}>
        <div style={LS.splashProgressBar} />
      </div>
      <span style={LS.splashVersion}>v{APP_VERSION}</span>
    </div>
  </div>
);
