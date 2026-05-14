-- ============================================
-- FUTURA SAÚDE — Schema Completo
-- ============================================
-- Execute este arquivo completo no Supabase SQL Editor
-- Instância: Supabase → SQL Editor → Colar e executar

-- ============================================
-- 1. TABELA: perfis
-- ============================================
CREATE TABLE IF NOT EXISTS perfis (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
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

ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- RLS: usuário lê/edita o próprio. Admin lê todos.
CREATE POLICY "usuarios_leem_proprio" ON perfis
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "usuarios_editam_proprio" ON perfis
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "admin_lê_todos" ON perfis
  FOR SELECT USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- 2. TABELA: especialidades
-- ============================================
CREATE TABLE IF NOT EXISTS especialidades (
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

ALTER TABLE especialidades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "especialidades_leitura_publica" ON especialidades
  FOR SELECT USING (true);

CREATE POLICY "especialidades_escrita_admin" ON especialidades
  FOR INSERT, UPDATE, DELETE USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- 3. TABELA: clinicas
-- ============================================
CREATE TABLE IF NOT EXISTS clinicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  especialidade_id UUID NOT NULL REFERENCES especialidades(id) ON DELETE CASCADE,
  nome_profissional TEXT,
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

ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clinicas_leitura_publica" ON clinicas
  FOR SELECT USING (ativo = true);

CREATE POLICY "clinicas_escrita_admin" ON clinicas
  FOR INSERT, UPDATE, DELETE USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- 4. TABELA: beneficiarios
-- ============================================
CREATE TABLE IF NOT EXISTS beneficiarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responsavel_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  numero_cartao TEXT NOT NULL UNIQUE DEFAULT 'FS-' || to_char(now(), 'YYYY') || '-' || LPAD((nextval('cartao_seq')::text), 5, '0'),
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
  score INTEGER NOT NULL DEFAULT 0,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar sequência para numero_cartao
CREATE SEQUENCE IF NOT EXISTS cartao_seq START 1;

ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "beneficiarios_responsavel_vê_proprios" ON beneficiarios
  FOR SELECT USING (auth.uid() = responsavel_id);

CREATE POLICY "beneficiarios_beneficiario_vê_proprio" ON beneficiarios
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM perfis WHERE id = auth.uid() AND tipo = 'beneficiario'
  ));

CREATE POLICY "beneficiarios_admin_vê_todos" ON beneficiarios
  FOR SELECT USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "beneficiarios_responsavel_edita_proprios" ON beneficiarios
  FOR UPDATE USING (auth.uid() = responsavel_id);

-- ============================================
-- 5. TABELA: pagamentos
-- ============================================
CREATE TABLE IF NOT EXISTS pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  responsavel_id UUID NOT NULL REFERENCES perfis(id) ON DELETE CASCADE,
  gateway VARCHAR(20) NOT NULL CHECK (gateway IN ('asaas', 'mercadopago', 'pagseguro')),
  gateway_id TEXT NOT NULL UNIQUE,
  metodo VARCHAR(20) NOT NULL CHECK (metodo IN ('pix', 'cartao_credito', 'boleto')),
  valor NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'reembolsado', 'falhou')),
  pago_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pagamentos_responsavel_vê_proprios" ON pagamentos
  FOR SELECT USING (auth.uid() = responsavel_id);

CREATE POLICY "pagamentos_admin_vê_todos" ON pagamentos
  FOR SELECT USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- 6. TABELA: agendamentos
