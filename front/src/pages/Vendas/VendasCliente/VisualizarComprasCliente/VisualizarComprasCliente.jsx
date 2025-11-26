import { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../context/AuthContext";
import DbTempVendas from "../../../../db/DbTempVendas";
import NavBarCliente from "../../../../components/NavBarCliente/NavBarCliente";
import styles from "./VisualizarComprasCliente.module.css";

export function VisualizarComprasCliente() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [busca, setBusca] = useState("");

  // Função para converter data yyyy-mm-dd -> dd/mm/yyyy
  const formatarData = (dataStr) => {
    const [ano, mes, dia] = dataStr.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const minhasCompras = useMemo(() => {
    if (!user) return [];
    return DbTempVendas.filter((venda) => venda.idCliente === user.id).filter(
      (venda) => {
        const dataFormatada = formatarData(venda.dataCompra);
        return (
          dataFormatada.includes(busca) ||
          venda.id.toString().includes(busca)
        );
      }
    );
  }, [busca, user]);

  return (
    <div className={styles.container}>
      <NavBarCliente logout={() => console.log("logout")} />

      <h1 className={styles.titulo}>🧾 Minhas Compras</h1>

      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="🔎 Buscar por data (dd/mm/aaaa) ou ID..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {minhasCompras.length === 0 ? (
        <div className={styles.vazio}>
          <p>Nenhuma compra realizada</p>
          <button onClick={() => navigate("/produtosCliente")}>
            Comprar Agora
          </button>
        </div>
      ) : (
        <table className={styles.tabela}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Qtd. Itens</th>
              <th>Ação</th>
            </tr>
          </thead>
          <tbody>
            {minhasCompras.map((venda) => (
              <tr key={venda.id}>
                <td>#{venda.id}</td>
                <td>{formatarData(venda.dataCompra)}</td>
                <td>{venda.itens.length} item(ns)</td>
                <td>
                  <button
                    className={styles.btnDetalhes}
                    onClick={() => navigate(`/detalhesCompra/${venda.id}`)}
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default VisualizarComprasCliente;
