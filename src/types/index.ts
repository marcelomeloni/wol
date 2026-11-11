// Espelha o payload de products.service.ts (1 variante por cor × tamanho).

export interface ProductVariant {
  id?: string | null; // product_variants.id (para envio ao backend)
  color: string; // id da cor (product_colors.id) — repetido entre os tamanhos
  colorLabel: string | null;
  colorHex?: string | null;
  frontImage: string | null;
  backImage: string | null;
  size?: string | null; // nome do tamanho (product_sizes.size_name)
  stockQuantity?: number | null;
  price?: number;
}

export interface ProductColor {
  id: string;
  colorName: string;
  colorHex: string;
}

export interface ProductSize {
  id: string;
  sizeName: string;
}

export interface ProductReview {
  id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  users?: { name: string } | null;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  variants: ProductVariant[];
  colors?: ProductColor[];
  sizes?: ProductSize[];
  reviews?: ProductReview[];
  category?: { id: string; name: string } | null;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}
