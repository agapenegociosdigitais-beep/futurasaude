import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ASAAS_URLS = [
  'https://api.asaas.com/v3',
  'https://sandbox.asaas.com/v3',
];

async function detectarAmbiente(apiKey: string): Promise<string> {
  for (const baseUrl of ASAAS_URLS) {
    try {
      const res = await fetch(`${baseUrl}/customers?limit=1`, {
        headers: { 'access_token': apiKey },
      });
      if (res.ok || res.status === 400) return baseUrl;
      if (res.status === 401 || res.status === 403) continue;
      return baseUrl;
    } catch {
      continue;
    }
  }
  throw new Error('API key nao autenticou em nenhum ambiente Asaas');
}

async function criarOuBuscarCustomer(beneficiario: any, apiKey: string, baseUrl: string) {
  const searchResponse = await fetch(
    `${baseUrl}/customers?cpfCnpj=${beneficiario.cpf}`,
    { headers: { 'access_token': apiKey } }
  );

  if (searchResponse.ok) {
    const searchData = await searchResponse.json();
    if (searchData.data && searchData.data.length > 0) {
      return searchData.data[0].id;
    }
  }

  const customerPayload = {
    name: beneficiario.nome_completo,
    cpfCnpj: beneficiario.cpf,
    externalReference: beneficiario.id,
  };

  const createResponse = await fetch(`${baseUrl}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey,
    },
    body: JSON.stringify(customerPayload),
  });

  if (!createResponse.ok) {
    const error = await createResponse.text();
    console.error('Erro ao criar customer:', error);
    throw new Error(`Falha ao criar cliente no gateway (${createResponse.status}): ${error}`);
  }

  const customerData = await createResponse.json();
  return customerData.id;
}

async function criarCobrancaAsaas(beneficiario: any, valor: number) {
  const apiKey = process.env.ASAAS_API_KEY;

  if (!apiKey || apiKey === 'aact_your_key_here') {
    console.warn('ASAAS_API_KEY nao configurada, usando modo simulado');
    return {
      id: `sim-${Date.now()}`,
      pixQrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      pixCopyPaste: '00020126580014br.gov.bcb.pix0136' + beneficiario.id.substring(0, 20) + '520400005303986540599.905802BR5925FUTURA SAUDE6009SANTAREM62070503***6304XXXX',
      status: 'PENDING',
    };
  }

  const baseUrl = await detectarAmbiente(apiKey);
  console.log('Asaas ambiente detectado:', baseUrl);

  const customerId = await criarOuBuscarCustomer(beneficiario, apiKey, baseUrl);

  const payload: any = {
    customer: customerId,
    billingType: 'PIX',
    value: valor,
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    description: 'Cartao Futura Saude - Plano Anual',
    externalReference: beneficiario.id,
  };

  const response = await fetch(`${baseUrl}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'access_token': apiKey,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Erro Asaas:', error);
    throw new Error(`Falha ao criar cobranca no gateway (${response.status}): ${error}`);
  }

  const data = await response.json();

  if (data.id) {
    const pixResponse = await fetch(`${baseUrl}/payments/${data.id}/pixQrCode`, {
      headers: { 'access_token': apiKey },
    });

    if (pixResponse.ok) {
      const pixData = await pixResponse.json();
      return {
        id: data.id,
        pixQrCode: pixData.encodedImage,
        pixCopyPaste: pixData.payload,
        status: data.status,
      };
    }
  }

  return { id: data.id, status: data.status };
}

export async function POST(request: NextRequest) {
  try {
    const token =
      request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('sb-access-token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Nao autorizado' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ message: 'Token invalido' }, { status: 401 });
    }

    const { beneficiario_id } = await request.json();

    if (!beneficiario_id) {
      return NextResponse.json({ message: 'Dados incompletos' }, { status: 400 });
    }

    const { data: beneficiario, error: benError } = await supabaseAdmin
      .from('beneficiarios')
      .select('id, responsavel_id, nome_completo, cpf, status')
      .eq('id', beneficiario_id)
      .single();

    if (benError || !beneficiario) {
      return NextResponse.json({ message: 'Beneficiario nao encontrado' }, { status: 404 });
    }

    if (beneficiario.responsavel_id !== user.id) {
      return NextResponse.json({ message: 'Acesso negado' }, { status: 403 });
    }

    if (beneficiario.status === 'ativo') {
      return NextResponse.json({ message: 'Plano ja esta ativo' }, { status: 400 });
    }

    const { data: pagamentoPendente } = await supabaseAdmin
      .from('pagamentos')
      .select('id, gateway_id, status')
      .eq('beneficiario_id', beneficiario_id)
      .eq('status', 'pendente')
      .single();

    if (pagamentoPendente) {
      const cobrancaPendente: any = { id: pagamentoPendente.gateway_id };
      const apiKey = process.env.ASAAS_API_KEY;

      if (apiKey && apiKey !== 'aact_your_key_here' && !pagamentoPendente.gateway_id.startsWith('sim-')) {
        try {
          const baseUrl = await detectarAmbiente(apiKey);
          const pixResponse = await fetch(`${baseUrl}/payments/${pagamentoPendente.gateway_id}/pixQrCode`, {
            headers: { 'access_token': apiKey },
          });
          if (pixResponse.ok) {
            const pixData = await pixResponse.json();
            cobrancaPendente.pixQrCode = pixData.encodedImage;
            cobrancaPendente.pixCopyPaste = pixData.payload;
          }
        } catch {}
      } else {
        cobrancaPendente.pixQrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        cobrancaPendente.pixCopyPaste = '00020126580014br.gov.bcb.pix0136SIMULADO520400005303986540599.905802BR5925FUTURA SAUDE6009SANTAREM62070503***6304XXXX';
      }

      return NextResponse.json({
        pagamento_id: pagamentoPendente.id,
        gateway_id: cobrancaPendente.id,
        pixQrCode: cobrancaPendente.pixQrCode || null,
        pixCopyPaste: cobrancaPendente.pixCopyPaste || null,
        status: 'pendente',
      }, { status: 200 });
    }

    const valor = 99.90;
    const cobranca = await criarCobrancaAsaas(beneficiario, valor);

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('pagamentos')
      .insert({
        beneficiario_id,
        responsavel_id: beneficiario.responsavel_id,
        gateway: 'asaas',
        gateway_id: cobranca.id,
        metodo: 'pix',
        valor,
        status: 'pendente',
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Erro ao salvar pagamento:', paymentError);
      return NextResponse.json({ message: 'Erro ao criar registro de pagamento' }, { status: 400 });
    }

    return NextResponse.json({
      pagamento_id: payment.id,
      gateway_id: cobranca.id,
      pixQrCode: cobranca.pixQrCode || null,
      pixCopyPaste: cobranca.pixCopyPaste || null,
      status: 'pendente',
    }, { status: 201 });

  } catch (error: any) {
    console.error('Erro ao criar pagamento:', error);
    return NextResponse.json(
      { message: error.message || 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
