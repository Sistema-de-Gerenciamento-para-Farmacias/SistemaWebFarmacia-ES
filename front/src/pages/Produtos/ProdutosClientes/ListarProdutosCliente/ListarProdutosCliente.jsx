// front/src/pages/Produtos/ProdutosCliente/ListarProdutosCliente/ListarProdutosCliente.jsx

import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import NavBarCliente from "../../../../components/NavBarCliente/NavBarCliente";
import Loading from "../../../../components/Loading/Loading";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import styles from "./ListarProdutosCliente.module.css";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para listagem de produtos disponíveis para clientes
 * @component
 * @returns {JSX.Element} Grid de produtos com busca e navegação para detalhes
 */
function ListarProdutosCliente() {
  // Estado para lista de produtos
  const [produtos, setProdutos] = useState([]);
  
  // Estado para termo de busca
  const [busca, setBusca] = useState("");
  
  // Estado para controlar carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");
  
  // Obtém token do contexto de autenticação
  const { token } = useContext(AuthContext);
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();

  /**
   * Efeito para carregar produtos quando componente é montado
   * Executa sempre que o token de autenticação muda
   */
  useEffect(() => {
    if (token) {
      carregarProdutos();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token]);

  /**
   * Carrega lista de produtos do backend
   * @async
   */
  const carregarProdutos = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter todos os produtos
      const response = await fetch(`${API_URL}/produto/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const data = await response.json();
        
        // Filtra apenas produtos ativos (sem data de exclusão)
        const produtosAtivos = data.filter(produto => !produto.dataExclusao);
        setProdutos(produtosAtivos);
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar produtos'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filtra produtos com base no termo de busca
   * Utiliza useMemo para otimizar performance
   */
  const produtosFiltrados = useMemo(() => {
    if (!busca.trim()) return produtos;
    
    const termo = busca.toLowerCase().trim();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.fabricante && p.fabricante.toLowerCase().includes(termo))
    );
  }, [produtos, busca]);

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
   * Renderiza estado de carregamento
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando produtos...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza a página de listagem de produtos
   */
  return (
    <div className={styles.container}>
      {/* Componente de navbar para clientes */}
      <NavBarCliente />

      {/* Título principal da página */}
      <h1 className={styles.title}>Produtos</h1>

      {/* Barra de busca */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔎 Buscar produtos por nome ou fabricante..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Mensagem para lista vazia */}
      {produtosFiltrados.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>{busca ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto disponível no momento.'}</p>
        </div>
      )}

      {/* Grid de produtos */}
      <div className={styles.grid}>
        {produtosFiltrados.map((produto) => (
          <div
            key={produto.idProduto}
            className={styles.card}
            onClick={() => navigate(`/detalhesProdutoCliente/${produto.idProduto}`)}
          >
            {/* Imagem do produto */}
            <div className={styles.imageWrapper}>
              <img 
                src={produto.linkImagem || '/placeholder-image.png'} 
                alt={produto.nome}
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            </div>
            
            {/* Informações do produto */}
            <div className={styles.info}>
              <h3>{produto.nome}</h3>
              <p className={styles.fabricante}>{produto.fabricante || 'Fabricante não informado'}</p>
              <p className={styles.preco}>{formatarPreco(produto.preco)}</p>
            </div>
          </div>
        ))}
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

export default ListarProdutosCliente;