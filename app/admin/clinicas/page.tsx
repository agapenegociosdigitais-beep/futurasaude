'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Star, Building2 } from 'lucide-react';

interface Clinica {
  id: string;
  nome: string;
  especialidade: string;
  profissional: string;
  cidade: string;
  telefone: string;
  ativa: boolean;
  created_at: string;
}

export default function ClinicasAdmin() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Clinica | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    especialidade: '',
    profissional: '',
    cidade: '',
    telefone: '',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clinicas');
      if (res.ok) setClinicas(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nome: '', especialidade: '', profissional: '', cidade: '', telefone: '' });
    setShowModal(true);
  };

  const openEdit = (c: Clinica) => {
    setEditing(c);
    setForm({
      nome: c.nome,
      especialidade: c.especialidade || '',
      profissional: c.profissional || '',
      cidade: c.cidade || '',
      telefone: c.telefone || '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/clinicas/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const updated = await res.json();
          setClinicas((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
        }
      } else {
        const res = await fetch('/api/admin/clinicas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setClinicas((prev) => [...prev, created]);
        }
      }
      setShowModal(false);
    } catch {} finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return;
    try {
      const res = await fetch(`/api/admin/clinicas/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setClinicas((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {}
  };

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
          <Plus className="w-5 h-5" />
          Nova Clínica
        </button>
      </div>

      <div className="space-y-4">
        {clinicas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma clínica cadastrada</p>
          </div>
        ) : (
          clinicas.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#f5c842] transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#0a2a5e]">{clinic.nome}</h3>
                  <p className="text-sm text-gray-600">
                    {clinic.especialidade}{clinic.profissional ? ` • ${clinic.profissional}` : ''}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  clinic.ativa ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {clinic.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Cidade</p>
                  <p className="font-semibold text-[#0a2a5e]">{clinic.cidade || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Telefone</p>
                  <p className="font-mono text-sm font-semibold text-[#0a2a5e]">{clinic.telefone || '—'}</p>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => openEdit(clinic)}
                  className="px-4 py-2 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(clinic.id)}
                  className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Deletar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">
              {editing ? 'Editar Clínica' : 'Nova Clínica'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="Nome da clínica"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Especialidade</label>
                  <input
                    type="text"
                    value={form.especialidade}
                    onChange={(e) => setForm({ ...form, especialidade: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="Ex: Dentista"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Profissional</label>
                  <input
                    type="text"
                    value={form.profissional}
                    onChange={(e) => setForm({ ...form, profissional: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="Dr(a). Nome"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cidade</label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="Ex: Santarém"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
                  <input
                    type="text"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="(93) 3222-0000"
                  />
                </div>
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
                disabled={saving || !form.nome.trim()}
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
