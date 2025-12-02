// front/src/pages/Produtos/ProdutosCliente/DetalhesProdutoCliente/DetalhesProdutoCliente.jsx

import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import { CarrinhoContext } from "../../../../context/CarrinhoContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import BotaoRetorno from "../../../../components/BotaoRetorno/BotaoRetorno";
import Loading from "../../../../components/Loading/Loading";
import styles from "./DetalhesProdutoCliente.module.css";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para visualização detalhada de um produto (cliente)
 * @component
 * @returns {JSX.Element} Página de detalhes do produto com opção de adicionar ao carrinho
 */
function DetalhesProdutoCliente() {
  // Obtém ID do produto da URL
  const { id } = useParams();
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token do contexto de autenticação
  const { token } = useContext(AuthContext);
  
  // Obtém função para adicionar ao carrinho do contexto do carrinho
  const { adicionarAoCarrinho } = useContext(CarrinhoContext);

  // Estado para dados do produto
  const [produto, setProduto] = useState(null);
  
  // Estado para quantidade selecionada
  const [quantidade, setQuantidade] = useState(1);
  
  // Estado para controlar carregamento de dados
  const [loading, setLoading] = useState(true);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");

  /**
   * Efeito para carregar dados do produto quando componente é montado
   * Executa sempre que token ou ID mudam
   */
  useEffect(() => {
    if (token && id) {
      carregarProduto();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  /**
   * Carrega dados do produto do backend
   * @async
   */
  const carregarProduto = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter detalhes do produto
      const response = await fetch(`${API_URL}/produto/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const produtoData = await response.json();
        setProduto(produtoData);
      } else if (response.status === 404) {
        setMessage("ERRO: Produto não encontrado.");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar produto'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata preço para o padrão brasileiro (R$)
   * @param {number} preco - Preço a ser formatado
   * @returns {string} Preço formatado (ex: "R$ 29,99")
   */
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  /**
   * Formata data para exibição no formato brasileiro
   * @param {string} dataString - Data em formato string
   * @returns {string} Data formatada ou mensagem padrão
   */
  const formatarData = (dataString) => {
    if (!dataString) return 'Não informada';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  /**
   * Adiciona produto ao carrinho
   * @async
   */
  const handleAdicionarAoCarrinho = async () => {
    // Valida quantidade selecionada
    if (quantidade < 1) {
      setMessage("Quantidade inválida");
      return;
    }

    try {
      // Chama função do contexto para adicionar ao carrinho
      await adicionarAoCarrinho(produto.idProduto, quantidade);
      setMessage("Produto adicionado ao carrinho!");
      
      // Limpa mensagem após 2 segundos e reseta quantidade
      setTimeout(() => {
        setMessage("");
        setQuantidade(1);
      }, 2000);
    } catch (error) {
      setMessage(`Erro ao adicionar ao carrinho: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  /**
   * Renderiza estado de carregamento
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <BotaoRetorno />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza estado de produto não encontrado
   */
  if (!produto) {
    return (
      <div className={styles.container}>
        <BotaoRetorno />
        <div className={styles.errorContainer}>
          <p>Produto não encontrado.</p>
          <button 
            className={styles.btnVoltar} 
            onClick={() => navigate("/produtosCliente")}
          >
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }

  /**
   * Renderiza página de detalhes do produto
   */
  return (
    <div className={styles.container}>
      {/* Botão para voltar à página anterior */}
      <BotaoRetorno />

      {/* Card principal com informações do produto */}
      <div className={styles.card}>
        {/* Seção da imagem do produto */}
        <div className={styles.imageSection}>
          <img 
            src={produto.linkImagem || '/placeholder-image.png'} 
            alt={produto.nome}
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
        </div>

        {/* Seção de detalhes do produto */}
        <div className={styles.detalhes}>
          {/* Nome e preço do produto */}
          <h1 className={styles.nome}>{produto.nome}</h1>
          <p className={styles.preco}>{formatarPreco(produto.preco)}</p>

          {/* Informações adicionais */}
          <div className={styles.info}>
            <div className={styles.infoItem}>
              <strong>Fabricante:</strong> {produto.fabricante || 'Não informado'}
            </div>
            <div className={styles.infoItem}>
              <strong>Data de Validade:</strong> {formatarData(produto.dataValidade)}
            </div>
            {produto.descricao && (
              <div className={styles.infoItem}>
                <strong>Descrição:</strong> {produto.descricao}
              </div>
            )}
          </div>

          {/* Seção de compra (apenas para produtos ativos) */}
          {!produto.dataExclusao && (
            <div className={styles.compra}>
              <p className={styles.pergunta}>Deseja comprar?</p>
              
              {/* Controle de quantidade */}
              <div className={styles.quantidadeInput}>
                <label>Quantidade:</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={quantidade}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setQuantidade("");
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num)) {
                        // Limita entre 1 e 99
                        setQuantidade(Math.min(Math.max(num, 1), 99));
                      }
                    }
                  }}
                />
              </div>

              {/* Botão para adicionar ao carrinho */}
              <button
                className={styles.btnAdicionar}
                onClick={handleAdicionarAoCarrinho}
              >
                🛒 Adicionar ao Carrinho
              </button>
            </div>
          )}

          {/* Mensagem para produtos indisponíveis */}
          {produto.dataExclusao && (
            <div className={styles.indisponivel}>
              <p>Este produto está temporariamente indisponível.</p>
            </div>
          )}

          {/* Componente de mensagem para feedback */}
          {message && (
            <MessageBox
              message={message}
              onClose={() => setMessage("")}
              type={message.includes('❌') ? 'error' : 'success'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalhesProdutoCliente;