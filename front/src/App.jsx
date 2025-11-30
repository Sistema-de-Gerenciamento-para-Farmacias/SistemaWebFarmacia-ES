import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CarrinhoProvider } from './context/CarrinhoContext';
import Inicial from './pages/Inicial/Inicial';
import Login from './pages/Login/Login';
import HomeCliente from './pages/HomeCliente/HomeCliente';
import HomeAdm from './pages/HomeAdm/HomeAdm';
import CadastroClientes from './pages/Pessoas/Clientes/CadastroClientes/CadastroClientes';
import ListarProdutos from './pages/Produtos/ProdutosAdministrador/ListarProdutos/ListarProdutos';
import CadastrarProdutos from './pages/Produtos/ProdutosAdministrador/CadastrarProdutos/CadastrarProdutos';
import EditarProdutos from './pages/Produtos/ProdutosAdministrador/EditarProdutos/EditarProdutos';
import DetalhesProduto from './pages/Produtos/ProdutosAdministrador/DetalhesProduto/DetalhesProduto';
import ListarProdutosCliente from './pages/Produtos/ProdutosClientes/ListarProdutosCliente/ListarProdutosCliente';
import DetalhesProdutoCliente from './pages/Produtos/ProdutosClientes/DetalhesProdutoCliente/DetalhesProdutoCliente';
import Carrinho from './pages/Carrinho/Carrinho';
import SimulaPagamento from './pages/SimulaPagamento/SimulaPagamento';
import VisualizarComprasCliente from './pages/Vendas/VendasCliente/VisualizarComprasCliente/VisualizarComprasCliente';
import DetalhesCompraCliente from './pages/Vendas/VendasCliente/DetalhesCompraCliente/DetalhesCompraCliente';

// Importando as novas páginas de listagem de pessoas
import ListaClientes from './pages/Pessoas/Clientes/ListaClientes/ListaClientes';
import ListaFuncionarios from './pages/Pessoas/Funcionarios/ListaFuncionario/ListaFuncionario';
import ListaAdministradores from './pages/Pessoas/Administradores/ListaAdministradores/ListaAdministradores';

// Importando as páginas de edição e detalhes
import EditarCliente from './pages/Pessoas/Clientes/EditarCliente/EditarCliente';
import DetalhesCliente from './pages/Pessoas/Clientes/DetalhesCliente/DetalhesCliente';

// 🆕 Importando as novas páginas de cadastro
import CadastroFuncionario from './pages/Pessoas/Funcionarios/CadastroFuncionario/CadastroFuncionario';
import CadastroAdministrador from './pages/Pessoas/Administradores/CadastroAdministrador/CadastroAdministrador';

// 🆕 Importando as novas páginas de detalhes
import DetalhesFuncionario from './pages/Pessoas/Funcionarios/DetalhesFuncionario/DetalhesFuncionario';
import DetalhesAdministrador from './pages/Pessoas/Administradores/DetalhesAdministrador/DetalhesAdministrador';

// 🆕 Importando as novas páginas de edição
import EditarFuncionario from './pages/Pessoas/Funcionarios/EditarFuncionario/EditarFuncionario';
import EditarAdministrador from './pages/Pessoas/Administradores/EditarAdministrador/EditarAdministrador';

// 🆕 Importando as páginas de Vendas para Administrador
import ListarVenda from './pages/Vendas/VendasAdministrador/ListarVenda/ListarVenda';
import EditarVenda from './pages/Vendas/VendasAdministrador/EditarVenda/EditarVenda';
import DetalhesVenda from './pages/Vendas/VendasAdministrador/DetalhesVenda/DetalhesVenda';

