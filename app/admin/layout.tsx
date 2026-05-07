'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/admin': { title: 'Dashboard', subtitle: 'Painel administrativo' },
  '/admin/beneficiarios': { title: 'Beneficiários', subtitle: 'Gerenciar beneficiários' },
  '/admin/clinicas': { title: 'Clínicas', subtitle: 'Gerenciar clínicas parceiras' },
  '/admin/financeiro': { title: 'Financeiro', subtitle: 'Relatórios e transações' },
  '/admin/sorteio': { title: 'Sorteio', subtitle: 'Sistema de sorteios' },
  '/admin/especialidades': { title: 'Especialidades', subtitle: 'Gerenciar especialidades' },
  '/admin/configuracoes': { title: 'Configurações', subtitle: 'Configurações do sistema' },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const meta = PAGE_META[pathname] || { title: 'Admin', subtitle: '' };

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#f4f1ec] flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <main className="p-6 flex-1">{children}</main>
      </div>
    </div>
  );
}
