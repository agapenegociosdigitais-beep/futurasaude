'use client';

import { useState, useEffect } from 'react';
import { Users, Building2, Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalBeneficiarios: 0,
    ativos: 0,
    pendentes: 0,
    receitaMes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-[3px] border-[#0a2a5e] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard label="Total Beneficiários" value={stats.totalBeneficiarios} color="blue" />
            <StatCard label="Ativos" value={stats.ativos} color="green" />
            <StatCard label="Pendentes" value={stats.pendentes} color="yellow" />
            <StatCard label="Receita Mês" value={`R$ ${stats.receitaMes.toLocaleString('pt-BR')}`} color="gold" />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">Ações Rápidas</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <QuickAction icon={Users} label="Novo Beneficiário" href="/admin/beneficiarios" />
              <QuickAction icon={Building2} label="Nova Clínica" href="/admin/clinicas" />
              <QuickAction icon={Trophy} label="Novo Sorteio" href="/admin/sorteio" />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">Atividade Recente</h2>
            <p className="text-gray-500 text-sm">Nenhuma atividade registrada ainda.</p>
          </div>
        </>
      )}
    </>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: 'blue' | 'green' | 'yellow' | 'gold' }) {
  const styles = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    gold: 'bg-[#f5c842]/10 border-[#f5c842]/40 text-[#0a2a5e]',
  };

  return (
    <div className={`rounded-2xl border-2 p-5 ${styles[color]}`}>
      <p className="text-sm font-semibold mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, href }: { icon: React.ComponentType<{ className?: string }>; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-[#f5c842] hover:bg-[#f5c842]/5 transition group"
    >
      <div className="w-10 h-10 bg-[#0a2a5e] rounded-lg flex items-center justify-center group-hover:bg-[#f5c842] transition">
        <Icon className="w-5 h-5 text-white group-hover:text-[#0a2a5e]" />
      </div>
      <span className="text-sm font-semibold text-[#0a2a5e]">{label}</span>
      <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
    </Link>
  );
}
