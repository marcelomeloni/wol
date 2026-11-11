import { apiFetch } from './api';
import type { Product, ProductColor } from '@/types';

export interface ProductQuery {
  categoryId?: string;
  search?: string;
  isFeatured?: boolean;
}

export async function getProducts(query: ProductQuery = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.categoryId) params.set('categoryId', query.categoryId);
  if (query.search) params.set('search', query.search);
  if (query.isFeatured) params.set('isFeatured', 'true');

  const qs = params.toString();
  return apiFetch<Product[]>(`/products${qs ? `?${qs}` : ''}`, { auth: false });
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${slug}`, { auth: false });
  } catch {
    return null;
  }
}

// Helpers do contrato: 1 variante por cor × tamanho; deduplica cores/tamanhos para os seletores.

const DEFAULT_SIZES = ['P', 'M', 'G', 'GG'];

export function hexFor(colorLabel?: string | null, colorHex?: string | null) {
  if (colorHex) return colorHex;
  const label = (colorLabel ?? '').toLowerCase();
  if (label === 'branco') return '#ffffff';
  if (label === 'preto') return '#000000';
  return '#303039';
}

export function productColors(product: Product): ProductColor[] {
  if (product.colors && product.colors.length > 0) return product.colors;

  const seen = new Map<string, ProductColor>();
  for (const v of product.variants) {
    if (!v.color || seen.has(v.color)) continue;
    seen.set(v.color, {
      id: v.color,
      colorName: v.colorLabel ?? '',
      colorHex: v.colorHex ?? '',
    });
  }
  return [...seen.values()];
}

export function productSizes(product: Product): string[] {
  if (product.sizes && product.sizes.length > 0) {
    return product.sizes.map((s) => s.sizeName);
  }
  const fromVariants = [
    ...new Set(product.variants.map((v) => v.size).filter((s): s is string => Boolean(s))),
  ];
  return fromVariants.length > 0 ? fromVariants : DEFAULT_SIZES;
}
