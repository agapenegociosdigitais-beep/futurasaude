'use client';

import { useState } from 'react';

export default function SorteioAdmin() {
  const [formData, setFormData] = useState({ nome: '', premio: '', data: '' });
  const [sorteios] = useState([
    { id: 1, nome: 'Especial Primavera', premio: 'Smart TV 50"', data: '2025-04-15', ganhador: 'João Silva', participantes: 35 },
    { id: 2, nome: 'Páscoa Futura', premio: 'Cesta de Páscoa Premium', data: '2025-03-28', ganhador: 'Maria Oliveira', participantes: 28 },
  ]);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">Novo Sorteio</h2>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome do Sorteio</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
              placeholder="Ex: Sorteio Maio"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prêmio</label>
            <input
              type="text"
              value={formData.premio}
              onChange={(e) => setFormData({ ...formData, premio: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
              placeholder="Ex: Smart TV"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Data do Sorteio</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
        </div>
        <button className="px-8 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition">
          Realizar Sorteio
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">Histórico de Sorteios</h2>
        <div className="space-y-4">
          {sorteios.map((s) => (
            <div key={s.id} className="border-2 border-gray-200 rounded-xl p-5 hover:border-[#f5c842] transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0a2a5e]">{s.nome}</h3>
                  <p className="text-sm text-gray-600">{s.data} • {s.participantes} participantes</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Concluído</span>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Prêmio</p>
                  <p className="font-semibold text-[#0a2a5e]">{s.premio}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Ganhador</p>
                  <p className="font-semibold text-[#0a2a5e]">{s.ganhador}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
