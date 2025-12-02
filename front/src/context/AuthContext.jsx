// front/src/context/AuthContext.jsx

import { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth';

// Criação do contexto de autenticação para compartilhamento global
export const AuthContext = createContext();

/**
 * Provider de autenticação que gerencia estado do usuário e token
 * @component
 * @param {Object} props - Propriedades do provider
 * @param {React.ReactNode} props.children - Componentes filhos a serem envolvidos
 * @returns {JSX.Element} Provider de contexto de autenticação
 */
export const AuthProvider = ({ children }) => {
  // Estado para armazenar o token JWT do usuário
  const [token, setToken] = useState(null);
  
  // Estado para armazenar os dados do usuário logado
  const [user, setUser] = useState(null);
  
  // Estado para controlar o carregamento inicial
  const [loading, setLoading] = useState(true);

  /**
   * Efeito para recuperar token e dados do usuário do localStorage ao inicializar
   * Executa apenas uma vez durante o mount do componente
   */
  useEffect(() => {
    // Obtém token armazenado no localStorage
    const storedToken = authService.getToken();
    console.log('Token recuperado do localStorage:', storedToken);
    
    // Se existe token e ele é válido (não expirado)
    if (storedToken && authService.isAuthenticated()) {
      // Atualiza estado do token
      setToken(storedToken);
      
      // Tenta recuperar dados do usuário do localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          // Converte string JSON de volta para objeto
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Erro ao parsear user do localStorage:', error);
        }
      }
    }
    
    // Finaliza o estado de carregamento
    setLoading(false);
  }, []); // Array de dependências vazio = executa apenas no mount

  /**
   * Função de login que atualiza estado e armazena dados no localStorage
   * @param {Object} userData - Dados do usuário retornados pela API
   * @param {string} userData.token - Token JWT de autenticação
   * @param {Object} userData.user - Dados do usuário (id, nome, tipoUsuario, etc.)
   */
  const login = (userData) => {
    console.log('Login chamado com dados:', userData);
    
    // Verifica se os dados necessários estão presentes
    if (userData && userData.token) {
      // Atualiza estados do contexto
      setToken(userData.token);
      setUser(userData.user);
      
      // Persiste dados no localStorage para manter sessão
      localStorage.setItem('token', userData.token);
      localStorage.setItem('user', JSON.stringify(userData.user));
      
      console.log('Token e user salvos no contexto e localStorage');
    }
  };

  /**
   * Função de logout que limpa estado e remove dados do localStorage
   */
  const logout = () => {
    console.log('Logout executado');
    
    // Limpa estados do contexto
    setToken(null);
    setUser(null);
    
    // Chama serviço de logout para limpar localStorage
    authService.logout();
    
    // Remove dados específicos do usuário
    localStorage.removeItem('user');
  };

  // Valor do contexto que será disponibilizado para componentes filhos
  const value = {
    token,      // Token JWT atual
    user,       // Dados do usuário logado
    login,      // Função para realizar login
    logout,     // Função para realizar logout
    loading     // Estado de carregamento inicial
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};