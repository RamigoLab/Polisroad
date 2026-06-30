import React from 'react';
import { LS } from '../../styles/layout';
import { APP_VERSION } from '../../config/constants';

export const Splash = () => (
  <div style={LS.splashContainer}>
    <div style={{
        width: '96px', height: '96px', borderRadius: '22px',
        overflow: 'hidden', marginBottom: '20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      }}>
        <img src="/icons/icon-192.png" alt="PolisRoad"
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} />
      </div>
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
