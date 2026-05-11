'use client';

import Link from 'next/link';
import { ArrowLeft, MapPin, Phone, Star, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

type Clinic = {
  id: string;
  nome_clinica: string;
  nome_profissional: string | null;
  especialidade_nome: string;
  especialidade_icone: string;
  foto_url: string | null;
  endereco: string | null;
  bairro: string | null;
  cidade: string | null;
  whatsapp: string | null;
  horario: string | null;
  avaliacao: number | null;
};

export default function ClinicasDashboard() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('todos');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/beneficiario/clinicas');
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.message || 'Erro ao carregar clínicas');
        }
        const data = await res.json();
        setClinics(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar clínicas');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const especialidadesUnicas = Array.from(
    new Set(clinics.map((c) => c.especialidade_nome).filter(Boolean))
  );

  const specialties = [
    { value: 'todos', label: 'Todas as Especialidades' },
    ...especialidadesUnicas.map((nome) => {
      const icone = clinics.find((c) => c.especialidade_nome === nome)?.especialidade_icone || '';
      return { value: nome, label: `${icone} ${nome}` };
    }),
  ];

  const filtered =
    selectedSpecialty === 'todos'
      ? clinics
      : clinics.filter((c) => c.especialidade_nome === selectedSpecialty);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Rede Credenciada
        </h1>

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Carregando clínicas...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && clinics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              Nenhuma clínica cadastrada ainda. Volte mais tarde.
            </p>
          </div>
        )}

        {!loading && !error && clinics.length > 0 && (
          <>
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

            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((clinic) => (
                <div
                  key={clinic.id}
                  className="bg-white rounded-xl border-2 border-gray-300 hover:border-[#f5c842] overflow-hidden transition shadow-md hover:shadow-lg"
                >
                  <div className="bg-gradient-to-r from-[#0a2a5e] to-[#1c3a7a] text-white p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">
                          {clinic.especialidade_icone || '🏥'}
                        </span>
                        <div>
                          <h3 className="font-bold text-lg">{clinic.nome_clinica}</h3>
                          <p className="text-sm opacity-90">
                            {clinic.especialidade_nome}
                            {clinic.nome_profissional ? ` • ${clinic.nome_profissional}` : ''}
                          </p>
                        </div>
                      </div>
                      {clinic.avaliacao != null && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-2">
                            <Star className="w-4 h-4 fill-[#f5c842] text-[#f5c842]" />
                            <span className="font-bold">{Number(clinic.avaliacao).toFixed(1)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    {(clinic.endereco || clinic.bairro || clinic.cidade) && (
                      <div className="flex items-start gap-3 text-gray-700">
                        <MapPin className="w-5 h-5 text-[#f5c842] flex-shrink-0 mt-1" />
                        <div>
                          {clinic.endereco && <p className="font-semibold">{clinic.endereco}</p>}
                          <p className="text-sm">
                            {[clinic.bairro, clinic.cidade].filter(Boolean).join(' - ')}
                          </p>
                        </div>
                      </div>
                    )}

                    {clinic.whatsapp && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Phone className="w-5 h-5 text-[#f5c842]" />
                        <p className="font-mono text-sm">{clinic.whatsapp}</p>
                      </div>
                    )}

                    {clinic.horario && (
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-[#f5c842]" />
                        <p className="text-sm">{clinic.horario}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t-2 border-gray-200 flex justify-end">
                      {clinic.whatsapp && (
                        <a
                          href={`https://wa.me/${clinic.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-semibold hover:bg-[#f0b820] transition"
                        >
                          Agendar
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Nenhuma clínica encontrada para este filtro
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
