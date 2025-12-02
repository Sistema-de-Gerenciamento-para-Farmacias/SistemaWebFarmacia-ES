// front/src/pages/Pessoas/Clientes/ListaClientes/ListaClientes.jsx

import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaClientes.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para listagem e gerenciamento de clientes
 * @component
 * @returns {JSX.Element} Lista de clientes com ações de gerenciamento
 */
function ListaClientes() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token e função de logout do contexto
  const { logout, token } = useContext(AuthContext);

  // Estado para lista de clientes
  const [clientes, setClientes] = useState([]);
  
  // Estado para termo de busca
  const [busca, setBusca] = useState("");
  
  // Estado para ID do cliente a ser confirmado para exclusão
  const [confirmId, setConfirmId] = useState(null);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");
  
  // Estado para controlar carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar exclusão em andamento
  const [deletingId, setDeletingId] = useState(null);

  /**
   * Efeito para carregar lista de clientes quando componente é montado
   * Executa sempre que o token muda
   */
  useEffect(() => {
    if (token) {
      carregarClientes();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  /**
   * Carrega lista de clientes do backend
   * @async
   */
  const carregarClientes = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter todas as pessoas
      const response = await fetch(`${API_URL}/pessoa/all`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const data = await response.json();
        
        // Filtra apenas clientes (USER) - ativos e inativos
        const todosClientes = data.filter(pessoa => pessoa.tipoUsuario === 'USER');
        
        setClientes(todosClientes);
      } else if (response.status === 401) {
        setMessage("ERRO: Não autorizado. Token inválido ou expirado.");
        logout();
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para visualizar clientes");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar clientes'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exclui (inativa) um cliente
   * @async
   * @param {number|string} id - ID do cliente a ser excluído
   */
  const excluirCliente = async (id) => {
    try {
      setDeletingId(id);
      
      // Converte ID para número
      const idNumerico = Number(id);
      if (isNaN(idNumerico)) {
        setMessage("ERRO: ID do cliente inválido");
        return;
      }

      // Requisição DELETE para marcar cliente como inativo
      const response = await fetch(`${API_URL}/pessoa/delete/${idNumerico}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        setMessage("SUCESSO: Cliente marcado como inativo!");
        
        // Recarrega lista após exclusão
        setTimeout(() => {
          carregarClientes();
        }, 500);
        
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para excluir clientes");
      } else if (response.status === 404) {
        setMessage("ERRO: Cliente não encontrado");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao excluir cliente'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir cliente:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  /**
   * Formata CPF para exibição: 12345678901 -> 123.456.789-01
   * @param {string} cpf - CPF sem formatação
   * @returns {string} CPF formatado
   */
  const formatCpf = (cpf) => {
    if (!cpf) return 'N/A';
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  /**
   * Verifica se um cliente está ativo
   * @param {Object} cliente - Objeto do cliente
   * @returns {boolean} true se cliente está ativo
   */
  const estaAtivo = (cliente) => {
    return !cliente.dataExclusao;
  };

  /**
   * Filtra clientes com base no termo de busca
   * Utiliza useMemo para otimizar performance
   */
  const filtrados = useMemo(() => {
    if (!busca.trim()) return clientes;
    
    const termo = busca.toLowerCase().trim();
    const termoCpf = busca.replace(/\D/g, "");
    
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        (c.cpf && c.cpf.replace(/\D/g, "").includes(termoCpf))
    );
  }, [clientes, busca]);

  /**
   * Função para recarregar lista de clientes
   */
  const recarregarClientes = () => {
    carregarClientes();
  };

  /**
   * Navega para página de edição de um cliente
   * @param {number|string} id - ID do cliente a ser editado
   */
  const handleEditar = (id) => {
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do cliente inválido");
      return;
    }
    navigate(`/editarCliente/${idNumerico}`);
  };

  /**
   * Navega para página de detalhes de um cliente
   * @param {number|string} id - ID do cliente
   */
  const handleDetalhes = (id) => {
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do cliente inválido");
      return;
    }
    navigate(`/detalhesCliente/${idNumerico}`);
  };

  /**
   * Renderiza a página de lista de clientes
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Clientes</h2>
        <div className={styles.headerActions}>
          <button 
            className={styles.reloadButton}
            onClick={recarregarClientes}
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

      {/* Barra superior com busca */}
      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        {/* Espaço reservado para alinhamento (sem botão de cadastro) */}
        <div></div>
      </div>

      {/* Conteúdo principal: carregando ou tabela */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando clientes...</p>
        </div>
      ) : (
        <>
          {/* Barra de informações */}
          <div className={styles.infoBar}>
            <span className={styles.totalClientes}>
              Total: {filtrados.length} cliente{filtrados.length !== 1 ? 's' : ''}
              {busca && ` (filtrados)`}
            </span>
            <span className={styles.statusInfo}>
              • Ativos: {clientes.filter(c => estaAtivo(c)).length}
              • Inativos: {clientes.filter(c => !estaAtivo(c)).length}
            </span>
          </div>

          {/* Tabela de clientes */}
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Status</th>
                <th className={styles.acoes}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {/* Linhas para cada cliente */}
              {filtrados.map((cliente) => (
                <tr key={cliente.id} className={!estaAtivo(cliente) ? styles.inativo : ''}>
                  <td className={styles.nomeCliente}>
                    <strong>{cliente.nome}</strong>
                  </td>
                  <td className={styles.cpf}>{formatCpf(cliente.cpf)}</td>
                  <td className={styles.status}>
                    <span className={estaAtivo(cliente) ? styles.statusAtivo : styles.statusInativo}>
                      {estaAtivo(cliente) ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    {/* Botão Editar */}
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditar(cliente.id)}
                      title="Editar"
                      disabled={deletingId === cliente.id || !estaAtivo(cliente)}
                    >
                      Editar
                    </button>
                    {/* Botão Inativar */}
                    <button
                      className={styles.deleteButton}
                      onClick={() => setConfirmId(cliente.id)}
                      title={estaAtivo(cliente) ? "Marcar como Inativo" : "Já está inativo"}
                      disabled={deletingId === cliente.id || !estaAtivo(cliente)}
                    >
                      {estaAtivo(cliente) ? "Inativar" : "Inativo"}
                    </button>
                    {/* Botão Detalhes */}
                    <button
                      className={styles.detailsButton}
                      onClick={() => handleDetalhes(cliente.id)}
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
                  <td colSpan={4} className={styles.empty}>
                    {busca ? 'Nenhum cliente encontrado para sua busca.' : 'Nenhum cliente cadastrado.'}
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
          message="Deseja realmente marcar este cliente como inativo? Ele não aparecerá mais nas operações ativas."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirCliente(confirmId)}
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

export default ListaClientes;