'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';

export default function ConfiguracoesAdmin() {
  const [config, setConfig] = useState({
    nomeEmpresa: 'Futura Saúde',
    cnpj: '00.000.000/0001-00',
    email: 'contato@futurasaude.com.br',
    telefone: '(93) 3222-0000',
    whatsapp: '5593992000000',
    endereco: 'Santarém, PA',
    valorMensalidade: '49.90',
    whatsappNotificacao: true,
    emailNotificacao: true,
    smsNotificacao: false,
  });

  const handleSave = () => {
    alert('Configurações salvas!');
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">Informações da Empresa</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Empresa</label>
            <input
              type="text"
              value={config.nomeEmpresa}
              onChange={(e) => setConfig({ ...config, nomeEmpresa: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ</label>
            <input
              type="text"
              value={config.cnpj}
              onChange={(e) => setConfig({ ...config, cnpj: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={config.telefone}
              onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">Notificações</h2>
        <div className="space-y-3">
          {[
            { key: 'whatsappNotificacao', label: 'Notificações via WhatsApp', desc: 'Enviar alertas pelo WhatsApp' },
            { key: 'emailNotificacao', label: 'Notificações via Email', desc: 'Enviar alertas por email' },
            { key: 'smsNotificacao', label: 'Notificações via SMS', desc: 'Enviar alertas por SMS' },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-[#f5c842] transition cursor-pointer">
              <div>
                <p className="font-semibold text-[#0a2a5e]">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <div className={`w-12 h-6 rounded-full transition ${config[item.key as keyof typeof config] ? 'bg-[#f5c842]' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition ${config[item.key as keyof typeof config] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">Financeiro</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Valor da Mensalidade (R$)</label>
            <input
              type="text"
              value={config.valorMensalidade}
              onChange={(e) => setConfig({ ...config, valorMensalidade: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp da Empresa</label>
            <input
              type="text"
              value={config.whatsapp}
              onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="px-8 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition flex items-center gap-2">
        <Save className="w-5 h-5" />
        Salvar Configurações
      </button>
    </>
  );
}
