'use client';

import { useState } from 'react';

export default function EspecialidadesAdmin() {
  const [especialidades] = useState([
    { id: 1, name: 'Dentista', icon: '🦷', clinics: 3, appointments: 47, active: true },
    { id: 2, name: 'Psicólogo', icon: '🧠', clinics: 2, appointments: 23, active: true },
    { id: 3, name: 'Oftalmologista', icon: '👁️', clinics: 1, appointments: 15, active: true },
    { id: 4, name: 'Clínico Geral', icon: '🏥', clinics: 5, appointments: 89, active: true },
    { id: 5, name: 'Cardiologista', icon: '💖', clinics: 1, appointments: 33, active: true },
    { id: 6, name: 'Nutricionista', icon: '🥗', clinics: 4, appointments: 28, active: false },
  ]);

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {especialidades.map((esp) => (
          <div key={esp.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#f5c842] transition">
            <div className="flex items-start justify-between mb-4">
              <div className="text-3xl">{esp.icon}</div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${esp.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {esp.active ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-[#0a2a5e] mb-3">{esp.name}</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-600 mb-1">Clínicas</p>
                <p className="font-bold text-[#0a2a5e]">{esp.clinics}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Agendamentos</p>
                <p className="font-bold text-[#0a2a5e]">{esp.appointments}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
