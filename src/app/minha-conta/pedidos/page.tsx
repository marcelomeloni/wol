// @ts-nocheck
'use client';

import { Package, CircleNotch, Star } from '@phosphor-icons/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { products } from '@/lib/data';


const API_URL = 'https://wolbackend.vercel.app/api';
const REVIEWABLE_STATUSES = ['PAYMENT_APPROVED', 'PREPARING', 'SHIPPED', 'DELIVERED'];

interface OrderItem {
  id: string;
  snapshot_product_name: string;
  snapshot_color_name: string;
  quantity: number;
  product_variant_id?: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  payment_status: string;
  total_amount: number;
  order_items: OrderItem[];
}


export default function MinhaContaPedidos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewedOrderIds, setReviewedOrderIds] = useState<Set<string>>(new Set());
  const [reviewingOrder, setReviewingOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('@wol:token');
      if (!token) return;
      const res = await fetch(API_URL + '/orders', { headers: { Authorization: 'Bearer ' + token } });
      if (!res.ok) throw new Error('Falha ao carregar pedidos');
      setOrders(await res.json());
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar pedidos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const reviewed = localStorage.getItem('@wol:reviewedOrders');
    if (reviewed) setReviewedOrderIds(new Set(JSON.parse(reviewed)));
  }, []);

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);

  const getStatusText = (status: string) => {
    const statusMap = {
      PENDING: 'PENDENTE', PAYMENT_APPROVED: 'PAGO', PREPARING: 'EM SEPARACAO',
      SHIPPED: 'ENVIADO', DELIVERED: 'ENTREGUE', CANCELED: 'CANCELADO',
      WAITING: 'AGUARDANDO PAGAMENTO', PAID: 'PAGAMENTO APROVADO', REFUNDED: 'REEMBOLSADO',
    };
    return statusMap[status] || (status && status.toUpperCase());
  };

  const canReview = (order: Order) => {
    if (reviewedOrderIds.has(order.id)) return false;
    if (order.payment_status !== 'PAID') return false;
    if (!REVIEWABLE_STATUSES.includes(order.status)) return false;
    return true;
  };

  const openReview = (order: Order) => {
    setReviewingOrder(order);
    setRating(0);
    setComment('');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Selecione uma nota de 1 a 5 estrelas.'); return; }
    const firstItemName = reviewingOrder.order_items[0]?.snapshot_product_name;
    const matchedProduct = products.find(p => p.name === firstItemName);
    const productId = matchedProduct?.id || (reviewingOrder.order_items[0] && reviewingOrder.order_items[0].product_variant_id);
    if (!productId) { toast.error('Produto sem ID disponÃ­vel para avaliaÃ§Ã£o.'); return; }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('@wol:token');
      const res = await fetch(API_URL + '/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ productId: productId, rating, comment: comment || null }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error((err && err.error && err.error.message) || 'Erro ao enviar avaliacao'); }
      toast.success('Avaliacao enviada! Obrigada pelo feedback.');
      const newSet = new Set([...reviewedOrderIds, reviewingOrder.id]);
      setReviewedOrderIds(newSet);
      localStorage.setItem('@wol:reviewedOrders', JSON.stringify([...newSet]));
      setReviewingOrder(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-wol-graphite/10 pb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-2 flex items-center gap-2">
          <Package size={20} /> Meus Pedidos
        </h2>
        
      </div>
      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <CircleNotch size={32} className="animate-spin text-wol-graphite/40" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-wol-graphite/20">
            <p className="text-sm text-wol-graphite/60 uppercase tracking-widest">Nenhum pedido encontrado.</p>
            <Link href="/produtos" className="text-xs font-bold uppercase tracking-widest mt-4 inline-block hover:underline text-wol-graphite/60">Ir para a loja</Link>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="border border-wol-graphite/10 p-6 flex flex-col md:flex-row gap-6 md:items-center justify-between hover:border-wol-graphite/30 transition-colors">
              <div className="space-y-2">
                <div className="flex items-center gap-4 flex-wrap">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-wol-graphite">#{order.id.slice(0, 8)}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-[#f1f1f1] text-wol-graphite">{getStatusText(order.status)}</span>
                  {order.payment_status && (
                    <span className={"text-[10px] uppercase font-bold tracking-wider px-2 py-1 " + (order.payment_status === 'PAID' ? 'bg-wol-graphite text-wol-white' : 'bg-wol-pink text-wol-graphite')}>
                      {getStatusText(order.payment_status)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-wol-graphite/60">Data: {format(new Date(order.created_at), 'dd/MM/yyyy')}</p>
                <div className="mt-4 pt-4 border-t border-wol-graphite/5">
                  {order.order_items && order.order_items.map((item) => (
                    <p key={item.id} className="text-xs text-wol-graphite font-medium">{item.quantity}x {item.snapshot_product_name} - {item.snapshot_color_name}</p>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-wol-graphite/10 md:border-t-0">
                <span className="text-sm font-bold text-wol-graphite">{formatPrice(order.total_amount)}</span>
                <Link href={"/minha-conta/pedidos/" + order.id} className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 bg-wol-graphite text-wol-white hover:bg-wol-black transition-colors">
                  Ver Detalhes
                </Link>
                {canReview(order) && (
                  <button type="button" onClick={() => openReview(order)} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-4 py-2 border border-wol-graphite/30 text-wol-graphite hover:bg-wol-graphite hover:text-wol-white transition-colors">
                    <Star size={14} weight="fill" className="text-yellow-400" /> Avaliar Pedido
                  </button>
                )}
                {reviewedOrderIds.has(order.id) && (
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-wol-graphite/40">
                    <Star size={12} weight="fill" /> Avaliado
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {reviewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-wol-graphite/40 backdrop-blur-sm" onClick={() => setReviewingOrder(null)} />
          <div className="relative w-full max-w-lg bg-wol-white border border-wol-graphite p-8 z-10">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-wol-graphite/10">
              <h3 className="text-xl font-bold uppercase tracking-widest text-wol-graphite">Avaliar Pedido</h3>
              <button type="button" onClick={() => setReviewingOrder(null)} className="text-wol-graphite/40 hover:text-wol-graphite transition-colors text-xl">x</button>
            </div>
            <p className="text-xs text-wol-graphite/60 mb-6 uppercase tracking-widest">Pedido #{reviewingOrder.id.slice(0, 8)}</p>
            <form onSubmit={handleReviewSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-3">Sua Nota</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onMouseEnter={() => setHoveredStar(star)} onMouseLeave={() => setHoveredStar(0)} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                      <Star size={32} weight={(hoveredStar || rating) >= star ? 'fill' : 'regular'} className={(hoveredStar || rating) >= star ? 'text-yellow-400' : 'text-wol-graphite/20'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-wol-graphite/60 mb-2">Comentario (opcional)</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Conte como foi a sua experiencia..." className="w-full border border-wol-graphite/20 bg-transparent px-4 py-3 text-sm text-wol-graphite outline-none focus:border-wol-graphite resize-none" />
              </div>
              <button type="submit" disabled={isSubmitting || rating === 0} className="w-full h-12 bg-wol-graphite text-wol-white font-bold uppercase tracking-widest text-xs hover:bg-wol-black transition-colors disabled:opacity-50">
                {isSubmitting ? 'ENVIANDO...' : 'ENVIAR AVALIACAO'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
