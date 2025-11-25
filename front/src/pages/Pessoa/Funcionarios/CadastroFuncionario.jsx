// front/src/pages/CadastroFuncionario/CadastroFuncionario.jsx
// Tela de cadastro de funcionário — estilo idêntico ao EditarCliente

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../stylesPessoa/cadastrar.module.css";

import NavBarAdm from "../../../components/NavBarAdm/NavBarAdm";
import { AuthContext } from "../../../context/AuthContext";
import MessageBox from "../../../components/MessageBox/MessageBox";

function CadastroFuncionario() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [message, setMessage] = useState("");

  const salvar = () => {
    if (!nome || !email || !senha) {
      setMessage("Preencha todos os campos antes de cadastrar!");
      return;
    }

    const novoFuncionario = {
      id: Date.now(),
      nome,
      EhAdmin: false,
      email,
      senha,
      token: `token-func-${Date.now()}`,
    };

    console.log("Funcionário cadastrado:", novoFuncionario);

    setMessage("Funcionário cadastrado com sucesso!");
    setTimeout(() => {
      navigate("/listaFuncionarios");
    }, 1500);
  };

  return (
    <div className={styles.container}>
      <NavBarAdm />

      <div className={styles.header}>
        <div className={styles.left}>
          <h2 className={styles.title}>Cadastro de Funcionário</h2>
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
              Cadastrar
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

export default CadastroFuncionario;
