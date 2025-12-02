// context/CarrinhoContext.jsx 

import { createContext, useState, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

// Criação do contexto para gerenciar o estado global do carrinho
export const CarrinhoContext = createContext();

/**
 * Provider do carrinho que disponibiliza estado e funções para componentes filhos
 * @component
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem envolvidos
 * @returns {JSX.Element} Provider do contexto do carrinho
 */
export function CarrinhoProvider({ children }) {
  // Estado que armazena os itens do carrinho (array de objetos)
  const [carrinho, setCarrinho] = useState([]);
  
  // Estado que controla quando operações assíncronas estão em andamento
  const [loading, setLoading] = useState(false);
  
  // Obtém o token de autenticação do contexto de AuthContext
  const { token } = useContext(AuthContext);

  /**
   * Função para carregar os itens do carrinho do backend
   * @async
   * @returns {Promise<void>} Promessa vazia (após carregamento)
   * @description Carrega os itens do carrinho via API, atualizando o estado local
   */
  const carregarCarrinho = useCallback(async () => {
    // Se não houver token, não tenta carregar (usuário não autenticado)
    if (!token) return;
    
    try {
      // Inicia estado de loading para mostrar indicador visual
      setLoading(true);
      
      // Faz requisição GET para obter todos os itens do carrinho
      const response = await fetch(`${API_URL}/carrinho/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Token JWT no header
          'Content-Type': 'application/json'
        }
      });

      // Se a resposta for OK (status 200-299)
      if (response.ok) {
        const carrinhoData = await response.json();
        // CORREÇÃO: O backend retorna um objeto CarrinhoResponseDTO com propriedade 'itens'
        // Atualiza o estado com os itens do carrinho ou array vazio se não houver
        setCarrinho(carrinhoData.itens || []);
      } else {
        // Log de erro se a requisição falhou
        console.error('Erro ao carregar carrinho:', response.status);
      }
    } catch (error) {
      // Log de erro para falhas de rede ou outras exceções
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      // Sempre desativa o loading, independente de sucesso ou falha
      setLoading(false);
    }
  }, [token]); // Dependência: re-cria função quando token muda

  /**
   * Adiciona um produto ao carrinho
   * @async
   * @param {number|string} idProduto - ID do produto a ser adicionado
   * @param {number} quantidade - Quantidade do produto
   * @returns {Promise<boolean>} true se adicionado com sucesso
   * @throws {Error} Lança erro se usuário não autenticado ou requisição falhar
   * @description Adiciona um produto ao carrinho via API POST
   */
  const adicionarAoCarrinho = async (idProduto, quantidade) => {
    // Verifica se o usuário está autenticado (tem token)
    if (!token) throw new Error('Usuário não autenticado');

    try {
      // Requisição POST para adicionar item ao carrinho
      const response = await fetch(`${API_URL}/carrinho/adicionar`, {
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

      // Se a requisição foi bem sucedida
      if (response.ok) {
        const carrinhoAtualizado = await response.json();
        // Atualiza estado local com os novos itens do carrinho
        setCarrinho(carrinhoAtualizado.itens || []);
        return true;
      } else {
        // Tenta obter mensagem de erro do backend
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao adicionar ao carrinho');
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      throw error; // Re-lança o erro para tratamento pelo componente que chamou
    }
  };

  /**
   * Remove um item específico do carrinho
   * @async
   * @param {number|string} idItemCarrinho - ID do item do carrinho a ser removido
   * @returns {Promise<boolean>} true se removido com sucesso
   * @throws {Error} Lança erro se usuário não autenticado ou requisição falhar
   * @description Remove um item do carrinho via API DELETE
   */
  const removerDoCarrinho = async (idItemCarrinho) => {
    if (!token) throw new Error('Usuário não autenticado');

    try {
      // Requisição DELETE para remover item específico do carrinho
      const response = await fetch(`${API_URL}/carrinho/remover/${idItemCarrinho}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Atualiza localmente enquanto recarrega (otimização de UI)
        setCarrinho(prev => prev.filter(item => item.idItemCarrinho !== idItemCarrinho));
        // Recarrega do backend para garantir sincronização completa
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

  /**
   * Atualiza a quantidade de um item no carrinho
   * @async
   * @param {number|string} idItemCarrinho - ID do item do carrinho
   * @param {number} novaQuantidade - Nova quantidade desejada
   * @returns {Promise<void>} Promessa vazia após atualização
   * @throws {Error} Lança erro se quantidade inválida ou item não encontrado
   * @description Atualiza quantidade usando estratégia de remover e readicionar
   */
  const atualizarQuantidade = async (idItemCarrinho, novaQuantidade) => {
    // Validação básica: quantidade deve ser pelo menos 1
    if (novaQuantidade < 1) {
      throw new Error('Quantidade deve ser pelo menos 1');
    }

    try {
      // Encontra o item no carrinho local usando o ID
      const item = carrinho.find(item => item.idItemCarrinho === idItemCarrinho);
      if (!item) throw new Error('Item não encontrado no carrinho');

      // Estratégia: remove e adiciona com nova quantidade
      // (Poderia ser implementado endpoint específico de atualização)
      await removerDoCarrinho(idItemCarrinho);
      await adicionarAoCarrinho(item.idProduto, novaQuantidade);
      
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      throw error;
    }
  };

  /**
   * Limpa todos os itens do carrinho
   * @async
   * @returns {Promise<boolean>} true se carrinho limpo com sucesso
   * @throws {Error} Lança erro se usuário não autenticado ou requisição falhar
   * @description Remove todos os itens do carrinho via API DELETE
   */
  const limparCarrinho = async () => {
    if (!token) throw new Error('Usuário não autenticado');

    try {
      // Requisição DELETE para limpar todos os itens do carrinho
      const response = await fetch(`${API_URL}/carrinho/limpar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Atualiza estado local para carrinho vazio
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

  /**
   * Valor do contexto disponibilizado para componentes filhos
   * @type {Object}
   * @property {Array} carrinho - Array de itens no carrinho
   * @property {boolean} loading - Estado de carregamento (true/false)
   * @property {Function} carregarCarrinho - Função para carregar carrinho do backend
   * @property {Function} adicionarAoCarrinho - Função para adicionar item ao carrinho
   * @property {Function} removerDoCarrinho - Função para remover item do carrinho
   * @property {Function} atualizarQuantidade - Função para atualizar quantidade de item
   * @property {Function} limparCarrinho - Função para limpar todos os itens do carrinho
   */
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