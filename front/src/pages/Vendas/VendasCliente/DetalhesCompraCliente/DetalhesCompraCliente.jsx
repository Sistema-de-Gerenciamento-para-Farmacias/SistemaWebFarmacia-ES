import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import BotaoRetorno from "../../../../components/BotaoRetorno/BotaoRetorno";
import Loading from "../../../../components/Loading/Loading";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import styles from "./DetalhesCompraCliente.module.css";

export function DetalhesCompraCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    if (token && id) {
      carregarDetalhesCompra();
    } else {
      setMensagem("❌ Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  const carregarDetalhesCompra = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8080/venda/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const compraData = await response.json();
        setCompra(compraData);
      } else if (response.status === 404) {
        setMensagem("❌ Compra não encontrada.");
      } else {
        const errorData = await response.json();
        setMensagem(`❌ ${errorData.message || 'Falha ao carregar detalhes da compra'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da compra:', error);
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

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco || 0);
  };

  const calcularTotalCompra = () => {
    if (!compra?.itens) return 0;
    return compra.itens.reduce((total, item) => {
      return total + ((item.precoUnitario || 0) * (item.quantidade || 0));
    }, 0);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <BotaoRetorno />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando detalhes da compra...</p>
        </div>
      </div>
    );
  }

  if (!compra) {
    return (
      <div className={styles.container}>
        <BotaoRetorno />
        <div className={styles.errorContainer}>
          <h3>😞 Compra Não Encontrada</h3>
          <p>A compra que você está procurando não existe ou não está disponível.</p>
          <button 
            className={styles.btnVoltar}
            onClick={() => navigate("/minhasCompras")}
          >
            Voltar para Minhas Compras
          </button>
        </div>
      </div>
    );
  }

  const totalCompra = calcularTotalCompra();

  return (
    <div className={styles.container}>
      <BotaoRetorno />

      <h1 className={styles.titulo}>
        🧾 Detalhes da Compra #{compra.idVenda}
        {compra.dataExclusao && <span className={styles.badgeCancelada}>Cancelada</span>}
      </h1>

      <div className={styles.info}>
        <div className={styles.infoItem}>
          <strong>📋 ID da Compra:</strong> #{compra.idVenda}
        </div>
        <div className={styles.infoItem}>
          <strong>📅 Data da Compra:</strong> {formatarData(compra.dataCompra)}
        </div>
        <div className={styles.infoItem}>
          <strong>👤 Cliente:</strong> {compra.usuario?.nome || 'Não informado'}
        </div>
        <div className={styles.infoItem}>
          <strong>📧 Email:</strong> {compra.usuario?.email || 'Não informado'}
        </div>
        <div className={styles.infoItem}>
          <strong>📦 Número de Itens:</strong> {compra.itens?.length || 0}
        </div>
        <div className={styles.infoItem}>
          <strong>🔄 Status:</strong> 
          <span className={compra.dataExclusao ? styles.statusCancelada : styles.statusConcluida}>
            {compra.dataExclusao ? 'Compra Cancelada' : 'Compra Concluída'}
          </span>
        </div>
      </div>

      <h3 className={styles.subtitulo}>🛍️ Itens da Compra</h3>
      
      {compra.itens && compra.itens.length > 0 ? (
        <>
          <table className={styles.tabela}>
            <thead>
              <tr>
                <th>Produto</th>
                <th>Preço Unit.</th>
                <th>Quantidade</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {compra.itens.map((item, index) => (
                <tr key={index} className={compra.dataExclusao ? styles.itemCancelado : ''}>
                  <td className={styles.nomeProduto}>
                    {item.nomeProduto || 'Produto não encontrado'}
                  </td>
                  <td className={styles.precoUnitario}>
                    {formatarPreco(item.precoUnitario)}
                  </td>
                  <td className={styles.quantidade}>{item.quantidade}</td>
                  <td className={styles.subtotal}>
                    {formatarPreco((item.precoUnitario || 0) * (item.quantidade || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.resumoTotal}>
            <div className={styles.totalItem}>
              <span>Subtotal:</span>
              <span>{formatarPreco(totalCompra)}</span>
            </div>
            <div className={styles.totalItem}>
              <span>Frete:</span>
              <span>Grátis</span>
            </div>
            <div className={styles.totalFinal}>
              <span>Total da Compra:</span>
              <span>{formatarPreco(totalCompra)}</span>
            </div>
          </div>
        </>
      ) : (
        <div className={styles.semItens}>
          <p>Nenhum item encontrado nesta compra.</p>
        </div>
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

export default DetalhesCompraCliente;