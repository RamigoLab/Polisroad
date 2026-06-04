-- Abilita RLS su profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ripristina le policy se esistono
DROP POLICY IF EXISTS "Lettura profili autenticati" ON public.profiles;
DROP POLICY IF EXISTS "Inserimento proprio profilo" ON public.profiles;
DROP POLICY IF EXISTS "Aggiornamento proprio profilo" ON public.profiles;

-- 1. Consenti la lettura dei profili a tutti gli utenti autenticati
CREATE POLICY "Lettura profili autenticati"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- 2. Consenti l'inserimento del proprio profilo durante il signUp
CREATE POLICY "Inserimento proprio profilo"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- 3. Consenti l'aggiornamento del proprio profilo (es. grado, nome, cognome)
CREATE POLICY "Aggiornamento proprio profilo"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Funzione del trigger per bloccare o sovrascrivere l'assegnazione automatica del ruolo admin
CREATE OR REPLACE FUNCTION public.handle_profile_role_protection()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se l'operatore non è admin, forza il ruolo a 'operatore' o mantieni il vecchio ruolo
  IF (TG_OP = 'INSERT') THEN
    IF (NEW.ruolo = 'admin' AND NOT public.is_admin()) THEN
      NEW.ruolo := 'operatore';
    END IF;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (NEW.ruolo <> OLD.ruolo AND NOT public.is_admin()) THEN
      NEW.ruolo := OLD.ruolo; -- Rifiuta il cambio di ruolo
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Associa il trigger alla tabella profiles
DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_profile_role_protection();
