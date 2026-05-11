'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Filter, AlertCircle } from 'lucide-react';

interface Pagamento {
  id: string;
  beneficiario_id: string;
  gateway_id: string;
  valor: string;
  status: string;
  metodo: string;
  pago_em: string;
  created_at: string;
  beneficiarios?: { nome_completo: string; cidade: string };
}

export default function FinanceiroAdmin() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPendente, setTotalPendente] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.set('data_inicio', dataInicio);
      if (dataFim) params.set('data_fim', dataFim);
      if (statusFiltro) params.set('status', statusFiltro);

      const res = await fetch(`/api/admin/financeiro?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setPagamentos(data.pagamentos || []);
        setTotal(data.total || 0);
        setTotalPendente(data.totalPendente || 0);
      } else {
        const err = await res.json();
        setError(err.message || 'Erro ao carregar financeiro');
      }
    } catch {
      setError('Erro de conexão ao carregar financeiro');
    } finally {
      setLoading(false);
    }
  }, [dataInicio, dataFim, statusFiltro]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#0a2a5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex justify-between items-center">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-semibold">Total Recebido</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{pagamentos.filter(p => p.status === 'pago').length} pagamentos</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-700 font-semibold">Aguardando</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{pagamentos.filter(p => p.status === 'pendente').length} pendentes</p>
        </div>
        <div className="bg-[#f5c842]/10 rounded-2xl border-2 border-[#f5c842]/40 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-[#0a2a5e]" />
            <p className="text-[#0a2a5e] font-semibold">Total Geral</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {(total + totalPendente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{pagamentos.length} transações</p>
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
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none text-sm"
            >
              <option value="todos">Todos</option>
              <option value="pago">Pago</option>
              <option value="pendente">Pendente</option>
              <option value="falhou">Falhou</option>
            </select>
          </div>
          <button
            onClick={() => { setDataInicio(''); setDataFim(''); setStatusFiltro('todos'); }}
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
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Cidade</th>
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
                      {p.beneficiarios?.nome_completo || '—'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {p.beneficiarios?.cidade || '—'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-green-600">
                      R$ {(parseFloat(p.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
