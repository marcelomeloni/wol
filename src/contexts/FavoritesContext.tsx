'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';

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
}

const FavoritesContext = createContext<FavoritesContextData>({} as FavoritesContextData);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<ProductFavorite[]>([]);

  const { isAuthenticated } = useAuth();
  
  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('@wol:favorites');
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse favorites');
      }
    }
  }, []);

  // Sync to local storage on change
  useEffect(() => {
    localStorage.setItem('@wol:favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (product: ProductFavorite) => {
    if (!isAuthenticated) {
      toast.error('Você precisa estar logado para favoritar um produto!');
      return;
    }

    const exists = favorites.some(p => p.id === product.id);
    if (exists) {
      toast.success('Produto removido dos favoritos.');
      setFavorites((prev) => prev.filter(p => p.id !== product.id));
    } else {
      toast.success('Produto adicionado aos favoritos!');
      setFavorites((prev) => [...prev, product]);
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(p => p.id === productId);
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
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
