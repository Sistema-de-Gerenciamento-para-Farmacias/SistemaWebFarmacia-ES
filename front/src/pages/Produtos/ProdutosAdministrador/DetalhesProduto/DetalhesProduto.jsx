// front/src/pages/Produtos/ProdutosAdministrador/DetalhesProduto/DetalhesProduto.jsx
// Tela de detalhes de produto

import { useParams, useNavigate } from "react-router-dom";
import styles from "./DetalhesProduto.module.css";

import NavBarAdm from "../../../../components/NavBarAdm/NavBarAdm";
import produtosDb from "../../../../db/DbTempProdutos";

function DetalhesProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const produto = produtosDb.find((p) => String(p.id) === String(id));

  if (!produto) return <div className={styles.container}>Produto não encontrado.</div>;

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
          <img src={produto.linkImagem} alt={produto.nome} className={styles.image} />
        </div>
        <div className={styles.info}>
          <div className={styles.box}><strong>Nome:</strong> {produto.nome}</div>
          <div className={styles.box}><strong>Fabricante:</strong> {produto.fabricante}</div>
          <div className={styles.box}><strong>Preço:</strong> R$ {produto.preco.toFixed(2)}</div>
          <div className={styles.box}><strong>Quantidade em estoque:</strong> {produto.qtd}</div>
          <div className={styles.box}><strong>Data de validade:</strong> {produto.dataValidade}</div>
          <div className={styles.box}><strong>Disponível:</strong> {produto.existe ? "Sim" : "Não"}</div>
          {produto.descricao && (
            <div className={styles.box}><strong>Descrição:</strong> {produto.descricao}</div>
          )}
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listarProdutos")}>
          ⬅ Voltar
        </button>
        <button className={styles.editButton} onClick={() => navigate(`/editarProduto/${produto.id}`)}>
          ✏️ Editar
        </button>
      </div>
    </div>
  );
}

export default DetalhesProduto;
