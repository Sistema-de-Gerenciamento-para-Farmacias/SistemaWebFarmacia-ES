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

// Clientes
import CadastroCliente from "./pages/Pessoa/Clientes/CadastroCliente";
import ListaClientes from "./pages/Pessoa/Clientes/ListaClientes";
import EditarCliente from "./pages/Pessoa/Clientes/EditarCliente";

// Funcionários
import ListaFuncionarios from "./pages/Pessoa/Funcionarios/ListaFuncionario";
import CadastroFuncionario from "./pages/Pessoa/Funcionarios/CadastroFuncionario";
import EditarFuncionario from "./pages/Pessoa/Funcionarios/EditarFuncionario";

// Administradores
import ListaAdministradores from "./pages/Pessoa/Administradores/ListaAdministrador";
import CadastroAdministrador from "./pages/Pessoa/Administradores/CadastroAdministrador";
import EditarAdministrador from "./pages/Pessoa/Administradores/EditarAdministrador";

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

          {/* Cadastro de cliente */}
          <Route path="/cadastro-cliente" element={<CadastroCliente />} />

          {/* Páginas Home protegidas */}
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

          {/* CRUD Clientes */}
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

          {/* CRUD Funcionários */}
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

          {/* CRUD Administradores */}
          <Route
            path="/listaAdministradores"
            element={
              <ProtectedRoute>
                <ListaAdministradores />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cadastroAdministrador"
            element={
              <ProtectedRoute>
                <CadastroAdministrador />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editarAdministrador/:id"
            element={
              <ProtectedRoute>
                <EditarAdministrador />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
