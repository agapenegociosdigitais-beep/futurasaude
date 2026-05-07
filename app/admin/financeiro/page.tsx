'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Filter, Download } from 'lucide-react';

interface Pagamento {
  id: string;
  beneficiario_id: string;
  valor: string;
  status: string;
  metodo: string;
  pago_em: string;
  created_at: string;
  beneficiario?: { nome_completo: string };
}

export default function FinanceiroAdmin() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.set('data_inicio', dataInicio);
      if (dataFim) params.set('data_fim', dataFim);

      const res = await fetch(`/api/admin/financeiro?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPagamentos(data.pagamentos || []);
        setTotal(data.total || 0);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim]);

  useEffect(() => { load(); }, [load]);

  const despesas = 0;
  const saldo = total - despesas;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#0a2a5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-semibold">Receitas</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <p className="text-red-700 font-semibold">Despesas</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {despesas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className={`rounded-2xl border-2 p-6 ${saldo >= 0 ? 'bg-[#f5c842]/10 border-[#f5c842]/40' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-[#0a2a5e]" />
            <p className={`font-semibold ${saldo >= 0 ? 'text-[#0a2a5e]' : 'text-red-700'}`}>Saldo</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex items-center gap-2 text-[#0a2a5e] font-bold">
            <Filter className="w-5 h-5" />
            <span>Filtros</span>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Data Início</label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Data Fim</label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none text-sm"
            />
          </div>
          <button
            onClick={() => { setDataInicio(''); setDataFim(''); }}
            className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-[#0a2a5e] transition"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Beneficiário</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Valor</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Método</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Data</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Status</th>
              </tr>
            </thead>
            <tbody>
              {pagamentos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Nenhum pagamento encontrado
                  </td>
                </tr>
              ) : (
                pagamentos.map((p) => (
                  <tr key={p.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-[#0a2a5e]">
                      {p.beneficiario?.nome_completo || '—'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-green-600">
                      R$ {parseFloat(p.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {p.metodo || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-700 text-sm">
                      {p.pago_em
                        ? new Date(p.pago_em).toLocaleDateString('pt-BR')
                        : new Date(p.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'pago' ? 'bg-green-100 text-green-700' :
                        p.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status === 'pago' ? 'Pago' : p.status === 'pendente' ? 'Pendente' : p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
