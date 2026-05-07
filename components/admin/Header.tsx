'use client';

import { Menu } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick: () => void;
}

export default function AdminHeader({ title, subtitle, onMenuClick }: AdminHeaderProps) {
  const initials = typeof window !== 'undefined'
    ? (document.cookie.match(/user_name=([^;]+)/)?.[1]?.charAt(0)?.toUpperCase() || 'A')
    : 'A';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-[#0a2a5e] hover:bg-gray-100 p-2 rounded-lg transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#0a2a5e]">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600 hidden sm:block">Admin</span>
        <div className="w-9 h-9 bg-[#0a2a5e] rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-bold">{initials}</span>
        </div>
      </div>
    </header>
  );
}
