// front/src/pages/Produtos/ProdutosAdministrador/DetalhesProduto/DetalhesProduto.jsx
import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesProduto.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../../context/AuthContext";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import Loading from "../../../../components/Loading/Loading";

function DetalhesProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [produto, setProduto] = useState(null);
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
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar detalhes do produto'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar detalhes do produto:', error);
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

  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando detalhes do produto...</p>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className={styles.container}>
        <NavBarAdm />
        <div className={styles.errorContainer}>
          <p>Produto não encontrado.</p>
          <button 
            className={styles.backButton} 
            onClick={() => navigate("/listarProdutos")}
          >
            Voltar para Lista
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <div className={styles.titleBox}>
          <h2 className={styles.title}>Detalhes do Produto</h2>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.imageWrapper}>
          <img 
            src={produto.linkImagem || '/placeholder-image.png'} 
            alt={produto.nome} 
            className={styles.image}
            onError={(e) => {
              e.target.src = '/placeholder-image.png';
            }}
          />
        </div>
        
        <div className={styles.info}>
          <div className={styles.box}>
            <strong>Nome:</strong> 
            <span className={styles.boxValue}>{produto.nome}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Fabricante:</strong> 
            <span className={styles.boxValue}>{produto.fabricante || 'Não informado'}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Preço:</strong> 
            <span className={styles.boxValue}>{formatarPreco(produto.preco)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Data de Validade:</strong> 
            <span className={styles.boxValue}>{formatarData(produto.dataValidade)}</span>
          </div>
          
          <div className={styles.box}>
            <strong>Status:</strong> 
            <span className={styles.boxValue}>{produto.dataExclusao ? 'Excluído' : 'Ativo'}</span>
          </div>
          
          {produto.descricao && (
            <div className={styles.box}>
              <strong>Descrição:</strong> 
              <span className={styles.boxValue}>{produto.descricao}</span>
            </div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listarProdutos")}>
          Voltar para Lista
        </button>
        
        {!produto.dataExclusao && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/editarProduto/${produto.idProduto}`)}
          >
            Editar Produto
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

export default DetalhesProduto;