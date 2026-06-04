ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lettura propria gamification" ON public.gamification;
DROP POLICY IF EXISTS "Inserimento propria gamification" ON public.gamification;
DROP POLICY IF EXISTS "Aggiornamento propria gamification" ON public.gamification;
DROP POLICY IF EXISTS "Lettura propria history XP" ON public.xp_history;
DROP POLICY IF EXISTS "Inserimento propria history XP" ON public.xp_history;

CREATE POLICY "Lettura propria gamification"
ON public.gamification
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Inserimento propria gamification"
ON public.gamification
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Aggiornamento propria gamification"
ON public.gamification
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Lettura propria history XP"
ON public.xp_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Inserimento propria history XP"
ON public.xp_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
