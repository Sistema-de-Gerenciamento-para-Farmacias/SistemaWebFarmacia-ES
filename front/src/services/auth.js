// front/src/services/auth.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Usa a variável de ambiente com fallback para localhost:8080
const API_URL = import.meta.env.VITE_URL_BACKEND || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  async login(email, senha) {
    try {
      console.log('Fazendo login com:', { email, senha });
      
      const response = await api.post('/login', {
        email,
        senha
      });
      
      console.log('Resposta do backend:', response.data);

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // Decodifica o token para obter informações do usuário
        const decodedToken = jwtDecode(response.data.token);
        console.log('Token decodificado:', decodedToken);
        
        // Monta os dados do usuário
        const userData = {
          token: response.data.token,
          user: {
            email: email,
            // O tipo de usuário pode vir do token ou precisamos de outro endpoint
            tipoUsuario: this.getUserRoleFromToken(decodedToken),
            id: decodedToken.sub || null
          }
        };
        
        return userData;
      }
      
      throw new Error('Token não recebido do servidor');
      
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Erro ao conectar com o servidor');
      }
    }
  },

  // Método para extrair o role do token
  getUserRoleFromToken(decodedToken) {
    // Tenta diferentes possibilidades de onde o role pode estar no token
    if (decodedToken.role) return decodedToken.role;
    if (decodedToken.authorities) {
      // Se for um array, pega o primeiro
      const authorities = decodedToken.authorities;
      if (Array.isArray(authorities) && authorities.length > 0) {
        return authorities[0].replace('SCOPE_', '');
      }
    }
    if (decodedToken.scope) return decodedToken.scope;
    
    return 'USER'; // Fallback
  },

  logout() {
    localStorage.removeItem('token');
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  },

  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }
};

export default api;