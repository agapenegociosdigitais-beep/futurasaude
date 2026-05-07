-- Função RPC para criar beneficiário com número de cartão atômico
-- Resolve race condition na geração sequencial do número

CREATE OR REPLACE FUNCTION public.criar_beneficiario_seguro(
  p_responsavel_id UUID,
  p_nome_completo TEXT,
  p_cpf TEXT,
  p_data_nascimento DATE,
  p_sexo TEXT DEFAULT NULL,
  p_telefone TEXT DEFAULT NULL,
  p_email TEXT DEFAULT NULL,
  p_tipo_sanguineo TEXT DEFAULT NULL,
  p_possui_deficiencia BOOLEAN DEFAULT FALSE,
  p_descricao_deficiencia TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  numero_cartao TEXT,
  nome_completo TEXT,
  status TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_next_num INTEGER;
  v_cartao TEXT;
  v_id UUID;
  v_nome TEXT;
  v_status TEXT;
BEGIN
  LOCK TABLE public.beneficiarios IN EXCLUSIVE MODE;

  SELECT COALESCE(MAX(
    CAST(REPLACE(numero_cartao, 'FS', '') AS INTEGER)
  ), 999) INTO v_next_num
  FROM public.beneficiarios
  WHERE numero_cartao ~ '^FS\d+$';

  v_next_num := v_next_num + 1;
  v_cartao := 'FS' || LPAD(v_next_num::TEXT, 6, '0');

  INSERT INTO public.beneficiarios (
    responsavel_id, nome_completo, cpf, data_nascimento,
    sexo, telefone, email, tipo_sanguineo,
    possui_deficiencia, descricao_deficiencia,
    numero_cartao, status, criado_em
  ) VALUES (
    p_responsavel_id, p_nome_completo, p_cpf, p_data_nascimento,
    p_sexo, p_telefone, p_email, p_tipo_sanguineo,
    p_possui_deficiencia, p_descricao_deficiencia,
    v_cartao, 'pendente', NOW()
  )
  RETURNING id, numero_cartao, nome_completo, status
  INTO v_id, v_cartao, v_nome, v_status;

  RETURN QUERY SELECT v_id, v_cartao, v_nome, v_status;
END;
$$;

COMMENT ON FUNCTION public.criar_beneficiario_seguro IS
  'Cria beneficiário com número de cartão sequencial atômico. Resolve race condition.';

REVOKE ALL ON FUNCTION public.criar_beneficiario_seguro FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.criar_beneficiario_seguro TO service_role;
