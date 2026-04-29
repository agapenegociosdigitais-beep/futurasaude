-- ============================================
-- MIGRATION 002 - Funcao is_admin() e refatoracao das policies
-- ============================================
-- Bug: as policies originais usam subquery direta em perfis dentro
-- de policies do proprio perfis - pode causar recursao no RLS engine
-- e degrada performance (subquery roda a cada row).
--
-- Solucao: SECURITY DEFINER function que bypassa RLS, com cache STABLE.
-- INSTRUCOES: cole no Supabase Dashboard > SQL Editor > Run
-- ============================================

-- Funcao auxiliar: checa se o usuario atual e admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND tipo = 'admin'
  );
$$;

-- Travar permissoes da funcao
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================
-- Refatorar policies que usavam subquery
-- ============================================

-- perfis
DROP POLICY IF EXISTS "admin_lê_todos" ON perfis;
CREATE POLICY "admin_le_todos" ON perfis
  FOR SELECT USING (is_admin());

-- especialidades (consolidar admin_insere/atualiza/deleta da migration 001)
DROP POLICY IF EXISTS "especialidades_admin_insere" ON especialidades;
DROP POLICY IF EXISTS "especialidades_admin_atualiza" ON especialidades;
DROP POLICY IF EXISTS "especialidades_admin_deleta" ON especialidades;
CREATE POLICY "especialidades_escrita_admin_v2" ON especialidades
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- clinicas
DROP POLICY IF EXISTS "clinicas_escrita_admin" ON clinicas;
CREATE POLICY "clinicas_escrita_admin_v2" ON clinicas
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- beneficiarios
DROP POLICY IF EXISTS "beneficiarios_admin_vê_todos" ON beneficiarios;
CREATE POLICY "beneficiarios_admin_ve_todos" ON beneficiarios
  FOR SELECT USING (is_admin());

-- pagamentos
DROP POLICY IF EXISTS "pagamentos_admin_vê_todos" ON pagamentos;
CREATE POLICY "pagamentos_admin_ve_todos" ON pagamentos
  FOR SELECT USING (is_admin());

-- agendamentos
DROP POLICY IF EXISTS "agendamentos_admin_vê_todos" ON agendamentos;
CREATE POLICY "agendamentos_admin_ve_todos" ON agendamentos
  FOR SELECT USING (is_admin());

-- acessos_dashboard
DROP POLICY IF EXISTS "acessos_leitura_admin" ON acessos_dashboard;
CREATE POLICY "acessos_leitura_admin_v2" ON acessos_dashboard
  FOR SELECT USING (is_admin());

-- sorteios
DROP POLICY IF EXISTS "sorteios_escrita_admin" ON sorteios;
CREATE POLICY "sorteios_escrita_admin_v2" ON sorteios
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- configuracoes
DROP POLICY IF EXISTS "configuracoes_escrita_admin" ON configuracoes;
CREATE POLICY "configuracoes_escrita_admin_v2" ON configuracoes
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Verificacao
SELECT polname, polrelid::regclass FROM pg_policy
WHERE polname LIKE '%admin%' ORDER BY polrelid;
