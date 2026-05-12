ALTER TABLE public.clinicas
  ADD COLUMN IF NOT EXISTS google_place_id TEXT,
  ADD COLUMN IF NOT EXISTS google_maps_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS latitude FLOAT8,
  ADD COLUMN IF NOT EXISTS longitude FLOAT8;

CREATE INDEX IF NOT EXISTS idx_clinicas_google_place_id
  ON public.clinicas(google_place_id);
