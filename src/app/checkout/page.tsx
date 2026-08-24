'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';
import { Container } from '@/components/ui/Container';
import { CreditCard, QrCode, LockKey, CaretRight, Tag } from '@phosphor-icons/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { isAuthenticated, user } = useAuth(); // NEW
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  // Dados Pessoais Controlados
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [phone, setPhone] = useState('');

  // Endereços Salvos
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Estados de Endereço Novo e CEP
  const [cep, setCep] = useState('');
  const [isFetchingCep, setIsFetchingCep] = useState(false);
  const [addressData, setAddressData] = useState({
    rua: '',
    bairro: '',
    cidade: '',
    estado: ''
  });

  // Estados de Cupom
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(''); // Stores the successfully applied code
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Redirect to products if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isProcessing) {
      router.push('/produtos');
    }
  }, [items, router, isProcessing]);

  // Pre-fill user data and fetch addresses
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      
      // Mask CPF and Phone
      const formatCpf = (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
      const formatPhone = (v: string) => {
        const p = v.replace(/\D/g, '');
        if (p.length === 11) return p.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
        return p;
      };
      
      setCpf(user.cpf ? formatCpf(user.cpf) : '');
      setPhone(user.phone ? formatPhone(user.phone) : '');

      const token = localStorage.getItem('@wol:token');
      if (token) {
        fetch('http://localhost:3333/api/addresses', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => res.ok ? res.json() : [])
        .then(data => {
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
    }
  }, [user]);

  const shippingCost = 15.00;
  const finalTotal = totalPrice + shippingCost - appliedDiscount;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Você precisa fazer login antes de fechar o pedido.');
      router.push('/login');
      return;
    }

    setIsProcessing(true);
    
    try {
      const form = e.target as HTMLFormElement;
      
      let addressPayload: any = {};
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
        items: items.map(item => ({
          productSlug: item.slug,
          productName: item.name,
          colorName: item.color,
          sizeName: item.size,
          quantity: item.quantity,
          unitPrice: item.price
        }))
      };

      const token = localStorage.getItem('@wol:token');
      const res = await fetch('http://localhost:3333/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Erro ao processar pedido');
      }

      toast.success('Pedido finalizado com sucesso! Vista a sua luz.');
      clearCart();
      router.push(`/checkout/sucesso?id=${data.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Houve um problema ao fechar o pedido.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;
    
    setIsApplyingCoupon(true);
    try {
      const res = await fetch('http://localhost:3333/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal: totalPrice })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error?.message || 'Cupom inválido');
      }

      setAppliedDiscount(data.discountAmount);
      setAppliedCoupon(couponCode);
      toast.success('Cupom aplicado com sucesso!');
    } catch (err: any) {
      toast.error(err.message);
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
      } catch (err) {
        toast.error('Erro ao buscar o CEP.');
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  if (items.length === 0 && !isProcessing) {
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
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} disabled={!!user} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite disabled:text-wol-graphite/50 disabled:bg-[#f9f9f9]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Nome Completo</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} disabled={!!user} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite disabled:text-wol-graphite/50 disabled:bg-[#f9f9f9]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">CPF</label>
                    <input type="text" required value={cpf} onChange={e => setCpf(e.target.value)} disabled={!!user} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite disabled:text-wol-graphite/50 disabled:bg-[#f9f9f9]" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Telefone</label>
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} disabled={!!user} className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite disabled:text-wol-graphite/50 disabled:bg-[#f9f9f9]" />
                  </div>
                </div>
              </div>

              {/* Divisória */}
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
                    "flex flex-col items-center justify-center py-6 border transition-all duration-300",
                    paymentMethod === 'pix' 
                      ? "border-wol-graphite bg-wol-graphite text-wol-white" 
                      : "border-wol-graphite/20 text-wol-graphite hover:border-wol-graphite/50"
                  )}
                >
                  <QrCode size={32} className="mb-3" />
                  <span className="text-sm font-bold uppercase tracking-widest">PIX</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit_card')}
                  className={cn(
                    "flex flex-col items-center justify-center py-6 border transition-all duration-300",
                    paymentMethod === 'credit_card' 
                      ? "border-wol-graphite bg-wol-graphite text-wol-white" 
                      : "border-wol-graphite/20 text-wol-graphite hover:border-wol-graphite/50"
                  )}
                >
                  <CreditCard size={32} className="mb-3" />
                  <span className="text-sm font-bold uppercase tracking-widest">Cartão</span>
                </button>
              </div>

              {/* Dynamic Payment Fields */}
              <div className="mt-8">
                {paymentMethod === 'pix' ? (
                  <div className="bg-[#f9f9f9] p-6 text-center border border-wol-graphite/10">
                    <QrCode size={48} className="mx-auto text-wol-graphite/40 mb-4" />
                    <h3 className="font-bold uppercase tracking-widest text-sm text-wol-graphite mb-2">Pagamento Rápido</h3>
                    <p className="text-xs text-wol-graphite/70 max-w-sm mx-auto leading-relaxed">
                      O código PIX será gerado após a confirmação do pedido. Você terá 15 minutos para realizar o pagamento.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 p-6 border border-wol-graphite/20">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Número do Cartão</label>
                      <input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Nome impresso no Cartão</label>
                      <input type="text" className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">Validade</label>
                        <input type="text" placeholder="MM/AA" className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite text-center" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2">CVV</label>
                        <input type="text" placeholder="123" className="w-full border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite text-center" />
                      </div>
                    </div>
                  </div>
                )}
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
                    <div className="w-16 h-20 bg-[#f1f1f1] relative shrink-0">
                      <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
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
              <div className="mb-8 border-t border-wol-graphite/10 pt-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-wol-graphite/60 mb-2 flex items-center gap-2">
                  <Tag size={16} /> Possui cupom de desconto?
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Ex: WOL10"
                    className="flex-1 border border-wol-graphite/20 bg-transparent h-12 px-4 outline-none focus:border-wol-graphite transition-colors text-wol-graphite uppercase placeholder:normal-case" 
                  />
                  <button 
                    type="submit" 
                    disabled={isApplyingCoupon || !couponCode}
                    className="bg-wol-graphite text-wol-white px-6 font-bold uppercase tracking-widest text-xs hover:bg-wol-black transition-colors disabled:opacity-50"
                  >
                    Aplicar
                  </button>
                </form>
              </div>

              <div className="border-t border-wol-graphite/10 pt-6 space-y-4 mb-8">
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
                  <span className="text-wol-graphite/60">Frete (Fixo)</span>
                  <span className="font-medium text-wol-graphite">{formatPrice(shippingCost)}</span>
                </div>
                <div className="flex justify-between text-lg pt-4 border-t border-wol-graphite/10">
                  <span className="font-bold uppercase tracking-widest text-wol-graphite">Total</span>
                  <span className="font-bold text-wol-graphite">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button 
                form="checkout-form"
                type="submit" 
                disabled={isProcessing}
                className="w-full h-14 bg-wol-graphite text-wol-white font-bold uppercase tracking-widest hover:bg-wol-black transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processando...' : (
                  <>
                    <LockKey size={20} />
                    Finalizar Compra
                  </>
                )}
              </button>

              <div className="mt-6 text-center">
                <p className="text-[10px] text-wol-graphite/40 uppercase tracking-widest leading-relaxed">
                  Ambiente Seguro. Todos os seus dados são criptografados de ponta a ponta.
                </p>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
