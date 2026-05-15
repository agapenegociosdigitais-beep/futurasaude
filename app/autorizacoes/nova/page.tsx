'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TIPOS = [
  { value: 'consulta', label: 'Consulta' },
  { value: 'exame', label: 'Exame' },
  { value: 'procedimento', label: 'Procedimento' },
];

function getAuthHeaders() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('sb-access-token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export default function NovaAutorizacaoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    tipo: 'consulta',
    especialidade_ou_exame: '',
    justificativa: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!form.especialidade_ou_exame.trim()) {
      setError('Especialidade ou exame é obrigatório');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/autorizacoes', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Erro ao criar autorização');
        return;
      }

      router.push(`/autorizacoes/${data.id}`);
    } catch {
      setError('Erro de conexão');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
        <div>
          <h1 className="text-3xl font-bold text-[#0a2a5e]">Nova autorização</h1>
          <p className="text-sm text-gray-600 mt-2">Solicite consulta, exame ou procedimento.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
          >
            {TIPOS.map((tipo) => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Especialidade / exame</label>
          <input
            type="text"
            value={form.especialidade_ou_exame}
            onChange={(e) => setForm({ ...form, especialidade_ou_exame: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            placeholder="Ex: Cardiologia, Raio-X, Hemograma"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Justificativa</label>
          <textarea
            value={form.justificativa}
            onChange={(e) => setForm({ ...form, justificativa: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none min-h-[120px]"
            placeholder="Descreva brevemente a necessidade, se desejar"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.push('/autorizacoes')}
            className="flex-1 px-4 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-xl font-semibold hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition disabled:opacity-50"
          >
            {saving ? 'Enviando...' : 'Solicitar autorização'}
          </button>
        </div>
      </div>
    </div>
  );
}
