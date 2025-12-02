// front/src/pages/Vendas/VendasAdministrador/DetalhesVenda/DetalhesVenda.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesVenda.module.css";

// Componentes importados
import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para exibir detalhes de uma venda específica
 * @component
 * @returns {JSX.Element} Página com detalhes completos da venda
 */
function DetalhesVenda() {
  // Obtém ID da venda da URL
  const { id } = useParams();
  
  // Hook para navegação programática
  const navigate = useNavigate();
  
  // Contexto de autenticação para obter token
  const { token } = useContext(AuthContext);

  // Estados do componente
  const [venda, setVenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  /**
   * Efeito para carregar detalhes da venda quando componente monta
   */
  useEffect(() => {
    if (token && id) {
      carregarVenda();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  /**
   * Carrega detalhes da venda do backend
   * @async
   */
  const carregarVenda = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter detalhes da venda específica
      const response = await fetch(`${API_URL}/venda/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const vendaData = await response.json();
        
        // Adiciona campo id baseado no idVenda para consistência
        setVenda({
          ...vendaData,
          id: vendaData.idVenda
        });
      } else if (response.status === 404) {
        setMessage("ERRO: Venda não encontrada.");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar detalhes da venda'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da venda:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata data para o padrão brasileiro (DD/MM/AAAA)
   * @param {string} dateString - Data em formato ISO ou string
   * @returns {string} Data formatada ou 'N/A' se inválida
   */
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  /**
   * Calcula o valor total da venda somando subtotais dos itens
   * @param {Object} vendaData - Dados da venda
   * @returns {number} Valor total da venda
   */
  const calcularValorTotal = (vendaData) => {
    if (!vendaData.itens || !Array.isArray(vendaData.itens)) return 0;
    return vendaData.itens.reduce((total, item) => {
      return total + (item.precoUnitario * item.quantidade);
    }, 0);
  };

  /**
   * Verifica se a venda está ativa (não foi excluída)
   * @param {Object} vendaData - Dados da venda
   * @returns {boolean} true se ativa, false se excluída
   */
  const estaAtiva = (vendaData) => {
    return !vendaData.dataExclusao;
  };

  // Renderização durante carregamento
  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando detalhes da venda...</p>
        </div>
      </div>
    );
  }

  // Renderização se venda não encontrada
  if (!venda) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Venda não encontrada.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listaVendas")}
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  // Calcula valor total para exibição
  const valorTotal = calcularValorTotal(venda);

  // Renderização principal
  return (
    <div className={styles.container}>
      {/* Barra de navegação administrativa */}
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>Detalhes da Venda</h2>
        </div>
      </div>

      {/* Card com informações da venda */}
      <div className={styles.card}>
        <div className={styles.info}>
          {/* ID da venda */}
          <div className={styles.box}>
            <strong>ID da Venda:</strong> 
            <span className={styles.boxValue}>#{venda.idVenda}</span>
          </div>
          
          {/* Cliente */}
          <div className={styles.box}>
            <strong>Cliente:</strong> 
            <span className={styles.boxValue}>
              {venda.usuario?.nome || 'N/A'} 
              {venda.usuario?.email && ` (${venda.usuario.email})`}
            </span>
          </div>
          
          {/* Data da compra */}
          <div className={styles.box}>
            <strong>Data da Compra:</strong> 
            <span className={styles.boxValue}>{formatDate(venda.dataCompra)}</span>
          </div>
          
          {/* Status */}
          <div className={styles.box}>
            <strong>Status:</strong> 
            <span className={styles.boxValue}>
              {estaAtiva(venda) ? '✅ Ativa' : '❌ Excluída'}
            </span>
          </div>

          {/* Itens da venda em tabela */}
          <div className={styles.box}>
            <strong>Itens da Venda:</strong>
            <div className={styles.itensContainer}>
              <table className={styles.itensTable}>
                <thead>
                  <tr>
                    <th className={styles.th}>Produto</th>
                    <th className={styles.th}>Preço Unit.</th>
                    <th className={styles.th}>Quantidade</th>
                    <th className={styles.th}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Lista de itens da venda */}
                  {venda.itens && venda.itens.length > 0 ? (
                    venda.itens.map((item, index) => (
                      <tr key={index} className={styles.tr}>
                        <td className={styles.td}>
                          {item.nomeProduto || `Produto #${item.idProduto}`}
                        </td>
                        <td className={`${styles.td} ${styles.number}`}>
                          R$ {item.precoUnitario?.toFixed(2) || '0.00'}
                        </td>
                        <td className={`${styles.td} ${styles.number}`}>
                          {item.quantidade || 0}
                        </td>
                        <td className={`${styles.td} ${styles.number} ${styles.subtotal}`}>
                          R$ {((item.precoUnitario || 0) * (item.quantidade || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={`${styles.td} ${styles.empty}`}>
                        Nenhum item encontrado
                      </td>
                    </tr>
                  )}
                  
                  {/* Linha de total */}
                  <tr className={styles.totalRow}>
                    <td colSpan={3} className={`${styles.td} ${styles.totalLabel}`}>
                      <strong>Total da Venda:</strong>
                    </td>
                    <td className={`${styles.td} ${styles.number} ${styles.totalValue}`}>
                      <strong>R$ {valorTotal.toFixed(2)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listaVendas")}>
          Voltar para Lista
        </button>
        
        {/* Botão de edição apenas para vendas ativas */}
        {estaAtiva(venda) && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/editarVenda/${venda.idVenda}`)}
          >
            Editar Venda
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

export default DetalhesVenda;