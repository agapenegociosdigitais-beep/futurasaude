'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  DollarSign,
  Trophy,
  Stethoscope,
  Settings,
  LogOut,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'beneficiarios', label: 'Beneficiários', icon: Users, href: '/admin/beneficiarios' },
  { id: 'clinicas', label: 'Clínicas', icon: Building2, href: '/admin/clinicas' },
  { id: 'financeiro', label: 'Financeiro', icon: DollarSign, href: '/admin/financeiro' },
  { id: 'sorteio', label: 'Sorteio', icon: Trophy, href: '/admin/sorteio' },
  { id: 'especialidades', label: 'Especialidades', icon: Stethoscope, href: '/admin/especialidades' },
  { id: 'configuracoes', label: 'Configurações', icon: Settings, href: '/admin/configuracoes' },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin/login';
  };

  return (
    <>
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 z-40 h-screen bg-[#0a2a5e] transition-all duration-300 flex flex-col shrink-0 ${
          open ? 'w-64' : 'w-0 lg:w-64'
        } overflow-hidden lg:overflow-visible`}
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-xl font-bold text-white">FUTURA</span>
            <span className="text-xl font-bold text-[#f5c842]">SAÚDE</span>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={`flex items-center gap-3 px-5 py-3 text-sm transition border-l-[3px] ${
                  active
                    ? 'bg-[#f5c842]/15 text-[#f5c842] border-[#f5c842]'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 text-sm text-white/60 hover:text-red-400 transition w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span className="whitespace-nowrap">Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}
