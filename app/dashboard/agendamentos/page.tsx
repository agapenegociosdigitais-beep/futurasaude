'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Phone, MapPin, X } from 'lucide-react';
import { useState } from 'react';

export default function AgendamentosDashboard() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      date: '28 de Abril',
      time: '14:00',
      specialist: 'Dra. Maria Silva',
      specialty: 'Dentista',
      clinic: 'Clínica Dentária Sorriso',
      address: 'Rua Principal, 123',
      phone: '(93) 3222-1234',
      status: 'Confirmado',
    },
    {
      id: 2,
      date: '05 de Maio',
      time: '10:30',
      specialist: 'Dr. Carlos Santos',
      specialty: 'Psicólogo',
      clinic: 'Centro Psicológico Bem Estar',
      address: 'Av.Tapajós, 456',
      phone: '(93) 3222-5678',
      status: 'Sob análise',
    },
  ]);

  const handleCancel = (id: number) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#0a2a5e] font-lora">
            Meus Agendamentos
          </h1>
          <Link
            href="/dashboard/clinicas"
            className="px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-bold hover:bg-[#f0b820]"
          >
            Agendar Novo
          </Link>
        </div>

        {/* Upcoming */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
            Próximos Agendamentos
          </h2>
          <div className="space-y-4">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="bg-white rounded-xl border-2 border-gray-300 p-6 hover:border-[#f5c842] transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#0a2a5e]">{apt.specialist}</h3>
                    <p className="text-sm text-gray-600">{apt.specialty}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      apt.status === 'Confirmado'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {apt.status}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-4 pb-4 border-b-2 border-gray-200">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Calendar className="w-5 h-5 text-[#f5c842]" />
                    <div>
                      <p className="text-sm text-gray-600">Data</p>
                      <p className="font-semibold">{apt.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Clock className="w-5 h-5 text-[#f5c842]" />
                    <div>
                      <p className="text-sm text-gray-600">Hora</p>
                      <p className="font-semibold">{apt.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin className="w-5 h-5 text-[#f5c842]" />
                    <div>
                      <p className="text-sm text-gray-600">Local</p>
                      <p className="font-semibold">{apt.clinic}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone className="w-5 h-5 text-[#f5c842]" />
                    <div>
                      <p className="text-sm text-gray-600">Contato</p>
                      <p className="font-semibold font-mono">{apt.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a
                    href={`https://wa.me/5593${apt.phone.replace(/\D/g, '').slice(-8)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition text-center"
                  >
                    Confirmar via WhatsApp
                  </a>
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Past */}
        <div>
          <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
            Histórico
          </h2>
          <div className="bg-white rounded-xl border-2 border-gray-300 p-8 text-center">
            <p className="text-gray-600">Você não tem agendamentos passados</p>
          </div>
        </div>
      </div>
    </div>
  );
}
