-- Aggiunge il campo approvato alla tabella profiles per il flusso di approvazione account.
-- Gli account nuovi partono con approvato = false.
-- L'admin li approva dalla sezione AdminUtenti.
-- Il frontend impedisce l'accesso se approvato = false.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS approvato boolean NOT NULL DEFAULT false;

-- Gli utenti admin sono approvati automaticamente
UPDATE public.profiles SET approvato = true WHERE ruolo = 'admin';

-- Policy aggiornata: l'utente può leggere il proprio profilo anche se non approvato
-- (serve per sapere lo stato di approvazione al login)
DROP POLICY IF EXISTS "Lettura profili autenticati" ON public.profiles;

CREATE POLICY "Lettura profili autenticati"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id  -- l'utente può sempre leggere il proprio profilo
  OR
  EXISTS (         -- oppure è admin
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.ruolo = 'admin'
  )
);

-- Commento esplicativo
COMMENT ON COLUMN public.profiles.approvato IS
  'Se false, l''account è in attesa di approvazione da parte di un admin. L''utente può autenticarsi ma non accedere all''app.';
