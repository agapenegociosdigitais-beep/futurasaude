'use client';

import { useState } from 'react';

export default function PagamentoPage() {
  const [metodo, setMetodo] = useState<'pix' | 'cartao'>('pix');

  return (
    <>
      <style>{`
        :root { --azul: #0a2a5e; --dourado: #f5c842; --cinza: #8a8070; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; background: #f0f2f8; }
        .page-container { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .card-wrapper { background: white; border-radius: 24px; padding: 48px; max-width: 600px; box-shadow: 0 20px 60px rgba(0,0,0,0.08); }
        .title { font-size: 28px; font-weight: 800; color: var(--azul); margin-bottom: 8px; }
        .tabs { display: flex; gap: 12px; margin-bottom: 32px; border-bottom: 2px solid #f0eeea; }
        .tab { flex: 1; padding: 14px 16px; border: none; background: none; cursor: pointer; color: var(--cinza); border-bottom: 3px solid transparent; transition: all .3s; }
        .tab.ativo { color: var(--azul); border-bottom-color: var(--dourado); }
        .pix-code { background: white; border: 2px solid var(--dourado); padding: 20px; border-radius: 12px; margin: 16px 0; font-size: 12px; }
        .btn-copy { background: var(--dourado); color: white; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; }
      `}</style>

      <div className="page-container">
        <div className="card-wrapper">
          <div className="title">Realizar Pagamento</div>
          <div className="tabs">
            <button className={`tab ${metodo === 'pix' ? 'ativo' : ''}`} onClick={() => setMetodo('pix')}>💳 PIX</button>
            <button className={`tab ${metodo === 'cartao' ? 'ativo' : ''}`} onClick={() => setMetodo('cartao')}>💰 Cartão</button>
          </div>

          {metodo === 'pix' ? (
            <div>
              <div style={{ textAlign: 'center', padding: '32px 24px', background: '#e6f1fb', borderRadius: '16px' }}>
                <div style={{ fontSize: '12px', marginBottom: '8px', color: 'var(--cinza)' }}>Código PIX para Cópia</div>
                <div className="pix-code">00020126580014br.gov.bcb.pix...</div>
                <button className="btn-copy">📋 Copiar Código</button>
              </div>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); alert('Pagamento processado!'); }}>
              <input placeholder="Número do Cartão" required style={{ width: '100%', padding: '14px', marginBottom: '16px', border: '1px solid #e8e4de', borderRadius: '10px' }} />
              <input placeholder="Titular" required style={{ width: '100%', padding: '14px', marginBottom: '16px', border: '1px solid #e8e4de', borderRadius: '10px' }} />
              <button type="submit" style={{ width: '100%', padding: '14px', background: 'var(--azul)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}>Processar</button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
