'use client';

import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';

export default function ConfiguracoesAdmin() {
  const [settings, setSettings] = useState({
    app_name: 'Futura Saúde',
    max_vagas: '100',
    preco_plano: '99.90',
    dias_validade: '365',
    email_suporte: 'suporte@futurasaude.com.br',
    whatsapp_suporte: '5593992173231',
    notificacoes_ativas: true,
    permitir_cadastros: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSave = async () => {
    // Simular API call
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Link href="/admin" className="flex items-center gap-2 text-[#0a2a5e] font-semibold mb-8 hover:underline">
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </Link>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-[#0a2a5e] mb-8 font-lora">
          Configurações do Sistema
        </h1>

        <div className="bg-white rounded-xl border-2 border-gray-300 p-8 space-y-8">
          {/* App Settings */}
          <div>
            <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
              Aplicação
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                  Nome da Aplicação
                </label>
                <input
                  type="text"
                  name="app_name"
                  value={settings.app_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                    Máximo de Vagas (Desconto)
                  </label>
                  <input
                    type="number"
                    name="max_vagas"
                    value={settings.max_vagas}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                    Preço do Plano (R$)
                  </label>
                  <input
                    type="text"
                    name="preco_plano"
                    value={settings.preco_plano}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                  Dias de Validade do Plano
                </label>
                <input
                  type="number"
                  name="dias_validade"
                  value={settings.dias_validade}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                />
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-300" />

          {/* Contact Settings */}
          <div>
            <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
              Contato e Suporte
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                  Email de Suporte
                </label>
                <input
                  type="email"
                  name="email_suporte"
                  value={settings.email_suporte}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                  WhatsApp de Suporte
                </label>
                <input
                  type="tel"
                  name="whatsapp_suporte"
                  value={settings.whatsapp_suporte}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                  placeholder="5593992173231"
                />
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-300" />

          {/* Toggles */}
          <div>
            <h2 className="text-2xl font-bold text-[#0a2a5e] mb-6 font-lora">
              Funcionalidades
            </h2>
            <div className="space-y-4">
              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-[#f5c842] transition cursor-pointer">
                <input
                  type="checkbox"
                  name="notificacoes_ativas"
                  checked={settings.notificacoes_ativas}
                  onChange={handleChange}
                  className="w-5 h-5 rounded"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#0a2a5e]">Notificações Ativas</p>
                  <p className="text-sm text-gray-600">
                    Enviar emails e WhatsApp para beneficiários
                  </p>
                </div>
              </label>

              <label className="flex items-center p-4 border-2 border-gray-300 rounded-lg hover:border-[#f5c842] transition cursor-pointer">
                <input
                  type="checkbox"
                  name="permitir_cadastros"
                  checked={settings.permitir_cadastros}
                  onChange={handleChange}
                  className="w-5 h-5 rounded"
                />
                <div className="ml-4">
                  <p className="font-semibold text-[#0a2a5e]">Permitir Novos Cadastros</p>
                  <p className="text-sm text-gray-600">
                    Ativar/desativar novos registros no sistema
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex gap-4 pt-8">
            <button
              onClick={handleSave}
              className="flex-1 px-6 py-4 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-bold text-lg hover:bg-[#f0b820] transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {saved ? 'Saved!' : 'Salvar Configurações'}
            </button>
            <button className="px-6 py-4 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-bold hover:bg-gray-50 transition">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
