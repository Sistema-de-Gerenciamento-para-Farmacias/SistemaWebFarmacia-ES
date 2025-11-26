// front/src/App.jsx

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
import DetalhesAdministrador from "./pages/Pessoa/Administradores/DetalhesAdministrador";

// Produtos
import ListarProdutos from "./pages/Produtos/ProdutosAdministrador/ListarProdutos/ListarProdutos";
import CadastrarProdutos from "./pages/Produtos/ProdutosAdministrador/CadastrarProdutos/CadastrarProdutos";
import EditarProdutos from "./pages/Produtos/ProdutosAdministrador/EditarProdutos/EditarProdutos";
import DetalhesProduto from "./pages/Produtos/ProdutosAdministrador/DetalhesProduto/DetalhesProduto";
// Detalhes pessoas
import DetalhesCliente from "./pages/Pessoa/Clientes/DetalhesCliente";
import DetalhesFuncionario from "./pages/Pessoa/Funcionarios/DetalhesFuncionario";
// Vendas
import ListarVendas from "./pages/Vendas/VendasAdministrador/ListarVendas";
import DetalhesVenda from "./pages/Vendas/VendasAdministrador/DetalhesVenda";
import EditarVenda from "./pages/Vendas/VendasAdministrador/EditarVenda";

// Cliente - Produtos

import ListarProdutosCliente from "./pages/Produtos/ProdutosClientes/ListarProdutosCliente/ListarProdutosCliente";

import Carrinho from "./pages/Carrinho/Carrinho";
import SimulaPagamento from "./pages/SimulaPagamento/SimulaPagamento";
import VisualizarComprasCliente from "./pages/Vendas/VendasCliente/VisualizarComprasCliente/VisualizarComprasCliente";
import DetalhesCompraCliente from "./pages/Vendas/VendasCliente/DetalhesCompraCliente/DetalhesCompraCliente";
import { CarrinhoProvider } from "./context/CarrinhoContext";
import DetalhesProdutoCliente from "./pages/Produtos/ProdutosClientes/DetalhesProdutoCliente/DetalhesProdutoCliente";

function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Inicial />} />
            <Route path="/login-adm" element={<LoginAdm />} />
            <Route path="/login-cliente" element={<LoginCliente />} />
            <Route path="/cadastro-cliente" element={<CadastroCliente />} />

            <Route path="/homeAdm" element={<ProtectedRoute><HomeAdm /></ProtectedRoute>} />
            <Route path="/homeCliente" element={<ProtectedRoute><HomeCliente /></ProtectedRoute>} />

            {/* CRUD Clientes */}
            <Route path="/editar-cliente/:id" element={<ProtectedRoute><EditarCliente /></ProtectedRoute>} />
            <Route path="/listaClientes" element={<ProtectedRoute><ListaClientes /></ProtectedRoute>} />
            <Route path="/detalhesCliente/:id" element={<ProtectedRoute><DetalhesCliente /></ProtectedRoute>} />

            {/* CRUD Funcionários */}
            <Route path="/listaFuncionarios" element={<ProtectedRoute><ListaFuncionarios /></ProtectedRoute>} />
            <Route path="/cadastro-funcionario" element={<ProtectedRoute><CadastroFuncionario /></ProtectedRoute>} />
            <Route path="/editar-funcionario/:id" element={<ProtectedRoute><EditarFuncionario /></ProtectedRoute>} />
            <Route path="/detalhesFuncionario/:id" element={<ProtectedRoute><DetalhesFuncionario /></ProtectedRoute>} />

            {/* CRUD Administradores */}
            <Route path="/listaAdministradores" element={<ProtectedRoute><ListaAdministradores /></ProtectedRoute>} />
            <Route path="/cadastroAdministrador" element={<ProtectedRoute><CadastroAdministrador /></ProtectedRoute>} />
            <Route path="/editarAdministrador/:id" element={<ProtectedRoute><EditarAdministrador /></ProtectedRoute>} />
            <Route path="/detalhesAdministrador/:id" element={<ProtectedRoute><DetalhesAdministrador /></ProtectedRoute>} />

            {/* CRUD Produtos Admin */}
            <Route path="/listarProdutos" element={<ProtectedRoute><ListarProdutos /></ProtectedRoute>} />
            <Route path="/cadastrarProduto" element={<ProtectedRoute><CadastrarProdutos /></ProtectedRoute>} />
            <Route path="/editarProduto/:id" element={<ProtectedRoute><EditarProdutos /></ProtectedRoute>} />
            <Route path="/detalhesProduto/:id" element={<ProtectedRoute><DetalhesProduto /></ProtectedRoute>} />
            
            {/* CRUD Vendas Admin */}
            <Route path="/listarVendas" element={<ProtectedRoute><ListarVendas /></ProtectedRoute>} />
            <Route path="/detalhesVenda/:id" element={<ProtectedRoute><DetalhesVenda /></ProtectedRoute>} />
            <Route path="/editarVenda/:id" element={<ProtectedRoute><EditarVenda /></ProtectedRoute>} />

            {/* Cliente - Produtos */}
            <Route path="/produtosCliente" element={<ProtectedRoute><ListarProdutosCliente /></ProtectedRoute>} />
            <Route path="/detalhesProdutoCliente/:id" element={<ProtectedRoute><DetalhesProdutoCliente /></ProtectedRoute>} />

            {/* Cliente - Carrinho */}
            <Route path="/carrinho" element={<ProtectedRoute><Carrinho /></ProtectedRoute>} />

            {/* Cliente - Checkout */}
            <Route path="/simulaPagamento" element={<ProtectedRoute><SimulaPagamento /></ProtectedRoute>} />

            {/* Cliente - Minhas Compras */}
            <Route path="/minhasCompras" element={<ProtectedRoute><VisualizarComprasCliente /></ProtectedRoute>} />
            <Route path="/detalhesCompra/:id" element={<ProtectedRoute><DetalhesCompraCliente /></ProtectedRoute>} />
          </Routes>
        </BrowserRouter>
      </CarrinhoProvider>
    </AuthProvider>
  );
}

export default App;
