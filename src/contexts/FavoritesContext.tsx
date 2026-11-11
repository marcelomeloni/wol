'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { apiFetch } from '@/lib/api';

interface ProductFavorite {
  id: string; // product_id
  name: string;
  slug: string;
  price: number;
  image: string;
}

interface FavoritesContextData {
  favorites: ProductFavorite[];
  toggleFavorite: (product: ProductFavorite) => void;
  isFavorite: (productId: string) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

const LOCAL_KEY = '@wol:favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<ProductFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const readLocal = useCallback((): ProductFavorite[] => {
    try {
      const stored = localStorage.getItem(LOCAL_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const writeLocal = useCallback((items: ProductFavorite[]) => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(items));
  }, []);

  // Carrega favoritos: do backend quando logado, local caso contrário.
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isAuthenticated) {
        setFavorites(readLocal());
        return;
      }
      setIsLoading(true);
      try {
        const data = await apiFetch<Array<{ product_id: string; products?: { name: string; slug: string; base_price: number } }>>('/favorites');
        const mapped: ProductFavorite[] = data.map((f) => ({
          id: f.product_id,
          name: f.products?.name ?? '',
          slug: f.products?.slug ?? '',
          price: f.products?.base_price ?? 0,
          image: '',
        }));
        if (!mounted) return;
        setFavorites(mapped);
        writeLocal(mapped);
      } catch {
        if (mounted) setFavorites(readLocal());
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, readLocal, writeLocal]);

  const toggleFavorite = async (product: ProductFavorite) => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para favoritar um produto!');
      return;
    }

    const exists = favorites.some((p) => p.id === product.id);

    const next = exists
      ? favorites.filter((p) => p.id !== product.id)
      : [...favorites, product];
    setFavorites(next);
    writeLocal(next);

    try {
      if (exists) {
        await apiFetch(`/favorites/${product.id}`, { method: 'DELETE' });
        toast.success('Produto removido dos favoritos.');
      } else {
        await apiFetch('/favorites', { method: 'POST', body: { productId: product.id } });
        toast.success('Produto adicionado aos favoritos!');
      }
    } catch {
      setFavorites(favorites);
      writeLocal(favorites);
      toast.error('Não foi possível atualizar seus favoritos.');
    }
  };

  const isFavorite = (productId: string) => favorites.some((p) => p.id === productId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, isLoading }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
