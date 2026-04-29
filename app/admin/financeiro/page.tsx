'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Filter, TrendingUp } from 'lucide-react';

export default function FinanceiroAdmin() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/admin" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Relatório Financeiro
        </h1>

        {/* KPIs */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Receita Total', value: 'R$ 283.650', change: '+15%' },
            { label: 'Pagamentos Processados', value: '2.847', change: '+12%' },
            { label: 'Valor Médio', value: 'R$ 99,71', change: '+2%' },
            { label: 'Taxa de Sucesso', value: '98.2%', change: '+0.8%' },
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-xl border-2 border-gray-300 p-6">
              <p className="text-gray-600 text-sm mb-2">{kpi.label}</p>
              <p className="text-2xl font-bold text-[#0a2a5e] mb-2">{kpi.value}</p>
              <p className="text-xs text-green-600 font-semibold">{kpi.change}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border-2 border-gray-300 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="date"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
            <input
              type="date"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
            <button className="px-6 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtrar
            </button>
            <button className="px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-semibold hover:bg-[#f0b820] transition flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-xl border-2 border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-300">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Data</th>
                  <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Beneficiário</th>
                  <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Método</th>
                  <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Gateway</th>
                  <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Valor</th>
                  <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    date: '18/04/2025',
                    beneficiary: 'João Silva',
                    method: 'PIX',
                    gateway: 'Asaas',
                    value: 'R$ 99,90',
                    status: 'Pago',
                  },
                  {
                    date: '18/04/2025',
                    beneficiary: 'Maria Santos',
                    method: 'Cartão',
                    gateway: 'MercadoPago',
                    value: 'R$ 99,90',
                    status: 'Pago',
                  },
                  {
                    date: '17/04/2025',
                    beneficiary: 'Carlos Costa',
                    method: 'PIX',
                    gateway: 'Asaas',
                    value: 'R$ 99,90',
                    status: 'Pendente',
                  },
                ].map((tx, i) => (
                  <tr key={i} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{tx.date}</td>
                    <td className="px-6 py-4 font-semibold text-[#0a2a5e]">{tx.beneficiary}</td>
                    <td className="px-6 py-4 text-gray-700">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {tx.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{tx.gateway}</td>
                    <td className="px-6 py-4 font-bold text-[#0a2a5e]">{tx.value}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          tx.status === 'Pago'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
