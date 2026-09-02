"use client";

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { products } from '@/lib/data';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'react-hot-toast';
import { Star, User } from '@phosphor-icons/react';
import { useEffect } from 'react';
import { format } from 'date-fns';

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const product = products.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const { addItem } = useCart();

  const defaultIdx = Math.max(0, product.variants.findIndex(v => v.color === 'branco'));
  const [activeVariantIdx, setActiveVariantIdx] = useState(defaultIdx);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<'front' | 'back'>('front');
  
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    if (!product) return;
    const fetchReviews = async () => {
      try {
        const res = await fetch(`/api/reviews/${product.id}`);
        if (res.ok) {
          const data = await res.json();
          setReviews(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingReviews(false);
      }
    };
    fetchReviews();
  }, [product]);

  const variant = product.variants[activeVariantIdx];
  const sizes = ['P', 'M', 'G', 'GG'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  };

  return (
    <div className="min-h-screen bg-wol-white pt-24 md:pt-32 pb-24">
      <Container>
        {/* Breadcrumbs */}
        <div className="mb-8 text-sm font-medium text-wol-graphite/50 tracking-wider uppercase">
          <Link href="/" className="hover:text-wol-pink transition-colors">Início</Link>
          <span className="mx-2">/</span>
          <Link href="/produtos" className="hover:text-wol-pink transition-colors">Produtos</Link>
          <span className="mx-2">/</span>
          <span className="text-wol-graphite">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Left Column: Image Gallery (fixed to 7 cols) */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4 lg:gap-6 min-w-0 overflow-hidden">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-4 order-2 md:order-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              <button 
                onClick={() => setActiveImage('front')}
                className={cn(
                  "relative w-20 h-24 sm:w-24 sm:h-32 bg-[#f9f9f9] border flex-shrink-0 transition-all",
                  activeImage === 'front' ? "border-wol-graphite" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={variant.frontImage} alt="Frente" fill className="object-contain p-2" />
              </button>
              <button 
                onClick={() => setActiveImage('back')}
                className={cn(
                  "relative w-20 h-24 sm:w-24 sm:h-32 bg-[#f9f9f9] border flex-shrink-0 transition-all",
                  activeImage === 'back' ? "border-wol-graphite" : "border-transparent opacity-60 hover:opacity-100"
                )}
              >
                <Image src={variant.backImage} alt="Verso" fill className="object-contain p-2" />
              </button>
            </div>

            {/* Main Image */}
            <div className="relative flex-1 aspect-[3/4] bg-[#f9f9f9] order-1 md:order-2 w-full max-w-full overflow-hidden">
              <Image 
                src={activeImage === 'front' ? variant.frontImage : variant.backImage}
                alt={product.name}
                fill
                priority
                className="object-contain p-4 md:p-8 transition-opacity duration-500"
              />
            </div>
          </div>

          {/* Right Column: Product Info (fixed to 5 cols) */}
          <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-10 min-w-0">
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-wide text-wol-graphite mb-2">
              {product.name}
            </h1>
            <p className="text-2xl text-wol-graphite/80 mb-8">
              {formatPrice(product.price)}
            </p>

            <div className="w-full h-px bg-wol-graphite/10 mb-8" />

            {/* Color Selector */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-widest text-wol-graphite">
                  Cor: <span className="text-wol-graphite/60 font-medium">{variant.colorLabel}</span>
                </span>
              </div>
              <div className="flex gap-4">
                {product.variants.map((v, idx) => (
                  <button
                    key={v.color}
                    onClick={() => {
                      setActiveVariantIdx(idx);
                      setActiveImage('front');
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center",
                      activeVariantIdx === idx ? "border-wol-graphite scale-110" : "border-transparent hover:scale-110"
                    )}
                  >
                    <span 
                      className="w-8 h-8 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: v.color === 'branco' ? '#ffffff' : v.color === 'preto' ? '#000000' : '#303039' }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="mb-10">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold uppercase tracking-widest text-wol-graphite">
                  Tamanho
                </span>
                <button className="text-xs font-medium text-wol-graphite/60 underline hover:text-wol-pink transition-colors">
                  Guia de Medidas
                </button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "h-12 border font-medium text-sm transition-all",
                      selectedSize === size 
                        ? "border-wol-graphite bg-wol-pink text-wol-graphite font-bold" 
                        : "border-wol-graphite/20 bg-transparent text-wol-graphite hover:border-wol-graphite"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-14 text-sm tracking-widest uppercase font-bold"
              onClick={() => {
                if (!selectedSize) {
                  toast.error('Selecione um tamanho antes de adicionar ao carrinho.');
                  return;
                }
                
                addItem({
                  productId: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  quantity: 1,
                  size: selectedSize,
                  color: variant.colorLabel,
                  image: variant.frontImage,
                });
                toast.success('Adicionado ao carrinho com sucesso!');
              }}
            >
              Adicionar ao Carrinho
            </Button>

            {/* Reviews Section */}
            <div className="mt-12 space-y-8 border-t border-wol-graphite/10 pt-12">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-6 flex items-center gap-2">
                  <Star size={18} /> Avaliações do Produto
                </h4>
                
                {isLoadingReviews ? (
                  <p className="text-xs text-wol-graphite/50 uppercase tracking-widest">Carregando avaliações...</p>
                ) : reviews.length === 0 ? (
                  <div className="border border-dashed border-wol-graphite/20 p-8 text-center">
                    <p className="text-xs text-wol-graphite/50 uppercase tracking-widest">Este produto ainda não possui avaliações.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border border-wol-graphite/10 p-6 hover:border-wol-graphite/30 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#f1f1f1] rounded-full flex items-center justify-center text-wol-graphite/40">
                              <User size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold uppercase tracking-widest text-wol-graphite">{review.users?.name || 'Cliente WOL'}</p>
                              <p className="text-[10px] text-wol-graphite/40">{format(new Date(review.created_at), 'dd/MM/yyyy')}</p>
                            </div>
                          </div>
                          <div className="flex text-yellow-400 gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} size={14} weight={star <= review.rating ? 'fill' : 'regular'} className={star <= review.rating ? 'text-yellow-400' : 'text-wol-graphite/20'} />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-wol-graphite/80 leading-relaxed pl-11">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>



          </div>
        </div>
      </Container>
    </div>
  );
}