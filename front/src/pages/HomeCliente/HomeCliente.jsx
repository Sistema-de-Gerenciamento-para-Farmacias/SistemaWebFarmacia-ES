// HomeCliente.jsx
// Carrossel cíclico com transição suave lateral (slide) e cards maiores que as imagens

import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import styles from "./HomeCliente.module.css";
import NavBarCliente from "../../components/NavBarCliente/NavBarCliente";
import produtos from "../../db/DbTempProdutos";

function HomeCliente() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const lista = produtos.slice(0, 8);
  const total = lista.length;
  const [start, setStart] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStart((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(interval);
  }, [total]);

  const prev = () => setStart((start - 1 + total) % total);
  const next = () => setStart((start + 1) % total);

  // Largura do passo = largura do card + gap (definidos no CSS)
  const CARD_STEP = 235; // 220 (card) + 15 (gap)

  return (
    <div className={styles.container}>
      <NavBarCliente logout={logout} />
      <h1 className={styles.mainTitle}>Farmácia Digital</h1>
      <h3 className={styles.subTitle}>As melhores ofertas para você</h3>

      <h2 className={styles.title}>Ofertas do dia</h2>

      <div className={styles.carousel}>
        <button className={styles.arrow} onClick={prev}>
          <span className={styles.seta}>&#x276E;</span>
        </button>

        <div className={styles.cardsWrapper}>
          <div
            className={styles.cards}
            style={{ transform: `translateX(-${start * CARD_STEP}px)` }}
          >
            {lista.concat(lista).map((p, idx) => (
              <div
                key={idx}
                className={styles.card}
                onClick={() => navigate(`/detalhesProdutoCliente/${p.id}`)}
              >
                <img src={p.linkImagem} alt={p.nome} className={styles.image} />
                <p>{p.nome}</p>
                <p>R$ {p.preco.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        <button className={styles.arrow} onClick={next}>
          <span className={styles.seta}>&#x276F;</span>
        </button>
      </div>

      <div className={styles.bottomLink}>
        <button className={styles.btnProdutos} onClick={() => navigate("/produtosCliente")}>
          🔎 Ver todos os produtos
        </button>
      </div>

      <p className={styles.aboutText}>
        A Farmácia Digital é referência em qualidade e praticidade. Aqui você
        encontra ofertas exclusivas, atendimento rápido e confiança para cuidar
        da sua saúde todos os dias.
      </p>
    </div>
  );
}

export default HomeCliente;
