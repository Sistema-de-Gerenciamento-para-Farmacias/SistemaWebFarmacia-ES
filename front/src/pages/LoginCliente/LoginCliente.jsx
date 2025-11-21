// LoginCliente.jsx
// Tela de login do cliente usando dados mocados.
// DEVE ALTERAR AQUI QUANDO O BACK ESTIVER PRONTO para chamar API de login.

import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginCliente } from "../../services/auth";
import { AuthContext } from "../../context/AuthContext";
import styles from "./LoginCliente.module.css";
import BotaoRetorno from "../../components/BotaoRetorno/BotaoRetorno";
import Loading from "../../components/Loading/Loading";
import MessageBox from "../../components/MessageBox/MessageBox";

function LoginCliente() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação simples de campos
    if (!email || !senha) {
      setMessage("ERRO: você deve preencher todos os campos");
      return;
    }

    // DEVE ALTERAR AQUI QUANDO O BACK ESTIVER PRONTO (chamada HTTP real)
    const user = loginCliente(email, senha);
    if (user) {
      setUser(user);
      // Loading na transição para a Home
      setLoading(true);
      setTimeout(() => {
        navigate("/homeCliente");
        setLoading(false);
      }, 800);
    } else {
      setMessage("ERRO: E-mail ou senha incorretos");
    }
  };

  return (
    <div className={styles.container}>
      <BotaoRetorno />
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Entrar</button>
        </form>
        <p className={styles.textoCadastro}>
          Não tem uma conta?{" "}
          <span
            className={styles.linkCadastro}
            onClick={() => navigate("/cadastro-cliente")}
          >
            Cadastre-se
          </span>
        </p>
      </div>

      {loading && <Loading />}
      {message && <MessageBox message={message} onClose={() => setMessage(null)} />}
    </div>
  );
}

export default LoginCliente;
