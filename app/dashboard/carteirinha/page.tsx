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
  foto_url: string | null;
  escola: string | null;
  cidade: string | null;
};

function fmtDate(iso: string | null) {
  if (!iso) return '--/--/----';
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

function fmtValidade(iso: string | null) {
  if (!iso) return 'Pendente';
  const d = new Date(iso + 'T00:00:00');
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

function fmtCpf(cpf: string | null) {
  if (!cpf) return '—';
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

const CSS = `
  .carteirinha-nova {
    background: linear-gradient(135deg, #0a1f5e 0%, #0d2d7a 50%, #1565c0 100%);
    border-radius: 20px;
    padding: 28px 28px 0;
    max-width: 620px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(10,30,94,0.4);
  }
  .carteirinha-nova::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 60% 30%, rgba(30,80,180,0.5) 0%, transparent 65%);
    pointer-events: none;
  }
  .cn-ribbon {
    position: absolute;
    top: 0; right: 40px;
    width: 38px;
    background: linear-gradient(180deg, #f5c842 0%, #e8a020 60%, #c87800 100%);
    height: 95px;
    border-radius: 0 0 8px 8px;
    display: flex; align-items: flex-end; justify-content: center;
    padding-bottom: 8px; z-index: 2;
  }
  .cn-header { position: relative; z-index: 1; margin-bottom: 24px; }
  .cn-logo-nome { font-size: 30px; font-weight: 900; letter-spacing: 1px; color: white; }
  .cn-logo-nome span { color: #f5c842; }
  .cn-slogan { font-style: italic; font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 4px; }
  .cn-body { display: grid; grid-template-columns: 150px 1fr; gap: 24px; position: relative; z-index: 1; margin-bottom: 20px; }
  .cn-foto-wrap { display: flex; align-items: center; justify-content: center; }
  .cn-foto {
    width: 130px; height: 130px; border-radius: 50%;
    border: 4px solid #c8900a;
    background: rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 52px; overflow: hidden;
    box-shadow: 0 0 0 3px #f5c842, 0 0 0 6px rgba(245,200,66,0.2);
  }
  .cn-campos { display: flex; flex-direction: column; gap: 10px; justify-content: center; }
  .cn-campo {
    background: rgba(5,15,50,0.5);
    border-radius: 8px; padding: 10px 14px;
    border: 1px solid rgba(255,255,255,0.08);
  }
  .cn-campo-label { font-size: 12px; color: #f5c842; font-weight: 600; margin-bottom: 3px; }
  .cn-campo-val { font-size: 18px; font-weight: 700; color: white; }
  .cn-campos-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .cn-footer-bar {
    background: rgba(5,15,50,0.6);
    border-top: 2px solid #f5c842;
    padding: 16px 28px;
    margin: 0 -28px;
    position: relative; z-index: 1;
  }
  .cn-footer-tipo { font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
  .cn-footer-nome { font-size: 26px; font-weight: 900; color: white; letter-spacing: 1px; text-transform: uppercase; }
  .cn-numero-bar { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 2px; margin-top: 6px; }
  @media (max-width: 600px) {
    .carteirinha-nova { padding: 18px 18px 0; }
    .cn-body { grid-template-columns: 100px 1fr; gap: 14px; }
    .cn-foto { width: 90px !important; height: 90px !important; font-size: 34px !important; }
    .cn-logo-nome { font-size: 22px !important; }
    .cn-campo-val { font-size: 14px !important; }
    .cn-footer-nome { font-size: 20px !important; }
    .cn-footer-bar { padding: 14px 18px; margin: 0 -18px; }
  }
`;

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

  const nomeBen = b?.nome_completo || '—';
  const cpfExibir = fmtCpf(b?.cpf || null);
  const nascimento = fmtDate(b?.data_nascimento || null);
  const validadeCartao = fmtValidade(b?.plano_fim || null);
  const statusPlano = b?.status === 'ativo' ? 'ATIVO' : 'PENDENTE';
  const cidadeBen = b?.cidade || '—';
  const escolaBen = b?.escola || '—';
  const numeroCartao = b?.numero_cartao || '—';

  async function handleBaixarPdf() {
    if (!b) return;
    setGerandoPdf(true);
    try {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Segoe UI',sans-serif;background:#f0f2f8;display:flex;justify-content:center;align-items:center;min-height:100vh;}
        .card{width:600px;background:linear-gradient(135deg,#0a1f5e 0%,#0d2d7a 50%,#1565c0 100%);border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(10,30,94,0.4);position:relative;}
        .ribbon{position:absolute;top:0;right:40px;width:38px;background:linear-gradient(180deg,#f5c842 0%,#e8a020 60%,#c87800 100%);height:95px;border-radius:0 0 8px 8px;display:flex;align-items:flex-end;justify-content:center;padding-bottom:8px;}
        .header{padding:28px 28px 0;position:relative;z-index:1;margin-bottom:24px;}
        .logo{font-size:28px;font-weight:900;letter-spacing:1px;color:white;}
        .logo span{color:#f5c842;}
        .slogan{font-style:italic;font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;}
        .body{display:grid;grid-template-columns:150px 1fr;gap:24px;padding:0 28px;margin-bottom:20px;}
        .foto{width:130px;height:130px;border-radius:50%;border:4px solid #c8900a;background:rgba(255,255,255,0.12);display:flex;align-items:center;justify-content:center;font-size:48px;box-shadow:0 0 0 3px #f5c842;}
        .foto img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
        .campos{display:flex;flex-direction:column;gap:10px;justify-content:center;}
        .campo{background:rgba(5,15,50,0.5);border-radius:8px;padding:10px 14px;border:1px solid rgba(255,255,255,0.08);}
        .label{font-size:11px;color:#f5c842;font-weight:600;margin-bottom:3px;}
        .val{font-size:17px;font-weight:700;color:white;}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .footer{background:rgba(5,15,50,0.6);border-top:2px solid #f5c842;padding:16px 28px;}
        .ftipo{font-size:11px;color:rgba(255,255,255,0.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:4px;}
        .fnome{font-size:24px;font-weight:900;color:white;letter-spacing:1px;text-transform:uppercase;}
        .fnum{font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:2px;margin-top:4px;}
      </style></head><body><div class="card">
        <div class="ribbon"><span style="color:#0a2a5e;font-size:18px;font-weight:900">✚</span></div>
        <div class="header">
          <div class="logo">FUTURA<span>SAÚDE</span></div>
          <div class="slogan">Educação e saúde pelo futuro do seu filho</div>
        </div>
        <div class="body">
          <div style="display:flex;align-items:center;justify-content:center;">
            <div class="foto">${b.foto_url ? `<img src="${b.foto_url}"/>` : '👤'}</div>
          </div>
          <div class="campos">
            <div class="campo"><div class="label">CPF:</div><div class="val">${cpfExibir}</div></div>
            <div class="row">
              <div class="campo"><div class="label">Data de Nascimento:</div><div class="val">${nascimento}</div></div>
              <div class="campo"><div class="label">Validade:</div><div class="val" style="color:#f5c842">${validadeCartao}</div></div>
            </div>
            <div class="row">
              <div class="campo"><div class="label">Escola:</div><div class="val">${escolaBen}</div></div>
              <div class="campo"><div class="label">Cidade:</div><div class="val">${cidadeBen}</div></div>
            </div>
          </div>
        </div>
        <div class="footer">
          <div class="ftipo">Beneficiário</div>
          <div class="fnome">${nomeBen.toUpperCase()}</div>
          <div class="fnum">${numeroCartao} · ${statusPlano}</div>
        </div>
      </div></body></html>`;
      const win = window.open('', '_blank');
      if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => { win.print(); win.close(); }, 600); }
    } finally {
      setGerandoPdf(false);
    }
  }

  async function handleShare() {
    if (!b) return;
    const text = `Carteirinha Futura Saúde\nBeneficiário: ${nomeBen}\nNº: ${numeroCartao}\nVálida até: ${validadeCartao}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      await navigator.share({ title: 'Carteirinha Futura Saúde', text });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="min-h-screen bg-gray-100 p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-6 hover:underline">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h1 className="text-3xl font-bold text-[#0a2a5e] mb-6 font-lora">
            💳 Carteirinha Virtual — Futura Saúde
          </h1>

          {loading && <div className="text-center py-12 text-gray-600">Carregando carteirinha...</div>}
          {error && !loading && <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg">{error}</div>}

          {b && !loading && !error && (
            <>
              <div className="carteirinha-nova">
                <div className="cn-ribbon">
                  <span style={{ color: '#0a2a5e', fontSize: '18px', fontWeight: 900 }}>✚</span>
                </div>
                <div className="cn-header">
                  <div className="cn-logo-nome">FUTURA<span>SAÚDE</span></div>
                  <div className="cn-slogan">Educação e saúde pelo futuro do seu filho</div>
                </div>
                <div className="cn-body">
                  <div className="cn-foto-wrap">
                    <div className="cn-foto">
                      {b.foto_url
                        ? <img src={b.foto_url} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : '👤'}
                    </div>
                  </div>
                  <div className="cn-campos">
                    <div className="cn-campo">
                      <div className="cn-campo-label">CPF:</div>
                      <div className="cn-campo-val">{cpfExibir}</div>
                    </div>
                    <div className="cn-campos-row">
                      <div className="cn-campo">
                        <div className="cn-campo-label">Data de Nascimento:</div>
                        <div className="cn-campo-val">{nascimento}</div>
                      </div>
                      <div className="cn-campo">
                        <div className="cn-campo-label">Validade:</div>
                        <div className="cn-campo-val" style={{ color: '#f5c842' }}>{validadeCartao}</div>
                      </div>
                    </div>
                    <div className="cn-campos-row">
                      <div className="cn-campo">
                        <div className="cn-campo-label">Escola:</div>
                        <div className="cn-campo-val">{escolaBen}</div>
                      </div>
                      <div className="cn-campo">
                        <div className="cn-campo-label">Cidade:</div>
                        <div className="cn-campo-val">{cidadeBen}</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cn-footer-bar">
                  <div className="cn-footer-tipo">Beneficiário</div>
                  <div className="cn-footer-nome">{nomeBen.toUpperCase()}</div>
                  <div className="cn-numero-bar">{numeroCartao} · {statusPlano} · {cidadeBen}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <button
                  onClick={handleBaixarPdf}
                  disabled={gerandoPdf}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0a2a5e', color: 'white', fontWeight: 700, fontSize: '13px', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer', opacity: gerandoPdf ? 0.6 : 1 }}
                >
                  {gerandoPdf ? '⏳ Gerando...' : '📄 Baixar PDF'}
                </button>
                <button
                  onClick={handleShare}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0a2a5e', color: 'white', fontWeight: 700, fontSize: '13px', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  📤 Compartilhar
                </button>
                <button
                  onClick={() => window.print()}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#0a2a5e', color: 'white', fontWeight: 700, fontSize: '13px', padding: '10px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                >
                  📱 Modo Offline
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
