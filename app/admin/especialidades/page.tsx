'use client';

import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function EspecialidadesAdmin() {
  const [especialidades] = useState([
    {
      id: 1,
      nome: 'Dentista',
      emoji: '🦷',
      tipo: 'desconto',
      beneficio: 'Até 50% de desconto em procedimentos',
      ativa: true,
    },
    {
      id: 2,
      nome: 'Psicólogo',
      emoji: '🧠',
      tipo: 'desconto',
      beneficio: 'Sessões com desconto especial',
      ativa: true,
    },
    {
      id: 3,
      nome: 'Oftalmologista',
      emoji: '👁️',
      tipo: 'desconto',
      beneficio: 'Consulta + exame de vista',
      ativa: true,
    },
    {
      id: 4,
      nome: 'Cardiologista',
      emoji: '❤️',
      tipo: 'avaliacao',
      beneficio: 'Primeira consulta cardiovascular',
      ativa: false,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/admin" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#0a2a5e] font-lora">
            Gerenciar Especialidades
          </h1>
          <button className="px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-bold hover:bg-[#f0b820] transition flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Nova Especialidade
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {especialidades.map((esp) => (
            <div
              key={esp.id}
              className="bg-white rounded-xl border-2 border-gray-300 p-6 hover:border-[#f5c842] transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{esp.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold text-[#0a2a5e]">{esp.nome}</h3>
                    <p className="text-sm text-gray-600">
                      Tipo: <span className="font-semibold">{esp.tipo}</span>
                    </p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    esp.ativa
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {esp.ativa ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6 border-l-4 border-[#f5c842]">
                <p className="text-sm text-gray-700">{esp.beneficio}</p>
              </div>

              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2">
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
