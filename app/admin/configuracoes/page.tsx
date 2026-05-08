'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, CheckCircle, Settings, AlertCircle } from 'lucide-react';

interface ConfigItem {
  id: string;
  chave: string;
  valor: string;
  atualizado_em: string;
}

export default function ConfiguracoesAdmin() {
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    nomeEmpresa: 'Futura Saúde',
    cnpj: '',
    email: 'contato@futurasaude.com.br',
    telefone: '',
    whatsapp: '5593992173231',
    endereco: 'Santarém, PA',
    valorMensalidade: '49.90',
    whatsappNotificacao: 'true',
    emailNotificacao: 'true',
    smsNotificacao: 'false',
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/configuracoes');
      if (res.ok) {
        const data: ConfigItem[] = await res.json();
        setConfigs(data);
        const map: Record<string, string> = {};
        data.forEach((c) => { map[c.chave] = c.valor; });
        setForm((prev) => ({
          ...prev,
          nomeEmpresa: map.nome_empresa || prev.nomeEmpresa,
          cnpj: map.cnpj || '',
          email: map.email || prev.email,
          telefone: map.telefone || '',
          whatsapp: map.whatsapp || prev.whatsapp,
          endereco: map.endereco || prev.endereco,
          valorMensalidade: map.valor_mensalidade || prev.valorMensalidade,
          whatsappNotificacao: map.whatsapp_notificacao ?? prev.whatsappNotificacao,
          emailNotificacao: map.email_notificacao ?? prev.emailNotificacao,
          smsNotificacao: map.sms_notificacao ?? prev.smsNotificacao,
        }));
      } else {
        setError('Erro ao carregar configurações');
      }
    } catch {
      setError('Erro de conexão ao carregar configurações');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');

    const valorNum = parseFloat(form.valorMensalidade);
    if (isNaN(valorNum) || valorNum < 0) {
      setError('Valor da mensalidade deve ser um número positivo');
      setSaving(false);
      return;
    }

    try {
      const entries = [
        { chave: 'nome_empresa', valor: form.nomeEmpresa },
        { chave: 'cnpj', valor: form.cnpj },
        { chave: 'email', valor: form.email },
        { chave: 'telefone', valor: form.telefone },
        { chave: 'whatsapp', valor: form.whatsapp },
        { chave: 'endereco', valor: form.endereco },
        { chave: 'valor_mensalidade', valor: form.valorMensalidade },
        { chave: 'whatsapp_notificacao', valor: form.whatsappNotificacao },
        { chave: 'email_notificacao', valor: form.emailNotificacao },
        { chave: 'sms_notificacao', valor: form.smsNotificacao },
      ];

      const results = await Promise.allSettled(
        entries.map((e) =>
          fetch('/api/admin/configuracoes', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(e),
          })
        )
      );

      const failed = results.filter((r) => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.ok));
      if (failed.length > 0) {
        setError(`${failed.length} configuração(ões) falharam ao salvar`);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: 'whatsappNotificacao' | 'emailNotificacao' | 'smsNotificacao') => {
    const current = form[key] === 'true';
    setForm({ ...form, [key]: (!current).toString() });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-[3px] border-[#0a2a5e] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex justify-between items-center">
          <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" />{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2">&times;</button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-[#0a2a5e] mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Informações da Empresa
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nome da Empresa</label>
            <input
              type="text"
              value={form.nomeEmpresa}
              onChange={(e) => setForm({ ...form, nomeEmpresa: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">CNPJ</label>
            <input
              type="text"
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
              placeholder="00.000.000/0001-00"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Telefone</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
              placeholder="(93) 3222-0000"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-bold text-[#0a2a5e] mb-4">Notificações</h2>
        <div className="space-y-3">
          {([
            { key: 'whatsappNotificacao' as const, label: 'Notificações via WhatsApp', desc: 'Enviar alertas pelo WhatsApp' },
            { key: 'emailNotificacao' as const, label: 'Notificações via Email', desc: 'Enviar alertas por email' },
            { key: 'smsNotificacao' as const, label: 'Notificações via SMS', desc: 'Enviar alertas por SMS' },
          ]).map((item) => (
            <label
              key={item.key}
              className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-[#f5c842] transition cursor-pointer"
            >
              <div>
                <p className="font-semibold text-[#0a2a5e]">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(item.key)}
                className={`w-12 h-6 rounded-full transition ${form[item.key] === 'true' ? 'bg-[#f5c842]' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow mt-0.5 transition ${form[item.key] === 'true' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
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
              value={form.valorMensalidade}
              onChange={(e) => setForm({ ...form, valorMensalidade: e.target.value })}
              className={`w-full px-4 py-3 border-2 ${isNaN(parseFloat(form.valorMensalidade)) ? 'border-red-400' : 'border-gray-300'} rounded-lg focus:border-[#f5c842] focus:outline-none`}
            />
            {isNaN(parseFloat(form.valorMensalidade)) && (
              <p className="text-xs text-red-500 mt-1">Valor inválido</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp da Empresa</label>
            <input
              type="text"
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Endereço</label>
            <input
              type="text"
              value={form.endereco}
              onChange={(e) => setForm({ ...form, endereco: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-xl font-bold hover:bg-[#f0b820] transition disabled:opacity-50 flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
        {saved && !error && (
          <span className="flex items-center gap-2 text-green-600 font-semibold text-sm">
            <CheckCircle className="w-5 h-5" />
            Salvo com sucesso!
          </span>
        )}
      </div>
    </>
  );
}
