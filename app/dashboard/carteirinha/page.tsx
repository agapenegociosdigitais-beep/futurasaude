'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
  foto_url: string | null;
  escola: string | null;
  cidade: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

function fmtValidade(iso: string | null) {
  if (!iso) return 'Pendente';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
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
  const [gerandoPdf, setGerandoPdf] = useState(false);

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

  const nomeBeneficiario = b?.nome_completo || '—';
  const validadeCartao = fmtValidade(b?.plano_fim || null);
  const statusPlano = b?.status === 'ativo' ? 'ATIVO' : 'PENDENTE';
  const cpfFmt = fmtCpf(b?.cpf || null);
  const iniciais = nomeBeneficiario.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();

  async function handleDownloadPdf() {
    if (!b) return;
    setGerandoPdf(true);
    try {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', sans-serif; background: #f0f2f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .card { width: 600px; background: linear-gradient(135deg, #0a1f5e 0%, #0d2d7a 50%, #1565c0 100%); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(10,30,94,0.4); }
          .ribbon { background: rgba(245,200,66,0.15); padding: 12px 24px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
          .logo { font-size: 22px; font-weight: 900; color: white; letter-spacing: 1px; }
          .logo span { color: #f5c842; }
          .slogan { font-size: 11px; color: rgba(255,255,255,0.6); margin-left: auto; }
          .body { display: grid; grid-template-columns: 120px 1fr; gap: 20px; padding: 20px 24px; }
          .foto { width: 110px; height: 110px; border-radius: 14px; background: rgba(255,255,255,0.15); border: 2px solid rgba(245,200,66,0.4); display: flex; align-items: center; justify-content: center; font-size: 38px; font-weight: 900; color: white; overflow: hidden; }
          .foto img { width: 100%; height: 100%; object-fit: cover; }
          .campos { display: flex; flex-direction: column; gap: 10px; justify-content: center; }
          .campo-label { font-size: 11px; color: #f5c842; font-weight: 600; margin-bottom: 2px; letter-spacing: 0.5px; }
          .campo-val { font-size: 16px; font-weight: 700; color: white; }
          .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .footer { background: rgba(0,0,0,0.3); padding: 16px 24px; }
          .footer-tipo { font-size: 11px; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
          .footer-nome { font-size: 22px; font-weight: 900; color: white; letter-spacing: 1px; text-transform: uppercase; }
          .footer-num { font-size: 11px; color: rgba(255,255,255,0.4); letter-spacing: 2px; margin-top: 4px; }
        </style>
      </head><body><div class="card">
        <div class="ribbon">
          <div class="logo">FUTURA<span>SAÚDE</span></div>
          <div class="slogan">Educação e saúde pelo futuro do seu filho</div>
        </div>
        <div class="body">
          <div class="foto">${b.foto_url ? `<img src="${b.foto_url}" />` : iniciais}</div>
          <div class="campos">
            <div><div class="campo-label">CPF:</div><div class="campo-val">${cpfFmt}</div></div>
            <div class="row">
              <div><div class="campo-label">Nascimento:</div><div class="campo-val">${fmtDate(b.data_nascimento)}</div></div>
              <div><div class="campo-label">Validade:</div><div class="campo-val" style="color:#f5c842">${validadeCartao}</div></div>
            </div>
            <div class="row">
              <div><div class="campo-label">Escola:</div><div class="campo-val">${b.escola || '—'}</div></div>
              <div><div class="campo-label">Cidade:</div><div class="campo-val">${b.cidade || '—'}</div></div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="footer-tipo">Beneficiário</div>
          <div class="footer-nome">${nomeBeneficiario.toUpperCase()}</div>
          <div class="footer-num">${b.numero_cartao || '—'} · ${statusPlano}</div>
        </div>
      </div></body></html>`;

      const win = window.open('', '_blank');
      if (win) {
        win.document.write(html);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 600);
      }
    } finally {
      setGerandoPdf(false);
    }
  }

  async function handleShare() {
    if (!b) return;
    const text = `Carteirinha Futura Saúde\nBeneficiário: ${nomeBeneficiario}\nNº: ${b.numero_cartao || '—'}\nVálida até: ${validadeCartao}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'Carteirinha Futura Saúde', text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
          Minha Carteirinha
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
            {/* Carteirinha */}
            <div style={{
              background: 'linear-gradient(135deg, #0a1f5e 0%, #0d2d7a 50%, #1565c0 100%)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 20px 60px rgba(10,30,94,0.4)',
              marginBottom: '24px',
            }}>
              {/* Ribbon / Logo */}
              <div style={{
                background: 'rgba(245,200,66,0.12)',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '1px' }}>
                  FUTURA<span style={{ color: '#f5c842' }}>SAÚDE</span>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
                  Educação e saúde pelo futuro do seu filho
                </div>
              </div>

              {/* Body */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '130px 1fr',
                gap: '20px',
                padding: '22px 24px',
              }}>
                {/* Foto */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{
                    width: '115px',
                    height: '115px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.12)',
                    border: '2px solid rgba(245,200,66,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '36px',
                    fontWeight: 900,
                    color: 'white',
                    overflow: 'hidden',
                  }}>
                    {b.foto_url ? (
                      <img src={b.foto_url} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : iniciais}
                  </div>
                </div>

                {/* Campos */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', justifyContent: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#f5c842', fontWeight: 600, marginBottom: '2px' }}>CPF:</div>
                    <div style={{ fontSize: '17px', fontWeight: 700, color: 'white' }}>{cpfFmt}</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#f5c842', fontWeight: 600, marginBottom: '2px' }}>Nascimento:</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{fmtDate(b.data_nascimento)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#f5c842', fontWeight: 600, marginBottom: '2px' }}>Validade:</div>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: '#f5c842' }}>{validadeCartao}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: '#f5c842', fontWeight: 600, marginBottom: '2px' }}>Escola:</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{b.escola || '—'}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: '#f5c842', fontWeight: 600, marginBottom: '2px' }}>Cidade:</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: 'white' }}>{b.cidade || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                padding: '16px 24px',
              }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Beneficiário
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  {nomeBeneficiario}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', letterSpacing: '2px', marginTop: '4px' }}>
                  {b.numero_cartao || '—'} · {statusPlano}
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <button
                onClick={handleDownloadPdf}
                disabled={gerandoPdf}
                className="bg-white rounded-xl p-5 border-2 border-gray-300 hover:border-[#f5c842] transition text-left disabled:opacity-50"
              >
                <div className="text-2xl mb-2">⬇️</div>
                <h3 className="font-bold text-[#0a2a5e] text-sm">{gerandoPdf ? 'Gerando...' : 'Baixar em PDF'}</h3>
                <p className="text-xs text-gray-500 mt-1">Salve no dispositivo</p>
              </button>
              <button
                onClick={handleShare}
                className="bg-white rounded-xl p-5 border-2 border-gray-300 hover:border-[#f5c842] transition text-left"
              >
                <div className="text-2xl mb-2">📤</div>
                <h3 className="font-bold text-[#0a2a5e] text-sm">Compartilhar</h3>
                <p className="text-xs text-gray-500 mt-1">Envie com segurança</p>
              </button>
              <button
                onClick={() => window.print()}
                className="bg-white rounded-xl p-5 border-2 border-gray-300 hover:border-[#f5c842] transition text-left"
              >
                <div className="text-2xl mb-2">📱</div>
                <h3 className="font-bold text-[#0a2a5e] text-sm">Modo Offline</h3>
                <p className="text-xs text-gray-500 mt-1">Use sem internet</p>
              </button>
            </div>

            {/* Dados detalhados */}
            <div className="bg-white rounded-xl p-8 border-2 border-gray-300">
              <h2 className="text-xl font-bold text-[#0a2a5e] mb-6">Dados da Carteirinha</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Beneficiário</p>
                  <p className="font-semibold text-[#0a2a5e]">{nomeBeneficiario}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">CPF</p>
                  <p className="font-semibold text-[#0a2a5e]">{cpfFmt}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Data de Nascimento</p>
                  <p className="font-semibold text-[#0a2a5e]">{fmtDate(b.data_nascimento)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Nº da Carteirinha</p>
                  <p className="font-semibold text-[#0a2a5e] font-mono">{b.numero_cartao || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Escola</p>
                  <p className="font-semibold text-[#0a2a5e]">{b.escola || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Cidade</p>
                  <p className="font-semibold text-[#0a2a5e]">{b.cidade || '—'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Plano Válido de</p>
                  <p className="font-semibold text-[#0a2a5e]">{fmtDate(b.plano_inicio)} a {fmtDate(b.plano_fim)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <p className="font-semibold text-[#0a2a5e]">{b.status === 'ativo' ? 'Ativo ✓' : b.status || '—'}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
