// front/src/pages/Pessoas/Funcionarios/ListaFuncionarios/ListaFuncionarios.jsx

import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaFuncionario.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para listagem e gerenciamento de funcionários
 * @component
 * @returns {JSX.Element} Lista de funcionários com ações de gerenciamento
 */
function ListaFuncionarios() {
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token e função de logout do contexto de autenticação
  const { logout, token } = useContext(AuthContext);

  // Estado para armazenar lista de funcionários
  const [funcionarios, setFuncionarios] = useState([]);
  
  // Estado para termo de busca
  const [busca, setBusca] = useState("");
  
  // Estado para ID do funcionário a ser confirmado para exclusão
  const [confirmId, setConfirmId] = useState(null);
  
  // Estado para mensagens de feedback
  const [message, setMessage] = useState("");
  
  // Estado para controlar carregamento inicial
  const [loading, setLoading] = useState(true);
  
  // Estado para controlar exclusão em andamento
  const [deletingId, setDeletingId] = useState(null);

  /**
   * Efeito para carregar lista de funcionários quando componente é montado
   * Executa sempre que o token de autenticação muda
   */
  useEffect(() => {
    if (token) {
      carregarFuncionarios();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  /**
   * Carrega lista de funcionários do backend
   * @async
   */
  const carregarFuncionarios = async () => {
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
        
        // Filtra apenas funcionários (tipo EMPLOY) - inclui ativos e inativos
        const todosFuncionarios = data.filter(pessoa => pessoa.tipoUsuario === 'EMPLOY');
        setFuncionarios(todosFuncionarios);
      } else if (response.status === 401) {
        setMessage("ERRO: Não autorizado. Token inválido ou expirado.");
        logout();
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para visualizar funcionários");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar funcionários'}`);
      }
    } catch (error) {
      setMessage("ERRO: Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Exclui (inativa) um funcionário
   * @async
   * @param {number|string} id - ID do funcionário a ser excluído
   */
  const excluirFuncionario = async (id) => {
    try {
      setDeletingId(id);
      
      // Converte ID para número para validação
      const idNumerico = Number(id);
      if (isNaN(idNumerico)) {
        setMessage("ERRO: ID do funcionário inválido");
        return;
      }

      // Requisição DELETE para marcar funcionário como inativo
      const response = await fetch(`${API_URL}/pessoa/delete/${idNumerico}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        setMessage("SUCESSO: Funcionário marcado como inativo!");
        
        // Recarrega lista após exclusão (com pequeno delay para melhor UX)
        setTimeout(() => {
          carregarFuncionarios();
        }, 500);
        
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para excluir funcionários");
      } else if (response.status === 404) {
        setMessage("ERRO: Funcionário não encontrado");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao excluir funcionário'}`);
      }
    } catch (error) {
      setMessage("ERRO: Não foi possível conectar ao servidor");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  /**
   * Formata CPF para exibição: 12345678901 -> 123.456.789-01
   * @param {string} cpf - CPF sem formatação
   * @returns {string} CPF formatado ou 'N/A' se inválido
   */
  const formatCpf = (cpf) => {
    if (!cpf) return 'N/A';
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  /**
   * Verifica se um funcionário está ativo
   * @param {Object} funcionario - Objeto do funcionário
   * @returns {boolean} true se funcionário está ativo (sem dataExclusao)
   */
  const estaAtivo = (funcionario) => {
    return !funcionario.dataExclusao;
  };

  /**
   * Filtra funcionários com base no termo de busca
   * Utiliza useMemo para otimizar performance (só recalcula quando dependências mudam)
   */
  const filtrados = useMemo(() => {
    if (!busca.trim()) return funcionarios;
    
    const termo = busca.toLowerCase().trim();
    const termoCpf = busca.replace(/\D/g, "");
    
    return funcionarios.filter(
      (f) =>
        f.nome.toLowerCase().includes(termo) ||
        (f.cpf && f.cpf.replace(/\D/g, "").includes(termoCpf))
    );
  }, [funcionarios, busca]);

  /**
   * Função para recarregar lista de funcionários
   */
  const recarregarFuncionarios = () => {
    carregarFuncionarios();
  };

  /**
   * Navega para página de edição de um funcionário
   * @param {number|string} id - ID do funcionário a ser editado
   */
  const handleEditar = (id) => {
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do funcionário inválido");
      return;
    }
    navigate(`/editarFuncionario/${idNumerico}`);
  };

  /**
   * Navega para página de detalhes de um funcionário
   * @param {number|string} id - ID do funcionário
   */
  const handleDetalhes = (id) => {
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do funcionário inválido");
      return;
    }
    navigate(`/detalhesFuncionario/${idNumerico}`);
  };

  /**
   * Renderiza a página de lista de funcionários
   */
  return (
    <div className={styles.container}>
      {/* Componente de navbar para administradores */}
      <NavBarAdm />

      {/* Cabeçalho da página */}
      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Funcionários</h2>
        <div className={styles.headerActions}>
          <button 
            className={styles.reloadButton}
            onClick={recarregarFuncionarios}
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
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* Botão para cadastrar novo funcionário */}
        <button
          className={styles.createButton}
          onClick={() => navigate("/cadastroFuncionario")}
          title="Criar Funcionário"
        >
          Cadastrar Funcionário
        </button>
      </div>

      {/* Conteúdo principal: carregando ou tabela */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando funcionários...</p>
        </div>
      ) : (
        <>
          {/* Barra de informações sobre os resultados */}
          <div className={styles.infoBar}>
            <span className={styles.totalFuncionarios}>
              Total: {filtrados.length} funcionário{filtrados.length !== 1 ? 's' : ''}
              {busca && ` (filtrados)`}
            </span>
            <span className={styles.statusInfo}>
              • Ativos: {funcionarios.filter(f => estaAtivo(f)).length}
              • Inativos: {funcionarios.filter(f => !estaAtivo(f)).length}
            </span>
          </div>

          {/* Tabela de funcionários */}
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
              {/* Linhas para cada funcionário */}
              {filtrados.map((funcionario) => (
                <tr key={funcionario.id} className={!estaAtivo(funcionario) ? styles.inativo : ''}>
                  <td className={styles.nomeFuncionario}>
                    <strong>{funcionario.nome}</strong>
                  </td>
                  <td className={styles.cpf}>{formatCpf(funcionario.cpf)}</td>
                  <td className={styles.status}>
                    <span className={estaAtivo(funcionario) ? styles.statusAtivo : styles.statusInativo}>
                      {estaAtivo(funcionario) ? '✅ Ativo' : '❌ Inativo'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    {/* Botão Editar (desabilitado para inativos) */}
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditar(funcionario.id)}
                      title="Editar"
                      disabled={deletingId === funcionario.id || !estaAtivo(funcionario)}
                    >
                      Editar
                    </button>
                    {/* Botão Inativar (apenas para ativos) */}
                    <button
                      className={styles.deleteButton}
                      onClick={() => setConfirmId(funcionario.id)}
                      title={estaAtivo(funcionario) ? "Marcar como Inativo" : "Já está inativo"}
                      disabled={deletingId === funcionario.id || !estaAtivo(funcionario)}
                    >
                      {estaAtivo(funcionario) ? "Inativar" : "Inativo"}
                    </button>
                    {/* Botão Detalhes (sempre habilitado) */}
                    <button
                      className={styles.detailsButton}
                      onClick={() => handleDetalhes(funcionario.id)}
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
                    {busca ? 'Nenhum funcionário encontrado para sua busca.' : 'Nenhum funcionário cadastrado.'}
                    {!busca && (
                      <button 
                        className={styles.cadastrarPrimeiroBtn}
                        onClick={() => navigate("/cadastroFuncionario")}
                      >
                        Cadastrar Primeiro Funcionário
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
          message="Deseja realmente marcar este funcionário como inativo? Ele não poderá mais fazer login no sistema."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirFuncionario(confirmId)}
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

export default ListaFuncionarios;