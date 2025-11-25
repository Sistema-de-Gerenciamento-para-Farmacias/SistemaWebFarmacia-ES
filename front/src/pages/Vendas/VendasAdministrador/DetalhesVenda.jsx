import { useParams, useNavigate } from "react-router-dom";
import styles from "./styles/detalhes.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import vendasDb from "../../../db/DbTempVendas";
import clientesDb from "../../../db/DbTempClientes";
import produtosDb from "../../../db/DbTempProdutos";

function DetalhesVenda() {
  const { id } = useParams();
  const navigate = useNavigate();
  const venda = vendasDb.find((v) => String(v.id) === String(id));

  if (!venda) return <div className={styles.container}>Venda não encontrada.</div>;

  const cliente = clientesDb.find((c) => c.id === venda.idCliente);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const itemsWithData = venda.itens.map((it) => {
    const prod = produtosDb.find((p) => p.id === it.idProduto);
    const nome = prod ? prod.nome : `Produto ${it.idProduto}`;
    const preco = prod ? prod.preco : 0;
    const quantidade = it.quantidade || 0;
    const subtotal = preco * quantidade;
    return { nome, preco, quantidade, subtotal };
  });

  const total = itemsWithData.reduce((s, it) => s + it.subtotal, 0);

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Detalhes da Venda</h2>
      </div>

      <div className={styles.card}>
        <div className={styles.info}>
          <div className={styles.box}><strong>ID:</strong> {venda.id}</div>
          <div className={styles.box}><strong>Cliente:</strong> {cliente ? cliente.nome : "-"}</div>
          <div className={styles.box}><strong>Data da Compra:</strong> {formatDate(venda.dataCompra)}</div>

          <div className={styles.box}>
            <strong>Itens:</strong>
            <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 8}}>
              <thead>
                <tr>
                  <th style={{textAlign:'left', borderBottom:'1px solid #ddd', padding:8}}>Nome</th>
                  <th style={{textAlign:'right', borderBottom:'1px solid #ddd', padding:8}}>Preço unit.</th>
                  <th style={{textAlign:'right', borderBottom:'1px solid #ddd', padding:8}}>Quantidade</th>
                  <th style={{textAlign:'right', borderBottom:'1px solid #ddd', padding:8}}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {itemsWithData.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{padding:8, borderBottom:'1px solid #f0f0f0'}}>{it.nome}</td>
                    <td style={{padding:8, borderBottom:'1px solid #f0f0f0', textAlign:'right'}}>R$ {it.preco.toFixed(2)}</td>
                    <td style={{padding:8, borderBottom:'1px solid #f0f0f0', textAlign:'right'}}>{it.quantidade}</td>
                    <td style={{padding:8, borderBottom:'1px solid #f0f0f0', textAlign:'right'}}>R$ {it.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={3} style={{padding:8, textAlign:'right', fontWeight:'bold'}}>Total:</td>
                  <td style={{padding:8, textAlign:'right', fontWeight:'bold'}}>R$ {total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.backButton} onClick={() => navigate("/listarVendas")}>⬅ Voltar</button>
        <button className={styles.editButton} onClick={() => navigate(`/editarVenda/${venda.id}`)}>✏️ Editar</button>
      </div>
    </div>
  );
}

export default DetalhesVenda;
