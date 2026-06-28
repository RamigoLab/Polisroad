-- =============================================================================
-- Permette agli admin di eliminare i profili utente (e le tabelle figlio)
-- =============================================================================
-- CONTESTO: la policy DELETE su profiles mancava per gli admin.
-- Senza di questa, qualsiasi DELETE da client con anon/service_role key
-- veniva bloccata da RLS con "permission denied".
-- La funzione is_admin() è già presente dalla migration fix_profiles_rls_deadlock.
-- =============================================================================

-- Profili: admin può eliminare qualsiasi riga
DROP POLICY IF EXISTS "Admin elimina profili" ON public.profiles;
CREATE POLICY "Admin elimina profili"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Tabelle figlio: admin può eliminare i dati di qualsiasi utente
-- (normalmente gestite dal CASCADE, ma meglio averle esplicite)

DROP POLICY IF EXISTS "Admin elimina xp_history" ON public.xp_history;
CREATE POLICY "Admin elimina xp_history"
  ON public.xp_history FOR DELETE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin elimina gamification" ON public.gamification;
CREATE POLICY "Admin elimina gamification"
  ON public.gamification FOR DELETE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin elimina note" ON public.note;
CREATE POLICY "Admin elimina note"
  ON public.note FOR DELETE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin elimina preferiti" ON public.preferiti;
CREATE POLICY "Admin elimina preferiti"
  ON public.preferiti FOR DELETE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin elimina segnalazioni" ON public.segnalazioni;
CREATE POLICY "Admin elimina segnalazioni"
  ON public.segnalazioni FOR DELETE
  TO authenticated
  USING (public.is_admin() OR auth.uid() = user_id);
