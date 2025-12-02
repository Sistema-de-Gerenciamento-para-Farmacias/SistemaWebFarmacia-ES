// front/src/pages/Produtos/ProdutosAdministrador/DetalhesProduto/DetalhesProduto.jsx

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesProduto.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para exibir detalhes de um produto específico
 * @component
 * @returns {JSX.Element} Página de detalhes do produto
 */
function DetalhesProduto() {
  // Obtém ID do produto da URL
  const { id } = useParams();
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token do contexto de autenticação
  const { token } = useContext(AuthContext);

  // Estado para armazenar dados do produto
  const [produto, setProduto] = useState(null);
  
  // Estado para controlar carregamento de dados
  const [loading, setLoading] = useState(true);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");

  /**
   * Efeito para carregar dados do produto quando componente é montado
   * Executa sempre que token ou ID do produto mudam
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
      
      // Requisição GET para obter detalhes do produto específico
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
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar detalhes do produto'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do produto:', error);
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
   * Renderiza estado de carregamento
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando detalhes do produto...</p>
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
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Produto não encontrado.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listarProdutos")}
          >
            Voltar para Lista
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
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>Detalhes do Produto</h2>
        </div>
      </div>

      {/* Card principal com informações do produto */}
      <div className={styles.card}>
        {/* Seção de imagem do produto */}
        <div className={styles.imageWrapper}>
          <img 
            src={produto.linkImagem || '/placeholder-image.png'} 
            alt={produto.nome} 
            className={styles.image}
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
        </div>
        
        {/* Seção de informações detalhadas */}
        <div className={styles.info}>
          {/* Campo: Nome do Produto */}
          <div className={styles.box}>
            <strong>Nome:</strong> 
            <span className={styles.boxValue}>{produto.nome}</span>
          </div>
          
          {/* Campo: Fabricante */}
          <div className={styles.box}>
            <strong>Fabricante:</strong> 
            <span className={styles.boxValue}>{produto.fabricante || 'Não informado'}</span>
          </div>
          
          {/* Campo: Preço */}
          <div className={styles.box}>
            <strong>Preço:</strong> 
            <span className={styles.boxValue}>{formatarPreco(produto.preco)}</span>
          </div>
          
          {/* Campo: Data de Validade */}
          <div className={styles.box}>
            <strong>Data de Validade:</strong> 
            <span className={styles.boxValue}>{formatarData(produto.dataValidade)}</span>
          </div>
          
          {/* Campo: Status (Ativo/Excluído) */}
          <div className={styles.box}>
            <strong>Status:</strong> 
            <span className={styles.boxValue}>{produto.dataExclusao ? 'Excluído' : 'Ativo'}</span>
          </div>
          
          {/* Campo: Descrição (condicional) */}
          {produto.descricao && (
            <div className={styles.box}>
              <strong>Descrição:</strong> 
              <span className={styles.boxValue}>{produto.descricao}</span>
            </div>
          )}
        </div>
      </div>

      {/* Botões de ação */}
      <div className={styles.actions}>
        {/* Botão para voltar à lista de produtos */}
        <button className={styles.backButton} onClick={() => navigate("/listarProdutos")}>
          Voltar para Lista
        </button>
        
        {/* Botão para editar (apenas se produto estiver ativo) */}
        {!produto.dataExclusao && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/editarProduto/${produto.idProduto}`)}
          >
            Editar Produto
          </button>
        )}
      </div>

      {/* Componente de mensagem para feedback */}
      {message && (
        <MessageBox 
          message={message} 
          onClose={() => setMessage("")}
          type="error"
        />
      )}
    </div>
  );
}

export default DetalhesProduto;