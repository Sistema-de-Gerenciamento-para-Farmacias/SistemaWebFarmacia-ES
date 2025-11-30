import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaFuncionario.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

function ListaFuncionarios() {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [funcionarios, setFuncionarios] = useState([]);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (token) {
      carregarFuncionarios();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  const carregarFuncionarios = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/pessoa/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Resposta do backend - Funcionários:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Dados recebidos do backend:', data);
        
        // ✅ MUDANÇA: Mostrar TODOS os funcionários (ativos e inativos)
        const todosFuncionarios = data.filter(pessoa => pessoa.tipoUsuario === 'EMPLOY');
        
        console.log('✅ Todos os funcionários:', todosFuncionarios);
        setFuncionarios(todosFuncionarios);
        console.log(`✅ ${todosFuncionarios.length} funcionários carregados (ativos + inativos)`);
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
      console.error('Erro ao carregar funcionários:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const excluirFuncionario = async (id) => {
    try {
      setDeletingId(id);
      
      console.log('🗑️ Tentando excluir funcionário ID:', id, 'Tipo:', typeof id);
      
      const idNumerico = Number(id);
      if (isNaN(idNumerico)) {
        setMessage("ERRO: ID do funcionário inválido");
        return;
      }

      const response = await fetch(`http://localhost:8080/pessoa/delete/${idNumerico}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📤 Resposta da exclusão:', response.status);

      if (response.ok) {
        setMessage("SUCESSO: Funcionário marcado como inativo!");
        
        // ✅ MUDANÇA: Recarregar a lista completa do backend
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
      console.error('Erro ao excluir funcionário:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  // Formata CPF para exibição: 12345678901 -> 123.456.789-01
  const formatCpf = (cpf) => {
    if (!cpf) return 'N/A';
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  // ✅ NOVA FUNÇÃO: Verificar se funcionário está ativo
  const estaAtivo = (funcionario) => {
    return !funcionario.dataExclusao;
  };

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

  const recarregarFuncionarios = () => {
    carregarFuncionarios();
  };

  const handleEditar = (id) => {
    console.log('🔄 Tentando editar funcionário ID:', id, 'Tipo:', typeof id);
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do funcionário inválido");
      return;
    }
    navigate(`/editarFuncionario/${idNumerico}`);
  };

  const handleDetalhes = (id) => {
    console.log('👁️ Tentando ver detalhes do funcionário ID:', id, 'Tipo:', typeof id);
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do funcionário inválido");
      return;
    }
    navigate(`/detalhesFuncionario/${idNumerico}`);
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

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

        <button
          className={styles.createButton}
          onClick={() => navigate("/cadastroFuncionario")}
          title="Criar Funcionário"
        >
          Cadastrar Funcionário
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando funcionários...</p>
        </div>
      ) : (
        <>
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
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditar(funcionario.id)}
                      title="Editar"
                      disabled={deletingId === funcionario.id || !estaAtivo(funcionario)}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setConfirmId(funcionario.id)}
                      title={estaAtivo(funcionario) ? "Marcar como Inativo" : "Já está inativo"}
                      disabled={deletingId === funcionario.id || !estaAtivo(funcionario)}
                    >
                      {estaAtivo(funcionario) ? "Inativar" : "Inativo"}
                    </button>
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

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente marcar este funcionário como inativo? Ele não poderá mais fazer login no sistema."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirFuncionario(confirmId)}
        />
      )}

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