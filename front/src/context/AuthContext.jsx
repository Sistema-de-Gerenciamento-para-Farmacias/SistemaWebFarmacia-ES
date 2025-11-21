// AuthContext.jsx
// Contexto global de autenticação.
// DEVE ALTERAR AQUI QUANDO O BACK ESTIVER PRONTO para validar token com o servidor.

import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
