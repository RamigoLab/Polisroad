-- =============================================================================
-- Rimozione tabelle gamification (rimossa in v1.9.4)
-- =============================================================================
-- La gamification (XP, badge, streak) è stata rimossa dall'app in v1.9.4.
-- Questa migration elimina le tabelle residue per mantenere il DB pulito.
-- È sicura da eseguire: usa IF EXISTS su tutto.
-- =============================================================================

-- Rimuovi policy RLS prima del DROP (evita errori su alcuni ambienti)
DROP POLICY IF EXISTS "Lettura propria gamification"      ON public.gamification;
DROP POLICY IF EXISTS "Inserimento propria gamification"  ON public.gamification;
DROP POLICY IF EXISTS "Aggiornamento propria gamification" ON public.gamification;
DROP POLICY IF EXISTS "Lettura propria history XP"        ON public.xp_history;
DROP POLICY IF EXISTS "Inserimento propria history XP"    ON public.xp_history;

-- Drop tabelle
DROP TABLE IF EXISTS public.xp_history   CASCADE;
DROP TABLE IF EXISTS public.gamification CASCADE;

-- Rimuovi colonna total_contestazioni da gamification (già droppata con la tabella)
-- ma per sicurezza gestiamo il caso in cui la migrazione 20260531 avesse agito su
-- una tabella diversa
-- (nessuna azione aggiuntiva necessaria se DROP CASCADE ha funzionato)
