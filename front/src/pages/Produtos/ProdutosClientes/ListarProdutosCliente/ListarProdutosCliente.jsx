import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import produtosDb from "../../../../db/DbTempProdutos";
import NavBarCliente from "../../../../components/NavBarCliente/NavBarCliente";

import styles from "./ListarProdutosCliente.module.css";

export function ListarProdutosCliente() {
  const [busca, setBusca] = useState("");
  const navigate = useNavigate();

  const produtosFiltrados = useMemo(() => {
    return produtosDb.filter(
      (p) =>
        p.existe &&
        (p.nome.toLowerCase().includes(busca.toLowerCase()) ||
          p.fabricante.toLowerCase().includes(busca.toLowerCase()))
    );
  }, [busca]);

  return (
    <div className={styles.container}>
      <NavBarCliente logout={() => console.log("logout")} />

      <h1 className={styles.title}>Produtos</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔎 Buscar produtos por nome ou fabricante..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      <div className={styles.grid}>
        {produtosFiltrados.map((produto) => (
          <div
            key={produto.id}
            className={styles.card}
            onClick={() => navigate(`/detalhesProdutoCliente/${produto.id}`)}
          >
            <div className={styles.imageWrapper}>
              <img src={produto.linkImagem} alt={produto.nome} />
            </div>
            <div className={styles.info}>
              <h3>{produto.nome}</h3>
              <p className={styles.fabricante}>{produto.fabricante}</p>
              <p className={styles.preco}>R$ {produto.preco.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ListarProdutosCliente;
