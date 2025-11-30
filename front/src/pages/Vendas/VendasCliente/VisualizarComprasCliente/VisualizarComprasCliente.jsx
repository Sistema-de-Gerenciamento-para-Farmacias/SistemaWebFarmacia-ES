import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import NavBarCliente from "../../../../components/NavBarCliente/NavBarCliente";
import Loading from "../../../../components/Loading/Loading";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import styles from "./VisualizarComprasCliente.module.css";

export function VisualizarComprasCliente() {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");
  const [busca, setBusca] = useState("");

  useEffect(() => {
    if (token) {
      carregarCompras();
    } else {
      setMensagem("❌ Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token]);

  const carregarCompras = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:8080/venda/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const todasVendas = await response.json();
        
        // Filtrar apenas as vendas do usuário logado
        // O backend pode não ter filtro por usuário, então filtramos no frontend
        const minhasCompras = todasVendas.filter(venda => 
          venda.usuario && venda.usuario.email === user?.email
        );
        
        setCompras(minhasCompras);
      } else {
        const errorData = await response.json();
        setMensagem(`❌ ${errorData.message || 'Falha ao carregar compras'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
      setMensagem("❌ Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Data não informada';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const calcularTotalItens = (venda) => {
    if (!venda.itens) return 0;
    return venda.itens.reduce((total, item) => total + (item.quantidade || 0), 0);
  };

  const comprasFiltradas = compras.filter(venda => {
    if (!busca.trim()) return true;
    
    const termo = busca.toLowerCase();
    return (
      venda.idVenda?.toString().includes(termo) ||
      formatarData(venda.dataCompra).toLowerCase().includes(termo)
    );
  });

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

  return (
    <div className={styles.container}>
      <NavBarCliente />

      <h1 className={styles.titulo}>🧾 Minhas Compras</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔎 Buscar por ID da compra ou data..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

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
          <div className={styles.infoCompra}>
            <span>{comprasFiltradas.length} compra(s) encontrada(s)</span>
          </div>

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