import './App.css';
import ProtectedRoute from './context/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/" element={<Inicial />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro-cliente" element={<CadastroClientes />} />
              
              {/* Rotas protegidas - Clientes */}
              <Route 
                path="/homeCliente" 
                element={
                  <ProtectedRoute requiredRole="USER">
                    <HomeCliente />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/produtosCliente" 
                element={
                  <ProtectedRoute requiredRole="USER">
                    <ListarProdutosCliente />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/detalhesProdutoCliente/:id" 
                element={
                  <ProtectedRoute requiredRole="USER">
                    <DetalhesProdutoCliente />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/carrinho" 
                element={
                  <ProtectedRoute requiredRole="USER">
                    <Carrinho />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/simulaPagamento" 
                element={
                  <ProtectedRoute requiredRole="USER">
                    <SimulaPagamento />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/minhasCompras" 
                element={
                  <ProtectedRoute requiredRole="USER">
                    <VisualizarComprasCliente />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/detalhesCompra/:id" 
                element={
                  <ProtectedRoute requiredRole="USER">
                    <DetalhesCompraCliente />
                  </ProtectedRoute>
                } 
              />
              
              {/* Rotas protegidas - Admin/Funcionários */}
              <Route 
                path="/homeAdmin" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <HomeAdm />
                  </ProtectedRoute>
                } 
              />

              {/* Rotas de Produtos - Apenas ADMIN/EMPLOY */}
              <Route 
                path="/listarProdutos" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <ListarProdutos />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/cadastrarProduto" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <CadastrarProdutos />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/editarProduto/:id" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <EditarProdutos />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/detalhesProduto/:id" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <DetalhesProduto />
                  </ProtectedRoute>
                } 
              />

              {/* 🆕 NOVAS ROTAS - LISTAGEM DE PESSOAS */}
              
              {/* Lista de Clientes - Apenas ADMIN/EMPLY */}
              <Route 
                path="/listaClientes" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <ListaClientes />
                  </ProtectedRoute>
                } 
              />

              {/* Lista de Funcionários - Apenas ADMIN */}
              <Route 
                path="/listaFuncionarios" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <ListaFuncionarios />
                  </ProtectedRoute>
                } 
              />

              {/* Lista de Administradores - Apenas ADMIN */}
              <Route 
                path="/listaAdministradores" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <ListaAdministradores />
                  </ProtectedRoute>
                } 
              />

              {/* 🆕 NOVAS ROTAS - EDIÇÃO E DETALHES DE PESSOAS */}

              {/* Clientes - Apenas ADMIN/EMPLOY */}
              <Route 
                path="/editarCliente/:id" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <EditarCliente />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/detalhesCliente/:id" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <DetalhesCliente />
                  </ProtectedRoute>
                } 
              />

              {/* Funcionários - Apenas ADMIN */}
              <Route 
                path="/editarFuncionario/:id" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <EditarFuncionario />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/detalhesFuncionario/:id" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <DetalhesFuncionario />
                  </ProtectedRoute>
                } 
              />

              {/* Administradores - Apenas ADMIN */}
              <Route 
                path="/editarAdministrador/:id" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <EditarAdministrador />
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/detalhesAdministrador/:id" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <DetalhesAdministrador />
                  </ProtectedRoute>
                } 
              />

              {/* 🆕 NOVAS ROTAS - CADASTRO DE PESSOAS */}

              {/* Cadastro de Funcionários - Apenas ADMIN */}
              <Route 
                path="/cadastroFuncionario" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <CadastroFuncionario />
                  </ProtectedRoute>
                } 
              />

              {/* Cadastro de Administradores - Apenas ADMIN */}
              <Route 
                path="/cadastroAdministrador" 
                element={
                  <ProtectedRoute requiredRole="ADMIN">
                    <CadastroAdministrador />
                  </ProtectedRoute>
                } 
              />

              {/* 🆕 NOVAS ROTAS - VENDAS PARA ADMINISTRADOR */}

              {/* Lista de Vendas - Apenas ADMIN/EMPLOY */}
              <Route 
                path="/listaVendas" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <ListarVenda />
                  </ProtectedRoute>
                } 
              />

              {/* Editar Venda - Apenas ADMIN/EMPLOY */}
              <Route 
                path="/editarVenda/:id" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <EditarVenda />
                  </ProtectedRoute>
                } 
              />

              {/* Detalhes da Venda - Apenas ADMIN/EMPLOY */}
              <Route 
                path="/detalhesVenda/:id" 
                element={
                  <ProtectedRoute requiredRole={['ADMIN', 'EMPLOY']}>
                    <DetalhesVenda />
                  </ProtectedRoute>
                } 
              />

            </Routes>
          </div>
        </Router>
      </CarrinhoProvider>
    </AuthProvider>
  );
}

export default App;