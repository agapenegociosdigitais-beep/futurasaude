-- ============================================
-- FIX: Corrigir RLS na tabela perfis
-- Permite service_role criar novos perfis durante o cadastro
-- ============================================

-- Remover policies antigas (sem INSERT)
DROP POLICY IF EXISTS "usuarios_leem_proprio" ON public.perfis;
DROP POLICY IF EXISTS "usuarios_editam_proprio" ON public.perfis;
DROP POLICY IF EXISTS "admin_lê_todos" ON public.perfis;

-- Recriar policies com INSERT adicionado
CREATE POLICY "perfis_select_own" ON public.perfis
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "perfis_select_admin" ON public.perfis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- POLICY CRÍTICA: Permite service_role fazer INSERT (necessário para cadastro)
CREATE POLICY "perfis_insert_service_role" ON public.perfis
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "perfis_update_own" ON public.perfis
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "perfis_update_admin" ON public.perfis
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.perfis
      WHERE id = auth.uid() AND tipo = 'admin'
    )
  );

-- Confirmação
SELECT 'RLS policies for perfis table updated successfully' as status;
