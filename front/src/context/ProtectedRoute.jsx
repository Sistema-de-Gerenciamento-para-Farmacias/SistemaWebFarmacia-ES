// front/src/context/ProtectedRoute.jsx

import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Loading from '../components/Loading/Loading';

/**
 * Componente de rota protegida que verifica autenticação e permissões
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componente a ser renderizado se autorizado
 * @param {string|string[]} [props.requiredRole] - Role(s) necessária(s) para acesso
 * @returns {JSX.Element} Componente children ou redirecionamento
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  // Obtém estado de autenticação do contexto
  const { token, user, loading } = useContext(AuthContext);

  // Logs para debug (apenas em desenvolvimento)
  console.log('ProtectedRoute - Token:', token);
  console.log('ProtectedRoute - User:', user);

  /**
   * 1. Verifica estado de carregamento inicial
   * Aguarda enquanto o contexto está verificando token no localStorage
   */
  if (loading) {
    return <Loading />;
  }

  /**
   * 2. Verifica se usuário está autenticado (tem token)
   * Se não tiver token, redireciona para página de login
   */
  if (!token) {
    console.log('ProtectedRoute: Sem token, redirecionando para login');
    return <Navigate to="/login" replace />; // replace substitui no histórico
  }

  /**
   * 3. Verifica permissões de role se necessário
   * Apenas executa se a rota requer uma role específica
   */
  if (requiredRole) {
    // Obtém role do usuário atual (tipoUsuario do objeto user)
    const userRole = user?.tipoUsuario;
    
    // Verifica se o usuário tem a role necessária
    // Suporta tanto string única quanto array de roles permitidas
    const hasRequiredRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole)        // Verifica se está no array
      : userRole === requiredRole;             // Compara com string única

    // Se não tem a role necessária, redireciona
    if (!hasRequiredRole) {
      console.log(`ProtectedRoute: User role ${userRole} não tem permissão para ${requiredRole}`);
      
      /**
       * Redireciona para home apropriada baseado no tipo de usuário
       * - USER: redireciona para home do cliente
       * - ADMIN/FUNCIONARIO: redireciona para home administrativa
       */
      if (userRole === 'USER') {
        return <Navigate to="/homeCliente" replace />;
      } else {
        return <Navigate to="/homeAdmin" replace />;
      }
    }
  }

  /**
   * 4. Todas as verificações passaram
   * Renderiza o componente children (conteúdo protegido)
   */
  console.log('ProtectedRoute: Acesso permitido');
  return children;
};

export default ProtectedRoute;