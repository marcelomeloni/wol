'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import { Container } from '@/components/ui/Container';
import { CreditCard, QrCode, LockKey, CaretRight, Tag, Truck, CircleNotch, CopySimple, CheckCircle } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiFetch } from '@/lib/api';
import { quoteShipping, payOrder } from '@/lib/payments';
import type { ShippingOption } from '@/lib/payments';
import { isMercadoPagoEnabled, isMockPayment } from '@/lib/mercadopago';
import { CardPaymentBrick } from '@/components/checkout/CardPaymentBrick';

type CheckoutStep = 'form' | 'payment';

interface SavedAddress {
  id: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_main?: boolean;
}

// Erros vindos do backend (apiFetch) ou exceções inesperadas.
function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user, isLoading } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirectUrl=/checkout');
    }
  }, [isLoading, isAuthenticated, router]);

  // Dados Pessoais: partem do perfil do usuário e podem ser sobrescritos.
  const [nameOverride, setNameOverride] = useState<string | null>(null);
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const [cpfOverride, setCpfOverride] = useState<string | null>(null);
  const [phoneOverride, setPhoneOverride] = useState<string | null>(null);

  const formatCpf = (value: string) =>
    value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  const formatPhone = (value: string) => {
    const p = value.replace(/\D/g, '');
    return p.length === 11 ? p.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3') : p;
  };

  const name = nameOverride ?? user?.name ?? '';
  const email = emailOverride ?? user?.email ?? '';
  const cpf = cpfOverride ?? (user?.cpf ? formatCpf(user.cpf) : '');
  const phone = phoneOverride ?? (user?.phone ? formatPhone(user.phone) : '');

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [cep, setCep] = useState('');
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [addressData, setAddressData] = useState({
    rua: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isQuotingShipping, setIsQuotingShipping] = useState(false);

  const [step, setStep] = useState<CheckoutStep>('form');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [orderTotal, setOrderTotal] = useState(0);

  const [pixQrBase64, setPixQrBase64] = useState<string | null>(null);
  const [pixCopyPaste, setPixCopyPaste] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isCardBrickReady, setIsCardBrickReady] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !isProcessing && step === 'form') {
      router.push('/produtos');
    }
  }, [items, router, isProcessing, step]);

  useEffect(() => {
    if (user) {
      apiFetch<SavedAddress[]>('/addresses')
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setSavedAddresses(data);
          const main = data.find(a => a.is_main) || data[0];
          setSelectedAddressId(main.id);
        } else {
          setSelectedAddressId('new');
        }
      })
      .catch(() => setSelectedAddressId('new'));
    }
  }, [user]);

  const destinationCep = useMemo(() => {
    if (selectedAddressId && selectedAddressId !== 'new') {
      const addr = savedAddresses.find((a) => a.id === selectedAddressId);
      return (addr?.zip_code ?? '').replace(/\D/g, '');
    }
    return cep.replace(/\D/g, '');
  }, [selectedAddressId, savedAddresses, cep]);

  const shippingItems = useMemo(
    () => items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    [items],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (destinationCep.length !== 8 || shippingItems.length === 0) {
        setShippingOptions([]);
        setSelectedShipping(null);
        return;
      }

      setIsQuotingShipping(true);

      try {
        const quote = await quoteShipping(destinationCep, shippingItems);
        if (cancelled) return;
        setShippingOptions(quote.options);
        setSelectedShipping((prev) => {
          if (prev) {
            const stillThere = quote.options.find((o) => o.id === prev.id);
            if (stillThere) return stillThere;
          }
          return quote.options[0] ?? null;
        });
      } catch (err) {
        if (cancelled) return;
        setShippingOptions([]);
        setSelectedShipping(null);
        toast.error(errorMessage(err, 'Não foi possível calcular o frete.'));
      } finally {
        if (!cancelled) setIsQuotingShipping(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [destinationCep, shippingItems]);

  const shippingCost = selectedShipping?.price ?? 0;
  const finalTotal = totalPrice + shippingCost - appliedDiscount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  // Cria o pedido no backend (valida estoque, preço, cupom e frete no servidor).
  const createOrder = useCallback(async (form: HTMLFormElement): Promise<string> => {
    let addressPayload: Record<string, unknown> = {};
    if (selectedAddressId === 'new' || savedAddresses.length === 0) {
      addressPayload = {
        addressData: {
          zipCode: cep.replace(/\D/g, ''),
          street: addressData.rua,
          number: (form.elements.namedItem('numero') as HTMLInputElement).value,
          complement: (form.elements.namedItem('complemento') as HTMLInputElement)?.value || '',
          neighborhood: addressData.bairro,
          city: addressData.cidade,
          state: addressData.estado,
          isMain: true
        }
      };
    } else {
      addressPayload = { addressId: selectedAddressId };
    }

    const payload = {
      ...addressPayload,
      couponCode: appliedCoupon || null,
      paymentMethod: paymentMethod,
      shippingService: selectedShipping?.id ?? null,
      shippingCompany: selectedShipping?.company ?? null,
      shippingAmount: selectedShipping?.price ?? 0,
      items: items.map(item => ({
        productVariantId: item.variantId,
        productSlug: item.slug,
        productName: item.name,
        colorName: item.color,
        sizeName: item.size,
        quantity: item.quantity,
      }))
    };

    const data = await apiFetch<{ id: string }>('/orders', { method: 'POST', body: payload });
    if (!data?.id) throw new Error('Não foi possível criar o pedido.');
    return data.id;
  }, [selectedAddressId, savedAddresses, cep, addressData, appliedCoupon, paymentMethod, selectedShipping, items]);

  const generatePix = useCallback(async (orderId: string) => {
    setIsPaying(true);
    setPaymentError(null);
    try {
      const result = await payOrder({ orderId, method: 'pix' });

      // O pedido e a tentativa de pagamento já foram criados: pode limpar o carrinho.
      if (result.status !== 'rejected') {
        clearCart();
      }

      if (result.status === 'approved') {
        router.push(`/checkout/sucesso?id=${orderId}`);
        return;
      }
      setPixQrBase64(result.pixQrCodeBase64);
      setPixCopyPaste(result.pixQrCode);
      if (result.status === 'rejected') {
        setPaymentError(result.statusDetail ?? 'Não foi possível gerar o PIX.');
      }
    } catch (err: unknown) {
      setPaymentError(errorMessage(err, 'Falha ao gerar o PIX.'));
    } finally {
      setIsPaying(false);
    }
  }, [clearCart, router]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Você precisa fazer login antes de fechar o pedido.');
      router.push('/login');
      return;
    }

    if (!isMercadoPagoEnabled && !isMockPayment) {
      toast.error('Pagamento indisponível no momento.');
      return;
    }

    if (!selectedShipping) {
      toast.error('Selecione uma opção de frete.');
      return;
    }

    setIsProcessing(true);

    try {
      const form = e.target as HTMLFormElement;
      const orderId = await createOrder(form);

      setCreatedOrderId(orderId);
      setOrderTotal(finalTotal);
      setStep('payment');

      if (paymentMethod === 'pix') {
        await generatePix(orderId);
      }
    } catch (err: unknown) {
      toast.error(errorMessage(err, 'Houve um problema ao fechar o pedido.'));
    } finally {
      setIsProcessing(false);
    }
  };

  // Envia o pagamento do cartão (token vindo do Brick do Mercado Pago).
  const handleCardSubmit = useCallback(async (token: string, installments: number) => {
    if (!createdOrderId) return;
    setIsPaying(true);
    setPaymentError(null);
    try {
      const result = await payOrder({
        orderId: createdOrderId,
        method: 'credit_card',
        token,
        installments,
      });

      if (result.status === 'approved') {
        clearCart();
        toast.success('Pagamento aprovado!');
        router.push(`/checkout/sucesso?id=${createdOrderId}`);
        return;
      }

      setPaymentError(
        result.statusDetail ?? 'Não foi possível aprovar o pagamento. Tente outro cartão.',
      );
    } catch (err: unknown) {
      setPaymentError(errorMessage(err, 'Falha ao processar o pagamento.'));
    } finally {
      setIsPaying(false);
    }
  }, [createdOrderId, router, clearCart]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    
    setIsApplyingCoupon(true);
    try {
      const data = await apiFetch<{ discountAmount: number }>('/coupons/validate', {
        method: 'POST',
        auth: false,
        body: { code: couponCode, subtotal: totalPrice },
      });

      setAppliedDiscount(data.discountAmount);
      setAppliedCoupon(couponCode);
      toast.success('Cupom aplicado com sucesso!');
    } catch (err: unknown) {
      toast.error(errorMessage(err, 'Cupom inválido'));
      setAppliedDiscount(0);
      setAppliedCoupon('');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCep(val);
    
    if (val.length === 8) {
      setIsFetchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${val}/json/`);
        const data = await res.json();
        
        if (!data.erro) {
          setAddressData({
            rua: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            estado: data.uf || ''
          });
          toast.success('Endereço preenchido automaticamente!');
        } else {
          toast.error('CEP não encontrado.');
        }
      } catch {
        toast.error('Erro ao buscar o CEP.');
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  if (items.length === 0 && !isProcessing && step === 'form') {
    return null;
  }

  return (
    <div className="min-h-screen bg-wol-white pt-8 pb-24">
      <Container>
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-wol-graphite/40 mb-8">
          <Link href="/produtos" className="hover:text-wol-graphite transition-colors">Loja</Link>
          <CaretRight size={12} />
          <span className="text-wol-graphite">Checkout</span>
        </div>

        <h1 className="font-display text-4xl md:text-5xl text-wol-graphite mb-12">
          FINALIZAR <span className="relative inline-block px-1">
            <span className="relative z-10 text-wol-graphite">COMPRA</span>
            <span className="absolute bottom-1 md:bottom-2 left-0 w-full h-2 md:h-3 bg-wol-pink/60 -z-0 -rotate-1 transform -skew-x-12"></span>
          </span>
        </h1>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* LEFT: Formulários */}
          <form id="checkout-form" onSubmit={handleCheckout} className="flex-1 space-y-12">
            
            {/* Contato & Entrega */}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite border-b border-wol-graphite/10 pb-4 mb-6">
                1. Contato e Entrega
              </h2>
              
              {/* Seção: Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-wol-graphite/40 mb-4">Dados Pessoais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">E-mail</label>
                    <input type="email" required value={email} onChange={e => setEmailOverride(e.target.value)} disabled={!!user} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite disabled:text-wol-graphite/50 disabled:bg-[#f9f9f9]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Nome Completo</label>
                    <input type="text" required value={name} onChange={e => setNameOverride(e.target.value)} disabled={!!user} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite disabled:text-wol-graphite/50 disabled:bg-[#f9f9f9]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">CPF</label>
                    <input type="text" required value={cpf} onChange={e => setCpfOverride(e.target.value)} disabled={!!user} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite disabled:text-wol-graphite/50 disabled:bg-[#f9f9f9]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Telefone</label>
                    <input type="tel" required value={phone} onChange={e => setPhoneOverride(e.target.value)} disabled={!!user} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite disabled:text-wol-graphite/50 disabled:bg-[#f9f9f9]" />
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-wol-graphite/10 my-8"></div>

              {/* Seção: Endereço */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-wol-graphite/40 mb-4">Endereço de Entrega</h3>
                
                {savedAddresses.length > 0 && (
                  <div className="space-y-3 mb-6">
                    {savedAddresses.map(addr => (
                      <label key={addr.id} className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-wol-graphite bg-[#f9f9f9]' : 'border-wol-graphite/20 hover:border-wol-graphite/50'}`}>
                        <input 
                          type="radio" 
                          name="selectedAddress" 
                          value={addr.id}
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-1">
                            {addr.is_main ? 'Endereço Principal' : 'Endereço Salvo'}
                          </p>
                          <p className="text-xs text-wol-graphite/70 leading-relaxed">
                            {addr.street}, {addr.number} {addr.complement ? `- ${addr.complement}` : ''}<br/>
                            {addr.neighborhood} - {addr.city}, {addr.state}<br/>
                            CEP: {addr.zip_code}
                          </p>
                        </div>
                      </label>
                    ))}
                    <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${selectedAddressId === 'new' ? 'border-wol-graphite bg-[#f9f9f9]' : 'border-wol-graphite/20 hover:border-wol-graphite/50'}`}>
                      <input 
                        type="radio" 
                        name="selectedAddress" 
                        value="new"
                        checked={selectedAddressId === 'new'}
                        onChange={() => setSelectedAddressId('new')}
                      />
                      <span className="text-sm font-bold uppercase tracking-widest text-wol-graphite">Entregar em outro endereço</span>
                    </label>
                  </div>
                )}

                {selectedAddressId === 'new' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="flex justify-between text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">
                        CEP {isFetchingCep && <span className="text-wol-pink normal-case font-medium">Buscando...</span>}
                      </label>
                      <input 
                        type="text" 
                        required={selectedAddressId === 'new'}
                        maxLength={9}
                        value={cep}
                        onChange={handleCepChange}
                        placeholder="Somente números"
                        className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Endereço (Rua/Av)</label>
                      <input 
                        type="text" 
                        required={selectedAddressId === 'new'}
                        value={addressData.rua}
                        onChange={(e) => setAddressData({...addressData, rua: e.target.value})}
                        className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Número</label>
                      <input type="text" name="numero" required={selectedAddressId === 'new'} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Complemento</label>
                      <input type="text" name="complemento" className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite" placeholder="Opcional" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Bairro</label>
                      <input 
                        type="text" 
                        required={selectedAddressId === 'new'}
                        value={addressData.bairro}
                        onChange={(e) => setAddressData({...addressData, bairro: e.target.value})}
                        className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Cidade</label>
                      <input 
                        type="text" 
                        required={selectedAddressId === 'new'}
                        value={addressData.cidade}
                        onChange={(e) => setAddressData({...addressData, cidade: e.target.value})}
                        className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">UF</label>
                      <input 
                        type="text" 
                        required={selectedAddressId === 'new'}
                        maxLength={2}
                        value={addressData.estado}
                        onChange={(e) => setAddressData({...addressData, estado: e.target.value})}
                        className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite uppercase" 
                      />
                    </div>
                  </div>
                )}

                {/* Opções de Frete */}
                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-wol-graphite/40 mb-4 flex items-center gap-2">
                    <Truck size={16} /> Frete
                  </h3>

                  {isQuotingShipping ? (
                    <div className="flex items-center gap-3 text-xs text-wol-graphite/50 uppercase tracking-widest">
                      <CircleNotch size={16} className="animate-spin" /> Calculando frete...
                    </div>
                  ) : shippingOptions.length > 0 ? (
                    <div className="space-y-3">
                      {shippingOptions.map(option => (
                        <label
                          key={option.id}
                          className={`flex items-center justify-between gap-4 p-4 border cursor-pointer transition-colors ${
                            selectedShipping?.id === option.id
                              ? 'border-wol-graphite bg-[#f9f9f9]'
                              : 'border-wol-graphite/20 hover:border-wol-graphite/50'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <input
                              type="radio"
                              name="shippingOption"
                              value={option.id}
                              checked={selectedShipping?.id === option.id}
                              onChange={() => setSelectedShipping(option)}
                              className="mt-1"
                            />
                            <div>
                              <p className="text-sm font-bold uppercase tracking-widest text-wol-graphite">
                                {option.name} {option.company ? `- ${option.company}` : ''}
                              </p>
                              {option.deliveryTime > 0 && (
                                <p className="text-[10px] text-wol-graphite/50 uppercase tracking-wider">
                                  Entrega estimada em {option.deliveryTime} dias úteis
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-sm text-wol-graphite whitespace-nowrap">
                            {formatPrice(option.price)}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : destinationCep.length === 8 ? (
                    <p className="text-xs text-wol-graphite/50 uppercase tracking-widest">
                      Nenhuma opção de frete disponível para este CEP.
                    </p>
                  ) : (
                    <p className="text-xs text-wol-graphite/50 uppercase tracking-widest">
                      Informe o CEP de entrega para calcular o frete.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Pagamento */}
            <section className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite border-b border-wol-graphite/10 pb-4">
                2. Pagamento
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pix')}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 border-2 transition-all",
                    paymentMethod === 'pix' 
                      ? "border-wol-graphite bg-wol-white shadow-sm" 
                      : "border-wol-graphite/10 hover:border-wol-graphite/30 bg-transparent"
                  )}
                >
                  <QrCode size={32} className="mb-3" />
                  <span className="text-sm font-bold uppercase tracking-widest">PIX</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={cn(
                    "flex flex-col items-center justify-center p-6 border-2 transition-all",
                    paymentMethod === 'credit_card' 
                      ? "border-wol-graphite bg-wol-white shadow-sm" 
                      : "border-wol-graphite/10 hover:border-wol-graphite/30 bg-transparent"
                  )}
                >
                  <CreditCard size={32} className="mb-3" />
                  <span className="text-sm font-bold uppercase tracking-widest">Cartão</span>
                </button>
              </div>

              {paymentMethod === 'pix' && step === 'form' && (
                <div className="bg-[#f1f1f1] p-6 text-center space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <QrCode size={48} className="mx-auto text-wol-graphite/40 mb-4" />
                  <h4 className="font-bold uppercase tracking-widest text-wol-graphite text-sm">Pagamento Rápido</h4>
                  <p className="text-xs text-wol-graphite/60 leading-relaxed max-w-sm mx-auto">
                    O código PIX será gerado após a confirmação do pedido. Você terá 30 minutos para realizar o pagamento.
                  </p>
                </div>
              )}

              {paymentMethod === 'credit_card' && step === 'form' && (
                <div className="bg-[#f1f1f1] p-6 text-center space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <CreditCard size={48} className="mx-auto text-wol-graphite/40 mb-4" />
                  <h4 className="font-bold uppercase tracking-widest text-wol-graphite text-sm">Cartão de Crédito</h4>
                  <p className="text-xs text-wol-graphite/60 leading-relaxed max-w-sm mx-auto">
                    Os dados do cartão são processados com segurança pelo Mercado Pago. Nenhum dado sensível passa pelos nossos servidores.
                  </p>
                </div>
              )}

              <div className="pt-8">
                <button 
                  type="submit" 
                  disabled={isProcessing || !selectedShipping || (!isMercadoPagoEnabled && !isMockPayment)}
                  className="w-full h-14 bg-wol-graphite text-wol-white font-bold uppercase tracking-widest hover:bg-wol-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Processando...' : (
                    <>
                      <LockKey size={20} />
                      {paymentMethod === 'pix' ? 'GERAR CÓDIGO PIX' : 'IR PARA O PAGAMENTO'}
                    </>
                  )}
                </button>

                <div className="mt-4 text-center">
                  <p className="text-[10px] text-wol-graphite/40 uppercase tracking-widest leading-relaxed">
                    Ambiente Seguro. Todos os seus dados são criptografados de ponta a ponta.
                  </p>
                </div>
              </div>
            </section>
          </form>

          {/* RIGHT: Resumo do Pedido & Cupom */}
          <div className="w-full lg:w-[450px]">
            <div className="bg-[#f9f9f9] p-8 sticky top-28">
              <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite border-b border-wol-graphite/10 pb-4 mb-6">
                Resumo do Pedido
              </h2>

              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-[#f1f1f1] relative shrink-0 overflow-hidden">
                      {item.image && (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold text-wol-graphite uppercase text-xs leading-tight mb-1">{item.name}</h4>
                      <p className="text-[10px] text-wol-graphite/60 uppercase tracking-wider mb-2">
                        {item.color} | TAM {item.size}
                      </p>
                      <div className="flex justify-between items-center w-full">
                        <span className="text-xs text-wol-graphite/60 font-bold">QTD: {item.quantity}</span>
                        <span className="font-bold text-sm text-wol-graphite">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cupom Section */}
              {step === 'form' && (
                <div className="mb-8 border-t border-wol-graphite/10 pt-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2 flex items-center gap-2">
                    <Tag size={16} /> Possui Cupom?
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="DIGITE AQUI" 
                      className="flex-1 border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite uppercase text-sm font-bold placeholder:font-normal" 
                    />
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={!couponCode || isApplyingCoupon}
                      className="h-12 px-6 bg-wol-graphite text-wol-white text-xs font-bold uppercase tracking-widest hover:bg-wol-black transition-colors disabled:opacity-50"
                    >
                      {isApplyingCoupon ? '...' : 'Aplicar'}
                    </button>
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs text-wol-pink font-bold mt-2 uppercase tracking-widest">
                      Cupom {appliedCoupon} aplicado!
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-3 pt-6 border-t border-wol-graphite/10">
                <div className="flex justify-between text-sm">
                  <span className="text-wol-graphite/60">Subtotal</span>
                  <span className="font-medium text-wol-graphite">{formatPrice(totalPrice)}</span>
                </div>
                
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-wol-pink">
                    <span className="font-medium uppercase tracking-widest text-xs">Desconto</span>
                    <span className="font-medium">- {formatPrice(appliedDiscount)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-wol-graphite/60">Frete</span>
                  <span className="font-medium text-wol-graphite">
                    {selectedShipping ? formatPrice(selectedShipping.price) : '—'}
                  </span>
                </div>
                <div className="flex justify-between text-lg pt-4 border-t border-wol-graphite/10">
                  <span className="font-bold uppercase tracking-widest text-wol-graphite">Total</span>
                  <span className="font-bold text-wol-graphite">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ETAPA 2: PAGAMENTO */}
        {step === 'payment' && createdOrderId && (
          <div className="mt-16 border-t border-wol-graphite/10 pt-12">
            <h2 className="font-display text-3xl md:text-4xl text-wol-graphite mb-8">
              PAGAMENTO
            </h2>

            <div className="max-w-2xl space-y-8">
              <div className="flex items-center gap-3 text-sm text-wol-graphite/60">
                <CheckCircle size={20} weight="fill" className="text-wol-graphite" />
                Pedido criado com sucesso. Agora finalize o pagamento de {formatPrice(orderTotal)}.
              </div>

              {paymentError && (
                <div className="border border-wol-pink bg-[#fff5f6] p-4 text-sm text-wol-graphite">
                  {paymentError}
                </div>
              )}

              {paymentMethod === 'credit_card' && (
                <div className="space-y-4">
                  {isMockPayment ? (
                    <div className="border border-wol-graphite/10 bg-[#f9f9f9] p-8 space-y-4 text-center">
                      <p className="text-xs uppercase tracking-widest text-wol-graphite/60">
                        Modo de teste: o pagamento com cartão é aprovado automaticamente.
                      </p>
                      <button
                        type="button"
                        onClick={() => handleCardSubmit('mock-card-token', 1)}
                        disabled={isPaying}
                        className="w-full h-14 bg-wol-graphite text-wol-white font-bold uppercase tracking-widest hover:bg-wol-black transition-colors disabled:opacity-60"
                      >
                        {isPaying ? 'Processando...' : 'Pagar com cartão de teste'}
                      </button>
                    </div>
                  ) : (
                    <>
                      <CardPaymentBrick
                        amount={orderTotal}
                        email={email}
                        cpf={cpf}
                        onSubmit={handleCardSubmit}
                        onReady={() => setIsCardBrickReady(true)}
                        onError={(message) => setPaymentError(message)}
                      />
                      {!isCardBrickReady && (
                        <div className="flex items-center gap-3 text-xs text-wol-graphite/50 uppercase tracking-widest">
                          <CircleNotch size={16} className="animate-spin" /> Carregando formulário de cartão...
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {paymentMethod === 'pix' && (
                <div className="space-y-6">
                  {isPaying && (
                    <div className="flex items-center gap-3 text-xs text-wol-graphite/50 uppercase tracking-widest">
                      <CircleNotch size={16} className="animate-spin" />{' '}
                      {isMockPayment ? 'Processando pagamento...' : 'Gerando PIX...'}
                    </div>
                  )}

                  {pixQrBase64 && (
                    <div className="bg-[#f9f9f9] border border-wol-graphite/10 p-8 flex flex-col items-center text-center space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-wol-graphite">
                        Pague com PIX para concluir
                      </h3>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={pixQrBase64.startsWith('data:') ? pixQrBase64 : `data:image/png;base64,${pixQrBase64}`}
                        alt="QR Code PIX"
                        className="w-64 h-64 bg-white p-2"
                      />
                      {pixCopyPaste && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(pixCopyPaste);
                            toast.success('Código PIX copiado!');
                          }}
                          className="flex items-center gap-2 text-xs uppercase tracking-widest text-wol-graphite/60 hover:text-wol-graphite transition-colors"
                        >
                          <CopySimple size={16} /> Copiar código PIX
                        </button>
                      )}
                      <p className="text-[10px] text-wol-graphite/50 uppercase tracking-widest leading-relaxed max-w-sm">
                        Assim que o pagamento for identificado, o pedido é liberado para envio.
                      </p>
                    </div>
                  )}

                  {!pixQrBase64 && !isPaying && (
                    <button
                      type="button"
                      onClick={() => generatePix(createdOrderId)}
                      className="w-full h-14 bg-wol-graphite text-wol-white font-bold uppercase tracking-widest hover:bg-wol-black transition-colors"
                    >
                      {isMockPayment ? 'Pagar com PIX (teste)' : 'Gerar PIX'}
                    </button>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href={`/checkout/sucesso?id=${createdOrderId}`}
                  className="w-full flex items-center justify-center gap-2 border border-wol-graphite/20 bg-transparent text-wol-graphite h-12 font-bold uppercase tracking-widest text-xs hover:border-wol-graphite transition-all"
                >
                  Ver status do pedido
                </Link>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
