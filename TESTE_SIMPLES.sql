-- ============================================
-- SCRIPT SIMPLIFICADO — SEM TRANSAÇÃO
-- Use este se o anterior não funcionar
-- ============================================

-- PASSO 1: Criar Admin via UI do Supabase
-- Authentication → Users → Add user
-- Email: admin@futuraude.test | Password: QuickTest123!

-- PASSO 2: Copiar o UUID do admin criado e substituir aqui:
-- (ou execute o SELECT abaixo para pegar o ID)

SELECT id FROM auth.users WHERE email = 'admin@futuraude.test';

-- PASSO 3: Inserir perfil admin (substitua xxx pelo UUID)
INSERT INTO public.perfis (
  id, tipo, nome_completo, cpf, whatsapp, email, data_nascimento, cidade, bairro, cep, criado_em
) VALUES (
  'xxx-seu-uuid-aqui'::UUID,
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
);

-- PASSO 4: Criar Beneficiário via UI
-- Authentication → Users → Add user
-- Email: joao@futuraude.test | Password: QuickTest123!

-- PASSO 5: Pegar UUID do beneficiário
SELECT id FROM auth.users WHERE email = 'joao@futuraude.test';

-- PASSO 6: Inserir perfil responsável (substitua yyy pelo UUID)
INSERT INTO public.perfis (
  id, tipo, nome_completo, cpf, whatsapp, email, data_nascimento, cidade, bairro, cep, criado_em
) VALUES (
  'yyy-seu-uuid-aqui'::UUID,
  'beneficiario',
  'João Carlos Silva',
  '98765432100',
  '(93) 99999-0001',
  'joao@futuraude.test',
  '1975-03-22'::DATE,
  'Santarém',
  'Aldeia',
  '68005-500',
  now()
);

-- PASSO 7: Inserir filho/filha como beneficiário
INSERT INTO public.beneficiarios (
  responsavel_id, nome_completo, cpf, data_nascimento, parentesco, whatsapp, status, plano_inicio, plano_fim, sorteio_participa, score
) VALUES (
  'yyy-seu-uuid-aqui'::UUID,
  'Pedro Carlos Silva',
  '45678912300',
  '2007-03-15'::DATE,
  'Filho',
  '(93) 99999-0001',
  'ativo',
  now()::DATE,
  (now() + interval '1 year')::DATE,
  true,
  150
);

-- PASSO 8: Inserir especialidades
INSERT INTO public.especialidades (nome, icone_emoji, tipo_beneficio, descricao_beneficio, visivel_beneficiario, ativo)
VALUES
  ('Odontologia', '🦷', 'desconto', 'Desconto de 30% em limpeza e avaliação', true, true),
  ('Psicologia', '🧠', 'gratuito', 'Primeira consulta gratuita com psicólogo', true, true),
  ('Oftalmologia', '👁️', 'desconto', 'Desconto de 20% em óculos e lentes', true, true)
ON CONFLICT (nome) DO NOTHING;

-- PASSO 9: Extrair IDs das especialidades
SELECT id, nome FROM public.especialidades;

-- PASSO 10: Inserir clínicas (substitua os UUIDs das especialidades)
INSERT INTO public.clinicas (
  especialidade_id, nome_profissional, nome_clinica, registro_profissional,
  endereco, bairro, cidade, whatsapp, horario, avaliacao, total_agendamentos, ativo
) VALUES
  ('uuid-odontologia'::UUID, 'Dr. Carlos Mendes', 'Clínica OralVida', 'CRO-PA 12345',
   'Av. Tapajós, 1250', 'Centro', 'Santarém', '(93) 99999-0001', 'Seg–Sex: 8h às 18h', 4.8, 12, true),
  ('uuid-psicologia'::UUID, 'Dra. Ana Beatriz Lima', 'Instituto Mente Saudável', 'CRP-PA 09.8765',
   'Rua Siqueira Campos, 380', 'Aldeia', 'Santarém', '(93) 99999-0002', 'Seg–Sáb: 8h às 20h', 4.9, 8, true),
  ('uuid-oftalmologia'::UUID, 'Dr. Roberto Farias', 'VisãoClara Ótica & Saúde', 'CBO 2264-40',
   'Trav. Francisco Corrêa, 90', 'Centro', 'Santarém', '(93) 99999-0003', 'Seg–Sex: 9h às 17h', 4.7, 15, true);

-- ============================================
-- VERIFICAR DADOS
-- ============================================
SELECT 'Perfil Admin:' as info;
SELECT id, email, nome_completo FROM public.perfis WHERE tipo = 'admin';

SELECT 'Perfil Beneficiário:' as info;
SELECT id, email, nome_completo FROM public.perfis WHERE tipo = 'beneficiario';

SELECT 'Beneficiário Cadastrado:' as info;
SELECT nome_completo, cpf, status, plano_inicio, plano_fim FROM public.beneficiarios;

SELECT 'Clínicas:' as info;
SELECT nome_clinica, nome_profissional, cidade FROM public.clinicas;
