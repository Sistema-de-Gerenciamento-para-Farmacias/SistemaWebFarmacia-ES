// front/src/pages/Produtos/ProdutosAdministrador/ListarProdutos/ListarProdutos.jsx
import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListarProdutos.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";
import { AuthContext } from "../../../../context/AuthContext";

function ListarProdutos() {
  const navigate = useNavigate();
  const { logout, token } = useContext(AuthContext);

  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  console.log('🔐 Token no ListarProdutos:', token);

  useEffect(() => {
    if (token) {
      carregarProdutos();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado. Faça login novamente.");
      setLoading(false);
    }
  }, [token]);

  const carregarProdutos = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/produto/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Resposta do backend:', response.status);

      if (response.ok) {
        const data = await response.json();
        const produtosAtivos = data.filter(produto => !produto.dataExclusao);
        setProdutos(produtosAtivos);
        console.log(`✅ ${produtosAtivos.length} produtos carregados`);
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

  const excluirProduto = async (id) => {
    try {
      setDeletingId(id);
      const response = await fetch(`http://localhost:8080/produto/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMessage("SUCESSO: Produto excluído com sucesso!");
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

  const filtrados = useMemo(() => {
    if (!busca.trim()) return produtos;
    
    const termo = busca.toLowerCase().trim();
    return produtos.filter(
      (p) =>
        p.nome.toLowerCase().includes(termo) ||
        (p.fabricante && p.fabricante.toLowerCase().includes(termo))
    );
  }, [produtos, busca]);

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const recarregarProdutos = () => {
    carregarProdutos();
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

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

      {loading ? (
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando produtos...</p>
        </div>
      ) : (
        <>
          <div className={styles.infoBar}>
            <span className={styles.totalProdutos}>
              Total: {filtrados.length} produto{filtrados.length !== 1 ? 's' : ''}
              {busca && ` (filtrados)`}
            </span>
          </div>

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
              {filtrados.map((produto) => (
                <tr key={produto.idProduto}>
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
                  <td>{produto.fabricante || 'N/A'}</td>
                  <td className={styles.preco}>{formatarPreco(produto.preco)}</td>
                  <td className={styles.dataValidade}>
                    {formatarData(produto.dataValidade)}
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      className={styles.editButton}
                      onClick={() => navigate(`/editarProduto/${produto.idProduto}`)}
                      title="Editar"
                      disabled={deletingId === produto.idProduto}
                    >
                      Editar
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => setConfirmId(produto.idProduto)}
                      title="Excluir"
                      disabled={deletingId === produto.idProduto}
                    >
                      Excluir
                    </button>
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

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente excluir este produto? Esta ação não pode ser desfeita."
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirProduto(confirmId)}
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

export default ListarProdutos;