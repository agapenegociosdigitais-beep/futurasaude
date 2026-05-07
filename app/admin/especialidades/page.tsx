'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Especialidade {
  id: string;
  nome: string;
  icone: string;
  ativa: boolean;
  created_at: string;
}

export default function EspecialidadesAdmin() {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Especialidade | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ nome: '', icone: '🏥' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/especialidades');
      if (res.ok) setEspecialidades(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({ nome: '', icone: '🏥' });
    setShowModal(true);
  };

  const openEdit = (esp: Especialidade) => {
    setEditing(esp);
    setForm({ nome: esp.nome, icone: esp.icone || '🏥' });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/admin/especialidades/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form }),
        });
        if (res.ok) {
          const updated = await res.json();
          setEspecialidades((prev) => prev.map((e) => (e.id === editing.id ? updated : e)));
        }
      } else {
        const res = await fetch('/api/admin/especialidades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          const created = await res.json();
          setEspecialidades((prev) => [...prev, created]);
        }
      }
      setShowModal(false);
    } catch {} finally {
      setSaving(false);
    }
  };

  const toggleAtiva = async (esp: Especialidade) => {
    try {
      const res = await fetch(`/api/admin/especialidades/${esp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativa: !esp.ativa }),
      });
      if (res.ok) {
        setEspecialidades((prev) =>
          prev.map((e) => (e.id === esp.id ? { ...e, ativa: !e.ativa } : e))
        );
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
          Nova Especialidade
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {especialidades.map((esp) => (
          <div key={esp.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#f5c842] transition">
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{esp.icone || '🏥'}</div>
              <button
                onClick={() => toggleAtiva(esp)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                  esp.ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {esp.ativa ? 'Ativa' : 'Inativa'}
              </button>
            </div>
            <h3 className="text-lg font-bold text-[#0a2a5e] mb-4">{esp.nome}</h3>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => openEdit(esp)}
                className="p-2 border-2 border-gray-300 text-[#0a2a5e] rounded-lg hover:bg-gray-50 transition"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => toggleAtiva(esp)}
                className="p-2 border-2 border-gray-300 text-red-500 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {especialidades.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            Nenhuma especialidade cadastrada
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">
              {editing ? 'Editar Especialidade' : 'Nova Especialidade'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="Ex: Dentista"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Ícone (emoji)</label>
                <input
                  type="text"
                  value={form.icone}
                  onChange={(e) => setForm({ ...form, icone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none text-2xl"
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
