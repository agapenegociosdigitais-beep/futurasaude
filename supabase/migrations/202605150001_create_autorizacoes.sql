CREATE SEQUENCE IF NOT EXISTS public.autorizacoes_seq START 1;

CREATE TABLE IF NOT EXISTS public.autorizacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  protocolo TEXT NOT NULL UNIQUE DEFAULT (
    'AUT-' || to_char(CURRENT_DATE, 'YYYY') || '-' || LPAD(nextval('public.autorizacoes_seq')::text, 6, '0')
  ),
  beneficiario_id UUID NOT NULL REFERENCES public.beneficiarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('consulta', 'exame', 'procedimento')),
  especialidade_ou_exame TEXT NOT NULL,
  justificativa TEXT,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'negada', 'utilizada', 'expirada', 'cancelada')),
  motivo_negativa TEXT,
  emitida_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  valida_ate TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_autorizacoes_beneficiario_id
  ON public.autorizacoes(beneficiario_id);

CREATE INDEX IF NOT EXISTS idx_autorizacoes_status
  ON public.autorizacoes(status);

ALTER TABLE public.autorizacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "autorizacoes_beneficiario_le_proprias" ON public.autorizacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.beneficiarios b
      WHERE b.id = autorizacoes.beneficiario_id
        AND b.responsavel_id = auth.uid()
    )
  );

CREATE POLICY "autorizacoes_beneficiario_cria_proprias" ON public.autorizacoes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.beneficiarios b
      WHERE b.id = autorizacoes.beneficiario_id
        AND b.responsavel_id = auth.uid()
    )
  );

CREATE POLICY "autorizacoes_admin_le_todas" ON public.autorizacoes
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM public.perfis p
      WHERE p.id = auth.uid()
        AND p.tipo = 'admin'
    )
  );

CREATE POLICY "autorizacoes_admin_atualiza_todas" ON public.autorizacoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM public.perfis p
      WHERE p.id = auth.uid()
        AND p.tipo = 'admin'
    )
  );
