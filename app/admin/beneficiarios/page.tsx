'use client';

import { useState } from 'react';
import { Search, Filter, Edit, Lock, Trash2 } from 'lucide-react';

export default function BeneficiariosAdmin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [beneficiarios] = useState([
    { id: 1, nome: 'João Silva Santos', cpf: '000.000.000-01', email: 'joao@email.com', status: 'ativo', cartao: 'FS-2025-00042', validade: '18/04/2026', score: 85 },
    { id: 2, nome: 'Maria Oliveira Costa', cpf: '000.000.000-02', email: 'maria@email.com', status: 'ativo', cartao: 'FS-2025-00043', validade: '20/04/2026', score: 72 },
    { id: 3, nome: 'Carlos Alberto Souza', cpf: '000.000.000-03', email: 'carlos@email.com', status: 'pendente', cartao: 'FS-2025-00044', validade: '22/04/2026', score: 0 },
  ]);

  const filtered = beneficiarios.filter(
    (b) =>
      b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.cpf.includes(searchTerm) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
            />
          </div>
          <button className="px-6 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Nome</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">CPF</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Email</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Cartão</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Status</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Score</th>
                <th className="px-6 py-4 text-left font-bold text-[#0a2a5e]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-[#0a2a5e]">{b.nome}</td>
                  <td className="px-6 py-4 text-gray-700 font-mono text-sm">{b.cpf}</td>
                  <td className="px-6 py-4 text-gray-700 text-sm">{b.email}</td>
                  <td className="px-6 py-4 text-gray-700 font-mono text-sm">{b.cartao}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700 font-semibold">{b.score}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition"><Edit className="w-5 h-5 text-blue-600" /></button>
                    <button className="p-2 hover:bg-yellow-100 rounded-lg transition"><Lock className="w-5 h-5 text-yellow-600" /></button>
                    <button className="p-2 hover:bg-red-100 rounded-lg transition"><Trash2 className="w-5 h-5 text-red-600" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        <div className="bg-green-50 rounded-2xl border-2 border-green-200 p-6">
          <p className="text-green-700 font-semibold mb-2">Beneficiários Ativos</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">2</p>
        </div>
        <div className="bg-yellow-50 rounded-2xl border-2 border-yellow-200 p-6">
          <p className="text-yellow-700 font-semibold mb-2">Pendentes de Aprovação</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">1</p>
        </div>
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-6">
          <p className="text-blue-700 font-semibold mb-2">Total</p>
          <p className="text-3xl font-bold text-[#0a2a5e]">3</p>
        </div>
      </div>
    </>
  );
}
