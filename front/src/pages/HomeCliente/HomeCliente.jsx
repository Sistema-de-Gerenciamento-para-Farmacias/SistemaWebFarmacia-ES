// HomeCliente.jsx
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import styles from "./HomeCliente.module.css";
import NavBarCliente from "../../components/NavBarCliente/NavBarCliente";
import Loading from "../../components/Loading/Loading";
import MessageBox from "../../components/MessageBox/MessageBox";

function HomeCliente() {
  const { token, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Carrossel state
  const [start, setStart] = useState(0);
  const CARD_STEP = 235; // 220 (card) + 15 (gap)

  // Buscar produtos do backend
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

  // Carrossel automático
  useEffect(() => {
    if (produtos.length > 0) {
      const interval = setInterval(() => {
        setStart((prev) => (prev + 1) % Math.min(produtos.length, 8));
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [produtos]);

  const prev = () => setStart((start - 1 + Math.min(produtos.length, 8)) % Math.min(produtos.length, 8));
  const next = () => setStart((start + 1) % Math.min(produtos.length, 8));

  const formatarPreco = (preco) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  };

  const produtosDestaque = produtos.slice(0, 8);
  const produtosRecentes = produtos.slice(0, 6);
  const produtosPopulares = produtos.slice(0, 4);

  if (loading) {
    return (
      <div className={styles.container}>
        <NavBarCliente />
        <div className={styles.loadingContainer}>
          <Loading />
          <p>Carregando ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NavBarCliente />

      {/* Hero Section */}
      <div className={styles.heroSection}>
        <h1 className={styles.mainTitle}>💊 Farmácia Digital</h1>
        <h3 className={styles.subTitle}>Cuidando da sua saúde com praticidade e confiança</h3>
        <p className={styles.heroText}>
          Medicamentos, produtos de beleza e cuidados pessoais com entrega rápida 
          e os melhores preços do mercado
        </p>
      </div>

      {/* Ofertas do Dia */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>🔥 Ofertas do Dia</h2>
          <p className={styles.sectionSubtitle}>Promoções especiais por tempo limitado</p>
        </div>

        {produtosDestaque.length > 0 ? (
          <div className={styles.carousel}>
            <button className={styles.arrow} onClick={prev}>
              <span className={styles.seta}>&#x276E;</span>
            </button>

            <div className={styles.cardsWrapper}>
              <div
                className={styles.cards}
                style={{ transform: `translateX(-${start * CARD_STEP}px)` }}
              >
                {produtosDestaque.concat(produtosDestaque).map((produto, idx) => (
                  <div
                    key={`${produto.idProduto}-${idx}`}
                    className={styles.card}
                    onClick={() => navigate(`/detalhesProdutoCliente/${produto.idProduto}`)}
                  >
                    <div className={styles.imageContainer}>
                      <img 
                        src={produto.linkImagem || '/placeholder-image.png'} 
                        alt={produto.nome}
                        className={styles.image}
                        onError={(e) => {
                          e.target.src = '/placeholder-image.png';
                        }}
                      />
                      <div className={styles.discountBadge}>-15%</div>
                    </div>
                    <div className={styles.cardContent}>
                      <h4 className={styles.productName}>{produto.nome}</h4>
                      <p className={styles.productBrand}>{produto.fabricante}</p>
                      <div className={styles.priceContainer}>
                        <span className={styles.oldPrice}>{formatarPreco(produto.preco * 1.15)}</span>
                        <span className={styles.currentPrice}>{formatarPreco(produto.preco)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className={styles.arrow} onClick={next}>
              <span className={styles.seta}>&#x276F;</span>
            </button>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>Nenhuma oferta disponível no momento.</p>
          </div>
        )}
      </section>

      {/* Produtos Recentes */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>🆕 Produtos Recentes</h2>
          <p className={styles.sectionSubtitle}>Confira nossas novidades</p>
        </div>

        <div className={styles.gridSection}>
          {produtosRecentes.map((produto) => (
            <div
              key={produto.idProduto}
              className={styles.gridCard}
              onClick={() => navigate(`/detalhesProdutoCliente/${produto.idProduto}`)}
            >
              <img 
                src={produto.linkImagem || '/placeholder-image.png'} 
                alt={produto.nome}
                className={styles.gridImage}
              />
              <div className={styles.gridCardContent}>
                <h4>{produto.nome}</h4>
                <p className={styles.gridBrand}>{produto.fabricante}</p>
                <span className={styles.gridPrice}>{formatarPreco(produto.preco)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Destaques */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.title}>⭐ Mais Populares</h2>
          <p className={styles.sectionSubtitle}>Os queridinhos dos nossos clientes</p>
        </div>

        <div className={styles.featuredGrid}>
          {produtosPopulares.map((produto, index) => (
            <div
              key={produto.idProduto}
              className={styles.featuredCard}
              onClick={() => navigate(`/detalhesProdutoCliente/${produto.idProduto}`)}
            >
              <div className={styles.featuredBadge}>#{index + 1}</div>
              <img 
                src={produto.linkImagem || '/placeholder-image.png'} 
                alt={produto.nome}
                className={styles.featuredImage}
              />
              <div className={styles.featuredContent}>
                <h4>{produto.nome}</h4>
                <p>{produto.fabricante}</p>
                <span className={styles.featuredPrice}>{formatarPreco(produto.preco)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h3>🚀 Precisa de algo específico?</h3>
          <p>Explore nosso catálogo completo de produtos</p>
          <button 
            className={styles.ctaButton}
            onClick={() => navigate("/produtosCliente")}
          >
            🔍 Ver Todos os Produtos
          </button>
        </div>
      </section>

      {/* Benefícios */}
      <section className={styles.benefitsSection}>
        <h3>🎯 Por que escolher nossa farmácia?</h3>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefitCard}>
          <div className={styles.benefitIcon}>🚚</div>
            <h4>Entrega Rápida</h4>
            <p>Receba em até 2 horas na região metropolitana</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>💳</div>
            <h4>Pagamento Seguro</h4>
            <p>Diversas formas de pagamento com total segurança</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>🏥</div>
            <h4>Qualidade Garantida</h4>
            <p>Produtos originais com procedência verificada</p>
          </div>
          <div className={styles.benefitCard}>
            <div className={styles.benefitIcon}>📞</div>
            <h4>Atendimento 24h</h4>
            <p>Farmacêuticos disponíveis para tirar suas dúvidas</p>
          </div>
        </div>
      </section>

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

export default HomeCliente;