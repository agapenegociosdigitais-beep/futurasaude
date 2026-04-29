'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState('inicio');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Verificar token no cookie ou localStorage
    const token = localStorage.getItem('sb-access-token');
    const cookieToken = document.cookie
      .split(';')
      .find(c => c.trim().startsWith('sb-access-token='))
      ?.split('=')[1];

    if (!token && !cookieToken) {
      router.replace('/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // Upload de foto
  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Foto muito grande. Máximo 2MB.');
      return;
    }

    setUploadingFoto(true);
    try {
      const token = localStorage.getItem('sb-access-token');
      const formData = new FormData();
      formData.append('foto', file);

      const res = await fetch('/api/beneficiario/foto', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setFotoUrl(data.url);
        alert('✅ Foto atualizada com sucesso!');
      } else {
        // Fallback: mostrar localmente mesmo sem salvar no servidor
        const localUrl = URL.createObjectURL(file);
        setFotoUrl(localUrl);
        alert('✅ Foto adicionada!');
      }
    } catch {
      // Fallback local
      const localUrl = URL.createObjectURL(file);
      setFotoUrl(localUrl);
    } finally {
      setUploadingFoto(false);
    }
  };

  // Gerar PDF da carteirinha
  const handleBaixarPdf = async () => {
    setGerandoPdf(true);
    try {
      // Criar HTML da carteirinha para PDF
      const carteirinhaHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;700;900&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Sora', sans-serif; background: #f0f2f8; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            .card {
              width: 600px;
              background: linear-gradient(135deg, #0a1f5e 0%, #0d2d7a 50%, #1565c0 100%);
              border-radius: 20px;
              padding: 28px 28px 0;
              position: relative;
              overflow: hidden;
            }
            .ribbon {
              position: absolute; top: 0; right: 40px;
              width: 38px; height: 95px;
              background: linear-gradient(180deg, #f5c842 0%, #c87800 100%);
              border-radius: 0 0 8px 8px;
              display: flex; align-items: flex-end; justify-content: center;
              padding-bottom: 8px;
            }
            .logo { font-size: 32px; font-weight: 900; color: white; margin-bottom: 4px; }
            .logo span { color: #f5c842; }
            .slogan { font-style: italic; font-size: 14px; color: rgba(255,255,255,0.6); margin-bottom: 24px; }
            .body { display: grid; grid-template-columns: 150px 1fr; gap: 24px; margin-bottom: 20px; }
            .foto-wrap { display: flex; align-items: center; justify-content: center; }
            .foto {
              width: 130px; height: 130px; border-radius: 50%;
              border: 4px solid #c8900a;
              background: rgba(255,255,255,0.2);
              display: flex; align-items: center; justify-content: center;
              font-size: 52px;
              box-shadow: 0 0 0 3px #f5c842;
              overflow: hidden;
            }
            .foto img { width: 100%; height: 100%; object-fit: cover; }
            .campos { display: flex; flex-direction: column; gap: 10px; justify-content: center; }
            .campo { background: rgba(5,15,50,0.5); border-radius: 8px; padding: 10px 14px; }
            .campo-label { font-size: 12px; color: #f5c842; font-weight: 600; margin-bottom: 3px; }
            .campo-val { font-size: 18px; font-weight: 700; color: white; }
            .row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .footer {
              background: rgba(5,15,50,0.6);
              border-top: 2px solid #f5c842;
              padding: 16px 28px;
              margin: 0 -28px;
            }
            .footer-tipo { font-size: 12px; color: rgba(255,255,255,0.5); letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
            .footer-nome { font-size: 26px; font-weight: 900; color: white; text-transform: uppercase; }
            .footer-num { font-size: 11px; color: rgba(255,255,255,0.3); letter-spacing: 2px; margin-top: 6px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="ribbon"><span style="color:#0a2a5e;font-size:18px;font-weight:900">✚</span></div>
            <div class="logo">FUTURA<span>SAÚDE</span></div>
            <div class="slogan">Educação e saúde pelo futuro do seu filho</div>
            <div class="body">
              <div class="foto-wrap">
                <div class="foto">
                  ${fotoUrl ? `<img src="${fotoUrl}" alt="foto"/>` : '👤'}
                </div>
              </div>
              <div class="campos">
                <div class="campo">
                  <div class="campo-label">CPF:</div>
                  <div class="campo-val">456.789.123-00</div>
                </div>
                <div class="row">
                  <div class="campo">
                    <div class="campo-label">Data de Nascimento:</div>
                    <div class="campo-val">15/03/2007</div>
                  </div>
                  <div class="campo">
                    <div class="campo-label">Validade:</div>
                    <div class="campo-val" style="color:#f5c842">15/06/2026</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="footer">
              <div class="footer-tipo">Beneficiário</div>
              <div class="footer-nome">Pedro Carlos Silva</div>
              <div class="footer-num">FS-2025-00042 · ATIVO ✓ · Santarém — PA</div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Abrir em nova janela e imprimir como PDF
      const win = window.open('', '_blank');
      if (win) {
        win.document.write(carteirinhaHtml);
        win.document.close();
        win.focus();
        setTimeout(() => {
          win.print();
          win.close();
        }, 800);
      }
    } finally {
      setGerandoPdf(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: '#f0f2f8', fontFamily: 'Sora, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⏳</div>
          <div style={{ color: '#0a2a5e', fontWeight: '600' }}>Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=Lora:ital,wght@0,400;0,600;1,400&display=swap');
        :root { --azul: #0a2a5e; --dourado: #f5c842; --cinza: #8a8070; --sidebar-w: 260px; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; display: flex; min-height: 100vh; background: #f0f2f8; }
        .sidebar { width: var(--sidebar-w); flex-shrink: 0; background: var(--azul); display: flex; flex-direction: column; position: fixed; height: 100vh; transition: transform .3s; z-index: 100; }
        .sidebar-logo { padding: 24px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); }
        .nome { font-size: 18px; font-weight: 800; color: white; letter-spacing: 2px; }
        .nome span { color: var(--dourado); }
        .slogan { font-size: 11px; color: rgba(255,255,255,0.4); font-style: italic; margin-top: 4px; }
        .sidebar-user { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; align-items: center; gap: 10px; }
        .avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--dourado); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 13px; color: var(--azul); }
        .nav-section { padding: 10px 20px 4px; font-size: 9px; font-weight: 700; letter-spacing: 2px; color: rgba(255,255,255,0.25); text-transform: uppercase; }
        .nav-item { padding: 13px 20px; color: rgba(255,255,255,0.6); cursor: pointer; border-left: 3px solid transparent; background: none; border: none; font-family: 'Sora', sans-serif; font-size: 13px; font-weight: 600; width: 100%; text-align: left; display: flex; align-items: center; gap: 10px; transition: all .2s; }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: white; }
        .nav-item.ativo { background: rgba(245,200,66,0.1); color: var(--dourado); border-left-color: var(--dourado); }
        .main { margin-left: var(--sidebar-w); flex: 1; display: flex; flex-direction: column; min-height: 100vh; }
        .topbar { background: white; padding: 16px 28px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e8e4de; position: sticky; top: 0; z-index: 50; }
        .topbar-title { font-size: 15px; font-weight: 700; color: var(--azul); }
        .badge-ativo { background: #e8f5ee; color: #1a5c33; font-size: 11px; font-weight: 700; padding: 5px 12px; border-radius: 20px; border: 1px solid #a0d4b8; }
        .content { padding: 28px; flex: 1; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 14px; margin-bottom: 24px; }
        .stat-card { background: white; border-radius: 16px; padding: 18px 20px; border: 1px solid #e8e4de; display: flex; gap: 14px; align-items: center; }
        .stat-icon { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
        .stat-val { font-size: 22px; font-weight: 800; color: var(--azul); font-family: 'Lora', serif; line-height: 1; }
        .stat-label { font-size: 11px; color: var(--cinza); margin-top: 3px; }
        .card { background: white; border-radius: 18px; padding: 22px; border: 1px solid #e8e4de; margin-bottom: 18px; }
        .card-title { font-size: 13px; font-weight: 700; color: var(--azul); margin-bottom: 18px; }

        .carteirinha-nova {
          background: linear-gradient(135deg, #0a1f5e 0%, #0d2d7a 50%, #1565c0 100%);
          border-radius: 20px;
          padding: 28px 28px 0;
          max-width: 600px;
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
        .cn-slogan { font-family: 'Lora', serif; font-style: italic; font-size: 14px; color: rgba(255,255,255,0.6); margin-top: 4px; }
        .cn-body { display: grid; grid-template-columns: 150px 1fr; gap: 24px; position: relative; z-index: 1; margin-bottom: 20px; }
        .cn-foto-wrap { display: flex; align-items: center; justify-content: center; }
        .cn-foto {
          width: 130px; height: 130px; border-radius: 50%;
          border: 4px solid #c8900a;
          background: rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          font-size: 52px; cursor: pointer; overflow: hidden;
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

        .btn-download { display: inline-flex; align-items: center; gap: 8px; background: var(--azul); color: white; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 13px; padding: 10px 18px; border-radius: 10px; border: none; cursor: pointer; margin-top: 16px; text-decoration: none; }
        .clinica-card { background: #f8f6f2; border-radius: 14px; padding: 18px; border: 1px solid #e8e4de; margin-bottom: 12px; display: flex; align-items: center; gap: 14px; }
        .clinica-icon { width: 52px; height: 52px; border-radius: 13px; background: white; border: 1px solid #e0dbd4; display: flex; align-items: center; justify-content: center; font-size: 24px; flex-shrink: 0; }
        .clinica-nome { font-size: 15px; font-weight: 700; color: var(--azul); margin-bottom: 3px; }
        .clinica-info { font-size: 12px; color: var(--cinza); }
        .esp-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; margin-bottom: 6px; }
        .btn-agendar { display: flex; align-items: center; justify-content: center; gap: 8px; background: #25d366; color: white; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 13px; padding: 11px 18px; border-radius: 10px; border: none; cursor: pointer; text-decoration: none; margin-left: auto; flex-shrink: 0; }
        .btn-sair { display: flex; align-items: center; gap: 8px; background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; font-family: 'Sora', sans-serif; font-size: 13px; padding: 14px 20px; width: 100%; }
        .btn-sair:hover { color: #ff7070; }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; }
        @media(max-width:768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.aberta { transform: translateX(0); }
          .sidebar-overlay.ativo { display: block; }
          .main { margin-left: 0; }
          .content { padding: 16px; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div
        className={`sidebar-overlay ${sidebarOpen ? '' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <aside className={`sidebar ${sidebarOpen ? 'aberta' : ''}`}>
        <div className="sidebar-logo">
          <div className="nome">FUTURA<span>SAÚDE</span></div>
          <div className="slogan">Educação e saúde pelo futuro do seu filho</div>
        </div>
        <div className="sidebar-user">
          <div className="avatar">B</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'white' }}>Beneficiário</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>Plano ativo</div>
          </div>
        </div>
        <nav style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
          <div className="nav-section">Principal</div>
          <button className={`nav-item ${currentPage === 'inicio' ? 'ativo' : ''}`} onClick={() => setCurrentPage('inicio')}>
            <span>🏠</span> Início
          </button>
          <button className={`nav-item ${currentPage === 'carteirinha' ? 'ativo' : ''}`} onClick={() => setCurrentPage('carteirinha')}>
            <span>💳</span> Minha Carteirinha
          </button>
          <div className="nav-section">Serviços</div>
          <button className={`nav-item ${currentPage === 'clinicas' ? 'ativo' : ''}`} onClick={() => setCurrentPage('clinicas')}>
            <span>🏥</span> Rede Credenciada
          </button>
          <button className={`nav-item ${currentPage === 'agendamentos' ? 'ativo' : ''}`} onClick={() => setCurrentPage('agendamentos')}>
            <span>📅</span> Agendamentos
          </button>
          <div className="nav-section">Conta</div>
          <button className={`nav-item ${currentPage === 'perfil' ? 'ativo' : ''}`} onClick={() => setCurrentPage('perfil')}>
            <span>👤</span> Meu Perfil
          </button>
        </nav>
        <div style={{ padding: '14px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button className="btn-sair" onClick={() => {
            localStorage.removeItem('sb-access-token');
            localStorage.removeItem('sb-refresh-token');
            document.cookie = 'sb-access-token=; max-age=0; path=/';
            document.cookie = 'sb-refresh-token=; max-age=0; path=/';
            window.location.href = '/login';
          }}>
            🚪 Sair
          </button>
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer' }}>☰</button>
            <div className="topbar-title">
              {currentPage === 'inicio' && 'Início'}
              {currentPage === 'carteirinha' && 'Minha Carteirinha'}
              {currentPage === 'clinicas' && 'Rede Credenciada'}
              {currentPage === 'agendamentos' && 'Agendamentos'}
              {currentPage === 'perfil' && 'Meu Perfil'}
            </div>
          </div>
          <span className="badge-ativo">✅ Plano Ativo</span>
        </div>

        <div className="content">

          {/* INÍCIO */}
          {currentPage === 'inicio' && (
            <>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#faeeda' }}>🎓</div>
                  <div><div className="stat-val">Pedro</div><div className="stat-label">Beneficiário</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e8f5ee' }}>🦷</div>
                  <div><div className="stat-val">3</div><div className="stat-label">Consultas disponíveis</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#e6f1fb' }}>🏥</div>
                  <div><div className="stat-val">40</div><div className="stat-label">Clínicas parceiras</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#eeedfe' }}>📅</div>
                  <div><div className="stat-val">Jun/2026</div><div className="stat-label">Válido até</div></div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">💳 Minha Carteirinha</div>
              <div className="carteirinha-nova">
                <div className="cn-ribbon">
                  <span style={{ color: '#0a2a5e', fontSize: '18px', fontWeight: '900' }}>✚</span>
                </div>
                <div className="cn-header">
                  <div className="cn-logo-nome">FUTURA<span>SAÚDE</span></div>
                  <div className="cn-slogan">Educação e saúde pelo futuro do seu filho</div>
                </div>
                <div className="cn-body">
                  <div className="cn-foto-wrap">
                    <div className="cn-foto" title="Clique para adicionar foto" onClick={() => fileInputRef.current?.click()}>
                      {fotoUrl ? <img src={fotoUrl} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                    </div>
                  </div>
                  <div className="cn-campos">
                    <div className="cn-campo">
                      <div className="cn-campo-label">CPF:</div>
                      <div className="cn-campo-val">456.789.123-00</div>
                    </div>
                    <div className="cn-campos-row">
                      <div className="cn-campo">
                        <div className="cn-campo-label">Data de Nascimento:</div>
                        <div className="cn-campo-val">15/03/2007</div>
                      </div>
                      <div className="cn-campo">
                        <div className="cn-campo-label">Validade:</div>
                        <div className="cn-campo-val" style={{ color: '#f5c842' }}>15/06/2026</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cn-footer-bar">
                  <div className="cn-footer-tipo">Beneficiário</div>
                  <div className="cn-footer-nome">Pedro Carlos Silva</div>
                  <div className="cn-numero-bar">FS-2025-00042 · ATIVO ✓ · Santarém — PA</div>
                </div>
              </div>
                <button className="btn-download" onClick={() => setCurrentPage('carteirinha')}>
                  💳 Ver carteirinha completa
                </button>
              </div>
            </>
          )}

          {/* CARTEIRINHA */}
          {currentPage === 'carteirinha' && (
            <div className="card">
              <div className="card-title">💳 Carteirinha Virtual — Futura Saúde</div>
              <div className="carteirinha-nova">
                <div className="cn-ribbon">
                  <span style={{ color: '#0a2a5e', fontSize: '18px', fontWeight: '900' }}>✚</span>
                </div>
                <div className="cn-header">
                  <div className="cn-logo-nome">FUTURA<span>SAÚDE</span></div>
                  <div className="cn-slogan">Educação e saúde pelo futuro do seu filho</div>
                </div>
                <div className="cn-body">
                  <div className="cn-foto-wrap">
                    <div className="cn-foto" title="Clique para adicionar foto" onClick={() => fileInputRef.current?.click()}>
                      {fotoUrl ? <img src={fotoUrl} alt="foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '👤'}
                    </div>
                  </div>
                  <div className="cn-campos">
                    <div className="cn-campo">
                      <div className="cn-campo-label">CPF:</div>
                      <div className="cn-campo-val">456.789.123-00</div>
                    </div>
                    <div className="cn-campos-row">
                      <div className="cn-campo">
                        <div className="cn-campo-label">Data de Nascimento:</div>
                        <div className="cn-campo-val">15/03/2007</div>
                      </div>
                      <div className="cn-campo">
                        <div className="cn-campo-label">Validade:</div>
                        <div className="cn-campo-val" style={{ color: '#f5c842' }}>15/06/2026</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cn-footer-bar">
                  <div className="cn-footer-tipo">Beneficiário</div>
                  <div className="cn-footer-nome">Pedro Carlos Silva</div>
                  <div className="cn-numero-bar">FS-2025-00042 · ATIVO ✓ · Santarém — PA</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
                <button className="btn-download" onClick={handleBaixarPdf} disabled={gerandoPdf}>
                  {gerandoPdf ? '⏳ Gerando...' : '📄 Baixar PDF'}
                </button>
                <button
                  className="btn-download"
                  style={{ background: '#e8f5ee', color: '#1a5c33', border: '1px solid #a0d4b8' }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingFoto}
                >
                  {uploadingFoto ? '⏳ Enviando...' : '📷 Adicionar foto'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFotoUpload}
                />
              </div>
            </div>
          )}

          {/* CLÍNICAS */}
          {currentPage === 'clinicas' && (
            <div className="card">
              <div className="card-title">🏥 Rede Credenciada — Santarém PA</div>
              <div className="clinica-card">
                <div className="clinica-icon">🦷</div>
                <div style={{ flex: 1 }}>
                  <span className="esp-badge" style={{ background: '#e8f5ee', color: '#1a5c33' }}>Dentista</span>
                  <div className="clinica-nome">Dr. Carlos Mendes</div>
                  <div className="clinica-info">🏥 Clínica OralVida · 📍 Av. Tapajós, 1250 · ⏰ Seg–Sex 8h–18h</div>
                </div>
                <a className="btn-agendar" href="https://wa.me/5593999990001?text=Olá! Sou portador do Cartão Futura Saúde e gostaria de agendar uma consulta." target="_blank">
                  💬 Agendar
                </a>
              </div>
              <div className="clinica-card">
                <div className="clinica-icon">🧠</div>
                <div style={{ flex: 1 }}>
                  <span className="esp-badge" style={{ background: '#eeedfe', color: '#3c3489' }}>Psicóloga</span>
                  <div className="clinica-nome">Dra. Ana Beatriz Lima</div>
                  <div className="clinica-info">🏥 Instituto Mente Saudável · 📍 Rua Siqueira Campos, 380 · ⏰ Seg–Sáb 8h–20h</div>
                </div>
                <a className="btn-agendar" href="https://wa.me/5593999990002?text=Olá! Sou portador do Cartão Futura Saúde e gostaria de agendar uma consulta." target="_blank">
                  💬 Agendar
                </a>
              </div>
              <div className="clinica-card">
                <div className="clinica-icon">👁️</div>
                <div style={{ flex: 1 }}>
                  <span className="esp-badge" style={{ background: '#e6f1fb', color: '#0c447c' }}>Optometrista</span>
                  <div className="clinica-nome">Dr. Roberto Farias</div>
                  <div className="clinica-info">🏥 VisãoClara Ótica · 📍 Trav. Francisco Corrêa, 90 · ⏰ Seg–Sex 9h–17h</div>
                </div>
                <a className="btn-agendar" href="https://wa.me/5593999990003?text=Olá! Sou portador do Cartão Futura Saúde e gostaria de agendar uma avaliação de vista." target="_blank">
                  💬 Agendar
                </a>
              </div>
            </div>
          )}

          {/* AGENDAMENTOS */}
          {currentPage === 'agendamentos' && (
            <div className="card">
              <div className="card-title">📅 Meus Agendamentos</div>
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--cinza)' }}>
                <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
                <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>Nenhum agendamento ainda</div>
                <div style={{ fontSize: '13px' }}>Acesse a rede credenciada e agende sua primeira consulta!</div>
                <button className="btn-download" style={{ marginTop: '16px' }} onClick={() => setCurrentPage('clinicas')}>
                  🏥 Ver clínicas
                </button>
              </div>
            </div>
          )}

          {/* PERFIL */}
          {currentPage === 'perfil' && (
            <div className="card" style={{ maxWidth: '560px' }}>
              <div className="card-title">👤 Meu Perfil</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div><div style={{ fontSize: '11px', color: 'var(--cinza)', marginBottom: '4px', fontWeight: '600' }}>RESPONSÁVEL</div><div style={{ fontWeight: '700', color: 'var(--azul)' }}>João Carlos Silva</div></div>
                  <div><div style={{ fontSize: '11px', color: 'var(--cinza)', marginBottom: '4px', fontWeight: '600' }}>BENEFICIÁRIO</div><div style={{ fontWeight: '700', color: 'var(--azul)' }}>Pedro Carlos Silva</div></div>
                  <div><div style={{ fontSize: '11px', color: 'var(--cinza)', marginBottom: '4px', fontWeight: '600' }}>PLANO ATÉ</div><div style={{ color: '#1a7a4a', fontWeight: '700' }}>15/Jun/2026</div></div>
                  <div><div style={{ fontSize: '11px', color: 'var(--cinza)', marginBottom: '4px', fontWeight: '600' }}>CARTÃO</div><div>FS-2025-00042</div></div>
                </div>
                <div style={{ borderTop: '1px solid #f0eeea', paddingTop: '14px', fontSize: '12px', color: 'var(--cinza)', lineHeight: '1.7' }}>
                  🔒 Seus dados são protegidos pela LGPD (Lei 13.709/2018).
                  <a href="https://wa.me/5593992173231?text=Quero solicitar exclusão dos meus dados - LGPD" style={{ display: 'block', marginTop: '8px', color: '#e53935', fontSize: '12px' }}>
                    Solicitar exclusão dos dados
                  </a>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </>
  );
}
