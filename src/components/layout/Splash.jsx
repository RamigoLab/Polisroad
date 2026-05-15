import React from 'react';
import { LS } from '../../styles/layout';
import { APP_VERSION } from '../../config/constants';

export const Splash = () => {
  return (
    <div style={LS.splashContainer}>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          @keyframes progress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}
      </style>

      <div style={LS.splashLogoWrapper}>
        <img 
          src="/icons/icon-192.png" 
          alt="PolisRoad Logo" 
          style={LS.splashLogoImg}
        />
      </div>
      
      <h1 style={LS.splashTitle}>PolisRoad</h1>
      <p style={LS.splashSubtitle}>Il tuo compagno su strada</p>

      <div style={LS.splashProgressWrapper}>
        <div style={LS.splashProgressTrack}>
          <div style={LS.splashProgressBar} />
        </div>
        <span style={LS.splashVersion}>VERSIONE {APP_VERSION}</span>
      </div>
    </div>
  );
};
