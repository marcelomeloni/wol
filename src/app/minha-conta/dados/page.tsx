'use client';

import { User, CircleNotch } from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function MinhaContaDados() {
  const { user } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const formatCpf = (value: string) => {
    if (!value) return '';
    const v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length <= 3) return v;
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`;
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`;
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`;
  };

  const formatPhone = (value: string) => {
    if (!value) return '';
    const v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length === 0) return '';
    if (v.length <= 2) return `(${v}`;
    if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`;
    if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`;
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('@wol:token');
      const rawPhone = phone.replace(/\D/g, '');
      
      const res = await fetch('https://wolbackend.vercel.app/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, phone: rawPhone })
      });

      if (!res.ok) {
        throw new Error('Falha ao atualizar dados');
      }

      toast.success('Dados atualizados com sucesso!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar dados');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center py-12">
        <CircleNotch size={32} className="animate-spin text-wol-graphite/40" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-wol-graphite/10 pb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-2 flex items-center gap-2">
          <User size={20} /> Meus Dados
        </h2>
        <p className="text-xs text-wol-graphite/60">Atualize suas informaÃ§Ãµes pessoais e credenciais.</p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Nome Completo</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite text-sm" 
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">E-mail</label>
            <input 
              type="email" 
              value={user.email}
              disabled
              className="w-full border border-wol-graphite/10 bg-[#f9f9f9] text-wol-graphite/50 h-12 px-4 outline-none text-sm cursor-not-allowed" 
            />
            <span className="text-[10px] text-wol-graphite/40 mt-1 block">O e-mail nÃ£o pode ser alterado.</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">CPF</label>
            <input 
              type="text" 
              value={formatCpf(user.cpf)}
              disabled
              className="w-full border border-wol-graphite/10 bg-[#f9f9f9] text-wol-graphite/50 h-12 px-4 outline-none text-sm cursor-not-allowed" 
            />
            <span className="text-[10px] text-wol-graphite/40 mt-1 block">O CPF nÃ£o pode ser alterado apÃ³s o cadastro.</span>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Telefone</label>
            <input 
              type="tel" 
              required
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite text-sm" 
            />
          </div>
        </div>

        <div className="pt-8 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-wol-graphite text-wol-white px-8 h-12 flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs hover:bg-wol-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <CircleNotch size={16} className="animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar AlteraÃ§Ãµes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

