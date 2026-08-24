'use client';

import { Package, CircleNotch } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface OrderItem {
  id: string;
  snapshot_product_name: string;
  snapshot_color_name: string;
  quantity: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_items: OrderItem[];
}

export default function MinhaContaPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const token = localStorage.getItem('@wol:token');
        if (!token) return;

        const res = await fetch('https://wolbackend.vercel.app/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Falha ao carregar pedidos');
        }

        const data = await res.json();
        setOrders(data);
      } catch (err: any) {
        toast.error(err.message || 'Erro ao carregar pedidos');
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrders();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(price);
  };

  // Convert status to readable text
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      // Order Status
      'PENDING': 'PENDENTE',
      'PAYMENT_APPROVED': 'PAGO',
      'PREPARING': 'EM SEPARAÃ‡ÃƒO',
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
      'processing': 'EM SEPARAÃ‡ÃƒO',
      'shipped': 'ENVIADO',
      'delivered': 'ENTREGUE',
      'cancelled': 'CANCELADO'
    };
    return statusMap[status] || status?.toUpperCase();
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-wol-graphite/10 pb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-2 flex items-center gap-2">
          <Package size={20} /> Meus Pedidos
        </h2>
        <p className="text-xs text-wol-graphite/60">Acompanhe o status das suas compras.</p>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircleNotch size={32} className="animate-spin text-wol-graphite/40" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-wol-graphite/20">
            <p className="text-sm text-wol-graphite/60 uppercase tracking-widest">Nenhum pedido encontrado.</p>
            <Link href="/produtos" className="text-wol-pink text-xs font-bold uppercase tracking-widest mt-4 inline-block hover:underline">
              Ir para a loja
            </Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border border-wol-graphite/10 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:border-wol-graphite/30 transition-colors">
              
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-wol-graphite">#{order.id.slice(0, 8)}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-[#f1f1f1] text-wol-graphite">
                    {getStatusText(order.status)}
                  </span>
                </div>
                <p className="text-xs text-wol-graphite/60">Data: {format(new Date(order.created_at), 'dd/MM/yyyy')}</p>
                
                <div className="mt-4 pt-4 border-t border-wol-graphite/5">
                  {order.order_items?.map((item) => (
                    <p key={item.id} className="text-xs text-wol-graphite font-medium">
                      {item.quantity}x {item.snapshot_product_name} - {item.snapshot_color_name}
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-2 md:gap-4 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-wol-graphite/10 md:border-t-0">
                <span className="text-sm font-bold text-wol-graphite">{formatPrice(order.total_amount)}</span>
                <Link 
                  href={`/minha-conta/pedidos/${order.id}`}
                  className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-wol-graphite text-wol-white hover:bg-wol-black transition-colors"
                >
                  Ver Detalhes
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

