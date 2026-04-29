-- ============================================
-- MIGRATION 001 — Corrigir RLS quebrada em especialidades
-- ============================================
-- Bug: o schema.sql original usa "FOR INSERT, UPDATE, DELETE"
-- que NAO e sintaxe valida do Postgres em CREATE POLICY.
-- A policy nao foi aplicada e admin write em especialidades fica
-- desprotegido (ou bloqueado, dependendo das permissoes default).
--
-- INSTRUCOES: cole este SQL em Supabase Dashboard > SQL Editor > Run
-- ============================================

-- Remover policy quebrada (silenciosa se nao existir)
DROP POLICY IF EXISTS "especialidades_escrita_admin" ON especialidades;

-- Recriar policies separadas (uma por operacao)
CREATE POLICY "especialidades_admin_insere" ON especialidades
  FOR INSERT
  WITH CHECK (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "especialidades_admin_atualiza" ON especialidades
  FOR UPDATE
  USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "especialidades_admin_deleta" ON especialidades
  FOR DELETE
  USING (
    (SELECT tipo FROM perfis WHERE id = auth.uid()) = 'admin'
  );

-- Verificacao
SELECT polname, polcmd FROM pg_policy
WHERE polrelid = 'especialidades'::regclass;
