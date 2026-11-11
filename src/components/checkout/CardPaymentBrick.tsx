'use client';

import { useEffect, useMemo, useCallback } from 'react';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import { MP_PUBLIC_KEY } from '@/lib/mercadopago';

interface CardPaymentSubmitData {
  token?: string;
  installments?: number;
  issuer_id?: string;
  payment_method_id?: string;
}

interface BrickError {
  message?: string;
}

// Inicializa o SDK assim que o módulo é avaliado no browser.
// initMercadoPago apenas registra a chave pública (não acessa `window`),
// então é seguro executá-lo no topo do módulo.
if (typeof window !== 'undefined' && MP_PUBLIC_KEY) {
  initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
}

interface CardPaymentBrickProps {
  amount: number;
  email?: string;
  cpf?: string;
  onSubmit: (token: string, installments: number) => Promise<void>;
  onReady?: () => void;
  onError?: (message: string) => void;
}

// Checkout transparente: o formulário de cartão do Mercado Pago é renderizado
// dentro da nossa página. O Brick devolve um token single-use — nenhum dado
// de cartão trafega pelos nossos servidores.
export function CardPaymentBrick({
  amount,
  email,
  cpf,
  onSubmit,
  onReady,
  onError,
}: CardPaymentBrickProps) {
  useEffect(() => {
    if (MP_PUBLIC_KEY) initMercadoPago(MP_PUBLIC_KEY, { locale: 'pt-BR' });
  }, []);

  const initialization = useMemo(
    () => ({
      amount,
      payer: {
        email: email || undefined,
        identification: cpf
          ? { type: 'CPF', number: cpf.replace(/\D/g, '') }
          : undefined,
      },
    }),
    [amount, email, cpf],
  );

  const customization = useMemo(
    () => ({
      paymentMethods: { minInstallments: 1, maxInstallments: 6 },
      visual: {
        hideFormTitle: true,
        theme: {
          variables: {
            colorPrimary: '#303039',
            colorSecondary: '#303039',
            borderRadius: '0px',
          },
        },
      },
    }),
    [],
  );

  const handleSubmit = useCallback(
    async (param: CardPaymentSubmitData) => {
      if (!param?.token) {
        onError?.('Não foi possível gerar o token do cartão.');
        return;
      }
      await onSubmit(param.token, param.installments ?? 1);
    },
    [onSubmit, onError],
  );

  const handleReady = useCallback(() => onReady?.(), [onReady]);

  const handleError = useCallback(
    (err: BrickError) =>
      onError?.(err?.message ?? 'Não foi possível carregar o formulário de cartão.'),
    [onError],
  );

  if (!MP_PUBLIC_KEY) return null;

  return (
    <CardPayment
      initialization={initialization}
      customization={customization}
      locale="pt-BR"
      onSubmit={handleSubmit}
      onReady={handleReady}
      onError={handleError}
    />
  );
}
