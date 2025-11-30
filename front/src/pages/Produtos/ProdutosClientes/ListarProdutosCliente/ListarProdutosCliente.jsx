// front/src/pages/Produtos/ProdutosCliente/ListarProdutosCliente/ListarProdutosCliente.jsx
import { useState, useContext, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import NavBarCliente from "../../../../components/NavBarCliente/NavBarCliente";
import Loading from "../../../../components/Loading/Loading";
import MessageBox from "../../../../components/MessageBox/MessageBox";
import styles from "./ListarProdutosCliente.module.css";

function ListarProdutosCliente() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      carregarProdutos();
    } else {
      setMessage("ERRO: Token de autenticação não encontrado.");
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

      if (response.ok) {
        const data = await response.json();
        const produtosAtivos = data.filter(produto => !produto.dataExclusao);
        setProdutos(produtosAtivos);
      } else {
        const errorData = await response.json();
        setMessage(`ERRO: ${errorData.message || 'Falha ao carregar produtos'}`);
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setMessage("ERRO: Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const produtosFiltrados = useMemo(() => {
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

  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando produtos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NavBarCliente />

      <h1 className={styles.title}>Produtos</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔎 Buscar produtos por nome ou fabricante..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {produtosFiltrados.length === 0 && !loading && (
        <div className={styles.emptyState}>
          <p>{busca ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto disponível no momento.'}</p>
        </div>
      )}

      <div className={styles.grid}>
        {produtosFiltrados.map((produto) => (
          <div
            key={produto.idProduto}
            className={styles.card}
            onClick={() => navigate(`/detalhesProdutoCliente/${produto.idProduto}`)}
          >
            <div className={styles.imageWrapper}>
              <img 
                src={produto.linkImagem || '/placeholder-image.png'} 
                alt={produto.nome}
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            </div>
            <div className={styles.info}>
              <h3>{produto.nome}</h3>
              <p className={styles.fabricante}>{produto.fabricante || 'Fabricante não informado'}</p>
              <p className={styles.preco}>{formatarPreco(produto.preco)}</p>
            </div>
          </div>
        ))}
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

export default ListarProdutosCliente;