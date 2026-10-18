/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse, UserRole } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: { email: string; password: string; fullName: string; role: UserRole; phone?: string }) => Promise<AuthResponse>;
  logout: () => void;
  isCustomer: boolean;
  isOwner: boolean;
  isVendor: boolean;
  isOrganizer: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await apiClient.get<User>('/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/login', { email, password });
    const authData = res.data;
    setToken(authData.token);
    const userData: User = {
      id: authData.id,
      email: authData.email,
      fullName: authData.fullName,
      role: authData.role,
    };
    setUser(userData);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    return authData;
  };

  const register = async (data: { email: string; password: string; fullName: string; role: UserRole; phone?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', data);
    const authData = res.data;
    setToken(authData.token);
    const userData: User = {
      id: authData.id,
      email: authData.email,
      fullName: authData.fullName,
      role: authData.role,
      phone: data.phone,
    };
    setUser(userData);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(userData));
    return authData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isCustomer = user?.role === 'CUSTOMER';
  const isOwner = user?.role === 'VENUE_OWNER';
  const isVendor = user?.role === 'VENDOR';
  const isOrganizer = user?.role === 'EVENT_ORGANIZER';
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isCustomer,
        isOwner,
        isVendor,
        isOrganizer,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
