// front/src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Recupera token do localStorage ao carregar
  useEffect(() => {
    const storedToken = authService.getToken();
    console.log('🔐 Token recuperado do localStorage:', storedToken);
    
    if (storedToken && authService.isAuthenticated()) {
      setToken(storedToken);
      
      // Tenta recuperar user do localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Erro ao parsear user do localStorage:', error);
        }
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    console.log('📝 Login chamado com dados:', userData);
    
    if (userData && userData.token) {
      setToken(userData.token);
      setUser(userData.user);
      
      // Salva no localStorage
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData.user));
      
      console.log('✅ Token e user salvos no contexto e localStorage');
    }
  };

  const logout = () => {
    console.log('🚪 Logout executado');
    setToken(null);
    setUser(null);
    authService.logout();
    localStorage.removeItem('user');
  };

  const value = {
    token,
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};