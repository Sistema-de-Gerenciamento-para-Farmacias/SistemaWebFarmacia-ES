// ProtectedRoute.jsx
// Protege rotas: só acessa se houver usuário logado com token.
// DEVE ALTERAR AQUI QUANDO O BACK ESTIVER PRONTO para validar token no servidor.

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user || !user.token) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
