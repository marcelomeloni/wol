export interface ProductVariant {
  color: string;
  colorLabel: string;
  frontImage: string;
  backImage: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  price: number;
  description: string;
  variants: ProductVariant[];
  isNew?: boolean;
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
