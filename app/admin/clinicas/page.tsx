'use client';

import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { useState } from 'react';

export default function ClinicasAdmin() {
  const [clinics] = useState([
    { id: 1, name: 'Clínica Dentária Sorriso Perfeito', specialty: 'Dentista', professional: 'Dra. Ana Silva', city: 'Santarém', phone: '(93) 3222-1234', rating: 4.8, appointments: 47, active: true },
    { id: 2, name: 'Centro Psicológico Bem Estar', specialty: 'Psicólogo', professional: 'Dr. Carlos Santos', city: 'Santarém', phone: '(93) 3222-5678', rating: 4.9, appointments: 23, active: true },
    { id: 3, name: 'Oftalmologia Visão Clara', specialty: 'Oftalmologista', professional: 'Dra. Marina Costa', city: 'Itaituba', phone: '(93) 3522-1212', rating: 4.6, appointments: 15, active: false },
  ]);

  return (
    <>
      <div className="flex justify-end mb-6">
        <button className="px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Nova Clínica
        </button>
      </div>

      <div className="space-y-4">
        {clinics.map((clinic) => (
          <div key={clinic.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#f5c842] transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#0a2a5e]">{clinic.name}</h3>
                <p className="text-sm text-gray-600">{clinic.specialty} • {clinic.professional}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${clinic.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {clinic.active ? 'Ativa' : 'Inativa'}
              </span>
            </div>

            <div className="grid md:grid-cols-4 gap-4 mb-4 pb-4 border-b border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">Cidade</p>
                <p className="font-semibold text-[#0a2a5e]">{clinic.city}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Telefone</p>
                <p className="font-mono text-sm font-semibold text-[#0a2a5e]">{clinic.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Avaliação</p>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#f5c842] text-[#f5c842]" />
                  <span className="font-semibold text-[#0a2a5e]">{clinic.rating}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Agendamentos</p>
                <p className="font-semibold text-[#0a2a5e]">{clinic.appointments}</p>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2">
                <Edit className="w-4 h-4" /> Editar
              </button>
              <button className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Deletar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
