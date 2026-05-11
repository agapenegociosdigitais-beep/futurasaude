'use client';

import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

type Perfil = {
  nome_completo: string;
  email: string;
  whatsapp: string;
  cpf: string;
};

type BeneficiarioExtra = {
  escola: string;
  cidade: string;
};

function fmtWhats(s: string) {
  const d = s.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function fmtCpf(s: string) {
  const d = s.replace(/\D/g, '');
  if (d.length !== 11) return s;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export default function ConfiguracoesDashboard() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [beneficiario, setBeneficiario] = useState<BeneficiarioExtra>({ escola: '', cidade: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [whatsappSuporte, setWhatsappSuporte] = useState('');

  useEffect(() => {
    fetch('/api/config/publico')
      .then(r => r.json())
      .then(d => { if (d.whatsapp) setWhatsappSuporte(d.whatsapp); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/beneficiario/perfil');
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || 'Erro ao carregar perfil');
        }
        const data = await res.json();
        const p = data.perfil || {};
        const b = data.beneficiario || {};
        setPerfil({
          nome_completo: p.nome_completo || '',
          email: p.email || '',
          whatsapp: p.whatsapp || '',
          cpf: p.cpf || '',
        });
        setBeneficiario({
          escola: b.escola || '',
          cidade: b.cidade || '',
        });
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar perfil');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!perfil) return;
    setSaving(true);
    setError(null);
    try {
      const [resP, resB] = await Promise.all([
        fetch('/api/beneficiario/perfil', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome_completo: perfil.nome_completo,
            whatsapp: perfil.whatsapp,
          }),
        }),
        fetch('/api/beneficiario/perfil', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            escola: beneficiario.escola,
            cidade: beneficiario.cidade,
          }),
        }),
      ]);
      if (!resP.ok || !resB.ok) {
        const j = await (resP.ok ? resB : resP).json().catch(() => ({}));
        throw new Error(j.message || 'Erro ao salvar');
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Configurações
        </h1>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Carregando...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {perfil && !loading && (
          <div className="space-y-6">
            {/* Dados do Responsável */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-8">
              <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
                Dados do Responsável
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    value={perfil.nome_completo}
                    onChange={(e) => setPerfil(p => p ? { ...p, nome_completo: e.target.value } : p)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={fmtCpf(perfil.cpf)}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={fmtWhats(perfil.whatsapp)}
                    onChange={(e) => setPerfil(p => p ? { ...p, whatsapp: e.target.value.replace(/\D/g, '') } : p)}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={perfil.email}
                    disabled
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
                </div>
              </div>
            </div>

            {/* Dados do Beneficiário */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-8">
              <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
                Dados do Beneficiário
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                    Escola
                  </label>
                  <input
                    type="text"
                    value={beneficiario.escola}
                    onChange={(e) => setBeneficiario(b => ({ ...b, escola: e.target.value }))}
                    placeholder="Nome da escola do beneficiário"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={beneficiario.cidade}
                    onChange={(e) => setBeneficiario(b => ({ ...b, cidade: e.target.value }))}
                    placeholder="Cidade do beneficiário"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Segurança */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-8">
              <h2 className="text-2xl font-bold text-[#0a2a5e] mb-4 font-lora">
                Segurança
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Para alterar a senha ou desativar a conta, entre em contato pelo WhatsApp do suporte.
              </p>
              {whatsappSuporte && (
                <a
                  href={`https://wa.me/${whatsappSuporte.replace(/\D/g, '')}?text=Olá! Preciso de suporte na minha conta Futura Saúde.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold text-sm hover:bg-green-200 transition"
                >
                  💬 Falar com suporte
                </a>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-bold hover:bg-[#f0b820] transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Mudanças'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
