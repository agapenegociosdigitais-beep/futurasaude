'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PagamentoPendentePage() {
  const router = useRouter();
  const [beneficiarioId, setBeneficiarioId] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    async function verificar() {
      try {
        const res = await fetch('/api/beneficiario/perfil');
        if (!res.ok) {
          setVerificando(false);
          return;
        }
        const data = await res.json();
        const benId = data.beneficiario?.id;
        setBeneficiarioId(benId || null);

        if (data.beneficiario?.status === 'ativo') {
          router.replace('/dashboard');
          return;
        }

        if (benId) {
          const pagRes = await fetch(`/api/pagamento/pendente/${benId}`);
          if (pagRes.ok) {
            const pag = await pagRes.json();
            if (pag.pagamento_id) {
              const statusRes = await fetch(`/api/pagamento/status/${pag.pagamento_id}`);
              if (statusRes.ok) {
                const statusData = await statusRes.json();
                if (statusData.status === 'pago') {
                  router.replace('/dashboard');
                  return;
                }
              }
            }
          }
        }
      } catch {}
      setVerificando(false);
    }
    verificar();
  }, [router]);

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Verificando pagamento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagamento Pendente</h1>
        <p className="text-gray-600 mb-6">
          Seu cadastro foi realizado com sucesso, mas seu pagamento ainda está sendo processado.
          Assim que for confirmado, você terá acesso completo ao dashboard.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => {
              if (beneficiarioId) {
                router.push(`/pagamento?beneficiario_id=${beneficiarioId}`);
              } else {
                router.push('/pagamento');
              }
            }}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition font-medium"
          >
            Ir para Pagamento
          </button>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
