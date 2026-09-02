'use client';

import { MapPin, Plus, Trash, CircleNotch, X } from '@phosphor-icons/react';
import { toast } from 'react-hot-toast';
import { useEffect, useState } from 'react';

interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  is_main: boolean;
}

export default function MinhaContaEnderecos() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [isFetchingCep, setIsFetchingCep] = useState(false);

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let cep = e.target.value.replace(/\D/g, '');
    
    // Mask CEP as 00000-000
    let maskedCep = cep;
    if (cep.length > 5) {
      maskedCep = `${cep.slice(0, 5)}-${cep.slice(5, 8)}`;
    }
    setZipCode(maskedCep);

    if (cep.length === 8) {
      setIsFetchingCep(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setStreet(data.logradouro || '');
          setNeighborhood(data.bairro || '');
          setCity(data.localidade || '');
          setState(data.uf || '');
          // Optamos por nÃ£o dar auto-focus via ref por simplicidade, mas os dados jÃ¡ preenchem
        } else {
          toast.error('CEP nÃ£o encontrado');
        }
      } catch (error) {
        toast.error('Erro ao buscar o CEP');
      } finally {
        setIsFetchingCep(false);
      }
    }
  };

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('@wol:token');
      if (!token) return;

      const res = await fetch('https://wolbackend.vercel.app/api/addresses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Falha ao carregar endereÃ§os');
      
      const data = await res.json();
      setAddresses(data);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao carregar endereÃ§os');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente remover este endereÃ§o?')) return;
    try {
      const token = localStorage.getItem('@wol:token');
      const res = await fetch(`https://wolbackend.vercel.app/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Falha ao remover endereÃ§o');
      toast.success('EndereÃ§o removido com sucesso!');
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover endereÃ§o');
    }
  };

  const handleSetMain = async (address: Address) => {
    try {
      const token = localStorage.getItem('@wol:token');
      const res = await fetch(`https://wolbackend.vercel.app/api/addresses/${address.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          zipCode: address.zip_code,
          street: address.street,
          number: address.number,
          complement: address.complement || '',
          neighborhood: address.neighborhood,
          city: address.city,
          state: address.state,
          isMain: true
        })
      });
      
      if (!res.ok) throw new Error('Falha ao definir como principal');
      toast.success('EndereÃ§o atualizado como principal!');
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar endereÃ§o');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('@wol:token');
      const res = await fetch('https://wolbackend.vercel.app/api/addresses', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          street, number, complement, neighborhood, city, state, zipCode, isMain: addresses.length === 0
        })
      });
      
      if (!res.ok) throw new Error('Falha ao adicionar endereÃ§o');
      toast.success('EndereÃ§o adicionado com sucesso!');
      setShowAddForm(false);
      setStreet(''); setNumber(''); setComplement(''); setNeighborhood(''); setCity(''); setState(''); setZipCode('');
      fetchAddresses();
    } catch (err: any) {
      toast.error(err.message || 'Erro ao adicionar endereÃ§o');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-wol-graphite/10 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-2 flex items-center gap-2">
            <MapPin size={20} /> EndereÃ§os
          </h2>
          
        </div>
        {!showAddForm && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-wol-graphite text-wol-white px-4 h-10 font-bold uppercase tracking-widest text-[10px] hover:bg-wol-black transition-colors"
          >
            <Plus size={14} /> Novo
          </button>
        )}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="border border-wol-graphite/10 p-6 space-y-4">
          <div className="flex justify-between items-center mb-4 border-b border-wol-graphite/10 pb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-wol-graphite">Novo EndereÃ§o</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-wol-graphite/60 hover:text-wol-graphite">
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input required type="text" placeholder="CEP" value={zipCode} onChange={handleCepChange} maxLength={9} className="w-full border border-wol-graphite/20 h-10 px-4 text-sm outline-none disabled:bg-[#f9f9f9]" disabled={isFetchingCep} />
              {isFetchingCep && <CircleNotch size={16} className="absolute right-3 top-3 animate-spin text-wol-graphite/40" />}
            </div>
            <input required type="text" placeholder="Rua / Avenida" value={street} onChange={e => setStreet(e.target.value)} className="border border-wol-graphite/20 h-10 px-4 text-sm outline-none" disabled={isFetchingCep} />
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="NÃºmero" value={number} onChange={e => setNumber(e.target.value)} className="border border-wol-graphite/20 h-10 px-4 text-sm outline-none" />
              <input type="text" placeholder="Complemento" value={complement} onChange={e => setComplement(e.target.value)} className="border border-wol-graphite/20 h-10 px-4 text-sm outline-none" />
            </div>
            <input required type="text" placeholder="Bairro" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} className="border border-wol-graphite/20 h-10 px-4 text-sm outline-none" disabled={isFetchingCep} />
            <div className="grid grid-cols-2 gap-4">
              <input required type="text" placeholder="Cidade" value={city} onChange={e => setCity(e.target.value)} className="border border-wol-graphite/20 h-10 px-4 text-sm outline-none" disabled={isFetchingCep} />
              <input required type="text" placeholder="Estado (UF)" maxLength={2} value={state} onChange={e => setState(e.target.value)} className="border border-wol-graphite/20 h-10 px-4 text-sm outline-none uppercase" disabled={isFetchingCep} />
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-wol-graphite text-wol-white px-6 h-10 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
              {isSubmitting ? <CircleNotch size={14} className="animate-spin" /> : 'Salvar EndereÃ§o'}
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <CircleNotch size={32} className="animate-spin text-wol-graphite/40" />
        </div>
      ) : addresses.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-wol-graphite/20">
          <p className="text-sm text-wol-graphite/60 uppercase tracking-widest">Nenhum endereÃ§o cadastrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className={`border p-6 relative flex flex-col justify-between ${address.is_main ? 'border-wol-graphite' : 'border-wol-graphite/20'}`}>
              {address.is_main && (
                <span className="absolute top-0 right-0 bg-wol-graphite text-wol-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                  Principal
                </span>
              )}
              <div>
                <p className="text-sm text-wol-graphite/70 leading-relaxed mb-6 mt-4">
                  {address.street}, {address.number}<br/>
                  {address.complement && <>{address.complement}<br/></>}
                  {address.neighborhood}<br/>
                  {address.city}, {address.state}<br/>
                  {address.zip_code}
                </p>
              </div>
              <div className="flex gap-4 items-center mt-4">
                {!address.is_main && (
                  <button 
                    onClick={() => handleSetMain(address)}
                    className="text-[10px] uppercase tracking-widest font-bold underline hover:text-wol-pink transition-colors"
                  >
                    Tornar Principal
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(address.id)}
                  className={`flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-[#e23b5d] hover:underline transition-colors ${!address.is_main ? 'ml-auto' : ''}`}
                >
                  <Trash size={12} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