-- ============================================
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  clinica_id UUID NOT NULL REFERENCES clinicas(id) ON DELETE CASCADE,
  especialidade_id UUID NOT NULL REFERENCES especialidades(id) ON DELETE CASCADE,
  tipo VARCHAR(20) NOT NULL DEFAULT 'whatsapp' CHECK (tipo IN ('whatsapp', 'telefone', 'presencial')),
  status VARCHAR(20) NOT NULL DEFAULT 'solicitado' CHECK (status IN ('solicitado', 'confirmado', 'realizado', 'cancelado')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "agendamentos_beneficiario_vê_proprios" ON agendamentos
  FOR SELECT USING (auth.uid() = beneficiario_id);

CREATE POLICY "agendamentos_admin_vê_todos" ON agendamentos
  FOR SELECT USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "agendamentos_beneficiario_cria" ON agendamentos
  FOR INSERT WITH CHECK (auth.uid() = beneficiario_id);

-- ============================================
-- 7. TABELA: acessos_dashboard
-- ============================================
CREATE TABLE IF NOT EXISTS acessos_dashboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiario_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  acessado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  dispositivo TEXT
);

ALTER TABLE acessos_dashboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "acessos_escrita_automatica" ON acessos_dashboard
  FOR INSERT WITH CHECK (true);

CREATE POLICY "acessos_leitura_admin" ON acessos_dashboard
  FOR SELECT USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- 8. TABELA: sorteios
-- ============================================
CREATE TABLE IF NOT EXISTS sorteios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  realizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  realizado_por UUID NOT NULL REFERENCES perfis(id) ON DELETE SET NULL,
  total_participantes INTEGER NOT NULL,
  ganhadores JSONB NOT NULL DEFAULT '[]'::jsonb,
  hash_auditoria TEXT NOT NULL UNIQUE
);

ALTER TABLE sorteios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sorteios_leitura_publica" ON sorteios
  FOR SELECT USING (true);

CREATE POLICY "sorteios_escrita_admin" ON sorteios
  FOR INSERT WITH CHECK (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- 9. TABELA: configuracoes
-- ============================================
CREATE TABLE IF NOT EXISTS configuracoes (
  chave TEXT PRIMARY KEY,
  valor JSONB NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "configuracoes_leitura_publica" ON configuracoes
  FOR SELECT USING (true);

CREATE POLICY "configuracoes_escrita_admin" ON configuracoes
  FOR UPDATE, INSERT WITH CHECK (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

-- ============================================
-- 10. ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_perfis_tipo ON perfis(tipo);
CREATE INDEX IF NOT EXISTS idx_perfis_cpf ON perfis(cpf);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_responsavel_id ON beneficiarios(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_status ON beneficiarios(status);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_cpf ON beneficiarios(cpf);
CREATE INDEX IF NOT EXISTS idx_pagamentos_beneficiario_id ON pagamentos(beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status);
CREATE INDEX IF NOT EXISTS idx_pagamentos_gateway_id ON pagamentos(gateway_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_beneficiario_id ON agendamentos(beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_clinica_id ON agendamentos(clinica_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_acessos_beneficiario_id ON acessos_dashboard(beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_acessos_acessado_em ON acessos_dashboard(acessado_em);
CREATE INDEX IF NOT EXISTS idx_clinicas_cidade ON clinicas(cidade);
CREATE INDEX IF NOT EXISTS idx_clinicas_especialidade_id ON clinicas(especialidade_id);
CREATE INDEX IF NOT EXISTS idx_clinicas_google_place_id ON clinicas(google_place_id);

-- ============================================
-- 11. DADOS SEED — ESPECIALIDADES
-- ============================================
INSERT INTO especialidades (nome, icone_emoji, tipo_beneficio, descricao_beneficio, visivel_beneficiario, ativo)
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

-- ============================================
-- 12. FUNÇÃO: Atualizar plano_fim automaticamente
-- ============================================
CREATE OR REPLACE FUNCTION atualizar_plano_fim()
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

CREATE TRIGGER trigger_atualizar_plano_fim
BEFORE UPDATE ON beneficiarios
FOR EACH ROW
EXECUTE FUNCTION atualizar_plano_fim();

-- ============================================
-- 13. FUNÇÃO: Registrar acesso ao dashboard
-- ============================================
CREATE OR REPLACE FUNCTION registrar_acesso()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO acessos_dashboard (beneficiario_id, dispositivo)
  VALUES (NEW.id, 'desktop');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FIM DO SCHEMA
-- ============================================
