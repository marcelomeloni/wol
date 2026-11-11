import { NextResponse } from 'next/server';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://wolbackend.vercel.app/api';

// Proxy para o backend. Nenhuma credencial do Supabase fica exposta no frontend.
export async function GET(
  _request: Request,
  context: { params: Promise<{ productId: string }> },
) {
  const params = await context.params;

  try {
    const res = await fetch(`${API_URL}/reviews/product/${params.productId}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: { code: 'REVIEWS_UNAVAILABLE', message: 'Não foi possível carregar avaliações.' } },
        { status: res.status },
      );
    }

    return NextResponse.json(await res.json());
  } catch {
    return NextResponse.json(
      { error: { code: 'REVIEWS_UNAVAILABLE', message: 'Não foi possível carregar avaliações.' } },
      { status: 502 },
    );
  }
}
