// front/src/pages/Pessoas/Clientes/ListaClientes/ListaClientes.jsx
import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaClientes.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

function ListaClientes() {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (token) {
      carregarClientes();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  const carregarClientes = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/pessoa/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Resposta do backend - Clientes:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Dados recebidos do backend:', data);
        
        // ✅ MUDANÇA: Mostrar TODOS os clientes (ativos e inativos)
        const todosClientes = data.filter(pessoa => pessoa.tipoUsuario === 'USER');
        
        console.log('✅ Todos os clientes:', todosClientes);
        setClientes(todosClientes);
        console.log(`✅ ${todosClientes.length} clientes carregados (ativos + inativos)`);
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

  const excluirCliente = async (id) => {
    try {
      setDeletingId(id);
      
      console.log('🗑️ Tentando excluir cliente ID:', id, 'Tipo:', typeof id);
      
      const idNumerico = Number(id);
      if (isNaN(idNumerico)) {
        setMessage("ERRO: ID do cliente inválido");
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
        setMessage("SUCESSO: Cliente marcado como inativo!");
        
        // ✅ MUDANÇA: Recarregar a lista completa do backend
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

  // Formata CPF para exibição: 12345678901 -> 123.456.789-01
  const formatCpf = (cpf) => {
    if (!cpf) return 'N/A';
    const d = cpf.replace(/\D/g, "");
    if (d.length !== 11) return cpf;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  };

  // ✅ NOVA FUNÇÃO: Verificar se cliente está ativo
  const estaAtivo = (cliente) => {
    return !cliente.dataExclusao;
  };

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

  const recarregarClientes = () => {
    carregarClientes();
  };

  const handleEditar = (id) => {
    console.log('🔄 Tentando editar cliente ID:', id, 'Tipo:', typeof id);
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do cliente inválido");
      return;
    }
    navigate(`/editarCliente/${idNumerico}`);
  };

  const handleDetalhes = (id) => {
    console.log('👁️ Tentando ver detalhes do cliente ID:', id, 'Tipo:', typeof id);
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID do cliente inválido");
      return;
    }
    navigate(`/detalhesCliente/${idNumerico}`);
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

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
        
        <div></div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando clientes...</p>
        </div>
      ) : (
        <>
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
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditar(cliente.id)}
                      title="Editar"
                      disabled={deletingId === cliente.id || !estaAtivo(cliente)}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setConfirmId(cliente.id)}
                      title={estaAtivo(cliente) ? "Marcar como Inativo" : "Já está inativo"}
                      disabled={deletingId === cliente.id || !estaAtivo(cliente)}
                    >
                      {estaAtivo(cliente) ? "Inativar" : "Inativo"}
                    </button>
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

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente marcar este cliente como inativo? Ele não aparecerá mais nas operações ativas."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirCliente(confirmId)}
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

export default ListaClientes;