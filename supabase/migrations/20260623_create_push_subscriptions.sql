-- Tabella per le subscription push PWA.
-- Ogni utente può avere più subscription (uno per dispositivo/browser).
-- Usata dalla Edge Function send-push per inviare notifiche.

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint    text NOT NULL UNIQUE,
  p256dh      text NOT NULL,
  auth        text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Indice per recuperare subscription per utente
CREATE INDEX IF NOT EXISTS push_subscriptions_user_id_idx
  ON public.push_subscriptions(user_id);

-- RLS: ogni utente vede solo le proprie subscription
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lettura proprie subscription"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Inserimento propria subscription"
ON public.push_subscriptions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Aggiornamento propria subscription"
ON public.push_subscriptions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Eliminazione propria subscription"
ON public.push_subscriptions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Gli admin possono leggere tutte le subscription (per invio broadcast)
CREATE POLICY "Admin lettura tutte subscription"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.ruolo = 'admin'
  )
);

COMMENT ON TABLE public.push_subscriptions IS
  'Subscription Web Push per notifiche PWA. Gestita da usePushNotifications.js e dall''Edge Function send-push.';
