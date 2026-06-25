-- =============================================================================
-- FIX CRITICO: deadlock RLS sulla tabella profiles
-- =============================================================================
-- PROBLEMA: la policy "Lettura profili autenticati" (20260623) usava una
-- subquery ricorsiva su profiles per verificare il ruolo admin:
--   EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.ruolo = 'admin')
-- Questa subquery triggera di nuovo la stessa policy RLS → loop infinito →
-- la query non ritorna nulla → profile = null → isApproved = false → blocco.
--
-- SOLUZIONE: usare una funzione SECURITY DEFINER che bypassa RLS per
-- verificare il ruolo, oppure semplificare la policy SELECT a "solo il proprio
-- record" (che non ha bisogno di subquery su profiles).
-- =============================================================================

-- 1. Funzione SECURITY DEFINER per verificare se l'utente corrente è admin
--    (bypassa RLS, quindi nessun rischio di loop)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND ruolo = 'admin'
  );
$$;

-- 2. Ricrea la policy SELECT senza subquery ricorsiva.
--    Ogni utente autenticato può leggere SOLO il proprio profilo.
--    Gli admin vedono tutti i profili tramite la funzione is_admin() che
--    bypassa RLS con SECURITY DEFINER.
DROP POLICY IF EXISTS "Lettura profili autenticati" ON public.profiles;

CREATE POLICY "Lettura profili autenticati"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id        -- ogni utente legge solo il proprio profilo
  OR public.is_admin()   -- gli admin leggono tutti (is_admin usa SECURITY DEFINER, nessun loop)
);

-- 3. Assicurarsi che il proprio account admin sia approvato
UPDATE public.profiles SET approvato = true WHERE ruolo = 'admin';

-- 4. Verifica finale (eseguita solo in contesto superuser, ignorata dal client)
-- SELECT email, ruolo, approvato FROM public.profiles WHERE ruolo = 'admin';
