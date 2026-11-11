'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { API_URL, TOKEN_KEY } from '@/lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  role: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf: string;
  phone?: string;
}

interface ValidationError {
  isValidationError: true;
  errors: Array<{ path?: Array<string | number>; message?: string }>;
}

function isValidationError(error: unknown): error is ValidationError {
  return typeof error === 'object' && error !== null && 'isValidationError' in error;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginData, redirectUrl?: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchMe = useCallback(async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem(TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      queueMicrotask(() => fetchMe(token));
    } else {
      queueMicrotask(() => setIsLoading(false));
    }
  }, [fetchMe]);

  const login = async (data: LoginData, redirectUrl?: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error('Erro ao comunicar com o servidor.');
      }
      
      if (!res.ok) {
        // Se a mensagem for um array do Zod, lançamos o objeto para o componente lidar
        const errorData = result?.error?.message;
        if (Array.isArray(errorData)) {
          throw { isValidationError: true, errors: errorData };
        }
        throw new Error(errorData || 'Erro ao fazer login');
      }

      localStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
      toast.success('Bem-vinda de volta!');
      router.push(redirectUrl || '/minha-conta/pedidos');
    } catch (err) {
      if (!isValidationError(err)) {
        toast.error(err instanceof Error ? err.message : 'Erro desconhecido');
      }
      throw err;
    }
  };
  const register = async (data: RegisterData) => {
    try {
      const cpfNumeros = data.cpf.replace(/\D/g, '');
      const payload = { ...data, cpf: cpfNumeros };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      let result;
      try {
        result = await res.json();
      } catch {
        throw new Error('Erro ao comunicar com o servidor.');
      }

      if (!res.ok) {
        const errorData = result?.error?.message;
        if (Array.isArray(errorData)) {
          throw { isValidationError: true, errors: errorData };
        }
        throw new Error(errorData || 'Erro ao criar conta');
      }

      toast.success('Conta criada com sucesso! Faça login para continuar.');
    } catch (err) {
      if (!isValidationError(err)) {
        toast.error(err instanceof Error ? err.message : 'Erro desconhecido');
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    toast.success('Você saiu da sua conta.');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

