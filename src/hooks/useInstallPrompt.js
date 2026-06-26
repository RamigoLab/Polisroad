/**
 * useInstallPrompt.js
 * Cattura l'evento beforeinstallprompt del browser per mostrare
 * un pulsante di installazione PWA personalizzato nell'app.
 *
 * Flusso:
 * 1. Il browser emette `beforeinstallprompt` quando rileva che l'app
 *    è installabile (manifest valido, SW registrato, HTTPS, criteri PWA).
 * 2. preventDefault() impedisce il banner automatico del browser.
 * 3. L'evento viene conservato in `deferredPrompt`.
 * 4. Quando l'utente clicca il pulsante → `promptInstall()` mostra
 *    il dialog nativo di installazione.
 * 5. Dopo l'installazione `appinstalled` azzera lo stato.
 */
import { useState, useEffect, useCallback } from 'react';

export const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Controlla se già installata (standalone mode)
    const mq = window.matchMedia('(display-mode: standalone)');
    if (mq.matches || window.navigator.standalone === true) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault(); // blocca il mini-infobar automatico del browser
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    // Indipendentemente dalla scelta, l'evento può essere usato una sola volta
    setDeferredPrompt(null);
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
  }, [deferredPrompt]);

  return { isInstallable, isInstalled, promptInstall };
};
