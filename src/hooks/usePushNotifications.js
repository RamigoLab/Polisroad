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
 * SETUP NECESSARIO:
 * - Generare chiavi VAPID: npx web-push generate-vapid-keys
 * - Aggiungere VITE_VAPID_PUBLIC_KEY alle env vars (Vercel + .env)
 * - Eseguire la migration SQL push_subscriptions
 * - Deployare la Edge Function supabase/functions/send-push
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isSupported =
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    !!VAPID_PUBLIC_KEY;

  // Controlla se già iscritto al mount
  useEffect(() => {
    if (!isSupported || !session) return;
    navigator.serviceWorker.ready
      .then(reg => reg.pushManager.getSubscription())
      .then(sub => setIsSubscribed(!!sub))
      .catch(() => {});
  }, [isSupported, session]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !session) return;
    setLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;

      // Chiedi permesso
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') {
        setError('Permesso notifiche negato. Puoi riattivarlo dalle impostazioni del browser.');
        return;
      }

      // Crea subscription
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // Salva in Supabase
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

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
};
