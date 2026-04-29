'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Star, Clock } from 'lucide-react';
import { useState } from 'react';

export default function ClinicasDashboard() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('todos');

  const clinics = [
    {
      id: 1,
      name: 'Clínica Dentária Sorriso Perfeito',
      specialty: 'Dentista',
      emoji: '🦷',
      address: 'Rua Principal, 123 - Centro',
      distance: '0.8 km',
      phone: '(93) 3222-1234',
      hours: 'Seg-Sex: 8h-18h',
      rating: 4.8,
      reviews: 127,
      benefit: 'Até 50% de desconto',
      status: 'Aberto',
    },
    {
      id: 2,
      name: 'Centro Psicológico Bem Estar',
      specialty: 'Psicólogo',
      emoji: '🧠',
      address: 'Av.Tapajós, 456 - Centro',
      distance: '1.2 km',
      phone: '(93) 3222-5678',
      hours: 'Seg-Sex: 9h-19h',
      rating: 4.9,
      reviews: 89,
      benefit: 'Sessões com desconto',
      status: 'Aberto',
    },
    {
      id: 3,
      name: 'Oftalmologia Visão Clara',
      specialty: 'Oftalmologista',
      emoji: '👁️',
      address: 'Rua Santos, 789 - Mercês',
      distance: '2.1 km',
      phone: '(93) 3222-9012',
      hours: 'Seg-Sex: 8h-17h',
      rating: 4.7,
      reviews: 64,
      benefit: 'Consulta + exame',
      status: 'Aberto',
    },
    {
      id: 4,
      name: 'Fisioterapia Movimento',
      specialty: 'Fisioterapeuta',
      emoji: '💪',
      address: 'Av.Cuiabá, 321 - Centro',
      distance: '1.5 km',
      phone: '(93) 3222-3456',
      hours: 'Seg-Sex: 7h-18h',
      rating: 4.6,
      reviews: 72,
      benefit: 'Sessões reduzidas',
      status: 'Aberto',
    },
  ];

  const specialties = [
    { value: 'todos', label: 'Todas as Especialidades' },
    { value: 'Dentista', label: '🦷 Dentista' },
    { value: 'Psicólogo', label: '🧠 Psicólogo' },
    { value: 'Oftalmologista', label: '👁️ Oftalmologista' },
    { value: 'Fisioterapeuta', label: '💪 Fisioterapeuta' },
  ];

  const filtered = selectedSpecialty === 'todos'
    ? clinics
    : clinics.filter((c) => c.specialty === selectedSpecialty);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Rede Credenciada
        </h1>

        {/* Filter */}
        <div className="mb-8 flex flex-wrap gap-3">
          {specialties.map((specialty) => (
            <button
              key={specialty.value}
              onClick={() => setSelectedSpecialty(specialty.value)}
              className={`px-4 py-2 rounded-full font-semibold transition ${
                selectedSpecialty === specialty.value
                  ? 'bg-[#f5c842] text-[#0a2a5e]'
                  : 'bg-white text-[#0a2a5e] border-2 border-gray-300 hover:border-[#f5c842]'
              }`}
            >
              {specialty.label}
            </button>
          ))}
        </div>

        {/* Clinics Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((clinic) => (
            <div
              key={clinic.id}
              className="bg-white rounded-xl border-2 border-gray-300 hover:border-[#f5c842] overflow-hidden transition shadow-md hover:shadow-lg"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#0a2a5e] to-[#1c3a7a] text-white p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{clinic.emoji}</span>
                    <div>
                      <h3 className="font-bold text-lg">{clinic.name}</h3>
                      <p className="text-sm opacity-90">{clinic.specialty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-[#f5c842] text-[#f5c842]" />
                      <span className="font-bold">{clinic.rating}</span>
                    </div>
                    <p className="text-xs opacity-80">({clinic.reviews} avaliações)</p>
                  </div>
                </div>
                <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full inline-block text-sm font-semibold">
                  {clinic.benefit}
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3 text-gray-700">
                  <MapPin className="w-5 h-5 text-[#f5c842] flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold">{clinic.address}</p>
                    <p className="text-sm">{clinic.distance}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-5 h-5 text-[#f5c842]" />
                  <p className="font-mono text-sm">{clinic.phone}</p>
                </div>

                <div className="flex items-center gap-3 text-gray-700">
                  <Clock className="w-5 h-5 text-[#f5c842]" />
                  <p className="text-sm">{clinic.hours}</p>
                </div>

                {/* Status */}
                <div className="pt-4 border-t-2 border-gray-200 flex justify-between items-center">
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    {clinic.status}
                  </span>
                  <button className="px-4 py-2 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-semibold hover:bg-[#f0b820] transition">
                    Agendar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Nenhuma clínica encontrada para este filtro</p>
          </div>
        )}
      </div>
    </div>
  );
}
