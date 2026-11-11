import { apiFetch } from './api';

export interface ShippingOption {
  id: string;
  name: string;
  company: string;
  price: number;
  deliveryTime: number;
}

export interface ShippingQuote {
  origin: string;
  destination: string;
  options: ShippingOption[];
}

export interface ShippingQuoteItem {
  productId: string;
  quantity: number;
}

// Cotação de frete (público, não exige login).
export async function quoteShipping(
  zipCode: string,
  items: ShippingQuoteItem[],
): Promise<ShippingQuote> {
  return apiFetch<ShippingQuote>('/shipping/quote', {
    method: 'POST',
    auth: false,
    body: { zipCode: zipCode.replace(/\D/g, ''), items },
  });
}

export interface PayRequest {
  orderId: string;
  method: 'pix' | 'credit_card';
  token?: string;
  installments?: number;
}

export interface PayResponse {
  orderId: string;
  paymentId: number | null;
  status: 'approved' | 'pending' | 'rejected' | 'unknown';
  statusDetail: string | null;
  pixQrCodeBase64: string | null;
  pixQrCode: string | null;
}

// Cria o pagamento na nossa página (Checkout Transparente).
export async function payOrder(payload: PayRequest): Promise<PayResponse> {
  return apiFetch<PayResponse>('/payments/pay', {
    method: 'POST',
    body: payload,
  });
}
