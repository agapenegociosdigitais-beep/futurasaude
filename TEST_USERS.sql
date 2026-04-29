-- ============================================
-- USUÁRIOS DE TESTE — FUTURA SAÚDE
-- ============================================
-- Cole este SQL no Supabase SQL Editor e execute
-- Cria: 1 Admin + 1 Beneficiário

-- ============================================
-- 1. INSERIR USUÁRIO ADMIN NO AUTH
-- ============================================
-- No Supabase, vá em: Authentication → Users → Add user
-- Email: admin@futuraude.com
-- Password: QuickTest123!
-- Depois execute o SQL abaixo:

INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmed_at
)
SELECT
  gen_random_uuid() as id,
  'admin@futuraude.test' as email,
  crypt('QuickTest123!', gen_salt('bf')) as encrypted_password,
  now() as email_confirmed_at,
  now() as created_at,
  now() as updated_at,
  now() as last_sign_in_at,
  '{"provider":"email","providers":["email"]}' as raw_app_meta_data,
  '{}' as raw_user_meta_data,
  now() as confirmed_at
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@futuraude.test')
RETURNING id INTO admin_id;

-- ============================================
-- 2. INSERIR PERFIL ADMIN
-- ============================================
INSERT INTO public.perfis (
  id,
  tipo,
  nome_completo,
  cpf,
  whatsapp,
  email,
  data_nascimento,
  cidade,
  bairro,
  cep,
  criado_em
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'admin@futuraude.test'),
  'admin',
  'Maria Silva — Admin',
  '12345678901',
  '(93) 98000-0001',
  'admin@futuraude.test',
  '1980-05-15'::DATE,
  'Santarém',
  'Centro',
  '68005-900',
  now()
)
ON CONFLICT (cpf) DO NOTHING;

-- ============================================
-- 3. INSERIR USUÁRIO BENEFICIÁRIO NO AUTH
-- ============================================
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmed_at
)
SELECT
  gen_random_uuid() as id,
  'joao@futuraude.test' as email,
  crypt('QuickTest123!', gen_salt('bf')) as encrypted_password,
  now() as email_confirmed_at,
  now() as created_at,
  now() as updated_at,
  now() as last_sign_in_at,
  '{"provider":"email","providers":["email"]}' as raw_app_meta_data,
  '{}' as raw_user_meta_data,
  now() as confirmed_at
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'joao@futuraude.test')
RETURNING id INTO responsavel_id;

-- ============================================
-- 4. INSERIR PERFIL RESPONSÁVEL (Beneficiário)
-- ============================================
INSERT INTO public.perfis (
  id,
  tipo,
  nome_completo,
  cpf,
  whatsapp,
  email,
  data_nascimento,
  cidade,
  bairro,
  cep,
  lat,
  lng,
  criado_em
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'joao@futuraude.test'),
  'beneficiario',
  'João Carlos Silva',
  '98765432100',
  '(93) 99999-0001',
  'joao@futuraude.test',
  '1975-03-22'::DATE,
  'Santarém',
  'Aldeia',
  '68005-500',
  -2.892168,
  -60.204453,
  now()
)
ON CONFLICT (cpf) DO NOTHING;

-- ============================================
-- 5. INSERIR BENEFICIÁRIO (filho/filha)
-- ============================================
INSERT INTO public.beneficiarios (
  responsavel_id,
  nome_completo,
  cpf,
  data_nascimento,
  parentesco,
  whatsapp,
  status,
  plano_inicio,
  plano_fim,
  sorteio_participa,
  score,
  criado_em
) VALUES (
  (SELECT id FROM auth.users WHERE email = 'joao@futuraude.test'),
  'Pedro Carlos Silva',
  '45678912300',
  '2007-03-15'::DATE,
  'Filho',
  '(93) 99999-0001',
  'ativo',
  now()::DATE,
  (now() + interval '1 year')::DATE,
  true,
  150,
  now()
)
ON CONFLICT (cpf) DO NOTHING;

-- ============================================
-- 6. INSERIR ESPECIALIDADES (dados base)
-- ============================================
INSERT INTO public.especialidades (nome, icone_emoji, tipo_beneficio, descricao_beneficio, visivel_beneficiario, ativo)
VALUES
  ('Odontologia', '🦷', 'desconto', 'Desconto de 30% em limpeza e avaliação', true, true),
  ('Psicologia', '🧠', 'gratuito', 'Primeira consulta gratuita com psicólogo', true, true),
  ('Oftalmologia', '👁️', 'desconto', 'Desconto de 20% em óculos e lentes', true, true)
