// front/src/pages/Login/Login.jsx
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth";
import { AuthContext } from "../../context/AuthContext";
import styles from "./Login.module.css";
import BotaoRetorno from "../../components/BotaoRetorno/BotaoRetorno";
import Loading from "../../components/Loading/Loading";
import MessageBox from "../../components/MessageBox/MessageBox";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const { login: authLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !senha) {
      setMessage("ERRO: você deve preencher todos os campos");
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const userData = await authService.login(email, senha);
      authLogin(userData);
      
      const userType = userData.user?.tipoUsuario || 'USER';
      
      setTimeout(() => {
        if (userType === 'ADMIN' || userType === 'EMPLOY') {
          navigate("/homeAdmin");
        } else {
          navigate("/homeCliente");
        }
        setLoading(false);
      }, 800);

    } catch (error) {
      setMessage(`ERRO: ${error.message}`);
      setLoading(false);
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
            required
          />
          <input 
            type="password" 
            placeholder="Senha" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className={styles.textoCadastro}>
        Não tem uma conta?{" "}
        <span 
            className={styles.linkCadastro} 
            onClick={() => navigate("/cadastro-cliente")}  // ← Mude para esta rota
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

export default Login;