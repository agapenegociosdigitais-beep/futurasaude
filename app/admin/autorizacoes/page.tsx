'use client';

import { useEffect, useState } from 'react';

const STATUS_OPTIONS = ['todos', 'pendente', 'aprovada', 'negada', 'utilizada', 'expirada', 'cancelada'];
const TIPO_OPTIONS = ['todos', 'consulta', 'exame', 'procedimento'];

export default function AdminAutorizacoesPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('todos');
  const [tipo, setTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams();
      if (status !== 'todos') params.set('status', status);
      if (tipo !== 'todos') params.set('tipo', tipo);
      if (busca.trim()) params.set('busca', busca.trim());

      const res = await fetch(`/api/admin/autorizacoes?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erro ao carregar autorizações');
        return;
      }

      setList(Array.isArray(data) ? data : []);
    } catch {
      setError('Erro de conexão ao carregar autorizações');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [status, tipo]);

  async function updateStatus(id: string, nextStatus: 'cancelada' | 'utilizada') {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/autorizacoes/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erro ao atualizar autorização');
        return;
      }
      await load();
    } catch {
      setError('Erro de conexão ao atualizar autorização');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por protocolo ou exame"
          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none min-w-[240px]"
        />
        <button
          onClick={load}
          className="px-4 py-3 bg-[#0a2a5e] text-white rounded-lg font-semibold hover:bg-[#0a2a5e]/90"
        >
          Buscar
        </button>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
        >
          {STATUS_OPTIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
        >
          {TIPO_OPTIONS.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#0a2a5e]">Protocolo</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#0a2a5e]">Beneficiário</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#0a2a5e]">Tipo</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#0a2a5e]">Especialidade / exame</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#0a2a5e]">Status</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-[#0a2a5e]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Carregando autorizações...</td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-500">Nenhuma autorização encontrada</td>
                </tr>
              ) : (
                list.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="px-4 py-3 text-sm font-semibold text-[#0a2a5e]">{item.protocolo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.beneficiarios?.nome_completo || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{item.tipo}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.especialidade_ou_exame}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.status}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => updateStatus(item.id, 'utilizada')}
                          disabled={updatingId === item.id}
                          className="px-3 py-2 rounded-lg bg-green-100 text-green-700 font-semibold disabled:opacity-50"
                        >
                          Utilizada
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, 'cancelada')}
                          disabled={updatingId === item.id}
                          className="px-3 py-2 rounded-lg bg-red-100 text-red-700 font-semibold disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
