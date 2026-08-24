'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, EnvelopeSimple, LockKey, User, IdentificationCard, Phone, CircleNotch } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login, register } = useAuth();

  const formatCpf = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    const v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length === 0) return '';
    if (v.length <= 2) return `(${v}`;
    if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({}); // limpa erros anteriores
    
    try {
      if (mode === 'login') {
        await login({ email, password });
      } else {
        const rawCpf = cpf.replace(/\D/g, '');
        const rawPhone = phone.replace(/\D/g, '');
        await register({ name, email, password, cpf: rawCpf, phone: rawPhone });
        // Se registrou com sucesso, muda para login
        setMode('login');
        setPassword('');
      }
    } catch (error: any) {
      if (error.isValidationError && Array.isArray(error.errors)) {
        const errorsMap: Record<string, string> = {};
        error.errors.forEach((err: any) => {
          if (err.path && err.path[0]) {
            errorsMap[err.path[0]] = err.message;
          }
        });
        setFieldErrors(errorsMap);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-wol-white">
      
      {/* LEFT: Formulário (Login / Registro) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 lg:px-32 relative py-20">
        
        {/* Voltar */}
        <Link 
          href="/" 
          className="absolute top-8 left-8 sm:left-16 text-wol-graphite flex items-center gap-2 font-bold uppercase tracking-widest text-xs hover:opacity-50 transition-opacity"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>

        <div className="max-w-md w-full mx-auto">
          <div className="mb-12">
            <h1 className="font-display text-4xl text-wol-graphite">
              {mode === 'login' ? 'BEM-VINDA DE VOLTA' : 'JUNTE-SE À NÓS'}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {mode === 'register' && (
              <>
                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">Nome Completo</label>
                  <div className="relative flex items-center">
                    <User size={18} className="absolute left-4 text-wol-graphite/40" />
                    <input 
                      type="text" 
                      required 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full border bg-transparent h-12 pl-12 pr-4 outline-none transition-colors text-wol-graphite text-sm ${fieldErrors['name'] ? 'border-wol-pink/50 focus:border-wol-pink' : 'border-wol-graphite/20 focus:border-wol-graphite'}`}
                      placeholder="Como devemos te chamar?"
                    />
                  </div>
                  {fieldErrors['name'] && <span className="text-[#e23b5d] text-xs mt-2 block font-medium">{fieldErrors['name']}</span>}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">CPF</label>
                  <div className="relative flex items-center">
                    <IdentificationCard size={18} className="absolute left-4 text-wol-graphite/40" />
                    <input 
                      type="text" 
                      required 
                      value={cpf}
                      onChange={(e) => setCpf(formatCpf(e.target.value))}
                      className={`w-full border bg-transparent h-12 pl-12 pr-4 outline-none transition-colors text-wol-graphite text-sm ${fieldErrors['cpf'] ? 'border-wol-pink/50 focus:border-wol-pink' : 'border-wol-graphite/20 focus:border-wol-graphite'}`}
                      placeholder="000.000.000-00"
                    />
                  </div>
                  {fieldErrors['cpf'] && <span className="text-[#e23b5d] text-xs mt-2 block font-medium">{fieldErrors['cpf']}</span>}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">Telefone</label>
                  <div className="relative flex items-center">
                    <Phone size={18} className="absolute left-4 text-wol-graphite/40" />
                    <input 
                      type="tel" 
                      required 
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      className={`w-full border bg-transparent h-12 pl-12 pr-4 outline-none transition-colors text-wol-graphite text-sm ${fieldErrors['phone'] ? 'border-wol-pink/50 focus:border-wol-pink' : 'border-wol-graphite/20 focus:border-wol-graphite'}`}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  {fieldErrors['phone'] && <span className="text-[#e23b5d] text-xs mt-2 block font-medium">{fieldErrors['phone']}</span>}
                </div>
              </>
            )}

            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">E-mail</label>
              <div className="relative flex items-center">
                <EnvelopeSimple size={18} className="absolute left-4 text-wol-graphite/40" />
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border bg-transparent h-12 pl-12 pr-4 outline-none transition-colors text-wol-graphite text-sm ${fieldErrors['email'] ? 'border-wol-pink/50 focus:border-wol-pink' : 'border-wol-graphite/20 focus:border-wol-graphite'}`}
                  placeholder="seu@email.com"
                />
              </div>
              {fieldErrors['email'] && <span className="text-[#e23b5d] text-xs mt-2 block font-medium">{fieldErrors['email']}</span>}
            </div>

            <div className="relative">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">Senha</label>
              <div className="relative flex items-center">
                <LockKey size={18} className="absolute left-4 text-wol-graphite/40" />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full border bg-transparent h-12 pl-12 pr-4 outline-none transition-colors text-wol-graphite text-sm ${fieldErrors['password'] ? 'border-wol-pink/50 focus:border-wol-pink' : 'border-wol-graphite/20 focus:border-wol-graphite'}`}
                  placeholder="••••••••"
                />
              </div>
              {fieldErrors['password'] && <span className="text-[#e23b5d] text-xs mt-2 block font-medium">{fieldErrors['password']}</span>}
            </div>

            {mode === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 hover:text-wol-graphite transition-colors">
                  Esqueceu a senha?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-12 bg-wol-graphite text-wol-white font-bold uppercase tracking-widest text-sm hover:bg-wol-black transition-colors mt-4 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <CircleNotch size={20} className="animate-spin" />
                  {mode === 'login' ? 'ENTRANDO...' : 'CRIANDO CONTA...'}
                </>
              ) : (
                mode === 'login' ? 'Entrar' : 'Criar Conta'
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              disabled={isSubmitting}
              className="text-xs font-bold uppercase tracking-widest text-wol-graphite/60 hover:text-wol-graphite transition-colors border-b border-wol-graphite/20 pb-1 disabled:opacity-50"
            >
              {mode === 'login' ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Entre'}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Imagem de Impacto & Tipografia */}
      <div className="hidden lg:flex w-1/2 bg-[#111111] relative items-center justify-center overflow-hidden">
        
        {/* Imagem gerada */}
        <Image 
          src="/loginimage.png" 
          alt="WOL Darkness and Light"
          fill
          priority
          className="object-cover opacity-90 transition-transform duration-[3s] hover:scale-105"
        />

        {/* Gradiente escuro no rodapé para destacar a tipografia */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 z-10" />

        {/* Tipografia Minimalista (Estilo Editorial) */}
        <div className="absolute bottom-12 left-0 right-0 z-20 flex flex-col items-center justify-center text-center">
          <h2 className="font-display text-4xl md:text-5xl tracking-[0.15em] text-wol-white opacity-90 drop-shadow-lg">
            WORDS OF LIGHT
          </h2>
        </div>
      </div>

    </div>
  );
}
