"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { hexFor, productColors } from "@/lib/products";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  className?: string;
  showColorSelector?: boolean;
}

export function ProductCard({ product, className, showColorSelector = true }: ProductCardProps) {
  const variants = product.variants ?? [];

  // Cores próprias do produto (não as variantes: são 1 linha por cor × tamanho).
  const colors = useMemo(() => productColors(product), [product]);

  const [activeColorId, setActiveColorId] = useState<string | null>(
    () => (colors.find((c) => c.colorName === "Branco") ?? colors[0])?.id ?? null,
  );

  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(product.id);

  const activeColor = colors.find((c) => c.id === activeColorId) ?? colors[0] ?? null;
  const variant =
    (activeColor ? variants.find((v) => v.color === activeColor.id) : undefined) ??
    variants[0] ??
    null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return (
    <div className={cn("group flex flex-col gap-5", className)}>
      <Link
        href={`/produtos/${product.slug}`}
        className={cn(
          "relative block aspect-[3/4] w-full overflow-hidden rounded-2xl transition-colors duration-500 bg-[#f9f9f9]"
        )}
      >
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite({
              id: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: variant?.frontImage ?? ''
            });
          }}
          className="absolute top-4 right-4 z-30 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm text-wol-graphite hover:scale-110 transition-transform shadow-sm rounded-full"
        >
          <Heart size={18} weight={favorited ? 'fill' : 'regular'} className={favorited ? 'text-wol-pink' : ''} />
        </button>

        {variant?.frontImage && (
          <div className="absolute inset-0 z-10 transition-opacity duration-700 ease-in-out group-hover:opacity-0 p-4">
            <Image
              src={variant.frontImage}
              alt={`${product.name} - ${variant.colorLabel} - Frente`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain object-center transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          </div>
        )}

        {variant?.backImage && (
          <div className="absolute inset-0 opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100 p-4">
            <Image
              src={variant.backImage}
              alt={`${product.name} - ${variant.colorLabel} - Verso`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain object-center transition-transform duration-1000 ease-out group-hover:scale-105"
            />
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center translate-y-2 opacity-100 md:opacity-0 md:translate-y-4 md:group-hover:opacity-100 md:group-hover:translate-y-0 transition-all duration-300 ease-out">
          <span className={cn(
            "w-full text-center bg-wol-pink text-wol-graphite font-sans font-bold uppercase text-sm tracking-widest py-3 transition-colors border border-transparent",
            (variant?.colorLabel ?? '').toLowerCase() === 'branco' ? "hover:bg-wol-white hover:text-wol-black" : "hover:bg-wol-black hover:text-wol-white"
          )}>
            Ver Produto
          </span>
        </div>
      </Link>

      <div className="flex flex-col items-center text-center gap-3">
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

        {showColorSelector && colors.length > 1 && (
          <div className="flex items-center justify-center gap-3 pt-1">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setActiveColorId(color.id)}
                className={cn(
                  "h-5 w-5 rounded-full border transition-all",
                  activeColor?.id === color.id
                    ? "border-wol-pink ring-1 ring-wol-pink ring-offset-2 ring-offset-[#f9f9f9] scale-110"
                    : "border-wol-graphite/20 hover:scale-110"
                )}
                style={{ backgroundColor: hexFor(color.colorName, color.colorHex) }}
                aria-label={`Selecionar cor ${color.colorName}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
