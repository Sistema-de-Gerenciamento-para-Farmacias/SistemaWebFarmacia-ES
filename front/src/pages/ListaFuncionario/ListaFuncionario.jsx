// ListaFuncionarios.jsx
// Lista de funcionários com busca (nome/email), editar e excluir com confirmação

import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaFuncionario.module.css"; // reaproveitando o mesmo CSS

import NavBarAdm from "../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../components/MessageBox/MessageBox";
import { AuthContext } from "../../context/AuthContext";

import usuariosDb from "../../db/DbTempUsuarios";

function ListaFuncionarios() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // apenas funcionários (EhAdmin = false)
  const [funcionarios, setFuncionarios] = useState(
    usuariosDb.filter((u) => !u.EhAdmin)
  );
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    return funcionarios.filter(
      (f) =>
        f.nome.toLowerCase().includes(termo) ||
        f.email.toLowerCase().includes(termo)
    );
  }, [funcionarios, busca]);

  const excluirFuncionario = (id) => {
    setFuncionarios((prev) => prev.filter((f) => f.id !== id));
    setConfirmId(null);
    setMessage("Funcionário excluído com sucesso!");
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <h2 className={styles.title}>Lista de Funcionários</h2>
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
          onClick={() => navigate("/cadastro-funcionario")}
          title="Criar Funcionário"
        >
          ➕ Criar Funcionário
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
          {filtrados.map((f) => (
            <tr key={f.id}>
              <td>{f.nome}</td>
              <td>{f.email}</td>
              <td className={styles.actionsCell}>
                <button
                  className={styles.editButton}
                  onClick={() => navigate(`/editar-funcionario/${f.id}`)}
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => setConfirmId(f.id)}
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
                Nenhum funcionário encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {confirmId && (
        <ConfirmModal
          message="Deseja realmente excluir este funcionário?"
          onCancel={() => setConfirmId(null)}
          onConfirm={() => excluirFuncionario(confirmId)}
        />
      )}

      {message && (
        <MessageBox message={message} onClose={() => setMessage("")} />
      )}
    </div>
  );
}

export default ListaFuncionarios;
