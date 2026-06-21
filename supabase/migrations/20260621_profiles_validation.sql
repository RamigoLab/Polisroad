-- 1. Aggiorna eventuali profili esistenti che hanno nome o cognome nulli o vuoti
UPDATE public.profiles
SET nome = COALESCE(NULLIF(TRIM(nome), ''), 'Operatore')
WHERE nome IS NULL OR TRIM(nome) = '';

UPDATE public.profiles
SET cognome = COALESCE(NULLIF(TRIM(cognome), ''), 'Polisroad')
WHERE cognome IS NULL OR TRIM(cognome) = '';

-- 2. Rendi le colonne NOT NULL
ALTER TABLE public.profiles 
  ALTER COLUMN nome SET NOT NULL,
  ALTER COLUMN cognome SET NOT NULL;

-- 3. Aggiungi un vincolo CHECK per assicurarsi che non siano stringhe vuote
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_nome_not_empty CHECK (char_length(trim(nome)) > 0),
  ADD CONSTRAINT profiles_cognome_not_empty CHECK (char_length(trim(cognome)) > 0);
