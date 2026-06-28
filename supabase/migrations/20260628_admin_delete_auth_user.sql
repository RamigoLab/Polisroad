-- Funzione RPC per permettere agli admin di eliminare completamente un utente
-- anche da auth.users. Questo scatenerà i cascade su profiles e tabelle figlie.
CREATE OR REPLACE FUNCTION delete_user_by_admin(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica che l'utente chiamante sia un admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND ruolo = 'admin'
  ) THEN
    RAISE EXCEPTION 'Accesso negato: solo gli amministratori possono eliminare utenti da auth.users.';
  END IF;

  -- Elimina l'utente da auth.users.
  -- NOTA: se le foreign key su "profiles" o altre tabelle non hanno ON DELETE CASCADE,
  -- andranno cancellate manualmente qui prima, o modificate nel DB.
  DELETE FROM auth.users WHERE id = user_id;
END;
$$;
