// front/src/pages/Vendas/VendasAdministrador/DetalhesVenda/DetalhesVenda.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesVenda.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function DetalhesVenda() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [venda, setVenda] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && id) {
      carregarVenda();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  const carregarVenda = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8080/venda/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Resposta do backend - Detalhes Venda:', response.status);

      if (response.ok) {
        const vendaData = await response.json();
        console.log('🔍 Dados da venda recebidos:', vendaData);
        
        // Adicionar campo id baseado no idVenda para consistência
        setVenda({
          ...vendaData,
          id: vendaData.idVenda
        });
      } else if (response.status === 404) {
        setMessage("ERRO: Venda não encontrada.");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar detalhes da venda'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da venda:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

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

  const calcularValorTotal = (vendaData) => {
    if (!vendaData.itens || !Array.isArray(vendaData.itens)) return 0;
    return vendaData.itens.reduce((total, item) => {
      return total + (item.precoUnitario * item.quantidade);
    }, 0);
  };

  const estaAtiva = (vendaData) => {
    return !vendaData.dataExclusao;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando detalhes da venda...</p>
        </div>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Venda não encontrada.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listaVendas")}
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  const valorTotal = calcularValorTotal(venda);

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>Detalhes da Venda</h2>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <div className={styles.box}>
            <strong>ID da Venda:</strong> 
            <span className={styles.boxValue}>#{venda.idVenda}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Cliente:</strong> 
            <span className={styles.boxValue}>
              {venda.usuario?.nome || 'N/A'} 
              {venda.usuario?.email && ` (${venda.usuario.email})`}
            </span>
          </div>
          
          <div className={styles.box}>
            <strong>Data da Compra:</strong> 
            <span className={styles.boxValue}>{formatDate(venda.dataCompra)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Status:</strong> 
            <span className={styles.boxValue}>
              {estaAtiva(venda) ? '✅ Ativa' : '❌ Excluída'}
            </span>
          </div>

          <div className={styles.box}>
            <strong>Itens da Venda:</strong>
            <div className={styles.itensContainer}>
              <table className={styles.itensTable}>
                <thead>
                  <tr>
                    <th className={styles.th}>Produto</th>
                    <th className={styles.th}>Preço Unit.</th>
                    <th className={styles.th}>Quantidade</th>
                    <th className={styles.th}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {venda.itens && venda.itens.length > 0 ? (
                    venda.itens.map((item, index) => (
                      <tr key={index} className={styles.tr}>
                        <td className={styles.td}>
                          {item.nomeProduto || `Produto #${item.idProduto}`}
                        </td>
                        <td className={`${styles.td} ${styles.number}`}>
                          R$ {item.precoUnitario?.toFixed(2) || '0.00'}
                        </td>
                        <td className={`${styles.td} ${styles.number}`}>
                          {item.quantidade || 0}
                        </td>
                        <td className={`${styles.td} ${styles.number} ${styles.subtotal}`}>
                          R$ {((item.precoUnitario || 0) * (item.quantidade || 0)).toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className={`${styles.td} ${styles.empty}`}>
                        Nenhum item encontrado
                      </td>
                    </tr>
                  )}
                  <tr className={styles.totalRow}>
                    <td colSpan={3} className={`${styles.td} ${styles.totalLabel}`}>
                      <strong>Total da Venda:</strong>
                    </td>
                    <td className={`${styles.td} ${styles.number} ${styles.totalValue}`}>
                      <strong>R$ {valorTotal.toFixed(2)}</strong>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listaVendas")}>
          Voltar para Lista
        </button>
        
        {estaAtiva(venda) && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/editarVenda/${venda.idVenda}`)}
          >
            Editar Venda
          </button>
        )}
      </div>

      {message && (
        <MessageBox 
          message={message} 
          onClose={() => setMessage("")}
          type="error"
        />
      )}
    </div>
  );
}

export default DetalhesVenda;