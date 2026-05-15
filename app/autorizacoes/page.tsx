import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase';

function badgeClass(status: string) {
  if (status === 'aprovada') return 'bg-green-100 text-green-700';
  if (status === 'negada') return 'bg-red-100 text-red-700';
  if (status === 'utilizada') return 'bg-blue-100 text-blue-700';
  if (status === 'cancelada') return 'bg-gray-200 text-gray-700';
  if (status === 'expirada') return 'bg-orange-100 text-orange-700';
  return 'bg-yellow-100 text-yellow-700';
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString('pt-BR');
}

export default async function AutorizacoesPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: beneficiario } = await supabaseAdmin
    .from('beneficiarios')
    .select('id')
    .eq('responsavel_id', user.id)
    .maybeSingle();

  const { data: autorizacoes } = beneficiario
    ? await supabaseAdmin
        .from('autorizacoes')
        .select('*')
        .eq('beneficiario_id', beneficiario.id)
        .order('created_at', { ascending: false })
    : { data: [] as any[] };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0a2a5e]">Minhas Autorizações</h1>
            <p className="text-sm text-gray-600 mt-2">Acompanhe suas solicitações e baixe o PDF quando aprovadas.</p>
          </div>
          <Link
            href="/autorizacoes/nova"
            className="px-5 py-3 rounded-xl bg-[#f5c842] text-[#0a2a5e] font-bold hover:bg-[#f0b820]"
          >
            Nova autorização
          </Link>
        </div>

        {!autorizacoes?.length ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-gray-500">
            Nenhuma autorização encontrada.
          </div>
        ) : (
          <div className="space-y-4">
            {autorizacoes.map((autorizacao: any) => (
              <Link
                key={autorizacao.id}
                href={`/autorizacoes/${autorizacao.id}`}
                className="block bg-white rounded-2xl border border-gray-200 p-5 hover:border-[#f5c842] transition"
              >
                <div className="flex flex-wrap justify-between gap-4 items-start">
                  <div>
                    <p className="text-xs text-gray-500">Protocolo</p>
                    <p className="font-bold text-[#0a2a5e]">{autorizacao.protocolo}</p>
                    <p className="text-sm text-gray-600 mt-2 capitalize">{autorizacao.tipo}</p>
                    <p className="font-semibold text-[#0a2a5e] mt-1">{autorizacao.especialidade_ou_exame}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(autorizacao.status)}`}>
                      {autorizacao.status}
                    </span>
                    <p className="text-xs text-gray-500">Validade: {formatDate(autorizacao.valida_ate)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
