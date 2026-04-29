'use client';

import Link from 'next/link';
import { ArrowLeft, Play, History } from 'lucide-react';
import { useState } from 'react';

export default function SorteioAdmin() {
  const [realizando, setRealizando] = useState(false);

  const handleRealizarSorteio = async () => {
    setRealizando(true);
    // Simular API call
    setTimeout(() => setRealizando(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/admin" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Sistema de Sorteios
        </h1>

        {/* Realizar Sorteio */}
        <div className="bg-white rounded-xl border-2 border-gray-300 p-8 mb-8">
          <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
            Realizar Novo Sorteio
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                Número de Ganhadores
              </label>
              <input
                type="number"
                defaultValue="3"
                min="1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                Descrição do Prêmio
              </label>
              <textarea
                defaultValue="Bônus de R$ 100 em créditos de saúde"
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none font-sora"
              />
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
              <p className="text-blue-900 text-sm">
                <strong>Avisos:</strong>
                <br />• Apenas beneficiários com plano ativo participarão
                <br />• O sorteio é aleatório e auditável
                <br />• Os ganhadores serão notificados por email e WhatsApp
              </p>
            </div>

            <button
              onClick={handleRealizarSorteio}
              disabled={realizando}
              className="w-full px-6 py-4 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-bold text-lg hover:bg-[#f0b820] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              {realizando ? 'Realizando sorteio...' : 'Realizar Sorteio Agora'}
            </button>
          </div>
        </div>

        {/* Histórico */}
        <div className="bg-white rounded-xl border-2 border-gray-300 p-8">
          <div className="flex items-center gap-3 mb-6">
            <History className="w-6 h-6 text-[#f5c842]" />
            <h2 className="text-2xl font-bold text-[#0a2a5e] font-lora">
              Histórico de Sorteios
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                date: '15/04/2025',
                time: '14:30',
                ganhadores: 3,
                premio: 'Bônus de R$ 100',
              },
              {
                date: '10/04/2025',
                time: '10:00',
                ganhadores: 5,
                premio: 'Consulta Grátis',
              },
              {
                date: '05/04/2025',
                time: '09:00',
                ganhadores: 2,
                premio: 'Bônus de R$ 50',
              },
            ].map((sorteio, i) => (
              <div
                key={i}
                className="border-2 border-gray-300 rounded-lg p-4 hover:border-[#f5c842] transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-[#0a2a5e]">{sorteio.premio}</p>
                    <p className="text-sm text-gray-600">
                      {sorteio.date} às {sorteio.time}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    {sorteio.ganhadores} ganhadores
                  </span>
                </div>
                <button className="text-[#f5c842] font-semibold hover:underline text-sm">
                  Ver detalhes →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
