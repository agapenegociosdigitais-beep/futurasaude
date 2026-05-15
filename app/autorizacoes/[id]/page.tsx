import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
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

export default async function AutorizacaoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { id } = await params;

  const { data: beneficiario } = await supabaseAdmin
    .from('beneficiarios')
    .select('id')
    .eq('responsavel_id', user.id)
    .maybeSingle();

  if (!beneficiario) notFound();

  const { data: autorizacao } = await supabaseAdmin
    .from('autorizacoes')
    .select('*, beneficiarios(nome_completo, cpf)')
    .eq('id', id)
    .eq('beneficiario_id', beneficiario.id)
    .maybeSingle();

  if (!autorizacao) notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <p className="text-sm text-gray-500">Protocolo</p>
            <h1 className="text-3xl font-bold text-[#0a2a5e]">{autorizacao.protocolo}</h1>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${badgeClass(autorizacao.status)}`}>
            {autorizacao.status}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Beneficiário</p>
            <p className="font-semibold text-[#0a2a5e]">{autorizacao.beneficiarios?.nome_completo}</p>
          </div>
          <div>
            <p className="text-gray-500">CPF</p>
            <p className="font-semibold text-[#0a2a5e]">{autorizacao.beneficiarios?.cpf}</p>
          </div>
          <div>
            <p className="text-gray-500">Tipo</p>
            <p className="font-semibold text-[#0a2a5e] capitalize">{autorizacao.tipo}</p>
          </div>
          <div>
            <p className="text-gray-500">Validade</p>
            <p className="font-semibold text-[#0a2a5e]">{formatDate(autorizacao.valida_ate)}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">Especialidade / exame</p>
            <p className="font-semibold text-[#0a2a5e]">{autorizacao.especialidade_ou_exame}</p>
          </div>
          {autorizacao.justificativa && (
            <div className="md:col-span-2">
              <p className="text-gray-500">Justificativa</p>
              <p className="font-semibold text-[#0a2a5e]">{autorizacao.justificativa}</p>
            </div>
          )}
          {autorizacao.motivo_negativa && (
            <div className="md:col-span-2">
              <p className="text-gray-500">Motivo da negativa</p>
              <p className="font-semibold text-red-600">{autorizacao.motivo_negativa}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <Link
            href="/autorizacoes"
            className="px-4 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Voltar
          </Link>
          {autorizacao.status === 'aprovada' && (
            <a
              href={`/api/autorizacoes/${autorizacao.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition"
            >
              Baixar PDF
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
