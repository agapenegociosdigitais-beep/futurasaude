'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Edit, Trash2, Building2, Upload, X, Image as ImageIcon, MapPin, Loader2 } from 'lucide-react';

interface Especialidade {
  id: string;
  nome: string;
  icone_emoji: string;
}

interface Clinica {
  id: string;
  nome_clinica: string;
  nome_profissional: string;
  especialidade_id: string;
  especialidade_nome: string;
  especialidade_icone: string;
  registro_profissional: string;
  foto_url: string;
  endereco: string;
  bairro: string;
  cidade: string;
  whatsapp: string;
  horario: string;
  avaliacao: number;
  total_agendamentos: number;
  ativo: boolean;
  criado_em: string;
}

const emptyForm = {
  nome_clinica: '',
  nome_profissional: '',
  especialidade_id: '',
  registro_profissional: '',
  foto_url: '',
  endereco: '',
  bairro: '',
  cidade: '',
  whatsapp: '',
  horario: '',
  ativo: true,
};

export default function ClinicasAdmin() {
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Clinica | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importEspId, setImportEspId] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [importPreview, setImportPreview] = useState<any>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const blobUrlRef = useRef<string>('');

  const getAuthHeaders = () => {
    const token = document.cookie
      .split('; ')
      .find((c) => c.startsWith('sb-access-token='))
      ?.split('=')[1];
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [resClinicas, resEsp] = await Promise.all([
        fetch('/api/admin/clinicas', { headers: getAuthHeaders() }),
        fetch('/api/admin/especialidades', { headers: getAuthHeaders() }),
      ]);
      if (resClinicas.ok) {
        setClinicas(await resClinicas.json());
      } else {
        setError('Erro ao carregar clínicas');
      }
      if (resEsp.ok) {
        setEspecialidades(await resEsp.json());
      }
    } catch {
      setError('Erro de conexão ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const revokeBlobUrl = useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = '';
    }
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setLogoPreview('');
    setError('');
    revokeBlobUrl();
    setShowModal(true);
  };

  const openEdit = (c: Clinica) => {
    setEditing(c);
    setForm({
      nome_clinica: c.nome_clinica || '',
      nome_profissional: c.nome_profissional || '',
      especialidade_id: c.especialidade_id || '',
      registro_profissional: c.registro_profissional || '',
      foto_url: c.foto_url || '',
      endereco: c.endereco || '',
      bairro: c.bairro || '',
      cidade: c.cidade || '',
      whatsapp: c.whatsapp || '',
      horario: c.horario || '',
      ativo: c.ativo,
    });
    setLogoPreview(c.foto_url || '');
    setError('');
    revokeBlobUrl();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setError('');
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('Logo muito grande. Máximo 2MB.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Envie apenas imagens.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      revokeBlobUrl();
      const preview = URL.createObjectURL(file);
      blobUrlRef.current = preview;
      setLogoPreview(preview);

      const formData = new FormData();
      formData.append('logo', file);
      if (editing?.id) formData.append('clinica_id', editing.id);

      const res = await fetch('/api/admin/clinicas/upload-logo', {
        method: 'POST',
        headers: {
          ...(document.cookie.split('; ').find((c) => c.startsWith('sb-access-token='))
            ? { Authorization: `Bearer ${document.cookie.split('; ').find((c) => c.startsWith('sb-access-token='))!.split('=')[1]}` }
            : {}),
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, foto_url: data.url }));
      } else {
        setError(data.message || 'Erro ao fazer upload');
        setLogoPreview('');
        revokeBlobUrl();
      }
    } catch {
      setError('Erro ao enviar logo');
      setLogoPreview('');
      revokeBlobUrl();
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = () => {
    setForm((prev) => ({ ...prev, foto_url: '' }));
    setLogoPreview('');
    revokeBlobUrl();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = async () => {
    if (!importUrl.trim()) {
      setImportError('Cole o link do Google Maps');
      return;
    }
    if (!importEspId) {
      setImportError('Selecione a especialidade');
      return;
    }

    setImporting(true);
    setImportError('');
    setImportPreview(null);

    try {
      const res = await fetch('/api/admin/clinicas/import-google', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ url: importUrl, especialidade_id: importEspId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportPreview(data.data);
      } else {
        setImportError(data.message || 'Erro ao importar dados');
      }
    } catch {
      setImportError('Erro de conexão ao importar');
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    setForm({
      nome_clinica: importPreview.nome || '',
      nome_profissional: '',
      especialidade_id: importEspId,
      registro_profissional: '',
      foto_url: importPreview.foto_url || '',
      endereco: importPreview.endereco || '',
      bairro: importPreview.bairro || '',
      cidade: importPreview.cidade || '',
      whatsapp: importPreview.telefone || '',
      horario: importPreview.horario || '',
      ativo: true,
    });
    if (importPreview.foto_url) {
      setLogoPreview(importPreview.foto_url);
    }
    setShowImport(false);
    setImportUrl('');
    setImportEspId('');
    setImportPreview(null);
    setImportError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nome_clinica.trim()) {
      setError('Nome da clínica é obrigatório');
      return;
    }
    if (!form.especialidade_id) {
      setError('Selecione uma especialidade');
      return;
    }
    if (!form.cidade.trim()) {
      setError('Cidade é obrigatória');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (editing) {
        const res = await fetch(`/api/admin/clinicas/${editing.id}`, {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(form),
        });
        if (res.ok) {
          await load();
          setShowModal(false);
        } else {
          const err = await res.json();
          setError(err.detail || err.message || 'Erro ao atualizar');
        }
      } else {
        const res = await fetch('/api/admin/clinicas', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(form),
        });
        if (res.ok) {
          await load();
          setShowModal(false);
        } else {
          const err = await res.json();
          setError(err.detail || err.message || 'Erro ao criar');
        }
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta clínica?')) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/clinicas/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        setClinicas((prev) => prev.filter((c) => c.id !== id));
      } else {
        const err = await res.json();
        setError(err.message || 'Erro ao deletar clínica');
      }
    } catch {
      setError('Erro de conexão ao deletar');
    } finally {
      setDeleting(null);
    }
  };

  const toggleAtivo = async (c: Clinica) => {
    const novoAtivo = !c.ativo;
    setToggling(c.id);
    setClinicas((prev) =>
      prev.map((item) => (item.id === c.id ? { ...item, ativo: novoAtivo } : item))
    );
    try {
      const res = await fetch(`/api/admin/clinicas/${c.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ativo: novoAtivo }),
      });
      if (!res.ok) {
        setClinicas((prev) =>
          prev.map((item) => (item.id === c.id ? { ...item, ativo: c.ativo } : item))
        );
        setError('Erro ao alterar status da clínica');
      }
    } catch {
      setClinicas((prev) =>
        prev.map((item) => (item.id === c.id ? { ...item, ativo: c.ativo } : item))
      );
      setError('Erro de conexão ao alterar status');
    } finally {
      setToggling(null);
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
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#0a2a5e]">Clínicas & Parceiros</h1>
          <p className="text-sm text-gray-500">{clinicas.length} cadastrada{clinicas.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImport(true)}
            className="px-6 py-3 border-2 border-[#0a2a5e] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#0a2a5e]/5 transition flex items-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            Importar do Google
          </button>
          <button
            onClick={openCreate}
            className="px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Clínica
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {clinicas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma clínica cadastrada</p>
            <p className="text-sm mt-1">Clique em &quot;Nova Clínica&quot; para começar</p>
          </div>
        ) : (
          clinicas.map((clinic) => (
            <div key={clinic.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#f5c842] transition">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3 flex-1">
                  {clinic.foto_url ? (
                    <img
                      src={clinic.foto_url}
                      alt={clinic.nome_clinica}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#0a2a5e]/10 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-[#0a2a5e]" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#0a2a5e]">{clinic.nome_clinica}</h3>
                    <p className="text-sm text-gray-600">
                      {clinic.especialidade_icone} {clinic.especialidade_nome}
                      {clinic.nome_profissional ? ` • ${clinic.nome_profissional}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleAtivo(clinic)}
                  disabled={toggling === clinic.id}
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition disabled:opacity-50 ${
                    clinic.ativo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {toggling === clinic.id ? '...' : clinic.ativo ? 'Ativa' : 'Inativa'}
                </button>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Cidade</p>
                  <p className="font-semibold text-[#0a2a5e]">{clinic.cidade || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Bairro</p>
                  <p className="font-semibold text-[#0a2a5e]">{clinic.bairro || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">WhatsApp</p>
                  <p className="font-mono text-sm font-semibold text-[#0a2a5e]">{clinic.whatsapp || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Horário</p>
                  <p className="font-semibold text-[#0a2a5e]">{clinic.horario || '—'}</p>
                </div>
              </div>

              {clinic.endereco && (
                <p className="text-sm text-gray-500 mb-4">{clinic.endereco}</p>
              )}

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => openEdit(clinic)}
                  className="px-4 py-2 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" /> Editar
                </button>
                <button
                  onClick={() => handleDelete(clinic.id)}
                  disabled={deleting === clinic.id}
                  className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {deleting === clinic.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {deleting === clinic.id ? 'Deletando...' : 'Deletar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">
              {editing ? 'Editar Clínica' : 'Nova Clínica'}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Logo / Foto</label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                      />
                      <button
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#f5c842] transition"
                    >
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                      <span className="text-[10px] text-gray-400 mt-1">Logo</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="px-4 py-2 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'Enviando...' : 'Selecionar Logo'}
                    </button>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPG até 2MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nome da Clínica *
                </label>
                <input
                  type="text"
                  value={form.nome_clinica}
                  onChange={(e) => setForm({ ...form, nome_clinica: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="Ex: Clínica Odonto Vida"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Profissional</label>
                  <input
                    type="text"
                    value={form.nome_profissional}
                    onChange={(e) => setForm({ ...form, nome_profissional: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="Dr(a). Nome"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Registro</label>
                  <input
                    type="text"
                    value={form.registro_profissional}
                    onChange={(e) => setForm({ ...form, registro_profissional: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="CRO-UF 12345"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Especialidade *
                </label>
                <select
                  value={form.especialidade_id}
                  onChange={(e) => setForm({ ...form, especialidade_id: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none bg-white"
                >
                  <option value="">Selecione...</option>
                  {especialidades.map((esp) => (
                    <option key={esp.id} value={esp.id}>
                      {esp.icone_emoji} {esp.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  value={form.endereco}
                  onChange={(e) => setForm({ ...form, endereco: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="Rua, Número - Complemento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={form.cidade}
                    onChange={(e) => setForm({ ...form, cidade: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="Ex: Santarém"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Bairro</label>
                  <input
                    type="text"
                    value={form.bairro}
                    onChange={(e) => setForm({ ...form, bairro: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="Ex: Aldeia"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp</label>
                  <input
                    type="text"
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="(93) 99999-0000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Horário</label>
                  <input
                    type="text"
                    value={form.horario}
                    onChange={(e) => setForm({ ...form, horario: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="Seg-Sex 8h-18h"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                  className="w-4 h-4 accent-[#f5c842]"
                  id="ativo-check"
                />
                <label htmlFor="ativo-check" className="text-sm font-semibold text-gray-700">
                  Clínica ativa
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || uploading}
                className="flex-1 px-4 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-[#0a2a5e] flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Importar do Google Maps
              </h2>
              <button
                onClick={() => { setShowImport(false); setImportPreview(null); setImportError(''); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {importError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {importError}
              </div>
            )}

            {!importPreview ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Link do Google Maps ou Meu Negócio *
                  </label>
                  <input
                    type="url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    placeholder="https://maps.google.com/... ou https://share.google/..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Cole o link completo do estabelecimento no Google Maps
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Especialidade *
                  </label>
                  <select
                    value={importEspId}
                    onChange={(e) => setImportEspId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none bg-white"
                  >
                    <option value="">Selecione...</option>
                    {especialidades.map((esp) => (
                      <option key={esp.id} value={esp.id}>
                        {esp.icone_emoji} {esp.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full px-4 py-3 bg-[#0a2a5e] text-white rounded-xl font-bold hover:bg-[#0a2a5e]/90 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Importando dados...
                    </>
                  ) : (
                    <>
                      <MapPin className="w-5 h-5" />
                      Buscar Dados
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <p className="text-sm text-green-700 font-semibold mb-2">Dados encontrados:</p>
                  <div className="space-y-2">
                    {importPreview.nome && (
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500 w-20">Nome:</span>
                        <span className="font-semibold text-[#0a2a5e]">{importPreview.nome}</span>
                      </div>
                    )}
                    {importPreview.telefone && (
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500 w-20">Telefone:</span>
                        <span className="font-semibold text-[#0a2a5e]">{importPreview.telefone}</span>
                      </div>
                    )}
                    {importPreview.endereco && (
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500 w-20">Endereço:</span>
                        <span className="font-semibold text-[#0a2a5e]">{importPreview.endereco}</span>
                      </div>
                    )}
                    {importPreview.cidade && (
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500 w-20">Cidade:</span>
                        <span className="font-semibold text-[#0a2a5e]">{importPreview.cidade}</span>
                      </div>
                    )}
                    {importPreview.bairro && (
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500 w-20">Bairro:</span>
                        <span className="font-semibold text-[#0a2a5e]">{importPreview.bairro}</span>
                      </div>
                    )}
                    {importPreview.horario && (
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500 w-20">Horário:</span>
                        <span className="font-semibold text-[#0a2a5e]">{importPreview.horario}</span>
                      </div>
                    )}
                    {importPreview.avaliacao > 0 && (
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500 w-20">Avaliação:</span>
                        <span className="font-semibold text-[#0a2a5e]">{'⭐'.repeat(Math.round(importPreview.avaliacao))} {importPreview.avaliacao}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Os dados serão preenchidos automaticamente no formulário. Você pode editar antes de salvar.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setImportPreview(null); setImportError(''); }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Buscar Outro
                  </button>
                  <button
                    onClick={confirmImport}
                    className="flex-1 px-4 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition"
                  >
                    Confirmar e Editar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
