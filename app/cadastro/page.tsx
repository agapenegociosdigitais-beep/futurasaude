'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';

type Step = 1 | 2 | 3;

interface FormData {
  nome_completo: string;
  cpf: string;
  whatsapp: string;
  email: string;
  data_nascimento: string;
  cidade: string;
  bairro: string;
  cep: string;
  beneficiario_nome: string;
  beneficiario_cpf: string;
  beneficiario_data_nascimento: string;
  beneficiario_parentesco: string;
  beneficiario_whatsapp: string;
  password: string;
  password_confirm: string;
  termos: boolean;
}

export default function CadastroPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    nome_completo: '',
    cpf: '',
    whatsapp: '',
    email: '',
    data_nascimento: '',
    cidade: 'Santarém',
    bairro: '',
    cep: '',
    beneficiario_nome: '',
    beneficiario_cpf: '',
    beneficiario_data_nascimento: '',
    beneficiario_parentesco: 'Filho(a)',
    beneficiario_whatsapp: '',
    password: '',
    password_confirm: '',
    termos: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (
        !formData.nome_completo ||
        !formData.cpf ||
        !formData.email ||
        !formData.whatsapp
      ) {
        setError('Preencha todos os campos obrigatórios');
        return;
      }
    } else if (step === 2) {
      if (
        !formData.beneficiario_nome ||
        !formData.beneficiario_cpf ||
        !formData.beneficiario_data_nascimento
      ) {
        setError('Preencha todos os dados do beneficiário');
        return;
      }
    }
    setStep((prev) => ((prev + 1) as Step));
  };

  const handleBack = () => {
    setStep((prev) => ((prev - 1) as Step));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.termos) {
      setError('Você precisa aceitar os termos de uso');
      return;
    }

    if (formData.password !== formData.password_confirm) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Erro ao criar conta');
        return;
      }

      router.push(`/pagamento?beneficiario_id=${data.beneficiario_id}`);
    } catch (err) {
      setError('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* LEFT SIDE - Blue background with success stories */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0a2a5e] to-[#1c3a7a] flex-col items-center justify-center px-8 py-12">
        <div className="max-w-sm">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 mb-8">
              <span className="text-5xl font-bold text-white">fs</span>
              <span className="text-white text-sm">saúde</span>
            </div>
            <h2 className="text-4xl font-bold text-white font-lora mb-4">
              Bem-vindo!
            </h2>
            <p className="text-gray-300 text-lg">
              Seu filho merece saúde de qualidade, onde quer que esteja.
            </p>
          </div>

          <div className="space-y-8">
            {[
              { icon: '✓', text: 'Cadastro rápido e simples', subtext: '3 passos apenas' },
              { icon: '✓', text: 'Dados protegidos', subtext: 'Criptografia 256-bit' },
              { icon: '✓', text: 'Carteirinha ativa', subtext: 'Acesso imediato' },
            ].map((story, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#f5c842] text-[#0a2a5e] font-bold flex items-center justify-center text-lg">
                  {story.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold text-lg font-sora">
                    {story.text}
                  </h3>
                  <p className="text-gray-300 text-sm">{story.subtext}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 pt-16 border-t border-white/20">
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                💡 Dica: Termine seu cadastro agora e acesse a rede completa de clínicas!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-4 py-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Logo (mobile only) */}
          <div className="lg:hidden text-center mb-6">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="text-3xl font-bold text-[#0a2a5e]">fs</span>
              <span className="text-[#0a2a5e] text-xs">saúde</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition ${
                  s <= step ? 'bg-[#f5c842]' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Step Title */}
          <h1 className="text-3xl font-bold text-[#0a2a5e] mb-2 font-lora">
            Cadastro
          </h1>
          <p className="text-gray-600 text-sm mb-6">
            Passo {step} de 3
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
            <form
              onSubmit={step === 3 ? handleSubmit : (e) => {
                e.preventDefault();
                handleNext();
              }}
              className="space-y-6"
            >
              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <h2 className="text-xl font-bold text-[#0a2a5e] mb-6 font-lora">
                    Dados do Responsável
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="nome_completo"
                      value={formData.nome_completo}
                      onChange={handleChange}
                      placeholder="João da Silva"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                      CPF *
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                        WhatsApp *
                      </label>
                      <input
                        type="tel"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleChange}
                        placeholder="(93) 99999-9999"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <h2 className="text-xl font-bold text-[#0a2a5e] mb-6 font-lora">
                    Dados do Beneficiário
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      name="beneficiario_nome"
                      value={formData.beneficiario_nome}
                      onChange={handleChange}
                      placeholder="Maria Silva"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                        CPF *
                      </label>
                      <input
                        type="text"
                        name="beneficiario_cpf"
                        value={formData.beneficiario_cpf}
                        onChange={handleChange}
                        placeholder="000.000.000-00"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        name="beneficiario_data_nascimento"
                        value={formData.beneficiario_data_nascimento}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                        Parentesco
                      </label>
                      <select
                        name="beneficiario_parentesco"
                        value={formData.beneficiario_parentesco}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                      >
                        <option>Filho(a)</option>
                        <option>Cônjuge</option>
                        <option>Dependente</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                        WhatsApp
                      </label>
                      <input
                        type="tel"
                        name="beneficiario_whatsapp"
                        value={formData.beneficiario_whatsapp}
                        onChange={handleChange}
                        placeholder="(93) 99999-9999"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <h2 className="text-xl font-bold text-[#0a2a5e] mb-6 font-lora">
                    Criar Senha
                  </h2>

                  <div>
                    <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                      Senha *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    />
                    <p className="text-xs text-gray-600 mt-2">
                      Mínimo 8 caracteres, com números e letras
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0a2a5e] mb-2">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#f5c842] focus:outline-none"
                    />
                  </div>

                  <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border-2 border-gray-300">
                    <input
                      type="checkbox"
                      name="termos"
                      checked={formData.termos}
                      onChange={handleChange}
                      className="w-5 h-5 mt-1"
                    />
                    <div className="text-sm text-gray-700">
                      Aceito os{' '}
                      <a href="#" className="text-[#f5c842] font-semibold">
                        Termos de Uso
                      </a>
                      {' '}e a{' '}
                      <a href="#" className="text-[#f5c842] font-semibold">
                        Política de Privacidade
                      </a>
                    </div>
                  </label>
                </>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-[#0a2a5e] rounded-lg font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                  >
                    <ChevronLeft className="w-5 h-5" />
                    <span className="hidden sm:inline">Voltar</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-[#f5c842] text-[#0a2a5e] rounded-lg font-bold hover:bg-[#f0b820] transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {step === 3 ? (
                    loading ? (
                      'Criando...'
                    ) : (
                      'Criar Conta'
                    )
                  ) : (
                    <>
                      <span className="hidden sm:inline">Próximo</span>
                      <span className="sm:hidden">Avançar</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Login Link */}
            <p className="text-center text-gray-700 mt-6 text-sm">
              Já tem conta?{' '}
              <Link
                href="/login"
                className="text-[#f5c842] font-bold hover:underline"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
