'use client';

import { useState } from 'react';

export default function FinanceiroAdmin() {
  const [transactions] = useState([
    { id: 1, description: 'Mensalidade - João Silva', value: 5000, status: 'Sucesso', method: 'Cartão de Crédito', date: '2025-04-02', type: 'receita' },
    { id: 2, description: 'Pagamento Clínica Sorriso', value: -2200, status: 'Sucesso', method: 'Transferência', date: '2025-04-05', type: 'despesa' },
    { id: 3, description: 'Mensalidade - Maria Oliveira', value: 3200, status: 'Pendente', method: 'PIX', date: '2025-04-08', type: 'receita' },
  ]);

  const receitas = transactions.filter((t) => t.value > 0).reduce((s, t) => s + t.value, 0);
  const despesas = transactions.filter((t) => t.value < 0).reduce((s, t) => s + Math.abs(t.value), 0);
  const saldo = receitas - despesas;

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6">
          <p className="text-green-700 font-semibold mb-2">Receitas</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">R$ {receitas.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
          <p className="text-red-700 font-semibold mb-2">Despesas</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">R$ {despesas.toLocaleString('pt-BR')}</p>
        </div>
        <div className={`rounded-2xl border-2 p-6 ${saldo >= 0 ? 'bg-[#f5c842]/10 border-[#f5c842]/40' : 'bg-red-50 border-red-200'}`}>
          <p className={`font-semibold mb-2 ${saldo >= 0 ? 'text-[#0a2a5e]' : 'text-red-700'}`}>Saldo</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">R$ {saldo.toLocaleString('pt-BR')}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Descrição</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Valor</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Método</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Data</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#0a2a5e]">{t.description}</td>
                  <td className={`px-6 py-4 font-mono font-bold ${t.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {t.value >= 0 ? '+' : ''}R$ {Math.abs(t.value).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{t.method}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{t.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.status === 'Sucesso' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
