// front/src/pages/Pessoas/Administradores/ListaAdministradores/ListaAdministradores.jsx

import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaAdministradores.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para listagem e gerenciamento de administradores
 * @component
 * @returns {JSX.Element} Lista de administradores com ações de gerenciamento
 */
function ListaAdministradores() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token e função de logout do contexto
  const { logout, token } = useContext(AuthContext);

  // Estado para lista de administradores
  const [administradores, setAdministradores] = useState([]);
  
  // Estado para termo de busca
  const [busca, setBusca] = useState("");
  
  // Estado para ID do administrador a ser confirmado para exclusão
  const [confirmId, setConfirmId] = useState(null);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");
  
  // Estado para controlar carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar exclusão em andamento
  const [deletingId, setDeletingId] = useState(null);

  /**
   * Efeito para carregar lista de administradores quando componente é montado
   * Executa sempre que o token muda
   */
  useEffect(() => {
    if (token) {
      carregarAdministradores();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  /**
   * Carrega lista de administradores do backend
   * @async
   */
  const carregarAdministradores = async () => {
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
        
        // Filtra apenas administradores (ativos e inativos)
        const todosAdministradores = data.filter(pessoa => pessoa.tipoUsuario === 'ADMIN');
        setAdministradores(todosAdministradores);
      } else if (response.status === 401) {
        setMessage("ERRO: Não autorizado. Token inválido ou expirado.");
        logout();
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para visualizar administradores");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar administradores'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exclui (inativa) um administrador
   * @async
   * @param {number|string} id - ID do administrador a ser excluído
   */
  const excluirAdministrador = async (id) => {
    try {
      setDeletingId(id);
      
      // Converte ID para número
      const idNumerico = Number(id);
      if (isNaN(idNumerico)) {
        setMessage("ERRO: ID do administrador inválido");
        return;
      }

      // Requisição DELETE para marcar administrador como inativo
      const response = await fetch(`${API_URL}/pessoa/delete/${idNumerico}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        setMessage("SUCESSO: Administrador marcado como inativo!");
        
        // Recarrega lista após exclusão
        setTimeout(() => {
          carregarAdministradores();
        }, 500);
        
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para excluir administradores");
      } else if (response.status === 404) {
        setMessage("ERRO: Administrador não encontrado");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao excluir administrador'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir administrador:', error);
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
   * Verifica se um administrador está ativo
   * @param {Object} admin - Objeto do administrador
   * @returns {boolean} true se administrador está ativo
   */
  const estaAtivo = (admin) => {
    return !admin.dataExclusao;
  };

  /**
   * Filtra administradores com base no termo de busca
   * Utiliza useMemo para otimizar performance
   */
  const filtrados = useMemo(() => {
    if (!busca.trim()) return administradores;
    
    const termo = busca.toLowerCase().trim();
    const termoCpf = busca.replace(/\D/g, "");
    
    return administradores.filter(
      (a) =>
        a.nome.toLowerCase().includes(termo) ||
        (a.cpf && a.cpf.replace(/\D/g, "").includes(termoCpf))
    );
  }, [administradores, busca]);

  /**
   * Função para recarregar lista de administradores
   */
  const recarregarAdministradores = () => {
    carregarAdministradores();
  };

  /**
   * Navega para página de edição de um administrador
   * @param {number|string} id - ID do administrador a ser editado
   */
  const handleEditar = (id) => {
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do administrador inválido");
      return;
    }
    navigate(`/editarAdministrador/${idNumerico}`);
  };

  /**
   * Navega para página de detalhes de um administrador
   * @param {number|string} id - ID do administrador
   */
  const handleDetalhes = (id) => {
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do administrador inválido");
      return;
    }
    navigate(`/detalhesAdministrador/${idNumerico}`);
  };

  /**
   * Renderiza a página de lista de administradores
   */
  return (
    <div className={styles.container}>
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Administradores</h2>
        <div className={styles.headerActions}>
          <button 
            className={styles.reloadButton}
            onClick={recarregarAdministradores}
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
            placeholder="Buscar por CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.createButton}
          onClick={() => navigate("/cadastroAdministrador")}
          title="Criar Administrador"
        >
          Cadastrar Administrador
        </button>
      </div>

      {/* Conteúdo principal: carregando ou tabela */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando administradores...</p>
        </div>
      ) : (
        <>
          {/* Barra de informações */}
          <div className={styles.infoBar}>
            <span className={styles.totalAdministradores}>
              Total: {filtrados.length} administrador{filtrados.length !== 1 ? 'es' : ''}
              {busca && ` (filtrados)`}
            </span>
            <span className={styles.statusInfo}>
              • Ativos: {administradores.filter(a => estaAtivo(a)).length}
              • Inativos: {administradores.filter(a => !estaAtivo(a)).length}
            </span>
          </div>

          {/* Tabela de administradores */}
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
              {/* Linhas para cada administrador */}
              {filtrados.map((admin) => (
                <tr key={admin.id} className={!estaAtivo(admin) ? styles.inativo : ''}>
                  <td className={styles.nomeAdmin}>
                    <strong>{admin.nome}</strong>
                  </td>
                  <td className={styles.cpf}>{formatCpf(admin.cpf)}</td>
                  <td className={styles.status}>
                    <span className={estaAtivo(admin) ? styles.statusAtivo : styles.statusInativo}>
                      {estaAtivo(admin) ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    {/* Botão Editar */}
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditar(admin.id)}
                      title="Editar"
                      disabled={deletingId === admin.id || !estaAtivo(admin)}
                    >
                      Editar
                    </button>
                    {/* Botão Inativar */}
                    <button
                      className={styles.deleteButton}
                      onClick={() => setConfirmId(admin.id)}
                      title={estaAtivo(admin) ? "Marcar como Inativo" : "Já está inativo"}
                      disabled={deletingId === admin.id || !estaAtivo(admin)}
                    >
                      {estaAtivo(admin) ? "Inativar" : "Inativo"}
                    </button>
                    {/* Botão Detalhes */}
                    <button
                      className={styles.detailsButton}
                      onClick={() => handleDetalhes(admin.id)}
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
                    {busca ? 'Nenhum administrador encontrado para sua busca.' : 'Nenhum administrador cadastrado.'}
                    {!busca && (
                      <button 
                        className={styles.cadastrarPrimeiroBtn}
                        onClick={() => navigate("/cadastroAdministrador")}
                      >
                        Cadastrar Primeiro Administrador
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
          message="Deseja realmente marcar este administrador como inativo? Ele não poderá mais fazer login no sistema."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirAdministrador(confirmId)}
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

export default ListaAdministradores;