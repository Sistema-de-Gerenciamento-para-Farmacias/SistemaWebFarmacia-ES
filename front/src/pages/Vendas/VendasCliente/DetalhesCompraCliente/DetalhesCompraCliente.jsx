// front/src/pages/Cliente/DetalhesCompraCliente/DetalhesCompraCliente.jsx

import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import BotaoRetorno from "../../../../components/BotaoRetorno/BotaoRetorno";
import Loading from "../../../../components/Loading/Loading";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import styles from "./DetalhesCompraCliente.module.css";

// URL do backend obtida da variável de ambiente (arquivo .env)
const API_URL = import.meta.env.VITE_URL_BACKEND || "http://localhost:8080";

/**
 * Componente para exibir detalhes de uma compra específica do cliente
 * @component
 * @returns {JSX.Element} Página de detalhes da compra
 */
export function DetalhesCompraCliente() {
  // Obtém ID da compra da URL
  const { id } = useParams();
  
  // Hook para navegação entre páginas
  const navigate = useNavigate();
  
  // Obtém token do contexto de autenticação
  const { token } = useContext(AuthContext);
  
  // Estado para armazenar dados da compra
  const [compra, setCompra] = useState(null);
  
  // Estado para controlar carregamento de dados
  const [loading, setLoading] = useState(true);
  
  // Estado para mensagens de feedback
  const [mensagem, setMensagem] = useState("");

  /**
   * Efeito para carregar detalhes da compra quando componente é montado
   * Executa sempre que token ou ID da compra mudam
   */
  useEffect(() => {
    if (token && id) {
      carregarDetalhesCompra();
    } else {
      setMensagem("Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  /**
   * Carrega detalhes da compra do backend
   * @async
   */
  const carregarDetalhesCompra = async () => {
    try {
      setLoading(true);
      
      // Requisição GET para obter detalhes da compra específica
      const response = await fetch(`${API_URL}/venda/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Processa resposta do backend
      if (response.ok) {
        const compraData = await response.json();
        setCompra(compraData);
      } else if (response.status === 404) {
        setMensagem("Compra não encontrada.");
      } else {
        const errorData = await response.json();
        setMensagem(`${errorData.message || 'Falha ao carregar detalhes da compra'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes da compra:', error);
      setMensagem("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formata data para exibição no formato brasileiro
   * @param {string} dataString - Data em formato string
   * @returns {string} Data formatada ou mensagem padrão
   */
  const formatarData = (dataString) => {
    if (!dataString) return 'Data não informada';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  /**
   * Formata preço para o padrão brasileiro (R$)
   * @param {number} preco - Preço a ser formatado
   * @returns {string} Preço formatado (ex: "R$ 29,99")
   */
  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco || 0);
  };

  /**
   * Calcula o valor total da compra somando todos os itens
   * @returns {number} Valor total da compra
   */
  const calcularTotalCompra = () => {
    if (!compra?.itens) return 0;
    return compra.itens.reduce((total, item) => {
      return total + ((item.precoUnitario || 0) * (item.quantidade || 0));
    }, 0);
  };

  /**
   * Renderiza estado de carregamento
   */
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

  /**
   * Renderiza estado de compra não encontrada
   */
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

  // Calcula total da compra para exibição
  const totalCompra = calcularTotalCompra();

  /**
   * Renderiza página de detalhes da compra
   */
  return (
    <div className={styles.container}>
      {/* Botão para voltar à página anterior */}
      <BotaoRetorno />

      {/* Cabeçalho com informações principais */}
      <h1 className={styles.titulo}>
        🧾 Detalhes da Compra #{compra.idVenda}
        {compra.dataExclusao && <span className={styles.badgeCancelada}>Cancelada</span>}
      </h1>

      {/* Seção de informações gerais da compra */}
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

      {/* Seção de itens da compra */}
      <h3 className={styles.subtitulo}>🛍️ Itens da Compra</h3>
      
      {compra.itens && compra.itens.length > 0 ? (
        <>
          {/* Tabela de itens da compra */}
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

          {/* Resumo financeiro da compra */}
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

      {/* Componente de mensagem para feedback */}
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