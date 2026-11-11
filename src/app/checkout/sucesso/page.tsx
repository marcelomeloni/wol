'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { CheckCircle, Package, ArrowRight, CopySimple, CircleNotch, QrCode } from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

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
  payment_status: string;
  payment_method: string;
  total_amount: number;
  shipping_amount: number;
  discount_amount: number;
  created_at: string;
  order_items: OrderItem[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Aguardando pagamento',
  PREPARING: 'Em preparação',
  PAYMENT_APPROVED: 'Pagamento aprovado',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderId));
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const fetchOrder = useCallback(async () => {
    if (!orderId) return null;
    try {
      const data = await apiFetch<OrderData>(`/orders/${orderId}`);
      setOrder(data);
      return data;
    } catch {
      return null;
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    let active = true;

    (async () => {
      const data = await fetchOrder();
      if (!active) return;
      setIsLoading(false);

      // Enquanto o pagamento não for confirmado, consulta o status periodicamente.
      if (data && data.payment_status !== 'PAID' && data.status !== 'CANCELED') {
        pollRef.current = setInterval(async () => {
          const updated = await fetchOrder();
          if (!updated) return;
          if (updated.payment_status === 'PAID') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
            toast.success('Pagamento confirmado! Já estamos preparando seu pedido.');
          }
          if (updated.status === 'CANCELED') {
            if (pollRef.current) clearInterval(pollRef.current);
            pollRef.current = null;
          }
        }, 5000);
      }
    })();

    return () => {
      active = false;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [orderId, fetchOrder]);

  const subtotal = order ? order.order_items?.reduce((acc: number, item: OrderItem) => acc + (item.unit_price * item.quantity), 0) : 0;
  const isPaid = order?.payment_status === 'PAID';
  const isCanceled = order?.status === 'CANCELED';

  return (
    <Container className="pt-32 pb-24 min-h-[80vh]">
      <div className="max-w-2xl mx-auto space-y-10">
        
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-wol-graphite/5 rounded-full animate-ping"></div>
              {isPaid ? (
                <CheckCircle size={80} weight="fill" className="text-wol-graphite relative z-10" />
              ) : (
                <QrCode size={80} className="text-wol-graphite relative z-10" />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="font-display text-3xl md:text-4xl tracking-widest text-wol-graphite uppercase">
              {isCanceled
                ? 'Pedido Cancelado'
                : isPaid
                  ? 'Pedido Realizado!'
                  : 'Pedido Criado!'}
            </h1>
            <p className="text-wol-graphite/60 leading-relaxed text-sm max-w-md mx-auto">
              {isCanceled
                ? 'Este pedido foi cancelado. Se você Efetuou um pagamento, entre em contato conosco.'
                : isPaid
                  ? 'Obrigado por comprar na WOL. Seu pagamento foi confirmado e já estamos preparando tudo para que a sua luz brilhe ainda mais.'
                  : 'Seu pedido foi criado e está aguardando a confirmação do pagamento. Acompanhe o status abaixo — avisaremos assim que for aprovado.'}
            </p>
          </div>

          {!isPaid && !isCanceled && (
            <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-wol-graphite/50">
              <CircleNotch size={14} className="animate-spin" />
              Aguardando confirmação do pagamento
            </div>
          )}
        </div>

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

        {isLoading ? (
          <div className="bg-[#f9f9f9] border border-wol-graphite/10 p-8 text-center">
            <p className="text-sm text-wol-graphite/40 uppercase tracking-widest animate-pulse">Carregando resumo...</p>
          </div>
        ) : order && order.order_items && order.order_items.length > 0 ? (
          <div className="bg-[#f9f9f9] border border-wol-graphite/10 p-8 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite border-b border-wol-graphite/10 pb-4">
              Resumo da Compra
            </h2>

            <div className="space-y-4">
              {order.order_items.map((item: OrderItem) => (
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
                <span className="font-medium text-wol-graphite">{formatPrice(order.shipping_amount || 0)}</span>
              </div>

              <div className="flex justify-between text-lg pt-3 border-t border-wol-graphite/10">
                <span className="font-bold uppercase tracking-widest text-wol-graphite">Total</span>
                <span className="font-bold text-wol-graphite">{formatPrice(order.total_amount)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-wol-graphite/10 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-wol-graphite/60">Pagamento</span>
                <span className="font-bold uppercase tracking-widest text-xs text-wol-graphite">
                  {order.payment_method?.toLowerCase() === 'pix' ? 'PIX' : order.payment_method?.toLowerCase() === 'credit_card' ? 'Cart&atilde;o de Cr&eacute;dito' : order.payment_method}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-wol-graphite/60">Status</span>
                <span className="font-bold uppercase tracking-widest text-xs text-wol-graphite">
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
            </div>
          </div>
        ) : null}

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
