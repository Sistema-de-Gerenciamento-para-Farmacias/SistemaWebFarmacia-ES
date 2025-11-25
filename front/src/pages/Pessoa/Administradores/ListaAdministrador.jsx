// front/src/pages/ListaAdministradores/ListaAdministradores.jsx
// Lista de administradores com busca (nome/email), editar e excluir com confirmação

import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../stylesPessoa/listar.module.css"; // reaproveitando o mesmo CSS

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../../components/MessageBox/MessageBox";
import { AuthContext } from "../../../context/AuthContext";

import usuariosDb from "../../../db/DbTempUsuarios";

function ListaAdministrador() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // apenas administradores (EhAdmin = true)
  const [administradores, setAdministradores] = useState(
    usuariosDb.filter((u) => u.EhAdmin)
  );
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return administradores.filter(
      (a) =>
        a.nome.toLowerCase().includes(termo) ||
        a.email.toLowerCase().includes(termo)
    );
  }, [administradores, busca]);

  const excluirAdministrador = (id) => {
    setAdministradores((prev) => prev.filter((a) => a.id !== id));
    setConfirmId(null);
    setMessage("Administrador excluído com sucesso!");
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Administradores</h2>
        <button className={styles.logoutTop} onClick={logout}>
          Logout
        </button>
      </div>

      <div className={styles.topBar}>
        <div className={styles.searchGroup}>
          <span className={styles.searchIcon}>🔎</span>
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <button
          className={styles.createButton}
          onClick={() => navigate("/cadastroAdministrador")}
          title="Criar Administrador"
        >
          ➕ Criar Administrador
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th className={styles.acoes}>Ações</th>
          </tr>
        </thead>
        <tbody>
          {filtrados.map((a) => (
            <tr key={a.id}>
              <td>{a.nome}</td>
              <td>{a.email}</td>
              <td className={styles.actionsCell}>
                <button
                  className={styles.editButton}
                  onClick={() => navigate(`/editarAdministrador/${a.id}`)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => setConfirmId(a.id)}
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
                Nenhum administrador encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente excluir este administrador?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirAdministrador(confirmId)}
        />
      )}

      {message && (
        <MessageBox message={message} onClose={() => setMessage("")} />
      )}
    </div>
  );
}

export default ListaAdministrador;
