"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  selectedVariantIndex?: number;
  className?: string;
  showColorSelector?: boolean;
}

export function ProductCard({ product, selectedVariantIndex, className, showColorSelector = true }: ProductCardProps) {
  const defaultIdx = selectedVariantIndex !== undefined 
    ? selectedVariantIndex 
    : Math.max(0, product.variants.findIndex(v => v.color === 'branco'));

  const [activeVariantIdx, setActiveVariantIdx] = useState(defaultIdx);
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(product.id);
  
  const variant = product.variants[activeVariantIdx] || product.variants[0];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className={cn("group flex flex-col gap-5", className)}>
      {/* Imagem do Produto */}
      <Link 
        href={`/produtos/${product.slug}`} 
        className={cn(
          "relative block aspect-[3/4] w-full overflow-hidden rounded-2xl transition-colors duration-500 bg-[#f9f9f9]"
        )}
      >
        {/* Botão de Favorito */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite({
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: variant.frontImage
            });
          }}
          className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm text-wol-graphite hover:scale-110 transition-transform shadow-sm rounded-full"
        >
          <Heart size={18} weight={favorited ? 'fill' : 'regular'} className={favorited ? 'text-wol-pink' : ''} />
        </button>

        {/* Frente */}
        <div className="absolute inset-0 z-10 transition-opacity duration-700 ease-in-out group-hover:opacity-0 p-4">
          <Image
            src={variant.frontImage}
            alt={`${product.name} - ${variant.color} - Frente`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </div>
        
        {/* Verso */}
        <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 p-4">
          <Image
            src={variant.backImage}
            alt={`${product.name} - ${variant.color} - Verso`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain object-center transition-transform duration-1000 ease-out group-hover:scale-105"
          />
        </div>

        {/* CTA de Compra (Fixo mobile, revela no hover desktop) */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center translate-y-2 opacity-100 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ease-out">
          <button className={cn(
            "w-full bg-wol-pink text-wol-graphite font-sans font-bold uppercase text-sm tracking-widest py-3 transition-colors border border-transparent",
            variant.color === 'branco' ? "hover:bg-wol-white hover:text-wol-black" : "hover:bg-wol-black hover:text-wol-white"
          )}>
            Adicionar ao Carrinho
          </button>
        </div>
      </Link>

      {/* Informações do Produto */}
      <div className="flex flex-col items-center text-center gap-3">
        {/* Nome e Preço */}
        <div className="flex flex-col items-center gap-1">
          <Link href={`/produtos/${product.slug}`}>
            <h3 className="font-sans font-bold text-xl md:text-2xl uppercase tracking-wider text-wol-graphite hover:text-wol-graphite/60 transition-colors">
              {product.name}
            </h3>
          </Link>
          <p className="font-sans font-medium text-lg md:text-xl text-wol-graphite/80">
            {formatPrice(product.price)}
          </p>
        </div>

        {/* Seletor de Cores */}
        {showColorSelector && product.variants.length > 1 && (
          <div className="flex items-center justify-center gap-3 pt-1">
            {product.variants.map((v, idx) => (
              <button
                key={v.color}
                onClick={() => setActiveVariantIdx(idx)}
                className={cn(
                  "h-5 w-5 rounded-full border transition-all",
                  activeVariantIdx === idx 
                    ? "border-wol-pink ring-1 ring-wol-pink ring-offset-2 ring-offset-[#f9f9f9] scale-110" 
                    : "border-wol-graphite/20 hover:scale-110"
                )}
                style={{ backgroundColor: v.color === 'branco' ? '#ffffff' : v.color === 'preto' ? '#000000' : '#303039' }}
                aria-label={`Selecionar cor ${v.color}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
