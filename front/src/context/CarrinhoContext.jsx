// context/CarrinhoContext.jsx 
import { createContext, useState, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [carrinho, setCarrinho] = useState([]);
  const [loading, setLoading] = useState(false);
  const { token } = useContext(AuthContext);

  // Carrega carrinho do backend
  const carregarCarrinho = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/carrinho/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const carrinhoData = await response.json();
        // CORREÇÃO: O backend retorna um objeto CarrinhoResponseDTO com propriedade 'itens'
        setCarrinho(carrinhoData.itens || []);
      } else {
        console.error('Erro ao carregar carrinho:', response.status);
      }
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Adiciona item ao carrinho - CORRIGIDO
  const adicionarAoCarrinho = async (idProduto, quantidade) => {
    if (!token) throw new Error('Usuário não autenticado');

    try {
      const response = await fetch('http://localhost:8080/carrinho/adicionar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idProduto,
          quantidade
        })
      });

      if (response.ok) {
        const carrinhoAtualizado = await response.json();
        setCarrinho(carrinhoAtualizado.itens || []);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  };

  // Remove item do carrinho
  const removerDoCarrinho = async (idItemCarrinho) => {
    if (!token) throw new Error('Usuário não autenticado');

    try {
      const response = await fetch(`http://localhost:8080/carrinho/remover/${idItemCarrinho}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Atualiza localmente enquanto recarrega
        setCarrinho(prev => prev.filter(item => item.idItemCarrinho !== idItemCarrinho));
        // Recarrega para garantir sincronização
        await carregarCarrinho();
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover item');
      }
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      throw error;
    }
  };

  // Atualiza quantidade
  const atualizarQuantidade = async (idItemCarrinho, novaQuantidade) => {
    if (novaQuantidade < 1) {
      throw new Error('Quantidade deve ser pelo menos 1');
    }

    try {
      // Estratégia: remove e adiciona com nova quantidade
      const item = carrinho.find(item => item.idItemCarrinho === idItemCarrinho);
      if (!item) throw new Error('Item não encontrado no carrinho');

      await removerDoCarrinho(idItemCarrinho);
      await adicionarAoCarrinho(item.idProduto, novaQuantidade);
      
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  };

  // NOVO: Limpar carrinho
  const limparCarrinho = async () => {
    if (!token) throw new Error('Usuário não autenticado');

    try {
      const response = await fetch('http://localhost:8080/carrinho/limpar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCarrinho([]);
        return true;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao limpar carrinho');
      }
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
      throw error;
    }
  };

  return (
    <CarrinhoContext.Provider value={{
      carrinho,
      loading,
      carregarCarrinho,
      adicionarAoCarrinho,
      removerDoCarrinho,
      atualizarQuantidade,
      limparCarrinho
    }}>
      {children}
    </CarrinhoContext.Provider>
  );
}