'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function PagamentoContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const metodo = 'pix';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagamentoData, setPagamentoData] = useState<any>(null);
  const [verificandoPagamento, setVerificandoPagamento] = useState(false);
  const [valorPlano, setValorPlano] = useState('99,90');
  const [confirmado, setConfirmado] = useState(false);

  const beneficiarioId = searchParams.get('beneficiario_id');

  useEffect(() => {
    fetch('/api/config/publico')
      .then(r => r.json())
      .then(d => {
        if (d.valor_mensalidade) {
          const num = parseFloat(d.valor_mensalidade);
          if (!isNaN(num)) setValorPlano(num.toFixed(2).replace('.', ','));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!beneficiarioId) {
      setError('ID do beneficiário não encontrado');
    }
  }, [beneficiarioId]);

  const criarPagamento = async () => {
    if (!beneficiarioId) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ beneficiario_id: beneficiarioId, metodo }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao criar pagamento');
      }

      setPagamentoData(data);

      if (metodo === 'pix') {
        iniciarVerificacaoPagamento(data.pagamento_id);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const iniciarVerificacaoPagamento = (pagamentoId: string) => {
    setVerificandoPagamento(true);

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/pagamento/status/${pagamentoId}`);
        const data = await response.json();

        if (data.status === 'pago') {
          clearInterval(interval);
          setVerificandoPagamento(false);
          setConfirmado(true);
          setTimeout(() => router.push('/login'), 2500);
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
      }
    }, 5000);

    setTimeout(() => {
      clearInterval(interval);
      setVerificandoPagamento(false);
    }, 600000);
  };

  const copiarCodigoPix = () => {
    if (pagamentoData?.pixCopyPaste) {
      navigator.clipboard.writeText(pagamentoData.pixCopyPaste);
      // feedback visual — não usar alert()
    }
  };

  return (
    <>
      <style>{`
        :root { --azul: #0a2a5e; --dourado: #f5c842; --cinza: #8a8070; --verde: #25d366; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; background: #f0f2f8; }
        .page-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .card-wrapper { background: white; border-radius: 24px; padding: 48px; max-width: 600px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        .title { font-size: 28px; font-weight: 800; color: var(--azul); margin-bottom: 8px; }
        .subtitle { font-size: 14px; color: var(--cinza); margin-bottom: 24px; }
        .price { font-size: 36px; font-weight: 800; color: var(--azul); text-align: center; margin: 24px 0; }
        .price span { font-size: 16px; color: var(--cinza); }
        .pix-container { text-align: center; padding: 24px; background: #f8f9fa; border-radius: 16px; }
        .qr-code { width: 250px; height: 250px; margin: 0 auto 16px; background: white; border: 2px solid var(--dourado); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .qr-code img { max-width: 100%; max-height: 100%; }
        .pix-code { background: white; border: 2px solid var(--dourado); padding: 16px; border-radius: 12px; margin: 16px 0; font-size: 11px; word-break: break-all; font-family: monospace; }
        .btn-copy { background: var(--dourado); color: white; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 14px; transition: all .2s; }
        .btn-copy:hover { background: #e0b535; }
        .btn-principal { width: 100%; padding: 15px; background: var(--azul); color: white; font-family: 'Sora', sans-serif; font-weight: 700; font-size: 15px; border: none; border-radius: 12px; cursor: pointer; transition: all .2s; margin-top: 16px; }
        .btn-principal:hover { background: #1a4a8a; }
        .btn-principal:disabled { opacity: 0.5; cursor: not-allowed; }
        .error { background: #fee; border: 1px solid #fcc; color: #c33; padding: 12px; border-radius: 8px; margin-bottom: 16px; font-size: 13px; }
        .verificando { background: #e6f7ff; border: 1px solid #91d5ff; color: #0050b3; padding: 12px; border-radius: 8px; margin-top: 16px; font-size: 13px; text-align: center; }
        .loading-spinner { display: inline-block; width: 16px; height: 16px; border: 2px solid #fff; border-top-color: transparent; border-radius: 50%; animation: spin 0.6s linear infinite; margin-right: 8px; vertical-align: middle; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-container">
        <div className="card-wrapper">
          <div className="title">Realizar Pagamento</div>
          <div className="subtitle">Cartão Futura Saúde - Plano Anual</div>

          <div className="price">
            R$ {valorPlano} <span>/ano</span>
          </div>

          {confirmado && (
            <div style={{ background: '#e8f5ee', border: '2px solid #a0d4b8', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center', color: '#1a5c33', fontWeight: '700' }}>
              ✅ Pagamento confirmado! Redirecionando para o login...
            </div>
          )}
          {error && <div className="error">{error}</div>}

          {!pagamentoData ? (
            <button
              className="btn-principal"
              onClick={criarPagamento}
              disabled={loading || !beneficiarioId}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Gerando pagamento...
                </>
              ) : (
                'Pagar com PIX'
              )}
            </button>
          ) : (
            <>
              {pagamentoData.pixQrCode && (
                <div className="pix-container">
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--azul)', marginBottom: '16px' }}>
                    Escaneie o QR Code ou copie o código PIX
                  </div>

                  <div className="qr-code">
                    <img
                      src={pagamentoData.pixQrCode?.startsWith('data:') ? pagamentoData.pixQrCode : `data:image/png;base64,${pagamentoData.pixQrCode}`}
                      alt="QR Code PIX"
                    />
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--cinza)', marginBottom: '8px' }}>
                    Código PIX Copia e Cola
                  </div>
                  <div className="pix-code">{pagamentoData.pixCopyPaste}</div>

                  <button className="btn-copy" onClick={copiarCodigoPix}>
                    Copiar Código PIX
                  </button>

                  {verificandoPagamento && (
                    <div className="verificando">
                      Aguardando confirmação do pagamento...
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
