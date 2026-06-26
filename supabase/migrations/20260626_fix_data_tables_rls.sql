-- =============================================================================
-- FIX: RLS per codice_strada, prontuario e news
-- =============================================================================
-- PROBLEMA 1: la tabella codice_strada non ha policy SELECT → nessun utente
--   può leggere la normativa se RLS è abilitata
-- PROBLEMA 2: le policy admin su prontuario usano subquery ricorsiva su profiles
--   (stesso deadlock già risolto per la tabella profiles)
-- SOLUZIONE: usare is_admin() SECURITY DEFINER per tutte le policy admin
-- =============================================================================

-- Assicurarsi che is_admin() esista (creata in 20260626_fix_profiles_rls_deadlock.sql)
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

-- ─── CODICE_STRADA (Normativa) ───────────────────────────────────────────────
-- Abilita RLS se non già attivo
ALTER TABLE public.codice_strada ENABLE ROW LEVEL SECURITY;

-- Lettura: tutti (autenticati e anonimi) — è normativa pubblica
DROP POLICY IF EXISTS "codice_strada_select_authenticated" ON public.codice_strada;
DROP POLICY IF EXISTS "codice_strada_select_anon" ON public.codice_strada;
DROP POLICY IF EXISTS "Lettura normativa pubblica" ON public.codice_strada;

CREATE POLICY "codice_strada_select_authenticated"
  ON public.codice_strada FOR SELECT TO authenticated USING (true);

CREATE POLICY "codice_strada_select_anon"
  ON public.codice_strada FOR SELECT TO anon USING (true);

-- Scrittura: solo admin (usa is_admin() per evitare deadlock)
DROP POLICY IF EXISTS "codice_strada_insert_admin" ON public.codice_strada;
DROP POLICY IF EXISTS "codice_strada_update_admin" ON public.codice_strada;
DROP POLICY IF EXISTS "codice_strada_delete_admin" ON public.codice_strada;

CREATE POLICY "codice_strada_insert_admin"
  ON public.codice_strada FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "codice_strada_update_admin"
  ON public.codice_strada FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "codice_strada_delete_admin"
  ON public.codice_strada FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── PRONTUARIO ──────────────────────────────────────────────────────────────
-- Fix policy admin: sostituire subquery ricorsiva con is_admin()
DROP POLICY IF EXISTS "prontuario_insert_admin" ON public.prontuario;
DROP POLICY IF EXISTS "prontuario_update_admin" ON public.prontuario;
DROP POLICY IF EXISTS "prontuario_delete_admin" ON public.prontuario;

CREATE POLICY "prontuario_insert_admin"
  ON public.prontuario FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "prontuario_update_admin"
  ON public.prontuario FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "prontuario_delete_admin"
  ON public.prontuario FOR DELETE TO authenticated
  USING (public.is_admin());

-- ─── NEWS ────────────────────────────────────────────────────────────────────
-- Fix policy admin: sostituire subquery ricorsiva con is_admin() (se presenti)
DROP POLICY IF EXISTS "Inserimento news admin" ON public.news;
DROP POLICY IF EXISTS "Aggiornamento news admin" ON public.news;
DROP POLICY IF EXISTS "Eliminazione news admin" ON public.news;

CREATE POLICY "Inserimento news admin"
  ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Aggiornamento news admin"
  ON public.news FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Eliminazione news admin"
  ON public.news FOR DELETE TO authenticated
  USING (public.is_admin());
