'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Phone, MapPin, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type Agendamento = {
  id: string;
  data_hora: string | null;
  status: string | null;
  observacao: string | null;
  clinica_nome: string;
  clinica_endereco: string;
  clinica_whatsapp: string;
  especialidade_nome: string;
  especialidade_icone: string;
};

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

function fmtTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

const statusColor: Record<string, string> = {
  confirmado: 'bg-green-100 text-green-700',
  pendente: 'bg-yellow-100 text-yellow-700',
  cancelado: 'bg-red-100 text-red-700',
  realizado: 'bg-blue-100 text-blue-700',
};

export default function AgendamentosDashboard() {
  const [list, setList] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/beneficiario/agendamentos');
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Erro ao carregar agendamentos');
      }
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(id: string) {
    if (!confirm('Cancelar este agendamento?')) return;
    setCancelling(id);
    try {
      const res = await fetch(`/api/beneficiario/agendamentos?id=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Erro ao cancelar');
      }
      await load();
    } catch (err: any) {
      alert(err.message || 'Erro ao cancelar');
    } finally {
      setCancelling(null);
    }
  }

  const upcoming = list.filter(
    (a) => a.status !== 'cancelado' && a.status !== 'realizado'
  );
  const history = list.filter(
    (a) => a.status === 'cancelado' || a.status === 'realizado'
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline"
      >
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

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Carregando...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
                Próximos Agendamentos
              </h2>

              {upcoming.length === 0 && (
                <div className="bg-white rounded-xl border-2 border-gray-300 p-8 text-center">
                  <p className="text-gray-600">Você não tem agendamentos próximos</p>
                </div>
              )}

              <div className="space-y-4">
                {upcoming.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl border-2 border-gray-300 p-6 hover:border-[#f5c842] transition"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{apt.especialidade_icone || '🏥'}</span>
                        <div>
                          <h3 className="text-xl font-bold text-[#0a2a5e]">
                            {apt.clinica_nome || '—'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {apt.especialidade_nome}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          statusColor[apt.status || ''] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {apt.status || 'pendente'}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 mb-4 pb-4 border-b-2 border-gray-200">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Calendar className="w-5 h-5 text-[#f5c842]" />
                        <div>
                          <p className="text-sm text-gray-600">Data</p>
                          <p className="font-semibold">{fmtDate(apt.data_hora)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-[#f5c842]" />
                        <div>
                          <p className="text-sm text-gray-600">Hora</p>
                          <p className="font-semibold">{fmtTime(apt.data_hora)}</p>
                        </div>
                      </div>
                      {apt.clinica_endereco && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <MapPin className="w-5 h-5 text-[#f5c842]" />
                          <div>
                            <p className="text-sm text-gray-600">Local</p>
                            <p className="font-semibold">{apt.clinica_endereco}</p>
                          </div>
                        </div>
                      )}
                      {apt.clinica_whatsapp && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Phone className="w-5 h-5 text-[#f5c842]" />
                          <div>
                            <p className="text-sm text-gray-600">Contato</p>
                            <p className="font-semibold font-mono">{apt.clinica_whatsapp}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      {apt.clinica_whatsapp && (
                        <a
                          href={`https://wa.me/${apt.clinica_whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition text-center"
                        >
                          Confirmar via WhatsApp
                        </a>
                      )}
                      <button
                        onClick={() => handleCancel(apt.id)}
                        disabled={cancelling === apt.id}
                        className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        {cancelling === apt.id ? 'Cancelando...' : 'Cancelar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
                Histórico
              </h2>
              {history.length === 0 ? (
                <div className="bg-white rounded-xl border-2 border-gray-300 p-8 text-center">
                  <p className="text-gray-600">Você não tem agendamentos passados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white rounded-xl border-2 border-gray-200 p-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-semibold text-[#0a2a5e]">
                          {apt.clinica_nome} • {apt.especialidade_nome}
                        </p>
                        <p className="text-sm text-gray-600">
                          {fmtDate(apt.data_hora)} às {fmtTime(apt.data_hora)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          statusColor[apt.status || ''] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
