// front/src/pages/EditarFuncionario/EditarFuncionario.jsx
// Tela de edição de funcionário — estilo idêntico ao EditarCliente

import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./EditarFuncionario.module.css";

import NavBarAdm from "../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../context/AuthContext";
import MessageBox from "../../components/MessageBox/MessageBox";

import usuariosDb from "../../db/DbTempUsuarios";

function EditarFuncionario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const funcionario = usuariosDb.find(
      (u) => String(u.id) === String(id) && !u.EhAdmin
    );
    if (funcionario) {
      setNome(funcionario.nome);
      setEmail(funcionario.email);
      setSenha(funcionario.senha);
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
      EhAdmin: false,
    };

    console.log("Funcionário atualizado:", atualizado);

    setMessage("Funcionário atualizado com sucesso!");
    setTimeout(() => {
      navigate("/listaFuncionarios");
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <div className={styles.left}>
          <h2 className={styles.title}>Editar Funcionário</h2>
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
              onClick={() => navigate("/listaFuncionarios")}
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

export default EditarFuncionario;
