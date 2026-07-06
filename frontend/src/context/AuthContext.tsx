'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Business {
  id: string;
  name: string;
  gstNumber?: string;
  address?: string;
  logo?: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  business: Business | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (email: string, name: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, businessName: string) => Promise<boolean>;
  updateBusiness: (data: Partial<Business>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from token on startup
  useEffect(() => {
    const storedToken = localStorage.getItem('bizbrain_token');
    if (storedToken) {
      setToken(storedToken);
      fetchProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async (authToken: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser({ id: data.id, name: data.name, email: data.email, role: data.role });
        setBusiness(data.business);
      } else {
        // Token expired or invalid
        logout();
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('bizbrain_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setBusiness(data.business);
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (email: string, name: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, googleToken: 'mock-google-token' }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('bizbrain_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setBusiness(data.business);
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, businessName: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, businessName }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('bizbrain_token', data.token);
        setToken(data.token);
        setUser(data.user);
        setBusiness(data.business);
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('bizbrain_token');
    setToken(null);
    setUser(null);
    setBusiness(null);
    router.push('/login');
  };

  const updateBusiness = (data: Partial<Business>) => {
    if (business) {
      setBusiness({ ...business, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        business,
        loading,
        login,
        loginWithGoogle,
        logout,
        register,
        updateBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
