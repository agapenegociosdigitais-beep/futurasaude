-- Migration: Criar tabela webhook_events para dedup de webhooks
-- Executar no SQL Editor do Supabase Dashboard

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indice para queries de dedup (filtro por created_at + event_id)
CREATE INDEX IF NOT EXISTS idx_webhook_events_created_at
  ON webhook_events (created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id
  ON webhook_events (event_id);

-- Habilitar RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Apenas service_role pode acessar (webhook usa supabaseAdmin)
CREATE POLICY "Service role full access" ON webhook_events
  FOR ALL
  USING (auth.role() = 'service_role');

-- Cleanup automatico: remover eventos com mais de 24h
-- (opcional - pode rodar via pg_cron ou manualmente)
-- SELECT cron.schedule(
--   'cleanup-webhook-events',
--   '0 */6 * * *',
--   $$DELETE FROM webhook_events WHERE created_at < now() - interval '24 hours'$$
-- );
