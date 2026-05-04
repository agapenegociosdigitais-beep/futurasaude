'use client';

import { useState } from 'react';

export default function TestePagamento() {
  const [beneficiarioId, setBeneficiarioId] = useState('');
  const [metodo, setMetodo] = useState<'pix' | 'cartao_credito'>('pix');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testar = async () => {
    setLoading(true);
    setResultado(null);

    try {
      const res = await fetch('/api/pagamento/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beneficiario_id: beneficiarioId,
          metodo,
        }),
      });

      const data = await res.json();
      setResultado({ status: res.status, data });
    } catch (error: any) {
      setResultado({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Teste Pagamento Asaas</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Beneficiário ID:
          <input
            type="text"
            value={beneficiarioId}
            onChange={(e) => setBeneficiarioId(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
            placeholder="UUID do beneficiário"
          />
        </label>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Método:
          <select
            value={metodo}
            onChange={(e) => setMetodo(e.target.value as any)}
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          >
            <option value="pix">PIX</option>
            <option value="cartao_credito">Cartão de Crédito</option>
          </select>
        </label>
      </div>

      <button
        onClick={testar}
        disabled={loading || !beneficiarioId}
        style={{
          padding: '0.75rem 1.5rem',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Testando...' : 'Criar Pagamento'}
      </button>

      {resultado && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '4px' }}>
          <h3>Resultado:</h3>
          <pre style={{ overflow: 'auto' }}>
            {JSON.stringify(resultado, null, 2)}
          </pre>

          {resultado.data?.pixQrCode && (
            <div style={{ marginTop: '1rem' }}>
              <h4>QR Code PIX:</h4>
              <img src={resultado.data.pixQrCode} alt="QR Code" style={{ maxWidth: '300px' }} />
              <p style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>
                {resultado.data.pixCopyPaste}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
