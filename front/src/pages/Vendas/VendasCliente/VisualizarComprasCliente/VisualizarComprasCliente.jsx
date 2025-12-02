// front/src/pages/Cliente/VisualizarComprasCliente/VisualizarComprasCliente.jsx

import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import NavBarCliente from "../../../../components/NavBarCliente/NavBarCliente";
import Loading from "../../../../components/Loading/Loading";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import styles from "./VisualizarComprasCliente.module.css";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para visualização do histórico de compras do cliente
 * @component
 * @returns {JSX.Element} Lista de compras do cliente logado
 */
export function VisualizarComprasCliente() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token e dados do usuário do contexto de autenticação
  const { token, user } = useContext(AuthContext);
  
  // Estado para armazenar lista de compras
  const [compras, setCompras] = useState([]);
  
  // Estado para controlar carregamento de dados
  const [loading, setLoading] = useState(true);
  
  // Estado para mensagens de feedback
  const [mensagem, setMensagem] = useState("");
  
  // Estado para termo de busca
  const [busca, setBusca] = useState("");

  /**
   * Efeito para carregar compras quando componente é montado
   * Executa sempre que o token de autenticação muda
   */
  useEffect(() => {
    if (token) {
      carregarCompras();
    } else {
      setMensagem("Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token]);

  /**
   * Carrega compras do backend
   * @async
   */
  const carregarCompras = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter todas as vendas
      const response = await fetch(`${API_URL}/venda/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const todasVendas = await response.json();
        
        // Filtra apenas as vendas do usuário logado
        // Como o backend pode não ter filtro por usuário, filtramos no frontend
        const minhasCompras = todasVendas.filter(venda => 
          venda.usuario && venda.usuario.email === user?.email
        );
        
        setCompras(minhasCompras);
      } else {
        const errorData = await response.json();
        setMensagem(`${errorData.message || 'Falha ao carregar compras'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
      setMensagem("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata data para exibição no formato brasileiro
   * @param {string} dataString - Data em formato string
   * @returns {string} Data formatada ou mensagem padrão
   */
  const formatarData = (dataString) => {
    if (!dataString) return 'Data não informada';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  /**
   * Calcula quantidade total de itens em uma venda
   * @param {Object} venda - Objeto da venda
   * @returns {number} Quantidade total de itens
   */
  const calcularTotalItens = (venda) => {
    if (!venda.itens) return 0;
    return venda.itens.reduce((total, item) => total + (item.quantidade || 0), 0);
  };

  /**
   * Filtra compras com base no termo de busca
   */
  const comprasFiltradas = compras.filter(venda => {
    if (!busca.trim()) return true;
    
    const termo = busca.toLowerCase();
    return (
      venda.idVenda?.toString().includes(termo) ||
      formatarData(venda.dataCompra).toLowerCase().includes(termo)
    );
  });

  /**
   * Renderiza estado de carregamento
   */
  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando suas compras...</p>
        </div>
      </div>
    );
  }

  /**
   * Renderiza a página de compras do cliente
   */
  return (
    <div className={styles.container}>
      {/* Componente de navbar para clientes */}
      <NavBarCliente />

      {/* Título principal da página */}
      <h1 className={styles.titulo}>🧾 Minhas Compras</h1>

      {/* Barra de busca */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔎 Buscar por ID da compra ou data..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Conteúdo principal: lista vazia ou tabela de compras */}
      {comprasFiltradas.length === 0 ? (
        <div className={styles.vazio}>
          {busca ? (
            <>
              <h3>🔍 Nenhuma compra encontrada</h3>
              <p>Nenhuma compra corresponde à sua busca.</p>
            </>
          ) : (
            <>
              <h3>🛒 Nenhuma compra realizada</h3>
              <p>Que tal explorar nossos produtos?</p>
              <button 
                className={styles.btnComprar}
                onClick={() => navigate("/produtosCliente")}
              >
                Fazer Minha Primeira Compra
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Informação sobre quantidade de resultados */}
          <div className={styles.infoCompra}>
            <span>{comprasFiltradas.length} compra(s) encontrada(s)</span>
          </div>

          {/* Tabela de compras */}
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Qtd. Itens</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {comprasFiltradas.map((venda) => (
                <tr key={venda.idVenda}>
                  <td className={styles.idVenda}>#{venda.idVenda}</td>
                  <td className={styles.data}>{formatarData(venda.dataCompra)}</td>
                  <td className={styles.quantidade}>
                    {calcularTotalItens(venda)} item(ns)
                  </td>
                  <td className={styles.status}>
                    <span className={venda.dataExclusao ? styles.excluida : styles.ativa}>
                      {venda.dataExclusao ? 'Cancelada' : 'Concluída'}
                    </span>
                  </td>
                  <td>
                    {/* Botão para ver detalhes (desabilitado para compras canceladas) */}
                    <button
                      className={styles.btnDetalhes}
                      onClick={() => navigate(`/detalhesCompra/${venda.idVenda}`)}
                      disabled={venda.dataExclusao}
                    >
                      {venda.dataExclusao ? 'Indisponível' : 'Ver Detalhes'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Componente de mensagem para feedback */}
      {mensagem && (
        <MessageBox 
          message={mensagem} 
          onClose={() => setMensagem("")}
          type="error"
        />
      )}
    </div>
  );
}

export default VisualizarComprasCliente;