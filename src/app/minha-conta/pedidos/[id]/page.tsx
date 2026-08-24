'use client';

import Link from 'next/link';
import { ArrowLeft, Package, MapPin, CreditCard, Receipt, CircleNotch } from '@phosphor-icons/react';
import { use, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function PedidoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const token = localStorage.getItem('@wol:token');
        if (!token) return;

        const res = await fetch(`http://localhost:3333/api/orders/${unwrappedParams.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Falha ao carregar detalhes do pedido');
        }

        const data = await res.json();
        setOrder(data);
      } catch (err: any) {
        toast.error(err.message || 'Erro ao carregar detalhes do pedido');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [unwrappedParams.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      // Order Status
      'PENDING': 'PENDENTE',
      'PAYMENT_APPROVED': 'PAGO',
      'PREPARING': 'EM SEPARAÇÃO',
      'SHIPPED': 'ENVIADO',
      'DELIVERED': 'ENTREGUE',
      'CANCELED': 'CANCELADO',
      // Payment Status
      'WAITING': 'AGUARDANDO PAGAMENTO',
      'PAID': 'PAGAMENTO APROVADO',
      'REFUNDED': 'REEMBOLSADO',
      // Fallbacks just in case
      'pending': 'PENDENTE',
      'paid': 'PAGO',
      'processing': 'EM SEPARAÇÃO',
      'shipped': 'ENVIADO',
      'delivered': 'ENTREGUE',
      'cancelled': 'CANCELADO'
    };
    return statusMap[status] || status?.toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <CircleNotch size={32} className="animate-spin text-wol-graphite/40" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12 border border-dashed border-wol-graphite/20">
        <p className="text-sm text-wol-graphite/60 uppercase tracking-widest">Pedido não encontrado.</p>
        <Link href="/minha-conta/pedidos" className="text-wol-pink text-xs font-bold uppercase tracking-widest mt-4 inline-block hover:underline">
          Voltar para pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="border-b border-wol-graphite/10 pb-4">
        <Link 
          href="/minha-conta/pedidos" 
          className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 hover:text-wol-graphite transition-colors mb-4"
        >
          <ArrowLeft size={14} /> Voltar para Pedidos
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl md:text-2xl font-display uppercase tracking-widest text-wol-graphite">
            Pedido #{order.id.slice(0, 8)}
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 bg-[#f1f1f1] text-wol-graphite">
              {getStatusText(order.status)}
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 bg-wol-graphite text-wol-white">
              {getStatusText(order.payment_status)}
            </span>
          </div>
        </div>
        <p className="text-xs text-wol-graphite/60 mt-2">Data da compra: {format(new Date(order.created_at), 'dd/MM/yyyy HH:mm')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-wol-graphite/10 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-wol-graphite mb-6 flex items-center gap-2">
              <Package size={16} /> Itens do Pedido
            </h3>
            <div className="space-y-6">
              {order.order_items?.map((item: any) => (
                <div key={item.id} className="flex items-start justify-between pb-6 border-b border-wol-graphite/5 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-wol-graphite uppercase tracking-wide">
                      {item.snapshot_product_name}
                    </p>
                    <p className="text-xs text-wol-graphite/60">
                      Cor: {item.snapshot_color_name} | Tam: {item.snapshot_size_name}
                    </p>
                    <p className="text-xs text-wol-graphite/60 mt-2">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-wol-graphite">
                    {formatPrice(item.unit_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Info */}
        <div className="space-y-6">
          
          {/* Resumo Financeiro */}
          <div className="border border-wol-graphite/10 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-wol-graphite mb-6 flex items-center gap-2">
              <Receipt size={16} /> Resumo
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-wol-graphite/80">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal_amount)}</span>
              </div>
              <div className="flex justify-between text-wol-graphite/80">
                <span>Frete</span>
                <span>{formatPrice(order.shipping_amount)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-wol-pink font-medium">
                  <span>Desconto</span>
                  <span>-{formatPrice(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-wol-graphite font-bold pt-4 border-t border-wol-graphite/10">
                <span>Total</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          </div>

          <button className="w-full h-12 border border-wol-graphite text-wol-graphite font-bold uppercase tracking-widest text-[10px] hover:bg-wol-graphite hover:text-wol-white transition-colors mt-6">
            Baixar Fatura (PDF)
          </button>
        </div>
      </div>
    </div>
  );
}
