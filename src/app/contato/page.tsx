'use client';

import { Container } from '@/components/ui/Container';
import { EnvelopeSimple, WhatsappLogo, InstagramLogo } from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';

export default function ContatoPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Mensagem enviada com sucesso! Retornaremos em breve.');
  };

  return (
    <div className="min-h-screen bg-wol-white pt-12 pb-24">
      <Container>
        
        {/* Header Section */}
        <div className="flex flex-col items-center text-center space-y-6 mb-20 mt-10">
          <div className="w-12 h-[1px] bg-wol-pink" />
          <h1 className="font-display text-5xl md:text-7xl text-wol-graphite tracking-tight uppercase">
            Fale <span className="text-wol-pink drop-shadow-[2px_2px_0_#303039] md:drop-shadow-[3px_3px_0_#303039]">Conosco</span>
          </h1>
        </div>

        <div className="max-w-2xl mx-auto flex flex-col gap-16">
          
          {/* Informações de Contato */}
          <div className="space-y-12">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-8 border-b border-wol-graphite/10 pb-4">
                Informações Diretas
              </h2>
              <div className="flex flex-col sm:flex-row gap-6">

                <a href="https://wa.me/5511999999999" target="_blank" rel="noreferrer" className="flex-1 flex items-start gap-4 group border border-wol-graphite/10 p-6 hover:border-wol-graphite/30 transition-colors">
                  <div className="w-12 h-12 bg-[#f9f9f9] flex items-center justify-center text-wol-graphite group-hover:bg-wol-graphite group-hover:text-wol-white transition-colors shrink-0">
                    <WhatsappLogo size={24} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-wol-graphite mb-1">WhatsApp</h3>
                    <p className="text-sm text-wol-graphite/60">(11) 99999-9999</p>
                    <p className="text-[10px] text-wol-graphite/40 uppercase tracking-widest mt-1">Seg a Sex, 09h às 18h</p>
                  </div>
                </a>

                <a href="https://instagram.com/wear.wol" target="_blank" rel="noreferrer" className="flex-1 flex items-start gap-4 group border border-wol-graphite/10 p-6 hover:border-wol-graphite/30 transition-colors">
                  <div className="w-12 h-12 bg-[#f9f9f9] flex items-center justify-center text-wol-graphite group-hover:bg-wol-graphite group-hover:text-wol-white transition-colors shrink-0">
                    <InstagramLogo size={24} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-wol-graphite mb-1">Instagram</h3>
                    <p className="text-sm text-wol-graphite/60">@wear.wol</p>
                  </div>
                </a>

              </div>
            </div>
          </div>

          {/* Formulário de Contato */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-8 border-b border-wol-graphite/10 pb-4">
              Envie uma Mensagem
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">Nome Completo</label>
                  <input type="text" required className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite text-sm" />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">E-mail</label>
                  <input type="email" required className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite text-sm" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">Assunto</label>
                  <select required className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite text-sm appearance-none">
                    <option value="">Selecione o assunto</option>
                    <option value="Dúvida">Dúvida sobre Produto</option>
                    <option value="Pedido">Meu Pedido</option>
                    <option value="Troca">Troca / Devolução</option>
                    <option value="Parceria">Parcerias</option>
                    <option value="Outro">Outros</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">Mensagem</label>
                  <textarea required rows={5} className="w-full border border-wol-graphite/20 bg-transparent p-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite text-sm resize-none"></textarea>
                </div>
              </div>

              <button type="submit" className="w-full bg-wol-graphite text-wol-white font-bold uppercase tracking-widest py-4 hover:bg-wol-black transition-colors text-xs">
                Enviar Mensagem
              </button>
            </form>
          </div>

        </div>
      </Container>
    </div>
  );
}
