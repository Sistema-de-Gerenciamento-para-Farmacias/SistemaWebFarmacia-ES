// ListaClientes.jsx
// Lista de clientes com busca (nome/CPF), editar e excluir com confirmação

import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../stylesPessoa/listar.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../components/MessageBox/MessageBox";
import { AuthContext } from "../../../context/AuthContext";

import clientesDb from "../../../db/DbTempClientes";

// Formata CPF para exibição: 12345678901 -> 123.456.789-01
function formatCpf(cpf) {
  const d = cpf.replace(/\D/g, "");
  if (d.length !== 11) return cpf;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function ListaClientes() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [clientes, setClientes] = useState(clientesDb);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    const termoCpf = busca.replace(/\D/g, "");
    return clientes.filter(
      (c) =>
        c.nome.toLowerCase().includes(termo) ||
        c.cpf.replace(/\D/g, "").includes(termoCpf)
    );
  }, [clientes, busca]);

  const excluirCliente = (id) => {
    setClientes((prev) => prev.filter((c) => c.id !== id));
    setConfirmId(null);
    setMessage("Cliente excluído com sucesso!");
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Clientes</h2>
        <button className={styles.logoutTop} onClick={logout}>
          Logout
        </button>
      </div>

      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <span className={styles.searchIcon}>🔎</span>
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div></div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th className={styles.acoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((c) => (
            <tr key={c.id}>
              <td>{c.nome}</td>
              <td>{formatCpf(c.cpf)}</td>
              <td className={styles.actionsCell}>
                <button
                  className={styles.editButton}
                  onClick={() => navigate(`/editar-cliente/${c.id}`)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => setConfirmId(c.id)}
                  title="Excluir"
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
          {filtrados.length === 0 && (
            <tr>
              <td colSpan={3} className={styles.empty}>
                Nenhum cliente encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente excluir este cliente?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirCliente(confirmId)}
        />
      )}

      {message && (
        <MessageBox message={message} onClose={() => setMessage("")} />
      )}
    </div>
  );
}

export default ListaClientes;
