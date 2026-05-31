CREATE TABLE IF NOT EXISTS public.segnalazioni (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  tipo text NOT NULL,
  dettagli text NOT NULL,
  email text,
  operatore text,
  risolto boolean DEFAULT false NOT NULL
);

ALTER TABLE public.segnalazioni ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND ruolo = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Inserimento segnalazioni" ON public.segnalazioni;
DROP POLICY IF EXISTS "Gestione segnalazioni" ON public.segnalazioni;
DROP POLICY IF EXISTS "Inserimento segnalazioni autenticati" ON public.segnalazioni;
DROP POLICY IF EXISTS "Lettura segnalazioni admin" ON public.segnalazioni;
DROP POLICY IF EXISTS "Aggiornamento segnalazioni admin" ON public.segnalazioni;
DROP POLICY IF EXISTS "Eliminazione segnalazioni admin" ON public.segnalazioni;

CREATE POLICY "Inserimento segnalazioni autenticati"
ON public.segnalazioni
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Lettura segnalazioni admin"
ON public.segnalazioni
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE POLICY "Aggiornamento segnalazioni admin"
ON public.segnalazioni
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Eliminazione segnalazioni admin"
ON public.segnalazioni
FOR DELETE
TO authenticated
USING (public.is_admin());
