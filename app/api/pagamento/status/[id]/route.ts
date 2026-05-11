import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ASAAS_URLS = [
  'https://api.asaas.com/v3',
  'https://sandbox.asaas.com/api/v3',
];

async function getAsaasBaseUrl(apiKey: string): Promise<string> {
  const override = process.env.ASAAS_BASE_URL;
  if (override) return override;

  for (const baseUrl of ASAAS_URLS) {
    try {
      const res = await fetch(`${baseUrl}/customers?limit=1`, {
        headers: { 'access_token': apiKey },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok || res.status === 400) return baseUrl;
      if (res.status === 401 || res.status === 403) continue;
      return baseUrl;
    } catch {
      continue;
    }
  }
  return ASAAS_URLS[0];
}

async function verificarStatusAsaas(gatewayId: string): Promise<string | null> {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey || gatewayId.startsWith('sim-')) return null;

  try {
    const baseUrl = await getAsaasBaseUrl(apiKey);
    const res = await fetch(`${baseUrl}/payments/${gatewayId}`, {
      headers: { 'access_token': apiKey },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'CONFIRMED' || data.status === 'RECEIVED') return 'pago';
    if (data.status === 'REFUNDED') return 'reembolsado';
    if (data.status === 'OVERDUE') return 'falhou';
    return null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ message: 'Token inválido' }, { status: 401 });
    }

    const { data: pagamento, error } = await supabaseAdmin
      .from('pagamentos')
      .select('id, beneficiario_id, responsavel_id, gateway_id, status, valor, metodo, pago_em')
      .eq('id', id)
      .single();

    if (error || !pagamento) {
      return NextResponse.json({ message: 'Pagamento não encontrado' }, { status: 404 });
    }

    if (pagamento.responsavel_id !== user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    let status = pagamento.status;

    if (status === 'pendente' && pagamento.gateway_id) {
      const statusAsaas = await verificarStatusAsaas(pagamento.gateway_id);

      if (statusAsaas) {
        const { error: updError } = await supabaseAdmin
          .from('pagamentos')
          .update({
            status: statusAsaas,
            pago_em: statusAsaas === 'pago' ? new Date().toISOString() : null,
          })
          .eq('id', id);

        if (!updError) {
          status = statusAsaas;

          if (statusAsaas === 'pago') {
            const dataInicio = new Date();
            const dataFim = new Date(dataInicio);
            dataFim.setFullYear(dataFim.getFullYear() + 1);

            await supabaseAdmin
              .from('beneficiarios')
              .update({
                status: 'ativo',
                plano_inicio: dataInicio.toISOString().split('T')[0],
                plano_fim: dataFim.toISOString().split('T')[0],
                sorteio_participa: true,
              })
              .eq('id', pagamento.beneficiario_id);
          }
        }
      }
    }

    return NextResponse.json({
      status,
      pagamento_id: pagamento.id,
      valor: pagamento.valor,
      metodo: pagamento.metodo,
      pago_em: pagamento.pago_em,
    }, { status: 200 });
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    return NextResponse.json({ message: 'Erro interno' }, { status: 500 });
  }
}