ON CONFLICT (nome) DO NOTHING;

-- ============================================
-- 7. INSERIR CLÍNICAS DE TESTE
-- ============================================
INSERT INTO public.clinicas (
  especialidade_id,
  nome_profissional,
  nome_clinica,
  registro_profissional,
  endereco,
  bairro,
  cidade,
  whatsapp,
  horario,
  avaliacao,
  total_agendamentos,
  ativo
)
SELECT
  e.id,
  CASE
    WHEN e.nome = 'Odontologia' THEN 'Dr. Carlos Mendes'
    WHEN e.nome = 'Psicologia' THEN 'Dra. Ana Beatriz Lima'
    WHEN e.nome = 'Oftalmologia' THEN 'Dr. Roberto Farias'
  END as nome_profissional,
  CASE
    WHEN e.nome = 'Odontologia' THEN 'Clínica OralVida'
    WHEN e.nome = 'Psicologia' THEN 'Instituto Mente Saudável'
    WHEN e.nome = 'Oftalmologia' THEN 'VisãoClara Ótica & Saúde'
  END as nome_clinica,
  CASE
    WHEN e.nome = 'Odontologia' THEN 'CRO-PA 12345'
    WHEN e.nome = 'Psicologia' THEN 'CRP-PA 09.8765'
    WHEN e.nome = 'Oftalmologia' THEN 'CBO 2264-40'
  END as registro_profissional,
  CASE
    WHEN e.nome = 'Odontologia' THEN 'Av. Tapajós, 1250'
    WHEN e.nome = 'Psicologia' THEN 'Rua Siqueira Campos, 380'
    WHEN e.nome = 'Oftalmologia' THEN 'Trav. Francisco Corrêa, 90'
  END as endereco,
  CASE
    WHEN e.nome = 'Odontologia' THEN 'Centro'
    WHEN e.nome = 'Psicologia' THEN 'Aldeia'
    WHEN e.nome = 'Oftalmologia' THEN 'Centro'
  END as bairro,
  'Santarém' as cidade,
  CASE
    WHEN e.nome = 'Odontologia' THEN '(93) 99999-0001'
    WHEN e.nome = 'Psicologia' THEN '(93) 99999-0002'
    WHEN e.nome = 'Oftalmologia' THEN '(93) 99999-0003'
  END as whatsapp,
  'Seg–Sex: 8h às 18h' as horario,
  4.8 as avaliacao,
  12 as total_agendamentos,
  true as ativo
FROM public.especialidades e
WHERE e.nome IN ('Odontologia', 'Psicologia', 'Oftalmologia')
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. INSERIR AGENDAMENTO DE TESTE
-- ============================================
INSERT INTO public.agendamentos (
  beneficiario_id,
  clinica_id,
  especialidade_id,
  tipo,
  status,
  criado_em
)
SELECT
  b.id as beneficiario_id,
  c.id as clinica_id,
  e.id as especialidade_id,
  'whatsapp' as tipo,
  'confirmado' as status,
  now() as criado_em
FROM public.beneficiarios b
JOIN public.especialidades e ON e.nome = 'Odontologia'
JOIN public.clinicas c ON c.especialidade_id = e.id
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICAR DADOS INSERIDOS
-- ============================================
-- Execute estas queries para confirmar:

SELECT 'Admin Criado:' as info;
SELECT id, email, tipo, nome_completo FROM public.perfis WHERE tipo = 'admin' LIMIT 1;

SELECT 'Beneficiário Criado:' as info;
SELECT id, email, tipo, nome_completo FROM public.perfis WHERE tipo = 'beneficiario' LIMIT 1;

SELECT 'Filho/Filha Cadastrado:' as info;
SELECT nome_completo, cpf, data_nascimento, status, plano_inicio, plano_fim FROM public.beneficiarios LIMIT 1;

SELECT 'Clínicas Disponíveis:' as info;
SELECT nome_clinica, nome_profissional, cidade, whatsapp FROM public.clinicas ORDER BY criado_em DESC LIMIT 3;

SELECT 'Total de Agendamentos:' as info;
SELECT COUNT(*) as total FROM public.agendamentos;
