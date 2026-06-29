-- =============================================================================
-- Notifica push agli admin quando un nuovo utente si registra
-- =============================================================================
-- Crea una funzione che viene invocata da un trigger INSERT su profiles.
-- Chiama la Edge Function send-push via http extension (pg_net).
-- NOTA: richiede l'estensione pg_net abilitata su Supabase
-- (Dashboard → Database → Extensions → pg_net → Enable).
-- Se pg_net non è disponibile, la funzione loggherà l'errore e non bloccherà
-- l'insert del profilo.
-- =============================================================================

-- Funzione trigger
CREATE OR REPLACE FUNCTION public.notify_admin_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_supabase_url  text := current_setting('app.supabase_url',  true);
  v_service_key   text := current_setting('app.service_role_key', true);
  v_nome          text;
BEGIN
  -- Componi il nome dell'utente appena registrato
  v_nome := COALESCE(NULLIF(TRIM(COALESCE(NEW.nome,'') || ' ' || COALESCE(NEW.cognome,'')), ''), NEW.email, 'Nuovo utente');

  -- Invoca send-push solo se le variabili di ambiente sono configurate
  IF v_supabase_url IS NOT NULL AND v_service_key IS NOT NULL THEN
    BEGIN
      PERFORM net.http_post(
        url     := v_supabase_url || '/functions/v1/send-push',
        headers := jsonb_build_object(
          'Content-Type',  'application/json',
          'Authorization', 'Bearer ' || v_service_key
        ),
        body    := jsonb_build_object(
          'title', 'Nuova registrazione',
          'body',  v_nome || ' ha richiesto l''accesso a PolisRoad.',
          'url',   '/'
        )
      );
    EXCEPTION WHEN OTHERS THEN
      -- Non bloccare l'insert anche se la notifica fallisce
      RAISE WARNING 'notify_admin_new_user: impossibile inviare push: %', SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger: scatta AFTER INSERT su profiles (una sola volta per nuovo utente)
DROP TRIGGER IF EXISTS trg_notify_admin_new_user ON public.profiles;
CREATE TRIGGER trg_notify_admin_new_user
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admin_new_user();

-- =============================================================================
-- CONFIGURAZIONE RICHIESTA (da eseguire una volta su Supabase SQL Editor):
--
-- ALTER DATABASE postgres
--   SET app.supabase_url = 'https://<YOUR_PROJECT_REF>.supabase.co';
-- ALTER DATABASE postgres
--   SET app.service_role_key = '<YOUR_SERVICE_ROLE_KEY>';
--
-- Poi ricarica la configurazione:
-- SELECT pg_reload_conf();
-- =============================================================================
