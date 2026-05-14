'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Filter, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface Pagamento {
  id: string;
  beneficiario_id: string;
  gateway_id: string;
  valor: string;
  status: string;
  metodo: string;
  pago_em?: string | null;
  created_at?: string;
  criado_em?: string;
  beneficiarios?: { nome_completo: string; cidade: string };
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface MetricsState {
  totalPago: number;
  totalPendente: number;
  quantidadeTotal: number;
  quantidadePago: number;
  quantidadePendente: number;
}

const defaultPagination: PaginationState = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};

const defaultMetrics: MetricsState = {
  totalPago: 0,
  totalPendente: 0,
  quantidadeTotal: 0,
  quantidadePago: 0,
  quantidadePendente: 0,
};

export default function FinanceiroAdmin() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [pagination, setPagination] = useState<PaginationState>(defaultPagination);
  const [metrics, setMetrics] = useState<MetricsState>(defaultMetrics);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [errorList, setErrorList] = useState('');
  const [errorMetrics, setErrorMetrics] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('todos');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const buildParams = useCallback((includePagination = false) => {
    const params = new URLSearchParams();
    if (dataInicio) params.set('data_inicio', dataInicio);
    if (dataFim) params.set('data_fim', dataFim);
    if (statusFiltro) params.set('status', statusFiltro);
    if (includePagination) {
      params.set('page', String(page));
      params.set('page_size', String(pageSize));
    }
    return params.toString();
  }, [dataInicio, dataFim, statusFiltro, page, pageSize]);

  const loadList = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    setLoadingList(true);
    setErrorList('');
    try {
      const query = buildParams(true);
      const res = await fetch(`/api/admin/financeiro${query ? `?${query}` : ''}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        setPagamentos(Array.isArray(data.pagamentos) ? data.pagamentos : []);
        setPagination({
          page: Number(data.pagination?.page) || page,
          pageSize: Number(data.pagination?.pageSize) || pageSize,
          totalItems: Number(data.pagination?.totalItems) || 0,
          totalPages: Number(data.pagination?.totalPages) || 1,
          hasNextPage: Boolean(data.pagination?.hasNextPage),
          hasPreviousPage: Boolean(data.pagination?.hasPreviousPage),
        });
      } else {
        const err = await res.json().catch(() => null);
        setPagamentos([]);
        setPagination((current) => ({ ...current, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: current.page > 1 }));
        setErrorList(err?.message || 'Erro ao carregar pagamentos');
      }
    } catch (error) {
      setPagamentos([]);
      setPagination((current) => ({ ...current, totalItems: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: current.page > 1 }));
      if (error instanceof Error && error.name === 'AbortError') {
        setErrorList('A consulta da lista demorou demais. Tente reduzir os filtros ou recarregar a página.');
      } else {
        setErrorList('Erro de conexão ao carregar pagamentos');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoadingList(false);
    }
  }, [buildParams, page, pageSize]);

  const loadMetrics = useCallback(async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    setLoadingMetrics(true);
    setErrorMetrics('');
    try {
      const query = buildParams(false);
      const res = await fetch(`/api/admin/financeiro/metrics${query ? `?${query}` : ''}`, {
        cache: 'no-store',
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        setMetrics({
          totalPago: Number(data.cards?.totalPago) || 0,
          totalPendente: Number(data.cards?.totalPendente) || 0,
          quantidadeTotal: Number(data.cards?.quantidadeTotal) || 0,
          quantidadePago: Number(data.cards?.quantidadePago) || 0,
          quantidadePendente: Number(data.cards?.quantidadePendente) || 0,
        });
      } else {
        const err = await res.json().catch(() => null);
        setMetrics(defaultMetrics);
        setErrorMetrics(err?.message || 'Erro ao carregar métricas do financeiro');
      }
    } catch (error) {
      setMetrics(defaultMetrics);
      if (error instanceof Error && error.name === 'AbortError') {
        setErrorMetrics('As métricas do financeiro demoraram demais. Tente reduzir os filtros ou recarregar a página.');
      } else {
        setErrorMetrics('Erro de conexão ao carregar métricas do financeiro');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoadingMetrics(false);
    }
  }, [buildParams]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  useEffect(() => {
    setPage(1);
  }, [dataInicio, dataFim, statusFiltro, pageSize]);

  const firstItem = pagination.totalItems === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const lastItem = pagination.totalItems === 0 ? 0 : Math.min(pagination.page * pagination.pageSize, pagination.totalItems);

  return (
    <>
      {(errorList || errorMetrics) && (
        <div className="mb-4 space-y-2">
          {errorList && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex justify-between items-center">
              <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorList}</span>
              <button onClick={() => setErrorList('')} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
            </div>
          )}
          {errorMetrics && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex justify-between items-center">
              <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{errorMetrics}</span>
              <button onClick={() => setErrorMetrics('')} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <p className="text-green-700 font-semibold">Total Recebido</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {metrics.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{metrics.quantidadePago} pagamentos</p>
          {loadingMetrics && <p className="text-xs text-gray-400 mt-2">Atualizando métricas...</p>}
        </div>
        <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-200 p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-700 font-semibold">Aguardando</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {metrics.totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{metrics.quantidadePendente} pendentes</p>
          {loadingMetrics && <p className="text-xs text-gray-400 mt-2">Atualizando métricas...</p>}
        </div>
        <div className="bg-[#f5c842]/10 rounded-2xl border-2 border-[#f5c842]/40 p-6">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-[#0a2a5e]" />
            <p className="text-[#0a2a5e] font-semibold">Total Geral</p>
          </div>
          <p className="text-3xl font-bold text-[#0a2a5e]">
            R$ {(metrics.totalPago + metrics.totalPendente).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">{metrics.quantidadeTotal} transações</p>
          {loadingMetrics && <p className="text-xs text-gray-400 mt-2">Atualizando métricas...</p>}
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
              <option value="reembolsado">Reembolsado</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Itens por página</label>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none text-sm"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <button
            onClick={() => {
              setDataInicio('');
              setDataFim('');
              setStatusFiltro('todos');
              setPage(1);
              setPageSize(10);
            }}
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
              {loadingList ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Carregando pagamentos...
                  </td>
                </tr>
              ) : pagamentos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
                        : p.criado_em
                          ? new Date(p.criado_em).toLocaleDateString('pt-BR')
                          : p.created_at
                            ? new Date(p.created_at).toLocaleDateString('pt-BR')
                            : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        p.status === 'pago' ? 'bg-green-100 text-green-700' :
                        p.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                        p.status === 'reembolsado' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {p.status === 'pago'
                          ? 'Pago'
                          : p.status === 'pendente'
                            ? 'Pendente'
                            : p.status === 'reembolsado'
                              ? 'Reembolsado'
                              : p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Mostrando {firstItem}–{lastItem} de {pagination.totalItems}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(current - 1, 1))}
              disabled={!pagination.hasPreviousPage || loadingList}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0a2a5e] hover:text-[#0a2a5e]"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-sm font-semibold text-[#0a2a5e]">
              Página {pagination.page} de {pagination.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((current) => current + 1)}
              disabled={!pagination.hasNextPage || loadingList}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#0a2a5e] hover:text-[#0a2a5e]"
            >
              Próxima
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
