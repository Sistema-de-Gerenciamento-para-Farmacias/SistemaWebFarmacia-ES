// front/src/pages/Vendas/VendasAdministrador/ListarVenda/ListarVenda.jsx
import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListarVenda.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

function ListarVenda() {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [vendas, setVendas] = useState([]);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (token) {
      carregarVendas();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  const carregarVendas = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/venda/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Resposta do backend - Vendas:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Dados recebidos do backend:', data);
        
        // Ordenar por data mais recente primeiro
        const vendasOrdenadas = data.sort((a, b) => 
          new Date(b.dataCompra) - new Date(a.dataCompra)
        );
        
        setVendas(vendasOrdenadas);
        console.log(`✅ ${vendasOrdenadas.length} vendas carregadas`);
      } else if (response.status === 401) {
        setMessage("ERRO: Não autorizado. Token inválido ou expirado.");
        logout();
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para visualizar vendas");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar vendas'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar vendas:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  const excluirVenda = async (id) => {
    try {
      setDeletingId(id);
      
      console.log('🗑️ Tentando excluir venda ID:', id, 'Tipo:', typeof id);
      
      const idNumerico = Number(id);
      if (isNaN(idNumerico)) {
        setMessage("ERRO: ID da venda inválido");
        return;
      }

      const response = await fetch(`http://localhost:8080/venda/delete/${idNumerico}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📤 Resposta da exclusão:', response.status);

      if (response.ok) {
        setMessage("SUCESSO: Venda marcada como excluída!");
        
        // Recarregar a lista do backend
        setTimeout(() => {
          carregarVendas();
        }, 500);
        
      } else if (response.status === 403) {
        setMessage("ERRO: Você não tem permissão para excluir vendas");
      } else if (response.status === 404) {
        setMessage("ERRO: Venda não encontrada");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao excluir venda'}`);
      }
    } catch (error) {
      console.error('Erro ao excluir venda:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  // Formata data para exibição: "2024-01-15" -> "15/01/2024"
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

  // Calcula valor total da venda
  const calcularValorTotal = (venda) => {
    if (!venda.itens || !Array.isArray(venda.itens)) return 0;
    return venda.itens.reduce((total, item) => {
      return total + (item.precoUnitario * item.quantidade);
    }, 0);
  };

  // Verifica se venda está ativa
  const estaAtiva = (venda) => {
    return !venda.dataExclusao;
  };

  const filtrados = useMemo(() => {
    if (!busca.trim()) return vendas;
    
    const termo = busca.toLowerCase().trim();
    
    return vendas.filter((venda) => {
      const nomeCliente = venda.usuario?.nome?.toLowerCase() || '';
      const dataFormatada = formatDate(venda.dataCompra).toLowerCase();
      const idVenda = venda.idVenda?.toString() || '';
      
      return (
        nomeCliente.includes(termo) ||
        dataFormatada.includes(termo) ||
        idVenda.includes(termo)
      );
    });
  }, [vendas, busca]);

  const recarregarVendas = () => {
    carregarVendas();
  };

  const handleEditar = (id) => {
    console.log('🔄 Tentando editar venda ID:', id, 'Tipo:', typeof id);
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID da venda inválido");
      return;
    }
    navigate(`/editarVenda/${idNumerico}`);
  };

  const handleDetalhes = (id) => {
    console.log('👁️ Tentando ver detalhes da venda ID:', id, 'Tipo:', typeof id);
    
    const idNumerico = Number(id);
    if (isNaN(idNumerico)) {
      setMessage("ERRO: ID da venda inválido");
      return;
    }
    navigate(`/detalhesVenda/${idNumerico}`);
  };

  const handleNovaVenda = () => {
    navigate("/novaVenda");
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Vendas</h2>
        <div className={styles.headerActions}>
          <button 
            className={styles.reloadButton}
            onClick={recarregarVendas}
            title="Recarregar lista"
            disabled={loading}
          >
            Atualizar
          </button>
          <button 
            className={styles.createButton}
            onClick={handleNovaVenda}
            title="Nova Venda"
          >
            Nova Venda
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
            placeholder="Buscar por cliente, data (dd/mm/aaaa) ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando vendas...</p>
        </div>
      ) : (
        <>
          <div className={styles.infoBar}>
            <span className={styles.totalVendas}>
              Total: {filtrados.length} venda{filtrados.length !== 1 ? 's' : ''}
              {busca && ` (filtradas)`}
            </span>
            <span className={styles.statusInfo}>
              • Ativas: {vendas.filter(v => estaAtiva(v)).length}
              • Excluídas: {vendas.filter(v => !estaAtiva(v)).length}
            </span>
            <span className={styles.valorTotal}>
              • Valor Total: R$ {vendas.reduce((total, v) => total + calcularValorTotal(v), 0).toFixed(2)}
            </span>
          </div>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Valor Total</th>
                <th>Status</th>
                <th className={styles.acoes}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((venda) => (
                <tr key={venda.idVenda} className={!estaAtiva(venda) ? styles.inativo : ''}>
                  <td className={styles.idVenda}>#{venda.idVenda}</td>
                  <td className={styles.nomeCliente}>
                    <strong>{venda.usuario?.nome || 'N/A'}</strong>
                  </td>
                  <td className={styles.data}>{formatDate(venda.dataCompra)}</td>
                  <td className={styles.valor}>
                    R$ {calcularValorTotal(venda).toFixed(2)}
                  </td>
                  <td className={styles.status}>
                    <span className={estaAtiva(venda) ? styles.statusAtivo : styles.statusInativo}>
                      {estaAtiva(venda) ? '✅ Ativa' : '❌ Excluída'}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditar(venda.idVenda)}
                      title="Editar"
                      disabled={deletingId === venda.idVenda || !estaAtiva(venda)}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setConfirmId(venda.idVenda)}
                      title={estaAtiva(venda) ? "Marcar como Excluída" : "Já está excluída"}
                      disabled={deletingId === venda.idVenda || !estaAtiva(venda)}
                    >
                      {estaAtiva(venda) ? "Excluir" : "Excluída"}
                    </button>
                    <button
                      className={styles.detailsButton}
                      onClick={() => handleDetalhes(venda.idVenda)}
                      title="Ver Detalhes"
                    >
                      Detalhes
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    {busca ? 'Nenhuma venda encontrada para sua busca.' : 'Nenhuma venda cadastrada.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente marcar esta venda como excluída? Ela não aparecerá mais nas operações ativas."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirVenda(confirmId)}
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

export default ListarVenda;