import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { authService } from '../services/services';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  preferences?: {
    theme: string;
    notifications: boolean;
    emailUpdates: boolean;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verificar se o usuário está autenticado ao carregar
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const response = await authService.getCurrentUser();
          setUser(response.data);
        }
      } catch (err: any) {
        console.error('Erro ao carregar usuário:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Registrar novo usuário
  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.register({ name, email, password });
      setUser(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao registrar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login de usuário
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      setUser(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Credenciais inválidas');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout de usuário
  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao fazer logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar perfil do usuário
  const updateProfile = async (userData: Partial<User>) => {
    setLoading(true);
    try {
      const response = await authService.updateDetails({
        name: userData.name || user?.name || '',
        email: userData.email || user?.email || ''
      });
      setUser({ ...user, ...response.data });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar senha
  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true);
    try {
      await authService.updatePassword({ currentPassword, newPassword });
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar senha');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Esqueci minha senha
  const forgotPassword = async (email: string) => {
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao processar recuperação de senha');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Redefinir senha
  const resetPassword = async (token: string, password: string) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao redefinir senha');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Limpar erros
  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile,
        updatePassword,
        forgotPassword,
        resetPassword,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
