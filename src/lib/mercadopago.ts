// Checkout Transparente: o Brick roda no browser e envia apenas o token single-use ao backend.

export const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? '';

export type PaymentProvider = 'mercadopago' | 'mock';

// Modo demo: sem a chave pública do Mercado Pago, usa o pagamento simulado
// (o backend também aprova na hora). Pode ser forçado por env.
const explicitProvider = process.env.NEXT_PUBLIC_PAYMENT_PROVIDER;

export const PAYMENT_PROVIDER: PaymentProvider =
  explicitProvider === 'mercadopago' || explicitProvider === 'mock'
    ? explicitProvider
    : MP_PUBLIC_KEY
      ? 'mercadopago'
      : 'mock';

export const isMercadoPagoEnabled = PAYMENT_PROVIDER === 'mercadopago';

export const isMockPayment = PAYMENT_PROVIDER === 'mock';
