-- Abilita RLS sulla tabella news
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Rimuovi eventuali policy preesistenti
DROP POLICY IF EXISTS "Lettura news pubblica" ON public.news;
DROP POLICY IF EXISTS "Inserimento news admin" ON public.news;
DROP POLICY IF EXISTS "Aggiornamento news admin" ON public.news;
DROP POLICY IF EXISTS "Eliminazione news admin" ON public.news;

-- 1. SELECT: pubblica (lettura libera per chiunque)
CREATE POLICY "Lettura news pubblica"
ON public.news
FOR SELECT
USING (true);

-- 2. INSERT: solo utenti amministratori
CREATE POLICY "Inserimento news admin"
ON public.news
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- 3. UPDATE: solo utenti amministratori
CREATE POLICY "Aggiornamento news admin"
ON public.news
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. DELETE: solo utenti amministratori
CREATE POLICY "Eliminazione news admin"
ON public.news
FOR DELETE
TO authenticated
USING (public.is_admin());
