// Carrinho.jsx

import { useState, useMemo, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CarrinhoContext } from "../../context/CarrinhoContext";
import { AuthContext } from "../../context/AuthContext";
import NavBarCliente from "../../components/NavBarCliente/NavBarCliente";
import MessageBox from "../../components/MessageBox/MessageBox";
import Loading from "../../components/Loading/Loading";
import styles from "./Carrinho.module.css";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente da página do carrinho de compras
 * @component
 * @returns {JSX.Element} Página do carrinho com funcionalidades completas
 */
export function Carrinho() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token de autenticação do contexto
  const { token } = useContext(AuthContext);
  
  // Obtém funções e estado do contexto do carrinho
  const { 
    carrinho, 
    removerDoCarrinho, 
    atualizarQuantidade,
    carregarCarrinho,
    limparCarrinho,
    loading 
  } = useContext(CarrinhoContext);
  
  // Estado para itens selecionados no carrinho
  const [selecionados, setSelecionados] = useState([]);
  
  // Estado para mensagens de feedback
  const [mensagem, setMensagem] = useState("");
  
  // Estado para controlar quais itens estão sendo atualizados
  const [atualizando, setAtualizando] = useState({});

  // CORREÇÃO: Garantir que carrinho seja sempre um array
  // Evita erros se o backend retornar algo diferente
  const carrinhoArray = Array.isArray(carrinho) ? carrinho : [];

  /**
   * Efeito para carregar o carrinho quando o componente é montado
   * Executa sempre que o token ou a função carregarCarrinho muda
   */
  useEffect(() => {
    if (token) {
      carregarCarrinho();
    }
  }, [token, carregarCarrinho]);

  /**
   * Calcula o valor total dos itens selecionados
   * Utiliza useMemo para otimização, recalculando apenas quando necessário
   */
  const total = useMemo(() => {
    return selecionados.reduce((acc, idItemCarrinho) => {
      const item = carrinhoArray.find((it) => it.idItemCarrinho === idItemCarrinho);
      if (item) {
        acc += item.precoUnitario * item.quantidade;
      }
      return acc;
    }, 0);
  }, [selecionados, carrinhoArray]);

  /**
   * Alterna a seleção de um item no carrinho
   * @param {number|string} idItemCarrinho - ID do item do carrinho
   */
  const toggleSelecao = (idItemCarrinho) => {
    setSelecionados((prev) =>
      prev.includes(idItemCarrinho) 
        ? prev.filter((id) => id !== idItemCarrinho) 
        : [...prev, idItemCarrinho]
    );
  };

  /**
   * Remove um item específico do carrinho
   * @async
   * @param {number|string} idItemCarrinho - ID do item a ser removido
   */
  const handleRemover = async (idItemCarrinho) => {
    try {
      await removerDoCarrinho(idItemCarrinho);
      setSelecionados((prev) => prev.filter((id) => id !== idItemCarrinho));
      setMensagem("Item removido do carrinho!");
      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      setMensagem(`Erro ao remover item: ${error.message}`);
    }
  };

  /**
   * Atualiza a quantidade de um item no carrinho
   * @async
   * @param {number|string} idItemCarrinho - ID do item do carrinho
   * @param {number} novaQuantidade - Nova quantidade desejada
   */
  const handleAtualizarQuantidade = async (idItemCarrinho, novaQuantidade) => {
    // Validação: quantidade mínima é 1
    if (novaQuantidade < 1) {
      setMensagem("Quantidade deve ser pelo menos 1");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    // CORREÇÃO: Marcar item como atualizando para evitar flickering
    setAtualizando(prev => ({ ...prev, [idItemCarrinho]: true }));

    try {
      await atualizarQuantidade(idItemCarrinho, novaQuantidade);
      // CORREÇÃO: Não mostrar mensagem para atualizações normais
    } catch (error) {
      setMensagem(`Erro ao atualizar quantidade: ${error.message}`);
      setTimeout(() => setMensagem(""), 3000);
    } finally {
      // CORREÇÃO: Remover marcação de atualização
      setAtualizando(prev => ({ ...prev, [idItemCarrinho]: false }));
    }
  };

  /**
   * Processa a compra dos itens selecionados
   * Redireciona para a página de pagamento com os dados necessários
   */
  const handleComprar = () => {
    // Verifica se há itens selecionados
    if (selecionados.length === 0) {
      setMensagem("Selecione pelo menos um item para comprar");
      setTimeout(() => setMensagem(""), 3000);
      return;
    }

    // Prepara dados para a venda
    const itensVenda = selecionados.map(idItemCarrinho => {
      const item = carrinhoArray.find(it => it.idItemCarrinho === idItemCarrinho);
      return {
        idProduto: item.idProduto,
        quantidade: item.quantidade
      };
    });

    // Navega para página de pagamento com os dados
    navigate("/simulaPagamento", { 
      state: { 
        itensVenda,
        total,
        carrinhoItens: carrinhoArray.filter(item => selecionados.includes(item.idItemCarrinho))
      } 
    });
  };

  /**
   * Limpa todo o carrinho de compras
   * @async
   */
  const handleLimparCarrinho = async () => {
    try {
      await limparCarrinho();
      setSelecionados([]);
      setMensagem("Carrinho limpo com sucesso!");
      setTimeout(() => setMensagem(""), 3000);
    } catch (error) {
      setMensagem(`Erro ao limpar carrinho: ${error.message}`);
    }
  };

  /**
   * Renderiza estado de carregamento
   * Mostra componente Loading enquanto dados são carregados
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando carrinho...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado de carrinho vazio
   * Mostra mensagem amigável e botão para continuar comprando
   */
  if (carrinhoArray.length === 0) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.vazio}>
          <h2>🛒 Seu carrinho está vazio</h2>
          <p>Que tal explorar nossos produtos?</p>
          <button 
            className={styles.btnContinuar}
            onClick={() => navigate("/produtosCliente")}
          >
            Continuar Comprando
          </button>
        </div>
      </div>
    );
  }

  /**
   * Renderiza o carrinho com itens
   * Interface principal com tabela de itens e resumo do pedido
   */
  return (
    <div className={styles.container}>
      <NavBarCliente />

      <h1 className={styles.titulo}>🛒 Meu Carrinho</h1>

      <div className={styles.content}>
        {/* Seção de itens do carrinho em formato de tabela */}
        <div className={styles.listaItens}>
          <table className={styles.tabela}>
            <thead>
              <tr>
                {/* Checkbox para selecionar todos os itens */}
                <th style={{ width: "50px" }}>
                  <input
                    type="checkbox"
                    checked={selecionados.length === carrinhoArray.length && carrinhoArray.length > 0}
                    onChange={() => {
                      if (selecionados.length === carrinhoArray.length) {
                        setSelecionados([]);
                      } else {
                        setSelecionados(carrinhoArray.map(item => item.idItemCarrinho));
                      }
                    }}
                  />
                </th>
                <th>Produto</th>
                <th style={{ width: "120px" }}>Preço Unit.</th>
                <th style={{ width: "120px" }}>Quantidade</th>
                <th style={{ width: "120px" }}>Subtotal</th>
                <th style={{ width: "80px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Mapeia cada item do carrinho para uma linha na tabela */}
              {carrinhoArray.map((item) => (
                <tr 
                  key={item.idItemCarrinho}
                  className={atualizando[item.idItemCarrinho] ? styles.atualizando : ''}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selecionados.includes(item.idItemCarrinho)}
                      onChange={() => toggleSelecao(item.idItemCarrinho)}
                    />
                  </td>
                  <td>
                    <div className={styles.infoProduto}>
                      <div>
                        <div className={styles.nomeProduto}>{item.nomeProduto}</div>
                        <div className={styles.fabricante}>{item.fabricante}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.preco}>
                    R$ {item.precoUnitario?.toFixed(2) || '0.00'}
                  </td>
                  <td>
                    <div className={styles.quantidadeContainer}>
                      <button
                        className={styles.btnQuantidade}
                        onClick={() => handleAtualizarQuantidade(item.idItemCarrinho, item.quantidade - 1)}
                        disabled={item.quantidade <= 1 || atualizando[item.idItemCarrinho]}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={item.quantidade}
                        onChange={(e) => {
                          const newQty = Math.max(1, parseInt(e.target.value) || 1);
                          handleAtualizarQuantidade(item.idItemCarrinho, newQty);
                        }}
                        className={styles.inputQuantidade}
                        disabled={atualizando[item.idItemCarrinho]}
                      />
                      <button
                        className={styles.btnQuantidade}
                        onClick={() => handleAtualizarQuantidade(item.idItemCarrinho, item.quantidade + 1)}
                        disabled={atualizando[item.idItemCarrinho]}
                      >
                        +
                      </button>
                    </div>
                    {/* Indicador visual de atualização em andamento */}
                    {atualizando[item.idItemCarrinho] && (
                      <div className={styles.atualizandoIndicator}>⟳</div>
                    )}
                  </td>
                  <td className={styles.subtotal}>
                    R$ {((item.precoUnitario || 0) * item.quantidade).toFixed(2)}
                  </td>
                  <td>
                    <button
                      className={styles.btnRemover}
                      onClick={() => handleRemover(item.idItemCarrinho)}
                      title="Remover item"
                      disabled={atualizando[item.idItemCarrinho]}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Botões de ação para o carrinho */}
          <div className={styles.acoesCarrinho}>
            <button 
              className={styles.btnLimpar}
              onClick={handleLimparCarrinho}
            >
              🧹 Limpar Carrinho
            </button>
          </div>
        </div>

        {/* Seção de resumo do pedido */}
        <div className={styles.resumo}>
          <h3>📋 Resumo do Pedido</h3>
          
          <div className={styles.resumoInfo}>
            <div className={styles.resumoItem}>
              <span>Itens selecionados:</span>
              <span>{selecionados.length}</span>
            </div>
            <div className={styles.resumoItem}>
              <span>Subtotal:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
            <div className={styles.resumoItem}>
              <span>Frete:</span>
              <span>Grátis</span>
            </div>
            <div className={styles.resumoDivider}></div>
            <div className={styles.resumoTotal}>
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* Botões de navegação e ação */}
          <div className={styles.botoes}>
            <button
              className={styles.btnContinuar}
              onClick={() => navigate("/produtosCliente")}
            >
              ← Continuar Comprando
            </button>
            <button
              className={styles.btnComprar}
              onClick={handleComprar}
              disabled={selecionados.length === 0}
            >
              🛍️ Finalizar Compra
            </button>
          </div>

          {/* Seção de benefícios para o cliente */}
          <div className={styles.beneficios}>
            <h4>🎁 Benefícios</h4>
            <ul>
              <li>✅ Entrega grátis para compras acima de R$ 50</li>
              <li>✅ Pagamento seguro</li>
              <li>✅ Devolução em 30 dias</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Componente de mensagem para feedback ao usuário */}
      {mensagem && (
        <MessageBox 
          message={mensagem} 
          onClose={() => setMensagem("")}
          type={mensagem.includes('❌') ? 'error' : 'success'}
        />
      )}
    </div>
  );
}

export default Carrinho;