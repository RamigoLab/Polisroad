-- =====================================================
-- MIGRATION: Creazione tabella prontuario CdS
-- Data: 2026-06-07
-- Versione Prontuario: 2026.1 (giugno 2026)
-- =====================================================

-- Crea la tabella prontuario
CREATE TABLE IF NOT EXISTS public.prontuario (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dati articolo
  articolo_numero            integer,
  articolo_nome              text,
  titolo_sezione             text,        -- es. "DISPOSIZIONI GENERALI"
  capo                       text,
  sezione                    text,
  aggiornamento              text,        -- note aggiornamento legislativo
  note_comuni                text,        -- note comuni a tutti i casi dell'articolo

  -- Dati voce prontuario
  codice_caso                text,        -- es. "006-01"
  codice_violazione          text,        -- es. "1006"
  rif_normativo              text,        -- es. "art. 6, comma 1 e comma 12"
  titolo                     text,        -- titolo breve della violazione
  descrizione                text,        -- testo del verbale

  -- Sanzioni
  sanzione_penale            text,        -- eventuale riferimento penale
  pmr                        numeric,     -- sanzione diurna (ex edittale_min)
  scontato_30                numeric,     -- sanzione scontata
  sanzione_notturna_importo  numeric,     -- importo sanzione notturna (null = non prevista)
  sanzione_notturna_scontata numeric,     -- importo notturna scontata
  sanzione_notturna          boolean DEFAULT false,  -- calcolato dal trigger
  punti_patente              integer DEFAULT 0,
  sanzione_accessoria        text,
  note_verbale               text,
  note_operative             text,
  url                        text,        -- link alla fonte

  -- Metadata
  created_at                 timestamptz DEFAULT now(),
  updated_at                 timestamptz DEFAULT now()
);

-- ─── Indici per ricerche veloci ─────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_prontuario_articolo
  ON public.prontuario (articolo_numero);

CREATE INDEX IF NOT EXISTS idx_prontuario_codice_caso
  ON public.prontuario (codice_caso);

CREATE INDEX IF NOT EXISTS idx_prontuario_codice_violazione
  ON public.prontuario (codice_violazione);

CREATE INDEX IF NOT EXISTS idx_prontuario_rif_normativo
  ON public.prontuario (rif_normativo);

-- Full-text search in italiano
CREATE INDEX IF NOT EXISTS idx_prontuario_fts
  ON public.prontuario
  USING gin(
    to_tsvector('italian',
      coalesce(titolo, '') || ' ' ||
      coalesce(rif_normativo, '') || ' ' ||
      coalesce(codice_caso, '') || ' ' ||
      coalesce(descrizione, '')
    )
  );

-- ─── Trigger: aggiorna updated_at e calcola sanzione_notturna ───────────────
CREATE OR REPLACE FUNCTION public.prontuario_before_upsert()
RETURNS TRIGGER AS $$
BEGIN
  -- Aggiorna timestamp
  NEW.updated_at = now();
  -- Calcola automaticamente sanzione_notturna da sanzione_notturna_importo
  NEW.sanzione_notturna := (NEW.sanzione_notturna_importo IS NOT NULL AND NEW.sanzione_notturna_importo > 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prontuario_before_upsert ON public.prontuario;
CREATE TRIGGER trg_prontuario_before_upsert
  BEFORE INSERT OR UPDATE ON public.prontuario
  FOR EACH ROW EXECUTE FUNCTION public.prontuario_before_upsert();

-- ─── ROW LEVEL SECURITY (RLS) ───────────────────────────────────────────────
ALTER TABLE public.prontuario ENABLE ROW LEVEL SECURITY;

-- Lettura: tutti gli utenti autenticati
DROP POLICY IF EXISTS "prontuario_select_authenticated" ON public.prontuario;
CREATE POLICY "prontuario_select_authenticated"
  ON public.prontuario FOR SELECT TO authenticated USING (true);

-- Lettura: utenti anonimi (PWA offline / non ancora loggati)
DROP POLICY IF EXISTS "prontuario_select_anon" ON public.prontuario;
CREATE POLICY "prontuario_select_anon"
  ON public.prontuario FOR SELECT TO anon USING (true);

-- Inserimento: solo admin
DROP POLICY IF EXISTS "prontuario_insert_admin" ON public.prontuario;
CREATE POLICY "prontuario_insert_admin"
  ON public.prontuario FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND ruolo = 'admin'
    )
  );

-- Aggiornamento: solo admin
DROP POLICY IF EXISTS "prontuario_update_admin" ON public.prontuario;
CREATE POLICY "prontuario_update_admin"
  ON public.prontuario FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND ruolo = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND ruolo = 'admin'
    )
  );

-- Eliminazione: solo admin
DROP POLICY IF EXISTS "prontuario_delete_admin" ON public.prontuario;
CREATE POLICY "prontuario_delete_admin"
  ON public.prontuario FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND ruolo = 'admin'
    )
  );

-- Nota sulla tabella
COMMENT ON TABLE public.prontuario IS
  'Prontuario CdS - Versione 2026.1 (giugno 2026) - da prontuario_cds_20260602_2227.csv';
