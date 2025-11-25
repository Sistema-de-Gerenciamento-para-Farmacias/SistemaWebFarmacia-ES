// App.jsx
// Este arquivo é o ponto central da aplicação React.
// Ele configura as rotas usando React Router e envolve tudo com o AuthProvider
// para que o contexto de autenticação esteja disponível em toda a aplicação.

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./context/ProtectedRoute";
import Inicial from "./pages/Inicial/Inicial";
import HomeCliente from "./pages/HomeCliente/HomeCliente";
import HomeAdm from "./pages/HomeAdm/HomeAdm";
import LoginAdm from "./pages/LoginAdm/LoginAdm";
import LoginCliente from "./pages/LoginCliente/LoginCliente";
import "./App.css";
import CadastroCliente from "./pages/CadastroCliente/CadastroCliente";
import ListaClientes from "./pages/ListaClientes/ListaClientes";
import EditarCliente from "./pages/EditarCliente/EditarCliente";
import ListaFuncionarios from "./pages/ListaFuncionario/ListaFuncionario";
import CadastroFuncionario from "./pages/CadastroFuncionario/CadastroFuncionario";
import EditarFuncionario from "./pages/EditarFuncionario/EditarFuncionario";

function App() {
  return (
    // AuthProvider fornece o estado global de autenticação
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Página inicial com botões de login */}
          <Route path="/" element={<Inicial />} />

          {/* Página de login do administrador */}
          <Route path="/login-adm" element={<LoginAdm />} />

          {/* Página de login do cliente */}
          <Route path="/login-cliente" element={<LoginCliente />} />

          <Route path="/cadastro-cliente" element={<CadastroCliente />} />

          {/* Página Home protegida: só acessa se estiver logado */}
          <Route
            path="/homeAdm"
            element={
              <ProtectedRoute>
                <HomeAdm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homeCliente"
            element={
              <ProtectedRoute>
                <HomeCliente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editar-cliente/:id"
            element={
              <ProtectedRoute>
                <EditarCliente />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listaClientes"
            element={
              <ProtectedRoute>
                <ListaClientes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/listaFuncionarios"
            element={
              <ProtectedRoute>
                <ListaFuncionarios />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cadastro-funcionario"
            element={
              <ProtectedRoute>
                <CadastroFuncionario />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editar-funcionario/:id"
            element={
              <ProtectedRoute>
                <EditarFuncionario />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
