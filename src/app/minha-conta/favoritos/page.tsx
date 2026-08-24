'use client';

import { useFavorites } from '@/contexts/FavoritesContext';
import { ProductCard } from '@/components/ui/ProductCard';
import { HeartBreak } from '@phosphor-icons/react';
import Link from 'next/link';

// Mock de produtos (precisamos do array original para casar os dados)
import { products } from '@/lib/data';

export default function MinhaContaFavoritos() {
  const { favorites } = useFavorites();

  // Filtramos os produtos completos baseado nos IDs salvos nos favoritos
  const favoriteProducts = products.filter(p => favorites.some(f => f.id === p.id));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-wol-graphite/10 pb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-2">Meus Favoritos</h2>
        <p className="text-xs text-wol-graphite/60">Sua lista de desejos (Wishlist).</p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-wol-graphite/10 bg-[#f9f9f9]">
          <HeartBreak size={48} className="text-wol-graphite/20 mb-4" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-wol-graphite mb-2">Lista Vazia</h3>
          <p className="text-xs text-wol-graphite/60 mb-6 max-w-sm">
            VocÃª ainda nÃ£o adicionou nenhuma peÃ§a aos seus favoritos. Navegue pelos drops e salve suas favoritas!
          </p>
          <Link href="/produtos" className="bg-wol-graphite text-wol-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-wol-black transition-colors">
            Explorar ColeÃ§Ã£o
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteProducts.map((product) => (
            <ProductCard key={product.id} product={product} showColorSelector={true} />
          ))}
        </div>
      )}
    </div>
  );
}

