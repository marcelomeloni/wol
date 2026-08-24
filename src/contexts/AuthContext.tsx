'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone?: string;
  role: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const API_URL = 'http://localhost:3333/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('@wol:token');
    if (token) {
      fetchMe(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchMe = async (token: string) => {
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
        localStorage.removeItem('@wol:token');
      }
    } catch (err) {
      console.error(err);
      localStorage.removeItem('@wol:token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: any) => {
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

      localStorage.setItem('@wol:token', result.token);
      setUser(result.user);
      toast.success('Bem-vinda de volta!');
      router.push('/minha-conta/pedidos');
    } catch (err: any) {
      if (!err.isValidationError) {
        toast.error(err.message || 'Erro desconhecido');
      }
      throw err;
    }
  };

  const register = async (data: any) => {
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
    } catch (err: any) {
      if (!err.isValidationError) {
        toast.error(err.message || 'Erro desconhecido');
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('@wol:token');
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
