SET session_replication_role = replica;

CREATE TABLE IF NOT EXISTS public.perfis (
  id UUID PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('admin', 'beneficiario')),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  data_nascimento DATE NOT NULL,
  cidade TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cep TEXT,
  lat FLOAT8,
  lng FLOAT8,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_perfis_tipo ON public.perfis(tipo);
CREATE INDEX idx_perfis_cpf ON public.perfis(cpf);
CREATE INDEX idx_perfis_email ON public.perfis(email);

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_leem_proprio" ON public.perfis
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_editam_proprio" ON public.perfis
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admin_lê_todos" ON public.perfis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.especialidades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL UNIQUE,
  icone_emoji TEXT NOT NULL,
  icone_url TEXT,
  tipo_beneficio VARCHAR(20) NOT NULL CHECK (tipo_beneficio IN ('gratuito', 'desconto', 'avaliacao')),
  descricao_beneficio TEXT NOT NULL,
  visivel_beneficiario BOOLEAN NOT NULL DEFAULT true,
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_especialidades_ativo ON public.especialidades(ativo);

ALTER TABLE public.especialidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "especialidades_leitura_publica" ON public.especialidades
  FOR SELECT USING (true);

CREATE POLICY "especialidades_insert_admin" ON public.especialidades
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "especialidades_update_admin" ON public.especialidades
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "especialidades_delete_admin" ON public.especialidades
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  especialidade_id UUID NOT NULL REFERENCES public.especialidades(id) ON DELETE CASCADE,
  nome_profissional TEXT NOT NULL,
  nome_clinica TEXT NOT NULL,
  registro_profissional TEXT,
  foto_url TEXT,
  endereco TEXT NOT NULL,
  bairro TEXT NOT NULL,
  cidade TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  horario TEXT,
  avaliacao FLOAT4 DEFAULT 0,
  total_agendamentos INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  google_place_id TEXT,
  google_maps_url TEXT,
  website TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clinicas_cidade ON public.clinicas(cidade);
CREATE INDEX idx_clinicas_especialidade_id ON public.clinicas(especialidade_id);
CREATE INDEX idx_clinicas_ativo ON public.clinicas(ativo);
CREATE INDEX idx_clinicas_google_place_id ON public.clinicas(google_place_id);

ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinicas_leitura_publica" ON public.clinicas
  FOR SELECT USING (ativo = true);

CREATE POLICY "clinicas_insert_admin" ON public.clinicas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "clinicas_update_admin" ON public.clinicas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "clinicas_delete_admin" ON public.clinicas
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE SEQUENCE IF NOT EXISTS public.cartao_seq START 1;

CREATE TABLE IF NOT EXISTS public.beneficiarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responsavel_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  numero_cartao TEXT NOT NULL UNIQUE DEFAULT 'FS-' || to_char(now(), 'YYYY') || '-' || LPAD((nextval('public.cartao_seq')::text), 5, '0'),
  nome_completo TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  data_nascimento DATE NOT NULL,
  parentesco TEXT,
  whatsapp TEXT,
  foto_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('ativo', 'inativo', 'bloqueado', 'pendente')),
  plano_inicio DATE,
  plano_fim DATE,
  sorteio_participa BOOLEAN NOT NULL DEFAULT false,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_beneficiarios_responsavel_id ON public.beneficiarios(responsavel_id);
CREATE INDEX idx_beneficiarios_status ON public.beneficiarios(status);
CREATE INDEX idx_beneficiarios_cpf ON public.beneficiarios(cpf);
CREATE INDEX idx_beneficiarios_sorteio_participa ON public.beneficiarios(sorteio_participa);

ALTER TABLE public.beneficiarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beneficiarios_responsavel_vê_proprios" ON public.beneficiarios
  FOR SELECT USING (auth.uid() = responsavel_id);

CREATE POLICY "beneficiarios_admin_vê_todos" ON public.beneficiarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "beneficiarios_responsavel_edita_proprios" ON public.beneficiarios
  FOR UPDATE USING (auth.uid() = responsavel_id);

CREATE TABLE IF NOT EXISTS public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id UUID NOT NULL REFERENCES public.beneficiarios(id) ON DELETE CASCADE,
  responsavel_id UUID NOT NULL REFERENCES public.perfis(id) ON DELETE CASCADE,
  gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('asaas', 'mercadopago', 'pagseguro')),
  gateway_id TEXT NOT NULL UNIQUE,
  metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('pix', 'cartao_credito', 'boleto')),
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'reembolsado', 'falhou')),
  pago_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pagamentos_beneficiario_id ON public.pagamentos(beneficiario_id);
