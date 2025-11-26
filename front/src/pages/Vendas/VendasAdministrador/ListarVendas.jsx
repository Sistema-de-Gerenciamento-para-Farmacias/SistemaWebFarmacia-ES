import { useState, useMemo, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles/listar.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../components/MessageBox/MessageBox";
import { AuthContext } from "../../../context/AuthContext";

import vendasDb from "../../../db/DbTempVendas";
import clientesDb from "../../../db/DbTempClientes";

function ListarVendas() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [vendas, setVendas] = useState(vendasDb);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");

  // Converte ISO (yyyy-mm-dd) para dd/mm/yyyy
  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return vendas.filter((v) => {
      const cliente = clientesDb.find((c) => c.id === v.idCliente);
      const nome = cliente ? cliente.nome.toLowerCase() : "";
      const dataFormatada = formatDate(v.dataCompra).toLowerCase();
      return nome.includes(termo) || dataFormatada.includes(termo);
    });
  }, [vendas, busca]);

  const excluirVenda = (id) => {
    setVendas((prev) => prev.filter((v) => v.id !== id));
    setConfirmId(null);
    setMessage("Venda excluída com sucesso!");
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Vendas</h2>
        <button className={styles.logoutTop} onClick={logout}>
          Logout
        </button>
      </div>

      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <span className={styles.searchIcon}>🔎</span>
          <input
            type="text"
            placeholder="Buscar por cliente ou data (dd/mm/aaaa)..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Data</th>
            <th className={styles.acoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((v) => {
            const cliente = clientesDb.find((c) => c.id === v.idCliente);
            return (
              <tr key={v.id}>
                <td>{v.id}</td>
                <td>{cliente ? cliente.nome : "-"}</td>
                <td>{formatDate(v.dataCompra)}</td>
                <td className={styles.actionsCell}>
                  <button
                    className={styles.editButton}
                    onClick={() => navigate(`/editarVenda/${v.id}`)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => setConfirmId(v.id)}
                    title="Excluir"
                  >
                    🗑️
                  </button>
                  <button
                    className={styles.detailsButton}
                    onClick={() => navigate(`/detalhesVenda/${v.id}`)}
                    title="Ver Detalhes"
                  >
                    🔍
                  </button>
                </td>
              </tr>
            );
          })}

          {filtrados.length === 0 && (
            <tr>
              <td colSpan={4} className={styles.empty}>
                Nenhuma venda encontrada.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente excluir esta venda?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirVenda(confirmId)}
        />
      )}

      {message && <MessageBox message={message} onClose={() => setMessage("")} />}
    </div>
  );
}

export default ListarVendas;
