-- Fix RLS policy admin su push_subscriptions.
-- La vecchia policy usava EXISTS (SELECT FROM profiles ...) che può causare
-- problemi di deadlock RLS (stessa subquery ricorsiva già vista su profiles).
-- Soluzione: usare is_admin() SECURITY DEFINER che bypassa RLS.

-- Rimuovi la vecchia policy admin con subquery diretta
DROP POLICY IF EXISTS "Admin lettura tutte subscription" ON public.push_subscriptions;

-- Ricrea usando is_admin() SECURITY DEFINER (già presente da migration fix_profiles_rls_deadlock)
CREATE POLICY "Admin lettura tutte subscription"
ON public.push_subscriptions FOR SELECT
TO authenticated
USING (
  public.is_admin()
);

-- Aggiungi anche policy DELETE per admin (per pulire subscription scadute dall'Edge Function)
DROP POLICY IF EXISTS "Admin elimina subscription scadute" ON public.push_subscriptions;

CREATE POLICY "Admin elimina subscription scadute"
ON public.push_subscriptions FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id OR public.is_admin()
);
