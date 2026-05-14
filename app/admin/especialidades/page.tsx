'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Smile } from 'lucide-react';

interface Especialidade {
  id: string;
  nome: string;
  icone_emoji: string;
  icone_url: string | null;
  tipo_beneficio: 'gratuito' | 'desconto' | 'avaliacao';
  descricao_beneficio: string;
  visivel_beneficiario: boolean;
  ativo: boolean;
  criado_em: string;
}

const TIPOS = [
  { value: 'gratuito', label: 'Gratuito' },
  { value: 'desconto', label: 'Desconto' },
  { value: 'avaliacao', label: 'Avaliação' },
] as const;

const EMOJIS_DISPONIVEIS = [
  '🦷', '👁️', '❤️', '🧠', '🦴', '👂', '🫁', '🩺', '💪', '🧬',
  '🧘', '🍼', '🤰', '🧑‍⚕️', '🏥', '💊', '🧪', '🩻', '🦶', '🦻',
];

export default function EspecialidadesAdmin() {
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Especialidade | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    icone_emoji: '',
    tipo_beneficio: 'desconto' as 'gratuito' | 'desconto' | 'avaliacao',
    descricao_beneficio: 'Benefício exclusivo Futura Saúde',
    visivel_beneficiario: true,
    ativo: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/especialidades');
      if (res.ok) setEspecialidades(await res.json());
      else {
        const j = await res.json().catch(() => ({}));
        setError(j.message || 'Erro ao carregar especialidades');
      }
    } catch {
      setError('Erro ao carregar especialidades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      nome: '',
      icone_emoji: '',
      tipo_beneficio: 'desconto',
      descricao_beneficio: 'Benefício exclusivo Futura Saúde',
      visivel_beneficiario: true,
      ativo: true,
    });
    setError('');
    setShowEmojiPicker(false);
    setShowModal(true);
  };

  const openEdit = (esp: Especialidade) => {
    setEditing(esp);
    setForm({
      nome: esp.nome,
      icone_emoji: esp.icone_emoji || '',
      tipo_beneficio: esp.tipo_beneficio || 'desconto',
      descricao_beneficio: esp.descricao_beneficio || 'Benefício exclusivo Futura Saúde',
      visivel_beneficiario: esp.visivel_beneficiario ?? true,
      ativo: esp.ativo ?? true,
    });
    setError('');
    setShowEmojiPicker(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nome.trim()) return;
    setSaving(true);
    setError('');
    try {
      const body = {
        nome: form.nome.trim(),
        icone_emoji: form.icone_emoji,
        tipo_beneficio: form.tipo_beneficio,
        descricao_beneficio: form.descricao_beneficio.trim() || 'Benefício exclusivo Futura Saúde',
        visivel_beneficiario: form.visivel_beneficiario,
        ativo: form.ativo,
      };
      const url = editing
        ? `/api/admin/especialidades/${editing.id}`
        : '/api/admin/especialidades';
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        await load();
        setShowModal(false);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message || (editing ? 'Erro ao atualizar' : 'Erro ao criar'));
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (esp: Especialidade) => {
    if (!confirm(`Tem certeza que deseja excluir "${esp.nome}"?`)) return;
    setDeleting(esp.id);
    try {
      const res = await fetch(`/api/admin/especialidades/${esp.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEspecialidades((prev) => prev.filter((e) => e.id !== esp.id));
      } else {
        const j = await res.json().catch(() => ({}));
        setError(j.message || 'Erro ao deletar');
      }
    } catch {
      setError('Erro de conexão ao deletar');
    } finally {
      setDeleting(null);
    }
  };

  const toggleAtivo = async (esp: Especialidade) => {
    try {
      const res = await fetch(`/api/admin/especialidades/${esp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !esp.ativo }),
      });
      if (res.ok) {
        setEspecialidades((prev) =>
          prev.map((e) => (e.id === esp.id ? { ...e, ativo: !e.ativo } : e))
        );
      } else {
        setError('Erro ao alterar status');
      }
    } catch {
      setError('Erro de conexão');
    }
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
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex justify-between items-center">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2">
            &times;
          </button>
        </div>
      )}

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
          <div
            key={esp.id}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#f5c842] transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{esp.icone_emoji || '🏥'}</div>
              <button
                onClick={() => toggleAtivo(esp)}
                className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                  esp.ativo
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {esp.ativo ? 'Ativa' : 'Inativa'}
              </button>
            </div>
            <h3 className="text-lg font-bold text-[#0a2a5e] mb-1">{esp.nome}</h3>
            <p className="text-xs text-gray-500 mb-3 capitalize">
              {esp.tipo_beneficio} • {esp.descricao_beneficio}
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => openEdit(esp)}
                className="p-2 border-2 border-gray-300 text-[#0a2a5e] rounded-lg hover:bg-gray-50 transition"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(esp)}
                disabled={deleting === esp.id}
                className="p-2 border-2 border-gray-300 text-red-500 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">
              {editing ? 'Editar Especialidade' : 'Nova Especialidade'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="Ex: Dentista"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ícone (emoji)
                </label>
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none text-left flex items-center justify-between hover:border-[#f5c842] transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-2xl">
                      {form.icone_emoji || '—'}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0a2a5e]">
                        {form.icone_emoji ? 'Emoji selecionado' : 'Sem emoji'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Clique para escolher um emoji ou usar sem ícone.
                      </p>
                    </div>
                  </div>
                  <Smile className="w-5 h-5 text-gray-400" />
                </button>

                {showEmojiPicker && (
                  <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-3">
                    <button
                      type="button"
                      onClick={() => {
                        setForm({ ...form, icone_emoji: '' });
                        setShowEmojiPicker(false);
                      }}
                      className={`w-full px-4 py-3 rounded-lg border text-left transition ${
                        !form.icone_emoji
                          ? 'border-[#f5c842] bg-white text-[#0a2a5e]'
                          : 'border-gray-200 bg-white hover:border-[#f5c842]'
                      }`}
                    >
                      <span className="font-semibold">Sem emoji</span>
                      <p className="text-xs text-gray-500 mt-1">Salvar a especialidade sem ícone.</p>
                    </button>
                    <div className="grid grid-cols-5 gap-2">
                      {EMOJIS_DISPONIVEIS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => {
                            setForm({ ...form, icone_emoji: emoji });
                            setShowEmojiPicker(false);
                          }}
                          className={`h-14 rounded-xl border text-2xl flex items-center justify-center transition ${
                            form.icone_emoji === emoji
                              ? 'border-[#f5c842] bg-white shadow-sm'
                              : 'border-gray-200 bg-white hover:border-[#f5c842]'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Tipo de Benefício
                </label>
                <select
                  value={form.tipo_beneficio}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tipo_beneficio: e.target.value as 'gratuito' | 'desconto' | 'avaliacao',
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                >
                  {TIPOS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Descrição do Benefício
                </label>
                <input
                  type="text"
                  value={form.descricao_beneficio}
                  onChange={(e) =>
                    setForm({ ...form, descricao_beneficio: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="Ex: Até 50% de desconto"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.visivel_beneficiario}
                  onChange={(e) =>
                    setForm({ ...form, visivel_beneficiario: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#f5c842]"
                  id="esp-vis-check"
                />
                <label
                  htmlFor="esp-vis-check"
                  className="text-sm font-semibold text-gray-700"
                >
                  Visível para beneficiário
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                  className="w-4 h-4 accent-[#f5c842]"
                  id="esp-ativo-check"
                />
                <label
                  htmlFor="esp-ativo-check"
                  className="text-sm font-semibold text-gray-700"
                >
                  Especialidade ativa
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
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
