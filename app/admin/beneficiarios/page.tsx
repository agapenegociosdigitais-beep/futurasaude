'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Pencil, Trash2, CheckCircle, XCircle, Lock, UserPlus } from 'lucide-react';

interface Beneficiario {
  id: string;
  nome_completo: string;
  cpf: string;
  email: string;
  telefone: string;
  status: string;
  created_at: string;
}

export default function BeneficiariosAdmin() {
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Beneficiario | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome_completo: '',
    cpf: '',
    email: '',
    telefone: '',
  });

  const loadBeneficiarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/beneficiarios?${params}`);
      if (res.ok) {
        const data = await res.json();
        setBeneficiarios(data);
      }
    } catch {} finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadBeneficiarios();
  }, [loadBeneficiarios]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nome_completo: '', cpf: '', email: '', telefone: '' });
    setShowModal(true);
  };

  const openEdit = (b: Beneficiario) => {
    setEditing(b);
    setForm({
      nome_completo: b.nome_completo || '',
      cpf: b.cpf || '',
      email: b.email || '',
      telefone: b.telefone || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nome_completo.trim() || !form.cpf.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/beneficiarios/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setBeneficiarios((prev) => prev.map((b) => (b.id === editing.id ? updated : b)));
        }
      } else {
        const res = await fetch('/api/admin/beneficiarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, status: 'pendente' }),
        });
        if (res.ok) {
          const created = await res.json();
          setBeneficiarios((prev) => [...prev, created]);
        }
      }
      setShowModal(false);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este beneficiário?')) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/beneficiarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBeneficiarios((prev) => prev.filter((b) => b.id !== id));
      }
    } catch {} finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/beneficiarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBeneficiarios((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
        );
      }
    } catch {} finally {
      setActionLoading(null);
    }
  };

  const filtered = beneficiarios.filter(
    (b) =>
      b.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.cpf?.includes(searchTerm) ||
      b.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ativos = beneficiarios.filter((b) => b.status === 'ativo').length;
  const pendentes = beneficiarios.filter((b) => b.status === 'pendente').length;
  const inativos = beneficiarios.filter((b) => b.status === 'inativo').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#0a2a5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <button
          onClick={openCreate}
          className="px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Novo Beneficiário
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-6 py-3 border-2 rounded-lg font-semibold transition flex items-center gap-2 ${showFilters ? 'border-[#f5c842] bg-[#f5c842]/10 text-[#0a2a5e]' : 'border-gray-300 text-[#0a2a5e] hover:bg-gray-50'}`}
          >
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 flex flex-wrap gap-2">
            {['', 'ativo', 'pendente', 'inativo'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                  statusFilter === status
                    ? 'bg-[#0a2a5e] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === '' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Nome</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">CPF</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Email</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Telefone</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Status</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Nenhum beneficiário encontrado
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold text-[#0a2a5e]">{b.nome_completo}</td>
                    <td className="px-6 py-4 text-gray-700 font-mono text-sm">{b.cpf}</td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{b.email}</td>
                    <td className="px-6 py-4 text-gray-700 text-sm">{b.telefone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        b.status === 'ativo' ? 'bg-green-100 text-green-700' :
                        b.status === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => openEdit(b)}
                          className="p-2 hover:bg-blue-100 rounded-lg transition"
                          title="Editar"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>
                        {b.status === 'pendente' && (
                          <button
                            onClick={() => updateStatus(b.id, 'ativo')}
                            disabled={actionLoading === b.id}
                            className="p-2 hover:bg-green-100 rounded-lg transition disabled:opacity-50"
                            title="Aprovar"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </button>
                        )}
                        {b.status === 'ativo' && (
                          <button
                            onClick={() => updateStatus(b.id, 'inativo')}
                            disabled={actionLoading === b.id}
                            className="p-2 hover:bg-yellow-100 rounded-lg transition disabled:opacity-50"
                            title="Suspender"
                          >
                            <Lock className="w-5 h-5 text-yellow-600" />
                          </button>
                        )}
                        {b.status === 'inativo' && (
                          <button
                            onClick={() => updateStatus(b.id, 'ativo')}
                            disabled={actionLoading === b.id}
                            className="p-2 hover:bg-green-100 rounded-lg transition disabled:opacity-50"
                            title="Reativar"
                          >
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(b.id)}
                          disabled={actionLoading === b.id}
                          className="p-2 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6">
          <p className="text-green-700 font-semibold mb-2">Ativos</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">{ativos}</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-200 p-6">
          <p className="text-yellow-700 font-semibold mb-2">Pendentes</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">{pendentes}</p>
        </div>
        <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-6">
          <p className="text-red-700 font-semibold mb-2">Inativos</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">{inativos}</p>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-[#0a2a5e] mb-4 flex items-center gap-2">
              {editing ? <Pencil className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {editing ? 'Editar Beneficiário' : 'Novo Beneficiário'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  value={form.nome_completo}
                  onChange={(e) => setForm({ ...form, nome_completo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">CPF *</label>
                <input
                  type="text"
                  value={form.cpf}
                  onChange={(e) => setForm({ ...form, cpf: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none font-mono"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
                <input
                  type="text"
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="(93) 99999-9999"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.nome_completo.trim() || !form.cpf.trim()}
                className="flex-1 px-4 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
