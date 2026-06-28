/**
 * usePushNotifications.js
 * Gestisce le notifiche push PWA via Web Push API.
 *
 * Flusso:
 * 1. L'utente clicca "Attiva notifiche" nel Profilo
 * 2. Il browser chiede il permesso
 * 3. Se concesso, il service worker si sottoscrive con la VAPID public key
 * 4. La subscription viene salvata in Supabase (tabella push_subscriptions)
 * 5. L'Edge Function send-push può inviare notifiche a tutti i subscriber
 *
 * MULTI-DISPOSITIVO / MULTI-BROWSER:
 * Ogni browser/dispositivo ha il proprio endpoint push univoco.
 * Un utente con Chrome + Safari + Firefox avrà 3 righe in push_subscriptions.
 * isSubscribed riflette solo lo stato del browser corrente (by design).
 * Il campo deviceCount mostra quante subscription totali ha l'utente su Supabase.
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { useAuth } from './useAuth';
import { logger } from '../utils/logger';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/** Converte base64url in Uint8Array (richiesto dalla Push API) */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

export const usePushNotifications = () => {
  const { session } = useAuth();
  const [permission, setPermission] = useState(() =>
    'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [deviceCount, setDeviceCount] = useState(0); // subscription totali utente su Supabase
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // FIX BUG-07: rilevamento Safari non-standalone per messaggio mirato
  const isSafariNotStandalone =
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent) &&
    !window.navigator.standalone &&
    !(window.matchMedia('(display-mode: standalone)').matches);

  const isSupported =
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!VAPID_PUBLIC_KEY;

  // Controlla se già iscritto nel browser corrente + conta dispositivi totali
  useEffect(() => {
    if (!isSupported || !session) return;

    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setIsSubscribed(!!sub))
      .catch(() => {});

    // Conta quante subscription ha l'utente su Supabase (tutti i dispositivi)
    if (isSupabaseConfigured && supabase) {
      supabase
        .from('push_subscriptions')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', session.user.id)
        .then(({ count }) => setDeviceCount(count || 0))
        .catch(() => {});
    }
  }, [isSupported, session]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !session) return;
    setLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;

      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('Permesso notifiche negato. Puoi riattivarlo dalle impostazioni del browser.');
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      if (isSupabaseConfigured && supabase) {
        const { error: dbError } = await supabase
          .from('push_subscriptions')
          .upsert({
            user_id: session.user.id,
            endpoint: sub.endpoint,
            p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh')))),
            auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth')))),
            updated_at: new Date().toISOString(),
          }, { onConflict: 'endpoint' });
        if (dbError) throw dbError;
        // Aggiorna il contatore dopo subscribe
        setDeviceCount(prev => prev + 1);
      }

      setIsSubscribed(true);
      logger.log('Push subscription saved');
    } catch (err) {
      logger.error('Push subscribe error:', err);
      setError('Impossibile attivare le notifiche. Riprova più tardi.');
    } finally {
      setLoading(false);
    }
  }, [isSupported, session]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        if (isSupabaseConfigured && supabase) {
          await supabase
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
          setDeviceCount(prev => Math.max(0, prev - 1));
        }
      }
      setIsSubscribed(false);
    } catch (err) {
      logger.error('Push unsubscribe error:', err);
      setError('Impossibile disattivare le notifiche. Riprova.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Disattiva su tutti i dispositivi dell'utente
  const unsubscribeAll = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      // Prima disiscrive il browser corrente via Push API
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      // Poi elimina TUTTE le subscription dell'utente da Supabase
      if (isSupabaseConfigured && supabase) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', session.user.id);
      }

      setIsSubscribed(false);
      setDeviceCount(0);
    } catch (err) {
      logger.error('Push unsubscribeAll error:', err);
      setError('Impossibile disattivare le notifiche su tutti i dispositivi. Riprova.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  return {
    isSupported,
    isSafariNotStandalone,
    isSubscribed,
    deviceCount,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
    unsubscribeAll,
  };
};
