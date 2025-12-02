// front/src/pages/Produtos/ProdutosAdministrador/ListarProdutos/ListarProdutos.jsx

import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListarProdutos.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para listagem e gerenciamento de produtos
 * @component
 * @returns {JSX.Element} Lista de produtos com ações de gerenciamento
 */
function ListarProdutos() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token e função de logout do contexto
  const { logout, token, user } = useContext(AuthContext);

  // Verifica se o usuário é administrador
  const isAdmin = user?.tipoUsuario === 'ADMIN';

  // Estado para lista de produtos
  const [produtos, setProdutos] = useState([]);
  
  // Estado para termo de busca
  const [busca, setBusca] = useState("");
  
  // Estado para ID do produto a ser confirmado para exclusão
  const [confirmId, setConfirmId] = useState(null);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");
  
  // Estado para controlar carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar exclusão em andamento
  const [deletingId, setDeletingId] = useState(null);

  /**
   * Efeito para carregar lista de produtos quando componente é montado
   * Executa sempre que o token muda
   */
  useEffect(() => {
    if (token) {
      carregarProdutos();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
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
        // Filtra apenas produtos ativos (sem dataExclusao)
        const produtosAtivos = data.filter(produto => !produto.dataExclusao);
        setProdutos(produtosAtivos);
      } else if (response.status === 401) {
        setMessage("ERRO: Não autorizado. Token inválido ou expirado.");
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para visualizar produtos");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar produtos'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exclui um produto do sistema
   * @async
   * @param {number|string} id - ID do produto a ser excluído
   */
  const excluirProduto = async (id) => {
    try {
      setDeletingId(id);
      
      // Requisição DELETE para excluir produto
      const response = await fetch(`${API_URL}/produto/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        setMessage("SUCESSO: Produto excluído com sucesso!");
        // Remove produto da lista local
        setProdutos(prev => prev.filter(p => p.idProduto !== id));
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao excluir produto'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  /**
   * Filtra produtos com base no termo de busca
   * Utiliza useMemo para otimizar performance
   */
  const filtrados = useMemo(() => {
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
   * Formata data para exibição no formato brasileiro
   * @param {string} dataString - Data em formato string
   * @returns {string} Data formatada ou 'N/A'
   */
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  /**
   * Função para recarregar lista de produtos
   */
  const recarregarProdutos = () => {
    carregarProdutos();
  };

  /**
   * Renderiza a página de lista de produtos
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Produtos</h2>
        <div className={styles.headerActions}>
          <button 
            className={styles.reloadButton}
            onClick={recarregarProdutos}
            title="Recarregar lista"
            disabled={loading}
          >
            Atualizar
          </button>
          <button className={styles.logoutTop} onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* Barra superior com busca e botão de cadastro */}
      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Buscar por nome ou fabricante..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.createButton}
          onClick={() => navigate("/cadastrarProduto")}
          title="Cadastrar Produto"
        >
          Cadastrar Produto
        </button>
      </div>

      {/* Conteúdo principal: carregando ou tabela */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando produtos...</p>
        </div>
      ) : (
        <>
          {/* Barra de informações sobre os resultados */}
          <div className={styles.infoBar}>
            <span className={styles.totalProdutos}>
              Total: {filtrados.length} produto{filtrados.length !== 1 ? 's' : ''}
              {busca && ` (filtrados)`}
            </span>
          </div>

          {/* Tabela de produtos */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Imagem</th>
                <th>Nome</th>
                <th>Fabricante</th>
                <th>Preço</th>
                <th>Validade</th>
                <th className={styles.acoes}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Linhas para cada produto */}
              {filtrados.map((produto) => (
                <tr key={produto.idProduto}>
                  {/* Coluna: Imagem do Produto */}
                  <td>
                    <img
                      src={produto.linkImagem || '/placeholder-image.png'}
                      alt={produto.nome}
                      className={styles.produtoImg}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </td>
                  
                  {/* Coluna: Nome do Produto com tooltip para descrição */}
                  <td className={styles.nomeProduto}>
                    <div className={styles.nomeWrapper}>
                      <strong>{produto.nome}</strong>
                      {produto.descricao && (
                        <span className={styles.descricaoTooltip} title={produto.descricao}>
                          Info
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Coluna: Fabricante */}
                  <td>{produto.fabricante || 'N/A'}</td>
                  
                  {/* Coluna: Preço formatado */}
                  <td className={styles.preco}>{formatarPreco(produto.preco)}</td>
                  
                  {/* Coluna: Data de Validade formatada */}
                  <td className={styles.dataValidade}>
                    {formatarData(produto.dataValidade)}
                  </td>
                  
                  {/* Coluna: Ações (Editar, Excluir, Detalhes) */}
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.editButton}
                      onClick={() => navigate(`/editarProduto/${produto.idProduto}`)}
                      title="Editar"
                      disabled={deletingId === produto.idProduto}
                    >
                      Editar
                    </button>
                    {/* BOTÃO EXCLUIR - APENAS PARA ADMINISTRADORES */}
                    {isAdmin && (
                      <button
                        className={styles.deleteButton}
                        onClick={() => setConfirmId(produto.idProduto)}
                        title="Excluir"
                        disabled={deletingId === produto.idProduto}
                      >
                        Excluir
                      </button>
                    )}
                    <button
                      className={styles.detailsButton}
                      onClick={() => navigate(`/detalhesProduto/${produto.idProduto}`)}
                      title="Ver Detalhes"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Mensagem para lista vazia */}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    {busca ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto cadastrado.'}
                    {!busca && (
                      <button 
                        className={styles.cadastrarPrimeiroBtn}
                        onClick={() => navigate("/cadastrarProduto")}
                      >
                        Cadastrar Primeiro Produto
                      </button>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* Modal de confirmação para exclusão */}
      {confirmId && (
        <ConfirmModal
          message="Deseja realmente excluir este produto? Esta ação não pode ser desfeita."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirProduto(confirmId)}
        />
      )}

      {/* Componente de mensagem para feedback */}
      {message && (
        <MessageBox 
          message={message} 
          onClose={() => setMessage("")} 
          type={message.includes('SUCESSO') ? 'success' : 'error'}
        />
      )}
    </div>
  );
}

export default ListarProdutos;