'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Phone, MapPin, X, AlertCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

function parseDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function fmtDate(iso: string | null) {
  const d = parseDate(iso);
  if (!d) return 'Data não informada';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
}

function fmtTime(iso: string | null) {
  const d = parseDate(iso);
  if (!d) return 'Hora não informada';
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function normalizeStatus(status: string | null) {
  const normalized = status?.trim().toLowerCase();
  if (normalized === 'confirmado' || normalized === 'pendente' || normalized === 'cancelado' || normalized === 'realizado') {
    return normalized;
  }
  return 'desconhecido';
}

function statusLabel(status: string | null) {
  const normalized = normalizeStatus(status);
  if (normalized === 'confirmado') return 'Confirmado';
  if (normalized === 'pendente') return 'Pendente';
  if (normalized === 'cancelado') return 'Cancelado';
  if (normalized === 'realizado') return 'Realizado';
  return 'Status indefinido';
}

const statusColor: Record<string, string> = {
  confirmado: 'bg-green-100 text-green-700',
  pendente: 'bg-yellow-100 text-yellow-700',
  cancelado: 'bg-red-100 text-red-700',
  realizado: 'bg-blue-100 text-blue-700',
  desconhecido: 'bg-gray-100 text-gray-700',
};

function canCancel(status: string | null) {
  const normalized = normalizeStatus(status);
  return normalized === 'pendente' || normalized === 'confirmado';
}

function hasWhatsApp(phone: string | null) {
  return Boolean(phone?.replace(/\D/g, ''));
}

export default function AgendamentosDashboard() {
  const [list, setList] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/beneficiario/agendamentos', { cache: 'no-store' });
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

  const upcoming = useMemo(() => {
    return [...list]
      .filter((a) => {
        const status = normalizeStatus(a.status);
        return status !== 'cancelado' && status !== 'realizado';
      })
      .sort((a, b) => {
        const aTime = parseDate(a.data_hora)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bTime = parseDate(b.data_hora)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aTime - bTime;
      });
  }, [list]);

  const history = useMemo(() => {
    return [...list]
      .filter((a) => {
        const status = normalizeStatus(a.status);
        return status === 'cancelado' || status === 'realizado';
      })
      .sort((a, b) => {
        const aTime = parseDate(a.data_hora)?.getTime() ?? 0;
        const bTime = parseDate(b.data_hora)?.getTime() ?? 0;
        return bTime - aTime;
      });
  }, [list]);

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
        <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-[#0a2a5e] font-lora">
              Meus Agendamentos
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Acompanhe os próximos atendimentos e o histórico real do seu plano.
            </p>
          </div>
          <Link
            href="/dashboard/clinicas"
            className="px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-bold hover:bg-[#f0b820]"
          >
            Agendar Novo
          </Link>
        </div>

        {loading && (
          <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-300">
            <p className="text-gray-600 text-lg">Carregando seus agendamentos...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-300 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-semibold">Não foi possível carregar seus agendamentos.</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
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
                  <p className="text-gray-700 font-semibold">Você não tem agendamentos próximos</p>
                  <p className="text-gray-500 text-sm mt-2">Quando solicitar um atendimento, ele aparecerá aqui.</p>
                </div>
              )}

              <div className="space-y-4">
                {upcoming.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-xl border-2 border-gray-300 p-6 hover:border-[#f5c842] transition"
                  >
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{apt.especialidade_icone || '🏥'}</span>
                        <div>
                          <h3 className="text-xl font-bold text-[#0a2a5e]">
                            {apt.clinica_nome || 'Clínica não informada'}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {apt.especialidade_nome || 'Especialidade não informada'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor[normalizeStatus(apt.status)]
                        }`}
                      >
                        {statusLabel(apt.status)}
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
                      {hasWhatsApp(apt.clinica_whatsapp) && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Phone className="w-5 h-5 text-[#f5c842]" />
                          <div>
                            <p className="text-sm text-gray-600">Contato</p>
                            <p className="font-semibold font-mono">{apt.clinica_whatsapp}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {apt.observacao && (
                      <p className="text-sm text-gray-600 mb-4">Observação: {apt.observacao}</p>
                    )}

                    <div className="flex gap-4 flex-wrap">
                      {hasWhatsApp(apt.clinica_whatsapp) && (
                        <a
                          href={`https://wa.me/${apt.clinica_whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[220px] px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition text-center"
                        >
                          Falar no WhatsApp
                        </a>
                      )}
                      {canCancel(apt.status) && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancelling === apt.id}
                          className="px-4 py-2 border-2 border-red-300 text-red-700 rounded-lg font-semibold hover:bg-red-50 transition flex items-center gap-2 disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                          {cancelling === apt.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
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
                  <p className="text-gray-700 font-semibold">Você ainda não tem histórico de agendamentos</p>
                  <p className="text-gray-500 text-sm mt-2">Agendamentos concluídos ou cancelados aparecerão aqui.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white rounded-xl border-2 border-gray-200 p-4 flex justify-between items-center gap-4"
                    >
                      <div>
                        <p className="font-semibold text-[#0a2a5e]">
                          {apt.clinica_nome || 'Clínica não informada'} • {apt.especialidade_nome || 'Especialidade não informada'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {fmtDate(apt.data_hora)} às {fmtTime(apt.data_hora)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          statusColor[normalizeStatus(apt.status)]
                        }`}
                      >
                        {statusLabel(apt.status)}
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
