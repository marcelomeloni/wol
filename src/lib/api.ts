// Cliente HTTP central; toda chamada ao backend Express passa por aqui.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  'https://wolbackend.vercel.app/api';

export const TOKEN_KEY = '@wol:token';

export class ApiError extends Error {
  status: number;
  code?: string;
  errors?: unknown;

  constructor(message: string, status = 0, code?: string, errors?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  auth?: boolean; // anexa Authorization automaticamente (default: true)
  token?: string | null; // token explícito (SSR)
}

interface BackendError {
  error?: {
    code?: string;
    message?: string | unknown[];
  };
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, auth = true, token, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  const bearer = token ?? (auth ? getToken() : null);
  if (bearer && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${bearer}`);
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // 204 / respostas vazias
  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const err = (data as BackendError)?.error;
    const rawMessage = err?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage
          .map((m) => (typeof m === 'string' ? m : (m as { message?: string })?.message ?? ''))
          .filter(Boolean)
          .join(', ')
      : (rawMessage as string) || 'Ocorreu um erro. Tente novamente.';

    throw new ApiError(message, res.status, err?.code, rawMessage);
  }

  return data as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
