// ListaClientes.jsx
// Lista de clientes com busca (nome/CPF), editar e excluir com confirmação

import { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ListaClientes.module.css";

import NavBarAdm from "../../components/NavBarAdm/NavBarAdm";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import MessageBox from "../../components/MessageBox/MessageBox";
import { AuthContext } from "../../context/AuthContext";

import clientesDb from "../../db/DbTempClientes";

// Formata CPF para exibição: 12345678901 -> 123.456.789-01
function formatCpf(cpf) {
  const s = String(cpf ?? "").replace(/\D/g, "");
  if (s.length !== 11) return cpf ?? "";
  return `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
}

// Função para normalizar texto (remove acentos e espaços extras)
// Agora defensiva: aceita undefined e converte para string
function normalizeText(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD") // separa acentos
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .trim();
}

function ListaClientes() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [clientes, setClientes] = useState(clientesDb);
  const [busca, setBusca] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [message, setMessage] = useState("");

  const filtrados = useMemo(() => {
    const termo = normalizeText(busca);
    const termoCpf = String(busca || "").replace(/\D/g, "");

    // Se não digitou nada, retorna todos
    if (!termo && !termoCpf) return clientes;

    return clientes.filter((c) => {
      const nomeNormalizado = normalizeText(c?.nome ?? "");
      const cpfNormalizado = String(c?.cpf ?? "").replace(/\D/g, "");

      const matchNome = termo ? nomeNormalizado.includes(termo) : false;
      const matchCpf = termoCpf ? cpfNormalizado.includes(termoCpf) : false;

      return matchNome || matchCpf;
    });
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
