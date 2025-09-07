'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { toast } from 'sonner';

interface AdminUser {
  id: string;
  adminId: string;
  isAdmin: boolean;
  type: 'admin';
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isLoading: boolean;
  login: (adminId: string, password: string) => Promise<boolean>;
  logout: () => void;
  verifyToken: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (adminId: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/admin-auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminId, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store admin token
        localStorage.setItem('adminToken', data.token);
        setAdmin(data.admin);
        toast.success('Admin login successful');
        return true;
      } else {
        toast.error(data.message || 'Invalid admin credentials');
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast.error('Failed to login as admin');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    setAdmin(null);
    toast.success('Admin logged out successfully');
  };

  const verifyToken = useCallback(async (): Promise<boolean> => {
    const token = localStorage.getItem('adminToken');
    if (!token) return false;

    try {
      const response = await fetch('http://localhost:3001/api/admin-auth/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setAdmin(data.admin);
        return true;
      } else {
        localStorage.removeItem('adminToken');
        return false;
      }
    } catch (error) {
      console.error('Admin token verification error:', error);
      localStorage.removeItem('adminToken');
      return false;
    }
  }, []);

  const value: AdminAuthContextType = {
    admin,
    isLoading,
    login,
    logout,
    verifyToken,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
