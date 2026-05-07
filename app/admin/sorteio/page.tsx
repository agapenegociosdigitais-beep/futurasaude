'use client';

import { useState, useEffect, useCallback } from 'react';
import { Trophy, Users, Sparkles } from 'lucide-react';

interface Ganhador {
  id: string;
  nome: string;
  premio: string;
}

interface Sorteio {
  id: string;
  realizado_por: string;
  total_participantes: number;
  ganhadores: Ganhador[];
  hash_auditoria: string;
  realizado_em: string;
}

export default function SorteioAdmin() {
  const [sorteios, setSorteios] = useState<Sorteio[]>([]);
  const [loading, setLoading] = useState(true);
  const [sorteando, setSorteando] = useState(false);
  const [form, setForm] = useState({ num_ganhadores: 1, premio: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/sorteio');
      if (res.ok) setSorteios(await res.json());
    } catch {} finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSortear = async () => {
    if (!form.premio.trim()) return;
    if (!confirm(`Realizar sorteio com ${form.num_ganhadores} ganhador(es) e prêmio "${form.premio}"?`)) return;
    setSorteando(true);
    try {
      const res = await fetch('/api/admin/sorteio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const novo = await res.json();
        setSorteios((prev) => [novo, ...prev]);
        setForm({ num_ganhadores: 1, premio: '' });
      } else {
        const err = await res.json();
        alert(err.message || 'Erro ao realizar sorteio');
      }
    } catch {
      alert('Erro ao realizar sorteio');
    } finally {
      setSorteando(false);
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
      <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-[#f5c842] rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-[#0a2a5e]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0a2a5e]">Novo Sorteio</h2>
            <p className="text-sm text-gray-600">Selecione ganhadores entre beneficiários ativos</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nº de Ganhadores</label>
            <input
              type="number"
              min={1}
              max={10}
              value={form.num_ganhadores}
              onChange={(e) => setForm({ ...form, num_ganhadores: parseInt(e.target.value) || 1 })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prêmio</label>
            <input
              type="text"
              value={form.premio}
              onChange={(e) => setForm({ ...form, premio: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
              placeholder="Ex: Smart TV 50 polegadas"
            />
          </div>
        </div>
        <button
          onClick={handleSortear}
          disabled={sorteando || !form.premio.trim()}
          className="px-8 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition disabled:opacity-50 flex items-center gap-2"
        >
          <Trophy className="w-5 h-5" />
          {sorteando ? 'Sorteando...' : 'Realizar Sorteio'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-[#0a2a5e] mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Histórico de Sorteios
        </h2>
        {sorteios.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum sorteio realizado ainda</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorteios.map((s) => (
              <div key={s.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-[#f5c842] transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-sm text-gray-600">
                      {new Date(s.realizado_em).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Users className="w-3 h-3" />
                      {s.total_participantes} participantes
                    </p>
                  </div>
                </div>

                {s.ganhadores && s.ganhadores.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Ganhadores</p>
                    {s.ganhadores.map((g, i) => (
                      <div key={i} className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-2">
                        <Trophy className="w-4 h-4 text-[#f5c842]" />
                        <span className="font-semibold text-[#0a2a5e]">{g.nome}</span>
                        {g.premio && (
                          <span className="text-sm text-gray-600 ml-auto">{g.premio}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400 font-mono">
                    Hash: {s.hash_auditoria?.substring(0, 16)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
