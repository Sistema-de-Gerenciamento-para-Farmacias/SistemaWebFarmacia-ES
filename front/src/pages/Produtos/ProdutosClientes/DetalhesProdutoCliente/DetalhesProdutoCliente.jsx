// front/src/pages/Produtos/ProdutosCliente/DetalhesProdutoCliente/DetalhesProdutoCliente.jsx
import { useState, useContext, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import { CarrinhoContext } from "../../../../context/CarrinhoContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import BotaoRetorno from "../../../../components/BotaoRetorno/BotaoRetorno";
import Loading from "../../../../components/Loading/Loading";
import styles from "./DetalhesProdutoCliente.module.css";

function DetalhesProdutoCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const { adicionarAoCarrinho } = useContext(CarrinhoContext);

  const [produto, setProduto] = useState(null);
  const [quantidade, setQuantidade] = useState(1);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token && id) {
      carregarProduto();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
      setLoading(false);
    }
  }, [token, id]);

  const carregarProduto = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`http://localhost:8080/produto/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const produtoData = await response.json();
        setProduto(produtoData);
      } else if (response.status === 404) {
        setMessage("ERRO: Produto não encontrado.");
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar produto'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar produto:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const formatarData = (dataString) => {
    if (!dataString) return 'Não informada';
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const handleAdicionarAoCarrinho = async () => {
    if (quantidade < 1) {
      setMessage("❌ Quantidade inválida");
      return;
    }

    try {
      await adicionarAoCarrinho(produto.idProduto, quantidade);
      setMessage("✅ Produto adicionado ao carrinho!");
      
      setTimeout(() => {
        setMessage("");
        setQuantidade(1);
      }, 2000);
    } catch (error) {
      setMessage(`❌ Erro ao adicionar ao carrinho: ${error.message}`);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <BotaoRetorno />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando produto...</p>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className={styles.container}>
        <BotaoRetorno />
        <div className={styles.errorContainer}>
          <p>Produto não encontrado.</p>
          <button 
            className={styles.btnVoltar} 
            onClick={() => navigate("/produtosCliente")}
          >
            Voltar para Produtos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BotaoRetorno />

      <div className={styles.card}>
        <div className={styles.imageSection}>
          <img 
            src={produto.linkImagem || '/placeholder-image.png'} 
            alt={produto.nome}
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
        </div>

        <div className={styles.detalhes}>
          <h1 className={styles.nome}>{produto.nome}</h1>
          <p className={styles.preco}>{formatarPreco(produto.preco)}</p>

          <div className={styles.info}>
            <div className={styles.infoItem}>
              <strong>Fabricante:</strong> {produto.fabricante || 'Não informado'}
            </div>
            <div className={styles.infoItem}>
              <strong>Data de Validade:</strong> {formatarData(produto.dataValidade)}
            </div>
            {produto.descricao && (
              <div className={styles.infoItem}>
                <strong>Descrição:</strong> {produto.descricao}
              </div>
            )}
          </div>

          {!produto.dataExclusao && (
            <div className={styles.compra}>
              <p className={styles.pergunta}>Deseja comprar?</p>
              <div className={styles.quantidadeInput}>
                <label>Quantidade:</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={quantidade}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setQuantidade("");
                    } else {
                      const num = parseInt(val);
                      if (!isNaN(num)) {
                        setQuantidade(Math.min(Math.max(num, 1), 99));
                      }
                    }
                  }}
                />
              </div>

              <button
                className={styles.btnAdicionar}
                onClick={handleAdicionarAoCarrinho}
              >
                🛒 Adicionar ao Carrinho
              </button>
            </div>
          )}

          {produto.dataExclusao && (
            <div className={styles.indisponivel}>
              <p>Este produto está temporariamente indisponível.</p>
            </div>
          )}

          {message && (
            <MessageBox
              message={message}
              onClose={() => setMessage("")}
              type={message.includes('❌') ? 'error' : 'success'}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default DetalhesProdutoCliente;