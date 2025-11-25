// front/src/pages/EditarAdministrador/EditarAdministrador.jsx
// Tela de edição de administrador — estilo idêntico ao EditarFuncionario

import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../stylesPessoa/editar.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../context/AuthContext";
import MessageBox from "../../../components/MessageBox/MessageBox";

import usuariosDb from "../../../db/DbTempUsuarios";

function EditarAdministrador() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const adm = usuariosDb.find((u) => String(u.id) === String(id) && u.EhAdmin);
    if (adm) {
      setNome(adm.nome);
      setEmail(adm.email);
      setSenha(adm.senha);
    }
  }, [id]);

  const salvar = () => {
    if (!nome || !email || !senha) {
      setMessage("Preencha todos os campos antes de salvar!");
      return;
    }

    const atualizado = {
      id,
      nome,
      email,
      senha,
      EhAdmin: true,
    };

    console.log("Administrador atualizado:", atualizado);

    setMessage("Administrador atualizado com sucesso!");
    setTimeout(() => {
      navigate("/listaAdministradores");
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <div className={styles.left}>
          <h2 className={styles.title}>Editar Administrador</h2>
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

          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Digite o email"
          />

          <label className={styles.label}>Senha</label>
          <input
            className={styles.input}
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Digite a senha"
          />

          <div className={styles.actions}>
            <button
              type="button"
              className={styles.cancel}
              onClick={() => navigate("/listaAdministradores")}
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

export default EditarAdministrador;
