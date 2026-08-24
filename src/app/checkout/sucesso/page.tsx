'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { CheckCircle, Package, ArrowRight } from '@phosphor-icons/react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <Container className="pt-32 pb-24 min-h-[80vh] flex flex-col items-center justify-center">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Ícone Animado */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-wol-graphite/5 rounded-full animate-ping"></div>
            <CheckCircle size={80} weight="fill" className="text-wol-graphite relative z-10" />
          </div>
        </div>

        {/* Textos */}
        <div className="space-y-4">
          <h1 className="font-display text-3xl md:text-4xl tracking-widest text-wol-graphite uppercase">
            Pedido Realizado!
          </h1>
          <p className="text-wol-graphite/60 leading-relaxed text-sm">
            Obrigado por comprar na WOL. Seu pedido foi processado e já estamos preparando tudo para que a sua luz brilhe ainda mais.
          </p>
        </div>

        {/* Card do Pedido */}
        {orderId && (
          <div className="bg-[#f9f9f9] border border-wol-graphite/10 p-6 flex flex-col items-center justify-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-wol-graphite/40">Número do Pedido</span>
            <span className="text-lg font-bold tracking-wider text-wol-graphite uppercase">#{orderId.split('-')[0]}</span>
          </div>
        )}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-8">
          <Link 
            href="/minha-conta/pedidos"
            className="w-full flex items-center justify-center gap-2 border-2 border-wol-graphite bg-wol-graphite text-wol-white h-12 font-bold uppercase tracking-widest text-xs hover:bg-transparent hover:text-wol-graphite transition-all"
          >
            <Package size={20} />
            Ver meus pedidos
          </Link>
          <Link 
            href="/"
            className="w-full flex items-center justify-center gap-2 border border-wol-graphite/20 bg-transparent text-wol-graphite h-12 font-bold uppercase tracking-widest text-xs hover:border-wol-graphite transition-all"
          >
            Continuar Comprando
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </Container>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-wol-graphite/50 tracking-widest uppercase text-sm">Carregando...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