CREATE INDEX idx_pagamentos_status ON public.pagamentos(status);
CREATE INDEX idx_pagamentos_gateway_id ON public.pagamentos(gateway_id);
CREATE INDEX idx_pagamentos_pago_em ON public.pagamentos(pago_em);

ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagamentos_responsavel_vê_proprios" ON public.pagamentos
  FOR SELECT USING (auth.uid() = responsavel_id);

CREATE POLICY "pagamentos_admin_vê_todos" ON public.pagamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id UUID NOT NULL REFERENCES public.beneficiarios(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL REFERENCES public.clinicas(id) ON DELETE CASCADE,
  especialidade_id UUID NOT NULL REFERENCES public.especialidades(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL DEFAULT 'whatsapp' CHECK (tipo IN ('whatsapp', 'telefone', 'presencial')),
  status VARCHAR(20) NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'confirmado', 'realizado', 'cancelado')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_agendamentos_beneficiario_id ON public.agendamentos(beneficiario_id);
CREATE INDEX idx_agendamentos_clinica_id ON public.agendamentos(clinica_id);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agendamentos_beneficiario_vê_proprios" ON public.agendamentos
  FOR SELECT USING (auth.uid() = beneficiario_id);

CREATE POLICY "agendamentos_admin_vê_todos" ON public.agendamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "agendamentos_beneficiario_cria" ON public.agendamentos
  FOR INSERT WITH CHECK (auth.uid() = beneficiario_id);

CREATE TABLE IF NOT EXISTS public.acessos_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id UUID NOT NULL REFERENCES public.beneficiarios(id) ON DELETE CASCADE,
  acessado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispositivo TEXT
);

CREATE INDEX idx_acessos_beneficiario_id ON public.acessos_dashboard(beneficiario_id);
CREATE INDEX idx_acessos_acessado_em ON public.acessos_dashboard(acessado_em);

ALTER TABLE public.acessos_dashboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acessos_escrita_automatica" ON public.acessos_dashboard
  FOR INSERT WITH CHECK (true);

CREATE POLICY "acessos_leitura_admin" ON public.acessos_dashboard
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.sorteios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  realizado_por UUID REFERENCES public.perfis(id) ON DELETE SET NULL,
  total_participantes INTEGER NOT NULL,
  ganhadores JSONB NOT NULL DEFAULT '[]'::jsonb,
  hash_auditoria TEXT NOT NULL UNIQUE
);

CREATE INDEX idx_sorteios_realizado_em ON public.sorteios(realizado_em);
CREATE INDEX idx_sorteios_realizado_por ON public.sorteios(realizado_por);

ALTER TABLE public.sorteios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sorteios_leitura_publica" ON public.sorteios
  FOR SELECT USING (true);

CREATE POLICY "sorteios_escrita_admin" ON public.sorteios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE TABLE IF NOT EXISTS public.configuracoes (
  chave TEXT PRIMARY KEY,
  valor JSONB NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "configuracoes_leitura_publica" ON public.configuracoes
  FOR SELECT USING (true);

CREATE POLICY "configuracoes_insert_admin" ON public.configuracoes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

CREATE POLICY "configuracoes_update_admin" ON public.configuracoes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

INSERT INTO public.especialidades (nome, icone_emoji, tipo_beneficio, descricao_beneficio, visivel_beneficiario, ativo)
VALUES
  ('Dentista', '🦷', 'desconto', 'Até 50% de desconto em procedimentos odontológicos', true, true),
  ('Psicólogo', '🧠', 'desconto', 'Sessões com desconto especial para beneficiários', true, true),
  ('Oftalmologista', '👁️', 'desconto', 'Consultas e exame de vista com desconto', true, true),
  ('Fisioterapeuta', '💪', 'desconto', 'Sessões de fisioterapia com tarifa reduzida', true, true),
  ('Nutricionista', '🥗', 'desconto', 'Avaliação nutricional e plano personalizado', true, true),
  ('Cardiologista', '❤️', 'avaliacao', 'Consulta cardiovascular com avaliação gratuita', true, true),
  ('Pediatra', '👶', 'gratuito', 'Primeira consulta pediátrica gratuita', true, true),
  ('Farmácia', '💊', 'desconto', 'Medicamentos com desconto para beneficiários', true, true)
ON CONFLICT (nome) DO NOTHING;

CREATE OR REPLACE FUNCTION public.atualizar_plano_fim()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ativo' AND NEW.plano_inicio IS NULL THEN
    NEW.plano_inicio := CURRENT_DATE;
    NEW.plano_fim := CURRENT_DATE + INTERVAL '365 days';
    NEW.sorteio_participa := true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_atualizar_plano_fim ON public.beneficiarios;

CREATE TRIGGER trigger_atualizar_plano_fim
BEFORE UPDATE ON public.beneficiarios
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_plano_fim();

SET session_replication_role = DEFAULT;
