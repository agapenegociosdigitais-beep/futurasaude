'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Share2 } from 'lucide-react';

export default function CarteirinhaDashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Sua Carteirinha Digital
        </h1>

        {/* Main Card */}
        <div className="bg-gradient-to-br from-[#0a2a5e] to-[#1c3a7a] rounded-3xl shadow-2xl p-12 text-white mb-8 aspect-video flex flex-col justify-between">
          <div>
            <div className="text-4xl font-bold mb-2">🏥</div>
            <h2 className="font-lora text-3xl font-bold">FUTURA SAÚDE</h2>
            <p className="text-gray-300">Cartão de Saúde Digital</p>
          </div>
          <div className="grid grid-cols-2 gap-12">
            <div>
              <p className="text-xs opacity-80 mb-2">NÚMERO DA CARTEIRINHA</p>
              <p className="font-mono text-2xl font-bold">FS-2025-00042</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80 mb-2">VÁLIDA ATÉ</p>
              <p className="text-2xl font-bold">04/2026</p>
            </div>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs opacity-80 mb-1">TITULAR</p>
              <p className="text-xl font-semibold">João da Silva</p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80 mb-1">CPF</p>
              <p className="font-mono">000.000.000-00</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <button className="bg-white rounded-xl p-6 border-2 border-gray-300 hover:border-[#f5c842] transition text-left">
            <Download className="w-8 h-8 text-[#f5c842] mb-3" />
            <h3 className="font-bold text-[#0a2a5e]">Baixar em PDF</h3>
            <p className="text-sm text-gray-600">Salve uma cópia no seu dispositivo</p>
          </button>
          <button className="bg-white rounded-xl p-6 border-2 border-gray-300 hover:border-[#f5c842] transition text-left">
            <Share2 className="w-8 h-8 text-[#f5c842] mb-3" />
            <h3 className="font-bold text-[#0a2a5e]">Compartilhar</h3>
            <p className="text-sm text-gray-600">Envie para familiares da forma segura</p>
          </button>
          <button className="bg-white rounded-xl p-6 border-2 border-gray-300 hover:border-[#f5c842] transition text-left">
            <div className="text-2xl mb-3">📱</div>
            <h3 className="font-bold text-[#0a2a5e]">Modo Offline</h3>
            <p className="text-sm text-gray-600">Use sem internet</p>
          </button>
        </div>

        {/* Info */}
        <div className="bg-white rounded-xl p-8 border-2 border-gray-300">
          <h2 className="text-xl font-bold text-[#0a2a5e] mb-6">Dados da Carteirinha</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Nome Completo</p>
              <p className="font-semibold text-[#0a2a5e]">João Silva Santos</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">CPF</p>
              <p className="font-semibold text-[#0a2a5e]">000.000.000-00</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Data de Nascimento</p>
              <p className="font-semibold text-[#0a2a5e]">15/03/2010</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Tipo</p>
              <p className="font-semibold text-[#0a2a5e]">Beneficiário</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Plano Válido de</p>
              <p className="font-semibold text-[#0a2a5e]">18/04/2025 a 18/04/2026</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Score de Engajamento</p>
              <p className="font-semibold text-[#0a2a5e]">85/100</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
