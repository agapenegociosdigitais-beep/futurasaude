'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type Beneficiario = {
  id: string;
  nome_completo: string;
  cpf: string | null;
  data_nascimento: string | null;
  numero_cartao: string | null;
  plano_inicio: string | null;
  plano_fim: string | null;
  status: string | null;
  score_engajamento: number | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

function fmtCpf(cpf: string | null) {
  if (!cpf) return '—';
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

export default function CarteirinhaDashboard() {
  const [b, setB] = useState<Beneficiario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/beneficiario/carteirinha');
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || 'Erro ao carregar carteirinha');
        }
        setB(await res.json());
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar carteirinha');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const validUntil = b?.plano_fim
    ? new Date(b.plano_fim).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' })
    : '—';

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Sua Carteirinha Digital
        </h1>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Carregando carteirinha...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {b && !loading && !error && (
          <>
            <div className="bg-gradient-to-br from-[#0a2a5e] to-[#1c3a7a] rounded-3xl shadow-2xl p-12 text-white mb-8 aspect-video flex flex-col justify-between">
              <div>
                <div className="text-4xl font-bold mb-2">🏥</div>
                <h2 className="font-lora text-3xl font-bold">FUTURA SAÚDE</h2>
                <p className="text-gray-300">Cartão de Saúde Digital</p>
              </div>
              <div className="grid grid-cols-2 gap-12">
                <div>
                  <p className="text-xs opacity-80 mb-2">NÚMERO DA CARTEIRINHA</p>
                  <p className="font-mono text-2xl font-bold">{b.numero_cartao || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80 mb-2">VÁLIDA ATÉ</p>
                  <p className="text-2xl font-bold">{validUntil}</p>
                </div>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs opacity-80 mb-1">TITULAR</p>
                  <p className="text-xl font-semibold">{b.nome_completo || '—'}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-80 mb-1">CPF</p>
                  <p className="font-mono">{fmtCpf(b.cpf)}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <button className="bg-white rounded-xl p-6 border-2 border-gray-300 hover:border-[#f5c842] transition text-left">
                <Download className="w-8 h-8 text-[#f5c842] mb-3" />
                <h3 className="font-bold text-[#0a2a5e]">Baixar em PDF</h3>
                <p className="text-sm text-gray-600">Salve uma cópia no seu dispositivo</p>
              </button>
              <button className="bg-white rounded-xl p-6 border-2 border-gray-300 hover:border-[#f5c842] transition text-left">
                <Share2 className="w-8 h-8 text-[#f5c842] mb-3" />
                <h3 className="font-bold text-[#0a2a5e]">Compartilhar</h3>
                <p className="text-sm text-gray-600">Envie para familiares de forma segura</p>
              </button>
              <button className="bg-white rounded-xl p-6 border-2 border-gray-300 hover:border-[#f5c842] transition text-left">
                <div className="text-2xl mb-3">📱</div>
                <h3 className="font-bold text-[#0a2a5e]">Modo Offline</h3>
                <p className="text-sm text-gray-600">Use sem internet</p>
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 border-2 border-gray-300">
              <h2 className="text-xl font-bold text-[#0a2a5e] mb-6">Dados da Carteirinha</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nome Completo</p>
                  <p className="font-semibold text-[#0a2a5e]">{b.nome_completo || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">CPF</p>
                  <p className="font-semibold text-[#0a2a5e]">{fmtCpf(b.cpf)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Data de Nascimento</p>
                  <p className="font-semibold text-[#0a2a5e]">{fmtDate(b.data_nascimento)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <p className="font-semibold text-[#0a2a5e]">
                    {b.status === 'ativo' ? 'Ativo' : b.status || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Plano Válido de</p>
                  <p className="font-semibold text-[#0a2a5e]">
                    {fmtDate(b.plano_inicio)} a {fmtDate(b.plano_fim)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Score de Engajamento</p>
                  <p className="font-semibold text-[#0a2a5e]">
                    {b.score_engajamento != null ? `${b.score_engajamento}/100` : '—'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
