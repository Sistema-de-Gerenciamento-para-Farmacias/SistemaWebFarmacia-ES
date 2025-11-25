// EditarCliente.jsx
// Edição de cliente com dados pré-preenchidos usando DbTempClientes

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./EditarCliente.module.css";

import NavBarAdm from "../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../context/AuthContext";
import MessageBox from "../../components/MessageBox/MessageBox";

import clientesDb from "../../db/DbTempClientes";

function EditarCliente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const cliente = clientesDb.find((c) => String(c.id) === String(id));
    if (cliente) {
      setNome(cliente.nome);
      setCpf(cliente.cpf);
      setTelefone(cliente.telefone);
      setEmail(cliente.email);
    }
  }, [id]);

  const salvar = () => {
    setMessage("Cliente atualizado com sucesso!");
    setTimeout(() => {
      navigate("/listaClientes");
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <div className={styles.left}>
          <h2 className={styles.title}>Editar Cliente</h2>
        </div>
        <button className={styles.logoutTop} onClick={logout}>
          Logout
        </button>
      </div>

      <div className={styles.formWrapper}>
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <label className={styles.label}>Nome</label>
          <input
            className={styles.input}
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Digite o nome"
          />

          <label className={styles.label}>CPF</label>
          <input
            className={styles.input}
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            placeholder="Digite o CPF"
          />

          <label className={styles.label}>Telefone</label>
          <input
            className={styles.input}
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            placeholder="Digite o telefone"
          />

          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o email"
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => navigate("/listaClientes")}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              onClick={salvar}
            >
              Salvar
            </button>
          </div>
        </form>
      </div>

      {message && (
        <MessageBox message={message} onClose={() => setMessage("")} />
      )}
    </div>
  );
}

export default EditarCliente;
