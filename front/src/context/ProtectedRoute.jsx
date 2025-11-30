// front/src/context/ProtectedRoute.jsx
import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Loading from '../components/Loading/Loading';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, user, loading } = useContext(AuthContext);

  console.log('🛡️ ProtectedRoute - Token:', token);
  console.log('🛡️ ProtectedRoute - User:', user);

  // Aguarda carregamento inicial
  if (loading) {
    return <Loading />;
  }

  // Redireciona para login se não tem token
  if (!token) {
    console.log('❌ ProtectedRoute: Sem token, redirecionando para login');
    return <Navigate to="/login" replace />;
  }

  // Verifica se o usuário tem a role necessária
  if (requiredRole) {
    const userRole = user?.tipoUsuario;
    const hasRequiredRole = Array.isArray(requiredRole) 
      ? requiredRole.includes(userRole)
      : userRole === requiredRole;

    if (!hasRequiredRole) {
      console.log(`❌ ProtectedRoute: User role ${userRole} não tem permissão para ${requiredRole}`);
      
      // Redireciona para home baseado no tipo de usuário
      if (userRole === 'USER') {
        return <Navigate to="/homeCliente" replace />;
      } else {
        return <Navigate to="/homeAdmin" replace />;
      }
    }
  }

  console.log('✅ ProtectedRoute: Acesso permitido');
  return children;
};

export default ProtectedRoute;