'use client';

import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

export default function ConfiguracesDashboard() {
  const [settings, setSettings] = useState({
    nome: 'João da Silva',
    email: 'joao@email.com',
    whatsapp: '(93) 99999-9999',
    notificacoes_email: true,
    notificacoes_whatsapp: true,
    compartilhar_perfil: false,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Configurações
        </h1>

        <div className="bg-white rounded-xl border-2 border-gray-300 p-8 space-y-8">
          {/* Perfil */}
          <div>
            <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
              Meu Perfil
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={settings.nome}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">Email não pode ser alterado</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={settings.whatsapp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-300" />

          {/* Notificações */}
          <div>
            <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
              Notificações
            </h2>
            <div className="space-y-4">
              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-[#f5c842] transition cursor-pointer">
                <input
                  type="checkbox"
                  name="notificacoes_email"
                  checked={settings.notificacoes_email}
                  onChange={handleChange}
                  className="w-5 h-5 rounded"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#0a2a5e]">Notificações por Email</p>
                  <p className="text-sm text-gray-600">
                    Receba atualizações sobre agendamentos
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-[#f5c842] transition cursor-pointer">
                <input
                  type="checkbox"
                  name="notificacoes_whatsapp"
                  checked={settings.notificacoes_whatsapp}
                  onChange={handleChange}
                  className="w-5 h-5 rounded"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#0a2a5e]">Notificações por WhatsApp</p>
                  <p className="text-sm text-gray-600">
                    Receba lembretes no seu WhatsApp
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-[#f5c842] transition cursor-pointer">
                <input
                  type="checkbox"
                  name="compartilhar_perfil"
                  checked={settings.compartilhar_perfil}
                  onChange={handleChange}
                  className="w-5 h-5 rounded"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#0a2a5e]">Compartilhar Perfil Públicamente</p>
                  <p className="text-sm text-gray-600">
                    Permitir que outros vejam seus agendamentos (apenas estatísticas)
                  </p>
                </div>
              </label>
            </div>
          </div>

          <hr className="my-8 border-gray-300" />

          {/* Segurança */}
          <div>
            <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
              Segurança
            </h2>
            <div className="space-y-4">
              <button className="w-full px-6 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-semibold hover:bg-gray-50 transition text-left">
                Alterar Senha
              </button>
              <button className="w-full px-6 py-3 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition text-left">
                Desativar Conta
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4 pt-8">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-bold hover:bg-[#f0b820] transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saved ? 'Salvo!' : 'Salvar Mudanças'}
            </button>
            <button className="px-6 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-bold hover:bg-gray-50 transition">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
