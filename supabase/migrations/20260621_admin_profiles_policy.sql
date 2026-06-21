-- Rimuovi la policy per gli admin se esisteva
DROP POLICY IF EXISTS "Aggiornamento profili da admin" ON public.profiles;

-- Crea la policy per consentire agli amministratori di modificare qualsiasi profilo
CREATE POLICY "Aggiornamento profili da admin"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
