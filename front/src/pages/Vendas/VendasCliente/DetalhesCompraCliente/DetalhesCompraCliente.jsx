import { useMemo } from "react";
import { useParams } from "react-router-dom";
import DbTempVendas from "../../../../db/DbTempVendas";
import DbTempProdutos from "../../../../db/DbTempProdutos";
import BotaoRetorno from "../../../../components/BotaoRetorno/BotaoRetorno";
import styles from "./DetalhesCompraCliente.module.css";

export function DetalhesCompraCliente() {
  const { id } = useParams();
  const compra = DbTempVendas.find((v) => v.id === parseInt(id));

  const formatarData = (dataStr) => {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const compraComDetalhes = useMemo(() => {
    if (!compra) return null;
    return {
      ...compra,
      itens: compra.itens.map((item) => {
        const produto = DbTempProdutos.find((p) => p.id === item.idProduto);
        return {
          ...item,
          nomeProduto: produto?.nome,
          precoUnitario: produto?.preco,
        };
      }),
    };
  }, [compra]);

  if (!compraComDetalhes) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Compra não encontrada</div>;
  }

  const total = compraComDetalhes.itens.reduce(
    (acc, item) => acc + item.quantidade * (item.precoUnitario || 0),
    0
  );

  return (
    <div className={styles.container}>
      <BotaoRetorno />

      <h1 className={styles.titulo}>🧾 Detalhes da Compra #{compraComDetalhes.id}</h1>

      <div className={styles.info}>
        <div className={styles.infoItem}>
          <strong>ID da Compra:</strong> {compraComDetalhes.id}
        </div>
        <div className={styles.infoItem}>
          <strong>Data:</strong> {formatarData(compraComDetalhes.dataCompra)}
        </div>
        <div className={styles.infoItem}>
          <strong>Número de Itens:</strong> {compraComDetalhes.itens.length}
        </div>
      </div>

      <h3 className={styles.subtitulo}>Itens</h3>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Produto</th>
            <th>Preço Unit.</th>
            <th>Qtd</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {compraComDetalhes.itens.map((item, idx) => (
            <tr key={idx}>
              <td>{item.nomeProduto}</td>
              <td>R$ {item.precoUnitario?.toFixed(2)}</td>
              <td>{item.quantidade}</td>
              <td>R$ {(item.quantidade * (item.precoUnitario || 0)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.total}>
        <strong>Total: R$ {total.toFixed(2)}</strong>
      </div>
    </div>
  );
}

export default DetalhesCompraCliente;
