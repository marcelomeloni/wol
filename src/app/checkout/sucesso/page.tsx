'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { CheckCircle, Package, ArrowRight, CopySimple } from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';

interface OrderItem {
  id: string;
  snapshot_product_name: string;
  snapshot_color_name: string;
  snapshot_size_name: string;
  quantity: number;
  unit_price: number;
}

interface OrderData {
  id: string;
  status: string;
  payment_method: string;
  total_amount: number;
  shipping_cost: number;
  discount_amount: number;
  created_at: string;
  items: OrderItem[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('@wol:token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    fetch(`https://wolbackend.vercel.app/api/orders/${orderId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) setOrder(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [orderId]);

  const subtotal = order ? order.items?.reduce((acc: number, item: OrderItem) => acc + (item.unit_price * item.quantity), 0) : 0;

  return (
    <Container className="pt-32 pb-24 min-h-[80vh]">
      <div className="max-w-2xl mx-auto space-y-10">
        
        {/* Header com check animado */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-wol-graphite/5 rounded-full animate-ping"></div>
              <CheckCircle size={80} weight="fill" className="text-wol-graphite relative z-10" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl md:text-4xl tracking-widest text-wol-graphite uppercase">
              Pedido Realizado!
            </h1>
            <p className="text-wol-graphite/60 leading-relaxed text-sm max-w-md mx-auto">
              Obrigado por comprar na WOL. Seu pedido foi processado e já estamos preparando tudo para que a sua luz brilhe ainda mais.
            </p>
          </div>
        </div>

        {/* Número do Pedido */}
        {orderId && (
          <div className="bg-[#f9f9f9] border border-wol-graphite/10 p-6 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-wol-graphite/40 block mb-1">
                N&uacute;mero do Pedido
              </span>
              <span className="text-lg font-bold tracking-wider text-wol-graphite uppercase">
                #{orderId.split('-')[0]}
              </span>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(orderId);
                toast.success('ID copiado!');
              }}
              className="p-2 hover:bg-wol-graphite/5 transition-colors rounded"
              title="Copiar ID"
            >
              <CopySimple size={20} className="text-wol-graphite/40" />
            </button>
          </div>
        )}

        {/* Resumo do Pedido */}
        {isLoading ? (
          <div className="bg-[#f9f9f9] border border-wol-graphite/10 p-8 text-center">
            <p className="text-sm text-wol-graphite/40 uppercase tracking-widest animate-pulse">Carregando resumo...</p>
          </div>
        ) : order && order.items && order.items.length > 0 ? (
          <div className="bg-[#f9f9f9] border border-wol-graphite/10 p-8 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite border-b border-wol-graphite/10 pb-4">
              Resumo da Compra
            </h2>

            {/* Itens */}
            <div className="space-y-4">
              {order.items.map((item: OrderItem) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-wol-graphite/5 last:border-0">
                  <div className="flex-1">
                    <h4 className="font-bold text-wol-graphite uppercase text-xs leading-tight mb-1">
                      {item.snapshot_product_name}
                    </h4>
                    <p className="text-[10px] text-wol-graphite/60 uppercase tracking-wider">
                      {item.snapshot_color_name} | TAM {item.snapshot_size_name} | QTD: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-wol-graphite">
                    {formatPrice(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totais */}
            <div className="space-y-2 pt-4 border-t border-wol-graphite/10">
              <div className="flex justify-between text-sm">
                <span className="text-wol-graphite/60">Subtotal</span>
                <span className="font-medium text-wol-graphite">{formatPrice(subtotal)}</span>
              </div>
              
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-wol-pink">
                  <span className="font-medium uppercase tracking-widest text-xs">Desconto</span>
                  <span className="font-medium">- {formatPrice(order.discount_amount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-wol-graphite/60">Frete</span>
                <span className="font-medium text-wol-graphite">{formatPrice(order.shipping_cost || 15)}</span>
              </div>

              <div className="flex justify-between text-lg pt-3 border-t border-wol-graphite/10">
                <span className="font-bold uppercase tracking-widest text-wol-graphite">Total</span>
                <span className="font-bold text-wol-graphite">{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            {/* Método de Pagamento */}
            <div className="pt-4 border-t border-wol-graphite/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-wol-graphite/60">Pagamento</span>
                <span className="font-bold uppercase tracking-widest text-xs text-wol-graphite">
                  {order.payment_method === 'pix' ? 'PIX' : order.payment_method === 'credit_card' ? 'Cart&atilde;o de Cr&eacute;dito' : order.payment_method}
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Botões */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
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
