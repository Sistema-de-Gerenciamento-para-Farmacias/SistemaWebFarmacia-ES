import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaAdministradores.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

function ListaAdministradores() {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [administradores, setAdministradores] = useState([]);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (token) {
      carregarAdministradores();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  const carregarAdministradores = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/pessoa/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Resposta do backend - Administradores:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Dados recebidos do backend:', data);
        
        // ✅ MUDANÇA: Mostrar TODOS os administradores (ativos e inativos)
        const todosAdministradores = data.filter(pessoa => pessoa.tipoUsuario === 'ADMIN');
        
        console.log('✅ Todos os administradores:', todosAdministradores);
        setAdministradores(todosAdministradores);
        console.log(`✅ ${todosAdministradores.length} administradores carregados (ativos + inativos)`);
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

  const excluirAdministrador = async (id) => {
    try {
      setDeletingId(id);
      
      console.log('🗑️ Tentando excluir administrador ID:', id, 'Tipo:', typeof id);
      
      const idNumerico = Number(id);
      if (isNaN(idNumerico)) {
        setMessage("ERRO: ID do administrador inválido");
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
        setMessage("SUCESSO: Administrador marcado como inativo!");
        
        // ✅ MUDANÇA: Recarregar a lista completa do backend
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

  // Formata CPF para exibição: 12345678901 -> 123.456.789-01
  const formatCpf = (cpf) => {
    if (!cpf) return 'N/A';
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  // ✅ NOVA FUNÇÃO: Verificar se administrador está ativo
  const estaAtivo = (admin) => {
    return !admin.dataExclusao;
  };

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

  const recarregarAdministradores = () => {
    carregarAdministradores();
  };

  const handleEditar = (id) => {
    console.log('🔄 Tentando editar administrador ID:', id, 'Tipo:', typeof id);
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do administrador inválido");
      return;
    }
    navigate(`/editarAdministrador/${idNumerico}`);
  };

  const handleDetalhes = (id) => {
    console.log('👁️ Tentando ver detalhes do administrador ID:', id, 'Tipo:', typeof id);
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do administrador inválido");
      return;
    }
    navigate(`/detalhesAdministrador/${idNumerico}`);
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

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
          onClick={() => navigate("/cadastroAdministrador")}
          title="Criar Administrador"
        >
          Cadastrar Administrador
        </button>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando administradores...</p>
        </div>
      ) : (
        <>
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
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditar(admin.id)}
                      title="Editar"
                      disabled={deletingId === admin.id || !estaAtivo(admin)}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setConfirmId(admin.id)}
                      title={estaAtivo(admin) ? "Marcar como Inativo" : "Já está inativo"}
                      disabled={deletingId === admin.id || !estaAtivo(admin)}
                    >
                      {estaAtivo(admin) ? "Inativar" : "Inativo"}
                    </button>
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

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente marcar este administrador como inativo? Ele não poderá mais fazer login no sistema."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirAdministrador(confirmId)}
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

export default ListaAdministradores;